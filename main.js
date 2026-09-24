import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// =============================================================================
// 1. CONFIGURACIÓN BASE: CÁMARA, RENDERER Y ESCENA CLÍNICA
// =============================================================================
const container = document.getElementById('canvas-container');

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xdbeafe);
scene.fog = new THREE.Fog(0xdbeafe, 14, 34);

const initialCameraPos = new THREE.Vector3(0, 3.8, 7.5);
const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
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
controls.target.set(0, 2.1, 0);
controls.maxPolarAngle = Math.PI / 2 - 0.02;

// =============================================================================
// 2. ILUMINACIÓN BRILLANTE DE LABORATORIO
// =============================================================================
const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 1.7);
dirLight.position.set(5, 10, 6);
dirLight.castShadow = true;
dirLight.shadow.mapSize.set(2048, 2048);
dirLight.shadow.bias = -0.0001;
scene.add(dirLight);

// Luz violeta fitocromo de cultivo (ubicada a 5.6m para bañar las 3 flores desde arriba)
const growLight = new THREE.PointLight(0xa855f7, 1.6, 8);
growLight.position.set(0, 5.5, 0);
scene.add(growLight);

// =============================================================================
// 3. ARQUITECTURA DEL LABORATORIO (PAREDES CLARAS, CRISTAL Y PISO EPÓXICO)
// =============================================================================
// Piso epóxico brillante
const floorMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.25, metalness: 0.1 });
const floorMesh = new THREE.Mesh(new THREE.PlaneGeometry(28, 28), floorMat);
floorMesh.rotation.x = -Math.PI / 2;
floorMesh.receiveShadow = true;
scene.add(floorMesh);

const gridHelper = new THREE.GridHelper(28, 28, 0x94a3b8, 0xcbd5e1);
gridHelper.position.y = 0.005;
scene.add(gridHelper);

// Pared trasera
const backWall = new THREE.Mesh(
    new THREE.PlaneGeometry(28, 14),
    new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.45 })
);
backWall.position.set(0, 7, -4.6);
backWall.receiveShadow = true;
scene.add(backWall);

// Zócalo azul clínico de protección
const baseboard = new THREE.Mesh(
    new THREE.BoxGeometry(28, 0.4, 0.1),
    new THREE.MeshStandardMaterial({ color: 0x2563eb, roughness: 0.3 })
);
baseboard.position.set(0, 0.2, -4.55);
scene.add(baseboard);

// Ventanal de invernadero con marco de aluminio
const windowFrame = new THREE.Mesh(
    new THREE.BoxGeometry(11.2, 5.0, 0.15),
    new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8, roughness: 0.2 })
);
windowFrame.position.set(0, 5.4, -4.52);
scene.add(windowFrame);

// Particiones verticales del ventanal
[-2.8, 0, 2.8].forEach(x => {
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.1, 4.9, 0.18), windowFrame.material);
    post.position.set(x, 5.4, -4.51);
    scene.add(post);
});

// Cristal translúcido con tono cielo
const windowGlass = new THREE.Mesh(
    new THREE.PlaneGeometry(10.8, 4.6),
    new THREE.MeshPhysicalMaterial({
        color: 0x7dd3fc,
        transparent: true,
        opacity: 0.4,
        roughness: 0.05,
        transmission: 0.9
    })
);
windowGlass.position.set(0, 5.4, -4.45);
scene.add(windowGlass);

// =============================================================================
// 4. MOBILIARIO Y EQUIPO CIENTÍFICO DECORATIVO
// =============================================================================
// Mesa central de acero inoxidable
const tableTop = new THREE.Mesh(
    new THREE.BoxGeometry(9.4, 0.2, 2.8),
    new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.2, metalness: 0.35 })
);
tableTop.position.set(0, 1.2, 0);
tableTop.castShadow = true;
tableTop.receiveShadow = true;
scene.add(tableTop);

const legMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.85, roughness: 0.25 });
const legPositions = [[-4.4, 0.6, -1.2], [4.4, 0.6, -1.2], [-4.4, 0.6, 1.2], [4.4, 0.6, 1.2]];
legPositions.forEach(([x, y, z]) => {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.2, 16), legMat);
    leg.position.set(x, y, z);
    leg.castShadow = true;
    scene.add(leg);
});

// --- Lámpara LED UV de Cultivo (Elevada a 5.7m para no cruzar las flores) ---
const growLampFixture = new THREE.Mesh(
    new THREE.BoxGeometry(7.6, 0.15, 0.6),
    new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.8 })
);
growLampFixture.position.set(0, 5.7, 0);
scene.add(growLampFixture);

const growLedPanel = new THREE.Mesh(
    new THREE.PlaneGeometry(7.2, 0.45),
    new THREE.MeshBasicMaterial({ color: 0xd8b4fe })
);
growLedPanel.rotation.x = Math.PI / 2;
growLedPanel.position.set(0, 5.62, 0);
scene.add(growLedPanel);

// Cables de acero que cuelgan la lámpara desde el techo
[-2.8, 2.8].forEach(x => {
    const cable = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 2.0, 8), legMat);
    cable.position.set(x, 6.7, 0);
    scene.add(cable);
});

// --- Instrumentación de Laboratorio ---
const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.35,
    roughness: 0.05,
    transmission: 0.95,
    ior: 1.5
});

// 1. Matraz Erlenmeyer con solución reactiva de cobre (Lado Izquierdo)
const flaskGroup = new THREE.Group();
flaskGroup.position.set(-3.8, 1.3, 0.6);

const flaskBase = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.45, 24), glassMat);
flaskBase.position.y = 0.22;
flaskGroup.add(flaskBase);

const flaskNeck = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.25, 24), glassMat);
flaskNeck.position.y = 0.48;
flaskGroup.add(flaskNeck);

const liquidMesh = new THREE.Mesh(
    new THREE.ConeGeometry(0.20, 0.25, 24),
    new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.15, transparent: true, opacity: 0.85 })
);
liquidMesh.position.y = 0.13;
flaskGroup.add(liquidMesh);
scene.add(flaskGroup);

// 2. Frasco ámbar de reactivo reactivo biológico
const amberJar = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12, 0.12, 0.35, 20),
    new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.2, transparent: true, opacity: 0.9 })
);
amberJar.position.set(-3.2, 1.48, 0.7);
amberJar.castShadow = true;
scene.add(amberJar);

const jarCap = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.08, 0.08, 20),
    new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4 })
);
jarCap.position.set(-3.2, 1.68, 0.7);
scene.add(jarCap);

// 3. Microscopio de investigación (Lado Izquierdo Atrás)
const microscopeGroup = new THREE.Group();
microscopeGroup.position.set(-3.8, 1.3, -0.6);

const scopeBase = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.06, 0.52), legMat);
scopeBase.position.y = 0.03;
scopeBase.castShadow = true;
microscopeGroup.add(scopeBase);

const scopeArm = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.055, 0.52, 16), legMat);
scopeArm.position.set(0, 0.3, -0.15);
scopeArm.rotation.x = -0.22;
microscopeGroup.add(scopeArm);

const scopeHead = new THREE.Mesh(
    new THREE.CylinderGeometry(0.065, 0.065, 0.28, 16),
    new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3 })
);
scopeHead.position.set(0, 0.55, 0.02);
scopeHead.rotation.x = 0.32;
microscopeGroup.add(scopeHead);
scene.add(microscopeGroup);

// 4. Gradilla con tubos de ensayo graduados (Lado Derecho)
const rackGroup = new THREE.Group();
rackGroup.position.set(3.7, 1.3, 0.6);

const rackBase = new THREE.Mesh(
    new THREE.BoxGeometry(0.85, 0.04, 0.32),
    new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.6 })
);
rackBase.position.y = 0.02;
rackGroup.add(rackBase);

