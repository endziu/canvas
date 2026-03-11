import particle from './particle.js'
import { clamp, randomRange } from './utils.js'
import { drawCircle, drawLine, wrapBounds } from './helpers.js'

const canvas = document.getElementById('canvas')
const context = canvas.getContext('2d')

let width = (canvas.width = window.innerWidth)
let height = (canvas.height = window.innerHeight)

let numParticles = clamp(parseInt(width / 10, 10), 25, 200)
let maxDist = clamp(parseInt(width / 8, 10), 50, 200)

let particles = []

function createParticles(count) {
  particles = []
  for (let i = 0; i < count; i++) {
    const p = particle.create(
      randomRange(50, width - 50),
      randomRange(50, height - 50),
      randomRange(0.5, 2.0),
      randomRange(0, 2 * Math.PI),
    )
    p.friction = 0.999
    particles.push(p)
  }
}

function updateAndDraw(current_particle, index, arr) {
  wrapBounds(current_particle, width, height)
  current_particle.update()

  if (!current_particle.mass) {
    drawCircle(
      context,
      clamp(parseInt(width / 200), 2, 15),
      current_particle,
    )
    particles.forEach((item, i) => {
      if (
        i > index - 1 &&
        i < arr.length &&
        current_particle.distanceTo(item) < maxDist
      ) {
        const line_width =
          5 - (current_particle.distanceTo(item) / maxDist) * 5
        drawLine(context, current_particle, item, line_width)
      }
    })
  } else {
    drawCircle(
      context,
      clamp(parseInt(width / 250), 2, 10),
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
  numParticles = clamp(parseInt(width / 10, 10), 25, 200)
  maxDist = clamp(parseInt(width / 8, 10), 50, 200)
  createParticles(numParticles)
}

function mouseDownHandler(event) {
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
  for (let i = 0; i < numParticles; i++) {
    particles[i].addGravitation(m)
  }
  particles.push(m)
}

window.addEventListener('resize', windowResizeHandler, false)
window.addEventListener('mousedown', mouseDownHandler, false)
context.globalCompositeOperation = 'destination-over'
canvas.oncontextmenu = (e) => e.preventDefault()
createParticles(numParticles)
update()
