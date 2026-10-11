# Working on this game

Speak to the user in plain, normal English. Explain changes with words a new game maker understands. Avoid technical jargon in progress updates and replies.

Preserve the agreed rules:
- Side view, inspired loosely by Rounds. Four choices: fighter jet, person, car, mech.
- Person is intentionally a challenge choice. Its base spit is weaker. Other starting weapons stay close in strength.
- WASD movement, W jump/up, mouse crosshair and firing, quick animated turning toward the mouse.
- Car cannot jump until upgraded. Wall sticking and mid-air rotation are ONE separate upgrade, available only after Jump.
- First to eight battle wins. Loser chooses from five random upgrades. Lots of starting upgrades, each picked once. Picks unlock one or multiple related upgrades, with higher odds of those appearing next time.
- Same-fighter matches allowed; fighter stays fixed for the match.
- Easy, Medium, and Hard computer opponents first. Online friend battles later.
- Use original, individually animated artwork. The flame on the jet is a logo.
- Intended home is GitHub with a playable website link. Never imply publication or online play is complete until verified.

Run `node --check game.js` and `node tests.cjs` after changes to game rules. Check visual changes in the browser.
