import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// =============================================================================
// 1. CONFIGURACIÓN BASE: CÁMARA, RENDERER Y ESCENA CLARA
// =============================================================================
const container = document.getElementById('canvas-container');

const scene = new THREE.Scene();
// Fondo claro de laboratorio clínico
scene.background = new THREE.Color(0xdbeafe);
scene.fog = new THREE.Fog(0xdbeafe, 12, 32);

const initialCameraPos = new THREE.Vector3(0, 3.8, 7.2);
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
controls.target.set(0, 2.0, 0);
controls.maxPolarAngle = Math.PI / 2 - 0.02;

// =============================================================================
// 2. ILUMINACIÓN BRILLANTE DE LABORATORIO
// =============================================================================
// Luz ambiental diurna y difusa
const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
scene.add(ambientLight);

// Luz principal de techo (blanco neutro de laboratorio)
const dirLight = new THREE.DirectionalLight(0xffffff, 1.6);
dirLight.position.set(4, 9, 5);
dirLight.castShadow = true;
dirLight.shadow.mapSize.set(2048, 2048);
dirLight.shadow.bias = -0.0001;
scene.add(dirLight);

// Lámpara de cultivo LED (luz violeta fitocromo para estimular fotosíntesis)
const growLight = new THREE.PointLight(0xa855f7, 1.4, 6);
growLight.position.set(0, 4.2, 0);
scene.add(growLight);

// =============================================================================
// 3. ARQUITECTURA DEL LABORATORIO (PAREDES CLARAS Y PISO EPÓXICO)
// =============================================================================
// Suelo vinílico/epóxico de laboratorio (gris claro brillante)
const floorMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.25, metalness: 0.1 });
const floorMesh = new THREE.Mesh(new THREE.PlaneGeometry(26, 26), floorMat);
floorMesh.rotation.x = -Math.PI / 2;
floorMesh.receiveShadow = true;
scene.add(floorMesh);

const gridHelper = new THREE.GridHelper(26, 26, 0x94a3b8, 0xcbd5e1);
gridHelper.position.y = 0.005;
scene.add(gridHelper);

// Pared trasera de baldosas de laboratorio con zócalo
const backWallMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.4 });
const backWall = new THREE.Mesh(new THREE.PlaneGeometry(26, 12), backWallMat);
backWall.position.set(0, 6, -4.5);
backWall.receiveShadow = true;
scene.add(backWall);

// Zócalo sanitario protector (franja inferior azul/gris)
const baseboard = new THREE.Mesh(
    new THREE.BoxGeometry(26, 0.4, 0.1),
    new THREE.MeshStandardMaterial({ color: 0x3b82f6, roughness: 0.3 })
);
baseboard.position.set(0, 0.2, -4.45);
scene.add(baseboard);

// Ventanal de cristal con marco de aluminio hacia el exterior
const windowFrame = new THREE.Mesh(
    new THREE.BoxGeometry(11, 4.8, 0.15),
    new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.8, roughness: 0.2 })
);
windowFrame.position.set(0, 5.2, -4.42);
scene.add(windowFrame);

// Cristal con tono cian transparente de invernadero
const windowGlass = new THREE.Mesh(
    new THREE.PlaneGeometry(10.6, 4.4),
    new THREE.MeshPhysicalMaterial({
        color: 0x7dd3fc,
        transparent: true,
        opacity: 0.45,
        roughness: 0.05,
        transmission: 0.9
    })
);
windowGlass.position.set(0, 5.2, -4.34);
scene.add(windowGlass);

// =============================================================================
// 4. MOBILIARIO Y EQUIPO DE LABORATORIO BOTÁNICO
// =============================================================================
// Mesa de experimentación (acero inoxidable con borde biselado)
const tableTop = new THREE.Mesh(
    new THREE.BoxGeometry(9, 0.2, 2.8),
    new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.2, metalness: 0.3 })
);
tableTop.position.set(0, 1.2, 0);
tableTop.castShadow = true;
tableTop.receiveShadow = true;
scene.add(tableTop);

// Patas metálicas de la mesa
const legMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.85, roughness: 0.25 });
const legPositions = [[-4.2, 0.6, -1.2], [4.2, 0.6, -1.2], [-4.2, 0.6, 1.2], [4.2, 0.6, 1.2]];
legPositions.forEach(([x, y, z]) => {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.2, 16), legMat);
    leg.position.set(x, y, z);
    leg.castShadow = true;
    scene.add(leg);
});

