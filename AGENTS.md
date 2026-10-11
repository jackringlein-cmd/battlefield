# Working on this game

Speak to the user in plain, normal English. Explain changes with words a new game maker understands. Avoid technical jargon in progress updates and replies.

Preserve the agreed rules:
- Side view, inspired loosely by Rounds. Four choices: fighter jet, person, car, mech.
- Person is intentionally a challenge choice. Its base spit is weaker. Other starting weapons stay close in strength.
- WASD movement, W jump/up, mouse crosshair and firing, quick animated turning toward the mouse.
- Car cannot jump until upgraded. Wall sticking and mid-air rotation are ONE separate upgrade, available only after Jump.
- Cars can drive up the city ramps and launch from their peaks using speed without the Jump upgrade. W still requires Jump. Ramps have real sloped surfaces for shots and lasers.
- First to eight battle wins. Loser chooses from five random upgrades. Lots of starting upgrades, each picked once. Picks unlock one or multiple related upgrades, with higher odds of those appearing next time.
- Same-fighter matches allowed; fighter stays fixed for the match.
- Easy, Medium, and Hard computer opponents first. Online friend battles later.
- Use original, individually animated artwork. The flame on the jet is a logo.
- Split missiles split on contact into two smaller homing missiles, never on a flight timer. The smaller missiles home even without the separate Homing upgrade and do not split again.
- Each upgrade has its own name, including follow-ups. Do not use numbered names such as Ricochet II. Ricochet leads to Double Bounce, then Pinball Shots.
- Give upgrades the user describes fun, fitting names without changing their requested behavior.
- Car shoots one continuous held laser, with limited charge and a short recharge after emptying. Current first balance is 3 seconds on, 2 seconds recharge. Display its charge.
- Car laser length stops at the crosshair or the first hit. A small glowing circle at the final endpoint adds 50% damage there. Normal person spit is blue.
- Car and city use the user's red rounded car drawing as the art reference. Person is a plain black stickman. Mech follows their broad-arm, square-chest, large-boot sketch, with detailed orange armor, dark blue joints, green lights, and an exposed stickman pilot (no helmet or mask hiding the pilot). Keep the fighter jet design.
- Computer picks a randomized fighter at each new match and keeps it through that match. It should route around obstacles and shoot breakable cover when it cannot pass.
- Show recognizable stickman pilots inside both the car windshield and fighter jet cockpit, as well as the mech.
- Mech head cover is transparent so the stickman pilot remains visible. Move the car's laser left enough to show its steering wheel.
- Save & Exit and automatic saving preserve the current match through browser refreshes. Continue Saved Game restores it on the same browser.
- Intended home is GitHub with a playable website link. Never imply publication or online play is complete until verified.

Run `node --check game.js` and `node tests.cjs` after changes to game rules. Check visual changes in the browser.
