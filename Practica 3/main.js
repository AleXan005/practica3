import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// =============================================================================
// 1. CONFIGURACIÓN BASE: ESCENA, CÁMARA Y RENDERER
// =============================================================================
const container = document.getElementById('canvas-container');

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0e131f);
scene.fog = new THREE.Fog(0x0e131f, 12, 35);

const initialCameraPos = new THREE.Vector3(0, 3.5, 7.5);
const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.copy(initialCameraPos);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
container.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.target.set(0, 2, 0);
controls.maxPolarAngle = Math.PI / 2 + 0.02;

// =============================================================================
// 2. ILUMINACIÓN DEL LABORATORIO
// =============================================================================
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xfff7ed, 1.8);
dirLight.position.set(5, 10, 6);
dirLight.castShadow = true;
dirLight.shadow.mapSize.set(2048, 2048);
scene.add(dirLight);

// Luz puntual decorativa
const flowerSpot = new THREE.PointLight(0x38bdf8, 1.2, 8);
flowerSpot.position.set(0, 4.5, 1);
scene.add(flowerSpot);

// Suelo y Rejilla
const floorMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(30, 30),
    new THREE.MeshStandardMaterial({ color: 0x161b26, roughness: 0.9 })
);
floorMesh.rotation.x = -Math.PI / 2;
floorMesh.receiveShadow = true;
scene.add(floorMesh);

const gridHelper = new THREE.GridHelper(20, 20, 0x334155, 0x1e293b);
gridHelper.position.y = 0.005;
scene.add(gridHelper);

// =============================================================================
// 3. CONSTRUCCIÓN DE LA PLANTA (JERARQUÍAS Y GEOMETRÍAS)
// =============================================================================
const plantRootGroup = new THREE.Group();
scene.add(plantRootGroup);

const clickableParts = [];
const leavesArray = [];

function tagPart(mesh, name, desc) {
    mesh.userData = {
        name: name,
        geoName: mesh.geometry.type,
        desc: desc
    };
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    clickableParts.push(mesh);
}

// --- A. MACETA Y TIERRA ---
const potMaterial = new THREE.MeshStandardMaterial({ color: 0x8b5a2b, roughness: 0.6 });
const potMesh = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 0.75, 1.6, 32), potMaterial);
potMesh.position.y = 0.8;
tagPart(potMesh, "Maceta Cerámica", "Contenedor poroso que sostiene el sustrato drenable y el bulbo subterráneo.");
plantRootGroup.add(potMesh);

const potRimMesh = new THREE.Mesh(new THREE.TorusGeometry(1.1, 0.08, 16, 32), potMaterial);
potRimMesh.rotation.x = Math.PI / 2;
potRimMesh.position.y = 1.6;
tagPart(potRimMesh, "Borde de Maceta", "Refuerzo estructural superior de la maceta.");
plantRootGroup.add(potRimMesh);

const soilMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(1.05, 1.05, 0.1, 32),
    new THREE.MeshStandardMaterial({ color: 0x2b1d14, roughness: 0.95 })
);
soilMesh.position.y = 1.55;
tagPart(soilMesh, "Sustrato Húmedo", "Suelo enriquecido que aporta nutrientes y retiene agua para las raíces.");
plantRootGroup.add(soilMesh);

// --- B. TALLO PRINCIPAL ---
const stemGroup = new THREE.Group();
stemGroup.position.set(0, 1.6, 0);
plantRootGroup.add(stemGroup);

const stemHeight = 2.4;
const stemMaterial = new THREE.MeshStandardMaterial({ color: 0x2e7d32, roughness: 0.5 });
const stemMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.11, stemHeight, 16), stemMaterial);
stemMesh.position.y = stemHeight / 2;
tagPart(stemMesh, "Tallo Principal (Caulinar)", "Estructura vascular de soporte; transporta agua y sales desde el bulbo hacia ápices y flores.");
stemGroup.add(stemMesh);

// --- C. HOJAS GENERADAS PROCEDURALMENTE ---
const textureLoader = new THREE.TextureLoader();
const leafTexture = textureLoader.load('assets/leaf.png');

const leafMaterial = new THREE.MeshStandardMaterial({
    map: leafTexture,
    roughness: 0.4,
    side: THREE.DoubleSide,
    transparent: true
});
const leafGeometry = new THREE.SphereGeometry(0.35, 16, 12);
leafGeometry.scale(1.8, 0.15, 0.6);

const totalLeaves = 8;
for (let i = 0; i < totalLeaves; i++) {
    const leafGroup = new THREE.Group();
    const heightPercent = (i + 1) / (totalLeaves + 1);
    const leafY = heightPercent * (stemHeight - 0.3);
    const angle = i * (Math.PI * 0.55);

    leafGroup.position.set(0, leafY, 0);
    leafGroup.rotation.y = angle;

    const leafMesh = new THREE.Mesh(leafGeometry, leafMaterial.clone());
    leafMesh.position.set(0.4, 0, 0);
    leafMesh.rotation.z = -0.25;
    tagPart(leafMesh, `Hoja Lanceolada #${i + 1}`, "Órgano fotosintético encargado de la fijación de carbono y transpiración estomática.");
    
    leafGroup.add(leafMesh);
    stemGroup.add(leafGroup);
    leavesArray.push(leafMesh);
}

// --- D. RAMA LATERAL ---
const branchGroup = new THREE.Group();
branchGroup.position.set(0, 1.6, 0);
branchGroup.rotation.z = Math.PI / 4;
stemGroup.add(branchGroup);

const branchMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(0.04, 0.06, 0.8, 12),
    stemMaterial
);
branchMesh.position.y = 0.4;
tagPart(branchMesh, "Pecíolo / Rama Lateral", "Bifurcación que sostiene hojas auxiliares y brotes vegetativos.");
branchGroup.add(branchMesh);

