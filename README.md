Kynova is a retrofit smart exercise-bike system that converts wasted pedaling energy into usable electrical energy while monitoring fitness parameters using IoT and Edge AI.
Kynova combines existing energy-generation components with a new system-level approach. The PMDC generator, battery, Hall sensor, INA219, ESP32-S3, charge controller and fitness sensors are commercially available components, while the underlying concept of converting pedaling energy into electricity is already established in prior work. For example, prior systems such as Fitness Equipment with Power Generation use a stationary exercise bicycle connected to a generator, rectifier and battery, and research such as Getting Fit in a Sustainable Way has demonstrated adding a generator to an existing exercise bike. Justia Patents Kynova differs by focusing on a low-cost retrofit kit for already-available exercise bicycles and combining energy harvesting, real-time power/fitness monitoring, Edge AI/TinyML feedback, offline operation and gamification in one system. The novelty we are targeting is therefore primarily in the integration, retrofit architecture and intelligent user-feedback layer, rather than claiming that the individual generator or energy-harvesting principle itself is new.
Kynova works against three main constraints: physical constraint — limited human pedaling power; technical constraint — variable voltage/current and inefficient energy conversion/storage; and behavioural constraint — users have little motivation to consistently generate energy. Kynova addresses these through power monitoring, controlled battery charging, Edge AI-based feedback, and gamification that encourages regular pedaling.
For Kynova, a reasonable annual estimate can be made from the electrical energy actually delivered by one unit. Since the hardware is still being validated, I would present this as a design/target estimate, not a measured result.

Assumptions: 100 W average electrical output during pedaling, 1 hour/day, 300 operating days/year. Thus, annual energy = 100 W × 1 h/day × 300 days = 30 kWh/year per Kynova unit. For avoided emissions, I use India's CEA weighted-average grid emission factor including renewable generation of 0.716 tCO₂/MWh = 0.716 kg CO₂/kWh (FY 2022–23), from the Central Electricity Authority's CO₂ Baseline Database. Central Electricity Authority Therefore, estimated GHG avoided = 30 kWh × 0.716 kg CO₂/kWh = 21.48 kg CO₂/year per unit. The calculation assumes that the generated electricity directly displaces electricity that would otherwise be supplied by the grid; no displaced-fuel credit is included. The 100 W output and 300 hours/year are engineering assumptions to be validated through bench testing, so the final proposal should clearly label 30 kWh/year and 21.5 kg CO₂/year as estimated values, rather than measured performance.

Generator
   ↓
Fuse/protection
   ↓
CC/CV Buck-Boost Charger
   ↓
INA219
   ↓
12V 7Ah Battery


How the system actually works
Suppose you start cycling.
Step 1 — You pedal
Your legs rotate the bicycle's flywheel.
Step 2 — Flywheel rotates generator
The belt/drive transfers mechanical energy to the PMDC generator.
Step 3 — Generator produces DC
The output changes according to how fast/hard the user pedals.
Step 4 — Charging circuit regulates it
The CC/CV converter converts the variable generator output into a controlled charging voltage/current suitable for the battery.
Step 5 — Battery stores energy.
Step 6 — Sensors measure the workout
Step 7 — ESP32 processes everything
The ESP32 calculates things like:
RPM
Heart Rate
Voltage
Current
Power
Energy generated
Workout duration
Calories estimate
The battery stores the generated energy.

