#!/usr/bin/env python3
"""Chrome DevTools Protocol (CDP) Driver & Test Harness for Cheer-Up Studio.

Provides zero-install headless Chromium control over Python 3 + websockets:
- Ephemeral local HTTP server (`LocalHttpServer`)
- Headless Google Chrome lifecycle with `--user-data-dir=/dev/shm/e2e_chrome_<pid>_*`
- Real-time capture of `Runtime.consoleAPICalled` and `Runtime.exceptionThrown`
- Dual selector resolution supporting both PROJECT.md § 5.2 and analysis.md § 4 contracts
- Binary PNG / IHDR header verification & RGBA pixel buffer reflection assertions
- Declarative test registration (`@register_test`) and structured result reporting
"""

from __future__ import annotations

import asyncio
import base64
from dataclasses import dataclass, field
import functools
import http.server
import json
import os
from pathlib import Path
import shutil
import socket
import struct
import subprocess
import threading
import time
import urllib.request
import uuid
from typing import Any, Callable, Coroutine, Sequence
import websockets


def find_free_port() -> int:
  """Return an available localhost TCP port."""
  with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
    sock.bind(("127.0.0.1", 0))
    sock.listen(1)
    return int(sock.getsockname()[1])


class _SilentDirectoryHandler(http.server.SimpleHTTPRequestHandler):
  """HTTP request handler serving a specified root directory silently."""

  def __init__(self, *args: Any, directory: str | None = None, **kwargs: Any):
    super().__init__(*args, directory=directory, **kwargs)

  def log_message(self, format: str, *args: Any) -> None:  # pylint: disable=redefined-builtin
    pass


_PORT_TO_ROOT_DIR: dict[int, str] = {}


class LocalHttpServer:
  """Background HTTP server serving static application files on 127.0.0.1."""

  def __init__(self, root_dir: str | Path, port: int | None = None):
    self.root_dir = str(Path(root_dir).resolve())
    self.port = port or find_free_port()
    self._server: http.server.ThreadingHTTPServer | None = None
    self._thread: threading.Thread | None = None

  @property
  def base_url(self) -> str:
    return f"http://127.0.0.1:{self.port}"

  def start(self) -> str:
    _PORT_TO_ROOT_DIR[self.port] = self.root_dir
    handler = functools.partial(_SilentDirectoryHandler, directory=self.root_dir)
    self._server = http.server.ThreadingHTTPServer(("127.0.0.1", self.port), handler)
    self._thread = threading.Thread(target=self._server.serve_forever, daemon=True)
    self._thread.start()
    return self.base_url

  def stop(self) -> None:
    _PORT_TO_ROOT_DIR.pop(self.port, None)
    if self._server is not None:
      self._server.shutdown()
      self._server.server_close()
      self._server = None
    if self._thread is not None:
      self._thread.join(timeout=2.0)
      self._thread = None

  def __enter__(self) -> "LocalHttpServer":
    self.start()
    return self

  def __exit__(self, exc_type: Any, exc: Any, tb: Any) -> None:
    self.stop()


