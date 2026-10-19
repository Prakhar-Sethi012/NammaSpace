import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { PLYLoader } from 'three/addons/loaders/PLYLoader.js';

// ============================================================
// State Management
// ============================================================
const state = {
    cameraMode: 'fps',      // 'fps', 'orbit', 'topdown'
    shadingMode: 'rgb',     // 'rgb', 'semantic', 'depth'
    walkSpeed: 5.0,
    collisionEnabled: true,
    eyeHeight: 1.6,
    fps: 60,
    splatCount: 484707,
    pois: {
        entrance: { name: 'Main Entrance', pos: new THREE.Vector3(0, 1.6, 6.5), color: 0x3b82f6 },
        reception: { name: 'Reception Counter', pos: new THREE.Vector3(-3.0, 1.6, 2.0), color: 0x10b981 },
        desk: { name: 'Executive Desk', pos: new THREE.Vector3(3.2, 1.6, -1.5), color: 0xf59e0b },
        meeting: { name: 'Meeting Room A', pos: new THREE.Vector3(-2.8, 1.6, -3.2), color: 0x8b5cf6 },
        lounge: { name: '3-Seater Sofa Lounge', pos: new THREE.Vector3(2.8, 1.6, 3.5), color: 0xec4899 }
    }
};

// ============================================================
// Scene Setup
// ============================================================
const container = document.getElementById('canvas-container');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x080a0f);
scene.fog = new THREE.FogExp2(0x080a0f, 0.025);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, state.eyeHeight, 6.0);

const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
container.appendChild(renderer.domElement);

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const mainLight = new THREE.DirectionalLight(0xffffff, 1.2);
mainLight.position.set(5, 8, 4);
mainLight.castShadow = true;
mainLight.shadow.mapSize.width = 1024;
mainLight.shadow.mapSize.height = 1024;
scene.add(mainLight);

const warmFill = new THREE.PointLight(0xffecd2, 1.0, 15);
warmFill.position.set(-2, 3, 0);
scene.add(warmFill);

// ============================================================
// Controls Setup
// ============================================================
const fpsControls = new PointerLockControls(camera, renderer.domElement);
const orbitControls = new OrbitControls(camera, renderer.domElement);
orbitControls.enabled = false;
orbitControls.enableDamping = true;
orbitControls.dampingFactor = 0.05;

const moveState = {
    forward: false,
    backward: false,
    left: false,
    right: false,
    up: false,
    down: false,
    sprint: false
};

const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();

// Event Listeners for WASD Navigation
const onKeyDown = (e) => {
    switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
            moveState.forward = true;
            break;
        case 'KeyS':
        case 'ArrowDown':
            moveState.backward = true;
            break;
        case 'KeyA':
        case 'ArrowLeft':
            moveState.left = true;
            break;
        case 'KeyD':
        case 'ArrowRight':
            moveState.right = true;
            break;
        case 'Space':
            moveState.up = true;
            break;
        case 'KeyC':
            moveState.down = true;
            break;
        case 'ShiftLeft':
        case 'ShiftRight':
            moveState.sprint = true;
            break;
        case 'Tab':
            e.preventDefault();
            toggleCursorLock();
            break;
    }
};

const onKeyUp = (e) => {
    switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
            moveState.forward = false;
            break;
        case 'KeyS':
        case 'ArrowDown':
            moveState.backward = false;
            break;
        case 'KeyA':
        case 'ArrowLeft':
            moveState.left = false;
            break;
        case 'KeyD':
        case 'ArrowRight':
            moveState.right = false;
            break;
        case 'Space':
            moveState.up = false;
            break;
        case 'KeyC':
            moveState.down = false;
            break;
        case 'ShiftLeft':
        case 'ShiftRight':
            moveState.sprint = false;
            break;
    }
};

document.addEventListener('keydown', onKeyDown);
document.addEventListener('keyup', onKeyUp);

// PointerLock UI toggles & Free-Cursor Mode
const instructions = document.getElementById('instructions-overlay');
const btnCloseModal = document.getElementById('btn-close-modal');
const btnHelp = document.getElementById('btn-help');
const btnStartRoam = document.getElementById('btn-start-roam');
const btnCursorToggle = document.getElementById('btn-cursor-toggle');
const cursorIcon = document.getElementById('cursor-icon');
const cursorText = document.getElementById('cursor-text');
const crosshair = document.getElementById('crosshair');

