import * as THREE from "three";
import {OrbitControls} from "three/addons/controls/OrbitControls.js";
import {GUI} from "https://cdn.skypack.dev/lil-gui@0.17.0";

const containerEl = document.querySelector(".globe-wrapper");
const canvasEl = containerEl.querySelector("#globe-3d");
const svgMapDomEl = document.querySelector("#map");
const svgCountries = Array.from(svgMapDomEl.querySelectorAll("path"));
const svgCountryDomEl = document.querySelector("#country");

let renderer, scene, camera, rayCaster, pointer, controls;
let globeGroup, globeColorMesh, globeStrokesMesh, globeSelectionOuterMesh;

const svgViewBox = [2000, 1000];
const offsetY = -.1;

const params = {
    strokeColor: "#43eb01",
    defaultColor: "rgba(255,255,255,0)",
    hoverColor: "#00C9A2",
    fogColor: "#43eb01",
    fogDistance: 2.65,
    strokeWidth: 2,
    hiResScalingFactor: 2,
    lowResScalingFactor: .7
}


let hoveredCountryIdx = 6;
let isTouchScreen = false;
let isHoverable = true;

const textureLoader = new THREE.TextureLoader();
let staticMapUri;
const bBoxes = [];
const dataUris = [];


initScene();
createControls();

window.addEventListener("resize", updateSize);

function updateMousePosition(eX, eY) {
    pointer.x = (eX - containerEl.offsetLeft) / containerEl.offsetWidth * 2 - 1;
    pointer.y = -((eY - containerEl.offsetTop) / containerEl.offsetHeight) * 2 + 1;
}


function initScene() {
    renderer = new THREE.WebGLRenderer({canvas: canvasEl, alpha: true});
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(params.fogColor, 0, params.fogDistance);

    camera = new THREE.OrthographicCamera(-2.4, 2.4, 2.4, -2.4, 0, 6); // Измененная камера
    camera.position.z = 2.6; // Измененное положение камеры

    globeGroup = new THREE.Group();
    scene.add(globeGroup);

    rayCaster = new THREE.Raycaster();
    rayCaster.far = 1.15;
    pointer = new THREE.Vector2(-1, -1);

    createOrbitControls();
    createGlobe();
    prepareHiResTextures();
    prepareLowResTextures();

    updateSize();

    gsap.ticker.add(render);
}




function createOrbitControls() {
    controls = new OrbitControls(camera, canvasEl);
    controls.enablePan = false;
    controls.enableZoom = false; // Отключаем масштабирование
    controls.enableDamping = true;
    controls.minPolarAngle = .46 * Math.PI;
    controls.maxPolarAngle = .46 * Math.PI;
    controls.autoRotate = true;
    controls.autoRotateSpeed *= 1.2;

}

function createGlobe() {
    const globeGeometry = new THREE.IcosahedronGeometry(2, 20); // Измененный радиус глобуса

    const globeColorMaterial = new THREE.MeshBasicMaterial({
        transparent: true,
        alphaTest: true,
        side: THREE.DoubleSide
    });
    const globeStrokeMaterial = new THREE.MeshBasicMaterial({
        transparent: true,
        depthTest: false,
    });
    const outerSelectionColorMaterial = new THREE.MeshBasicMaterial({
        transparent: true,
        side: THREE.DoubleSide
    });

    globeColorMesh = new THREE.Mesh(globeGeometry, globeColorMaterial);
    globeStrokesMesh = new THREE.Mesh(globeGeometry, globeStrokeMaterial);
    globeSelectionOuterMesh = new THREE.Mesh(globeGeometry, outerSelectionColorMaterial);

    globeStrokesMesh.renderOrder = 2;

    globeGroup.add(globeStrokesMesh, globeSelectionOuterMesh, globeColorMesh);
}


function setMapTexture(material, URI) {
    textureLoader.load(
        URI,
        (t) => {
            t.repeat.set(1, 1);
            material.map = t;
            material.needsUpdate = true;
        });
}

function prepareHiResTextures() {
    let svgData;
    gsap.set(svgMapDomEl, {
        attr: {
            "viewBox": "0 " + (offsetY * svgViewBox[1]) + " " + svgViewBox[0] + " " + svgViewBox[1],
            "stroke-width": params.strokeWidth,
            "stroke": params.strokeColor,
            "fill": params.defaultColor,
            "width": svgViewBox[0] * params.hiResScalingFactor,
            "height": svgViewBox[1] * params.hiResScalingFactor,
        }
    })
    svgData = new XMLSerializer().serializeToString(svgMapDomEl);
    staticMapUri = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svgData);
    setMapTexture(globeColorMesh.material, staticMapUri);

    gsap.set(svgMapDomEl, {
        attr: {
            "fill": "none",
            "stroke": params.strokeColor,
        }
    })
    svgData = new XMLSerializer().serializeToString(svgMapDomEl);
    staticMapUri = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svgData);
    setMapTexture(globeStrokesMesh.material, staticMapUri);

}

function prepareLowResTextures() {
    gsap.set(svgCountryDomEl, {
        attr: {
            "viewBox": "0 " + (offsetY * svgViewBox[1]) + " " + svgViewBox[0] + " " + svgViewBox[1],
            "stroke-width": params.strokeWidth,
            "stroke": params.strokeColor,
            // "fill": params.hoverColor,
            "width": svgViewBox[0] * params.lowResScalingFactor,
            "height": svgViewBox[1] * params.lowResScalingFactor,
        }
    })
    svgCountries.forEach((path, idx) => {
        bBoxes[idx] = path.getBBox();
    })
    svgCountries.forEach((path, idx) => {
        svgCountryDomEl.innerHTML = "";
        svgCountryDomEl.appendChild(svgCountries[idx].cloneNode(true));
        const svgData = new XMLSerializer().serializeToString(svgCountryDomEl);
        dataUris[idx] = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svgData);
    })
    setMapTexture(globeSelectionOuterMesh.material, staticMapUri);

}

function render() {
    controls.update();

    if (isTouchScreen && isHoverable) {
        isHoverable = false;
    }

    renderer.render(scene, camera);
}

function updateSize() {
    const side = Math.min(600, Math.min(window.innerWidth, window.innerHeight) - 50);
    containerEl.style.width = side + "px";
    containerEl.style.height = side + "px";
    renderer.setSize(side, side);
}

