import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// =============================================================================
// 1. CONFIGURACIÓN BASE: CÁMARA, RENDERER Y ESCENA
// =============================================================================
const container = document.getElementById('canvas-container');

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xdbeafe);
scene.fog = new THREE.Fog(0xdbeafe, 15, 38);

const initialCameraPos = new THREE.Vector3(0, 4.0, 8.5);
const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.copy(initialCameraPos);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.shadowMap.bias = -0.0001;
container.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.target.set(0, 2.1, 0);
controls.maxPolarAngle = Math.PI / 2 - 0.02;

// =============================================================================
// 2. ILUMINACIÓN BRILLANTE DE LABORATORIO
// =============================================================================
const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 1.6);
dirLight.position.set(6, 11, 7);
dirLight.castShadow = true;
dirLight.shadow.mapSize.set(2048, 2048);
scene.add(dirLight);

// Luz de ventilación/exterior azulada que ingresa por la ventana izquierda
const windWindowLight = new THREE.DirectionalLight(0x7dd3fc, 0.8);
windWindowLight.position.set(-14, 6, 2);
scene.add(windWindowLight);

// Luz fitocromo de cultivo (sobre las azucenas a 5.6m)
const growLight = new THREE.PointLight(0xa855f7, 1.6, 8);
growLight.position.set(0, 5.5, 0);
scene.add(growLight);

// =============================================================================
// 3. ARQUITECTURA DEL LABORATORIO Y VENTANAS DE VENTILACIÓN
// =============================================================================
// Piso epóxico
const floorMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(32, 32),
    new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.25, metalness: 0.1 })
);
floorMesh.rotation.x = -Math.PI / 2;
floorMesh.receiveShadow = true;
scene.add(floorMesh);

const gridHelper = new THREE.GridHelper(32, 32, 0x94a3b8, 0xcbd5e1);
gridHelper.position.y = 0.005;
scene.add(gridHelper);

// Pared trasera
const wallMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.45 });
const backWall = new THREE.Mesh(new THREE.PlaneGeometry(32, 14), wallMat);
backWall.position.set(0, 7, -5.2);
backWall.receiveShadow = true;
scene.add(backWall);

// Pared lateral izquierda (donde se ubica el sistema de ventilación/ventanas)
const leftWall = new THREE.Mesh(new THREE.PlaneGeometry(24, 14), wallMat);
leftWall.rotation.y = Math.PI / 2;
leftWall.position.set(-11, 7, 2);
leftWall.receiveShadow = true;
scene.add(leftWall);

// Zócalo azul de protección perimetral
const baseboard = new THREE.Mesh(
    new THREE.BoxGeometry(32, 0.4, 0.1),
    new THREE.MeshStandardMaterial({ color: 0x2563eb, roughness: 0.3 })
);
baseboard.position.set(0, 0.2, -5.15);
scene.add(baseboard);

// --- Ventana posterior de observación ---
const rearWindow = new THREE.Mesh(
    new THREE.BoxGeometry(11, 4.5, 0.15),
    new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.7 })
);
rearWindow.position.set(0, 5.5, -5.12);
scene.add(rearWindow);

const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0x7dd3fc,
    transparent: true,
    opacity: 0.4,
    roughness: 0.05,
    transmission: 0.92
});
const rearGlass = new THREE.Mesh(new THREE.PlaneGeometry(10.6, 4.1), glassMat);
rearGlass.position.set(0, 5.5, -5.04);
scene.add(rearGlass);

// --- Ventanas Laterales de Ventilación (Origen del flujo de aire) ---
const ventGroup = new THREE.Group();
ventGroup.position.set(-10.9, 5.2, 0);
ventGroup.rotation.y = Math.PI / 2;

const ventFrame = new THREE.Mesh(
    new THREE.BoxGeometry(6.5, 3.8, 0.15),
    new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8 })
);
ventGroup.add(ventFrame);

// Lamas / Persianas de ventilación inclinadas
for (let i = -1.5; i <= 1.5; i += 0.4) {
    const louver = new THREE.Mesh(
        new THREE.BoxGeometry(6.1, 0.22, 0.02),
        new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.5 })
    );
    louver.position.set(0, i, 0.05);
    louver.rotation.x = -0.45; // Apertura que orienta el viento hacia las mesas
    ventGroup.add(louver);
}
scene.add(ventGroup);

