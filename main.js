import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// =============================================================================
// 1. CONFIGURACIÓN BASE: ESCENA, CÁMARA Y RENDERER
// =============================================================================
const container = document.getElementById('canvas-container');

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0f172a);
scene.fog = new THREE.Fog(0x0f172a, 10, 30);

const initialCameraPos = new THREE.Vector3(0, 4, 8);
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
controls.target.set(0, 2.2, 0);
controls.maxPolarAngle = Math.PI / 2 - 0.01; // Evita mirar por debajo del piso

// =============================================================================
// 2. ILUMINACIÓN DEL LABORATORIO
// =============================================================================
const ambientLight = new THREE.AmbientLight(0xe0f2fe, 0.55);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 1.8);
dirLight.position.set(4, 8, 5);
dirLight.castShadow = true;
dirLight.shadow.mapSize.set(2048, 2048);
scene.add(dirLight);

// Luz de tubo fluorescente de laboratorio (cenital azulada)
const labLight = new THREE.PointLight(0x38bdf8, 1.5, 12);
labLight.position.set(0, 5, 0);
scene.add(labLight);

// =============================================================================
// 3. ENTORNO Y ESCENARIO DE FONDO (HABITACIÓN DE LABORATORIO / INVERNADERO)
// =============================================================================
// Piso de baldosas de laboratorio
const floorMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(24, 24),
    new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.7, metalness: 0.2 })
);
floorMesh.rotation.x = -Math.PI / 2;
floorMesh.receiveShadow = true;
scene.add(floorMesh);

const gridHelper = new THREE.GridHelper(24, 24, 0x475569, 0x334155);
gridHelper.position.y = 0.005;
scene.add(gridHelper);

// Pared de fondo
const backWall = new THREE.Mesh(
    new THREE.PlaneGeometry(24, 10),
    new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.9 })
);
backWall.position.set(0, 5, -5);
backWall.receiveShadow = true;
scene.add(backWall);

// Ventanal / Marco de invernadero en la pared trasera
const windowFrame = new THREE.Mesh(
    new THREE.BoxGeometry(10, 5, 0.1),
    new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.5 })
);
windowFrame.position.set(0, 5, -4.95);
scene.add(windowFrame);

// Cristal translúcido con brillo exterior
const glassMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(9.6, 4.6),
    new THREE.MeshPhysicalMaterial({
        color: 0x38bdf8,
        transmission: 0.85,
        opacity: 0.35,
        transparent: true,
        roughness: 0.1
    })
);
glassMesh.position.set(0, 5, -4.89);
scene.add(glassMesh);

// Mesa larga de trabajo científico
const tableTop = new THREE.Mesh(
    new THREE.BoxGeometry(8, 0.2, 2.5),
    new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.5, roughness: 0.4 })
);
tableTop.position.set(0, 1.2, 0);
tableTop.castShadow = true;
tableTop.receiveShadow = true;
scene.add(tableTop);

// Patas de la mesa (4 cilindros metálicos)
const legGeo = new THREE.CylinderGeometry(0.08, 0.08, 1.2, 16);
const legMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.8, roughness: 0.3 });
const legPositions = [
    [-3.8, 0.6, -1.0],
    [3.8, 0.6, -1.0],
    [-3.8, 0.6, 1.0],
    [3.8, 0.6, 1.0]
];
legPositions.forEach(([x, y, z]) => {
    const leg = new THREE.Mesh(legGeo, legMat);
    leg.position.set(x, y, z);
    leg.castShadow = true;
    scene.add(leg);
});

// =============================================================================
// 4. GENERADOR DE AZUCENAS MODULAR (PARA CREAR LAS 3 PLANTAS)
// =============================================================================
const clickableParts = [];
const leavesArray = [];
const plantStems = []; // Para animar el balanceo independiente

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

// Carga de textura de hoja
const textureLoader = new THREE.TextureLoader();
const leafTexture = textureLoader.load('assets/leaf.png');

