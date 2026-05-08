# JEPARTY — Official Rules & Game Guide

---

## 1. Overview

Jeparty is a host-controlled local party trivia game inspired by Jeopardy. One person acts as the **host** and controls the game on a single machine (displayed on a shared screen). The AI generates all questions dynamically — no two games are ever the same.

---

## 2. Setup

### Players
- Minimum **2 players**, maximum **8 players**
- Each player enters a codename before the game starts
- Player order is set at game start and does not change

### Categories
- The host enters **5 categories** before the game
- Each category generates questions at multiple difficulty tiers
- **Special category suffixes:**
  - ` -v` — **Visual category** — questions show an image (e.g. `Anime Hard -v`, `Landmarks -v`)
  - ` -a` — **Audio category** — questions play a 30-second song preview (e.g. `80s Hits -a`)
  - No suffix — standard text trivia

### Settings (configurable before game)
| Setting | Options |
|---|---|
| Difficulty | Easy / Medium / Hard |
| Time Limit | 30s / 60s / Unlimited |
| Questions Per Category | 3 / 5 / 7 |
| Scoring Mode | Standard / Advanced |

---

## 3. The Board

- The board is a **5×N grid** (5 categories, N questions each)
- Each question has a **point value** — lower = easier, higher = harder
- Point value tiers by question count:
  - 3 questions: 100 / 300 / 500
  - 5 questions: 100 / 200 / 300 / 400 / 500
  - 7 questions: 100 / 200 / 300 / 400 / 500 / 600 / 700
- Answered questions are marked and cannot be selected again
- The game ends when all questions have been answered

---

## 4. Turn Order

- Players take turns in the order they were entered at setup
- The **active player** selects any unanswered question from the board
- After a question resolves, the turn passes to the next player in order
- Exception: if a **skip chain** occurs, turn order adjusts (see Section 7)

---

## 5. Standard Scoring

### Correct Answer
- Active player earns the **full point value** of the question

### Wrong Answer
- **Standard mode:** active player loses the **full point value**
- **Advanced mode:** active player loses **75% of the point value**

### Pass (first pass, no skip chain active)
- Active player loses **50% of the point value** (Standard mode)
- Active player loses **37.5% of the point value** (Advanced mode)
- The question enters the **Skip Chain** (see Section 7)

### Underdog Boost
- If the active player is **tied for the lowest score**, all point gains are multiplied by **1.5×**
- Applies to correct answers only, not penalties
- Does not apply during a skip chain

---

## 6. Question Types

### Standard Questions
- A text question is displayed
- The host reads it aloud
- Players discuss and the host scores manually (Correct / Wrong / Pass)

### Visual Questions (` -v` categories)
- An **image** is displayed alongside the question
- Images are fetched automatically from Wikipedia / Wikimedia Commons
- If no image is found, the question displays as text only
- The question text is typically "Guess the character?" or "Who is this?"

### Audio Questions (` -a` categories)
- An **animated waveform** is displayed — no song title visible
- The host clicks **PLAY SIGNAL** to play a 30-second preview
- Players must identify the song
- After playback ends, the host can click **REPLAY** to play again
- If no audio preview is found (**SIGNAL LOST**), the host can click **SKIP TO REVEAL** to show the answer directly

---

## 7. Skip Chain

The skip chain allows a question to pass around all players before being resolved.

### Initiating a Skip Chain
- The active player (e.g. **Dev1**) hits **PASS**
- Dev1 immediately loses **50% of the question value**
- The question passes to the **next player** (Dev2)
- The **timer is disabled** for all skip chain recipients

### During the Skip Chain
Each recipient (Dev2, Dev3, etc.) has three options:

| Action | Score Effect |
|---|---|
| **Correct** | +50% of original question value |
| **Wrong** | −50% of original question value, question passes to next player |
| **Skip (0pts)** | No score change, question passes to next player |

### Full Circle
- If the question passes through **all other players** and returns to the **original passer** (Dev1):
  - The question is **automatically revealed** — no one scores
  - The question is marked as answered

### Turn Order After Skip Chain
- After the skip chain resolves (correct answer, full circle, or force reveal):
  - The next turn goes to the **player after the original passer**
  - Example: Dev1 passed → after resolution, **Dev2** gets the next turn

### Host Force Reveal
- At any point during a skip chain, the host can click **FORCE REVEAL**
- This immediately reveals the answer and marks the question as answered
- No score changes occur on force reveal
- Turn passes to the player after the original passer (or current active player if no skip chain)

---

## 8. Game End

- The game ends automatically when **all questions on the board are answered**
- The **player with the highest score wins**
- The end screen shows full leaderboard rankings
- The host can start a **REMATCH** (new board, same players) or **NEW GAME** (full reset)

---

## 9. Host Controls

The host has exclusive access to all controls:

| Control | Function |
|---|---|
| **CORRECT** | Awards points to active player, closes question |
| **WRONG** | Deducts points from active player, closes question |
| **PASS** | Deducts 50% from active player, initiates skip chain |
| **SKIP (0pts)** | Passes question to next player with no penalty (skip chain only) |
| **REVEAL ANSWER** | Shows the answer — must be clicked before scoring buttons appear |
| **FORCE REVEAL** | Instantly reveals answer and ends question (skip chain override) |
| **BACK TO BOARD** | Closes question without scoring (use carefully) |
| **TERMINATE** | Ends the current game immediately, returns to setup |
| **NEW GAME** | Resets everything and returns to setup |
| **Settings (⚙)** | Opens difficulty, time limit, scoring mode settings |

---

## 10. Session Persistence

- The current game board is **automatically saved** to the browser
- If the page is refreshed mid-game, the board, scores, and turn order are fully restored
- A **SESSION RESTORED** banner confirms the game was recovered
- The saved session is cleared when:
  - Host clicks **NEW GAME**
  - Host clicks **TERMINATE**
  - The game ends naturally (all questions answered)
  - **24 hours** have passed since the last save

---

## 11. AI Question Generation

- Questions are generated by AI (Groq / Llama) based on the categories the host enters
- The AI remembers the last **5 games** worth of topics per category and avoids repeating them
- Topic memory resets after **24 hours**
- Difficulty scales strictly: the lowest point question must be answerable by anyone; the highest point question should stump most players
- Every question must end with a `?` and have a short (1–4 word) answer

---

## 12. Quick Reference — Scoring Summary

| Situation | Score Change |
|---|---|
| Correct (normal) | +100% of value |
| Correct (underdog boost) | +150% of value |
| Wrong (standard mode) | −100% of value |
| Wrong (advanced mode) | −75% of value |
| Pass / first skip | −50% of value |
| Skip chain correct | +50% of value |
| Skip chain wrong | −50% of value |
| Skip chain skip | 0 |
| Full circle / force reveal | 0 |

---

*JEPARTY_SYSTEM_V.4.02 — Host-controlled. AI-generated. No two games alike.*
