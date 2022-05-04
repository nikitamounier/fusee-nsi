import '/public/style.css'

import Micromodal from 'micromodal' // Micro-bibliothèque qui permet de montrer des "modales" / pop-ups

// Bibliothèque qui permet evironnement 3D dans site web, basé sur WebGL
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { InteractionManager } from 'three.interactive'

import * as TWEEN from '@tweenjs/tween.js' // Permet de calculer changement de valeurs durant une animation

import { Text } from 'troika-three-text' // Texte en 3D
import GlitchedWriter from 'glitched-writer' // Effet visuel de cryptage dans texte

// Setup des pages études

Micromodal.init()

// Setup de l'environnement 3D

const scene = new THREE.Scene()

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)

const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#bg')
})

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

// Setup du gérant d'interaction, pour pouvoir cliquer sur des objets 3D

const interactionManager = new InteractionManager(
  renderer,
  camera,
  renderer.domElement
)

// Control de souris / trackpad

const controls = new OrbitControls(camera, renderer.domElement)
controls.enableZoom = false

// Window resize listener
window.addEventListener('resize', onWindowResize, false)
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.render(scene, camera)
}

// Génération des étoiles

const geometry = new THREE.SphereGeometry(0.25, 24, 24)
const material = new THREE.MeshStandardMaterial({color: 0xffffff}) // couleur blanche
const starTemplate = new THREE.Mesh(geometry, material)

function etoile() { // création d'étoiles qui sont placés aléatoirement
  const star = starTemplate.clone() // pour la performance, afin de ne pas créer un tout nouveau objet 3D à chaque fois

  const x = THREE.MathUtils.randFloatSpread(500)
  const y = THREE.MathUtils.randFloatSpread(500)
  const z = THREE.MathUtils.randFloatSpread(500)

  star.position.set(x, y, z)
  scene.add(star)

  return star
}

const etoiles = Array(10000).fill().map(etoile) // iteration, façon programmation fonctionelle

// Ajout du model 3D de la fusée à la scène

const gltfLoader = new GLTFLoader() // GTLF: format pour objets 3D fait pour le web
gltfLoader.load(
  '/rocket.glb',
  (model) => {
    scene.add(model.scene)
    model.scene.scale.set(2, 2, 2)
    model.scene.position.setY(-15)
  }
)

// Texte et lignes qui se trouvent dans scène

const lineMaterial = new THREE.LineBasicMaterial({color: 0x33b5e5})
const lineGeometryTemplate = new THREE.BufferGeometry()

const textTemplate = new Text()
textTemplate.visible = false
textTemplate.font = 'https://fonts.gstatic.com/s/orbitron/v23/yMJMMIlzdpvBhQQL_SC3X9yhF25-T1nyxSmBoWg1fDAlp7lk.woff' // police de caractère futuristique
textTemplate.fontSize = 1.5
textTemplate.color = 0x33b5e5

const circleGeometry = new THREE.CircleGeometry(0.4, 32);
const circleMaterial = new THREE.MeshBasicMaterial({color: 0x33b5e5})
const circleTemplate = new THREE.Mesh(circleGeometry, circleMaterial)
circleTemplate.visible = false


function texte(text, x, y) {
  const label = textTemplate.clone()
  label.text = text
  label.position.x = x
  label.position.y = y

  return label
}

// Createur de ligne en-dessous de texte dans scène, avec petit point à la fin

function ligne(texteX, texteY, decalagePoint) {
    const startPoint = new THREE.Vector3(texteX, texteY-3, 0)
    const endPoint = new THREE.Vector3(0, texteY-3, 0)
    const lineGeometry = lineGeometryTemplate.clone().setFromPoints([startPoint, endPoint])
    const ligne = new THREE.Line(lineGeometry, lineMaterial.clone())
    ligne.visible = false

    const point = circleTemplate.clone()
    point.position.y = texteY - 3
    point.position.x = decalagePoint

    return [ligne, point]
}

// Ajoute interaciton avec texte – pouvoir cliquer dessus

function ajoutInteraction({titre, ligne, modal}) {
  titre.addEventListener("mouseover", (event) => {
    event.target.material.color.set(0x7dcbe8)
  })
  titre.addEventListener("mouseout", (event) => {
    event.target.material.color.set(0x33b5e5)
  })
  titre.addEventListener("click", (_) => {
      Micromodal.show(modal) // Montre l'étude
  })
  interactionManager.add(titre)
}

const partie1 = {
  titre: texte('Moteur & Poids', -20, 12),
  ligne: ligne(-20, 12, -1.65),
  modal: "modal-1"
}

const partie2 = {
  titre: texte('Carburant & Poids', 3, 5),
  ligne: ligne(18.5, 5, 2.25),
  modal: "modal-2"
}

const partie3 = {
  titre: texte('Impulsion Spécifique', -20, -3),
  ligne: ligne(-20, -3, -2.25),
  modal: "modal-3"
}

const partie4 = {
  titre: texte('Simulations', 8.5, -10),
  ligne: ligne(18, -10, 2.25),
  modal: "modal-4"
}

const parties = [partie1, partie2, partie3, partie4]

parties.forEach(({titre, ligne, modal}) => {
  scene.add(titre, ligne[0], ligne[1])
  ajoutInteraction({titre, ligne, modal})
  }
)

const devientVisible = ({titre, ligne}) => {
  titre.visible = true
  ligne[0].visible = true
  ligne[1].visible = true
}


// Bouton "Entrer"
const bouton = document.getElementById("enter")
const writer = new GlitchedWriter(bouton)
const mots = ['Entrer', 'Appuyer', 'Bienvenue']
writer.queueWrite(mots, 5000, true)

bouton.addEventListener("click", () => {
  bouton.style.display = 'none'

  // Animation lisse à nouvelle position quand on appuie sur bouton "Entrer"
  const coords = { x: camera.position.x, y: camera.position.y, z: camera.position.z}
  new TWEEN.Tween(coords)
    .to({ x: 0, y: 0, z: 30}, 2000)
    .easing(TWEEN.Easing.Quadratic.InOut)
    .onUpdate(() =>
      camera.position.set(coords.x, coords.y, coords.z)
    )
    .onComplete((_) => {
      parties.forEach(devientVisible)
    })
    .start()
}
)

// Boucle d'animation

function boucleAnimation() {
  requestAnimationFrame(boucleAnimation)


  // Simulation de l'effet de parallax (etoiles plus lointaines descendent moins vite) – calculé à la main
  etoiles.forEach(etoile => {
    if (camera.position.y - etoile.position.y > (300 - Math.max(Math.abs(etoile.position.z), Math.abs(etoile.position.x)))) {
      etoile.position.setY(500 - Math.max(Math.abs(etoile.position.z), Math.abs(etoile.position.x)))
    }
    etoile.position.setY(etoile.position.y - (1 / (0.5 * Math.max(Math.abs(etoile.position.z), Math.abs(etoile.position.x)))))
  })

  interactionManager.update()

  controls.update()

  TWEEN.update()

  renderer.render(scene, camera)
}

boucleAnimation()