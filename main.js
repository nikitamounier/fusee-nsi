import './style.css'

import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { InteractionManager } from 'three.interactive'

import * as TWEEN from '@tweenjs/tween.js'

import { Text } from 'troika-three-text'
import GlitchedWriter, { wait } from 'glitched-writer'
import { CircleGeometry } from 'three'


// Scene setup 
const scene = new THREE.Scene()

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)

const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#bg')
})

const interactionManager = new InteractionManager(
  renderer,
  camera,
  renderer.domElement
)

renderer.setPixelRatio(window.devicePixelRatio)
renderer.setSize(window.innerWidth, window.innerHeight)

camera.position.z = 6
camera.position.y = -29

const pointLight1 = new THREE.PointLight(0xffffff, 0.5)
pointLight1.position.set(5, 5, 5)

const pointLight2 = new THREE.PointLight(0xffffff, 0.5)
pointLight2.position.set(-5, 5, -5)

const ambientLight = new THREE.AmbientLight(0xffffff)
scene.add(pointLight1, pointLight2, ambientLight)

// Mouse / trackpad control

const controls = new OrbitControls(camera, renderer.domElement)
controls.enableZoom = false

// const axesHelper = new THREE.AxesHelper(5)
// scene.add( axesHelper )

// Window resize listener
window.addEventListener('resize', onWindowResize, false)
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.render(scene, camera)
}

// Star generation

const geometry = new THREE.SphereGeometry(0.25, 24, 24)
const material = new THREE.MeshStandardMaterial({color: 0xffffff})
const starTemplate = new THREE.Mesh(geometry, material)

function createStar() {
  
  const star = starTemplate.clone()

  const x = THREE.MathUtils.randFloatSpread(500)
  const y = THREE.MathUtils.randFloatSpread(500)
  const z = THREE.MathUtils.randFloatSpread(500)

  star.position.set(x, y, z)
  scene.add(star)

  return star
}

let stars = Array(10000).fill().map(createStar)

// Rocket

const gltfLoader = new GLTFLoader()
gltfLoader.load(
  'rocket.glb',
  (model) => {
    scene.add(model.scene)
    model.scene.scale.set(2, 2, 2)
    model.scene.position.setY(-15)
  }
)

// Labels

const lineMaterial = new THREE.LineBasicMaterial({color: 0x33b5e5})
const lineGeometryTemplate = new THREE.BufferGeometry()

const textTemplate = new Text()
textTemplate.visible = false
textTemplate.font = 'https://fonts.gstatic.com/s/orbitron/v23/yMJMMIlzdpvBhQQL_SC3X9yhF25-T1nyxSmBoWg1fDAlp7lk.woff'
textTemplate.fontSize = 1.5
textTemplate.color = 0x33b5e5

const circleGeometry = new THREE.CircleGeometry(1, 32);
const circleMaterial = new THREE.MeshBasicMaterial({color: 0x33b5e5})
const circleTemplate = new THREE.Mesh(circleGeometry, circleMaterial)
circleTemplate.visible = false


function createLabel(text, x, y) {
  const label = textTemplate.clone()
  label.text = text
  label.position.x = x
  label.position.y = y

  return label
}

function createLine(labelX, labelY) {
    const startPoint = new THREE.Vector3(labelX, labelY-3, 0)
    const endPoint = new THREE.Vector3(0, labelY-3, 0)
    const lineGeometry = lineGeometryTemplate.clone().setFromPoints([startPoint, endPoint])
    const line = new THREE.Line(lineGeometry, lineMaterial.clone())
    line.visible = false

    const dot = circleTemplate.clone()
    dot.position.x = endPoint

    return [line, dot]
}

const intro = {
  title: createLabel('Introduction', -15, 15),
  line: createLine(-15, 15)
}

const second = {
  title: createLabel('Partie 1', 9, 10),
  line: createLine(15, 10)
}

const third = {
  title: createLabel('Partie 2', -15, 5),
  line: createLine(-15, 5)
}

const fourth = {
  title: createLabel('Partie 3', 8, 0),
  line: createLine(15, 0)
}

const fifth = {
  title: createLabel('Partie 4', -15, -5),
  line: createLine(-15, -5)
}

const sixth = {
  title: createLabel('Partie 5', 8, -10),
  line: createLine(15, -10)
}

const labels = [intro, second, third, fourth, fifth, sixth]
labels.forEach(({title, line}) => {
  scene.add(title, line[0], line[1])
  }
)

const makeVisible = ({title, line}) => {
  title.visible = true
  line[0].visible = true
  line[1].visible = true
}


// Enter button
const button = document.getElementById("enter")
const writer = new GlitchedWriter(button)
const phrases = ['Entrer', 'Appuyer', 'Bienvenue']
writer.queueWrite(phrases, 5000, true)

button.addEventListener("click", () => {
  button.style.display = 'none'

  const coords = { x: camera.position.x, y: camera.position.y, z: camera.position.z}
  new TWEEN.Tween(coords)
    .to({ x: 0, y: 0, z: 30}, 2000)
    .easing(TWEEN.Easing.Quadratic.InOut)
    .onUpdate(() =>
      camera.position.set(coords.x, coords.y, coords.z)
    )
    .onComplete((_) => {
      labels.forEach(makeVisible)
    })
    .start()
}
)

// Animation loop

function animate() {
  requestAnimationFrame(animate)

  stars.forEach(star => {
    if (camera.position.y - star.position.y > (300 - Math.max(Math.abs(star.position.z), Math.abs(star.position.x)))) {
      star.position.setY(500 - Math.max(Math.abs(star.position.z), Math.abs(star.position.x)))
    }
    star.position.setY(star.position.y - (1 / (0.5 * Math.max(Math.abs(star.position.z), Math.abs(star.position.x)))))
  })

  controls.update()

  TWEEN.update()

  renderer.render(scene, camera)
}

animate()