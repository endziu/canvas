import { clamp } from './utils.js'
import vector from './vector.js'

const particle = {
  position: vector.create(0, 0),
  velocity: vector.create(0, 0),
  friction: 1,
  mass: null,
  gravitations: null,

  create(x, y, speed, direction) {
    const obj = Object.create(this)
    obj.position = vector.create(x, y)
    obj.velocity = vector.create(0, 0)
    obj.velocity.setLength(speed)
    obj.velocity.setAngle(direction)
    obj.gravitations = []
    return obj
  },

  distanceSqTo(p2) {
    const dx = p2.position.getX() - this.position.getX()
    const dy = p2.position.getY() - this.position.getY()
    return dx * dx + dy * dy
  },

  distanceTo(p2) {
    return Math.sqrt(this.distanceSqTo(p2))
  },

  gravitateTo(p2) {
    const dx = p2.position.getX() - this.position.getX()
    const dy = p2.position.getY() - this.position.getY()
    const distSQ = dx * dx + dy * dy
    const dist = clamp(Math.sqrt(distSQ), 50, 250)
    const force = p2.mass / distSQ
    const ax = (dx / dist) * force
    const ay = (dy / dist) * force
    const acc = vector.create(ax, ay)
    this.velocity.addTo(acc)
  },

  addGravitation(p) {
    this.removeGravitation(p)
    this.gravitations.push(p)
  },

  removeGravitation(p) {
    for (let i = 0; i < this.gravitations.length; i += 1) {
      if (p === this.gravitations[i]) {
        this.gravitations.splice(i, 1)
        return
      }
    }
  },

  handleGravitations() {
    for (let i = 0; i < this.gravitations.length; i += 1) {
      this.gravitateTo(this.gravitations[i])
    }
  },

  update() {
    this.handleGravitations()
    this.velocity.multiplyBy(this.friction)
    this.position.addTo(this.velocity)
  },
}

export default particle