// =============================================================================
// 4. MESA PRINCIPAL DE PLANTAS Y MESAS LATERALES DE ANÁLISIS
// =============================================================================
const steelMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.2, metalness: 0.35 });
const darkMetal = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.85, roughness: 0.3 });

// --- A. Mesa Principal (Centro - Cultivo de Azucenas) ---
const mainTable = new THREE.Mesh(new THREE.BoxGeometry(8.8, 0.2, 2.6), steelMat);
mainTable.position.set(0, 1.2, 0);
mainTable.castShadow = true;
mainTable.receiveShadow = true;
scene.add(mainTable);

[[-4.1, 0.6, -1.1], [4.1, 0.6, -1.1], [-4.1, 0.6, 1.1], [4.1, 0.6, 1.1]].forEach(([x, y, z]) => {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.2, 16), darkMetal);
    leg.position.set(x, y, z);
    leg.castShadow = true;
    scene.add(leg);
});

// Lámpara UV cenital sobre mesa principal
const growLampFixture = new THREE.Mesh(new THREE.BoxGeometry(7.5, 0.15, 0.6), darkMetal);
growLampFixture.position.set(0, 5.7, 0);
scene.add(growLampFixture);

const growLedPanel = new THREE.Mesh(new THREE.PlaneGeometry(7.1, 0.45), new THREE.MeshBasicMaterial({ color: 0xd8b4fe }));
growLedPanel.rotation.x = Math.PI / 2;
growLedPanel.position.set(0, 5.62, 0);
scene.add(growLedPanel);

[-2.8, 2.8].forEach(x => {
    const cable = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 2.0, 8), darkMetal);
    cable.position.set(x, 6.7, 0);
    scene.add(cable);
});

// --- B. Mesa Lateral Izquierda: Análisis de Muestras y Centrifugación ---
const sampleTable = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.2, 2.4), steelMat);
sampleTable.position.set(-6.8, 1.2, 0);
sampleTable.castShadow = true;
sampleTable.receiveShadow = true;
scene.add(sampleTable);

[[-8.3, 0.6, -1.0], [-5.3, 0.6, -1.0], [-8.3, 0.6, 1.0], [-5.3, 0.6, 1.0]].forEach(([x, y, z]) => {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.2, 16), darkMetal);
    leg.position.set(x, y, z);
    scene.add(leg);
});

// Microcentrífuga de laboratorio (sobre mesa izquierda)
const centrifuge = new THREE.Mesh(
    new THREE.CylinderGeometry(0.35, 0.4, 0.35, 24),
    new THREE.MeshStandardMaterial({ color: 0x3b82f6, metalness: 0.4, roughness: 0.3 })
);
centrifuge.position.set(-6.8, 1.48, -0.3);
centrifuge.castShadow = true;
scene.add(centrifuge);

const centrifugeLid = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.06, 24), darkMetal);
centrifugeLid.position.set(-6.8, 1.68, -0.3);
scene.add(centrifugeLid);

// Cajas apiladas de portaobjetos / puntas de micropipeta
const slideBox = new THREE.Mesh(
    new THREE.BoxGeometry(0.45, 0.15, 0.35),
    new THREE.MeshStandardMaterial({ color: 0x06b6d4, roughness: 0.3 })
);
slideBox.position.set(-7.5, 1.38, 0.5);
scene.add(slideBox);

// --- C. Mesa Lateral Derecha: Estación de Cómputo y Datos Clínicos ---
const dataTable = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.2, 2.4), steelMat);
dataTable.position.set(6.8, 1.2, 0);
dataTable.castShadow = true;
dataTable.receiveShadow = true;
scene.add(dataTable);

[[5.3, 0.6, -1.0], [8.3, 0.6, -1.0], [5.3, 0.6, 1.0], [8.3, 0.6, 1.0]].forEach(([x, y, z]) => {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.2, 16), darkMetal);
    leg.position.set(x, y, z);
    scene.add(leg);
});

// Monitor de análisis bioinformático
const monitorStand = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.35, 12), darkMetal);
monitorStand.position.set(6.8, 1.48, -0.4);
scene.add(monitorStand);

const monitorScreen = new THREE.Mesh(
    new THREE.BoxGeometry(1.2, 0.7, 0.05),
    new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.2 })
);
monitorScreen.position.set(6.8, 1.85, -0.4);
scene.add(monitorScreen);

