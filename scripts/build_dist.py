#!/usr/bin/env python3
"""Zero-dependency Python 3 bundler for Boston ↔ Bay Area Creative Cheer-Up Studio.

Compiles `index.html`, `src/styles/main.css`, and all ES2022 modules under `src/`
into:
  1. `dist/index.html` — Self-contained single-file application (`< 350 KB`) that
     runs directly via `file:///...` (double-click / AirDrop / email) as well as
     any HTTP server with zero external runtime dependencies.
  2. `dist/src/...` — Clean static multi-file copy of all source assets.
"""

from __future__ import annotations

import os
import posixpath
import re
import shutil
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
DIST_DIR = PROJECT_ROOT / 'dist'
MAX_BUNDLE_BYTES = 350 * 1024  # 350 KB hard ceiling

JS_TOKEN_RE = re.compile(
    r"""
    ("(?:\\.|[^"\\])*")       # Double-quoted string literal
    | ('(?:\\.|[^'\\])*')     # Single-quoted string literal
    | (`(?:\\.|[^`\\])*`)     # Template literal
    | (/\*[\s\S]*?\*/)        # Block comment
    | (//[^\n]*)              # Line comment
    """,
    re.VERBOSE,
)


def minify_js_safe(code: str) -> str:
  """Safely strips JS comments and collapses blank lines without altering string literals."""

  def _repl(match: re.Match) -> str:
    if match.group(1) or match.group(2) or match.group(3):
      return match.group(0)
    return ''

  stripped = JS_TOKEN_RE.sub(_repl, code)
  compact: list[str] = []
  in_template = False
  for raw_line in stripped.splitlines():
    line = raw_line.rstrip() if in_template else raw_line.strip()
    # Count unescaped backticks on this line to track multi-line template state
    idx = 0
    while idx < len(raw_line):
      if raw_line[idx] == '\\':
        idx += 2
        continue
      if raw_line[idx] == '`':
        in_template = not in_template
      idx += 1
    if not line and not in_template:
      continue
    compact.append(line)
  return '\n'.join(compact)


def normalize_rel_path(from_file: str, specifier: str) -> str:
  """Resolves a relative import specifier (e.g. './store.js') against `from_file`."""
  base_dir = posixpath.dirname(from_file)
  resolved = posixpath.normpath(posixpath.join(base_dir, specifier))
  if not resolved.endswith('.js'):
    resolved += '.js'
  return resolved


def parse_named_bindings(spec_str: str) -> list[tuple[str, str]]:
  """Parses `{ a, b as c }` into list of `(imported_name, local_name)`."""
  inner = spec_str.strip().strip('{}').strip()
  if not inner:
    return []
  pairs = []
  for token in inner.split(','):
    token = token.strip()
    if not token:
      continue
    if ' as ' in token:
      src, alias = [p.strip() for p in token.split(' as ', 1)]
      pairs.append((src, alias))
    else:
      pairs.append((token, token))
  return pairs


def transform_es_module(rel_path: str, source: str) -> tuple[str, list[str]]:
  """Transforms an ES module into a CommonJS-like factory body and returns dependencies."""
  deps: list[str] = []

  import_pattern = re.compile(
      r'^\s*import\s+([\s\S]*?)\s+from\s+[\'"]([^\'"]+)[\'"]\s*;?',
      re.MULTILINE,
  )

  idx_counter = [0]

  def _replace_import_clean(match: re.Match) -> str:
    idx_counter[0] += 1
    var_id = f'__mod_{idx_counter[0]}'
    clause = match.group(1).strip()
    specifier = match.group(2).strip()
    target_path = normalize_rel_path(rel_path, specifier)
    if target_path not in deps:
      deps.append(target_path)

    stmts = [f'const {var_id} = __require("{target_path}");']
    if clause.startswith('* as '):
      ns_name = clause[5:].strip()
      stmts.append(f'const {ns_name} = {var_id};')
    elif clause.startswith('{'):
      for imported, local in parse_named_bindings(clause):
        stmts.append(f'const {local} = {var_id}.{imported};')
    elif ',' in clause:
      default_part, named_part = clause.split(',', 1)
      default_name = default_part.strip()
      stmts.append(
          f'const {default_name} = {var_id}.default !== undefined ? {var_id}.default : {var_id};'
      )
      if '{' in named_part:
        for imported, local in parse_named_bindings(named_part):
          stmts.append(f'const {local} = {var_id}.{imported};')
    else:
      default_name = clause.strip()
      stmts.append(
          f'const {default_name} = {var_id}.default !== undefined ? {var_id}.default : {var_id};'
      )
    return '\n'.join(stmts)

  transformed = import_pattern.sub(_replace_import_clean, source)

  side_effect_import = re.compile(
      r'^\s*import\s+[\'"]([^\'"]+)[\'"]\s*;?', re.MULTILINE
  )

  def _replace_side_effect(match: re.Match) -> str:
    specifier = match.group(1).strip()
    target_path = normalize_rel_path(rel_path, specifier)
    if target_path not in deps:
      deps.append(target_path)
    return f'__require("{target_path}");'

  transformed = side_effect_import.sub(_replace_side_effect, transformed)

  exported_names: list[tuple[str, str]] = []

  def _replace_export_var(match: re.Match) -> str:
    decl_kind = match.group(1)
    var_name = match.group(2)
    exported_names.append((var_name, var_name))
    return f'{decl_kind} {var_name}'

  transformed = re.sub(
      r'^\s*export\s+(const|let|var)\s+([A-Za-z0-9_$]+)',
      _replace_export_var,
      transformed,
      flags=re.MULTILINE,
  )

  def _replace_export_fn(match: re.Match) -> str:
    async_kw = match.group(1) or ''
    fn_name = match.group(2)
    exported_names.append((fn_name, fn_name))
    return f'{async_kw}function {fn_name}'

  transformed = re.sub(
      r'^\s*export\s+(async\s+)?function\s+([A-Za-z0-9_$]+)',
      _replace_export_fn,
      transformed,
      flags=re.MULTILINE,
  )

  def _replace_export_class(match: re.Match) -> str:
    cls_name = match.group(1)
    exported_names.append((cls_name, cls_name))
    return f'class {cls_name}'

  transformed = re.sub(
      r'^\s*export\s+class\s+([A-Za-z0-9_$]+)',
      _replace_export_class,
      transformed,
      flags=re.MULTILINE,
  )

  def _replace_export_list(match: re.Match) -> str:
    spec_list = match.group(1)
    for local, exported in parse_named_bindings(spec_list):
      exported_names.append((local, exported))
    return ''

  transformed = re.sub(
      r'^\s*export\s*\{([\s\S]*?)\}\s*;?',
      _replace_export_list,
      transformed,
      flags=re.MULTILINE,
  )

  transformed = re.sub(
      r'^\s*export\s+default\s+',
      '__exports.default = ',
      transformed,
      flags=re.MULTILINE,
  )

  footer_lines = ['']
  for local_name, export_name in exported_names:
    footer_lines.append(f'__exports.{export_name} = {local_name};')

  full_body = minify_js_safe(transformed + '\n'.join(footer_lines))
  return full_body, deps


