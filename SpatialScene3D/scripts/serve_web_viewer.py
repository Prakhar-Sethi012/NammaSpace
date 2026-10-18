"""
serve_web_viewer.py — Zero-Dependency HTTP Server for Namma Space 3D Web Viewer
==============================================================================
Serves the web_viewer directory with proper MIME types, CORS headers, and
Cross-Origin Isolation policies needed for high-performance WebGL 3D rendering.

Usage:
    python scripts/serve_web_viewer.py [--port 8000] [--no-browser]
"""

import argparse
import http.server
import mimetypes
import os
import socketserver
import sys
import webbrowser
from pathlib import Path

# Add MIME types
mimetypes.add_type("application/javascript", ".js")
mimetypes.add_type("application/javascript", ".mjs")
mimetypes.add_type("text/css", ".css")
mimetypes.add_type("application/octet-stream", ".splat")
mimetypes.add_type("application/octet-stream", ".ply")
mimetypes.add_type("application/json", ".json")

class SpatialHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Enable CORS and Cross-Origin Isolation for high-perf WebGL/WebGPU
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "*")
        self.send_header("Cross-Origin-Opener-Policy", "same-origin")
        self.send_header("Cross-Origin-Embedder-Policy", "require-corp")
        self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200, "ok")
        self.end_headers()

def run_server(port=8000, directory="web_viewer", open_browser=True, test_mode=False):
    root_dir = Path(__file__).resolve().parent.parent / directory
    if not root_dir.exists():
        print(f"Error: Directory '{root_dir}' does not exist.")
        sys.exit(1)

    os.chdir(root_dir)
    handler = SpatialHTTPRequestHandler

    # Allow port reuse
    socketserver.TCPServer.allow_reuse_address = True

    if sys.stdout.encoding.lower() != "utf-8":
        try:
            sys.stdout.reconfigure(encoding="utf-8")
        except Exception:
            pass

    with socketserver.TCPServer(("", port), handler) as httpd:
        url = f"http://localhost:{port}/index.html"
        print("=" * 65)
        print("[*] Namma Space -- 3D Digital Twin Web Viewer Server")
        print("=" * 65)
        print(f"  Serving Directory : {root_dir}")
        print(f"  Live Viewer URL   : {url}")
        print(f"  Controls          : WASD to walk, Mouse to look around")
        print("=" * 65)

        if test_mode:
            print("  ✓ Test Mode: Server initialized successfully on port", port)
            return

        if open_browser:
            print("  Opening browser automatically...")
            webbrowser.open(url)

        print("  Press Ctrl+C to stop the server.\n")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n  Server stopped.")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Serve the Namma Space 3D Web Viewer.")
    parser.add_argument("--port", type=int, default=8000, help="Port to serve on (default: 8000)")
    parser.add_argument("--no-browser", action="store_true", help="Do not open browser automatically")
    parser.add_argument("--test", action="store_true", help="Test initialization and exit immediately")
    args = parser.parse_args()

    run_server(port=args.port, open_browser=not args.no_browser, test_mode=args.test)
