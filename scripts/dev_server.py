#!/usr/bin/env python3
"""Local HTTP development server for Boston ↔ Bay Area Creative Cheer-Up Studio.

Serves the project root (or a specified directory) with proper MIME types for
ES2022 modules and permissive CORS headers.
"""

import argparse
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import os
import sys


class StudioRequestHandler(SimpleHTTPRequestHandler):
  extensions_map = {
      **SimpleHTTPRequestHandler.extensions_map,
      '.js': 'application/javascript; charset=utf-8',
      '.mjs': 'application/javascript; charset=utf-8',
      '.css': 'text/css; charset=utf-8',
      '.html': 'text/html; charset=utf-8',
      '.json': 'application/json; charset=utf-8',
      '.svg': 'image/svg+xml',
      '.png': 'image/png',
  }

  def end_headers(self):
    self.send_header('Access-Control-Allow-Origin', '*')
    self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
    super().end_headers()


def main():
  parser = argparse.ArgumentParser(description='Cheer-Up Studio Dev Server')
  parser.add_argument('--port', type=int, default=8080, help='Port to bind')
  parser.add_argument(
      '--dir',
      type=str,
      default=os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
      help='Directory to serve',
  )
  args = parser.parse_args()

  os.chdir(args.dir)
  server = ThreadingHTTPServer(('127.0.0.1', args.port), StudioRequestHandler)
  print(f'Serving Cheer-Up Studio from {args.dir} at http://127.0.0.1:{args.port}')
  sys.stdout.flush()
  try:
    server.serve_forever()
  except KeyboardInterrupt:
    pass
  finally:
    server.server_close()


if __name__ == '__main__':
  main()
