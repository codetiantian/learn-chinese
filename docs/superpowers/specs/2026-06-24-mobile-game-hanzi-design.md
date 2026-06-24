# Mobile-First Game Hanzi Page Design

## Summary

This redesign turns the current single-screen Hanzi practice page into a mobile-first game-style learning page. The product direction is "star-map missions" with a playful cartoon presentation, while keeping the existing learning core intact: stroke-order animation and interactive writing practice.

The redesign prioritizes:

- Mobile-first layout and touch-friendly interaction
- Clear component boundaries instead of one large view component
- A light layer of game framing: chapter progress, mission cards, streaks, rewards, and completion feedback
- Preserving the current HanziWriter-based practice flow instead of rebuilding it into a heavy game system

## Goals

- Make the page feel like a game screen instead of a utility form
- Optimize the structure so practice logic and presentation are separated
- Design the primary experience for phone screens first
- Keep the writing area as the main focus of the page
- Add lightweight progression feedback without punishing the learner

## Non-Goals

- No backend persistence or account system
- No real chapter unlock storage beyond local UI state
- No timer, health bar, fail state, or high-pressure mechanics
- No multi-page navigation system for this iteration
- No change to the core HanziWriter interaction model

## Current Problems

The current implementation centers almost all state, HanziWriter lifecycle handling, UI structure, and styling inside `src/components/HanziPractice.vue`. That creates three problems:

1. The component is responsible for both product logic and page presentation.
2. The layout reads like a standard tool page rather than a game scene.
3. The current structure is optimized around a narrow desktop-style centered card, not a mobile-first flow.

## Product Direction

The approved direction is:

- Theme: star-map missions
- Tone: playful cartoon checkpoint experience
- Gameplay weight: light gamification
- Platform priority: mobile first

This means the UI should communicate "I am advancing through a Hanzi adventure" while the real task remains learning and practicing a character.

## UX Structure

### Mobile First

The mobile screen should present the current practice task immediately. The first screen should not be a map browser or dashboard. Instead, it should prioritize:

1. Progress context
2. Current mission
3. Writing stage
4. Lightweight feedback
5. Expandable chapter map

### Desktop Expansion

On wider screens, the same structure expands naturally:

- The bottom chapter map becomes a persistent left-side map rail
- The practice stage and mission feedback remain the dominant area
- Information density increases without changing the mobile interaction order

## Information Architecture

### 1. Game Header

The top card communicates progression and context:

- Current chapter name
- Daily progress
- Streak or combo count
- Star or points count

This section must stay visually strong but compact so it does not push the writing area below the fold on phones.

### 2. Practice Stage

This is the main scene of the page and the most important visual block.

It contains:

- The active character
- The HanziWriter writing area
- Mode actions for animation and practice
- Completion badge when a round is finished

This block should feel like a mission arena, but it must still preserve clarity and input comfort for touch devices.

### 3. Mission Feedback Panel

This panel reframes technical status into player-facing feedback. It includes:

- Current mission text
- Goal text such as "finish the writing round" or "keep mistakes below 5"
- Status feedback for progress and completion
- Reward preview such as stars or unlock text

This replaces the feeling of a raw status line with something closer to a game objective card.

### 4. Character Picker

The current input field and preset characters remain useful, but they should be styled as a mission selector rather than a plain form row.

It includes:

- One-character input
- Start or load action
- Quick-pick preset buttons

### 5. Chapter Map

On mobile, the chapter map should appear in a bottom section, compact by default, and expandable on demand.

It includes:

- Current chapter highlight
- A short row of mission nodes or chapter cards
- The currently active node

On desktop, this same element can expand into the left-side rail without changing its data model.

## Component Design

The page should be split into one container-level feature view plus focused presentational components.

### Container View

Suggested file:

- `src/views/HanziGameView.vue` or `src/components/HanziGamePage.vue`

Responsibilities:

- Own page-level state
- Connect child components
- Translate practice results into game-style UI state
- Coordinate chapter, streak, stars, and mission labels

### Presentation Components

Suggested responsibilities:

- `GameHeader.vue`
  - Shows chapter title, progress, streak, and stars
- `CharacterPicker.vue`
  - Handles input display and preset selection UI
- `PracticeStage.vue`
  - Hosts the writer target element and stage actions
- `TaskPanel.vue`
  - Shows mission, reward, status, and round summary