const branchLeaf = new THREE.Mesh(leafGeometry, leafMaterial.clone());
branchLeaf.position.set(0, 0.8, 0);
branchLeaf.rotation.z = 0.4;
tagPart(branchLeaf, "Hoja Auxiliar", "Hoja apical de la ramificación lateral.");
branchGroup.add(branchLeaf);
leavesArray.push(branchLeaf);

// --- E. FLOR APICAL (Corregida para abrir hacia arriba) ---
const flowerGroup = new THREE.Group();
flowerGroup.position.set(0, stemHeight, 0);
stemGroup.add(flowerGroup);

const pistilMesh = new THREE.Mesh(
    new THREE.ConeGeometry(0.18, 0.4, 16),
    new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.3 })
);
pistilMesh.position.y = 0.15;
tagPart(pistilMesh, "Receptáculo y Pistilo", "Centro floral que aloja los órganos reproductivos (estambres y estigma).");
flowerGroup.add(pistilMesh);

const petalGeo = new THREE.ConeGeometry(0.35, 1.1, 16);
petalGeo.scale(1.0, 1.0, 0.2);
const petalMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 });

for (let p = 0; p < 6; p++) {
    const petalMesh = new THREE.Mesh(petalGeo, petalMat.clone());
    const rotY = (p * Math.PI) / 3;
    petalMesh.rotation.y = rotY;
    // Apertura natural hacia arriba:
    petalMesh.rotation.z = -Math.PI / 4;
    petalMesh.position.set(Math.cos(rotY) * 0.4, 0.5, Math.sin(rotY) * 0.4);
    tagPart(petalMesh, `Pétalo Blanco #${p + 1}`, "Tépalo corolino responsable de la atracción de polinizadores entomófilos.");
    flowerGroup.add(petalMesh);
}

// =============================================================================
// 4. RAYCASTING: SELECCIÓN E INSPECCIÓN
// =============================================================================
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

const infoPanelData = document.getElementById('plant-data');
const hintText = document.getElementById('hint-text');
const partNameEl = document.getElementById('part-name');
const partGeoEl = document.getElementById('part-geo');
const partHeightEl = document.getElementById('part-height');
const partDescEl = document.getElementById('part-desc');

let lastSelectedMesh = null;
let lastSelectedColor = null;

window.addEventListener('pointerdown', (event) => {
    if (event.target.closest('.hud-card')) return;

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const hits = raycaster.intersectObjects(clickableParts, false);

    if (hits.length > 0) {
        const target = hits[0].object;

        if (lastSelectedMesh && lastSelectedMesh !== target && lastSelectedColor) {
            lastSelectedMesh.material.color.setHex(lastSelectedColor);
        }

        if (lastSelectedMesh !== target) {
            lastSelectedColor = target.material.color.getHex();
        }
        lastSelectedMesh = target;

        target.material.color.setHex(0x00ffff);

        const worldPos = new THREE.Vector3();
        target.getWorldPosition(worldPos);

        hintText.classList.add('hidden');
        infoPanelData.classList.remove('hidden');

        partNameEl.textContent = target.userData.name;
        partGeoEl.textContent = target.userData.geoName;
        partHeightEl.textContent = `${worldPos.y.toFixed(2)} m`;
        partDescEl.textContent = target.userData.desc;
    }
});

// =============================================================================
// 5. BUCLE DE ANIMACIÓN
// =============================================================================
const clock = new THREE.Clock();
let isAnimationActive = true;

function animate() {
    requestAnimationFrame(animate);

    if (isAnimationActive) {
        const time = clock.getElapsedTime();
        stemGroup.rotation.z = Math.sin(time * 1.8) * 0.04;
        stemGroup.rotation.x = Math.cos(time * 1.3) * 0.03;

        leavesArray.forEach((leaf, idx) => {
            leaf.rotation.x = Math.sin(time * 2.5 + idx) * 0.08;
        });
    }

    controls.update();
    renderer.render(scene, camera);
}
animate();

// =============================================================================
// 6. CONTROLES HTML
// =============================================================================
const btnToggleAnim = document.getElementById('btn-toggle-anim');
btnToggleAnim.addEventListener('click', () => {
    isAnimationActive = !isAnimationActive;
    btnToggleAnim.textContent = isAnimationActive ? '⏸️ Pausar Viento' : '▶️ Reanudar Viento';
});

const leafPalettes = [0x4caf50, 0xd4e157, 0x00b4d8, 0x2e7d32];
let paletteIdx = 0;
document.getElementById('btn-color-leaves').addEventListener('click', () => {
    paletteIdx = (paletteIdx + 1) % leafPalettes.length;
    leavesArray.forEach(leaf => {
        leaf.material.color.setHex(leafPalettes[paletteIdx]);
    });
});

let leavesVisible = true;
const btnToggleLeaves = document.getElementById('btn-toggle-leaves');
btnToggleLeaves.addEventListener('click', () => {
    leavesVisible = !leavesVisible;
    leavesArray.forEach(leaf => {
        leaf.visible = leavesVisible;
    });
    btnToggleLeaves.textContent = leavesVisible ? '👁️ Ocultar Hojas' : '👁️ Mostrar Hojas';
});

document.getElementById('btn-reset-cam').addEventListener('click', () => {
    camera.position.copy(initialCameraPos);
    controls.target.set(0, 2, 0);
    controls.update();
});

const sliderLight = document.getElementById('slider-light');
const lightValText = document.getElementById('light-val');
sliderLight.addEventListener('input', (e) => {
    const val = parseFloat(e.target.value);
    dirLight.intensity = val;
    lightValText.textContent = val.toFixed(1);
});

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});