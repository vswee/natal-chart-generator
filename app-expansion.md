# Natal Chart App Expansion Roadmap

This document captures the phased expansion plan and the Phase 1 scope that will be implemented first.

## Product goals
- Improve clarity, trust, and usability without sacrificing astrological depth.
- Make outputs more shareable and reusable (reports, comparisons, exports).
- Add progressive layers of insight without overwhelming the user.

## Phased roadmap

### Phase 1: Core UX + Readability (start here)
- Location autocomplete + multi-result picker
- Manual lat/lon entry
- Time zone override (IANA time zone)
- Full chart wheel (houses + aspect lines + hover details)
- Expanded interpretation coverage + read-more toggles
- Element + modality distribution
- Retrograde badges in the placements table
- Aspect filters + orb controls

### Phase 2: Astro depth
- Nodes, Chiron, Lilith, Part of Fortune, key asteroids
- Dignities, rulerships, dispositors, chart ruler
- Aspect patterns (Grand Trine, T-Square, Yod)

### Phase 3: Comparison
- Synastry aspect list + composite chart view
- Multiple partner charts + side-by-side compare

### Phase 4: Time
- Transits and progressions
- Date slider + forecast highlights

### Phase 5: Sharing & Product
- Shareable links + JSON/CSV export
- Custom PDF sections + branding
- PWA / offline support

## Phase 1 implementation notes
- Keep everything client-side.
- Preserve existing design language and layout.
- Use optional inputs for advanced controls (manual coordinates, time zone override).
- Ensure new panels remain readable on mobile.