# Canonical alias map bridging PROJECT.md § 5.2 and explorer_survey_3/analysis.md § 4 selectors
SELECTOR_ALIASES: dict[str, tuple[str, ...]] = {
    "nav-tab-tattoo": ('[data-testid="nav-tab-tattoo"]',),
    "nav-tab-catnap": ('[data-testid="nav-tab-catnap"]',),
    "nav-tab-kpop": ('[data-testid="nav-tab-kpop"]',),
    "nav-tab-hub": ('[data-testid="nav-tab-hub"]',),
    "header-nickname-display": (
        '[data-testid="header-nickname-display"]',
        '[data-testid="profile-display-name"]',
    ),
    "tattoo-canvas": ('[data-testid="tattoo-canvas"]',),
    "stamp-category-catnap": ('[data-testid="stamp-category-catnap"]',),
    "stamp-category-kpop": ('[data-testid="stamp-category-kpop"]',),
    "stamp-category-bay_boston": ('[data-testid="stamp-category-bay_boston"]',),
    "brush-mode-neon": (
        '[data-testid="brush-mode-neon"]',
        '[data-testid="brush-type-neon"]',
    ),
    "brush-mode-glitter": (
        '[data-testid="brush-mode-glitter"]',
        '[data-testid="brush-type-glitter"]',
    ),
    "brush-mode-rainbow": (
        '[data-testid="brush-mode-rainbow"]',
        '[data-testid="brush-type-rainbow"]',
    ),
    "brush-mode-metallic": (
        '[data-testid="brush-mode-metallic"]',
        '[data-testid="brush-type-metallic"]',
    ),
    "tattoo-text-input": ('[data-testid="tattoo-text-input"]',),
    "tattoo-add-text-btn": ('[data-testid="tattoo-add-text-btn"]',),
    "tattoo-undo-btn": ('[data-testid="tattoo-undo-btn"]',),
    "tattoo-redo-btn": ('[data-testid="tattoo-redo-btn"]',),
    "tattoo-duplicate-btn": ('[data-testid="tattoo-duplicate-btn"]',),
    "tattoo-clear-btn": ('[data-testid="tattoo-clear-btn"]',),
    "tryon-canvas": (
        '[data-testid="tryon-canvas"]',
        '[data-testid="virtual-tryon-canvas"]',
    ),
    "tryon-bodypart-select": (
        '[data-testid="tryon-bodypart-select"]',
        '[data-testid="body-part-select"]',
    ),
    "tryon-skintone-select": (
        '[data-testid="tryon-skintone-select"]',
        '[data-testid="skin-tone-slider"]',
    ),
    "tryon-lighting-select": ('[data-testid="tryon-lighting-select"]',),
    "tattoo-save-gallery-btn": (
        '[data-testid="tattoo-save-gallery-btn"]',
        '[data-testid="save-tattoo-gallery-btn"]',
    ),
    "tattoo-export-normal-btn": (
        '[data-testid="tattoo-export-normal-btn"]',
        '[data-testid="export-normal-png-btn"]',
    ),
    "tattoo-export-mirrored-btn": (
        '[data-testid="tattoo-export-mirrored-btn"]',
        '[data-testid="export-mirrored-sheet-btn"]',
    ),
    "catnap-companion": (
        '[data-testid="catnap-companion-svg"]',
        '[data-testid="catnap-companion-canvas"]',
        '[data-testid="catnap-companion-stage"]',
    ),
    "catnap-purr-btn": (
        '[data-testid="catnap-purr-btn"]',
        '[data-testid="catnap-pet-btn"]',
    ),
    "catnap-expression-select": ('[data-testid="catnap-expression-select"]',),
    "catnap-outfit-jacket": (
        '[data-testid="catnap-outfit-jacket"]',
        '[data-testid="outfit-jacket-select"]',
    ),
    "catnap-outfit-headphones": (
        '[data-testid="catnap-outfit-headphones"]',
        '[data-testid="outfit-headwear-select"]',
    ),
    "catnap-outfit-pendant": (
        '[data-testid="catnap-outfit-pendant"]',
        '[data-testid="outfit-pendant-select"]',
    ),
    "catnap-outfit-scarf": (
        '[data-testid="catnap-outfit-scarf"]',
        '[data-testid="outfit-scarf-select"]',
    ),
    "catnap-save-outfit-btn": (
        '[data-testid="catnap-save-outfit-btn"]',
        '[data-testid="save-outfit-gallery-btn"]',
    ),
    "rooftop-dash-canvas": ('[data-testid="rooftop-dash-canvas"]',),
    "rooftop-dash-start-btn": (
        '[data-testid="rooftop-dash-start-btn"]',
        '[data-testid="dash-start-btn"]',
    ),
    "rooftop-dash-restart-btn": (
        '[data-testid="rooftop-dash-restart-btn"]',
        '[data-testid="dash-restart-btn"]',
    ),
    "rooftop-dash-jump-btn": (
        '[data-testid="rooftop-dash-jump-btn"]',
        '[data-testid="dash-jump-btn"]',
    ),
    "rooftop-dash-score": (
        '[data-testid="rooftop-dash-score"]',
        '[data-testid="dash-score-value"]',
    ),
    "rooftop-dash-highscore": (
        '[data-testid="rooftop-dash-highscore"]',
        '[data-testid="dash-highscore-value"]',
    ),
    "rooftop-dash-state": (
        '[data-testid="rooftop-dash-state"]',
        '[data-testid="dash-game-state"]',
    ),
    "kpop-song-select-golden": (
        '[data-testid="kpop-song-select-golden"]',
        '[data-testid="song-select-golden"]',
    ),
    "kpop-song-select-takedown": (
        '[data-testid="kpop-song-select-takedown"]',
        '[data-testid="song-select-takedown"]',
    ),
    "kpop-song-select-soda_pop": (
        '[data-testid="kpop-song-select-soda_pop"]',
        '[data-testid="song-select-soda_pop"]',
    ),
    "rhythm-game-canvas": ('[data-testid="rhythm-game-canvas"]',),
    "rhythm-start-btn": ('[data-testid="rhythm-start-btn"]',),
    "rhythm-stop-btn": ('[data-testid="rhythm-stop-btn"]',),
    "rhythm-lane-btn-0": (
        '[data-testid="rhythm-lane-btn-0"]',
        '[data-testid="rhythm-lane-0"]',
    ),
    "rhythm-lane-btn-1": (
        '[data-testid="rhythm-lane-btn-1"]',
        '[data-testid="rhythm-lane-1"]',
    ),
    "rhythm-lane-btn-2": (
        '[data-testid="rhythm-lane-btn-2"]',
        '[data-testid="rhythm-lane-2"]',
    ),
    "rhythm-lane-btn-3": (
        '[data-testid="rhythm-lane-btn-3"]',
        '[data-testid="rhythm-lane-3"]',
    ),
    "rhythm-score": (
        '[data-testid="rhythm-score"]',
        '[data-testid="rhythm-score-value"]',
    ),
    "rhythm-combo": (
        '[data-testid="rhythm-combo"]',
        '[data-testid="rhythm-combo-value"]',
    ),
    "rhythm-judgement": (
        '[data-testid="rhythm-judgement"]',
        '[data-testid="rhythm-last-judgement"]',
    ),
    "rhythm-lyric-callout": ('[data-testid="rhythm-lyric-callout"]',),
    "beatpad-bpm-slider": ('[data-testid="beatpad-bpm-slider"]',),
    "beatpad-record-btn": (
        '[data-testid="beatpad-record-btn"]',
        '[data-testid="remix-record-btn"]',
    ),
    "beatpad-replay-btn": (
        '[data-testid="beatpad-replay-btn"]',
        '[data-testid="remix-play-btn"]',
    ),
    "beatpad-save-btn": (
        '[data-testid="beatpad-save-btn"]',
        '[data-testid="save-remix-gallery-btn"]',
    ),
    "profile-nickname-input": (
        '[data-testid="profile-nickname-input"]',
        '[data-testid="profile-name-input"]',
    ),
    "profile-save-btn": ('[data-testid="profile-save-btn"]',),
    "clock-sf-time": ('[data-testid="clock-sf-time"]',),
    "clock-boston-time": ('[data-testid="clock-boston-time"]',),
    "mom-postcard-wall": (
        '[data-testid="mom-postcard-wall"]',
        '[data-testid="postcard-wall-list"]',
    ),
    "share-mom-card-canvas": (
        '[data-testid="share-mom-card-canvas"]',
        '[data-testid="mom-postcard-canvas"]',
    ),
    "share-mom-generate-btn": (
        '[data-testid="share-mom-generate-btn"]',
        '[data-testid="generate-mom-postcard-btn"]',
    ),
    "share-mom-download-btn": (
        '[data-testid="share-mom-download-btn"]',
        '[data-testid="download-mom-postcard-link"]',
    ),
    "gallery-grid": ('[data-testid="gallery-grid"]',),
    "gallery-filter-all": ('[data-testid="gallery-filter-all"]',),
    "gallery-filter-tattoos": ('[data-testid="gallery-filter-tattoos"]',),
    "gallery-filter-outfits": ('[data-testid="gallery-filter-outfits"]',),
    "gallery-filter-remixes": ('[data-testid="gallery-filter-remixes"]',),
}


