# Namma Space — Round 1 Master Submission Package
**Competition**: Techfest 2026-27, IIT Bombay — *Namma Space*  
**Track**: Round 1: 3D Reconstruction & Roaming (Online Submission)  
**Submission Deadline**: 31st October 2026  

---

## 1. Submission Overview & Master Deliverables Table

In compliance with the Techfest Namma Space submission guidelines (*"all additional links, live web demos, prototype access URLs, or supplementary technical documents... must be neatly formatted and presented inside a single organized master PDF"*), this master document consolidates all four required Round 1 deliverables:

| Deliverable | Required Format | Description & Location | Direct Access / Link |
|---|---|---|---|
| **1. Technical Abstract** | PDF (max 5 pages) | Architecture, SOP details, 3DGS pipeline, semantic lifting, and held-out benchmarks. | [`docs/TECHNICAL_ABSTRACT.md`](docs/TECHNICAL_ABSTRACT.md) *(Export to PDF)* |
| **2. Zero-Install Web Viewer** | Working Web Link | Interactive 3D WebGL viewer with fluid first-person WASD & mouse roaming, POI jumps, 2D minimap. | **Live Demo**: `http://localhost:8000/index.html` *(or hosted Vercel/GitHub Pages URL)* |
| **3. Demonstration Video** | 3 to 5-Minute Video | Full project overview, smartphone capture SOP demo, reconstruction pipeline, and live web walkthrough. | [`docs/DEMO_VIDEO_SCRIPT.md`](docs/DEMO_VIDEO_SCRIPT.md) *(Google Drive Link)* |
| **4. Code Repository & Setup** | Code Repo + Sample Data | Complete reproducible pipeline, Colab GPU notebook, local runner, and sample dataset directory. | [SpatialScene3D GitHub Repository](https://github.com/Ziro21/SpatialScene3D) |

---

## 2. Executive Summary of Results

All quantitative metrics are measured on **15 held-out frames never seen during training** (every 10th camera frame):

- **Held-Out Test PSNR**: **28.93 dB** (State-of-the-art monocular indoor fidelity; exceeds 25 dB threshold)
- **Held-Out Test SSIM**: **0.903** (Exceptional structural fidelity; exceeds 0.85 threshold)
- **Held-Out Test LPIPS**: **0.058** (Near-lossless perceptual error; well below 0.12 threshold)
- **Primitive Count**: **484,707 Gaussians** (Pruned and optimized for zero-install 60 FPS web rendering)
- **Semantics**: **22 unique 3D classes**, 37.4% Gaussians labeled, grounded via Grounded-SAM-2 and CLIP ViT-L/14
- **Agentic QA Decision**: **RELEASE WITH LIMITATIONS** (Certified by autonomous dual-tier supervisor)

---

## 3. Zero-Install 3D Web Viewer & Roaming Guide

The competition explicitly mandates:
> *"The platform must allow users to freely roam and look around the generated 3D space through a zero-install desktop or web-view interface. Users should experience fluid, first-person movement using standard controls like WASD keys and mouse inputs."*

### 3.1 Quick Start (Zero-Install Local Server)
Run the bundled HTTP server with CORS and WebGL MIME configurations:
```bash
python scripts/serve_web_viewer.py
```
This automatically launches your default browser at:  
👉 **`http://localhost:8000/index.html`**

### 3.2 Controls Reference

| Control | Action |
|---|---|
| <kbd>W</kbd> <kbd>A</kbd> <kbd>S</kbd> <kbd>D</kbd> / Arrows | Walk around space (works at all times in both Free Cursor and Mouse Look modes) |
| <kbd>Tab</kbd> or <kbd>Esc</kbd> | Toggle between **Free Cursor Mode** (change settings/drag-drop) and **Mouse Look Mode** |
| <kbd>Mouse Left-Drag</kbd> | Look around with smooth pitch & yaw while keeping cursor free |
| <kbd>Mouse Look</kbd> (when locked) | Seamless first-person 360° pitch and yaw look |
| <kbd>Shift</kbd> | Sprint (1.8× speed multiplier) |
| <kbd>Space</kbd> / <kbd>C</kbd> | Float up / crouch down (when collision height lock is toggled off) |

### 3.3 Interactive Viewer Features
- **Render Shading Modes**:
  - `Photoreal RGB`: Natural radiance field rendering.
  - `Semantics`: Color-coded by recognized object category (Desks, Chairs, Sofas, Tables, Walls).
  - `Depth`: Viridis colormap showing distance gradient from the viewpoint.
- **POI Quick Navigation**: Dropdown or sidebar selector to jump directly to **Entrance**, **Reception**, **Executive Desk**, **Meeting Area**, or **Sofa Lounge**.
- **Real-Time 2D Minimap**: Dynamic overhead radar showing your real-time position, field-of-view cone, and room boundaries.
- **Custom Model Drag-and-Drop**: Drag any custom `.splat` or `.ply` file directly into the browser to visualize custom scenes.

---

## 4. End-to-End Pipeline Execution Guide

To reproduce the reconstruction or process new smartphone indoor captures:

### Step 1: Capture Indoor Space via SOP
Follow [`docs/SOP_DATA_COLLECTION.md`](docs/SOP_DATA_COLLECTION.md):
- Record video in **4K / 1080p** with **AE/AF Lock enabled**.
- Walk outer perimeter loop at 0.5 m/s, followed by interior figure-8 cross-pass and furniture orbits.
- Save capture to `sample_data/raw_videos/my_room.mp4`.

### Step 2: Extract & Filter Frames
```bash
python scripts/run_pipeline.py --stage extract --video sample_data/raw_videos/my_room.mp4
```
Extracts frames at 3 fps and discards blurry frames using Laplacian variance thresholding.

### Step 3: Reconstruction & Semantic Lifting
Open `SpatialScene3D/notebook_v10_5.ipynb` in **Google Colab** (Free or Pro GPU runtime):
1. Mount Google Drive and set the path to extracted frames.
2. Run Sections 1–4: Executes COLMAP Structure-from-Motion and `gsplat` 3D Gaussian Splatting.
3. Run Sections 5–7: Executes Grounded-SAM-2 zero-shot segmentation and 3D semantic consensus lifting.
4. Run Section 10: Executes the Agentic QA Supervisor to verify release readiness.
5. Download the resulting `scene.ply` to your local machine.

### Step 4: Convert to Web Splat & Launch Viewer
```bash
# Convert PLY to .splat
python scripts/run_pipeline.py --stage convert --ply path/to/scene.ply --splat web_viewer/scene.splat

# Launch interactive Web Viewer
python scripts/run_pipeline.py --stage serve
```

---

## 5. Round 2 & Round 3 Outlook

With Round 1 successfully delivering the 3D digital twin and first-person free-roaming viewer, our system is primed for:
- **Round 2 (Deadline: 30 Nov 2026)**: A* pathfinding over the extracted 2D/3D semantic occupancy map, rendering animated floor navigation ribbons around furniture obstacles.
- **Round 3 (Finale: 16–17 Dec 2026 at IIT Bombay)**: On-site rapid capture at the Lecture Hall Complex (LHC) and mobile WebXR / AR camera guidance.

