# Demonstration Video Script & Storyboard: Namma Space 3D Digital Twin
**Competition**: Techfest 2026-27, IIT Bombay — *Namma Space*  
**Duration**: 4 minutes 30 seconds (Within the 3 to 5-minute mandatory requirement)  
**Deliverable**: High-Definition MP4 Video in Round 1 Submission Drive  

---

## Storyboard Overview & Timeline

| Scene | Duration | Timecode | Focus Area |
|---|---|---|---|
| **Scene 1** | 0:40 | `0:00 – 0:40` | Hook, Problem Framing (IKEA/Corporate 2D vs 3D) & Project Vision |
| **Scene 2** | 0:50 | `0:40 – 1:30` | Live Field Capture SOP Demonstration with Smartphone |
| **Scene 3** | 1:00 | `1:30 – 2:30` | Automated Reconstruction Pipeline (SfM ➔ 3DGS ➔ Semantics ➔ QA) |
| **Scene 4** | 1:30 | `2:30 – 4:00` | Live Interactive 3D Web Viewer Walkthrough (WASD & Mouse Roaming) |
| **Scene 5** | 0:30 | `4:00 – 4:30` | Held-Out Quantitative Metrics, Agentic QA Gate & Round 2 Roadmap |

---

## Detailed Scene-by-Scene Script & Narration

### Scene 1: The Vision — Beyond Static Blueprints (`0:00 – 0:40`)
- **Visuals**:
  - Open with a split-screen: Left side shows a confusing, flat 2D blueprint of a complex building with tiny labels; Right side shows the smooth, photorealistic 3D digital twin rendered inside our web browser.
  - Cut to title card: **Namma Space — Autonomous 3D Digital Twin & Spatial Navigation Engine**.
- **Voiceover Narration**:
  > *"When you step into a sprawling retail space like IKEA or a massive corporate convention center, static 2D blueprints fail us. They don't give you visual landmarks, they don't capture everyday physical obstacles, and they certainly don't guide you naturally.*  
  > *Welcome to Namma Space. For Techfest 2026-27, our mission was to build a complete, end-to-end spatial engine that turns simple smartphone video captures into photorealistic, interactive 3D digital twins—accessible instantly via a zero-install web browser with fluid first-person navigation."*

---

### Scene 2: Standard Operating Procedure (SOP) in Action (`0:40 – 1:30`)
- **Visuals**:
  - Cut to footage of an operator holding a standard smartphone in an indoor room.
  - B-roll showing the smartphone camera interface with **AE/AF Lock** highlighted with an animated callout.
  - Animated top-down graphic illustrating the 3-tier trajectory:
    1. Outer perimeter loop walking along walls.
    2. Center cross-pass in a figure-8.
    3. Multi-altitude semi-orbits around furniture.
  - Show the operator maintaining smooth, steady 0.5 m/s pacing.
- **Voiceover Narration**:
  > *"It all begins with our rigorous Standard Operating Procedure. We don't rely on expensive LiDAR or specialized depth rigs. Using any consumer smartphone recorded in 4K, the crucial step is locking exposure and autofocus to prevent photometric radiance shifts.*  
  > *Our 3-tier trajectory protocol captures an outer perimeter loop at eye level with greater than 75% visual overlap, followed by an interior figure-8 cross-pass to eliminate geometric scale drift. For textureless white walls, our SOP enforces the 25% framing anchor rule—tracking skirting boards and door frames to guarantee robust SIFT keypoint matching."*

---

### Scene 3: The Reconstruction & Semantic Pipeline (`1:30 – 2:30`)
- **Visuals**:
  - Screen capture of the automated pipeline executing:
    - Blur filtering discarding low-variance frames (`Var < 100`).
    - COLMAP sparse 3D point cloud and camera frustums appearing in 3D space.
    - Fast-forward visualization of 3D Gaussian Splatting (`gsplat`) densifying from sparse points to a photorealistic room radiance field.
    - Overlay of Grounded-SAM-2 segmenting chairs, desks, sofas, and doors.
    - Semantic lifting highlighting Gaussians in distinct class colors.