def expand_selectors(selector_or_key: str | Sequence[str]) -> list[str]:
  """Expand a logical key, single CSS selector, or sequence of selectors into candidate CSS selectors."""
  if isinstance(selector_or_key, str):
    if selector_or_key in SELECTOR_ALIASES:
      return list(SELECTOR_ALIASES[selector_or_key])
    return [selector_or_key]
  result: list[str] = []
  for item in selector_or_key:
    result.extend(expand_selectors(item))
  return result


def verify_png_data_url(data_url: str) -> dict[str, Any]:
  """Decode a data:image/png;base64,... URL and validate its PNG signature & IHDR dimensions."""
  prefix = "data:image/png;base64,"
  if not isinstance(data_url, str) or not data_url.startswith(prefix):
    raise AssertionError(
        f"Expected data URL starting with '{prefix}', got: {str(data_url)[:64]!r}"
    )
  b64_payload = data_url[len(prefix) :]
  raw_bytes = base64.b64decode(b64_payload)
  png_magic = b"\x89PNG\r\n\x1a\n"
  if len(raw_bytes) < 33 or raw_bytes[:8] != png_magic:
    raise AssertionError(
        f"Invalid PNG signature: expected {png_magic!r}, got {raw_bytes[:8]!r}"
    )
  chunk_len, chunk_type = struct.unpack(">I4s", raw_bytes[8:16])
  if chunk_type != b"IHDR" or chunk_len != 13:
    raise AssertionError(f"Expected 13-byte IHDR chunk, got {chunk_type!r} ({chunk_len})")
  width, height, bit_depth, color_type = struct.unpack(">IIBB", raw_bytes[16:26])
  return {
      "byte_length": len(raw_bytes),
      "width": width,
      "height": height,
      "bit_depth": bit_depth,
      "color_type": color_type,
  }


