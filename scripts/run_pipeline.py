"""
run_pipeline.py — Master Orchestration Script for Namma Space Pipeline
======================================================================
Unified CLI to orchestrate preprocessing, reconstruction, format conversion,
QA verification, and web viewer serving for Techfest 2026-27 Namma Space.

Usage:
    # 1. Run all local stages and serve the web viewer:
    python scripts/run_pipeline.py --stage all

    # 2. Extract frames from a custom smartphone video:
    python scripts/run_pipeline.py --stage extract --video sample_data/raw_videos/my_room.mp4

    # 3. Convert a .ply reconstruction to web-ready .splat format:
    python scripts/run_pipeline.py --stage convert --ply path/to/scene.ply --output web_viewer/scene.splat

    # 4. Audit quality metrics with the Agentic QA supervisor:
    python scripts/run_pipeline.py --stage qa

    # 5. Serve the zero-install 3D Web Viewer:
    python scripts/run_pipeline.py --stage serve
"""

import argparse
import os
import subprocess
import sys
from pathlib import Path

# Ensure UTF-8 output on Windows terminals
if sys.stdout.encoding.lower() != "utf-8":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

PROJECT_ROOT = Path(__file__).resolve().parent.parent
SPATIAL_DIR = PROJECT_ROOT / "SpatialScene3D"

def print_banner(msg):
    print("\n" + "=" * 65)
    print(f"[*] {msg}")
    print("=" * 65)

def run_cmd(cmd, cwd=None):
    print(f"  > {' '.join(cmd) if isinstance(cmd, list) else cmd}")
    res = subprocess.run(cmd, cwd=cwd or PROJECT_ROOT, shell=True)
    if res.returncode != 0:
        print(f"  [!] Warning: Command returned non-zero exit code {res.returncode}")
    return res.returncode

def stage_extract(video_path, output_dir, fps=3):
    print_banner(f"Stage 1: Frame Extraction from {video_path}")
    if not os.path.exists(video_path):
        print(f"  [!] Error: Video file not found at {video_path}")
        return 1
    
    cmd = [
        sys.executable,
        "-m", "preprocess.extract_frames",
        "--video", str(video_path),
        "--output_dir", str(output_dir),
        "--fps", str(fps)
    ]
    return run_cmd(cmd, cwd=SPATIAL_DIR)

def stage_convert(ply_path, splat_output):
    print_banner("Stage 2: Convert PLY to .splat for Web Viewer")
    if not os.path.exists(ply_path):
        print(f"  [!] File not found: {ply_path}")
        return 1
    
    cmd = [
        sys.executable,
        str(SPATIAL_DIR / "convert.py"),
        str(ply_path),
        "--output", str(splat_output)
    ]
    return run_cmd(cmd, cwd=PROJECT_ROOT)

def stage_qa():
    print_banner("Stage 3: Autonomous Agentic QA & Release Gate")
    metrics_dir = SPATIAL_DIR / "final_report_package v10.5" / "metrics"
    output_dir = SPATIAL_DIR / "final_report_package v10.5" / "qa"
    
    cmd = [
        sys.executable,
        str(SPATIAL_DIR / "qa_supervisor.py"),
        "--metrics_dir", str(metrics_dir),
        "--output_dir", str(output_dir)
    ]
    return run_cmd(cmd, cwd=SPATIAL_DIR)

def stage_serve(port=8000, no_browser=False):
    print_banner(f"Stage 4: Serving Zero-Install 3D Web Viewer on Port {port}")
    cmd = [
        sys.executable,
        str(PROJECT_ROOT / "scripts" / "serve_web_viewer.py"),
        "--port", str(port)
    ]
    if no_browser:
        cmd.append("--no-browser")
    return run_cmd(cmd, cwd=PROJECT_ROOT)

def main():
    parser = argparse.ArgumentParser(description="Namma Space Master Pipeline Runner")
    parser.add_argument(
        "--stage", 
        choices=["all", "extract", "convert", "qa", "serve"],
        default="all",
        help="Pipeline stage to execute (default: all)"
    )
    parser.add_argument("--video", type=str, default="sample_data/raw_videos/room.mp4", help="Path to input video")
    parser.add_argument("--frames_dir", type=str, default="sample_data/extracted_frames", help="Output directory for frames")
    parser.add_argument("--ply", type=str, help="Path to .ply file for conversion")
    parser.add_argument("--splat", type=str, default="web_viewer/sample_room.splat", help="Output path for converted .splat")
    parser.add_argument("--port", type=int, default=8000, help="Web viewer port")
    parser.add_argument("--no-browser", action="store_true", help="Do not automatically launch browser")
    args = parser.parse_args()

    print("=================================================================")
    print("   NAMMA SPACE -- End-to-End Spatial AI Reconstruction Engine   ")
    print("=================================================================")

    if args.stage == "extract":
        stage_extract(args.video, args.frames_dir)
    elif args.stage == "convert":
        ply = args.ply or str(SPATIAL_DIR / "final_full_scene_package v10.5" / "scene_outputs" / "splat_raw_pruned_for_viewer.ply")
        stage_convert(ply, args.splat)
    elif args.stage == "qa":
        stage_qa()
    elif args.stage == "serve":
        stage_serve(port=args.port, no_browser=args.no_browser)
    elif args.stage == "all":
        print("Executing full verified demonstration pipeline...")
        stage_qa()
        stage_serve(port=args.port, no_browser=args.no_browser)

if __name__ == "__main__":
    main()