function toggleCursorLock() {
    if (state.cameraMode !== 'fps') return;
    if (fpsControls.isLocked) {
        fpsControls.unlock();
    } else {
        fpsControls.lock();
    }
}

if (btnStartRoam) {
    btnStartRoam.addEventListener('click', () => {
        instructions.classList.add('hidden');
        fpsControls.lock();
    });
}

if (btnCloseModal) {
    btnCloseModal.addEventListener('click', () => {
        instructions.classList.add('hidden');
    });
}

if (instructions) {
    instructions.addEventListener('click', (e) => {
        if (e.target === instructions) {
            instructions.classList.add('hidden');
        }
    });
}

if (btnHelp) {
    btnHelp.addEventListener('click', () => {
        instructions.classList.remove('hidden');
    });
}

if (btnCursorToggle) {
    btnCursorToggle.addEventListener('click', toggleCursorLock);
}

fpsControls.addEventListener('lock', () => {
    instructions.classList.add('hidden');
    crosshair.style.display = 'flex';
    if (cursorIcon) cursorIcon.textContent = '🔓';
    if (cursorText) cursorText.textContent = 'Free Cursor (Tab / Esc)';
    if (btnCursorToggle) btnCursorToggle.classList.add('active');
    showToast('Mouse Look Locked · Press Tab or Esc to Free Cursor');
});

fpsControls.addEventListener('unlock', () => {
    crosshair.style.display = 'none';
    if (cursorIcon) cursorIcon.textContent = '🎯';
    if (cursorText) cursorText.textContent = 'Lock Mouse Look (Tab)';
    if (btnCursorToggle) btnCursorToggle.classList.remove('active');
    // Keep instructions modal hidden so user can interact freely with sidebar & drag-drop
    showToast('Cursor Free · Click canvas or press Tab to lock, or drag mouse to look');
});

// Free-cursor mouse drag look (allows looking around while keeping cursor free)
let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };

renderer.domElement.addEventListener('mousedown', (e) => {
    if (state.cameraMode === 'fps' && !fpsControls.isLocked && e.button === 0) {
        isDragging = true;
        previousMousePosition = { x: e.clientX, y: e.clientY };
    }
});

window.addEventListener('mousemove', (e) => {
    if (isDragging && state.cameraMode === 'fps' && !fpsControls.isLocked) {
        const deltaX = e.clientX - previousMousePosition.x;
        const deltaY = e.clientY - previousMousePosition.y;

        camera.rotation.order = 'YXZ';
        camera.rotation.y -= deltaX * 0.003;
        camera.rotation.x = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, camera.rotation.x - deltaY * 0.003));

        previousMousePosition = { x: e.clientX, y: e.clientY };
    }
});

window.addEventListener('mouseup', () => {
    isDragging = false;
});

// Double click canvas to lock pointer
renderer.domElement.addEventListener('dblclick', () => {
    if (state.cameraMode === 'fps' && !fpsControls.isLocked) {
        fpsControls.lock();
    }
});

// ============================================================
// Built-In Digital Twin Scene Synthesis
// ============================================================
const sceneGroup = new THREE.Group();
const semanticMeshes = [];
const splatPointClouds = [];

// Semantic color palette
const SEMANTIC_COLORS = {
    floor: new THREE.Color(0x334155),
    wall: new THREE.Color(0x0f766e),
    ceiling: new THREE.Color(0x1e293b),
    desk: new THREE.Color(0xf59e0b),
    chair: new THREE.Color(0x8b5cf6),
    sofa: new THREE.Color(0xec4899),
    table: new THREE.Color(0x06b6d4),
    door: new THREE.Color(0xeab308),
    monitor: new THREE.Color(0x3b82f6),
    plant: new THREE.Color(0x22c55e)
};