// Lámpara colgante de cultivo botánico (con emisión violeta)
const growLampFixture = new THREE.Mesh(
    new THREE.BoxGeometry(6.5, 0.15, 0.6),
    new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.7 })
);
growLampFixture.position.set(0, 4.3, 0);
scene.add(growLampFixture);

const growLedPanel = new THREE.Mesh(
    new THREE.PlaneGeometry(6.2, 0.45),
    new THREE.MeshBasicMaterial({ color: 0xd8b4fe })
);
growLedPanel.rotation.x = Math.PI / 2;
growLedPanel.position.set(0, 4.22, 0);
scene.add(growLedPanel);

// --- Materiales de Vidrio y Reactivos Químicos ---
const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.35,
    roughness: 0.05,
    transmission: 0.92,
    ior: 1.5
});

// Matraz Erlenmeyer con solución azul de sulfato (Lado Izquierdo)
const flaskGroup = new THREE.Group();
flaskGroup.position.set(-3.7, 1.3, 0.6);

const flaskBase = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.45, 24), glassMat);
flaskBase.position.y = 0.22;
flaskGroup.add(flaskBase);

const flaskNeck = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.25, 24), glassMat);
flaskNeck.position.y = 0.48;
flaskGroup.add(flaskNeck);

// Líquido reactivo azul dentro del matraz
const liquidMesh = new THREE.Mesh(
    new THREE.ConeGeometry(0.20, 0.25, 24),
    new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.2, transparent: true, opacity: 0.85 })
);
liquidMesh.position.y = 0.13;
flaskGroup.add(liquidMesh);
scene.add(flaskGroup);

// Gradilla con tubos de ensayo coloridos (Lado Derecho)
const rackGroup = new THREE.Group();
rackGroup.position.set(3.6, 1.3, 0.5);

const rackBase = new THREE.Mesh(
    new THREE.BoxGeometry(0.8, 0.05, 0.3),
    new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.6 })
);
rackBase.position.y = 0.025;
rackGroup.add(rackBase);

const rackTop = rackBase.clone();
rackTop.position.y = 0.35;
rackGroup.add(rackTop);

// 4 tubos con soluciones botánicas (Verde, Ámbar, Rojo, Turquesa)
const tubeColors = [0x22c55e, 0xf59e0b, 0xef4444, 0x06b6d4];
tubeColors.forEach((col, idx) => {
    const tubeX = -0.26 + idx * 0.18;
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

// Microscopio binocular de laboratorio
const microscopeGroup = new THREE.Group();
microscopeGroup.position.set(-3.7, 1.3, -0.6);

const scopeBase = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.06, 0.5), legMat);
scopeBase.position.y = 0.03;
microscopeGroup.add(scopeBase);

const scopeArm = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.5, 16), legMat);
scopeArm.position.set(0, 0.28, -0.15);
scopeArm.rotation.x = -0.2;
microscopeGroup.add(scopeArm);