function createLilyPlant(posX, posZ, scale = 1.0, plantId = 1) {
    const plantRoot = new THREE.Group();
    plantRoot.position.set(posX, 1.3, posZ); // Apoyada sobre la mesa (Y = 1.3)
    plantRoot.scale.set(scale, scale, scale);
    scene.add(plantRoot);

    // --- Maceta y Sustrato ---
    const potMat = new THREE.MeshStandardMaterial({ color: 0x9a3412, roughness: 0.65 });
    const potMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.5, 1.1, 32), potMat);
    potMesh.position.y = 0.55;
    tagPart(potMesh, `Maceta #${plantId}`, "Contenedor de terracota para cultivo controlado.");
    plantRoot.add(potMesh);

    const rimMesh = new THREE.Mesh(new THREE.TorusGeometry(0.75, 0.06, 16, 32), potMat);
    rimMesh.rotation.x = Math.PI / 2;
    rimMesh.position.y = 1.1;
    tagPart(rimMesh, `Borde Maceta #${plantId}`, "Aro cerámico reforzado.");
    plantRoot.add(rimMesh);

    const soilMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.72, 0.72, 0.1, 32),
        new THREE.MeshStandardMaterial({ color: 0x271c19, roughness: 0.95 })
    );
    soilMesh.position.y = 1.05;
    tagPart(soilMesh, `Sustrato #${plantId}`, "Suelo estéril con turba y perlita para drenaje.");
    plantRoot.add(soilMesh);

    // --- Tallo y Jerarquía ---
    const stemGroup = new THREE.Group();
    stemGroup.position.set(0, 1.1, 0);
    plantRoot.add(stemGroup);
    plantStems.push({ group: stemGroup, offset: plantId * 1.5 });

    const stemHeight = 1.8;
    const stemMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.06, 0.08, stemHeight, 16),
        new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.4 })
    );
    stemMesh.position.y = stemHeight / 2;
    tagPart(stemMesh, `Tallo Caulinario #${plantId}`, "Haz vascular fotosintético de transporte floemático y xilemático.");
    stemGroup.add(stemMesh);

    // --- Hojas Helicoidales ---
    const leafMat = new THREE.MeshStandardMaterial({
        map: leafTexture,
        roughness: 0.4,
        side: THREE.DoubleSide,
        transparent: true
    });
    const leafGeo = new THREE.SphereGeometry(0.28, 16, 12);
    leafGeo.scale(1.7, 0.12, 0.55);

    const numLeaves = 7;
    for (let i = 0; i < numLeaves; i++) {
        const leafNode = new THREE.Group();
        const yPos = (i + 1) * (stemHeight / (numLeaves + 1.2));
        const rotY = i * (Math.PI * 0.55) + plantId;

        leafNode.position.set(0, yPos, 0);
        leafNode.rotation.y = rotY;

        const leafMesh = new THREE.Mesh(leafGeo, leafMat.clone());
        leafMesh.position.set(0.3, 0, 0);
        leafMesh.rotation.z = -0.22;
        tagPart(leafMesh, `Hoja #${i + 1} (Planta ${plantId})`, "Órgano laminar fotosintético con abundantes estomas.");
        leafNode.add(leafMesh);
        stemGroup.add(leafNode);
        leavesArray.push(leafMesh);
    }

    // --- Rama Lateral ---
    const branchGroup = new THREE.Group();
    branchGroup.position.set(0, 1.1, 0);
    branchGroup.rotation.z = plantId % 2 === 0 ? -Math.PI / 4.5 : Math.PI / 4.5;
    stemGroup.add(branchGroup);

    const branchMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.035, 0.05, 0.6, 12),
        new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.4 })
    );
    branchMesh.position.y = 0.3;
    tagPart(branchMesh, `Pecíolo Auxiliar #${plantId}`, "Prolongación caulinar de soporte foliar.");
    branchGroup.add(branchMesh);

    const branchLeaf = new THREE.Mesh(leafGeo, leafMat.clone());
    branchLeaf.position.set(0, 0.6, 0);
    branchLeaf.rotation.z = 0.35;
    tagPart(branchLeaf, `Hoja de Rama #${plantId}`, "Hoja axilar de fijación lumínica complementaria.");
    branchGroup.add(branchLeaf);
    leavesArray.push(branchLeaf);

    // --- Flor Apical (Conos que abren hacia arriba) ---
    const flowerGroup = new THREE.Group();
    flowerGroup.position.set(0, stemHeight, 0);
    stemGroup.add(flowerGroup);

    // Pistilo central
    const pistil = new THREE.Mesh(
        new THREE.ConeGeometry(0.14, 0.35, 16),
        new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.3 })
    );
    pistil.position.y = 0.12;
    tagPart(pistil, `Pistilo / Receptáculo #${plantId}`, "Órganos reproductivos y nectarios florales.");
    flowerGroup.add(pistil);

    // 6 Pétalos cónicos aplanados orientados en abanico
    const petalGeo = new THREE.ConeGeometry(0.28, 0.95, 16);
    petalGeo.scale(1.0, 1.0, 0.18);
    const petalMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.25 });

    for (let p = 0; p < 6; p++) {
        const petal = new THREE.Mesh(petalGeo, petalMat.clone());
        const angle = (p * Math.PI) / 3;
        petal.rotation.y = angle;
        petal.rotation.z = -Math.PI / 4; // Abre hacia arriba de forma natural
        petal.position.set(Math.cos(angle) * 0.32, 0.4, Math.sin(angle) * 0.32);
        tagPart(petal, `Pétalo #${p + 1} (Planta ${plantId})`, "Tépalo corolino reflectante de luz visible y UV.");
        flowerGroup.add(petal);
    }
}

// Instanciar las 3 azucenas sobre la mesa:
createLilyPlant(-2.4, 0, 0.9, 1); // Azucena izquierda (ligeramente más joven)
createLilyPlant(0, 0, 1.05, 2);   // Azucena central (espécimen principal)
createLilyPlant(2.4, 0, 0.95, 3);  // Azucena derecha

// =============================================================================
// 5. RAYCASTING: SELECCIÓN E INSPECCIÓN
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

        // Resaltar en cian
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
// 6. BUCLE DE ANIMACIÓN
// =============================================================================
const clock = new THREE.Clock();
let isAnimationActive = true;

function animate() {
    requestAnimationFrame(animate);

    if (isAnimationActive) {
        const time = clock.getElapsedTime();

        // Animar el balanceo de las 3 plantas con frecuencias desfasadas
        plantStems.forEach(({ group, offset }) => {
            group.rotation.z = Math.sin(time * 1.6 + offset) * 0.035;
            group.rotation.x = Math.cos(time * 1.2 + offset) * 0.025;
        });

        // Ondulación de hojas
        leavesArray.forEach((leaf, idx) => {
            leaf.rotation.x = Math.sin(time * 2.2 + idx) * 0.06;
        });
    }

    controls.update();
    renderer.render(scene, camera);
}
animate();

// =============================================================================
// 7. CONTROLES HTML
// =============================================================================
const btnToggleAnim = document.getElementById('btn-toggle-anim');
btnToggleAnim.addEventListener('click', () => {
    isAnimationActive = !isAnimationActive;
    btnToggleAnim.textContent = isAnimationActive ? '⏸️ Pausar Viento' : '▶️ Reanudar Viento';
});

const leafPalettes = [0x4caf50, 0xd4e157, 0x00b4d8, 0x16a34a];
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
    controls.target.set(0, 2.2, 0);
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
