export function clamp(value, min, max) {
  return Math.min(Math.max(value, Math.min(min, max)), Math.max(min, max))
}

export function randomRange(min, max) {
  return min + Math.random() * (max - min)
}