const scopeHead = new THREE.Mesh(
    new THREE.CylinderGeometry(0.06, 0.06, 0.25, 16),
    new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4 })
);
scopeHead.position.set(0, 0.5, 0);
scopeHead.rotation.x = 0.3;
microscopeGroup.add(scopeHead);
scene.add(microscopeGroup);

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

    // Placa de identificación botánica frente a la maceta
    const tagMesh = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, 0.15, 0.02),
        new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.3 })
    );
    tagMesh.position.set(0, 0.1, 0.85);
    tagMesh.rotation.x = -0.3;
    tagPart(tagMesh, `Ficha Clínica [${specimenCode}]`, "Registro de control genético e hidratación del espécimen.");
    plantRoot.add(tagMesh);

    // Maceta de cultivo cilíndrica de polímero blanco de invernadero
    const potMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.35 });
    const potMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.52, 1.1, 32), potMat);
    potMesh.position.y = 0.55;
    tagPart(potMesh, `Maceta Hidropónica #${plantId}`, "Contenedor estéril de polímero aislante para cultivo biológico.");
    plantRoot.add(potMesh);

    const rimMesh = new THREE.Mesh(new THREE.TorusGeometry(0.75, 0.06, 16, 32), potMat);
    rimMesh.rotation.x = Math.PI / 2;
    rimMesh.position.y = 1.1;
    tagPart(rimMesh, `Aro de Maceta #${plantId}`, "Borde reforzado de fijación para tutores de crecimiento.");
    plantRoot.add(rimMesh);

    // Sustrato oscuro enriquecido
    const soilMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.72, 0.72, 0.1, 32),
        new THREE.MeshStandardMaterial({ color: 0x1c1917, roughness: 0.95 })
    );
    soilMesh.position.y = 1.05;
    tagPart(soilMesh, `Sustrato Nutritivo #${plantId}`, "Mezcla de fibra de coco, turba y microelementos bioactivos.");
    plantRoot.add(soilMesh);

    // Tallo y balanceo
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
    tagPart(stemMesh, `Tallo Caulinario #${plantId}`, "Tejido vascular continuo (xilema y floema) con alto contenido de clorofila.");
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
        tagPart(leafMesh, `Hoja #${i + 1} (${specimenCode})`, "Órgano laminar responsable de la captación fotónica y síntesis de glucosa.");
        leafNode.add(leafMesh);
        stemGroup.add(leafNode);
        leavesArray.push(leafMesh);
    }

    // Rama auxiliar
    const branchGroup = new THREE.Group();
    branchGroup.position.set(0, 1.1, 0);
    branchGroup.rotation.z = plantId % 2 === 0 ? -Math.PI / 4.8 : Math.PI / 4.8;
    stemGroup.add(branchGroup);

    const branchMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.035, 0.05, 0.6, 12),
        new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.4 })
    );
    branchMesh.position.y = 0.3;
    tagPart(branchMesh, `Pecíolo Auxiliar #${plantId}`, "Prolongación vascular lateral para orientación hacia la fuente de radiación.");
    branchGroup.add(branchMesh);

    const branchLeaf = new THREE.Mesh(leafGeo, leafMat.clone());
    branchLeaf.position.set(0, 0.6, 0);
    branchLeaf.rotation.z = 0.35;
    tagPart(branchLeaf, `Hoja Axilar (${specimenCode})`, "Estructura foliar suplementaria.");
    branchGroup.add(branchLeaf);
    leavesArray.push(branchLeaf);

    // Flor Apical (Abierta hacia arriba)
    const flowerGroup = new THREE.Group();
    flowerGroup.position.set(0, stemHeight, 0);
    stemGroup.add(flowerGroup);

    // Pistilo central amarillo
    const pistil = new THREE.Mesh(
        new THREE.ConeGeometry(0.14, 0.35, 16),
        new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.25 })
    );
    pistil.position.y = 0.12;
    tagPart(pistil, `Pistilo Central (${specimenCode})`, "Complejo estigma-estilo que concentra los granos de polen fértil.");
    flowerGroup.add(pistil);

    // Pétalos blancos de azucena orientados hacia arriba
    const petalGeo = new THREE.ConeGeometry(0.28, 0.95, 16);
    petalGeo.scale(1.0, 1.0, 0.18);
    const petalMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 });

    for (let p = 0; p < 6; p++) {
        const petal = new THREE.Mesh(petalGeo, petalMat.clone());
        const angle = (p * Math.PI) / 3;
        petal.rotation.y = angle;
        petal.rotation.z = -Math.PI / 4;
        petal.position.set(Math.cos(angle) * 0.32, 0.4, Math.sin(angle) * 0.32);
        tagPart(petal, `Pétalo #${p + 1} (${specimenCode})`, "Tépalo corolino blanco reflejante de alta pureza fenotípica.");
        flowerGroup.add(petal);
    }
}

// Generar las 3 azucenas distribuidas en la mesa de laboratorio:
createLilyPlant(-2.3, 0, 0.92, 1, "LC-Alfa");
createLilyPlant(0.0, 0, 1.05, 2, "LC-Control");
createLilyPlant(2.3, 0, 0.95, 3, "LC-Beta");

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

        // Brillo cian al seleccionar
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
// 7. ANIMACIÓN (VENTILACIÓN CONTROLADA)
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
    controls.target.set(0, 2.0, 0);
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