const rackTop = rackBase.clone();
rackTop.position.y = 0.35;
rackGroup.add(rackTop);

const tubeColors = [0x22c55e, 0xf59e0b, 0xef4444, 0x06b6d4];
tubeColors.forEach((col, idx) => {
    const tubeX = -0.27 + idx * 0.18;
    const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.45, 16), glassMat);
    tube.position.set(tubeX, 0.25, 0);
    rackGroup.add(tube);

    const tubeLiquid = new THREE.Mesh(
        new THREE.CylinderGeometry(0.03, 0.03, 0.28, 16),
        new THREE.MeshStandardMaterial({ color: col, roughness: 0.2, transparent: true, opacity: 0.85 })
    );
    tubeLiquid.position.set(tubeX, 0.18, 0);
    rackGroup.add(tubeLiquid);
});
scene.add(rackGroup);

// 5. Placas Petri apiladas con cultivos de laboratorio (Lado Derecho Fondo)
const petriGroup = new THREE.Group();
petriGroup.position.set(3.6, 1.3, -0.6);
[0, 0.08, 0.16].forEach(yOffset => {
    const dish = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.06, 24), glassMat);
    dish.position.y = yOffset + 0.03;
    petriGroup.add(dish);

    const agar = new THREE.Mesh(
        new THREE.CylinderGeometry(0.20, 0.20, 0.02, 24),
        new THREE.MeshStandardMaterial({ color: 0xfde047, roughness: 0.5, transparent: true, opacity: 0.8 })
    );
    agar.position.y = yOffset + 0.02;
    petriGroup.add(agar);
});
scene.add(petriGroup);

// 6. Cuaderno / Bitácora de laboratorio sobre la mesa
const labNotebook = new THREE.Mesh(
    new THREE.BoxGeometry(0.4, 0.03, 0.5),
    new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.6 })
);
labNotebook.position.set(-1.1, 1.32, 0.85);
labNotebook.rotation.y = 0.2;
scene.add(labNotebook);