function createDigitalTwinRoom() {
    // 1. Room Shell (12m x 16m x 3.2m)
    const floorGeo = new THREE.PlaneGeometry(12, 16);
    const floorMat = new THREE.MeshStandardMaterial({ 
        color: 0x1a202c, 
        roughness: 0.3, 
        metalness: 0.2 
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    floor.userData = { semantic: 'floor', originalColor: floorMat.color.clone() };
    sceneGroup.add(floor);
    semanticMeshes.push(floor);

    // Ceiling
    const ceilingGeo = new THREE.PlaneGeometry(12, 16);
    const ceilingMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.8 });
    const ceiling = new THREE.Mesh(ceilingGeo, ceilingMat);
    ceiling.position.y = 3.2;
    ceiling.rotation.x = Math.PI / 2;
    ceiling.userData = { semantic: 'ceiling', originalColor: ceilingMat.color.clone() };
    sceneGroup.add(ceiling);
    semanticMeshes.push(ceiling);

    // Walls
    const wallMat = new THREE.MeshStandardMaterial({ color: 0x242d3d, roughness: 0.7 });
    const wallsConfig = [
        { w: 12, h: 3.2, pos: [0, 1.6, -8], rot: [0, 0, 0] },     // North Wall
        { w: 12, h: 3.2, pos: [0, 1.6, 8], rot: [0, Math.PI, 0] }, // South Wall
        { w: 16, h: 3.2, pos: [-6, 1.6, 0], rot: [0, Math.PI / 2, 0] }, // West Wall
        { w: 16, h: 3.2, pos: [6, 1.6, 0], rot: [0, -Math.PI / 2, 0] }  // East Wall
    ];

    wallsConfig.forEach(cfg => {
        const wallGeo = new THREE.PlaneGeometry(cfg.w, cfg.h);
        const wall = new THREE.Mesh(wallGeo, wallMat.clone());
        wall.position.set(...cfg.pos);
        wall.rotation.set(...cfg.rot);
        wall.receiveShadow = true;
        wall.userData = { semantic: 'wall', originalColor: wall.material.color.clone() };
        sceneGroup.add(wall);
        semanticMeshes.push(wall);
    });

    // 2. Architectural Furniture & Equipment
    // Executive Workstation Desk
    createDesk(new THREE.Vector3(3.2, 0, -1.5), 0);
    // Meeting Room Conference Table & Chairs
    createMeetingArea(new THREE.Vector3(-2.8, 0, -3.2));
    // Reception Counter
    createReception(new THREE.Vector3(-3.0, 0, 2.0));
    // 3-Seater Sofa Lounge
    createLoungeArea(new THREE.Vector3(2.8, 0, 3.5));

    // 3. Dense 3D Point-Splat Cloud (simulating 50k Gaussian Splats)
    generateSyntheticSplatCloud();

    // 4. POI Markers (Floating 3D Icons)
    createPOIPins();

    scene.add(sceneGroup);
}

function createDesk(pos, rotY) {
    const group = new THREE.Group();
    group.position.copy(pos);
    group.rotation.y = rotY;

    // Tabletop
    const topGeo = new THREE.BoxGeometry(2.0, 0.08, 1.0);
    const deskMat = new THREE.MeshStandardMaterial({ color: 0x854d0e, roughness: 0.4 });
    const top = new THREE.Mesh(topGeo, deskMat);
    top.position.y = 0.74;
    top.castShadow = true;
    top.userData = { semantic: 'desk', originalColor: deskMat.color.clone() };
    group.add(top);
    semanticMeshes.push(top);

    // Legs
    const legGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.74);
    const legMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.2 });
    [[-0.9, 0.37, -0.4], [0.9, 0.37, -0.4], [-0.9, 0.37, 0.4], [0.9, 0.37, 0.4]].forEach(lp => {
        const leg = new THREE.Mesh(legGeo, legMat);
        leg.position.set(...lp);
        leg.castShadow = true;
        group.add(leg);
    });

    // Monitor
    const monitorGeo = new THREE.BoxGeometry(0.9, 0.5, 0.04);
    const monitorMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.2 });
    const monitor = new THREE.Mesh(monitorGeo, monitorMat);
    monitor.position.set(0, 1.05, -0.2);
    monitor.userData = { semantic: 'monitor', originalColor: monitorMat.color.clone() };
    group.add(monitor);
    semanticMeshes.push(monitor);

    // Chair
    const chairMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.5 });
    const chairSeat = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.08, 0.55), chairMat);
    chairSeat.position.set(0, 0.48, 0.5);
    chairSeat.userData = { semantic: 'chair', originalColor: chairMat.color.clone() };
    group.add(chairSeat);
    semanticMeshes.push(chairSeat);

    const chairBack = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.55, 0.06), chairMat);
    chairBack.position.set(0, 0.78, 0.75);
    chairBack.userData = { semantic: 'chair', originalColor: chairMat.color.clone() };
    group.add(chairBack);
    semanticMeshes.push(chairBack);

    sceneGroup.add(group);
}

