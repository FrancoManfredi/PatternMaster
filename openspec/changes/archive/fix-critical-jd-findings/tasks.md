# Tasks: fix-critical-jd-findings

## Phase 1: Critical Bug Fixes

- [x] 1.1 Fix PatternCard.tsx — Replace all dynamic `${accentColor}` Tailwind template-literal classes with inline styles following CatalogCard.tsx pattern (color map + hexToRgba + event handlers for hover states)
- [x] 1.2 Fix ExerciseSection.tsx — Add score threshold `>= 5` before calling markCompleted to prevent false completion on low scores
