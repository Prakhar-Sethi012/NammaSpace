# Sample Test Data Directory: Namma Space

This directory contains test datasets, captured smartphone video clips, and pre-extracted frame sequences for testing and validating the Namma Space 3D reconstruction and web roaming pipeline.

---

## Directory Structure

```
sample_data/
├── raw_videos/              # Place your smartphone .mp4 / .mov video captures here
│   └── test_room_capture.mp4 (or sample clip)
├── extracted_frames/        # Output from preprocess/extract_frames.py
│   ├── frame_0001.jpg
│   ├── frame_0002.jpg
│   └── ...
├── colmap_workspace/        # COLMAP camera poses and sparse 3D point cloud
│   ├── database.db
│   └── sparse/0/
│       ├── cameras.bin
│       ├── images.bin
│       └── points3D.bin
└── scene_outputs/           # Reconstructed 3D Gaussian Splatting assets
    ├── output_scene.ply     # 3DGS point cloud
    ├── output_scene.splat   # Converted web-optimized splat
    └── splat_labels.json    # Semantic label mapping
```

---

## Quick Testing Options

### Option A: Immediate Zero-Install Web Roaming (No GPU Required)
The web viewer includes a high-fidelity synthetic indoor digital twin with full furniture, semantics, and 2D minimap pre-configured:
```bash
python scripts/serve_web_viewer.py
```
Open `http://localhost:8000/index.html` to explore with WASD controls immediately.

### Option B: Test with Precomputed Scene from SpatialScene3D
The base repository includes held-out scene outputs:
```bash
# Convert existing sample PLY to .splat for the web viewer:
python SpatialScene3D/convert.py "SpatialScene3D/final_full_scene_package v10.5/scene_outputs/splat_raw_pruned_for_viewer.ply" --output web_viewer/sample_room.splat
```

### Option C: Run End-to-End Pipeline on Your Own Smartphone Capture
Drop your room video into `sample_data/raw_videos/my_room.mp4` and run:
```bash
python scripts/run_pipeline.py --video sample_data/raw_videos/my_room.mp4 --scene_name my_room
```
