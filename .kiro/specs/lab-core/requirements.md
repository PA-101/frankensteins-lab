# Requirements: Frankenstein's Lab

## Parts Selection

1. When the page loads, the system shall display three body choices (Light Frame, Heavy Torso, Barrel Chest), three movement choices (Spindly Legs, Wide Wheels, Springy Coils), and three battery choices (Tiny Cell, Standard Pack, Mega Capacitor).
2. When the user selects one option in a category, the system shall highlight it and deselect any previous choice in that category.
3. When all three categories have a selection AND a level has been chosen, the system shall enable the "Bring it to life!" button.
4. When fewer than three part categories are filled, or no level is selected, the system shall keep the button disabled.

## Level Selection

26. When the page loads, the system shall display three level choices: Flat Graveyard Road, Muddy Hill, and Rickety Bridge.
27. When the user selects a level, the system shall highlight it and update the track background to match that terrain.
28. When no level is selected, the system shall keep the "Bring it to life!" button disabled.

## Animation

5. When the user clicks "Bring it to life!", the system shall play a 2D side-view animation of the assembled robot attempting to move across the selected terrain.
6. When the robot succeeds, the system shall animate it reaching the finish line.
7. When the robot fails due to tipping, the system shall animate it leaning and falling sideways.
8. When the robot fails due to running out of battery, the system shall animate it slowing and stopping mid-track.
9. When the robot fails due to spinning in place, the system shall animate the wheels/legs churning without forward motion.
10. The system shall complete the animation in no more than 6 seconds.

## Physics Rules

11. When calculating the result, the system shall compute a torque score: `torque = battery_power / body_mass`.
12. When calculating the result, the system shall compute a balance score: `balance = body_width / body_height + limb_stability_bonus`.
13. When calculating the result, the system shall compute a range score: `range = battery_capacity / body_mass`.
14. The system shall apply per-level thresholds when evaluating each score:
    - Flat Graveyard Road: balance ≥ 0.70, torque ≥ 0.60, range ≥ 0.50
    - Muddy Hill: balance ≥ 0.70, torque ≥ 0.90, range ≥ 0.65
    - Rickety Bridge: balance ≥ 1.10, torque ≥ 0.65, range ≥ 0.50
15. When `balance < level.balance`, the system shall trigger the "tip over" failure.
16. When `torque < level.torque`, the system shall trigger the "spin in place" failure.
17. When `range < level.range`, the system shall trigger the "battery dead" failure.
18. When all three scores meet their level thresholds, the system shall trigger the success outcome.
19. The system shall evaluate conditions in order: tip over, then spin in place, then battery dead, then success.

## Mad Scientist Explanation

20. After the animation ends, the system shall display a "Mad Scientist" character with a speech bubble.
21. When the result is a failure, the system shall show the scientist explaining the specific failure using the actual computed numbers and naming the terrain.
22. When the result is a success, the system shall show the scientist praising the build, naming the terrain, and stating all three scores.
23. The explanation text shall use spooky flavour language but name the real physics term (torque, balance, range) and the real numbers.

## General

24. When the user clicks "Try Again", the system shall reset all part selections, deselect the level, and hide the scientist panel.
25. The system shall run as a static HTML/CSS/JS app with no server or build step required.
26. The system shall work in the latest version of Chrome, Firefox, and Safari.