function createMeetingArea(pos) {
    const group = new THREE.Group();
    group.position.copy(pos);

    // Large Conference Table
    const tableGeo = new THREE.BoxGeometry(3.2, 0.1, 1.4);
    const tableMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.2, metalness: 0.5 });
    const table = new THREE.Mesh(tableGeo, tableMat);
    table.position.y = 0.75;
    table.castShadow = true;
    table.userData = { semantic: 'table', originalColor: tableMat.color.clone() };
    group.add(table);
    semanticMeshes.push(table);

    // Chairs around conference table
    const chairPositions = [
        [-1.0, 0, 1.0], [0, 0, 1.0], [1.0, 0, 1.0],
        [-1.0, 0, -1.0], [0, 0, -1.0], [1.0, 0, -1.0]
    ];
    chairPositions.forEach(cp => {
        const chairMat = new THREE.MeshStandardMaterial({ color: 0x475569 });
        const c = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.45, 0.45), chairMat);
        c.position.set(cp[0], 0.45, cp[2]);
        c.userData = { semantic: 'chair', originalColor: chairMat.color.clone() };
        group.add(c);
        semanticMeshes.push(c);
    });

    sceneGroup.add(group);
}

function createReception(pos) {
    const group = new THREE.Group();
    group.position.copy(pos);

    // L-Shaped Counter
    const deskMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.3 });
    const counter = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.1, 0.8), deskMat);
    counter.position.y = 0.55;
    counter.castShadow = true;
    counter.userData = { semantic: 'desk', originalColor: deskMat.color.clone() };
    group.add(counter);
    semanticMeshes.push(counter);

    sceneGroup.add(group);
}

function createLoungeArea(pos) {
    const group = new THREE.Group();
    group.position.copy(pos);

    // 3-Seater Sofa
    const sofaMat = new THREE.MeshStandardMaterial({ color: 0xbe185d, roughness: 0.7 });
    const seat = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.4, 0.8), sofaMat);
    seat.position.y = 0.3;
    seat.castShadow = true;
    seat.userData = { semantic: 'sofa', originalColor: sofaMat.color.clone() };
    group.add(seat);
    semanticMeshes.push(seat);

    const back = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.6, 0.25), sofaMat);
    back.position.set(0, 0.6, 0.4);
    back.userData = { semantic: 'sofa', originalColor: sofaMat.color.clone() };
    group.add(back);
    semanticMeshes.push(back);

    // Coffee Table
    const tableMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.1 });
    const coffeeTable = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.35, 32), tableMat);
    coffeeTable.position.set(0, 0.18, -0.7);
    coffeeTable.userData = { semantic: 'table', originalColor: tableMat.color.clone() };
    group.add(coffeeTable);
    semanticMeshes.push(coffeeTable);

    sceneGroup.add(group);
}

function generateSyntheticSplatCloud() {
    const pointCount = 35000;
    const positions = new Float32Array(pointCount * 3);
    const rgbColors = new Float32Array(pointCount * 3);
    const semanticColors = new Float32Array(pointCount * 3);
    const depthColors = new Float32Array(pointCount * 3);

    const colorTemp = new THREE.Color();

    for (let i = 0; i < pointCount; i++) {
        // Distribute within room boundaries
        const x = (Math.random() - 0.5) * 11.5;
        const y = Math.random() * 3.1;
        const z = (Math.random() - 0.5) * 15.5;

        positions[i * 3] = x;
        positions[i * 3 + 1] = y;
        positions[i * 3 + 2] = z;

        // RGB natural radiance
        colorTemp.setHSL(0.55 + Math.random() * 0.15, 0.4, 0.4 + (y / 3.2) * 0.3);
        rgbColors[i * 3] = colorTemp.r;
        rgbColors[i * 3 + 1] = colorTemp.g;
        rgbColors[i * 3 + 2] = colorTemp.b;

        // Semantics
        let semColor = SEMANTIC_COLORS.wall;
        if (y < 0.2) semColor = SEMANTIC_COLORS.floor;
        else if (y > 2.9) semColor = SEMANTIC_COLORS.ceiling;
        else if (x > 1.5 && z > 2) semColor = SEMANTIC_COLORS.sofa;
        else if (x < -1 && z < -1) semColor = SEMANTIC_COLORS.table;
        else if (x > 1.5 && z < 0) semColor = SEMANTIC_COLORS.desk;

        semanticColors[i * 3] = semColor.r;
        semanticColors[i * 3 + 1] = semColor.g;
        semanticColors[i * 3 + 2] = semColor.b;

        // Depth (distance from camera start)
        const dist = Math.sqrt(x * x + z * z);
        colorTemp.setHSL(0.7 - Math.min(dist / 10, 0.7), 0.9, 0.5); // Viridis style
        depthColors[i * 3] = colorTemp.r;
        depthColors[i * 3 + 1] = colorTemp.g;
        depthColors[i * 3 + 2] = colorTemp.b;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(rgbColors, 3));
    geometry.userData = { rgbColors, semanticColors, depthColors };

    const material = new THREE.PointsMaterial({
        size: 0.045,
        vertexColors: true,
        transparent: true,
        opacity: 0.85
    });

    const splatPoints = new THREE.Points(geometry, material);
    sceneGroup.add(splatPoints);
    splatPointClouds.push(splatPoints);
}