def discover_all_js_modules(src_root: Path) -> dict[str, Path]:
  """Finds all `.js` files under `src/` mapped by normalized posix path `src/...`."""
  modules: dict[str, Path] = {}
  for path in sorted(src_root.rglob('*.js')):
    rel = path.relative_to(PROJECT_ROOT).as_posix()
    modules[rel] = path
  return modules


def build_bundle() -> Path:
  """Builds `dist/index.html` and static `dist/src/` assets."""
  DIST_DIR.mkdir(parents=True, exist_ok=True)

  dist_src = DIST_DIR / 'src'
  if dist_src.exists():
    shutil.rmtree(dist_src)
  shutil.copytree(PROJECT_ROOT / 'src', dist_src)

  index_html = (PROJECT_ROOT / 'index.html').read_text(encoding='utf-8')
  css_content = (PROJECT_ROOT / 'src' / 'styles' / 'main.css').read_text(
      encoding='utf-8'
  )
  css_minified = re.sub(r'/\*[\s\S]*?\*/', '', css_content).strip()

  modules = discover_all_js_modules(PROJECT_ROOT / 'src')
  module_factories: list[str] = []

  for rel_path, file_path in modules.items():
    raw_js = file_path.read_text(encoding='utf-8')
    body, _ = transform_es_module(rel_path, raw_js)
    factory_block = (
        f'__register("{rel_path}",function(__exports,__require){{\n'
        f'{body}\n'
        f'}});\n'
    )
    module_factories.append(factory_block)

  runtime_js = (
      '(function(){\n'
      'const __factories=Object.create(null);\n'
      'const __cache=Object.create(null);\n'
      'window.__CHEER_UP_MODULES__=__cache;\n'
      'function __register(id,factory){__factories[id]=factory;}\n'
      'function __require(id){\n'
      'if(__cache[id])return __cache[id];\n'
      'const exports={};\n'
      '__cache[id]=exports;\n'
      'if(__factories[id]){__factories[id](exports,__require);}\n'
      'return exports;\n'
      '}\n'
      + ''.join(module_factories)
      + 'Object.keys(__factories).forEach(function(id){\n'
      'if(id!=="src/core/app-shell.js"){\n'
      'try{__require(id);}catch(e){console.warn("[Bundle] module init warning:",id,e);}\n'
      '}\n'
      '});\n'
      '__require("src/core/app-shell.js");\n'
      '})();\n'
  )

  bundled_html = index_html.replace(
      '<link rel="stylesheet" href="src/styles/main.css" />',
      f'<style>\n{css_minified}\n</style>',
  )
  bundled_html = bundled_html.replace(
      '<script type="module" src="src/core/app-shell.js"></script>',
      f'<script>\n{runtime_js}\n</script>',
  )

  out_file = DIST_DIR / 'index.html'
  out_file.write_text(bundled_html, encoding='utf-8')

  size_bytes = out_file.stat().st_size
  size_kb = size_bytes / 1024.0
  print(
      f'[build_dist] Built standalone bundle: {out_file} '
      f'({size_kb:.1f} KB / {MAX_BUNDLE_BYTES // 1024} KB budget, {len(modules)} modules)'
  )
  if size_bytes > MAX_BUNDLE_BYTES:
    print(
        f'[build_dist] ERROR: Bundle size {size_bytes} exceeds 350 KB limit!',
        file=sys.stderr,
    )
    sys.exit(1)

  return out_file


if __name__ == '__main__':
  build_bundle()
