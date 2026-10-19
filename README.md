# Namma Space: Autonomous Indoor 3D Digital Twin & Spatial Navigation Engine

[![Techfest 2026-27](https://img.shields.io/badge/Techfest-IIT%20Bombay%202026--27-blue.svg)](https://techfest.org)
[![Python 3.10+](https://img.shields.io/badge/Python-3.10%2B-blue.svg)](https://www.python.org/)
[![WebGL / Three.js](https://img.shields.io/badge/WebGL-Three.js%20Zero--Install-orange.svg)](https://threejs.org/)
[![3DGS PSNR](https://img.shields.io/badge/Held--Out%20PSNR-28.93%20dB-brightgreen.svg)](#held-out-quantitative-benchmarks)
[![Viewer FPS](https://img.shields.io/badge/Web%20Viewer-60%20FPS-success.svg)](#zero-install-3d-web-viewer-quickstart)

> **Techfest 2026-27, IIT Bombay — Namma Space Competition**  
> An end-to-end intelligent spatial pipeline converting standard smartphone captures of real indoor environments into photorealistic, interactive 3D digital twins with **zero-install first-person web roaming (WASD + mouse look)**, semantic point-of-interest indexing, and an autonomous Agentic QA release gate.

---

## ⚡ 1-Minute Quickstart: Live 3D Web Walkthrough

No GPU, external dependencies, or API keys are required to experience the digital twin:

```powershell
# 1. Start the zero-dependency local HTTP server
python scripts/serve_web_viewer.py
```

1. Your default browser will automatically open **`http://localhost:8000/index.html`**.
2. Click **"Enter Walkthrough (WASD)"** to lock the mouse cursor.
3. Explore the space freely using standard gaming controls:
   - <kbd>W</kbd> <kbd>A</kbd> <kbd>S</kbd> <kbd>D</kbd> — Walk through the room
   - <kbd>Mouse</kbd> — Look around ($360^\circ$ pitch and yaw)
   - <kbd>Shift</kbd> — Sprint ($1.8\times$ traversal speed)
   - <kbd>Space</kbd> / <kbd>C</kbd> — Ascend / crouch
   - <kbd>Esc</kbd> — Unlock mouse cursor
4. **Interactive HUD Controls**:
   - **Render Shading**: Toggle between **Photoreal RGB**, **Semantics** (categorized furniture), and **Depth** (viridis distance gradient).
   - **POI Teleportation**: Jump directly to the *Entrance*, *Reception Counter*, *Executive Desk*, *Meeting Room A*, or *Sofa Lounge*.
   - **2D Minimap**: Live overhead radar in the bottom-right corner tracks your position and field-of-view cone in real time.
   - **Custom Model Drag-and-Drop**: Drag any `.splat` or `.ply` file directly into the browser viewport to visualize custom scenes.

---

## 📁 Repository Structure & Submission Package

```
NammaSpace/
├── web_viewer/                       # Zero-Install WebGL / Three.js 3D Viewer
│   ├── index.html                    # Glassmorphic HUD, POI dock, minimap, controls
│   ├── style.css                     # Cyber-industrial styling with responsive dark theme
│   └── viewer.js                     # First-Person WASD + Mouse Look controller, 
│                                     # 3D digital twin room, multi-mode shading, 2D minimap
├── docs/                             # Competition Deliverables & Submission Papers
│   ├── TECHNICAL_ABSTRACT.md         # Mandatory 5-Page Technical Abstract (PDF ready)
│   ├── SOP_DATA_COLLECTION.md        # Standard Operating Procedure for smartphone capture
│   └── DEMO_VIDEO_SCRIPT.md          # 3 to 5-Minute Demonstration Video script & storyboard
├── scripts/                          # Unified Automation & Serving Scripts
│   ├── serve_web_viewer.py           # Zero-dependency HTTP server with CORS & WebGL MIME
│   └── run_pipeline.py               # Master CLI orchestration runner
├── sample_data/                      # Test Dataset Directory
│   └── README.md                     # Sample dataset guide and drop-in paths
├── SpatialScene3D/                   # Cloned Base Reconstruction Engine
│   ├── notebook_v10_5.ipynb          # End-to-end Colab GPU pipeline (SfM -> 3DGS -> Semantics)
│   ├── qa_supervisor.py              # Autonomous Agentic QA & release gate
│   ├── convert.py                    # PLY to .splat web converter
│   └── final_full_scene_package/     # Evaluated metrics, manifests, and tables
├── SUBMISSION_ROUND_1.md             # Master Submission Document for Round 1
└── README.md                         # Project documentation and instructions (this file)
```

---

## 🏆 Round 1 Deliverables Summary

| Required Deliverable | Format | Location / Status |
|---|---|---|
| **1. Technical Abstract** | PDF (max 5 pages) | [`docs/TECHNICAL_ABSTRACT.md`](docs/TECHNICAL_ABSTRACT.md) *(export to PDF)* |
| **2. Zero-Install Web Viewer** | Working Web Link | [`web_viewer/index.html`](web_viewer/index.html) · Live at `http://localhost:8000` |
| **3. Demonstration Video** | 3–5 Minute MP4 | [`docs/DEMO_VIDEO_SCRIPT.md`](docs/DEMO_VIDEO_SCRIPT.md) *(script & storyboard)* |
| **4. Code Repo & Sample Data** | Repository + Sample Data | [`sample_data/README.md`](sample_data/README.md) & [`SpatialScene3D/`](SpatialScene3D/) |
| **5. Master Submission Hub** | Consolidated Document | [`SUBMISSION_ROUND_1.md`](SUBMISSION_ROUND_1.md) |

---

## 🚀 End-to-End Execution Guide

Follow these steps to reconstruct a new indoor space from scratch using your smartphone:

### Step 1: Capture Indoor Space (SOP)
Follow the [Standard Operating Procedure](docs/SOP_DATA_COLLECTION.md):
- **Camera Settings**: 4K @ 30/60 fps with **AE/AF Lock** enabled (mandatory to eliminate photometric radiance shifts).
- **Trajectory Protocol**:
  1. *Tier 1*: Perimeter loop at $1.5\text{m}$ eye level with $\ge 75\%$ overlap and 360° closed loop.
  2. *Tier 2*: Interior figure-8 cross-pass to connect opposing walls.
  3. *Tier 3*: Multi-altitude furniture orbits ($1.6\text{m}$ and $0.8\text{m}$).
- Save video to `sample_data/raw_videos/my_room.mp4`.

### Step 2: Extract & Filter Frames
Run the automated preprocessor to decimate video and filter out motion-blurred frames using Laplacian variance:

```powershell
python scripts/run_pipeline.py --stage extract --video sample_data/raw_videos/my_room.mp4
```

### Step 3: Cloud GPU Reconstruction & Semantic Lifting
Open [`SpatialScene3D/notebook_v10_5.ipynb`](SpatialScene3D/notebook_v10_5.ipynb) in Google Colab (GPU runtime):
1. **COLMAP Structure-from-Motion**: Recovers camera intrinsics, poses, and sparse 3D point cloud.
2. **3D Gaussian Splatting (`gsplat`)**: Optimizes anisotropic 3D Gaussians with spherical harmonics to reach photorealistic convergence ($>28\text{ dB}$ PSNR).
3. **Grounded-SAM-2 & CLIP Lifting**: Segments furniture in 2D, back-projects consensus votes onto 3D Gaussians, and computes open-vocabulary CLIP ViT-L/14 text embeddings.
4. Download the generated `scene.ply` file to your machine.

### Step 4: Convert to Web Splat Format
Convert the dense PLY point cloud into a compact, web-optimized `.splat` binary:

```powershell
python scripts/run_pipeline.py --stage convert --ply path/to/scene.ply --splat web_viewer/my_room.splat
```

### Step 5: Audit Release Readiness with Agentic QA
Run the autonomous supervisor to verify reconstruction fidelity against held-out benchmark thresholds:

```powershell
python scripts/run_pipeline.py --stage qa
```

Expected output:
```
============================================================
 AGENTIC SPATIAL QA — RELEASE WITH LIMITATIONS
============================================================
 PASS     | Visual reconstruction
          | Held-out PSNR 28.93 dB, SSIM 0.903, LPIPS 0.058 on 15 unseen frames.
 WARNING  | Semantic 3D lifting
          | 37.4% of Gaussians labelled across 22 classes.
 PASS     | 2D mask quality
          | 150/150 frames produced masks, mean confidence 0.47.
 WARNING  | Gaussian PLY quality
          | Pruned viewer PLY eliminates low-opacity floaters (0.0%).
 PASS     | Efficiency / packaging
          | 484,707 Gaussians; all evaluation packages produced.
============================================================
```

### Step 6: Launch Web Walkthrough
Serve and explore your reconstructed model:

```powershell
python scripts/run_pipeline.py --stage serve
# Or directly:
python scripts/serve_web_viewer.py
```

#### 🎮 Interactive Viewer Controls:
- **`W` `A` `S` `D` / Arrows**: Walk around smoothly (works continuously in both Free Cursor and Locked Mouse Look modes).
- **`Tab` or `Esc`**: Instantly toggle between **Free Cursor Mode** (interact with UI panels, adjust sliders, jump to POIs, or drag & drop files) and **FPS Mouse Look Mode** (pointer-locked first-person view).
- **Mouse Left-Click & Drag**: Look around the scene with precision while remaining in Free Cursor mode.
- **`Shift`**: Sprint ($1.8\times$ traversal speed).
- **`Space` / `C`**: Ascend / crouch.
- **Drag & Drop Models**: Drag and drop any `.splat` or `.ply` point cloud file anywhere onto the browser window for real-time visualization.
- **Shading Modes**: Switch between Photoreal RGB, 3D Semantics, and Depth in the left HUD.
- **POI Quick-Jump**: Teleport directly to Main Entrance, Reception Counter, Executive Desk, Meeting Room A, or Sofa Lounge.

---

## 📊 Held-Out Quantitative Benchmarks

Metrics were measured on **15 held-out frames never seen during training** (every 10th camera frame):

| Metric | Measured Value | Standard Threshold | Verdict |
|---|---:|---:|:---:|
| **Held-Out Test PSNR ↑** | **28.93 dB** | $\ge 25.0\text{ dB}$ | **Exceptional** |
| **Held-Out Test SSIM ↑** | **0.903** | $\ge 0.850$ | **Exceptional** |
| **Held-Out Test LPIPS ↓** | **0.058** | $\le 0.120$ | **Photorealistic** |
| **Gaussian Count** | **484,707** | $< 1,000,000$ | **Optimized** |
| **3D Semantic Classes** | **22** | $\ge 10$ | **Pass** |
| **Web Viewer Frame Rate** | **60 FPS** | $\ge 30\text{ FPS}$ | **Fluid Roaming** |

---

## 🔑 Environment Variables & API Keys Note

**No environment variables or API keys are required** to run:
- The 3D Web Viewer (`python scripts/serve_web_viewer.py`)
- The pipeline runner and format converter (`python scripts/run_pipeline.py`)
- The deterministic Agentic QA supervisor

### Optional: Live LLM Reasoning Layer
If you wish to enable dynamic natural language diagnostics in `qa_supervisor.py` (via Groq, OpenAI, or Gemini), you can optionally set:
```powershell
$env:LLM_API_KEY="your_api_key_here"      # Free Groq key from console.groq.com
# Optional overrides:
# $env:LLM_BASE_URL="https://api.groq.com/openai/v1"
# $env:LLM_MODEL="llama-3.3-70b-versatile"
```
*(If unset, the system uses deterministic mathematical thresholds, which always work reliably).*

---

## 🗺️ Roadmap: Round 2 & Round 3

- **Round 2 (Deadline: 30 Nov 2026)**:
  - 2D/3D semantic occupancy grid extraction.
  - Obstacle-aware $A^*$ / navigation mesh pathfinding.
  - Real-time animated floor navigation ribbons guiding users around physical obstacles to clicked POIs.
- **Round 3 (Finale: 16–17 Dec 2026 at IIT Bombay)**:
  - Rapid on-site data capture at the Lecture Hall Complex (LHC).
  - Mobile WebXR / AR live camera walking directions.

---

## 📄 License
This codebase is released under the **Apache 2.0 License**. Upstream vision backbones retain their respective open-source licenses (COLMAP: BSD, Grounded-SAM-2: Apache 2.0, CLIP: MIT).

