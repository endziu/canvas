export function norm(value, min, max) {
  return (value - min) / (max - min)
}

export function lerp(n, min, max) {
  return (max - min) * n + min
}

export function map(value, sourceMin, sourceMax, destMin, destMax) {
  return lerp(norm(value, sourceMin, sourceMax), destMin, destMax)
}

export function clamp(value, min, max) {
  return Math.min(Math.max(value, Math.min(min, max)), Math.max(min, max))
}

export function distance(p0, p1) {
  const dx = p1.x - p0.x
  const dy = p1.y - p0.y
  return Math.sqrt(dx * dx + dy * dy)
}

export function distanceXY(x0, y0, x1, y1) {
  const dx = x1 - x0
  const dy = y1 - y0
  return Math.sqrt(dx * dx + dy * dy)
}

export function circleCollision(c0, c1) {
  return distance(c0, c1) <= c0.radius + c1.radius
}

export function circlePointCollision(x, y, circle) {
  return distanceXY(x, y, circle.x, circle.y) < circle.radius
}

export function pointInRect(x, y, rect) {
  return (
    inRange(x, rect.x, rect.x + rect.width) &&
    inRange(y, rect.y, rect.y + rect.height)
  )
}

export function inRange(value, min, max) {
  return value >= Math.min(min, max) && value <= Math.max(min, max)
}

export function rangeIntersect(min0, max0, min1, max1) {
  return (
    Math.max(min0, max0) >= Math.min(min1, max1) &&
    Math.min(min0, max0) <= Math.max(min1, max1)
  )
}

export function rectIntersect(r0, r1) {
  return (
    rangeIntersect(r0.x, r0.x + r0.width, r1.x, r1.x + r1.width) &&
    rangeIntersect(r0.y, r0.y + r0.height, r1.y, r1.y + r1.height)
  )
}

export function degreesToRads(degrees) {
  return (degrees / 180) * Math.PI
}

export function radsToDegrees(radians) {
  return (radians * 180) / Math.PI
}

export function randomRange(min, max) {
  return min + Math.random() * (max - min)
}

export function randomInt(min, max) {
  return Math.floor(min + Math.random() * (max - min + 1))
}

export function roundToPlaces(value, places) {
  const mult = Math.pow(10, places)
  return Math.round(value * mult) / mult
}

export function roundNearest(value, nearest) {
  return Math.round(value / nearest) * nearest
}

export function quadraticBezier(p0, p1, p2, t, pFinal) {
  pFinal = pFinal || {}
  pFinal.x =
    Math.pow(1 - t, 2) * p0.x + (1 - t) * 2 * t * p1.x + t * t * p2.x
  pFinal.y =
    Math.pow(1 - t, 2) * p0.y + (1 - t) * 2 * t * p1.y + t * t * p2.y
  return pFinal
}

export function cubicBezier(p0, p1, p2, p3, t, pFinal) {
  pFinal = pFinal || {}
  pFinal.x =
    Math.pow(1 - t, 3) * p0.x +
    Math.pow(1 - t, 2) * 3 * t * p1.x +
    (1 - t) * 3 * t * t * p2.x +
    t * t * t * p3.x
  pFinal.y =
    Math.pow(1 - t, 3) * p0.y +
    Math.pow(1 - t, 2) * 3 * t * p1.y +
    (1 - t) * 3 * t * t * p2.y +
    t * t * t * p3.y
  return pFinal
}

export function multicurve(points, context) {
  let p0, p1, midx, midy

  context.moveTo(points[0].x, points[0].y)

  for (let i = 1; i < points.length - 2; i += 1) {
    p0 = points[i]
    p1 = points[i + 1]
    midx = (p0.x + p1.x) / 2
    midy = (p0.y + p1.y) / 2
    context.quadraticCurveTo(p0.x, p0.y, midx, midy)
  }
  p0 = points[points.length - 2]
  p1 = points[points.length - 1]
  context.quadraticCurveTo(p0.x, p0.y, p1.x, p1.y)
}