// Pantalla activa emisiva con gráfica bioinformática
const displayPanel = new THREE.Mesh(
    new THREE.PlaneGeometry(1.12, 0.62),
    new THREE.MeshBasicMaterial({ color: 0x0284c7 })
);
displayPanel.position.set(6.8, 1.85, -0.37);
scene.add(displayPanel);

// Teclado clínico
const keyboard = new THREE.Mesh(
    new THREE.BoxGeometry(0.85, 0.02, 0.3),
    new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.5 })
);
keyboard.position.set(6.8, 1.32, 0.3);
scene.add(keyboard);

// =============================================================================
// 5. GENERADOR MODULAR DE AZUCENAS (LILIUM CANDIDUM)
// =============================================================================
const clickableParts = [];
const leavesArray = [];
const plantStems = [];

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

const textureLoader = new THREE.TextureLoader();
const leafTexture = textureLoader.load('assets/leaf.png');

function createLilyPlant(posX, posZ, scale = 1.0, plantId = 1, specimenCode = "LC-01") {
    const plantRoot = new THREE.Group();
    plantRoot.position.set(posX, 1.3, posZ);
    plantRoot.scale.set(scale, scale, scale);
    scene.add(plantRoot);

    // Ficha clínica rotulada
    const tagMesh = new THREE.Mesh(
        new THREE.BoxGeometry(0.52, 0.16, 0.02),
        new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.3 })
    );
    tagMesh.position.set(0, 0.08, 0.88);
    tagMesh.rotation.x = -0.35;
    tagPart(tagMesh, `Ficha Clínica [${specimenCode}]`, "Registro de fenotipo, análisis morfológico y tasa transpiratoria.");
    plantRoot.add(tagMesh);

    // Maceta hidropónica
    const potMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.28 });
    const potMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.52, 1.1, 32), potMat);
    potMesh.position.y = 0.55;
    tagPart(potMesh, `Maceta Hidropónica #${plantId}`, "Contenedor de polímero biológicamente inerte con drenaje inferior.");
    plantRoot.add(potMesh);

    const rimMesh = new THREE.Mesh(new THREE.TorusGeometry(0.75, 0.06, 16, 32), potMat);
    rimMesh.rotation.x = Math.PI / 2;
    rimMesh.position.y = 1.1;
    tagPart(rimMesh, `Aro de Maceta #${plantId}`, "Borde reforzado para manipulación y anclaje.");
    plantRoot.add(rimMesh);

    // Sustrato oscuro (sin solapamiento Z-fighting)
    const soilMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.68, 0.60, 0.1, 32),
        new THREE.MeshStandardMaterial({ color: 0x1f1614, roughness: 0.95 })
    );
    soilMesh.position.y = 1.0;
    tagPart(soilMesh, `Sustrato Nutritivo #${plantId}`, "Mezcla de turba y perlita estéril enriquecida.");
    plantRoot.add(soilMesh);

    // Grupo de tallo articulado
    const stemGroup = new THREE.Group();
    stemGroup.position.set(0, 1.1, 0);
    plantRoot.add(stemGroup);
    plantStems.push({ group: stemGroup, offset: plantId * 1.7 });

    const stemHeight = 1.85;
    const stemMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.06, 0.08, stemHeight, 16),
        new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.35 })
    );
    stemMesh.position.y = stemHeight / 2;
    tagPart(stemMesh, `Tallo Caulinario #${plantId}`, "Haz vascular xilemático y floemático de transporte ascendente.");
    stemGroup.add(stemMesh);

    // Hojas lanceoladas helicoidales
    const leafMat = new THREE.MeshStandardMaterial({
        map: leafTexture,
        roughness: 0.35,
        side: THREE.DoubleSide,
        transparent: true
    });
    const leafGeo = new THREE.SphereGeometry(0.28, 16, 12);
    leafGeo.scale(1.75, 0.12, 0.55);

    const numLeaves = 7;
    for (let i = 0; i < numLeaves; i++) {
        const leafNode = new THREE.Group();
        const yPos = (i + 1) * (stemHeight / (numLeaves + 1.2));
        const rotY = i * (Math.PI * 0.55) + plantId;

        leafNode.position.set(0, yPos, 0);
        leafNode.rotation.y = rotY;

        const leafMesh = new THREE.Mesh(leafGeo, leafMat.clone());
        leafMesh.position.set(0.32, 0, 0);
        leafMesh.rotation.z = -0.22;
        tagPart(leafMesh, `Hoja #${i + 1} (${specimenCode})`, "Estructura laminar con estomas para transpiración e intercambio gaseoso.");
        leafNode.add(leafMesh);
        stemGroup.add(leafNode);
        leavesArray.push(leafMesh);
    }

    // Rama lateral
    const branchGroup = new THREE.Group();
    branchGroup.position.set(0, 1.1, 0);
    branchGroup.rotation.z = plantId % 2 === 0 ? -Math.PI / 4.8 : Math.PI / 4.8;
    stemGroup.add(branchGroup);

    const branchMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.035, 0.05, 0.6, 12),
        new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.4 })
    );
    branchMesh.position.y = 0.3;
    tagPart(branchMesh, `Pecíolo Lateral #${plantId}`, "Ramificación caulinar secundaria orientada hacia la ventilación y la luz.");
    branchGroup.add(branchMesh);

    const branchLeaf = new THREE.Mesh(leafGeo, leafMat.clone());
    branchLeaf.position.set(0, 0.6, 0);
    branchLeaf.rotation.z = 0.35;
    tagPart(branchLeaf, `Hoja de Rama (${specimenCode})`, "Hoja axilar receptora de radiación difusa.");
    branchGroup.add(branchLeaf);
    leavesArray.push(branchLeaf);

    // Flor Apical (Pétalos abiertos hacia arriba)
    const flowerGroup = new THREE.Group();
    flowerGroup.position.set(0, stemHeight, 0);
    stemGroup.add(flowerGroup);

    const pistil = new THREE.Mesh(
        new THREE.ConeGeometry(0.14, 0.35, 16),
        new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.25 })
    );
    pistil.position.y = 0.12;
    tagPart(pistil, `Pistilo / Receptáculo (${specimenCode})`, "Órgano reproductivo central receptor de polen.");
    flowerGroup.add(pistil);

    const petalGeo = new THREE.ConeGeometry(0.28, 0.95, 16);
    petalGeo.scale(1.0, 1.0, 0.18);
    const petalMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 });

    for (let p = 0; p < 6; p++) {
        const petal = new THREE.Mesh(petalGeo, petalMat.clone());
        const angle = (p * Math.PI) / 3;
        petal.rotation.y = angle;
        petal.rotation.z = -Math.PI / 4;
        petal.position.set(Math.cos(angle) * 0.32, 0.4, Math.sin(angle) * 0.32);
        tagPart(petal, `Pétalo #${p + 1} (${specimenCode})`, "Tépalo corolino blanco reflejante de radiación visible.");
        flowerGroup.add(petal);
    }
}

