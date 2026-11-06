import * as THREE from 'three';
import { STLLoader } from 'three/addons/loaders/STLLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { toCreasedNormals } from 'three/addons/utils/BufferGeometryUtils.js';

window.__aeroStarted = true;

const MODEL_URL = 'models/AERO-X1.stl';
const TARGET_SIZE = 3; // größte Modellabmessung in Szeneneinheiten

const stage = document.getElementById('stage');
const canvas = document.getElementById('viewer');
const statusEl = document.getElementById('status');
const statusText = document.getElementById('statusText');
const statusBar = document.getElementById('statusBar');
const fileInput = document.getElementById('stlFile');
const fileNameEl = document.getElementById('fileName');
const rotateBtn = document.getElementById('toggleRotate');
const orientBtn = document.getElementById('toggleOrient');

/* ---------- Renderer, Szene, Kamera ---------- */
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;

const scene = new THREE.Scene();
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture; // Spiegelungen für Metall

const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 200);

/* ---------- Beleuchtung ---------- */
scene.add(new THREE.HemisphereLight(0xffffff, 0x20232a, 0.5));
const key = new THREE.DirectionalLight(0xffffff, 2.2);
key.position.set(5, 7, 6);
scene.add(key);
const rim = new THREE.DirectionalLight(0xbcd0ff, 1.4);
rim.position.set(-6, 3, -5);
scene.add(rim);
const warm = new THREE.PointLight(0xc8a86a, 18, 30, 2);
warm.position.set(0, -3, 4);
scene.add(warm);

/* ---------- Boden-Ring (dezenter Goldakzent) ---------- */
const ring = new THREE.Mesh(
  new THREE.RingGeometry(3.1, 3.14, 128),
  new THREE.MeshBasicMaterial({ color: 0xc8a86a, transparent: true, opacity: 0.45, side: THREE.DoubleSide })
);
ring.rotation.x = -Math.PI / 2;
ring.position.y = -1.9;
scene.add(ring);

/* ---------- Steuerung ---------- */
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.enablePan = false;
controls.autoRotate = true;
controls.autoRotateSpeed = 2; // 2 = eine volle Drehung (360°) in ca. 30 Sekunden
controls.minDistance = 3;
controls.maxDistance = 25;

/* ---------- Modell ---------- */
const material = new THREE.MeshStandardMaterial({
  color: 0xeceef2,
  metalness: 0.85,
  roughness: 0.27,
  envMapIntensity: 1.1
});

const holder = new THREE.Group();
scene.add(holder);
let mesh = null;

// STL-Dateien sind oft "Z oben" (CAD). Three.js nutzt "Y oben" – daher drei Ausrichtungen zum Durchschalten.
const orientations = [-Math.PI / 2, Math.PI / 2, 0];
let orientIndex = 0;

function applyOrientation() {
  if (mesh) mesh.rotation.set(orientations[orientIndex], 0, 0);
}

function fitCamera() {
  const aspect = camera.aspect || 1;
  const dist = 8.2 * (aspect < 1 ? Math.min(1.8, 1 / Math.pow(aspect, 0.7)) : 1);
  camera.position.set(dist * 0.55, dist * 0.22, dist * 0.8);
  controls.target.set(0, 0, 0);
  controls.update();
}

function showModel(geometry, label) {
  const pos = geometry.getAttribute('position');
  if (!pos || pos.count < 3) throw new Error('Die Datei enthält keine gültigen 3D-Daten.');

  geometry.deleteAttribute('normal');
  let geo = geometry;
  try { geo = toCreasedNormals(geometry, Math.PI / 5); } catch (e) { geo.computeVertexNormals(); }

  geo.computeBoundingBox();
  geo.center(); // exakt in den Ursprung zentrieren
  const size = new THREE.Vector3();
  geo.boundingBox.getSize(size);
  const maxDim = Math.max(size.x, size.y, size.z);
  if (!isFinite(maxDim) || maxDim === 0) throw new Error('Das Modell hat keine Ausdehnung.');

  if (mesh) { holder.remove(mesh); mesh.geometry.dispose(); }
  mesh = new THREE.Mesh(geo, material);
  mesh.scale.setScalar(TARGET_SIZE / maxDim);
  holder.add(mesh);
  applyOrientation();
  fitCamera();

  fileNameEl.textContent = label;
  hideStatus();
}

