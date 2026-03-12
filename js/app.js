import particle from './particle.js'
import { clamp, randomRange } from './utils.js'
import { drawCircle, drawLine, wrapBounds } from './helpers.js'

const canvas = document.getElementById('canvas')
const context = canvas.getContext('2d')

let width = (canvas.width = window.innerWidth)
let height = (canvas.height = window.innerHeight)

const numParticles = 200
let maxDist = clamp(parseInt(width / 8, 10), 50, 200)

let particles = []
let showGravityPoints = false

// Relative positions [x, y] as fractions of viewport, mass: 120=attract -120=repel
const gravityPointDefs = [
  // ring of attraction points
  { x: 0.50, y: 0.28, mass:  120 },
  { x: 0.57, y: 0.34, mass:  120 },
  { x: 0.60, y: 0.50, mass:  120 },
  { x: 0.57, y: 0.66, mass:  120 },
  { x: 0.50, y: 0.72, mass:  120 },
  { x: 0.43, y: 0.66, mass:  120 },
  { x: 0.40, y: 0.50, mass:  120 },
  { x: 0.43, y: 0.34, mass:  120 },
  // horizontal bar — left
  { x: 0.06, y: 0.50, mass:  120 },
  { x: 0.10, y: 0.50, mass:  120 },
  { x: 0.14, y: 0.50, mass:  120 },
  { x: 0.18, y: 0.50, mass:  120 },
  { x: 0.22, y: 0.50, mass:  120 },
  { x: 0.26, y: 0.50, mass:  120 },
  { x: 0.31, y: 0.50, mass:  120 },
  { x: 0.35, y: 0.50, mass:  120 },
  // horizontal bar — right
  { x: 0.65, y: 0.50, mass:  120 },
  { x: 0.69, y: 0.50, mass:  120 },
  { x: 0.72, y: 0.50, mass:  120 },
  { x: 0.78, y: 0.50, mass:  120 },
  { x: 0.82, y: 0.50, mass:  120 },
  { x: 0.86, y: 0.50, mass:  120 },
  { x: 0.90, y: 0.50, mass:  120 },
  { x: 0.94, y: 0.50, mass:  120 },

  // vertical bar — left
  { x: 0.50, y: 0.06, mass:  120 },
  { x: 0.50, y: 0.14, mass:  120 },
  { x: 0.50, y: 0.22, mass:  120 },
  { x: 0.50, y: 0.31, mass:  120 },
  // vertical bar — right
  { x: 0.50, y: 0.69, mass:  120 },
  { x: 0.50, y: 0.78, mass:  120 },
  { x: 0.50, y: 0.86, mass:  120 },
  { x: 0.50, y: 0.94, mass:  120 },

  // repulsion cluster in the center of the ring
  { x: 0.47, y: 0.44, mass: -120 },
  { x: 0.50, y: 0.42, mass: -120 },
  { x: 0.53, y: 0.44, mass: -120 },
  { x: 0.47, y: 0.50, mass: -120 },
  { x: 0.50, y: 0.52, mass: -120 },
  { x: 0.53, y: 0.50, mass: -120 },
  // scattered repulsion
  { x: 0.25, y: 0.18, mass: -120 },
  { x: 0.35, y: 0.28, mass: -120 },
  { x: 0.72, y: 0.36, mass: -120 },
  { x: 0.82, y: 0.28, mass: -120 },
  { x: 0.27, y: 0.68, mass: -120 },
  { x: 0.12, y: 0.74, mass: -120 },
  { x: 0.62, y: 0.64, mass: -120 },
  { x: 0.72, y: 0.74, mass: -120 },
]

function createGravityPoints() {
  gravityPointDefs.forEach(({ x, y, mass }) => {
    const m = particle.create(x * width, y * height, 0, 0)
    m.mass = mass
    particles.forEach((p) => { if (!p.mass) p.addGravitation(m) })
    particles.push(m)
  })
}

function createParticles(count) {
  particles = []
  for (let i = 0; i < count; i++) {
    const p = particle.create(
      randomRange(50, width - 50),
      randomRange(50, height - 50),
      randomRange(0.5, 2.0),
      randomRange(0, 2 * Math.PI),
    )
    p.friction = 0.97
    particles.push(p)
  }
  createGravityPoints()
}

function updateAndDraw(current_particle, index, arr) {
  wrapBounds(current_particle, width, height)
  current_particle.update()

  if (!current_particle.mass) {
    drawCircle(
      context,
      3,
      current_particle,
    )
    particles.forEach((item, i) => {
      if (
        i > index - 1 &&
        i < arr.length &&
        !item.mass &&
        current_particle.distanceTo(item) < maxDist
      ) {
        const line_width =
          5 - (current_particle.distanceTo(item) / maxDist) * 5
        drawLine(context, current_particle, item, line_width)
      }
    })
  } else if (showGravityPoints) {
    drawCircle(
      context,
      5,
      current_particle,
      current_particle.mass > 0 ? 'rgba(255,0,0,1.0)' : 'rgba(0,100,255,1.0)',
    )
  }
}

function update() {
  context.clearRect(0, 0, width, height)
  particles.forEach(updateAndDraw)
  window.requestAnimationFrame(update)
}

function windowResizeHandler() {
  width = canvas.width = window.innerWidth
  height = canvas.height = window.innerHeight
  maxDist = clamp(parseInt(width / 8, 10), 50, 200)
}

function mouseDownHandler(event) {
  if (event.target !== canvas) return
  const x = event.clientX - canvas.offsetLeft
  const y = event.clientY - canvas.offsetTop
  const m = particle.create(x, y, 0, 0)
  if (event.button === 0) {
    m.mass = 120
  } else if (event.button === 2) {
    m.mass = -120
  } else {
    return
  }
  particles.forEach((p) => { if (!p.mass) p.addGravitation(m) })
  particles.push(m)
}

document.getElementById('reset').addEventListener('click', () => createParticles(numParticles))
document.getElementById('clear-gravity').addEventListener('click', () => {
  particles = particles.filter((p) => !p.mass)
  particles.forEach((p) => { p.gravitations = [] })
})
document.getElementById('toggle-gravity').addEventListener('click', (e) => {
  showGravityPoints = !showGravityPoints
  e.target.textContent = showGravityPoints ? 'hide debug' : 'debug'
})
window.addEventListener('resize', windowResizeHandler, false)
window.addEventListener('mousedown', mouseDownHandler, false)
context.globalCompositeOperation = 'lighter'
canvas.oncontextmenu = (e) => e.preventDefault()
createParticles(numParticles)
update()