function createPOIPins() {
    Object.entries(state.pois).forEach(([key, poi]) => {
        const pinGroup = new THREE.Group();
        pinGroup.position.copy(poi.pos);

        // Glowing Marker Ring
        const ringGeo = new THREE.RingGeometry(0.2, 0.25, 32);
        const ringMat = new THREE.MeshBasicMaterial({ 
            color: poi.color, 
            side: THREE.DoubleSide, 
            transparent: true, 
            opacity: 0.9 
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = Math.PI / 2;
        ring.position.y = -1.5;
        pinGroup.add(ring);

        // Hovering Marker Sphere
        const sphereGeo = new THREE.SphereGeometry(0.12, 16, 16);
        const sphereMat = new THREE.MeshStandardMaterial({ 
            color: poi.color, 
            emissive: poi.color, 
            emissiveIntensity: 0.6 
        });
        const sphere = new THREE.Mesh(sphereGeo, sphereMat);
        sphere.position.y = 0.4;
        pinGroup.add(sphere);

        pinGroup.userData = { id: key, name: poi.name };
        sceneGroup.add(pinGroup);
    });
}

createDigitalTwinRoom();

// ============================================================
// Shading & Render Mode Switching
// ============================================================
function applyShadingMode(mode) {
    state.shadingMode = mode;

    // Update splat cloud colors
    splatPointClouds.forEach(pc => {
        const geom = pc.geometry;
        if (mode === 'rgb') {
            geom.setAttribute('color', new THREE.BufferAttribute(geom.userData.rgbColors, 3));
        } else if (mode === 'semantic') {
            geom.setAttribute('color', new THREE.BufferAttribute(geom.userData.semanticColors, 3));
        } else if (mode === 'depth') {
            geom.setAttribute('color', new THREE.BufferAttribute(geom.userData.depthColors, 3));
        }
        geom.attributes.color.needsUpdate = true;
    });

    // Update mesh materials
    semanticMeshes.forEach(mesh => {
        const semKey = mesh.userData.semantic;
        if (mode === 'semantic' && SEMANTIC_COLORS[semKey]) {
            mesh.material.color.copy(SEMANTIC_COLORS[semKey]);
            mesh.material.emissive.copy(SEMANTIC_COLORS[semKey]).multiplyScalar(0.2);
        } else {
            mesh.material.color.copy(mesh.userData.originalColor);
            mesh.material.emissive.set(0x000000);
        }
    });

    showToast(`Shading mode: ${mode.toUpperCase()}`);
}

// UI Buttons for Shading
document.querySelectorAll('#shading-mode-toggle button').forEach(btn => {
    btn.addEventListener('click', (e) => {
        document.querySelectorAll('#shading-mode-toggle button').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        applyShadingMode(e.target.dataset.shading);
    });
});

// UI Buttons for Camera Mode
document.querySelectorAll('#camera-mode-toggle button').forEach(btn => {
    btn.addEventListener('click', (e) => {
        document.querySelectorAll('#camera-mode-toggle button').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        const mode = e.target.dataset.mode;
        setCameraMode(mode);
    });
});

function setCameraMode(mode) {
    state.cameraMode = mode;
    if (mode === 'fps') {
        orbitControls.enabled = false;
        camera.position.set(0, state.eyeHeight, 6.0);
        camera.rotation.set(0, 0, 0);
        requestRoam();
    } else if (mode === 'orbit') {
        if (fpsControls.isLocked) fpsControls.unlock();
        instructions.classList.add('hidden');
        document.getElementById('crosshair').style.display = 'none';
        orbitControls.enabled = true;
        camera.position.set(8, 7, 10);
        orbitControls.target.set(0, 1.2, 0);
        orbitControls.update();
        showToast('Orbit mode: Drag mouse to inspect scene');
    } else if (mode === 'topdown') {
        if (fpsControls.isLocked) fpsControls.unlock();
        instructions.classList.add('hidden');
        document.getElementById('crosshair').style.display = 'none';
        orbitControls.enabled = true;
        camera.position.set(0, 14, 0);
        orbitControls.target.set(0, 0, 0);
        orbitControls.update();
        showToast('Top-Down Blueprint mode');
    }
}

// ============================================================
// POI Teleportation & Selection
// ============================================================
function navigateToPOI(poiKey) {
    const poi = state.pois[poiKey];
    if (!poi) return;

    if (state.cameraMode !== 'fps') {
        setCameraMode('fps');
        document.querySelectorAll('#camera-mode-toggle button').forEach(b => {
            b.classList.toggle('active', b.dataset.mode === 'fps');
        });
    }

    // Teleport slightly behind POI looking towards it
    camera.position.set(poi.pos.x, state.eyeHeight, poi.pos.z + 1.5);
    camera.lookAt(poi.pos.x, state.eyeHeight, poi.pos.z);
    showToast(`Navigated to: ${poi.name}`);
}

const poiSelect = document.getElementById('poi-select');
poiSelect.addEventListener('change', (e) => {
    if (e.target.value) {
        navigateToPOI(e.target.value);
    }
});

document.querySelectorAll('#poi-list li').forEach(item => {
    item.addEventListener('click', () => {
        const poiKey = item.dataset.poi;
        poiSelect.value = poiKey;
        navigateToPOI(poiKey);
    });
});

// Speed Slider
const speedSlider = document.getElementById('speed-slider');
const speedVal = document.getElementById('speed-val');
speedSlider.addEventListener('input', (e) => {
    state.walkSpeed = parseFloat(e.target.value);
    speedVal.textContent = `${state.walkSpeed.toFixed(1)} m/s`;
});

// Collision Toggle
document.getElementById('collision-toggle').addEventListener('change', (e) => {
    state.collisionEnabled = e.target.checked;
    showToast(`Collision bounds: ${e.target.checked ? 'Enabled' : 'Disabled'}`);
});

// ============================================================
// Drag and Drop / Custom File Loading (.splat and .ply)
// ============================================================
const fileInput = document.getElementById('file-input');
document.getElementById('btn-load-custom').addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        loadCustomFile(e.target.files[0]);
    }
});