// Distribución de las 3 plantas sobre la mesa central
createLilyPlant(-2.4, 0, 0.92, 1, "LC-Alfa");
createLilyPlant(0.0, 0, 1.05, 2, "LC-Control");
createLilyPlant(2.4, 0, 0.95, 3, "LC-Beta");

// =============================================================================
// 6. RAYCASTING Y DETECCIÓN CLÍNICA
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
// 7. BUCLE DE ANIMACIÓN (VENTILACIÓN PROCEDENTE DE LA VENTANA LATERAL)
// =============================================================================
const clock = new THREE.Clock();
let isAnimationActive = true;

function animate() {
    requestAnimationFrame(animate);

    if (isAnimationActive) {
        const time = clock.getElapsedTime();

        // El viento entra desde X negativo (la ventana lateral izquierda)
        plantStems.forEach(({ group, offset }) => {
            // Inclinación predominante alejándose de la ventana (-X a +X)
            group.rotation.z = Math.sin(time * 1.5 + offset) * 0.035 - 0.015;
            group.rotation.x = Math.cos(time * 1.1 + offset) * 0.02;
        });

        leavesArray.forEach((leaf, idx) => {
            leaf.rotation.x = Math.sin(time * 2.1 + idx) * 0.055;
        });
    }

    controls.update();
    renderer.render(scene, camera);
}
animate();

// =============================================================================
// 8. CONTROLES HTML
// =============================================================================
const btnToggleAnim = document.getElementById('btn-toggle-anim');
btnToggleAnim.addEventListener('click', () => {
    isAnimationActive = !isAnimationActive;
    btnToggleAnim.textContent = isAnimationActive ? '⏸️ Pausar Flujo Ventana' : '▶️ Abrir Flujo Ventana';
});

const leafPalettes = [0x16a34a, 0x84cc16, 0x06b6d4, 0x15803d];
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
    controls.target.set(0, 2.1, 0);
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
