# Practica 03: Construcción procedural de una planta 3D (Geometría, L-Systems y Modelos)

* **Materia:** Bioinformatica y Biologia Computacional Avanzados
* **Estudiantes:** Victoria Angélica Galarza Pérez y Fernando José Alexander Cruz Castro

---

## Descripción del Proyecto
Este proyecto consiste en un **Laboratorio Botánico Interactivo 3D** desarrollado en Three.js. Representa un espécimen de azucena (*Lilium candidum*) modelado enteramente mediante el ensamblaje de geometrías primitivas y transformaciones en grafos de escena (`THREE.Group`), permitiendo inspeccionar la morfología botánica mediante **Raycasting** y manipular el entorno con una botonera HTML interactiva.

---

## Requisitos Técnicos Cumplidos

1. **Geometrías Primitivas Utilizadas (4 tipos):**
   * `CylinderGeometry`: Sustrato, tallo principal, ramificación lateral y cuerpo de la maceta.
   * `SphereGeometry`: Hojas lanceoladas procedurales (deformadas mediante escala no uniforme).
   * `ConeGeometry`: Pétalos coronarios de la flor y pistilo central.
   * `TorusGeometry`: Borde superior reforzado de la maceta.
2. **Jerarquías (`THREE.Group`):**
   * Raíz `plantRootGroup` $\rightarrow$ `stemGroup` $\rightarrow$ `branchGroup` / `flowerGroup` $\rightarrow$ Hojas y Pétalos. Esto permite que el balanceo del tallo mueva orgánicamente todas las estructuras hijas.
3. **Materiales e Iluminación:**
   * Uso de `MeshStandardMaterial` con cálculo de aspereza (*roughness*) y mapas de sombras suaves (`PCFSoftShadowMap`).
   * Iluminación tripartita: `AmbientLight`, `DirectionalLight` (con sombras proyectadas) y `PointLight` decorativa.
4. **Interacción con Raycasting:**
   * Al hacer clic sobre cualquier parte (tallo, flor, hojas, maceta), se resalta en cian brillante y se despliega una ficha con: nombre, tipo de geometría interna, altura en metros sobre el suelo ($Y$) y descripción funcional botánica.
5. **Panel de Control UI:**
   * Pausa/reanudación del viento.
   * Alternador de pigmentación foliar.
   * Toggle de visibilidad de follaje.
   * Reseteo suave de cámara OrbitControls.
   * Control deslizante de potencia lumínica.