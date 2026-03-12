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
| `js/app.js` | Entry point — creates particles, runs the animation loop, handles mouse/resize/UI events |
| `js/particle.js` | Particle prototype with position, velocity, friction, gravitation |
| `js/vector.js` | 2D vector with angle/length manipulation and arithmetic |
| `js/utils.js` | Math utilities (clamp, lerp, random, distance, bezier, collision) |
| `js/helpers.js` | Canvas drawing functions (drawCircle, drawLine) and wrapBounds |
| `js/defaults.js` | Built-in named gravity-point layouts (cross, grid, X, border, cells, pockets, rects) |

### Gravity points

Gravity points are particles with `mass !== null`. Positive mass attracts, negative repels. They're stored in the same `particles` array as regular particles; `!p.mass` distinguishes normal particles from gravity points. Gravity point positions are stored as viewport-relative fractions (`x ∈ [0,1]`, `y ∈ [0,1]`) in layouts, then multiplied by `width`/`height` at creation.

### Layout management

Layouts (named sets of gravity points) are persisted to `localStorage` under key `canvas-saved-layouts`. `js/defaults.js` seeds the initial layouts on first load. The UI supports save, rename, remove, import (JSON file), and export (JSON download).

## Deployment

Static site — `bun run build` then rsync `dist/` to the droplet. See `remote/CLAUDE.md` for deployment details.