- `ChapterMap.vue`
  - Renders the mobile-bottom or desktop-side mission map

These components should receive props and emit events, but avoid owning core practice state.

## Logic Separation

The HanziWriter logic should be moved into a dedicated composition function.

Suggested file:

- `src/composables/useHanziPractice.js`

Responsibilities:

- Create and recreate the HanziWriter instance safely
- Load or switch characters
- Start animation mode
- Start quiz mode
- Track stroke counts, current stroke, mistakes, completion, and availability
- Expose user-facing methods to the container view

This separation keeps the product shell flexible and reduces coupling between game presentation and writing-engine lifecycle logic.

## State Boundaries

### Practice State

Owned by `useHanziPractice`:

- `loading`
- `hasData`
- `status`
- `totalStrokes`
- `currentStroke`
- `totalMistakes`
- `quizDone`
- `currentChar`
- methods such as `submitChar`, `pickPreset`, `playAnimation`, `startQuiz`, `restartQuiz`

### Game Shell State

Owned by the page container:

- `chapter`
- `level`
- `dailyProgress`
- `streak`
- `stars`
- `currentMission`
- `rewardText`
- `performanceTier`
- `mapExpanded`

This split ensures the page shell can evolve without repeatedly touching low-level HanziWriter logic.

## Lightweight Game Rules

The approved rules are intentionally light.

### Core Mapping

- Animation mode = observe or scout
- Quiz mode = official mission attempt

### Mission Completion

When a writing round completes:

- Mark the mission as complete
- Increment streak
- Award lightweight stars or points
- Show a completion badge or reward feedback

### Performance Evaluation

Mistake count should influence feedback quality, not failure.

Example:

- 0-1 mistakes = perfect clear
- 2-4 mistakes = strong clear
- 5+ mistakes = completed

The user still succeeds, but the page gives different praise and reward flavor.

### Failure Avoidance

This iteration must not punish the learner with:

- timers
- forced restarts
- life systems
- blocked progress due to poor writing performance

The page should encourage repetition, not create pressure.

## Responsive Behavior

### Mobile

- Header stays compact
- Practice stage stays first and prominent
- Mission panel appears below the stage
- Chapter map stays near the bottom as a compact strip or expandable card
- Controls remain thumb-friendly and full-width where appropriate

### Tablet

- Practice and mission sections can sit closer together
- Map can remain bottom-aligned or partially side-aligned depending on width

### Desktop

- Chapter map becomes a left rail
- Practice and mission sections occupy the main right panel
- Layout becomes a two-column game screen without changing feature order

## Error Handling

When a character cannot be loaded:

- Keep the stage stable rather than collapsing layout
- Replace mission text with a friendly "character unavailable" prompt
- Encourage the user to pick another mission character
- Avoid raw technical error language in the main UI

When switching modes or characters:

- Reset per-round UI state cleanly
- Prevent stale completion badges or stale mission text from carrying over

## Visual Direction

The visual language should move away from the default Vue starter palette.

Required characteristics:

- Brighter game-like palette with a clear sky or star-map atmosphere
- Stronger hierarchy using card depth, gradients, and larger headings
- Touch-first rounded controls and mission cards
- A deliberate, playful style without becoming cluttered

The design should feel like a casual learning game, not a dashboard and not a pure children's toy interface.

## Testing Focus

The implementation should verify:

- HanziWriter still initializes and updates correctly after refactor
- Mode switching resets the correct state
- Character switching reloads the writer without stale UI artifacts
- Mission feedback updates when quiz progress changes
- Completion updates streak and rewards consistently
- Mobile layout keeps the practice stage in the primary viewport
- Desktop layout expands cleanly from the same mobile-first structure

## Implementation Scope

This redesign should be implemented in one focused feature pass:

1. Extract practice logic into a composable
2. Build the new page shell and smaller components
3. Rework styling around the mobile-first game layout
4. Connect lightweight game state to existing practice outcomes
5. Verify both mobile and desktop layouts

## Open Decisions Already Resolved

The following decisions are now fixed for implementation:

- Use the star-map mission theme
- Use a cartoon checkpoint tone
- Prioritize mobile first
- Use the "top progress + main stage + bottom map" mobile layout
- Keep game mechanics lightweight
- Preserve current animation and writing behavior as the learning core