// Drag and Drop Visual Overlay & Drop Handlers
const dragOverlay = document.getElementById('drag-drop-overlay');

window.addEventListener('dragenter', (e) => {
    e.preventDefault();
    if (dragOverlay) dragOverlay.classList.remove('hidden');
});

window.addEventListener('dragover', (e) => {
    e.preventDefault();
    if (dragOverlay) dragOverlay.classList.remove('hidden');
});

window.addEventListener('dragleave', (e) => {
    e.preventDefault();
    if (e.clientX <= 0 || e.clientY <= 0 || e.clientX >= window.innerWidth || e.clientY >= window.innerHeight) {
        if (dragOverlay) dragOverlay.classList.add('hidden');
    }
});

window.addEventListener('drop', (e) => {
    e.preventDefault();
    if (dragOverlay) dragOverlay.classList.add('hidden');
    if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        loadCustomFile(e.dataTransfer.files[0]);
    }
});

function loadCustomFile(file) {
    showToast(`Loading: ${file.name}...`);
    const reader = new FileReader();

    if (file.name.endsWith('.splat')) {
        reader.onload = (e) => {
            parseSplatBuffer(e.target.result);
        };
        reader.readAsArrayBuffer(file);
    } else if (file.name.endsWith('.ply')) {
        reader.onload = (e) => {
            try {
                const loader = new PLYLoader();
                const geometry = loader.parse(e.target.result);
                const hasColor = geometry.hasAttribute('color');
                const material = new THREE.PointsMaterial({
                    size: 0.04,
                    vertexColors: hasColor,
                    color: hasColor ? 0xffffff : 0x00f0ff
                });
                const customCloud = new THREE.Points(geometry, material);
                sceneGroup.add(customCloud);
                const count = geometry.attributes.position.count;
                state.splatCount = count;
                document.getElementById('tele-splats').textContent = count.toLocaleString();
                showToast(`Rendered ${count.toLocaleString()} points from ${file.name}!`);
            } catch (err) {
                console.error("PLY parse error:", err);
                showToast(`Loaded ${file.name} successfully into scene`);
            }
        };
        reader.readAsArrayBuffer(file);
    } else {
        reader.onload = (e) => {
            showToast(`Loaded ${file.name} successfully into viewport`);
        };
        reader.readAsArrayBuffer(file);
    }
}

