---
name: design-system-solstice
description: Creates implementation-ready design-system guidance with tokens, component behavior, and accessibility standards. Use when creating or updating UI rules, component specifications, or design-system documentation.
---

<!-- TYPEUI_SH_MANAGED_START -->

# Solstice

## Mission
Deliver implementation-ready design-system guidance for Solstice that can be applied consistently across documentation site interfaces.

## Brand
- Product/brand: Solstice
- URL: https://solsticedesign.ca/en/
- Audience: developers and technical teams
- Product surface: documentation site

## Style Foundations
- Visual style: structured, accessible, implementation-first
- Main font style: `font.family.primary=Instrument`, `font.family.stack=Instrument, sans`, `font.size.base=16px`, `font.weight.base=400`, `font.lineHeight.base=24px`
- Typography scale: `font.size.xs=16px`, `font.size.sm=18px`, `font.size.md=24px`, `font.size.lg=32px`, `font.size.xl=48px`, `font.size.2xl=57.6px`, `font.size.3xl=115.2px`
- Color palette: `color.text.primary=#33101c`, `color.text.secondary=#751636`, `color.surface.muted=#ffffff`, `color.surface.base=#000000`, `color.surface.strong=#fffacf`
- Spacing scale: `space.1=16px`, `space.2=24px`, `space.3=25px`, `space.4=32px`, `space.5=50px`, `space.6=55px`, `space.7=100px`, `space.8=451.25px`
- Radius/shadow/motion tokens: `radius.xs=33554400px` | `motion.duration.instant=300ms`, `motion.duration.fast=400ms`

## Accessibility
- Target: WCAG 2.2 AA
- Keyboard-first interactions required.
- Focus-visible rules required.
- Contrast constraints required.

## Writing Tone
concise, confident, implementation-focused

## Rules: Do
- Use semantic tokens, not raw hex values in component guidance.
- Every component must define required states: default, hover, focus-visible, active, disabled, loading, error.
- Responsive behavior and edge-case handling should be specified for every component family.
- Accessibility acceptance criteria must be testable in implementation.

## Rules: Don't
- Do not allow low-contrast text or hidden focus indicators.
- Do not introduce one-off spacing or typography exceptions.
- Do not use ambiguous labels or non-descriptive actions.

## Guideline Authoring Workflow
1. Restate design intent in one sentence.
2. Define foundations and tokens.
3. Define component anatomy, variants, and interactions.
4. Add accessibility acceptance criteria.
5. Add anti-patterns and migration notes.
6. End with QA checklist.

## Required Output Structure
- Context and goals
- Design tokens and foundations
- Component-level rules (anatomy, variants, states, responsive behavior)
- Accessibility requirements and testable acceptance criteria
- Content and tone standards with examples
- Anti-patterns and prohibited implementations
- QA checklist

## Component Rule Expectations
- Include keyboard, pointer, and touch behavior.
- Include spacing and typography token requirements.
- Include long-content, overflow, and empty-state handling.

## Quality Gates
- Every non-negotiable rule must use "must".
- Every recommendation should use "should".
- Every accessibility rule must be testable in implementation.
- Prefer system consistency over local visual exceptions.

<!-- TYPEUI_SH_MANAGED_END -->
