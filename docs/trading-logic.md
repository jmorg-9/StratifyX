# Trading Logic

## Design Principles

- user-defined setups must outrank generic Strat setups
- ranking must consider both setup quality and context
- the system must be able to say "stay in cash" when conditions are poor
- every setup evaluator must be isolated so new rules can be added without changing scanner orchestration

## Current Phase 1 Implementation

The current API serves fixture-backed but real rule-evaluator outputs. That keeps the product runnable before market data providers, auth, and persistence are wired in.

The scanner currently evaluates user-defined setups first and returns structured trade ideas for:

- `3-2-2 First Live`
- `4H Retrigger`
- `12H 1-3-1 (Miyagi)`
- `9F (Failed 9)`
- `30M ORB`

Each setup has its own evaluator and all of them share:

- Strat bar classification helpers (`1`, `2u`, `2d`, `3`)
- midpoint and wick helpers
- key-level and confluence scoring helpers
- a shared trade-idea output contract

## Detection Notes

### 3-2-2 First Live

- uses 1H bars at `08:00`, `09:00`, and `10:00`
- requires `08:00` to classify as `3`
- requires `09:00` to classify as directional
- requires `10:00` to reverse the `09:00` direction
- enters on the break of the `10:00` candle in the reversal direction

### 4H Retrigger

- uses `04:00` and `08:00` 4H candles
- requires the `04:00` bar to be directional
- requires the `08:00` open to remain inside the `04:00` range
- requires the `08:00` bar to retrigger the opposite side with a measurable wick

### 12H 1-3-1 (Miyagi)

- uses a `1-3-1` sequence across completed 12H bars
- computes the midpoint from bar 3
- follows your supplied polarity exactly:
  - break above midpoint => bearish
  - break below midpoint => bullish
- currently uses trigger-bar extremes as the stop approximation

### 9F (Failed 9)

- marks the `08:00` midpoint
- requires the `09:00` bar to be directional
- requires the open to start beyond the midpoint
- requires price to reverse through the midpoint after the open

### 30M ORB

- defines the opening range from `09:30` to `10:00`
- requires the next bar to break and close outside the range
- uses the opposite side of the opening range as the stop

## Scoring Model

The current score blends:

- timeframe continuity
- fair value gap presence
- key-level proximity
- volume confirmation
- market conditions
- event pressure

The weighted result is converted into:

- confidence score: `0-100`
- grade: `A+` through `F`

## Stay-in-Cash Logic

The market-regime service currently combines:

- macro event severity
- top detected setup quality
- whether conditions justify capital deployment

If the catalyst mix is hostile enough and the best setup does not clear threshold, the API explicitly recommends staying in cash.

## Custom Setup Path

User-defined setups can be represented in PostgreSQL with:

- name and priority
- directional bias
- rule JSON
- activation state

Current open questions still needing exact thresholds:

- fair value gap detection formula
- `4H Retrigger` wick or pullback confirmation threshold
- `30M ORB` fake-break re-entry tolerance
- the exact stop implementation for `12H 1-3-1 (Miyagi)`
