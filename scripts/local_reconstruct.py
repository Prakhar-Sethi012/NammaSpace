"""
local_reconstruct.py — Monocular 3D Spatial Reconstruction from Video Frames
=============================================================================
Performs Structure-from-Motion (SfM) feature matching, camera pose recovery,
and multi-view 3D point cloud triangulation directly on local hardware.
Outputs a 3D Gaussian Splatting compatible PLY file with positions, normals,
scales, rotations, opacities, and spherical harmonics DC color coefficients.
"""

import os
import sys
import glob
import json
import argparse
from pathlib import Path
import numpy as np
import cv2
import open3d as o3d
from plyfile import PlyData, PlyElement

# Ensure UTF-8 output
if sys.stdout.encoding.lower() != "utf-8":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass


def estimate_intrinsics(width: int, height: int, fov_deg: float = 65.0) -> np.ndarray:
    """Estimate pinhole camera intrinsic matrix K from image resolution."""
    focal = 0.5 * width / np.tan(np.deg2rad(fov_deg) / 2.0)
    K = np.array([
        [focal, 0.0, width / 2.0],
        [0.0, focal, height / 2.0],
        [0.0, 0.0, 1.0]
    ], dtype=np.float64)
    return K


def reconstruct_scene(
    frames_dir: str,
    output_ply: str,
    max_frames: int = 60,
    stride: int = 1
) -> dict:
    frames_path = Path(frames_dir)
    image_files = sorted(glob.glob(str(frames_path / "*.jpg")) + glob.glob(str(frames_path / "*.png")))
    if not image_files:
        raise FileNotFoundError(f"No image files found in {frames_dir}")

    # Subsample if necessary
    selected_files = image_files[::stride][:max_frames]
    num_frames = len(selected_files)
    print(f"[*] Processing {num_frames} frames from {frames_dir}...")

    # Read first image to determine resolution
    sample_img = cv2.imread(selected_files[0])
    h, w, _ = sample_img.shape
    K = estimate_intrinsics(w, h)
    print(f"[*] Estimated Camera Intrinsics K:\n    fx={K[0,0]:.1f}, fy={K[1,1]:.1f}, cx={K[0,2]:.1f}, cy={K[1,2]:.1f}")

    # Feature Extractor (SIFT with sensitive contrast threshold for indoor textures)
    try:
        detector = cv2.SIFT_create(nfeatures=6000, contrastThreshold=0.015, edgeThreshold=12)
        matcher = cv2.BFMatcher(cv2.NORM_L2, crossCheck=False)
        is_binary = False
    except Exception:
        detector = cv2.ORB_create(nfeatures=5000)
        matcher = cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=False)
        is_binary = True

    # Detect features on all frames
    keypoints_list = []
    descriptors_list = []
    images_rgb = []
    images_gray = []

    print("[*] Extracting multi-scale visual keypoints across all frames...")
    for idx, fpath in enumerate(selected_files):
        img_bgr = cv2.imread(fpath)
        img_rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)
        img_gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
        
        kp, desc = detector.detectAndCompute(img_gray, None)
        keypoints_list.append(kp)
        descriptors_list.append(desc)
        images_rgb.append(img_rgb)
        images_gray.append(img_gray)
        
        if (idx + 1) % 15 == 0 or (idx + 1) == num_frames:
            print(f"    Frame {idx + 1}/{num_frames}: {len(kp)} keypoints detected")

    all_points_3d = []
    all_colors = []
    camera_poses = [np.eye(4, dtype=np.float64)]  # First camera at origin

    # Sequential camera pose estimation
    current_pose = np.eye(4, dtype=np.float64)

    print("\n[*] Estimating camera trajectory and solving multi-baseline triangulation...")
    for i in range(len(selected_files) - 1):
        j = i + 1
        kp1, desc1 = keypoints_list[i], descriptors_list[i]
        kp2, desc2 = keypoints_list[j], descriptors_list[j]

        if desc1 is None or desc2 is None or len(kp1) < 20 or len(kp2) < 20:
            camera_poses.append(current_pose.copy())
            continue

        matches = matcher.knnMatch(desc1, desc2, k=2)
        good_matches = [m[0] for m in matches if len(m) == 2 and m[0].distance < 0.80 * m[1].distance]

        if len(good_matches) < 15:
            camera_poses.append(current_pose.copy())
            continue

        pts1 = np.float32([kp1[m.queryIdx].pt for m in good_matches])
        pts2 = np.float32([kp2[m.trainIdx].pt for m in good_matches])

        E, mask = cv2.findEssentialMat(pts1, pts2, K, method=cv2.RANSAC, prob=0.999, threshold=1.2)
        if E is None or mask is None:
            camera_poses.append(current_pose.copy())
            continue

        mask = mask.ravel() == 1
        pts1_inliers = pts1[mask]
        pts2_inliers = pts2[mask]

        if len(pts1_inliers) < 10:
            camera_poses.append(current_pose.copy())
            continue

        _, R_rel, t_rel, _ = cv2.recoverPose(E, pts1_inliers, pts2_inliers, K)

        T_rel = np.eye(4, dtype=np.float64)
        T_rel[:3, :3] = R_rel
        T_rel[:3, 3] = t_rel.ravel() * 0.30
        current_pose = current_pose @ np.linalg.inv(T_rel)
        camera_poses.append(current_pose.copy())

    # Multi-baseline triangulation across steps [1, 2, 3, 5]
    print("[*] Performing multi-baseline triangulation & dense optical flow reprojection...")
    for step in [1, 2, 3, 4]:
        for i in range(0, len(selected_files) - step, 1):
            j = i + step
            if i >= len(camera_poses) or j >= len(camera_poses):
                continue

            kp1, desc1 = keypoints_list[i], descriptors_list[i]
            kp2, desc2 = keypoints_list[j], descriptors_list[j]
            if desc1 is None or desc2 is None or len(kp1) < 20 or len(kp2) < 20:
                continue

            matches = matcher.knnMatch(desc1, desc2, k=2)
            good_matches = [m[0] for m in matches if len(m) == 2 and m[0].distance < 0.82 * m[1].distance]
            if len(good_matches) < 10:
                continue

            pts1 = np.float32([kp1[m.queryIdx].pt for m in good_matches])
            pts2 = np.float32([kp2[m.trainIdx].pt for m in good_matches])

            P1 = K @ np.linalg.inv(camera_poses[i])[:3, :]
            P2 = K @ np.linalg.inv(camera_poses[j])[:3, :]

            pts4d = cv2.triangulatePoints(P1, P2, pts1.T, pts2.T)
            pts3d = pts4d[:3, :] / np.maximum(pts4d[3, :], 1e-7)
            pts3d = pts3d.T

            for idx_pt, pt2d in enumerate(pts1):
                p3d = pts3d[idx_pt]
                if np.linalg.norm(p3d) < 30.0 and np.isfinite(p3d).all():
                    px, py = int(np.clip(pt2d[0], 0, w - 1)), int(np.clip(pt2d[1], 0, h - 1))
                    col = images_rgb[i][py, px] / 255.0
                    all_points_3d.append(p3d)
                    all_colors.append(col)

            # Dense optical flow sampling for keyframes every 4th frame
            if step == 2 and i % 4 == 0:
                flow = cv2.calcOpticalFlowFarneback(
                    images_gray[i], images_gray[j], None, 0.5, 3, 15, 3, 5, 1.2, 0
                )
                # Sample grid every 12 pixels
                y_coords, x_coords = np.mgrid[15:h-15:12, 15:w-15:12].reshape(2, -1)
                dx = flow[y_coords, x_coords, 0]
                dy = flow[y_coords, x_coords, 1]
                mag = np.hypot(dx, dy)
                valid_mask = (mag > 0.5) & (mag < 40.0)

                if np.any(valid_mask):
                    src_pts = np.vstack([x_coords[valid_mask], y_coords[valid_mask]]).T
                    dst_pts = src_pts + np.vstack([dx[valid_mask], dy[valid_mask]]).T

                    try:
                        src_pts_f = np.float32(src_pts)
                        dst_pts_f = np.float32(dst_pts)
                        flow4d = cv2.triangulatePoints(P1, P2, src_pts_f.T, dst_pts_f.T)
                        flow3d = flow4d[:3, :] / np.maximum(flow4d[3, :], 1e-7)
                        flow3d = flow3d.T

                        for k, s_pt in enumerate(src_pts):
                            p3 = flow3d[k]
                            if np.linalg.norm(p3) < 20.0 and np.isfinite(p3).all():
                                px, py = int(s_pt[0]), int(s_pt[1])
                                col = images_rgb[i][py, px] / 255.0
                                all_points_3d.append(p3)
                                all_colors.append(col)
                    except Exception:
                        pass

    if not all_points_3d:
        raise RuntimeError("Reconstruction produced 0 triangulated points. Check camera overlap.")

    pts_arr = np.array(all_points_3d, dtype=np.float32)
    col_arr = np.array(all_colors, dtype=np.float32)
    print(f"\n[*] Raw Triangulated Points: {len(pts_arr):,}")

    # Statistical Outlier Removal via Open3D
    pcd = o3d.geometry.PointCloud()
    pcd.points = o3d.utility.Vector3dVector(pts_arr)
    pcd.colors = o3d.utility.Vector3dVector(col_arr)

    cl, ind = pcd.remove_statistical_outlier(nb_neighbors=25, std_ratio=1.8)
    pcd_clean = pcd.select_by_index(ind)

    # Optional voxel downsampling / uniform grid balance
    pcd_clean = pcd_clean.voxel_down_sample(voxel_size=0.015)
    clean_pts = np.asarray(pcd_clean.points, dtype=np.float32)
    clean_col = np.asarray(pcd_clean.colors, dtype=np.float32)

    total_gaussians = len(clean_pts)
    print(f"[*] Filtered & Cleaned Gaussians: {total_gaussians:,}")

    # Center and scale within standard room viewing coordinates
    center = clean_pts.mean(axis=0)
    clean_pts = clean_pts - center
    # Scale to ~8m bounding box
    max_extent = np.abs(clean_pts).max()
    if max_extent > 0:
        scale_factor = 4.0 / max_extent
        clean_pts = clean_pts * scale_factor

    # Construct 3D Gaussian Splatting compatible PLY elements
    # Fields: x, y, z, scale_0..2, rot_0..3, opacity, f_dc_0..2
    SH_C0 = 0.28209479177387814
    f_dc = (clean_col - 0.5) / SH_C0

    # Gaussian attributes
    scale_val = np.log(0.02)  # Log scale ~0.02m
    scales = np.full((total_gaussians, 3), scale_val, dtype=np.float32)
    
    # Identity rotation quaternions: [1, 0, 0, 0]
    quaternions = np.zeros((total_gaussians, 4), dtype=np.float32)
    quaternions[:, 0] = 1.0  # w = 1.0

    # High initial opacity logit: sigmoid(2.5) ~ 0.92
    opacities = np.full((total_gaussians, 1), 2.5, dtype=np.float32)

    vertex_dtype = [
        ('x', 'f4'), ('y', 'f4'), ('z', 'f4'),
        ('scale_0', 'f4'), ('scale_1', 'f4'), ('scale_2', 'f4'),
        ('rot_0', 'f4'), ('rot_1', 'f4'), ('rot_2', 'f4'), ('rot_3', 'f4'),
        ('opacity', 'f4'),
        ('f_dc_0', 'f4'), ('f_dc_1', 'f4'), ('f_dc_2', 'f4')
    ]

    structured_array = np.zeros(total_gaussians, dtype=vertex_dtype)
    structured_array['x'] = clean_pts[:, 0]
    structured_array['y'] = clean_pts[:, 1]
    structured_array['z'] = clean_pts[:, 2]
    structured_array['scale_0'] = scales[:, 0]
    structured_array['scale_1'] = scales[:, 1]
    structured_array['scale_2'] = scales[:, 2]
    structured_array['rot_0'] = quaternions[:, 0]
    structured_array['rot_1'] = quaternions[:, 1]
    structured_array['rot_2'] = quaternions[:, 2]
    structured_array['rot_3'] = quaternions[:, 3]
    structured_array['opacity'] = opacities[:, 0]
    structured_array['f_dc_0'] = f_dc[:, 0]
    structured_array['f_dc_1'] = f_dc[:, 1]
    structured_array['f_dc_2'] = f_dc[:, 2]

    ply_el = PlyElement.describe(structured_array, 'vertex')
    
    out_path = Path(output_ply)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    PlyData([ply_el], text=False).write(str(out_path))

    print(f"\n[✓] 3DGS Reconstructed PLY written to: {out_path} ({out_path.stat().st_size:,} bytes)")

    summary = {
        "frames_processed": num_frames,
        "triangulated_points": len(pts_arr),
        "cleaned_gaussians": total_gaussians,
        "output_ply": str(out_path),
        "bounding_box_min": clean_pts.min(axis=0).tolist(),
        "bounding_box_max": clean_pts.max(axis=0).tolist()
    }
    return summary


def main():
    parser = argparse.ArgumentParser(description="Monocular 3D Reconstruction")
    parser.add_argument("--frames_dir", type=str, required=True, help="Directory containing extracted video frames")
    parser.add_argument("--output_ply", type=str, required=True, help="Target .ply file output")
    parser.add_argument("--max_frames", type=int, default=60, help="Maximum frames to process")
    parser.add_argument("--stride", type=int, default=1, help="Frame stride")
    args = parser.parse_args()

    reconstruct_scene(args.frames_dir, args.output_ply, args.max_frames, args.stride)


if __name__ == "__main__":
    main()
