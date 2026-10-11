# Battlefield of the Vehicles

A side-view city fighting game with a fighter jet, a person with weaponized spit, a car, and a mech. First to eight battle wins takes the match.

## Play

Open `index.html` in a desktop browser, or run `node server.cjs` and visit http://127.0.0.1:4173/ on the same computer. No installation is needed for the game itself. A keyboard and mouse are required.

- A / D: move sideways.
- W: jump (person and mech), fly up (jet), or jump after the Jump upgrade (car).
- S: fly down (jet).
- Mouse: aim; hold the left button to fire.
- E: use an unlocked punch, grab, or throw attack.
- Esc: pause. Sound starts off; use the sound button to turn it on.

## Match rules

Choose your fighter and an Easy, Medium, or Hard computer opponent. Both can choose the same fighter. Keep that fighter for the whole match. The loser picks from five weighted random upgrades; the computer picks automatically when it loses. Each upgrade is picked once. Related upgrades unlock after their first step and are more likely to appear, especially immediately after that step. All upgrades reset when a new match begins. A simultaneous defeat replays the battle without awarding points.

The car, jet, and mech start at about 31 damage per second before accuracy, cover, and travel time. The person intentionally starts weaker. Balance is an early draft and needs player feedback.

## Art

Original animated drawings are rendered in the game: turning, walking, moving wheels, attacks, projectiles, impacts, shields, and explosions. The jet follows the supplied drawing's black outlines, turquoise cabin, long black nose, green rear details, and painted flame emblem. These are the first version of the art and can be refined together.

## GitHub website

The game is ready for GitHub Pages. Put these files in a repository, then choose Settings → Pages → Deploy from a branch → main → /(root). GitHub will show the website address after it publishes. GitHub publishing has not yet been completed for this checkout.

## Development

- `index.html`: menus and the game screen.
- `style.css`: colors and layout.
- `game.js`: fighting, movement, computer opponents, upgrades, and animated drawings.
- `tests.cjs`: checks for game rules and simulated battles. Run `node tests.cjs`.
- `server.cjs`: optional local preview server.

Online friend battles are a later step. This first version has one city map and computer opponents. There are no player accounts, tracking, or purchases. Fonts can load from Google Fonts; the game also works with the browser's fallback fonts.