// =============================================================================
// 5. GENERADOR DE AZUCENAS (LILIUM CANDIDUM) Y SELECCIÓN POR RAYCASTING
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

    // Placa de rotulación científica frente a la maceta
    const tagMesh = new THREE.Mesh(
        new THREE.BoxGeometry(0.52, 0.16, 0.02),
        new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.3 })
    );
    tagMesh.position.set(0, 0.08, 0.88);
    tagMesh.rotation.x = -0.35;
    tagPart(tagMesh, `Ficha Clínica [${specimenCode}]`, "Etiqueta con código de trazabilidad, fenotipo y fecha de cultivo.");
    plantRoot.add(tagMesh);

    // Maceta hidropónica blanca pulida
    const potMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.28 });
    const potMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.52, 1.1, 32), potMat);
    potMesh.position.y = 0.55;
    tagPart(potMesh, `Maceta Hidropónica #${plantId}`, "Contenedor de polímero biológicamente inerte con drenaje inferior.");
    plantRoot.add(potMesh);

    const rimMesh = new THREE.Mesh(new THREE.TorusGeometry(0.75, 0.06, 16, 32), potMat);
    rimMesh.rotation.x = Math.PI / 2;
    rimMesh.position.y = 1.1;
    tagPart(rimMesh, `Aro de Maceta #${plantId}`, "Borde reforzado superior.");
    plantRoot.add(rimMesh);

    // Sustrato oscuro (dimensionado ligeramente menor para erradicar el Z-fighting)
    const soilMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.68, 0.60, 0.1, 32),
        new THREE.MeshStandardMaterial({ color: 0x1f1614, roughness: 0.95 })
    );
    soilMesh.position.y = 1.0;
    tagPart(soilMesh, `Sustrato Nutritivo #${plantId}`, "Mezcla de turba negra y perlita tratada para el soporte del bulbo.");
    plantRoot.add(soilMesh);

    // Grupo de tallo para animación
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

    // Hojas lanceoladas con filotaxis helicoidal
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
        tagPart(leafMesh, `Hoja #${i + 1} (${specimenCode})`, "Estructura laminar con estomas para transpiración e intercambio de gases.");
        leafNode.add(leafMesh);
        stemGroup.add(leafNode);
        leavesArray.push(leafMesh);
    }

    // Rama lateral auxiliar
    const branchGroup = new THREE.Group();
    branchGroup.position.set(0, 1.1, 0);
    branchGroup.rotation.z = plantId % 2 === 0 ? -Math.PI / 4.8 : Math.PI / 4.8;
    stemGroup.add(branchGroup);

    const branchMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.035, 0.05, 0.6, 12),
        new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.4 })
    );
    branchMesh.position.y = 0.3;
    tagPart(branchMesh, `Pecíolo Lateral #${plantId}`, "Ramificación caulinar secundaria orientada hacia la luz.");
    branchGroup.add(branchMesh);

    const branchLeaf = new THREE.Mesh(leafGeo, leafMat.clone());
    branchLeaf.position.set(0, 0.6, 0);
    branchLeaf.rotation.z = 0.35;
    tagPart(branchLeaf, `Hoja de Rama (${specimenCode})`, "Hoja axilar orientada a la radiación perimetral.");
    branchGroup.add(branchLeaf);
    leavesArray.push(branchLeaf);

    // Flor Apical (Abierta hacia arriba en ángulo natural)
    const flowerGroup = new THREE.Group();
    flowerGroup.position.set(0, stemHeight, 0);
    stemGroup.add(flowerGroup);

    // Pistilo central
    const pistil = new THREE.Mesh(
        new THREE.ConeGeometry(0.14, 0.35, 16),
        new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.25 })
    );
    pistil.position.y = 0.12;
    tagPart(pistil, `Pistilo / Receptáculo (${specimenCode})`, "Órgano reproductivo central con estigmas papilosos.");
    flowerGroup.add(pistil);

    // Pétalos cónicos aplanados que abren hacia arriba
    const petalGeo = new THREE.ConeGeometry(0.28, 0.95, 16);
    petalGeo.scale(1.0, 1.0, 0.18);
    const petalMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 });

    for (let p = 0; p < 6; p++) {
        const petal = new THREE.Mesh(petalGeo, petalMat.clone());
        const angle = (p * Math.PI) / 3;
        petal.rotation.y = angle;
        petal.rotation.z = -Math.PI / 4; // Apertura en copa ascendente
        petal.position.set(Math.cos(angle) * 0.32, 0.4, Math.sin(angle) * 0.32);
        tagPart(petal, `Pétalo #${p + 1} (${specimenCode})`, "Tépalo corolino blanco reflejante de radiación visible y UV.");
        flowerGroup.add(petal);
    }
}

// Distribuir las tres azucenas a lo largo de la mesa
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
// 7. ANIMACIÓN (VENTILACIÓN ASINCRÓNICA)
// =============================================================================
const clock = new THREE.Clock();
let isAnimationActive = true;

function animate() {
    requestAnimationFrame(animate);

    if (isAnimationActive) {
        const time = clock.getElapsedTime();

        plantStems.forEach(({ group, offset }) => {
            group.rotation.z = Math.sin(time * 1.5 + offset) * 0.03;
            group.rotation.x = Math.cos(time * 1.1 + offset) * 0.02;
        });

        leavesArray.forEach((leaf, idx) => {
            leaf.rotation.x = Math.sin(time * 2.0 + idx) * 0.05;
        });
    }

    controls.update();
    renderer.render(scene, camera);
}
animate();

// =============================================================================
// 8. BOTONERA HTML INTERACTIVA
// =============================================================================
const btnToggleAnim = document.getElementById('btn-toggle-anim');
btnToggleAnim.addEventListener('click', () => {
    isAnimationActive = !isAnimationActive;
    btnToggleAnim.textContent = isAnimationActive ? '⏸️ Pausar Flujo Aire' : '▶️ Reanudar Flujo Aire';
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
