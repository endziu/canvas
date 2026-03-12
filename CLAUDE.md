# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

Canvas particle physics demo served at canvas.endziu.xyz. Particles float, wrap at screen edges, and draw connecting lines when within `maxDist`. Left-click places an attraction point (red), right-click places a repulsion point (blue). Particle count and `maxDist` are computed from viewport width and clamped.

## Commands

- `bun run dev` — start Vite dev server with HMR
- `bun run build` — production build to `dist/`

## Architecture

Vanilla JS with ES modules, bundled by Vite. `particle` and `vector` use the prototype-delegation pattern (`Object.create(this)`) rather than classes.

| File | Role |
|------|------|
| `js/app.js` | Entry point — creates particles, runs the animation loop, handles mouse/resize events |
| `js/particle.js` | Particle prototype with position, velocity, friction, gravitation |
| `js/vector.js` | 2D vector with angle/length manipulation and arithmetic |
| `js/utils.js` | Math utilities (clamp, lerp, random, distance, bezier, collision) |
| `js/helpers.js` | Canvas drawing functions (drawCircle, drawLine) and wrapBounds |

## Deployment

Static site — `bun run build` then rsync `dist/` to the droplet. See `remote/CLAUDE.md` for deployment details.