- **Voiceover Narration**:
  > *"Once captured, our pipeline takes over automatically. First, Laplacian variance filters out any motion-blurred frames. Next, COLMAP Structure-from-Motion computes exact camera poses and sparse scene geometry.*  
  > *From these points, we optimize 3D Gaussian Splatting using gsplat. In under 30 minutes, millions of discrete anisotropic Gaussians converge to photorealistic visual quality.*  
  > *Next, we lift 2D intelligence into 3D. Using Grounded-SAM-2, we segment objects across video frames and project consensus votes back onto the Gaussians, while CLIP embeds semantic language vectors into each class. Our autonomous Agentic QA Supervisor then audits the run against strict held-out thresholds before authorizing release."*

---

### Scene 4: Live Zero-Install Web Viewer Walkthrough (`2:30 – 4:00`)
- **Visuals**:
  - Clean browser window opening `http://localhost:8000/index.html`.
  - Cursor clicks "Enter Walkthrough (WASD)". Pointer lock engages.
  - Live first-person movement: Walking through the room using WASD, looking around smoothly with mouse look.
  - Sprinting past the meeting area by holding Shift.
  - Showing eye-level height ($1.6\text{m}$) and demonstrating collision clamping at room walls.
  - Show the live **2D Minimap** in the bottom corner tracking the player's position and field-of-view cone in real time.
  - Click on the sidebar to jump directly to **Reception Desk**, then **Meeting Room A**, then **Sofa Lounge** with smooth camera interpolation.
  - Cycle through Shading Modes:
    1. **Photoreal RGB** (photorealistic textures).
    2. **Semantics** (chairs in purple, desks in amber, sofas in pink, walls in teal).
    3. **Depth** (viridis distance gradient from camera).
- **Voiceover Narration**:
  > *"Now, let's experience the primary deliverable for Round 1: our zero-install 3D Web Viewer.*  
  > *Judges and visitors don't need to install Python, run Docker, or download heavy desktop apps. Simply clicking the link opens an interactive WebGL digital twin running at a locked 60 frames per second.*  
  > *With standard PC gaming controls—WASD to walk, mouse to look around, and Shift to sprint—users experience fluid, full-freedom exploration. Our built-in collision engine keeps you comfortably grounded at a natural human eye level of 1.6 meters.*  
  > *In the top-right and sidebar, Points of Interest are indexed in real time. Selecting any destination teleports your viewpoint seamlessly. And with a single toggle, you can switch from photorealistic RGB rendering to our 3D semantic segmentation map, showing every recognized piece of furniture in the space, or view the depth gradient map."*

---

### Scene 5: Benchmark Results & Round 2 Roadmap (`4:00 – 4:30`)
- **Visuals**:
  - Graphic card displaying held-out test benchmarks:
    - **Held-Out Test PSNR: 28.93 dB**
    - **SSIM: 0.903**
    - **LPIPS: 0.058**
    - **Gaussians: 484,707**
    - **60 FPS browser rendering**
  - Preview schematic of 2D/3D navigation mesh and floor pathfinding arrows leading toward Round 2.
  - Closing logo slide with GitHub repository link and contact details.
- **Voiceover Narration**:
  > *"Our held-out evaluation on unseen test frames validates the fidelity of this pipeline: an outstanding 28.93 dB PSNR, 0.903 SSIM, and 0.058 LPIPS, rendering smoothly on standard consumer hardware.*  
  > *For Round 2, we are expanding this spatial foundation with dynamic A-star obstacle-avoidance pathfinding and real-time floor path ribbons, guiding users around physical furniture toward their destination.*  
  > *Thank you for watching, and see you in the digital twin!"*

---

## Recording & Production Guidelines

1. **Screen Capture Software**: Use **OBS Studio** configured to 1080p at 60 FPS, 12,000 kbps bitrate.
2. **Audio Setup**: Clear microphone voiceover with crisp delivery, normalized to -14 LUFS, with subtle low-volume ambient tech background music.
3. **Export Settings**: Format: `.mp4`, Codec: H.264 / AAC audio, File Size: ~150–250 MB.
