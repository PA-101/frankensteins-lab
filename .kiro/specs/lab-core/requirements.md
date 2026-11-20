# Requirements: Frankenstein's Lab

## Parts Selection

1. When the page loads, the system shall display three body choices (Light Frame, Heavy Torso, Barrel Chest), three movement choices (Spindly Legs, Wide Wheels, Springy Coils), and three battery choices (Tiny Cell, Standard Pack, Mega Capacitor).
2. When the user selects one option in a category, the system shall highlight it and deselect any previous choice in that category.
3. When all three categories have a selection, the system shall enable the "Bring it to life!" button.
4. When fewer than three categories are filled, the system shall keep the button disabled.

## Animation

5. When the user clicks "Bring it to life!", the system shall play a 2D side-view animation of the assembled robot attempting to move across a flat track.
6. When the robot succeeds, the system shall animate it reaching the finish line.
7. When the robot fails due to tipping, the system shall animate it leaning and falling sideways.
8. When the robot fails due to running out of battery, the system shall animate it slowing and stopping mid-track.
9. When the robot fails due to spinning in place, the system shall animate the wheels/legs churning without forward motion.
10. The system shall complete the animation in no more than 6 seconds.

## Physics Rules

11. When calculating the result, the system shall compute a torque score: `torque = battery_power / body_mass`.
12. When calculating the result, the system shall compute a balance score: `balance = body_width / body_height + limb_stability_bonus`.
13. When calculating the result, the system shall compute a range score: `range = battery_capacity / body_mass`.
14. When `torque < 0.6`, the system shall trigger the "spin in place" failure.
15. When `balance < 0.7`, the system shall trigger the "tip over" failure.
16. When `range < 0.5`, the system shall trigger the "battery dead" failure.
17. When all three scores meet their thresholds, the system shall trigger the success outcome.
18. The system shall evaluate conditions in order: tip over, then spin in place, then battery dead, then success.

## Mad Scientist Explanation

19. After the animation ends, the system shall display a "Mad Scientist" character with a speech bubble.
20. When the result is a failure, the system shall show the scientist explaining the specific failure using the actual computed numbers (e.g. "Your torque was only 0.42 — it needed 0.6!").
21. When the result is a success, the system shall show the scientist praising the build and stating all three scores.
22. The explanation text shall use spooky flavour language but name the real physics term (torque, balance, range) and the real numbers.

## General

23. When the user clicks "Try Again", the system shall reset all selections and hide the scientist panel.
24. The system shall run as a static HTML/CSS/JS app with no server or build step required.
25. The system shall work in the latest version of Chrome, Firefox, and Safari.