/* ---------- Status-Anzeige ---------- */
function setStatus(text, { error = false, progress = null } = {}) {
  statusEl.classList.remove('hidden');
  statusEl.classList.toggle('error', error);
  statusText.textContent = text;
  statusBar.style.width = progress === null ? '0%' : Math.round(progress * 100) + '%';
}
function hideStatus() { statusEl.classList.add('hidden'); }

/* ---------- Laden: Standarddatei ---------- */
const loader = new STLLoader();

setStatus('Modell wird geladen …', { progress: 0 });
loader.load(
  MODEL_URL,
  (geometry) => {
    try { showModel(geometry, 'AERO-X1.stl'); }
    catch (err) { setStatus(err.message + ' Bitte wähle deine STL-Datei über „STL-Datei laden“.', { error: true }); }
  },
  (xhr) => { if (xhr.lengthComputable) setStatus('Modell wird geladen …', { progress: xhr.loaded / xhr.total }); },
  () => setStatus(
    'Keine Datei unter models/AERO-X1.stl gefunden. Wähle deine STL-Datei über „STL-Datei laden“ aus oder lege sie in den Ordner models/. (Lokal bitte über einen kleinen Webserver öffnen, siehe README.)',
    { error: true }
  )
);

/* ---------- Laden: Upload & Drag-and-drop ---------- */
async function loadFile(file) {
  if (!file) return;
  if (!/\.stl$/i.test(file.name)) {
    setStatus('Bitte eine Datei mit der Endung .stl auswählen.', { error: true });
    return;
  }
  setStatus('Datei wird gelesen …', { progress: 0.5 });
  try {
    const buffer = await file.arrayBuffer();
    showModel(loader.parse(buffer), file.name);
  } catch (err) {
    setStatus('Die STL-Datei konnte nicht gelesen werden: ' + err.message, { error: true });
  }
}

fileInput.addEventListener('change', () => { loadFile(fileInput.files[0]); fileInput.value = ''; });

['dragenter', 'dragover'].forEach((ev) =>
  stage.addEventListener(ev, (e) => { e.preventDefault(); stage.classList.add('dragging'); }));
['dragleave', 'drop'].forEach((ev) =>
  stage.addEventListener(ev, (e) => { e.preventDefault(); stage.classList.remove('dragging'); }));
stage.addEventListener('drop', (e) => loadFile(e.dataTransfer.files[0]));

/* ---------- Buttons ---------- */
function updateRotateLabel() {
  rotateBtn.textContent = controls.autoRotate ? '❚❚ Drehung pausieren' : '▶ Drehung fortsetzen';
}
rotateBtn.addEventListener('click', () => { controls.autoRotate = !controls.autoRotate; updateRotateLabel(); });
orientBtn.addEventListener('click', () => { orientIndex = (orientIndex + 1) % orientations.length; applyOrientation(); });

/* ---------- Navigation: weich scrollen + Bereich hervorheben ---------- */
document.querySelectorAll('.nav a').forEach((link) => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const target = document.getElementById(link.dataset.target);
    if (!target) return;
    target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    target.classList.add('flash');
    setTimeout(() => target.classList.remove('flash'), 1800);
  });
});

/* ---------- Größe anpassen & Render-Schleife ---------- */
function resize() {
  const w = stage.clientWidth;
  const h = stage.clientHeight;
  if (!w || !h) return;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
new ResizeObserver(resize).observe(stage);
resize();

renderer.setAnimationLoop(() => {
  controls.update();
  renderer.render(scene, camera);
});
