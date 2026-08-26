# PRD — Hillary Step Solutions: AI Intelligence Experience

## Original Problem Statement
Design and implement a premium, cinematic, highly interactive "AI INTELLIGENCE" experience for Hillary Step Solutions (existing site: hillary-step.vercel.app). AI is presented not as a product but as the operating intelligence layer connecting the three existing pillars — Cognitive Digital (Platforms), Global Talent (People), Eco Smart Infra (Projects) — under the central idea "INTELLIGENCE AT THE CORE." Dark environment (#050505), SF Pro typography, interactive 3D Intelligence Core (not a brain), scroll-driven storytelling (GSAP ScrollTrigger + Lenis), Three.js/R3F, restraint over effects, enterprise credibility, no invented proprietary AI claims.

## Decisions
- Built as a standalone single-page app (user choice; external site cannot be edited directly).
- Stack: React 19 + R3F/drei + Three.js (one WebGL canvas for the hero core), GSAP ScrollTrigger (scrub storytelling, sticky sections), Lenis smooth scroll, framer-motion (masked text reveals, magnetic buttons, custom cursor), 2D canvas for domain/globe/pipeline visuals (performance).
- Tone per credibility rule: "AI-enabled", "decision support", "augmented intelligence" — no proprietary model claims.

## Architecture
- `/app/frontend/src/ai/` — AISection (orchestrator + Lenis/GSAP wiring), IntelligenceCore + CoreCanvas (3D), Hero, Statement, CoreArchitecture (SVG orbits), DomainSection (x3 with 2D canvas modes: clusters/network/wireframe), DataPipeline (kinetic type + particle stream), IntelligenceLoop (interactive SVG cycle), HumanMachine (merge sequence), Marquee, CapabilityMatrix (tilt panels), GlobalNetwork (2D canvas wireframe globe: USA/India/Australia), Summit (ascent + flash), FinalCTA, CustomCursor, MagneticButton, MaskReveal, store (shared scroll state).
- Backend: stock FastAPI health endpoints only (no data needs).

## User Personas
- Enterprise decision-makers evaluating Hillary Step's AI posture.
- Prospective talent/partners assessing brand sophistication.

## Implemented (2026-08-26)
- Full cinematic scroll journey: dormant→active 3D Intelligence Core, statement swap, core architecture orbit, three domain chapters with generative canvas visuals, DATA→ACT kinetic pipeline with core convergence, interactive intelligence loop, Human+Machine→Augmented Intelligence, capability matrix (6 panels, hover physics), editorial marquee, wireframe globe with inter-region arcs and hovering core, summit ascent with white flash, final CTA.
- Custom cursor, magnetic buttons, masked line reveals, atmosphere (grain/grid/vignette), prefers-reduced-motion fallbacks, mobile density reduction, lazy WebGL with frameloop pause when offscreen.
- Verified: all sections screenshot-tested across scroll depth; hover states; zero console errors; backend /api health OK.

## Backlog
- P0: none blocking.
- P1: Cinematic text sequence section ("We don't use AI to look futuristic..."), three-pillar synthesis 3D environment, AI-across-every-layer vertical section, section-entry transition from the live site's global map (requires embedding into the real site).
- P2: Lighthouse profiling pass, GLSL shader polish (fresnel/noise), tablet-specific tuning, OG/share meta imagery.

## Next Tasks
1. Embed/link from hillary-step.vercel.app (nav item + global-map transition).
2. Add remaining spec sections (cinematic sequence, synthesis, layers).
3. Performance audit on low-end mobile hardware.
