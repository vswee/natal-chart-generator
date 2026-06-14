# Natal Chart App Data & Interpretation Directives

## Product objective

The natal chart app should give users clear, emotionally useful chart insights without assuming they already understand astrology.

The language must be:

- accurate enough to preserve real astrological meaning
- simple enough for non-astrology users to understand quickly
- relatable enough to feel personal, not textbook-like
- careful enough to avoid deterministic claims
- concise enough for cards, summaries and mobile screens

The app should feel like a friendly interpreter of chart patterns, not a mystical PDF generator wearing too much velvet.

## Interpretation style rules

### 1. Use plain language first

Prefer everyday words over technical astrology terms.

Use:

- `relationships` instead of `7th house matters`
- `work and direction` instead of `career significations`
- `emotional needs` instead of `lunar conditioning`
- `pressure` instead of `malefic tension`
- `natural ease` instead of `harmonious aspectual flow`

Astrology terms can still appear, but they should be explained through context.

Example:

```txt
Venus in Taurus suggests a steady, sensual style of affection. In relationships, this often shows up as loyalty, patience and a need for trust to build slowly.
```

### 2. Keep the tone useful, not absolute

Write as if the chart is describing tendencies, not making promises.

Prefer phrases like:

- `leans toward`
- `can show`
- `often feels`
- `may point to`
- `tends to`

Avoid language that sounds fixed, prophetic or final.

### 3. Match the actual data blocks

The app currently uses three kinds of interpretation content:

- placement overrides for known placement/sign pairs
- aspect overrides for known aspect/body combinations
- summary overrides for strong chart-wide patterns

If a specific override does not exist, the app falls back to generic wording. New copy should fit that fallback style instead of fighting it.

### 4. Keep each block scannable

Interpretations are meant for cards, summaries and mobile screens.

General limits:

- one short title
- one short summary sentence
- one or two plain-language support sentences
- no dense jargon stacks
- no long disclaimers inside the body copy

### 5. Write placements as behavior, not labels

A placement block should explain how a sign expression tends to show up in daily life.

### 6. Write aspects as interactions

Aspect blocks should describe the relationship between two parts of the chart, not just name the aspect.

Example:

```txt
Moon square Mars can make feelings and reactions quick and forceful. This aspect often adds urgency, protectiveness and emotional heat.
```

### 7. Write summaries as chart-wide signals

Summary blocks are only for themes that stand out across the chart.

Use them for patterns like:

- stronger emotional intensity
- smooth internal flow
- stronger relationship focus

Example:

```txt
This chart leans towards stronger feelings, deeper inner processing and quicker instinctive reactions.
```

## Current override sets

### Placement overrides

Known specific entries currently cover:

- `sun:gemini` -> Sun in Gemini
- `sun:pisces` -> Sun in Pisces
- `moon:scorpio` -> Moon in Scorpio
- `moon:cancer` -> Moon in Cancer
- `asc:taurus` -> Taurus Rising
- `venus:taurus` -> Venus in Taurus
- `mars:aries` -> Mars in Aries
- `mercury:gemini` -> Mercury in Gemini

### Aspect overrides

Known specific entries currently cover:

- `moon:square:mars` -> Moon square Mars
- `sun:trine:moon` -> Sun trine Moon
- `venus:conjunction:mars` -> Venus conjunct Mars

### Summary overrides

Known chart-wide summary entries currently cover:

- `highEmotionalIntensity`
- `highHarmony`
- `highRelationshipFocus`

## Writing rules for future additions

- Keep titles short and readable.
- Keep summaries closer to plain language than textbook astrology.
- Make sure new copy still works when read out of context.
- Match the tone of the existing entries.
- Avoid claims that sound deterministic or diagnostic.
- If a new entry needs a technical term, explain it in the same sentence.

The app should sound informed, calm and human. Not vague. Not grandiose. Not wearing a velvet cape.