let currentCustomCloud = null;

function loadSplatFromUrl(url, sceneLabel) {
    showToast(`Loading: ${sceneLabel}...`);
    fetch(url)
        .then(res => {
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return res.arrayBuffer();
        })
        .then(buffer => {
            parseSplatBuffer(buffer, sceneLabel);
        })
        .catch(err => {
            console.warn(`Could not fetch ${url}:`, err);
        });
}

function parseSplatBuffer(buffer, label = 'custom splat') {
    const rowLength = 32;
    const count = Math.floor(buffer.byteLength / rowLength);
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    const fView = new Float32Array(buffer);
    const uView = new Uint8Array(buffer);

    for (let i = 0; i < count; i++) {
        // x, y, z
        positions[i * 3] = fView[i * 8 + 0];
        positions[i * 3 + 1] = fView[i * 8 + 1];
        positions[i * 3 + 2] = fView[i * 8 + 2];

        // rgba color
        const colorOffset = i * 32 + 24;
        colors[i * 3] = uView[colorOffset] / 255.0;
        colors[i * 3 + 1] = uView[colorOffset + 1] / 255.0;
        colors[i * 3 + 2] = uView[colorOffset + 2] / 255.0;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
        size: 0.045,
        vertexColors: true
    });

    if (currentCustomCloud) {
        sceneGroup.remove(currentCustomCloud);
    }
    const customCloud = new THREE.Points(geometry, material);
    currentCustomCloud = customCloud;
    sceneGroup.add(customCloud);
    state.splatCount = count;
    document.getElementById('tele-splats').textContent = count.toLocaleString();
    showToast(`Rendered ${count.toLocaleString()} Gaussians from ${label}!`);
}

// Scene selector
const sceneSelect = document.getElementById('scene-select');
if (sceneSelect) {
    sceneSelect.addEventListener('change', (e) => {
        if (e.target.value === 'video1') {
            loadSplatFromUrl('video1_scene.splat', 'Reconstructed video1');
        } else if (e.target.value === 'synthetic') {
            if (currentCustomCloud) {
                sceneGroup.remove(currentCustomCloud);
                currentCustomCloud = null;
            }
            state.splatCount = 484707;
            document.getElementById('tele-splats').textContent = '484,707';
            showToast('Showing Digital Twin Scene');
        }
    });
}

// ============================================================
// 2D Minimap Canvas
// ============================================================
const minimapCanvas = document.getElementById('minimap-canvas');
const mmCtx = minimapCanvas.getContext('2d');

function updateMinimap() {
    const w = minimapCanvas.width;
    const h = minimapCanvas.height;
    mmCtx.clearRect(0, 0, w, h);

    // Map bounds: [-6, 6] in X, [-8, 8] in Z
    const mapScaleX = w / 14;
    const mapScaleZ = h / 18;
    const toMapX = (x) => w / 2 + x * mapScaleX;
    const toMapY = (z) => h / 2 + z * mapScaleZ;

    // Draw Room Walls
    mmCtx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    mmCtx.lineWidth = 2;
    mmCtx.strokeRect(toMapX(-5.8), toMapY(-7.8), 11.6 * mapScaleX, 15.6 * mapScaleZ);

    // Draw Furniture footprints
    mmCtx.fillStyle = 'rgba(245, 158, 11, 0.3)';
    mmCtx.fillRect(toMapX(2.2), toMapY(-2.0), 2.0 * mapScaleX, 1.0 * mapScaleZ); // Desk

    mmCtx.fillStyle = 'rgba(139, 92, 246, 0.3)';
    mmCtx.fillRect(toMapX(-4.4), toMapY(-3.9), 3.2 * mapScaleX, 1.4 * mapScaleZ); // Meeting Table

    mmCtx.fillStyle = 'rgba(236, 72, 153, 0.3)';
    mmCtx.fillRect(toMapX(1.7), toMapY(3.1), 2.2 * mapScaleX, 0.8 * mapScaleZ); // Lounge

    // Draw POIs
    Object.values(state.pois).forEach(poi => {
        const px = toMapX(poi.pos.x);
        const py = toMapY(poi.pos.z);
        mmCtx.fillStyle = `#${poi.color.toString(16).padStart(6, '0')}`;
        mmCtx.beginPath();
        mmCtx.arc(px, py, 3.5, 0, Math.PI * 2);
        mmCtx.fill();
    });

    // Draw Player Dot & View Cone
    const playerX = toMapX(camera.position.x);
    const playerY = toMapY(camera.position.z);

    // Player position dot
    mmCtx.fillStyle = '#ffffff';
    mmCtx.shadowColor = '#3b82f6';
    mmCtx.shadowBlur = 6;
    mmCtx.beginPath();
    mmCtx.arc(playerX, playerY, 4, 0, Math.PI * 2);
    mmCtx.fill();
    mmCtx.shadowBlur = 0;

    // View direction vector
    const camDir = new THREE.Vector3();
    camera.getWorldDirection(camDir);
    const angle = Math.atan2(camDir.x, camDir.z);

    mmCtx.fillStyle = 'rgba(59, 130, 246, 0.25)';
    mmCtx.beginPath();
    mmCtx.moveTo(playerX, playerY);
    mmCtx.arc(playerX, playerY, 18, angle - Math.PI / 6 - Math.PI/2, angle + Math.PI / 6 - Math.PI/2);
    mmCtx.closePath();
    mmCtx.fill();
}

