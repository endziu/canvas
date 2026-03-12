import particle from './particle.js'
import { clamp, randomRange } from './utils.js'
import { drawCircle, drawLine, wrapBounds } from './helpers.js'
import defaults from './defaults.js'

const canvas = document.getElementById('canvas')
const context = canvas.getContext('2d')

let width = (canvas.width = window.innerWidth)
let height = (canvas.height = window.innerHeight)

let numParticles = 512
let particleRadius = 3
let maxDist = clamp(parseInt(width / 8, 10), 50, 200)
// let maxDist = 150

let particles = []
let showGravityPoints = false
let placingEnabled = true

let activeLayout = 'cross'
const STORAGE_KEY = 'canvas-saved-layouts'
const layoutSelect = document.getElementById('layout')

function getAllLayouts() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}
  } catch { return {} }
}

function saveAllLayouts(all) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
}

function seedDefaults() {
  if (localStorage.getItem(STORAGE_KEY)) return
  saveAllLayouts(defaults)
}

function populateOptions() {
  layoutSelect.innerHTML = ''
  const all = getAllLayouts()
  Object.keys(all).forEach((name) => {
    const opt = document.createElement('option')
    opt.value = name
    opt.textContent = name
    layoutSelect.appendChild(opt)
  })
  layoutSelect.value = activeLayout
}

function getActiveLayoutDefs() {
  return getAllLayouts()[activeLayout] || []
}

function createGravityPoints() {
  const defs = getActiveLayoutDefs()
  defs.forEach(({ x, y, mass }) => {
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
      particleRadius,
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
  if (!placingEnabled) return
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

layoutSelect.addEventListener('change', (e) => {
  activeLayout = e.target.value
  createParticles(numParticles)
})
document.getElementById('reset').addEventListener('click', () => createParticles(numParticles))
document.getElementById('clear-gravity').addEventListener('click', () => {
  particles = particles.filter((p) => !p.mass)
  particles.forEach((p) => { p.gravitations = [] })
})
document.getElementById('save-layout').addEventListener('click', () => {
  const gravityPoints = particles
    .filter((p) => p.mass)
    .map((p) => ({
      x: p.position.getX() / width,
      y: p.position.getY() / height,
      mass: p.mass,
    }))
  if (gravityPoints.length === 0) return
  const saved = getAllLayouts()
  const defaultName = 'save ' + (Object.keys(saved).length + 1)
  const name = prompt('Layout name:', defaultName)
  if (!name) return
  saved[name] = gravityPoints
  saveAllLayouts(saved)
  populateOptions()
  layoutSelect.value = name
  activeLayout = name
})
document.getElementById('rename-layout').addEventListener('click', () => {
  const saved = getAllLayouts()
  if (!saved[activeLayout]) return
  const newName = prompt('Rename layout:', activeLayout)
  if (!newName || newName === activeLayout || saved[newName]) return
  saved[newName] = saved[activeLayout]
  delete saved[activeLayout]
  saveAllLayouts(saved)
  activeLayout = newName
  populateOptions()
  layoutSelect.value = newName
})
document.getElementById('import-layouts').addEventListener('click', () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.json'
  input.addEventListener('change', () => {
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const imported = JSON.parse(reader.result)
        const all = getAllLayouts()
        Object.assign(all, imported)
        saveAllLayouts(all)
        populateOptions()
      } catch { /* invalid json */ }
    }
    reader.readAsText(input.files[0])
  })
  input.click()
})
document.getElementById('export-layouts').addEventListener('click', () => {
  const blob = new Blob(
    [JSON.stringify(getAllLayouts(), null, 2)],
    { type: 'application/json' },
  )
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = 'data.json'
  a.click()
  URL.revokeObjectURL(a.href)
})
document.getElementById('remove-layout').addEventListener('click', () => {
  const saved = getAllLayouts()
  if (!saved[activeLayout]) return
  delete saved[activeLayout]
  saveAllLayouts(saved)
  populateOptions()
  activeLayout = 'cross'
  layoutSelect.value = 'cross'
  createParticles(numParticles)
})
document.getElementById('toggle-gravity').addEventListener('click', (e) => {
  showGravityPoints = !showGravityPoints
  e.target.textContent = showGravityPoints ? 'hide debug' : 'debug'
})
document.getElementById('panel-toggle').addEventListener('click', () => {
  document.getElementById('controls-panel').classList.toggle('hidden')
})
document.getElementById('toggle-placing').addEventListener('click', (e) => {
  placingEnabled = !placingEnabled
  e.target.textContent = placingEnabled ? 'placing on' : 'placing off'
  e.target.dataset.active = placingEnabled
})
document.addEventListener('keydown', (e) => {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return
  switch (e.key.toLowerCase()) {
    case 'r':
      createParticles(numParticles)
      break
    case 'c':
      particles = particles.filter((p) => !p.mass)
      particles.forEach((p) => { p.gravitations = [] })
      break
    case 'd': {
      showGravityPoints = !showGravityPoints
      const btn = document.getElementById('toggle-gravity')
      btn.textContent = showGravityPoints ? 'hide debug' : 'debug'
      break
    }
    case 'h':
      document.getElementById('controls-panel').classList.toggle('hidden')
      break
  }
})
document.getElementById('particle-count').addEventListener('input', (e) => {
  numParticles = parseInt(e.target.value, 10)
  document.getElementById('particle-count-val').textContent = numParticles
  createParticles(numParticles)
})
document.getElementById('particle-size').addEventListener('input', (e) => {
  particleRadius = parseInt(e.target.value, 10)
  document.getElementById('particle-size-val').textContent = particleRadius
})
window.addEventListener('resize', windowResizeHandler, false)
window.addEventListener('mousedown', mouseDownHandler, false)
canvas.oncontextmenu = (e) => e.preventDefault()
seedDefaults()
populateOptions()
createParticles(numParticles)
update()