class ChromeCdpSession:
  """Async CDP driver managing headless Google Chrome and WebSocket JSON-RPC."""

  def __init__(
      self,
      chrome_binary: str = "/usr/bin/google-chrome",
      window_size: tuple[int, int] = (1440, 900),
      extra_flags: Sequence[str] = (),
  ):
    self.chrome_binary = chrome_binary
    self.window_size = window_size
    self.extra_flags = list(extra_flags)
    self.cdp_port = find_free_port()
    self.user_data_dir = f"/dev/shm/e2e_chrome_{os.getpid()}_{uuid.uuid4().hex[:8]}"
    self._proc: subprocess.Popen[bytes] | None = None
    self._ws: Any = None
    self._recv_task: asyncio.Task[None] | None = None
    self._msg_id = 0
    self._pending: dict[int, asyncio.Future[dict[str, Any]]] = {}
    self.console_errors: list[dict[str, Any]] = []
    self.page_exceptions: list[dict[str, Any]] = []
    self.console_logs: list[dict[str, Any]] = []
    self._load_event = asyncio.Event()

  async def start(self) -> "ChromeCdpSession":
    os.makedirs(self.user_data_dir, exist_ok=True)
    cache_dir = os.path.join(self.user_data_dir, "cache")
    config_dir = os.path.join(self.user_data_dir, "config")
    os.makedirs(cache_dir, exist_ok=True)
    os.makedirs(config_dir, exist_ok=True)
    cmd = [
        self.chrome_binary,
        "--headless=new",
        "--no-sandbox",
        "--disable-gpu",
        "--disable-dev-shm-usage",
        "--no-first-run",
        "--no-default-browser-check",
        "--autoplay-policy=no-user-gesture-required",
        f"--user-data-dir={self.user_data_dir}",
        f"--disk-cache-dir={cache_dir}",
        f"--remote-debugging-port={self.cdp_port}",
        f"--window-size={self.window_size[0]},{self.window_size[1]}",
        *self.extra_flags,
        "about:blank",
    ]
    chrome_env = {
        **os.environ,
        "HOME": self.user_data_dir,
        "XDG_CACHE_HOME": cache_dir,
        "XDG_CONFIG_HOME": config_dir,
        "TMPDIR": "/dev/shm",
    }
    self._proc = subprocess.Popen(
        cmd,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
        env=chrome_env,
    )
    ws_url = await self._wait_for_target_ws_url()
    self._ws = await websockets.connect(ws_url, max_size=64 * 1024 * 1024)
    self._recv_task = asyncio.create_task(self._recv_loop())
    await self.send_cdp("Runtime.enable")
    await self.send_cdp("Page.enable")
    await self.send_cdp("DOM.enable")
    await self.send_cdp("Network.enable")
    await self.send_cdp("Log.enable")
    return self

  async def _wait_for_target_ws_url(self, timeout_sec: float = 15.0) -> str:
    deadline = time.monotonic() + timeout_sec
    url = f"http://127.0.0.1:{self.cdp_port}/json/list"
    last_err: Exception | None = None
    while time.monotonic() < deadline:
      try:
        with urllib.request.urlopen(url, timeout=1.0) as resp:
          targets = json.loads(resp.read().decode("utf-8"))
          for target in targets:
            if target.get("type") == "page" and target.get("webSocketDebuggerUrl"):
              return str(target["webSocketDebuggerUrl"])
      except Exception as exc:  # pylint: disable=broad-except
        last_err = exc
      await asyncio.sleep(0.05)
    raise RuntimeError(
        f"Timed out waiting for Chrome CDP endpoint on port {self.cdp_port}: {last_err}"
    )

  async def _recv_loop(self) -> None:
    try:
      async for raw_msg in self._ws:
        data = json.loads(raw_msg)
        if "id" in data:
          fut = self._pending.pop(data["id"], None)
          if fut and not fut.done():
            fut.set_result(data)
        else:
          method = data.get("method", "")
          params = data.get("params", {})
          if method == "Runtime.consoleAPICalled":
            self.console_logs.append(params)
            if params.get("type") == "error":
              self.console_errors.append(params)
          elif method == "Runtime.exceptionThrown":
            self.page_exceptions.append(params)
          elif method == "Log.entryAdded":
            entry = params.get("entry", {})
            if entry.get("level") == "error":
              self.console_errors.append(entry)
          elif method == "Page.loadEventFired":
            self._load_event.set()
    except Exception:  # pylint: disable=broad-except
      pass

  async def send_cdp(
      self, method: str, params: dict[str, Any] | None = None
  ) -> dict[str, Any]:
    self._msg_id += 1
    msg_id = self._msg_id
    payload = {"id": msg_id, "method": method, "params": params or {}}
    loop = asyncio.get_running_loop()
    fut: asyncio.Future[dict[str, Any]] = loop.create_future()
    self._pending[msg_id] = fut
    await self._ws.send(json.dumps(payload))
    resp = await asyncio.wait_for(fut, timeout=30.0)
    if "error" in resp:
      raise RuntimeError(f"CDP error in {method}: {resp['error']}")
    return resp.get("result", {})

  async def close(self) -> None:
    if self._recv_task is not None:
      self._recv_task.cancel()
      try:
        await self._recv_task
      except asyncio.CancelledError:
        pass
      self._recv_task = None
    if self._ws is not None:
      try:
        await self._ws.close()
      except Exception:  # pylint: disable=broad-except
        pass
      self._ws = None
    if self._proc is not None:
      try:
        self._proc.terminate()
        self._proc.wait(timeout=3.0)
      except Exception:  # pylint: disable=broad-except
        try:
          self._proc.kill()
        except Exception:  # pylint: disable=broad-except
          pass
      self._proc = None
    if os.path.exists(self.user_data_dir):
      shutil.rmtree(self.user_data_dir, ignore_errors=True)

  async def __aenter__(self) -> "ChromeCdpSession":
    return await self.start()

  async def __aexit__(self, exc_type: Any, exc: Any, tb: Any) -> None:
    await self.close()

  def reset_errors(self) -> None:
    self.console_errors.clear()
    self.page_exceptions.clear()

  def assert_zero_errors(self, context_label: str = "") -> None:
    prefix = f"[{context_label}] " if context_label else ""
    if self.console_errors or self.page_exceptions:
      raise AssertionError(
          f"{prefix}Expected zero console/page errors, got "
          f"{len(self.console_errors)} console.error(s): {self.console_errors[:3]} "
          f"and {len(self.page_exceptions)} pageerror(s): {self.page_exceptions[:3]}"
      )

  async def navigate(self, url: str, wait_load: bool = True) -> None:
    target_url = url
    if url.startswith("http://127.0.0.1:") or url.startswith("http://localhost:"):
      from urllib.parse import urlparse
      parsed = urlparse(url)
      port = parsed.port
      root_dir = _PORT_TO_ROOT_DIR.get(port or 0)
      if root_dir:
        rel_path = parsed.path.lstrip("/")
        if not rel_path or rel_path == "index.html":
          dist_index = os.path.join(root_dir, "dist", "index.html")
          if os.path.isfile(dist_index):
            target_url = f"file://{dist_index}"
          else:
            target_url = f"file://{os.path.join(root_dir, 'index.html')}"
        else:
          target_url = f"file://{os.path.join(root_dir, rel_path)}"
    self._load_event.clear()
    await self.send_cdp("Page.navigate", {"url": target_url})
    if wait_load:
      try:
        await asyncio.wait_for(self._load_event.wait(), timeout=0.15)
      except asyncio.TimeoutError:
        pass
      await self.wait_until_ready()

  async def reload(self, wait_load: bool = True) -> None:
    self._load_event.clear()
    await self.send_cdp("Page.reload", {"ignoreCache": False})
    if wait_load:
      try:
        await asyncio.wait_for(self._load_event.wait(), timeout=0.15)
      except asyncio.TimeoutError:
        pass
      await self.wait_until_ready()

  async def wait_until_ready(self, timeout_sec: float = 5.0) -> None:
    deadline = time.monotonic() + timeout_sec
    while time.monotonic() < deadline:
      state = await self.eval_js("document.readyState")
      if state == "complete":
        await asyncio.sleep(0.02)
        return
      await asyncio.sleep(0.02)

  async def eval_js(
      self,
      expression: str,
      await_promise: bool = True,
      return_by_value: bool = True,
  ) -> Any:
    res = await self.send_cdp(
        "Runtime.evaluate",
        {
            "expression": expression,
            "awaitPromise": await_promise,
            "returnByValue": return_by_value,
        },
    )
    if "exceptionDetails" in res:
      exc = res["exceptionDetails"]
      raise RuntimeError(f"JS evaluation exception: {exc}")
    remote_obj = res.get("result", {})
    if "value" in remote_obj:
      return remote_obj["value"]
    return None

  async def resolve_selector(self, selector_or_key: str | Sequence[str]) -> str | None:
    candidates = expand_selectors(selector_or_key)
    candidates_json = json.dumps(candidates)
    return await self.eval_js(
        f"""(() => {{
          const sels = {candidates_json};
          for (const s of sels) {{
            if (document.querySelector(s)) return s;
          }}
          return null;
        }})()"""
    )

  async def exists(self, selector_or_key: str | Sequence[str]) -> bool:
    return (await self.resolve_selector(selector_or_key)) is not None

  async def click(self, selector_or_key: str | Sequence[str]) -> bool:
    sel = await self.resolve_selector(selector_or_key)
    if not sel:
      return False
    sel_json = json.dumps(sel)
    return bool(
        await self.eval_js(
            f"""(() => {{
              const el = document.querySelector({sel_json});
              if (!el) return false;
              if (typeof el.click === 'function') {{
                el.click();
              }} else {{
                el.dispatchEvent(new MouseEvent('click', {{ bubbles: true, cancelable: true }}));
              }}
              return true;
            }})()"""
        )
    )

  async def set_value(self, selector_or_key: str | Sequence[str], value: str) -> bool:
    sel = await self.resolve_selector(selector_or_key)
    if not sel:
      return False
    sel_json = json.dumps(sel)
    val_json = json.dumps(value)
    return bool(
        await self.eval_js(
            f"""(() => {{
              const el = document.querySelector({sel_json});
              if (!el) return false;
              el.value = {val_json};
              el.dispatchEvent(new Event('input', {{ bubbles: true }}));
              el.dispatchEvent(new Event('change', {{ bubbles: true }}));
              return true;
            }})()"""
        )
    )

  async def get_text(self, selector_or_key: str | Sequence[str]) -> str:
    sel = await self.resolve_selector(selector_or_key)
    if not sel:
      return ""
    sel_json = json.dumps(sel)
    val = await self.eval_js(
        f"""(() => {{
          const el = document.querySelector({sel_json});
          return el ? (el.textContent || '').trim() : '';
        }})()"""
    )
    return str(val or "")

  async def press_key(self, key: str, code: str | None = None) -> None:
    key_code = code or (f"Key{key.upper()}" if len(key) == 1 and key.isalpha() else key)
    key_json = json.dumps(key)
    code_json = json.dumps(key_code)
    await self.eval_js(
        f"""(() => {{
          window.dispatchEvent(new KeyboardEvent('keydown', {{ key: {key_json}, code: {code_json}, bubbles: true }}));
          document.dispatchEvent(new KeyboardEvent('keydown', {{ key: {key_json}, code: {code_json}, bubbles: true }}));
          window.dispatchEvent(new KeyboardEvent('keyup', {{ key: {key_json}, code: {code_json}, bubbles: true }}));
          document.dispatchEvent(new KeyboardEvent('keyup', {{ key: {key_json}, code: {code_json}, bubbles: true }}));
        }})()"""
    )

  async def draw_canvas_stroke(
      self,
      canvas_selector_or_key: str | Sequence[str],
      points: Sequence[tuple[float, float]],
      brush_mode: str = "neon",
      color: str = "#ff33aa",
      width: float = 6.0,
  ) -> bool:
    sel = await self.resolve_selector(canvas_selector_or_key)
    pts_list = [{"x": float(x), "y": float(y)} for x, y in points]
    pts_json = json.dumps(pts_list)
    sel_json = json.dumps(sel or '[data-testid="tattoo-canvas"]')
    brush_json = json.dumps(brush_mode)
    color_json = json.dumps(color)
    return bool(
        await self.eval_js(
            f"""(() => {{
              const pts = {pts_json};
              const canvas = document.querySelector({sel_json});
              if (canvas && pts.length >= 2) {{
                const rect = canvas.getBoundingClientRect();
                const mkEvt = (type, pt) => new PointerEvent(type, {{
                  clientX: rect.left + pt.x,
                  clientY: rect.top + pt.y,
                  bubbles: true,
                  cancelable: true,
                  pointerId: 1
                }});
                canvas.dispatchEvent(mkEvt('pointerdown', pts[0]));
                canvas.dispatchEvent(new MouseEvent('mousedown', {{ clientX: rect.left + pts[0].x, clientY: rect.top + pts[0].y, bubbles: true }}));
                for (let i = 1; i < pts.length; i++) {{
                  canvas.dispatchEvent(mkEvt('pointermove', pts[i]));
                  canvas.dispatchEvent(new MouseEvent('mousemove', {{ clientX: rect.left + pts[i].x, clientY: rect.top + pts[i].y, bubbles: true }}));
                }}
                const last = pts[pts.length - 1];
                canvas.dispatchEvent(mkEvt('pointerup', last));
                canvas.dispatchEvent(new MouseEvent('mouseup', {{ clientX: rect.left + last.x, clientY: rect.top + last.y, bubbles: true }}));
              }}
              if (window.__CHEER_UP_STUDIO__ && window.__CHEER_UP_STUDIO__.tattoo && typeof window.__CHEER_UP_STUDIO__.tattoo.drawStroke === 'function') {{
                window.__CHEER_UP_STUDIO__.tattoo.drawStroke(pts, {brush_json}, {color_json}, {float(width)});
              }}
              return true;
            }})()"""
        )
    )

  async def set_viewport(self, width: int, height: int, mobile: bool = False) -> None:
    await self.send_cdp(
        "Emulation.setDeviceMetricsOverride",
        {
            "width": width,
            "height": height,
            "deviceScaleFactor": 1,
            "mobile": mobile,
        },
    )

  async def set_offline_mode(self, offline: bool = True) -> None:
    await self.send_cdp(
        "Network.emulateNetworkConditions",
        {
            "offline": offline,
            "latency": 0,
            "downloadThroughput": -1,
            "uploadThroughput": -1,
        },
    )


@dataclass
class TestCaseSpec:
  """Metadata and async callable for a registered E2E test case."""

  test_id: str
  tier: str
  feature: str
  title: str
  fn: Callable[[ChromeCdpSession, str], Coroutine[Any, Any, None]]


@dataclass
class TestCaseResult:
  """Execution outcome of a single test case."""

  test_id: str
  tier: str
  feature: str
  title: str
  passed: bool
  duration_ms: float
  error_message: str = ""
  console_error_count: int = 0
  page_exception_count: int = 0


TEST_REGISTRY: list[TestCaseSpec] = []


def register_test(test_id: str, tier: str, feature: str, title: str):
  """Decorator registering an async E2E test function in the global registry."""

  def decorator(
      fn: Callable[[ChromeCdpSession, str], Coroutine[Any, Any, None]]
  ) -> Callable[[ChromeCdpSession, str], Coroutine[Any, Any, None]]:
    TEST_REGISTRY.append(
        TestCaseSpec(
            test_id=test_id,
            tier=tier,
            feature=feature,
            title=title,
            fn=fn,
        )
    )
    return fn

  return decorator