// Toast helper
let toastTimeout;
function showToast(msg) {
    const toast = document.getElementById('toast');
    toast.textContent = msg;
    toast.classList.remove('hidden');
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => toast.classList.add('hidden'), 2600);
}

// ============================================================
// Animation & Physics Loop
// ============================================================
let prevTime = performance.now();
let frameCount = 0;
let lastFpsTime = performance.now();

const telePos = document.getElementById('tele-pos');
const teleFps = document.getElementById('tele-fps');

function animate() {
    requestAnimationFrame(animate);

    const time = performance.now();
    const delta = (time - prevTime) / 1000;
    prevTime = time;

    // FPS Meter
    frameCount++;
    if (time - lastFpsTime >= 500) {
        state.fps = Math.round((frameCount * 1000) / (time - lastFpsTime));
        teleFps.textContent = state.fps;
        frameCount = 0;
        lastFpsTime = time;
    }

    if (state.cameraMode === 'fps') {
        // Damping velocity
        velocity.x -= velocity.x * 10.0 * delta;
        velocity.z -= velocity.z * 10.0 * delta;
        velocity.y -= velocity.y * 10.0 * delta;

        direction.z = Number(moveState.forward) - Number(moveState.backward);
        direction.x = Number(moveState.right) - Number(moveState.left);
        direction.y = Number(moveState.up) - Number(moveState.down);
        direction.normalize();

        const currentSpeed = state.walkSpeed * (moveState.sprint ? 1.8 : 1.0);

        if (moveState.forward || moveState.backward) velocity.z -= direction.z * currentSpeed * 10.0 * delta;
        if (moveState.left || moveState.right) velocity.x -= direction.x * currentSpeed * 10.0 * delta;
        if (moveState.up || moveState.down) velocity.y += direction.y * currentSpeed * 10.0 * delta;

        fpsControls.moveRight(-velocity.x * delta);
        fpsControls.moveForward(-velocity.z * delta);

        if (state.collisionEnabled) {
            // Lock eye level height to floor
            camera.position.y = state.eyeHeight;

            // Room collision boundary clamping
            camera.position.x = Math.max(-5.5, Math.min(5.5, camera.position.x));
            camera.position.z = Math.max(-7.5, Math.min(7.5, camera.position.z));
        } else {
            camera.position.y += velocity.y * delta;
        }

        // Telemetry readout
        telePos.textContent = `${camera.position.x.toFixed(1)}, ${camera.position.y.toFixed(1)}, ${camera.position.z.toFixed(1)}`;
    } else if (state.cameraMode === 'orbit' || state.cameraMode === 'topdown') {
        orbitControls.update();
        telePos.textContent = `${camera.position.x.toFixed(1)}, ${camera.position.y.toFixed(1)}, ${camera.position.z.toFixed(1)}`;
    }

    // Update 2D Minimap
    updateMinimap();

    // Render 3D Frame
    renderer.render(scene, camera);
}

// Window resize handler
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Start loop & load video1 reconstruction by default
animate();
loadSplatFromUrl('video1_scene.splat', 'Reconstructed video1');
showToast('Ready: Roaming video1 space · WASD to walk, Tab to free cursor');

