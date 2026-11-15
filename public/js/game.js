// ORBITAL ENGINEER - Page 3: MRO construction.
// "ref" = historical MRO reference value. Everything else is a simplified GAMEPLAY ESTIMATE.
const STAGE = window.STAGE_ID || 'mro', CAS = STAGE === 'cassini', MSL = STAGE === 'msl', JUNO = STAGE === 'juno', DAWN = STAGE === 'dawn';
// MRO: 2,180 kg / 1,149 kg propellant / 2,000 W / $416.6M. Cassini: 5,712 kg / 3,132 kg propellant / 885 W at start of mission (ESA); the $500M funding cap is a GAMEPLAY ESTIMATE.
// MSL: 3,893 kg launch mass, 390 kg landing propellant, ~110 W from the MMRTG. Its $700M funding cap and the 20% average duty cycle are GAMEPLAY ESTIMATES.
// Juno: 3,625 kg launch mass; ~2,032 kg propellant (launch 3,625 kg minus 1,593 kg dry); ~435 W of solar power at Jupiter; $700M is NASA's New Frontiers cost cap for Juno.
// Dawn: real launch mass is 1,217.7 kg with 425 kg of xenon and ~1.3 kW of solar power at 3 AU (10 kW at 1 AU). The 1,850 kg mass limit and $450M funding cap are GAMEPLAY ESTIMATES because the catalogue's part masses are heavier than the real spacecraft's.
const REF = DAWN ? { mass: 1850, prop: 425, pow: 1300, bud: 450 } : JUNO ? { mass: 3625, prop: 2032, pow: 435, bud: 700 } : MSL ? { mass: 3893, prop: 390, pow: 110, bud: 700 } : CAS ? { mass: 5712, prop: 3132, pow: 885, bud: 500 } : { mass: 2180, prop: 1149, pow: 2000, bud: 416.6 };
const $ = s => document.querySelector(s);
const CATS = [['structure','Structure','▦'],['power','Power','☀'],['propulsion','Propulsion','▲'],['navigation','Navigation','✦'],['science','Science Payload','◉'],['comms','Communications','✆'],['data','Data & Thermal','▤']];
const p = (id,name,cat,type,mass,pw,cost,o={}) => ({ id,name,cat,type,mass,pw,cost,ref:[],dev:'—',why:'',...o });
const PARTS = [
  p('bus1','Aluminium Bus','structure','bus',330,-150,70,{why:'Central body that carries every other part.'}),
  p('bus2','Composite Bus','structure','bus',290,-150,90,{why:'Lighter bus, higher cost.'}),
  p('sol1','Solar Wing - Standard','power','solar',70,1000,20,{why:'One wing; two standard wings give the 2,000 W Mars reference (that total is historical, the per-wing split is an estimate).'}),
  p('sol2','Solar Wing - Reduced','power','solar',48,225,14,{why:'Lighter and cheaper wing with far less power (est.).'}),
  p('bat1','Battery Pack','power','battery',45,0,12,{why:'Stores power for eclipses and peak loads.'}),
  p('bat2','Large Battery Pack','power','battery',70,0,18,{why:'More storage, more mass.'}),
  p('eng1','Main Chemical Engine','propulsion','engine',55,0,25,{why:'Performs the Mars orbit insertion burn.'}),
  p('eng2','Compact Engine','propulsion','engine',40,0,20,{why:'Lighter engine with less margin.'}),
  p('thr1','Thruster Set','propulsion','thruster',25,0,10,{why:'Small thrusters for attitude and trim control.'}),
  p('tnk1','Tank - 700 kg','propulsion','tank',55,0,12,{cap:700,why:'Small propellant load; may not reach Mars orbit.'}),
  p('tnk2','Tank - 1,149 kg','propulsion','tank',60,0,15,{cap:1149,ref:['cap'],why:'Matches the MRO reference propellant and pressurant load.'}),
  p('tnk3','Tank - 1,300 kg','propulsion','tank',70,0,20,{cap:1300,why:'Extra propellant, but heavy.'}),
  p('trk1','Star Tracker','navigation','tracker',12,-10,6,{why:'Finds the spacecraft attitude from the stars.'}),
  p('trk2','Star Tracker + IMU','navigation','tracker',20,-18,9,{why:'Better attitude knowledge, more mass and power.'}),
  p('hirise','HiRISE','science','sci',65.1,-60,35,{year:2005,ref:['mass','pw'],dev:'Ball Aerospace',why:'Detailed surface imaging.'}),
  p('crism','CRISM','science','sci',30,-25,22,{year:2005,dev:'Johns Hopkins APL',why:'Mineral mapping, including water-related minerals.'}),
  p('sharad','SHARAD','science','sci',18,-20,20,{year:2005,dev:'Italian Space Agency',why:'Radar that probes below the surface for ice.'}),
  p('ctx','CTX','science','sci',24,-12,12,{year:2005,dev:'Malin Space Science Systems',why:'Wide-area context imaging.'}),
  p('marci','MARCI','science','sci',8,-6,8,{year:2005,dev:'Malin Space Science Systems',why:'Daily weather imaging.'}),
  p('mcs','MCS','science','sci',10,-10,10,{year:2005,dev:'NASA JPL',why:'Atmospheric temperature and dust profiling.'}),
  p('hga1','High-Gain Antenna','comms','hga',55,-100,25,{why:'Main link for sending data to Earth.'}),
  p('hga2','Smaller High-Gain Antenna','comms','hga',38,-70,18,{why:'Lighter, lower data capacity.'}),
  p('uhf1','UHF Relay Radio','comms','uhf',8,-30,8,{why:'Relay link to other Mars missions.'}),
  p('str1','Solid-State Recorder','data','store',25,-10,12,{cap:3,why:'Stores instrument data until it can be sent. Handles 3 instruments (est.).'}),
  p('str2','Large Recorder','data','store',40,-16,20,{cap:6,why:'Handles up to 6 instruments (est.).'}),
  p('thm1','Heaters & Radiators','data','thermal',40,-80,10,{why:'Keeps electronics in their working range.'}),
  p('thm2','Advanced Thermal Control','data','thermal',55,-60,16,{why:'Uses less power but is heavier.'})
];
// Extra equipment from the component catalogue (values are catalogue range MIDPOINTS = gameplay estimates).
const x = (id,name,cat,type,mass,pw,cost,lab,why,fuel) => p(id,name,cat,type,mass,pw,cost,{lab,why,fuel:!!fuel,src:'cat'});
PARTS.push(
  x("deck","Equipment Deck","structure","x",20.0,0.0,0.3,"Equip Deck","Mounting platform for avionics and instruments."),
  x("brk","Support Brackets","structure","x",6.0,0.0,0.018,"Brackets","Holds components firmly to the structure."),
  x("hinge","Solar Array Hinges","structure","x",9.0,-12.5,0.175,"Hinges","Lets the solar wings unfold after launch."),
  x("mount","Antenna Mounts","structure","x",3.0,0.0,0.018,"Ant Mounts","Supports antennas on the structure."),
  x("shield","Protective Shielding","structure","x",15.0,0.0,0.15,"Shielding","Protects equipment from debris and radiation."),
  x("sep","Separation Mechanism","structure","x",6.0,0.0,0.085,"Separation","Releases the spacecraft from the launch vehicle."),
  x("depctl","Deployment Controller","structure","x",1.25,-6.0,0.03,"Deploy Ctrl","Controls deployment of arrays and booms."),
  x("harness","Harness and Wiring","structure","x",8.5,0.0,0.045,"Harness","Cabling that carries power and signals."),
  x("rprot","Radiation Protection","structure","x",8.5,0.0,0.085,"Rad Protect","Extra protection for sensitive electronics."),
  x("pcu","Power Control Unit (PCU)","power","x",6.5,-25.0,0.25,"PCU","Regulates and manages incoming solar power."),
  x("pdu","Power Distribution Unit (PDU)","power","x",5.0,-12.5,0.15,"PDU","Distributes power to spacecraft systems."),
  x("vconv","Voltage Converters","power","x",3.0,-8.5,0.055,"Converters","Converts voltages for different equipment."),
  x("propel","Propellant","propulsion","x",55.0,0.0,0.028,"Propellant","Extra propellant load, added to the tank total.",true),
  x("valves","Propellant Valves","propulsion","x",1.75,-6.0,0.03,"Valves","Controls propellant flow to the engines."),
  x("regul","Pressure Regulator","propulsion","x",1.25,-2.5,0.025,"Regulator","Keeps propellant pressure steady."),
  x("sunsen","Sun Sensor","navigation","x",0.55,-1.2,0.045,"Sun Sensor","Measures the Sun direction for attitude."),
  x("imu","Gyroscope / IMU","navigation","x",3.0,-9.0,0.175,"Gyro / IMU","Measures rotation and motion."),
  x("rwheel","Reaction Wheels","navigation","x",3.0,-17.5,0.15,"React Wheels","Turns the spacecraft without using propellant."),
  x("gps","GPS Receiver","navigation","x",0.6,-3.0,0.06,"GPS","Position and timing receiver."),
  x("navcomp","Navigation Computer","navigation","x",3.0,-15.0,0.15,"Nav Comp","Computes navigation and pointing."),
  x("mtq","Magnetorquer","navigation","x",1.1,-5.5,0.045,"Magnetorq","Uses magnetic fields to adjust attitude."),
  x("accel","Accelerometer","navigation","x",0.55,-3.0,0.028,"Accel","Measures acceleration during burns."),
  x("mag","Magnetometer","science","sci",1.75,-6.0,0.175,"Magnetom","Measures magnetic fields."),
  x("raddet","Radiation Detector","science","sci",2.75,-8.5,0.3,"Rad Detect","Measures the radiation environment."),
  x("ircam","Infrared Camera","science","sci",6.0,-25.0,1.75,"IR Camera","Infrared imaging of the surface."),
  x("spec","Spectrometer","science","sci",8.5,-30.0,2.75,"Spectromtr","Splits light to identify materials."),
  x("alt","Laser Altimeter","science","sci",10.0,-50.0,3.0,"Altimeter","Measures surface height with a laser."),
  x("uhfant","UHF Antenna","comms","x",1.1,0.0,0.028,"UHF Ant","Passive antenna for the UHF link."),
  x("xband","X-band Transponder","comms","x",5.0,-30.0,0.3,"X-band","Radio link for commands and telemetry."),
  x("rfpa","RF Power Amplifier","comms","x",3.0,-90.0,0.175,"RF Amp","Boosts radio transmit power."),
  x("lga","LGA (Low Gain Antenna)","comms","x",1.1,0.0,0.018,"LGA","Wide-angle backup antenna."),
  x("apm","Antenna Pointing Mechanism","comms","x",6.0,-17.5,0.3,"Ant Pointing","Points the antenna at Earth."),
  x("obc","Onboard Computer (OBC)","data","x",3.0,-17.5,0.3,"OBC","Main onboard computer."),
  x("mem","Memory Module","data","x",1.1,-3.0,0.055,"Memory","Extra memory for the computer."),
  x("heat","Electric Heaters","data","x",1.75,-55.0,0.028,"Heaters","Electric heaters for cold-sensitive parts."),
  x("rad","Radiators","data","x",8.5,0.0,0.085,"Radiators","Passive radiators shed excess heat."),
  x("mli","Thermal Blankets (MLI)","data","x",5.5,0.0,0.055,"MLI","Insulating blankets for thermal control."),
  x("tsens","Temperature Sensors","data","x",0.55,-1.1,0.011,"Temp Sens","Monitors temperatures around the craft."),
  x("fsw","Flight Software Controller","data","x",1.75,-9.0,0.125,"Flight SW","Runs flight software and commands."),
  x("wdog","Watchdog / Safety Controller","data","x",0.55,-2.0,0.03,"Watchdog","Resets the system if it stops responding.")
);
// Parts from the expanded Excel catalogue: generic components with Available From <= 2005 (Aug 2005 cutoff). Values are the catalogue's GAMEPLAY estimates.
const xl = (id,name,cat,type,mass,pw,cost,year,rel,dev,why,adv,con,o={}) => p(id,name,cat,type,mass,pw,cost,{year,rel,dev,why,adv,con,src:'xl',...o});
PARTS.push(
  xl("b_mm","Multi-Mission Bus","structure","bus",380,-10,15,1972,0.94,"GE Space Division","Nimbus-derived 3-axis stabilised bus.","Flexible mounts","Heavy for its size"),
  xl("b_hc","Honeycomb Bus","structure","bus",700,-40,60,2000,0.97,"Lockheed Martin","Aluminium-honeycomb deep-space bus (A2100 heritage).","Strong and light","Costly"),
  xl("p_gp","GPHS-RTG","power","solar",56,290,60,1977,0.98,"DOE / General Electric","Plutonium-238 thermoelectric generator (Voyager).","Works anywhere, decades","Costly, 290 W only"),
  xl("p_ga","Triple-Junction Array","power","solar",65,2000,28,2000,0.97,"Lockheed Martin / Spectrolab","GaAs high-efficiency solar wing (MRO type).","Best efficiency","Weak far from Sun"),
  xl("p_sw","Deployable Solar Wing","power","solar",70,900,20,1972,0.95,"Hughes / TRW","Silicon wing deployed after launch.","Good power","Degrades with radiation"),
  xl("p_nh","Ni-H₂ Battery","power","battery",27,0,8,1990,0.96,"Eagle-Picher","Rechargeable nickel-hydrogen battery.","Long cycle life","Heavy"),
  xl("r_bi","Bipropellant Engine","propulsion","engine",49,-80,30,1990,0.97,"Aerojet","Hydrazine/N₂O₄ engine for orbit insertion.","High Isp (320 s)","Complex plumbing",{"isp": 320}),
  xl("r_hy","Hydrazine Thrusters","propulsion","thruster",15,-5,3,1960,0.95,"Rocket Research Corp.","Monopropellant thruster cluster.","Simple, reliable","Low Isp (220 s)",{"isp": 220}),
  xl("r_ts","Titanium Tank (small)","propulsion","tank",12,0,2,1960,0.98,"ATK / PSI","Holds 300 kg propellant.","Light","Small",{"cap": 300}),
  xl("r_tl","Titanium Tank (large)","propulsion","tank",40,0,6,1990,0.98,"ATK / PSI","Holds 900 kg propellant.","Large dv","Heavy",{"cap": 900}),
  xl("c_ka","X/Ka High-Gain Antenna","comms","hga",40,-100,25,2005,0.97,"Lockheed / JPL","3 m dish with Ka-band demo.","Very high rate","Power hungry"),
  xl("c_hx","X-Band High-Gain Dish","comms","hga",30,-50,12,1977,0.97,"JPL / Philco-Ford","3.7 m-class X-band antenna (Voyager).","Long range","Large, rigid"),
  xl("c_hs","S-Band Dish","comms","hga",20,-30,10,1972,0.95,"Hughes","Steerable S-band dish.","Good rate","Needs pointing"),
  xl("c_sb","S-Band Transponder","comms","x",8,-20,3,1962,0.94,"Motorola","Two-way S-band link.","Commandable","Slow",{"lab": "S-band XPDR"}),
  xl("c_bc","Radio Beacon","comms","x",3,-1,0.1,1957,0.9,"OKB-1","20/40 MHz beeper, heard worldwide.","Anyone can hear it","Almost no data",{"lab": "Beacon"}),
  xl("s_gc","Cosmic-Ray Detector","science","sci",1.5,-1,0.4,1958,0.9,"J. Van Allen, U. Iowa","Geiger counter that found the Van Allen belts.","Historic discovery","Single measurement",{"lab": "Cosmic Ray"}),
  xl("s_tv","TV Camera","science","sci",12,-20,3,1960,0.92,"RCA","Vidicon camera for weather imaging.","First cloud pictures","Low resolution",{"lab": "TV Camera"}),
  xl("s_ms","Multispectral Scanner","science","sci",68,-50,25,1972,0.94,"Hughes Santa Barbara","4-band Earth-resources scanner.","Maps land use","Data heavy",{"lab": "Multispect"}),
  xl("s_is","Imaging Science System","science","sci",38,-30,30,1977,0.95,"NASA JPL","Wide/narrow cameras (Voyager).","Great images","Moderate data",{"lab": "Imaging Sys"}),
  xl("d_cdh","Command & Data Handling Unit","data","x",8,-25,4,1970,0.96,"Generic spacecraft avionics subsystem","Coordinates commands, instrument operations, telemetry and onboard data flow.","Centralised spacecraft control","Single-point dependency in simplified model",{"lab": "C&DH"})
);
// Stage 2 (Cassini-Huygens, Oct 1997): catalogue parts with Available From <= 1997 (mission-specific parts included).
PARTS.push(
  xl("c_magboom","Cassini Magnetometer Boom","structure","x",12,-3,1.8,1997,0.94,"Cassini flight hardware / mission team","Deployable approximately 11 m boom that separates the magnetometer from spacecraft magnetic interference.","Cleaner magnetic-field measurements","Adds deployed length and structural complexity",{"stage": "cassini"}),
  xl("c_huygens","Huygens Titan Probe","structure","x",349,-40,45,1997,0.9,"ESA-led probe; multi-agency instrument teams","Atmospheric entry and parachute-descent probe that relayed measurements from Titan to Cassini.","Direct Titan atmosphere and surface investigation","One-time descent; requires probe support and relay",{"stage": "cassini"}),
  xl("c_probe_support","Huygens Probe Support Equipment","comms","x",30,-25,8,1997,0.94,"Cassini spacecraft / ESA probe interface team","Orbiter-side electronics and harness provide power, command and relay links to Huygens.","Enables probe separation and data relay","Must be integrated with probe and orbiter",{"stage": "cassini"}),
  xl("c_radar","Cassini Titan Radar System","science","sci",40,-100,18,1997,0.92,"NASA/JPL; Cassini radar instrument team","Radar instrument used to map Titan's surface through its thick atmospheric haze.","Maps otherwise hidden Titan terrain","High data and power demand",{"stage": "cassini", "lab": "Radar"}),
  xl("c_cirs","CIRS — Composite Infrared Spectrometer","science","sci",39,-30,12,1997,0.94,"NASA/Goddard-led instrument team","Measures infrared emission to study temperatures and composition of Saturn, its rings and moons.","Thermal and compositional science","Specialised observation modes",{"stage": "cassini", "lab": "CIRS"}),
  xl("c_iss","ISS — Imaging Science Subsystem","science","sci",57,-25,10,1997,0.95,"JPL / Cassini imaging team","Visible-light camera system for imaging Saturn, its rings and moons.","Detailed visual observations","Large image-data volume",{"stage": "cassini", "lab": "ISS"}),
  xl("c_uvis","UVIS — Ultraviolet Imaging Spectrograph","science","sci",14,-12,8,1997,0.93,"University of Colorado instrument team","Studies ultraviolet light from atmospheres and rings.","Atmospheric and ring composition","Requires specialised pointing",{"stage": "cassini", "lab": "UVIS"}),
  xl("c_vims","VIMS — Visible and Infrared Mapping Spectrometer","science","sci",37,-25,12,1997,0.93,"University of Arizona instrument team","Maps visible and infrared spectra to identify surface and atmospheric composition.","Compositional mapping","Power and data intensive",{"stage": "cassini", "lab": "VIMS"}),
  xl("c_caps","CAPS — Cassini Plasma Spectrometer","science","sci",12,-14,9,1997,0.92,"Southwest Research Institute / instrument consortium","Measures ions and electrons in Saturn's magnetosphere.","Plasma environment science","Specialised particle measurements",{"stage": "cassini", "lab": "CAPS"}),
  xl("c_cda","CDA — Cosmic Dust Analyzer","science","sci",16,-10,5,1997,0.93,"Max Planck Institute for Nuclear Physics","Analyses dust and ice grains around Saturn.","Studies ring and plume particles","Limited event-based sampling",{"stage": "cassini", "lab": "CDA"}),
  xl("c_inms","INMS — Ion and Neutral Mass Spectrometer","science","sci",9,-18,7,1997,0.92,"Southwest Research Institute","Measures neutral and charged particles near Titan and Saturn.","Atmospheric composition","Specialised sampling geometry",{"stage": "cassini", "lab": "INMS"}),
  xl("c_mimi","MIMI — Magnetospheric Imaging Instrument","science","sci",28,-20,9,1997,0.92,"Applied Physics Laboratory / instrument team","Studies energetic particles and images Saturn's magnetosphere.","Magnetosphere mapping","Power and data overhead",{"stage": "cassini", "lab": "MIMI"}),
  xl("c_rpws","RPWS — Radio and Plasma Wave Science","science","sci",10,-12,7,1997,0.94,"University of Iowa","Measures plasma waves, radio emissions and related phenomena.","Radio/plasma environment measurements","Needs antenna deployment and clean signals",{"stage": "cassini", "lab": "RPWS"}),
  xl("c_rss","RSS — Radio Science Subsystem","science","sci",5,-8,3,1997,0.96,"JPL / Cassini radio science team","Uses radio links and Doppler/occultation measurements to study gravity, rings and atmospheres.","High-value gravity and occultation science","Uses spacecraft telecom system and scheduled geometry",{"stage": "cassini", "lab": "RSS"}),
  xl("c_mag","Dual-Technique Magnetometer","science","sci",3,-5,6,1997,0.95,"Imperial College London / instrument team","Measures Saturn's magnetic field and its interaction with the solar wind and moons.","Magnetic-field mapping","Sensitive to spacecraft magnetic noise",{"stage": "cassini", "lab": "Dual Mag"}),
  xl("c_hasi","HASI — Huygens Atmospheric Structure Instrument","science","sci",6,-8,5,1997,0.92,"ESA / instrument consortium","Measures Titan's atmospheric physical properties during descent and at the surface.","Pressure, temperature and electrical properties","Only operates during probe descent/surface phase",{"hux": true, "stage": "cassini", "lab": "HASI"}),
  xl("c_gc_ms","GCMS — Gas Chromatograph and Mass Spectrometer","science","sci",17,-15,7,1997,0.91,"NASA Goddard / instrument team","Analyses chemical composition of Titan's atmosphere and collected material.","Identifies atmospheric constituents","Complex sample-analysis system",{"hux": true, "stage": "cassini", "lab": "GCMS"}),
  xl("c_acp","ACP — Aerosol Collector and Pyrolyser","science","sci",6,-10,3,1997,0.9,"Open University / instrument team","Collects atmospheric aerosols and heats them for chemical analysis.","Studies Titan haze particles","Consumes samples during analysis",{"hux": true, "stage": "cassini", "lab": "ACP"}),
  xl("c_disr","DISR — Descent Imager/Spectral Radiometer","science","sci",8,-12,5,1997,0.92,"University of Arizona / instrument team","Images Titan during descent and measures solar and reflected radiation.","Visual and spectral descent profile","Short operating window",{"hux": true, "stage": "cassini", "lab": "DISR"}),
  xl("c_dwe","DWE — Doppler Wind Experiment","science","sci",3,-4,2,1997,0.94,"University of Bonn / instrument team","Uses Doppler shifts in the probe radio signal to measure Titan winds.","Wind profile during descent","Depends on radio tracking geometry",{"hux": true, "stage": "cassini", "lab": "DWE"}),
  xl("c_ssp","SSP — Surface Science Package","science","sci",5,-7,3,1997,0.9,"Open University / instrument team","A suite of sensors that characterises Titan's surface or liquid-like environment at landing.","Direct surface-property measurements","Only useful if probe reaches the surface",{"hux": true, "stage": "cassini", "lab": "SSP"}),
  xl("a_gy","Gyro Package","navigation","x",6,-10,2,1960,0.93,"Bendix","Rate gyros for attitude control.","Cheap","Coarse pointing",{"stage": "cassini", "lab": "Gyro Pkg"}),
  xl("a_rw","Reaction Wheels","navigation","x",40,-30,12,1980,0.96,"Honeywell","3-axis momentum wheels for precise pointing.","Fine pointing","Wheels wear out",{"stage": "cassini", "lab": "React Wheels"}),
  xl("a_star","Star Tracker","navigation","tracker",2,-8,2,1960,0.96,"Generic historical subsystem class","Uses star-field observations to estimate spacecraft attitude for accurate pointing.","Accurate attitude knowledge","Needs clear view and calibration",{"stage": "cassini"}),
  xl("a_sun","Sun Sensor","navigation","x",0.5,-2,0.3,1957,0.94,"Generic historical subsystem class","Determines the Sun direction for safe orientation and solar-array pointing.","Simple safe-mode reference","Coarser than star tracking",{"stage": "cassini", "lab": "Sun Sensor"}),
  xl("d_rec","Onboard Data Recorder","data","store",5,-15,5,1960,0.95,"Generic spacecraft avionics subsystem","Stores instrument and engineering data until a communication window is available.","Buffers science data","Finite storage capacity",{"cap": 8, "stage": "cassini"}),
  xl("t_ctl","Thermal Control Subsystem","data","thermal",12,-20,4,1960,0.95,"Generic spacecraft thermal-control subsystem","Uses insulation, heaters and passive thermal hardware to keep equipment within operating temperatures.","Protects equipment temperature","Adds mass and heater load",{"stage": "cassini"})
);
// Stage 3 (Mars Science Laboratory, Nov 2011): catalogue parts with Available From <= 2011 that suit a rover.
PARTS.push(
  xl("b_rv","Rover Chassis","structure","bus",750,-60,200,2011,0.96,"NASA JPL","Rocker-bogie rover body with mast.","Surface mobility","Needs descent stage",{"stage": "msl"}),
  xl("p_mm","MMRTG","power","solar",45,110,80,2011,0.98,"Aerojet Rocketdyne / Teledyne","Multi-mission RTG powering Curiosity.","Sun-independent","Low power",{"stage": "msl"}),
  xl("p_li","Li-ion Battery","power","battery",30,0,10,2009,0.97,"Yardney","High energy-density battery.","Compact","Thermal sensitivity",{"stage": "msl"}),
  xl("r_sc","Sky Crane Descent Stage","propulsion","skycrane",380,-50,150,2011,0.95,"NASA JPL","Rocket-powered descent stage (holds 390 kg propellant).","Precision landing","One use only",{"cap": 390, "stage": "msl"}),
  xl("msl_edl_skycrane","Powered Descent / Sky Crane Stage","propulsion","skycrane",900,0,25,2011,0.91,"NASA/JPL; MSL landing system team","Rocket-powered descent stage lowers Curiosity on bridles before flying away.","Enables precision landing of heavy rover","Complex sequence and propellant requirement",{"cap": 390, "stage": "msl"}),
  xl("msl_edl_heatshield","MSL Entry Heat Shield","structure","x",385,0,12,2011,0.95,"Lockheed Martin / NASA-JPL","Thermal protection shield for atmospheric entry; discarded during descent.","Protects rover during entry","Single-use hardware; mass penalty",{"stage": "msl"}),
  xl("msl_edl_backshell","MSL Backshell & Parachute","structure","x",650,0,18,2011,0.94,"Lockheed Martin / NASA-JPL","Aeroshell backshell and supersonic parachute slow the vehicle during Mars entry and descent.","Major descent deceleration","Single-use; must match entry system",{"stage": "msl"}),
  xl("msl_wheels","Rover Mobility System (6 Wheels)","propulsion","mob",80,-120,10,2011,0.92,"NASA/JPL; MSL rover engineering team","Six-wheel rocker-bogie mobility system for traversing Martian terrain.","Enables surface exploration","Wheel damage and terrain hazards",{"stage": "msl"}),
  xl("msl_arm","Curiosity Robotic Arm & Turret","structure","x",30,-35,12,2011,0.91,"NASA/JPL; MSL rover engineering team","Positions contact science instruments, drill and sample-handling tools against selected targets.","Enables close-up analysis and sampling","Adds mass, power and mechanical complexity",{"stage": "msl"}),
  xl("msl_drill","Curiosity Sample Acquisition Drill","structure","x",4,-60,8,2011,0.9,"NASA/JPL; MSL rover engineering team","Drills powdered rock samples for delivery to onboard analytical instruments.","Accesses subsurface rock material","High peak power; mechanical wear",{"stage": "msl"}),
  xl("msl_scoop","Soil Scoop & Sample Handling System","structure","x",2,-15,4,2011,0.91,"NASA/JPL; MSL rover engineering team","Collects, sieves and delivers soil or powdered rock to onboard instruments.","Feeds samples to analytical labs","Can be affected by sticky or cohesive soil",{"stage": "msl"}),
  xl("s_mc","Mastcam","science","sci",2,-7,12,2011,0.97,"Malin Space Science Systems","Colour stereo mast cameras.","Light","Surface only",{"stage": "msl", "lab": "Mastcam"}),
  xl("s_cc","ChemCam","science","sci",10.7,-20,10,2011,0.95,"LANL / CNES","Laser rock analyser.","Remote chemistry","Limited range",{"stage": "msl", "lab": "ChemCam"}),
  xl("s_sa","SAM Lab","science","sci",40,-40,60,2011,0.94,"NASA Goddard","Gas chromatograph/mass spectrometer.","Finds organics","Heavy, complex",{"stage": "msl", "lab": "SAM"}),
  xl("s_ch","CheMin","science","sci",10,-40,8,2011,0.95,"NASA Ames","X-ray mineral analyser.","Mineral ID","Needs sample",{"stage": "msl", "lab": "CheMin"}),
  xl("msl_apxs","APXS — Alpha Particle X-ray Spectrometer","science","sci",2,-5,4,2011,0.93,"Canadian Space Agency / MSL instrument team","Measures elemental composition of rocks and soil using alpha particles and X-rays.","In-situ elemental chemistry","Requires robotic-arm placement near target",{"stage": "msl", "lab": "APXS"}),
  xl("msl_dan","DAN — Dynamic Albedo of Neutrons","science","sci",2.5,-5,3,2011,0.93,"Russian Federal Space Agency / IKI","Detects hydrogen beneath the rover, helping identify subsurface water-bearing materials.","Subsurface hydrogen mapping","Limited sensing footprint",{"stage": "msl", "lab": "DAN"}),
  xl("msl_mardi","MARDI — Mars Descent Imager","science","sci",1.5,-5,2,2011,0.92,"Malin Space Science Systems","Records images of the landing site during descent to the Martian surface.","Landing-site geological context","Primarily used during descent",{"stage": "msl", "lab": "MARDI"}),
  xl("msl_mahli","MAHLI — Mars Hand Lens Imager","science","sci",0.9,-4,2,2011,0.94,"Malin Space Science Systems","Close-up camera mounted on the robotic arm for examining rocks, soil and hardware.","Microscopic-scale surface textures","Requires arm positioning",{"stage": "msl", "lab": "MAHLI"}),
  xl("msl_rad","RAD — Radiation Assessment Detector","science","sci",1.6,-4,3,2011,0.94,"Southwest Research Institute / Christian-Albrechts University","Measures energetic particle and radiation environment at the Martian surface.","Human-exploration radiation data","Continuous monitoring consumes resources",{"stage": "msl", "lab": "RAD"}),
  xl("msl_rems","REMS — Rover Environmental Monitoring Station","science","sci",1.3,-5,4,2011,0.93,"Centro de Astrobiología (Spain)","Measures weather conditions including air/ground temperature, pressure, humidity, wind and UV.","Daily environmental records","Sensor booms exposed to environment",{"stage": "msl", "lab": "REMS"}),
  xl("c_uh","UHF Relay (Electra)","comms","uhf",8,-20,12,2005,0.96,"NASA JPL","Relay for surface missions.","Supports landers","Short range",{"stage": "msl"}),
  xl("msl_uhf","Mars Surface UHF Relay Radio","comms","uhf",2,-15,3,2011,0.95,"JPL / Electra-compatible relay system","Provides UHF communications with orbiters for store-and-forward data relay.","Reliable rover-to-orbiter data return","Requires orbiter passes",{"stage": "msl"})
);
// Stage 4 (Juno, Aug 2011): Juno-specific catalogue parts plus generic parts available by 2011.
PARTS.push(
  xl("j_radiation_vault","Juno Radiation Vault","structure","x",200,0,8,2011,0.96,"JPL / Juno spacecraft team","Titanium-enclosed electronics vault shields sensitive avionics from Jupiter's intense radiation.","Protects spacecraft electronics","Adds substantial mass",{"stage": "juno"}),
  xl("j_sru","Stellar Reference Unit (Juno)","navigation","x",1,-3,2,2011,0.96,"JPL / Juno flight system","Radiation-hardened star camera used for attitude knowledge and navigation support.","Precise attitude reference","Radiation exposure at Jupiter",{"stage": "juno"}),
  xl("s_jc","JunoCam","science","sci",4,-12,8,2011,0.97,"Malin Space Science Systems","Public-outreach colour camera.","Cheap, popular","Radiation-limited",{"stage": "juno"}),
  xl("j_mwr","Juno Microwave Radiometer (MWR)","science","sci",25,-25,12,2011,0.93,"NASA/JPL; instrument team","Measures microwave emissions to probe Jupiter's deep atmospheric water and ammonia distribution.","Probes deep atmosphere","Requires carefully planned scans",{"stage": "juno", "lab": "MWR"}),
  xl("j_jiram","JIRAM — Jovian Infrared Auroral Mapper","science","sci",12,-15,8,2011,0.93,"Italian Space Agency / INAF","Images Jupiter's auroras and maps atmospheric chemistry in infrared wavelengths.","Auroral and atmospheric mapping","Infrared detector thermal constraints",{"stage": "juno", "lab": "JIRAM"}),
  xl("j_mag","Juno Magnetometer Investigation","science","sci",10,-8,6,2011,0.94,"NASA Goddard / instrument team","Measures Jupiter's magnetic field using sensors mounted away from spacecraft interference.","Maps powerful magnetic field","Requires long boom and magnetic cleanliness",{"stage": "juno", "lab": "Magnetometer"}),
  xl("j_jade","JADE — Jovian Auroral Distributions Experiment","science","sci",12,-12,6,2011,0.92,"Southwest Research Institute","Measures low-energy ions and electrons in Jupiter's auroral regions.","Characterises auroral particles","Sensitive to spacecraft charging and orientation",{"stage": "juno", "lab": "JADE"}),
  xl("j_jedi","JEDI — Jupiter Energetic Particle Detector Instrument","science","sci",12,-10,5,2011,0.92,"Applied Physics Laboratory","Measures energetic ions and electrons around Jupiter.","Studies energetic particle populations","Radiation environment is demanding",{"stage": "juno", "lab": "JEDI"}),
  xl("j_waves","Waves Radio/Plasma Wave Instrument","science","sci",5,-7,4,2011,0.94,"University of Iowa","Measures radio and plasma waves in Jupiter's magnetosphere.","Detects plasma-wave phenomena","Needs antenna and electromagnetic cleanliness",{"stage": "juno", "lab": "Waves"}),
  xl("j_uvs","UVS — Ultraviolet Imaging Spectrograph","science","sci",12,-12,7,2011,0.93,"Southwest Research Institute","Images ultraviolet auroral emissions to study Jupiter's upper atmosphere.","Auroral imaging and spectroscopy","Requires pointing and detector protection",{"stage": "juno", "lab": "UVS"})
);
// Stage 5 (Dawn, Sep 2007): Dawn-specific catalogue parts plus generic parts available by 2007.
PARTS.push(
  xl("d_fc","Dawn Framing Camera","science","sci",5,-10,8,2007,0.94,"Max Planck Institute for Solar System Research / DLR","Takes visible-light images for mapping and geological context at Vesta and Ceres.","High-resolution surface mapping","Requires pointing and image storage",{"stage": "dawn"}),
  xl("d_vir","VIR — Visible and Infrared Spectrometer","science","sci",22,-15,10,2007,0.93,"Italian National Institute for Astrophysics (INAF)","Maps mineral and surface composition using visible and infrared spectra.","Compositional surface mapping","Data and thermal management demands",{"stage": "dawn"}),
  xl("d_grand","GRaND — Gamma Ray and Neutron Detector","science","sci",10,-12,8,2007,0.92,"Los Alamos National Laboratory","Measures gamma rays and neutrons to infer elemental composition of asteroid surfaces.","Elemental composition mapping","Needs long integration times",{"stage": "dawn"}),
  xl("d_ion","NSTAR Ion Propulsion System","propulsion","engine",120,-2500,25,2007,0.92,"NASA Glenn Research Center / Aerojet Rocketdyne","Solar-electric xenon ion propulsion system used for long-duration efficient deep-space manoeuvres.","Very high propellant efficiency","Low thrust; long burns and large power demand",{"stage": "dawn"}),
  xl("d_xenon","Xenon Propellant Tank & Feed System","propulsion","tank",80,-10,10,2007,0.94,"Dawn propulsion subsystem suppliers","Stores and feeds xenon propellant to the ion propulsion system.","Enables long-duration ion thrusting","Tank mass and finite xenon supply",{"cap": 425, "stage": "dawn"}),
  xl("d_solar","Dawn Large Solar Array Wings","power","solar",250,10000,18,2007,0.94,"Orbital Sciences Corporation","Large deployable solar arrays supply electrical power at the inner asteroid belt and charge spacecraft batteries.","Supports ion propulsion and payload","Output falls with distance from Sun",{"stage": "dawn"}),
  xl("d_hga","Dawn High-Gain Antenna","comms","hga",15,-45,4,2007,0.95,"Dawn telecom subsystem","High-gain X-band dish for deep-space command and science-data return.","Long-distance communication","Requires accurate pointing",{"stage": "dawn"}),
  xl("d_star","Dawn Star Tracker","navigation","tracker",2,-5,2,2007,0.95,"Dawn flight system supplier","Star tracker supports attitude determination for imaging and antenna pointing.","Accurate pointing","Needs star visibility",{"stage": "dawn"}),
  xl("d_ion_pdu","Ion Propulsion Power Processing Unit","power","x",35,-100,12,2007,0.93,"NASA/JPL Dawn propulsion system","Conditions and controls spacecraft electrical power delivered to the ion thrusters.","Enables controlled electric propulsion","High electrical load and thermal dissipation",{"stage": "dawn"})
);
const TECH_CUTOFF = CAS ? 1997 : MSL || JUNO ? 2011 : DAWN ? 2007 : 2005, HUX = new Set(PARTS.filter(q => q.hux).map(q => q.id));
const POOLS = { cassini: new Set(['d_cdh','b_mm','p_gp','r_bi','r_hy','r_ts','r_tl','c_hs','c_hx','c_sb']), msl: new Set(['c_ka','c_hx','c_hs','d_cdh','p_nh','d_rec','a_gy','a_sun','t_ctl']),
  dawn: new Set(['b_mm','b_hc','p_ga','p_sw','p_nh','r_hy','r_ts','c_hx','c_hs','c_ka','c_sb','a_gy','a_rw','a_sun','d_rec','d_cdh','t_ctl']),
  juno: new Set(['b_mm','b_tr','p_sw','p_ga','p_li','p_nh','r_bi','r_hy','r_ts','r_tl','c_ka','c_hx','c_hs','c_sb','a_sun','a_gy','d_rec','d_cdh','t_ctl']) };
const avail = q => STAGE === 'mro' ? (!q.stage && (!q.year || q.year <= TECH_CUTOFF)) : (q.stage === STAGE || POOLS[STAGE].has(q.id));
const DUTY = MSL ? 0.2 : 1, SOLAR_F = JUNO ? 0.0725 : DAWN ? 0.13 : 1, DEMAND_F = DAWN ? { d_ion: 0.3 } : {}; // Dawn: solar output at ~3 AU = catalogue rating x 0.13 (so the Dawn wings give about 1.3 kW); the ion engines are throttled and counted at 30% of their rating // Juno: solar output at Jupiter = catalogue rating x 0.0725 (so three Triple-Junction wings give about 435 W)
const P = Object.fromEntries(PARTS.map(x => [x.id, x]));
// Stencil: where each kind of part goes (x,y,w,h in a 100x58 grid)
const s = (id,label,type,x,y,w,h,pid) => ({ id,label,type,x,y,w,h,pid });
const SLOTS_MRO = [
  s('bus','Bus','bus',40,22,20,17), s('solL','Solar L','solar',3,20,28,15), s('solR','Solar R','solar',69,20,28,15),
  s('hga','HGA','hga',44,2,16,12), s('uhf','UHF','uhf',66,6,12,9), s('trk','Tracker','tracker',22,6,12,9),
  s('hirise','HiRISE','sci',3,40,12,9,'hirise'), s('crism','CRISM','sci',16,40,12,9,'crism'),
  s('ctx','CTX','sci',3,51,12,9,'ctx'), s('marci','MARCI','sci',16,51,12,9,'marci'),
  s('sharad','SHARAD','sci',76,40,12,9,'sharad'), s('mcs','MCS','sci',76,51,12,9,'mcs'),
  s('bat','Battery','battery',30,42,12,9), s('store','Recorder','store',44,42,12,9), s('thm','Thermal','thermal',58,42,12,9),
  s('tnk','Tank','tank',28,53,13,8), s('eng','Engine','engine',42,53,13,8), s('thr','Thruster','thruster',56,53,14,8)
];
// Cassini-Huygens stencil: bus in the middle, spokes for antennas, boom, probe, RTGs, propulsion
const SLOTS_CAS = [
  s('bus','Cassini Bus','bus',41,25,18,13), s('hga','High-Gain Ant','hga',42,3,16,12), s('lga','Low-Gain Ant','x',78,14,17,9,'c_sb'),
  s('mboom','Mag Boom','x',4,14,17,9,'c_magboom'), s('trk','Tracker','tracker',24,5,13,8), s('thm','Thermal','thermal',24,16,13,8), s('cdh','C&DH','x',4,3,17,8,'d_cdh'),
  s('store1','Recorder 1','store',62,3,13,8), s('store2','Recorder 2','store',62,13,13,8),
  s('probe','Huygens Probe','x',4,34,19,9,'c_huygens'), s('psup','Probe Support','x',4,46,19,9,'c_probe_support'),
  s('rtg1','RTG 1','solar',28,46,13,8,'p_gp'), s('rtg2','RTG 2','solar',43,46,13,8,'p_gp'), s('rtg3','RTG 3','solar',58,46,13,8,'p_gp'),
  s('eng','Engine','engine',80,24,15,8), s('thr','Thrusters','thruster',80,34,15,8), s('tk1','Tank 1','tank',64,36,13,8), s('tk2','Tank 2','tank',80,44,15,8),
  s('tk3','Tank 3','tank',74,54,12,7), s('tk4','Tank 4','tank',87,54,11,7), s('tk5','Tank 5','tank',60,55,12,6)
];
// Mars Science Laboratory stencil: rover chassis in the middle, spokes for antennas, power, descent stage, mobility, instruments
const SLOTS_MSL = [
  s('bus','Rover Chassis','bus',41,25,18,13), s('hga','High-Gain Ant','hga',42,3,16,11), s('uhf','UHF Relay','uhf',62,4,13,8), s('cdh','C&DH','x',62,14,13,8,'d_cdh'),
  s('gyro','Gyro / IMU','x',24,4,13,8,'a_gy'), s('sun','Sun Sensor','x',24,14,13,8,'a_sun'),
  s('mmrtg','MMRTG','solar',4,12,17,9,'p_mm'), s('bat','Battery','battery',4,24,17,8), s('thm','Thermal','thermal',80,14,15,9), s('store','Recorder','store',80,25,15,8),
  s('skycrane','Sky Crane','skycrane',4,36,19,9), s('shield','Heat Shield','x',4,48,19,8,'msl_edl_heatshield'), s('back','Backshell','x',26,48,19,8,'msl_edl_backshell'),
  s('arm','Robotic Arm','x',30,39,15,8,'msl_arm'), s('drill','Drill','x',47,39,15,8,'msl_drill'), s('scoop','Scoop','x',64,39,13,8,'msl_scoop'), s('mob','Mobility','mob',80,36,15,9)
];
// Juno stencil: bus in the middle; three solar wings, radiation vault, antenna, instruments and the propulsion group around it
const SLOTS_JUNO = [
  s('bus','Juno Bus','bus',41,25,18,13), s('hga','High-Gain Ant','hga',42,3,16,10), s('sru','Stellar Ref','x',25,4,13,8,'j_sru'), s('cdh','C&DH','x',62,4,13,8,'d_cdh'),
  s('w1','Solar Wing 1','solar',3,10,20,9), s('w2','Solar Wing 2','solar',77,10,20,9), s('w3','Solar Wing 3','solar',3,22,20,9),
  s('vault','Radiation Vault','x',77,24,19,9,'j_radiation_vault'), s('cam','JunoCam','sci',77,36,19,9,'s_jc'), s('bat','Li-ion Battery','battery',3,36,19,9),
  s('thm','Thermal','thermal',25,14,13,8), s('store','Recorder','store',62,14,13,8),
  s('tk1','Tank 1','tank',30,44,13,8), s('tk2','Tank 2','tank',45,44,13,8), s('tk3','Tank 3','tank',60,44,13,8), s('eng','Main Engine','engine',45,53,13,7), s('thr','Thrusters','thruster',62,53,13,7)
];
// Dawn stencil: bus in the middle; solar wings, ion propulsion (xenon tank, power processing unit, ion engines), hydrazine thrusters and the three instruments around it
const SLOTS_DAWN = [
  s('bus','Dawn Bus','bus',41,26,18,13), s('hga','High-Gain Ant','hga',42,3,16,10), s('cdh','C&DH','x',62,4,13,8,'d_cdh'), s('store','Recorder','store',62,14,13,8),
  s('gyro','Gyro Package','x',22,4,13,8,'a_gy'), s('trk','Star Tracker','tracker',22,14,13,8,'d_star'),
  s('wings','Solar Wings','solar',3,24,20,10), s('thm','Thermal','thermal',25,26,13,8), s('bat','Battery','battery',3,36,20,8), s('pdu','Ion Power Unit','x',77,24,19,9,'d_ion_pdu'),
  s('fc','Framing Cam','sci',77,35,19,7,'d_fc'), s('vir','VIR','sci',77,43,19,7,'d_vir'), s('grand','GRaND','sci',77,51,19,7,'d_grand'),
  s('xenon','Xenon Tank','tank',3,48,20,9,'d_xenon'), s('ion','Ion Engines','engine',26,48,17,9,'d_ion'), s('hyd','Hydrazine Tank','tank',46,48,14,9,'r_ts'), s('rcs','RCS Thrusters','thruster',62,48,13,9)
];
const SLOTS = DAWN ? SLOTS_DAWN : JUNO ? SLOTS_JUNO : MSL ? SLOTS_MSL : CAS ? SLOTS_CAS : SLOTS_MRO;
// Connection ports per slot type: P = power, D = data
const PORTS = { bus:['P IN'], solar:['P OUT'], battery:['P IN','P OUT'], tracker:['P IN'], sci:['P IN','D OUT'], hga:['P IN','D IN'], uhf:['P IN','D IN'], store:['P IN','D IN','D OUT'], thermal:['P IN'], skycrane:['P IN'], mob:['P IN'] };
const portsOf = sl => sl.type === 'x' ? (P[sl.pid] && P[sl.pid].pw < 0 ? ['P IN'] : []) : (PORTS[sl.type] || []);
const portsFor = (sl, m) => m === 'structure' ? (sl.type === 'bus' ? ['BUS'] : ['ATTACH']) : portsOf(sl).filter(x => x[0] === (m === 'power' ? 'P' : 'D'));
// Extra-equipment slots: a grid below the main diagram, grouped by category (scroll the diagram).
const EXTRA_HEAD = {}; let STENCIL_H = 66;
CATS.forEach(([cid]) => { const g = PARTS.filter(q => q.lab && q.cat === cid && avail(q) && !SLOTS.some(sl => sl.pid === q.id)); if (!g.length) return; EXTRA_HEAD[cid] = STENCIL_H; STENCIL_H += 5;
  g.forEach((q, i) => SLOTS.push({ id: q.id, label: q.lab, type: q.type, x: 3 + (i % 7) * 13.4, y: STENCIL_H + Math.floor(i / 7) * 10.5, w: 12.4, h: 9.5, pid: q.id }));
  STENCIL_H += Math.ceil(g.length / 7) * 10.5 + 3; });
const SL = Object.fromEntries(SLOTS.map(x => [x.id, x]));
const accepts = (sl, part) => sl.type === part.type && (!sl.pid || sl.pid === part.id);
const KEY = 'oe_' + STAGE + '_design';
let placed = {}, links = [], mode = 'build', cat = 'structure', selPart = null, selSlot = null, pending = null, note = '';
try { const d = JSON.parse(localStorage.getItem(KEY) || 'null'); if (d) { placed = d.placed || {}; links = d.links || []; } } catch (e) {}
const save = () => { try { localStorage.setItem(KEY, JSON.stringify({ placed, links })); } catch (e) {} };
const money = m => m >= 1 ? '$' + +m.toFixed(1) + 'M' : '$' + Math.round(m * 1000) + 'k';
const part = sid => placed[sid] && P[placed[sid]];
const center = sl => [sl.x + sl.w / 2, sl.y + sl.h / 2];

// ---------- installation prerequisites ----------
// Data-driven: part id -> parts that must already be installed. Every non-bus part also needs the spacecraft bus.
// Tokens: 'BUS' = the stage's primary bus/chassis, 'd_rec' = a data recorder (the stage's recorder part).
// Rules only apply to parts present in the current stage, and a dependency is rejected if it would use newer technology.
const REQ = { d_rec:['d_cdh'], a_rw:['a_gy'], r_hy:['r_ts'], r_bi:['r_tl'], c_hs:['c_sb'],
  hirise:['d_cdh','d_rec'], crism:['d_cdh','d_rec'], sharad:['d_cdh','d_rec'], ctx:['d_cdh','d_rec'], marci:['d_cdh','d_rec'], mcs:['d_cdh','d_rec'], c_hx:['d_cdh'], c_uh:['d_cdh'],
  c_mag:['c_magboom'], c_huygens:['c_probe_support'], c_hasi:['c_huygens'], c_gc_ms:['c_huygens'], c_acp:['c_huygens'], c_disr:['c_huygens'], c_dwe:['c_huygens'], c_ssp:['c_huygens'],
  c_radar:['d_cdh','d_rec'], c_cirs:['d_cdh','d_rec'], c_iss:['d_cdh','d_rec'], c_uvis:['d_cdh','d_rec'], c_vims:['d_cdh','d_rec'], c_caps:['d_cdh','d_rec'], c_cda:['d_cdh','d_rec'], c_inms:['d_cdh','d_rec'], c_mimi:['d_cdh','d_rec'], c_rpws:['d_cdh','d_rec'], c_rss:['d_cdh','d_rec'],
  d_ion:['d_xenon','d_ion_pdu','d_solar'], d_xenon:[], d_ion_pdu:['d_solar'], d_fc:['d_cdh','d_rec'], d_vir:['d_cdh','d_rec'], d_grand:['d_cdh','d_rec'], d_hga:['d_cdh'], d_star:['a_gy'],
  msl_wheels:['b_rv'], msl_arm:['b_rv'], msl_drill:['msl_arm'], msl_scoop:['msl_arm'], msl_mahli:['msl_arm'], msl_apxs:['msl_arm'], msl_mardi:['b_rv','d_cdh','d_rec'], msl_dan:['b_rv','d_cdh','d_rec'], msl_rad:['b_rv','d_cdh','d_rec'], msl_rems:['b_rv','d_cdh','d_rec'],
  msl_uhf:['b_rv','d_cdh'], p_mm:['b_rv'], msl_edl_skycrane:['msl_edl_heatshield','msl_edl_backshell'],
  j_radiation_vault:[], j_sru:['d_cdh'], j_mwr:['d_cdh','d_rec'], j_jiram:['d_cdh','d_rec'], j_mag:['d_cdh','d_rec'], j_jade:['d_cdh','d_rec'], j_jedi:['d_cdh','d_rec'], j_waves:['d_cdh','d_rec'], j_uvs:['d_cdh','d_rec'], s_jc:['d_cdh','d_rec'] };
const recorderPart = () => PARTS.find(z => z.type === 'store' && avail(z));
const RULES = {}; window.PREREQ_REJECTED = [];
PARTS.forEach(q => { if (!avail(q) || q.type === 'bus') return;
  const toks = ['BUS'];
  (REQ[q.id] || []).forEach(t => {
    if (t === 'BUS') return;
    const r = t === 'd_rec' ? recorderPart() : P[t], ry = (P[t] && P[t].year != null) ? P[t].year : (r && r.year);
    if (!r || !avail(r)) { window.PREREQ_REJECTED.push(q.id + ' needs ' + t + ': not available in this stage (omitted)'); return; }
    if (ry != null && ((q.year != null && ry > q.year) || ry > TECH_CUTOFF)) { window.PREREQ_REJECTED.push(q.id + ' needs ' + t + ': ' + ry + ' is newer than the part or the stage cutoff (rejected)'); return; }
    toks.push(t); });
  RULES[q.id] = toks; });
if (window.PREREQ_REJECTED.length) console.warn('[prerequisites] rejected rules:', window.PREREQ_REJECTED);
const reqHave = t => t === 'BUS' ? Object.values(placed).some(i => P[i].type === 'bus') : t === 'd_rec' ? Object.values(placed).some(i => P[i].type === 'store') : Object.values(placed).includes(t);
const reqName = t => t === 'BUS' ? (MSL ? 'Rover Chassis' : 'Spacecraft Bus') : t === 'd_rec' ? 'Data Recorder' : P[t].name;
const missingFor = pid => (RULES[pid] || []).filter(t => !reqHave(t));
const lockText = pid => 'INSTALL ' + missingFor(pid).map(reqName).join(' + ') + ' FIRST';
const cardLock = pid => { const m = missingFor(pid); return 'INSTALL ' + reqName(m[0]) + ' FIRST' + (m.length > 1 ? ' (+' + (m.length - 1) + ' MORE)' : ''); };
const lockNote = pid => 'Locked: install the ' + missingFor(pid).map(reqName).join(', the ') + ' first.';
const needAttention = () => Object.keys(placed).filter(sid => missingFor(placed[sid]).length);

// ---------- rules ----------
function compatible(t, a, b) {
  const A = part(a), B = part(b); if (!A || !B || a === b) return false;
  const src = x => x.type === 'solar' || x.type === 'battery', ty = [A.type, B.type];
  if (t === 'structure') { const host = (ch, pa) => ch.type !== 'bus' && (HUX.has(ch.id) ? pa.id === 'c_huygens' : pa.type === 'bus'); return host(A, B) || host(B, A); }
  if (t === 'power') {
    if (src(A) && src(B)) return ty.includes('solar') && ty.includes('battery');
    const [S, C] = src(A) ? [A, B] : [B, A]; return src(S) && !src(C) && C.pw < 0;
  }
  const has = x => ty.includes(x); return (has('sci') && has('store')) || (has('store') && (has('hga') || has('uhf')));
}
const linked = (t, a, b) => links.some(l => l.t === t && ((l.a === a && l.b === b) || (l.a === b && l.b === a)));
const linksOf = (t, a) => links.filter(l => l.t === t && (l.a === a || l.b === a)).map(l => l.a === a ? l.b : l.a);
function addLink(t, a, b) {
  if (!compatible(t, a, b)) return 'Not compatible: ' + t + ' links cannot join those two parts.';
  if (linked(t, a, b)) return 'Those parts are already linked (click the line to remove it).';
  links.push({ t, a, b }); return '';
}
function install(sid, pid) { if (missingFor(pid).length) { note = lockNote(pid); return false; } placed[sid] = pid; selSlot = sid; note = P[pid].name + ' installed.'; return true; }
function removeSlot(sid) { const nm = P[placed[sid]].name; delete placed[sid]; links = links.filter(l => l.a !== sid && l.b !== sid); if (selSlot === sid) selSlot = null;
  const bad = needAttention(); note = nm + ' removed; its connections were removed too.' + (bad.length ? ' ' + bad.length + ' part(s) now need attention (reinstall what they require): ' + bad.slice(0, 3).map(i => P[placed[i]].name).join(', ') + (bad.length > 3 ? '...' : '.') : ''); }
function autoConnect(t) {
  const ids = Object.keys(placed), by = ty => ids.filter(i => part(i).type === ty); let n = 0;
  const add = (a, b) => { if (a && b && !linked(t, a, b) && compatible(t, a, b)) { links.push({ t, a, b }); n++; } };
  if (t === 'structure') { const pr = ids.find(i => placed[i] === 'c_huygens'); ids.forEach(i => add(HUX.has(placed[i]) ? pr : ('bus' in placed ? 'bus' : null), i)); }
  if (t === 'power') { const src = by('solar')[0] || by('battery')[0]; ids.forEach(i => add(src, i)); if (by('solar')[0]) by('battery').forEach(i => add(by('solar')[0], i)); }
  if (t === 'data') { const sts = by('store'); by('sci').forEach(i => add(i, sts[0])); sts.forEach(st => by('hga').concat(by('uhf')).forEach(i => add(st, i))); }
  note = n ? n + ' ' + t + ' connection(s) added.' : 'Nothing new to connect.';
}

// ---------- calculations ----------
function calc() {
  const ids = Object.keys(placed), ps = ids.map(i => ({ sid: i, p: part(i) }));
  const sum = f => ps.reduce((a, x) => a + f(x.p), 0), of = t => ps.filter(x => x.p.type === t);
  const fuelAll = sum(q => q.cap && (q.type === 'tank' || q.type === 'skycrane') ? q.cap : 0) + sum(q => q.fuel ? q.mass : 0), dry = sum(q => q.fuel ? 0 : q.mass);
  const prop = DAWN ? sum(q => q.id === 'd_xenon' ? q.cap : 0) : fuelAll; // Dawn: the propellant bar tracks xenon only; hydrazine still counts toward mass
  const consumers = ps.filter(x => x.p.pw < 0), sci = of('sci'), others = ps.filter(x => x.p.type !== 'bus');
  const isSrc = i => ['solar', 'battery'].includes(part(i)?.type);
  return { ps, of, prop, mass: dry + fuelAll, cost: sum(q => q.cost), gen: Math.round(sum(q => q.pw > 0 ? q.pw * (q.type === 'solar' ? SOLAR_F : 1) : 0)), demand: Math.round(-sum(q => q.pw < 0 ? q.pw * (DEMAND_F[q.id] || 1) : 0) * DUTY * 10) / 10,
    consumers, sci, others, cap: sum(q => q.type === 'store' ? q.cap : 0),
    structOK: others.filter(x => linksOf('structure', x.sid).some(i => part(i) && (HUX.has(x.p.id) ? part(i).id === 'c_huygens' : part(i).type === 'bus'))).length,
    powered: consumers.filter(x => linksOf('power', x.sid).some(isSrc)).length,
    routed: sci.filter(x => linksOf('data', x.sid).some(i => part(i) && part(i).type === 'store')).length };
}
function checks(c) { const k = DAWN ? checksDawn(c) : JUNO ? checksJuno(c) : MSL ? checksMsl(c) : CAS ? checksCas(c) : checksMro(c), bad = needAttention();
  k.push({ level: 'crit', ok: !bad.length, msg: bad.length ? 'Missing installation prerequisites: ' + bad.slice(0, 3).map(i => P[placed[i]].name + ' needs ' + missingFor(placed[i]).map(reqName).join(' + ')).join('; ') + (bad.length > 3 ? ' (+' + (bad.length - 3) + ' more)' : '') + '.' : 'All installation prerequisites met.' });
  return k; }
function checksMro(c) {
  const has = t => c.of(t).length > 0, k = [];
  const add = (level, ok, pass, fail) => k.push({ level, ok, msg: ok ? pass : fail });
  add('crit', has('bus'), 'Spacecraft bus installed.', 'Missing spacecraft bus (structure).');
  add('crit', has('solar'), 'Solar arrays installed.', 'No solar arrays: nothing generates power.');
  add('crit', has('battery'), 'Battery installed.', 'No battery installed.');
  add('crit', has('engine'), 'Main engine installed.', 'No engine: cannot enter Mars orbit.');
  add('crit', has('tank'), 'Propellant tank installed.', 'No propellant tank installed.');
  add('crit', has('thruster'), 'Thrusters installed.', 'No thrusters for attitude control.');
  add('crit', has('tracker'), 'Navigation equipment installed.', 'No star tracker: no navigation.');
  add('crit', c.sci.length > 0, c.sci.length + ' science instrument(s) carried.', 'No science instruments selected.');
  add('crit', has('hga'), 'High-gain antenna installed.', 'No high-gain antenna: cannot send data home.');
  add('crit', has('store'), 'Data storage installed.', 'No data storage installed.');
  add('crit', has('thermal'), 'Thermal control installed.', 'No thermal control installed.');
  add('crit', c.mass <= REF.mass, 'Launch mass within ' + REF.mass + ' kg.', 'Excessive mass: ' + c.mass.toFixed(0) + ' kg exceeds ' + REF.mass + ' kg.');
  add('crit', c.cost <= REF.bud, 'Within funding.', 'Over budget by $' + (c.cost - REF.bud).toFixed(1) + 'M.');
  add('crit', c.gen >= c.demand && c.gen > 0, 'Power generation covers demand.', 'Insufficient power: ' + c.gen + ' W generated, ' + c.demand + ' W needed.');
  add('crit', c.structOK === c.others.length, 'All parts structurally attached.', (c.others.length - c.structOK) + ' part(s) lack a structural connection.');
  add('crit', c.powered === c.consumers.length, 'All consumers powered.', (c.consumers.length - c.powered) + ' part(s) are unpowered.');
  add('crit', c.routed === c.sci.length, 'All instruments have data routes.', (c.sci.length - c.routed) + ' instrument(s) have no data route to the recorder.');
  const st = c.of('store')[0];
  add('crit', !st || linksOf('data', st.sid).some(i => ['hga', 'uhf'].includes(part(i).type)), 'Recorder is linked to a radio.', 'Recorder is not linked to any antenna/radio.');
  add('warn', has('uhf'), 'UHF relay installed.', 'No UHF relay: no relay support for other missions.');
  add('warn', !has('tank') || c.prop >= REF.prop, 'Propellant meets reference load.', 'Propellant ' + c.prop + ' kg is below the ' + REF.prop + ' kg reference.');
  add('warn', c.cap >= c.sci.length, 'Data storage is sufficient.', 'Storage handles ' + c.cap + ' instrument(s), ' + c.sci.length + ' installed.');
  add('warn', c.sci.some(x => ['crism', 'sharad'].includes(x.sid)), 'Payload can investigate water/ice.', 'Objective gap: no CRISM or SHARAD to investigate water and ice.');
  add('warn', c.sci.some(x => ['hirise', 'ctx'].includes(x.sid)), 'Payload can take high-resolution images.', 'Objective gap: no HiRISE or CTX camera for imaging.');
  return k;
}

function checksCas(c) {
  const has = t => c.of(t).length > 0, hp = id => Object.values(placed).includes(id), k = [];
  const add = (level, ok, pass, fail) => k.push({ level, ok, msg: ok ? pass : fail });
  add('crit', has('bus'), 'Spacecraft bus installed.', 'Missing spacecraft bus (structure).');
  add('crit', has('solar'), 'RTG power source installed.', 'No RTG: nothing generates power this far from the Sun.');
  add('crit', has('engine'), 'Main engine installed.', 'No engine: cannot enter orbit around Saturn.');
  add('crit', has('tank'), 'Propellant tank installed.', 'No propellant tank installed.');
  add('crit', has('thruster'), 'Thrusters installed.', 'No thrusters for attitude control.');
  add('crit', has('tracker'), 'Star tracker installed.', 'No star tracker: no navigation.');
  add('crit', c.sci.length > 0, c.sci.length + ' science instrument(s) carried.', 'No science instruments selected.');
  add('crit', has('hga'), 'High-gain antenna installed.', 'No high-gain antenna: cannot send data home.');
  add('crit', has('store'), 'Data recorder installed.', 'No data recorder installed.');
  add('crit', hp('d_cdh'), 'Command & data handling unit installed.', 'No command & data handling unit.');
  add('crit', has('thermal'), 'Thermal control installed.', 'No thermal control installed.');
  add('crit', c.mass <= REF.mass, 'Launch mass within ' + REF.mass + ' kg.', 'Excessive mass: ' + c.mass.toFixed(0) + ' kg exceeds ' + REF.mass + ' kg.');
  add('crit', c.cost <= REF.bud, 'Within funding.', 'Over budget by $' + (c.cost - REF.bud).toFixed(1) + 'M.');
  add('crit', c.gen >= c.demand && c.gen > 0, 'Power generation covers demand.', 'Insufficient power: ' + c.gen + ' W generated, ' + c.demand + ' W needed.');
  add('crit', c.structOK === c.others.length, 'All parts structurally attached.', (c.others.length - c.structOK) + ' part(s) lack a structural connection.');
  add('crit', c.powered === c.consumers.length, 'All consumers powered.', (c.consumers.length - c.powered) + ' part(s) are unpowered.');
  add('crit', c.routed === c.sci.length, 'All instruments have data routes.', (c.sci.length - c.routed) + ' instrument(s) have no data route to a recorder.');
  const sts = c.of('store');
  add('crit', sts.every(st => linksOf('data', st.sid).some(i => part(i).type === 'hga')), 'Recorders are linked to the antenna.', 'A recorder is not linked to the high-gain antenna.');
  add('crit', !c.sci.some(x => HUX.has(x.p.id)) || hp('c_huygens'), 'Huygens instruments have their probe.', 'Huygens instruments need the Huygens probe installed.');
  add('warn', c.prop >= REF.prop, 'Propellant meets the ' + REF.prop + ' kg reference.', 'Propellant ' + c.prop + ' kg is below the ' + REF.prop + ' kg reference, so orbit insertion at Saturn is at risk.');
  add('warn', c.cap >= c.sci.length, 'Data storage is sufficient.', 'Recorders handle ' + c.cap + ' instrument(s), ' + c.sci.length + ' installed.');
  add('warn', ['c_iss', 'c_vims', 'c_uvis', 'c_cirs'].some(hp), "Payload can study Saturn's rings.", "Objective gap: no ISS, VIMS, UVIS or CIRS to study the rings.");
  add('warn', hp('c_huygens') || ['c_inms', 'c_radar'].some(hp), "Payload can investigate Titan's atmosphere.", "Objective gap: no Huygens probe, INMS or radar for Titan.");
  add('warn', !hp('c_huygens') || hp('c_probe_support'), 'Probe support equipment installed.', 'Huygens probe has no support equipment to relay its data.');
  add('warn', !hp('c_hs') || hp('c_hx'), 'High-gain antenna bandwidth is adequate.', 'S-band dish gives low bandwidth for this much science.');
  return k;
}

function checksDawn(c) {
  const has = t => c.of(t).length > 0, hp = id => Object.values(placed).includes(id), k = [];
  const add = (level, ok, pass, fail) => k.push({ level, ok, msg: ok ? pass : fail });
  add('crit', has('bus'), 'Spacecraft bus installed.', 'Missing spacecraft bus (structure).');
  add('crit', has('solar'), 'Solar wings installed.', 'No solar wings: nothing generates power.');
  add('crit', hp('d_ion'), 'Ion propulsion installed.', 'No ion propulsion system: cannot reach Vesta or Ceres.');
  add('crit', hp('d_xenon'), 'Xenon tank and feed system installed.', 'No xenon tank: the ion engines have no propellant.');
  add('crit', has('thruster'), 'Reaction control thrusters installed.', 'No reaction control thrusters for attitude control.');
  add('crit', has('tracker'), 'Star tracker installed.', 'No star tracker: no attitude knowledge.');
  add('crit', c.sci.length > 0, c.sci.length + ' science instrument(s) carried.', 'No science instruments selected.');
  add('crit', has('hga'), 'High-gain antenna installed.', 'No high-gain antenna: cannot send data home.');
  add('crit', has('store'), 'Data recorder installed.', 'No data recorder installed.');
  add('crit', hp('d_cdh'), 'Command & data handling unit installed.', 'No command & data handling unit.');
  add('crit', has('thermal'), 'Thermal control installed.', 'No thermal control installed.');
  add('crit', c.mass <= REF.mass, 'Launch mass within ' + REF.mass + ' kg.', 'Excessive mass: ' + c.mass.toFixed(0) + ' kg exceeds ' + REF.mass + ' kg.');
  add('crit', c.cost <= REF.bud, 'Within funding.', 'Over budget by $' + (c.cost - REF.bud).toFixed(1) + 'M.');
  add('crit', c.gen >= c.demand && c.gen > 0, 'Solar power at about 3 AU covers demand.', 'Insufficient power: ' + c.gen + ' W at about 3 AU, ' + c.demand + ' W needed.');
  add('crit', c.structOK === c.others.length, 'All parts structurally attached.', (c.others.length - c.structOK) + ' part(s) lack a structural connection.');
  add('crit', c.powered === c.consumers.length, 'All consumers powered.', (c.consumers.length - c.powered) + ' part(s) are unpowered.');
  add('crit', c.routed === c.sci.length, 'All instruments have data routes.', (c.sci.length - c.routed) + ' instrument(s) have no data route to the recorder.');
  add('crit', c.of('store').every(st => linksOf('data', st.sid).some(i => part(i).type === 'hga')), 'Recorder is linked to the antenna.', 'The recorder is not linked to the high-gain antenna.');
  add('warn', c.prop >= REF.prop, 'Xenon meets the ' + REF.prop + ' kg reference.', 'Xenon load is ' + c.prop + ' kg, below the ' + REF.prop + ' kg reference needed to reach both targets.');
  add('warn', c.cap >= c.sci.length, 'Data storage is sufficient.', 'Recorders handle ' + c.cap + ' instrument(s), ' + c.sci.length + ' installed.');
  add('warn', hp('d_fc'), 'Payload can image Vesta and Ceres.', 'Objective gap: no framing camera to image Vesta and Ceres.');
  add('warn', hp('d_vir'), 'Payload can map surface minerals.', 'Objective gap: no VIR spectrometer to map surface composition.');
  add('warn', hp('d_grand'), 'Payload can measure elemental composition.', 'Objective gap: no GRaND detector for elemental composition.');
  add('warn', hp('a_rw'), 'Reaction wheels installed.', 'No reaction wheels: orbit and pointing control will burn hydrazine.');
  return k;
}
function checksJuno(c) {
  const has = t => c.of(t).length > 0, hp = id => Object.values(placed).includes(id), k = [];
  const add = (level, ok, pass, fail) => k.push({ level, ok, msg: ok ? pass : fail });
  add('crit', has('bus'), 'Spacecraft bus installed.', 'Missing spacecraft bus (structure).');
  add('crit', hp('j_radiation_vault'), 'Radiation vault installed.', 'No radiation vault: Jupiter\u2019s radiation will destroy the electronics.');
  add('crit', has('solar'), 'Solar wings installed.', 'No solar wings: nothing generates power at Jupiter.');
  add('crit', has('battery'), 'Battery installed.', 'No battery installed.');
  add('crit', has('engine'), 'Main engine installed.', 'No engine: cannot enter orbit around Jupiter.');
  add('crit', has('tank'), 'Propellant tank installed.', 'No propellant tank installed.');
  add('crit', has('thruster'), 'Thrusters installed.', 'No thrusters for attitude control.');
  add('crit', hp('j_sru'), 'Stellar reference unit installed.', 'No stellar reference unit: no attitude knowledge.');
  add('crit', c.sci.length > 0, c.sci.length + ' science instrument(s) carried.', 'No science instruments selected.');
  add('crit', has('hga'), 'High-gain antenna installed.', 'No high-gain antenna: cannot send data home.');
  add('crit', has('store'), 'Data recorder installed.', 'No data recorder installed.');
  add('crit', hp('d_cdh'), 'Command & data handling unit installed.', 'No command & data handling unit.');
  add('crit', has('thermal'), 'Thermal control installed.', 'No thermal control installed.');
  add('crit', c.mass <= REF.mass, 'Launch mass within ' + REF.mass + ' kg.', 'Excessive mass: ' + c.mass.toFixed(0) + ' kg exceeds ' + REF.mass + ' kg.');
  add('crit', c.cost <= REF.bud, 'Within funding.', 'Over budget by $' + (c.cost - REF.bud).toFixed(1) + 'M.');
  add('crit', c.gen >= c.demand && c.gen > 0, 'Solar power at Jupiter covers demand.', 'Insufficient power: ' + c.gen + ' W at Jupiter, ' + c.demand + ' W needed.');
  add('crit', c.structOK === c.others.length, 'All parts structurally attached.', (c.others.length - c.structOK) + ' part(s) lack a structural connection.');
  add('crit', c.powered === c.consumers.length, 'All consumers powered.', (c.consumers.length - c.powered) + ' part(s) are unpowered.');
  add('crit', c.routed === c.sci.length, 'All instruments have data routes.', (c.sci.length - c.routed) + ' instrument(s) have no data route to the recorder.');
  add('crit', c.of('store').every(st => linksOf('data', st.sid).some(i => part(i).type === 'hga')), 'Recorder is linked to the antenna.', 'The recorder is not linked to the high-gain antenna.');
  add('warn', c.prop >= REF.prop, 'Propellant meets the ' + REF.prop + ' kg reference.', 'Propellant ' + c.prop + ' kg is below the ' + REF.prop + ' kg reference, so orbit insertion at Jupiter is at risk.');
  add('warn', c.cap >= c.sci.length, 'Data storage is sufficient.', 'Recorders handle ' + c.cap + ' instrument(s), ' + c.sci.length + ' installed.');
  add('warn', ['j_mwr', 'j_jiram', 'j_uvs'].some(hp), 'Payload can study Jupiter\u2019s atmosphere.', 'Objective gap: no MWR, JIRAM or UVS to study the atmosphere.');
  add('warn', ['j_mag', 'c_ka', 'c_hx'].some(hp) && hp('j_mag'), 'Payload can measure the magnetic field.', 'Objective gap: no magnetometer to measure Jupiter\u2019s magnetism.');
  add('warn', ['c_ka', 'c_hx'].some(hp), 'Radio link supports gravity measurements.', 'Gravity science needs the X/Ka or X-band antenna.');
  add('warn', ['j_mwr', 'j_mag'].some(hp), 'Payload can investigate the interior.', 'Objective gap: no MWR or magnetometer to probe the interior.');
  return k;
}
function checksMsl(c) {
  const has = t => c.of(t).length > 0, hp = id => Object.values(placed).includes(id), k = [];
  const add = (level, ok, pass, fail) => k.push({ level, ok, msg: ok ? pass : fail });
  add('crit', has('bus'), 'Rover chassis installed.', 'Missing rover chassis (structure).');
  add('crit', has('solar'), 'MMRTG power source installed.', 'No MMRTG: nothing generates power on the surface.');
  add('crit', has('battery'), 'Battery installed.', 'No battery installed.');
  add('crit', has('mob'), 'Mobility system installed.', 'No mobility system: the rover cannot drive.');
  add('crit', has('skycrane'), 'Sky crane descent stage installed.', 'No sky crane: the rover cannot land softly.');
  add('crit', hp('msl_edl_heatshield') && hp('msl_edl_backshell'), 'Entry heat shield and backshell installed.', 'Missing heat shield or backshell: cannot survive atmospheric entry.');
  add('crit', has('hga') || has('uhf'), 'Radio link installed.', 'No antenna or UHF relay: cannot send data home.');
  add('crit', c.sci.length > 0, c.sci.length + ' science instrument(s) carried.', 'No science instruments selected.');
  add('crit', has('store'), 'Data recorder installed.', 'No data recorder installed.');
  add('crit', hp('d_cdh'), 'Command & data handling unit installed.', 'No command & data handling unit.');
  add('crit', has('thermal'), 'Thermal control installed.', 'No thermal control: electronics will freeze.');
  add('crit', c.mass <= REF.mass, 'Launch mass within ' + REF.mass + ' kg.', 'Excessive mass: ' + c.mass.toFixed(0) + ' kg exceeds ' + REF.mass + ' kg.');
  add('crit', c.cost <= REF.bud, 'Within funding.', 'Over budget by $' + (c.cost - REF.bud).toFixed(1) + 'M.');
  add('crit', c.gen >= c.demand && c.gen > 0, 'Power generation covers average demand.', 'Insufficient power: ' + c.gen + ' W generated, about ' + c.demand + ' W average demand (20% duty, est.).');
  add('crit', c.structOK === c.others.length, 'All parts structurally attached.', (c.others.length - c.structOK) + ' part(s) lack a structural connection.');
  add('crit', c.powered === c.consumers.length, 'All consumers powered.', (c.consumers.length - c.powered) + ' part(s) are unpowered.');
  add('crit', c.routed === c.sci.length, 'All instruments have data routes.', (c.sci.length - c.routed) + ' instrument(s) have no data route to the recorder.');
  add('crit', c.of('store').every(st => linksOf('data', st.sid).some(i => ['hga', 'uhf'].includes(part(i).type))), 'Recorder is linked to a radio.', 'Recorder is not linked to any antenna/relay.');
  add('warn', has('uhf'), 'UHF relay installed.', 'No UHF relay: data must go direct to Earth.');
  add('warn', has('hga'), 'High-gain antenna installed.', 'No high-gain antenna: direct-to-Earth link is limited.');
  add('warn', c.prop >= REF.prop, 'Landing propellant meets the ' + REF.prop + ' kg reference.', 'Landing propellant ' + c.prop + ' kg is below the ' + REF.prop + ' kg reference.');
  add('warn', c.cap >= c.sci.length, 'Data storage is sufficient.', 'Recorders handle ' + c.cap + ' instrument(s), ' + c.sci.length + ' installed.');
  add('warn', ['s_cc', 's_sa', 's_ch', 'msl_apxs'].some(hp), 'Payload can analyze rocks and soil.', 'Objective gap: no ChemCam, SAM, CheMin or APXS to analyze rocks and soil.');
  add('warn', ['s_sa', 's_ch'].some(hp), 'Payload can search for signs of ancient life.', 'Objective gap: no SAM or CheMin to search for signs of ancient life.');
  add('warn', ['msl_rems', 'msl_rad', 'msl_dan', 's_sa'].some(hp), 'Payload can study climate and habitability.', 'Objective gap: no REMS, RAD, DAN or SAM for climate and habitability.');
  add('warn', !(hp('s_sa') || hp('s_ch')) || (hp('msl_arm') && (hp('msl_drill') || hp('msl_scoop'))), 'Sample acquisition hardware installed.', 'SAM/CheMin need the robotic arm plus a drill or scoop to receive samples.');
  add('warn', !(hp('msl_apxs') || hp('msl_mahli')) || hp('msl_arm'), 'Arm instruments have their arm.', 'APXS/MAHLI need the robotic arm.');
  add('warn', hp('a_gy'), 'Inertial unit installed.', 'No gyro/IMU: poorer landing guidance.');
  return k;
}

// ---------- engineering score ----------
// Provisional while building, final after validation. All weights, thresholds, caps and per-stage requirements live in SCORE.
const SCORE = {
  cats: [['ready', 'Mission readiness', 25], ['struct', 'Structural integrity', 15], ['power', 'Power management', 15], ['prop', 'Propulsion readiness', 15], ['comms', 'Communications & data', 10], ['sci', 'Science payload', 10], ['mass', 'Mass efficiency', 10]],
  grades: [[90, 'A', 'Excellent engineering configuration'], [80, 'B', 'Strong configuration; minor improvements possible'], [70, 'C', 'Functional but has notable weaknesses'], [60, 'D', 'Major engineering issues'], [0, 'F', 'Not ready for launch']],
  caps: { capability: 69, power: 59, bus: 39, mass: 49, propulsion: 59 },
  struct: { bus: 5, part: 2 },
  power: { goodMargin: 0.1, tiers: [15, 12, 8, 4, 0], batt: 3, critTypes: ['bus', 'hga', 'uhf', 'store', 'thermal', 'tracker', 'mob', 'skycrane'], critIds: ['d_cdh'] },
  prop: { full: 1, ok: 0.8, partial: 0.4, pts: [15, 10, 5, 0] },
  comms: { pts: [10, 7, 4, 0] },
  mass: { good: 0.9, tiers: [10, 8, 4, 0], over: 1.05 },
  // per stage: caps = [id, label, weight (sum 25), critical?, what it needs, test(k)]; sci = [label, weight (sum 10), qualifying part ids]
  stages: {
    mro: { battery: true, propNeed: ['engine', 'tank', 'thruster'], radios: [['hga']], extra: [['uhf']], propLabel: 'Mars orbit insertion',
      caps: [['reach', 'Reach Mars', 6, true, 'a working bus, power source, thermal control, engine, tank and thrusters', k => k.op('bus') && k.op('solar') && k.op('thermal') && k.op('engine') && k.op('tank') && k.op('thruster')],
        ['orbit', 'Enter Mars orbit', 6, true, 'a working engine and the full propellant load', k => k.op('engine') && k.c.prop >= REF.prop],
        ['nav', 'Navigate', 3, false, 'an operational star tracker', k => k.op('tracker')],
        ['data', 'Return science data', 6, true, 'a working instrument, recorder and radio linked together', k => k.dataPath()],
        ['relay', 'Relay support', 4, false, 'an operational UHF relay', k => k.op('uhf')]],
      sci: [['High-resolution imaging', 4, ['hirise', 'ctx']], ['Water and ice investigation', 4, ['crism', 'sharad']], ['Atmosphere and climate', 2, ['mcs', 'marci']]] },
    cassini: { battery: false, propNeed: ['engine', 'tank', 'thruster'], radios: [['hga']], extra: [], propLabel: 'Saturn orbit insertion',
      caps: [['reach', 'Reach Saturn', 6, true, 'a working bus, RTG, thermal control, engine, tank and thrusters', k => k.op('bus') && k.op('solar') && k.op('thermal') && k.op('engine') && k.op('tank') && k.op('thruster')],
        ['orbit', 'Enter Saturn orbit', 6, true, 'a working engine and the full propellant load', k => k.op('engine') && k.c.prop >= REF.prop],
        ['nav', 'Navigate', 3, false, 'an operational star tracker', k => k.op('tracker')],
        ['data', 'Return science data', 6, true, 'a working instrument, recorder and antenna linked together', k => k.dataPath()],
        ['probe', 'Deliver Huygens to Titan', 4, false, 'the Huygens probe plus its support equipment, both working', k => k.opId('c_huygens') && k.opId('c_probe_support')]],
      sci: [['Study Saturn\u2019s rings', 4, ['c_iss', 'c_vims', 'c_uvis', 'c_cirs']], ['Investigate Titan', 3, ['c_inms', 'c_radar', 'c_gc_ms', 'c_hasi', 'c_acp']], ['Fields and particles', 3, ['c_mag', 'c_caps', 'c_mimi', 'c_rpws']]] },
    dawn: { battery: false, propNeed: ['engine', 'tank', 'thruster'], radios: [['hga']], extra: [], propLabel: 'ion cruise and orbit capture',
      caps: [['reach', 'Reach the asteroid belt', 6, true, 'a working bus, solar wings, thermal control, ion engines, xenon tank and thrusters', k => k.op('bus') && k.op('solar') && k.op('thermal') && k.op('engine') && k.op('tank') && k.op('thruster')],
        ['ion', 'Ion cruise and orbit capture', 6, true, 'working ion engines, xenon tank, power processing unit and solar wings, with the full xenon load', k => k.opId('d_ion') && k.opId('d_xenon') && k.opId('d_ion_pdu') && k.opId('d_solar') && k.c.prop >= REF.prop],
        ['nav', 'Navigate', 3, false, 'an operational star tracker', k => k.op('tracker')],
        ['data', 'Return science data', 6, true, 'a working instrument, recorder and antenna linked together', k => k.dataPath()],
        ['att', 'Attitude control', 4, false, 'working reaction wheels and thrusters', k => k.opId('a_rw') && k.op('thruster')]],
      sci: [['Imaging of Vesta and Ceres', 4, ['d_fc']], ['Surface composition mapping', 3, ['d_vir']], ['Elemental composition', 3, ['d_grand']]] },
    juno: { battery: true, propNeed: ['engine', 'tank', 'thruster'], radios: [['hga']], extra: [], propLabel: 'Jupiter orbit insertion',
      caps: [['reach', 'Reach Jupiter', 6, true, 'a working bus, solar wings, thermal control, engine, tank and thrusters', k => k.op('bus') && k.op('solar') && k.op('thermal') && k.op('engine') && k.op('tank') && k.op('thruster')],
        ['orbit', 'Enter Jupiter orbit', 6, true, 'a working engine and the full propellant load', k => k.op('engine') && k.c.prop >= REF.prop],
        ['rad', 'Survive the radiation', 4, true, 'a working radiation vault', k => k.opId('j_radiation_vault')],
        ['data', 'Return science data', 6, true, 'a working instrument, recorder and antenna linked together', k => k.dataPath()],
        ['nav', 'Navigate', 3, false, 'an operational stellar reference unit', k => k.opId('j_sru')]],
      sci: [['Study Jupiter\u2019s atmosphere', 4, ['j_mwr', 'j_jiram', 'j_uvs']], ['Magnetism and magnetosphere', 3, ['j_mag', 'j_jade', 'j_jedi', 'j_waves']], ['Interior structure', 3, ['j_mwr', 'j_mag']]] },
    msl: { battery: true, propNeed: ['skycrane'], radios: [['hga', 'uhf']], extra: ['two'], propLabel: 'powered descent',
      caps: [['edl', 'Entry, descent and landing', 8, true, 'a working heat shield, backshell and sky crane', k => k.opId('msl_edl_heatshield') && k.opId('msl_edl_backshell') && k.op('skycrane')],
        ['mob', 'Surface mobility', 6, true, 'a working chassis, MMRTG and mobility system', k => k.op('bus') && k.op('solar') && k.op('mob')],
        ['pt', 'Power and thermal survival', 3, false, 'a working MMRTG, battery and thermal control', k => k.op('solar') && k.op('battery') && k.op('thermal')],
        ['data', 'Return science data', 5, true, 'a working instrument, recorder and radio linked together', k => k.dataPath()],
        ['nav', 'Navigate', 3, false, 'an operational gyro / IMU', k => k.opId('a_gy')]],
      sci: [['Rock and soil analysis', 4, ['s_cc', 'msl_apxs', 's_ch']], ['Organics and ancient life', 3, ['s_sa', 's_ch']], ['Climate and habitability', 3, ['msl_rems', 'msl_rad', 'msl_dan']]] }
  }
};
function computeScore(c) {
  const S = SCORE, st = S.stages[STAGE], ids = Object.keys(placed), isSrc = i => part(i) && ['solar', 'battery'].includes(part(i).type);
  const hostOK = sid => { const p = part(sid); return p.type === 'bus' || linksOf('structure', sid).some(i => part(i) && (HUX.has(p.id) ? part(i).id === 'c_huygens' : part(i).type === 'bus')); };
  const powerOK = sid => part(sid).pw >= 0 || linksOf('power', sid).some(isSrc);
  const dataOK = sid => part(sid).type !== 'sci' || linksOf('data', sid).some(i => part(i) && part(i).type === 'store');
  const opS = sid => !missingFor(placed[sid]).length && hostOK(sid) && powerOK(sid) && dataOK(sid);
  const opT = t => ids.some(i => part(i).type === t && opS(i)), opId = id => ids.some(i => placed[i] === id && opS(i)), has = t => ids.some(i => part(i).type === t);
  const radioOps = ids.filter(i => ['hga', 'uhf'].includes(part(i).type) && opS(i)), recOps = ids.filter(i => part(i).type === 'store' && opS(i));
  const recLinked = recOps.some(r => linksOf('data', r).some(i => radioOps.includes(i)));
  const sciOp = ids.some(i => part(i).type === 'sci' && opS(i));
  const k = { c, op: opT, opId, dataPath: () => sciOp && radioOps.length > 0 && recOps.length > 0 && recLinked };
  const cats = S.cats.map(([id, name, max]) => ({ id, name, max, pts: max, lines: [] })), by = Object.fromEntries(cats.map(x => [x.id, x]));
  const lose = (id, d, t, fix) => { const q = by[id]; d = Math.min(d, q.pts); q.pts -= d; q.lines.push({ d: -d, t, fix }); };
  const flag = {};
  // A. mission readiness
  st.caps.forEach(([cid, label, w, crit, need, test]) => { const ok = test(k); if (!ok) { lose('ready', w, label + ' is not operational (needs ' + need + ').', 'Get ' + need + ' working for "' + label + '".'); if (crit) flag.capability = true; } });
  // B. structural integrity
  if (!has('bus')) lose('struct', S.struct.bus, 'No primary bus or chassis installed.', 'Install the ' + reqName('BUS') + '.');
  const bad = ids.filter(i => part(i).type !== 'bus' && (!hostOK(i) || missingFor(placed[i]).length));
  bad.forEach(i => lose('struct', S.struct.part, part(i).name + (missingFor(placed[i]).length ? ' is missing prerequisites (' + missingFor(placed[i]).map(reqName).join(' + ') + ').' : ' is not structurally attached.'), missingFor(placed[i]).length ? 'Install ' + missingFor(placed[i]).map(reqName).join(' + ') + ' for ' + part(i).name + '.' : 'Use Structure mode to attach ' + part(i).name + (HUX.has(placed[i]) ? ' to the Huygens probe.' : ' to the bus.')));
  // C. power management
  const gen = c.gen, dem = c.demand, hasSrc = ids.some(i => part(i).type === 'solar' && opS(i) && part(i).pw > 0) || gen > 0;
  const unp = ids.filter(i => part(i).pw < 0 && !powerOK(i)), critUnp = unp.filter(i => S.power.critTypes.includes(part(i).type) || S.power.critIds.includes(placed[i]));
  const T = S.power.tiers; let pp = T[0], why = '';
  if (!hasSrc || gen <= 0) { pp = T[4]; why = 'No working power source.'; flag.power = true; }
  else if (critUnp.length) { pp = T[4]; why = 'Critical systems have no power connection: ' + critUnp.slice(0, 3).map(i => part(i).name).join(', ') + '.'; }
  else if (gen < dem) { const df = (dem - gen) / Math.max(dem, 1); pp = df <= 0.1 ? T[2] : df <= 0.25 ? T[3] : T[4]; why = 'Power deficit of ' + Math.round(df * 100) + '% (' + gen + ' W generated, ' + dem + ' W demand).'; }
  else { const mg = (gen - dem) / Math.max(dem, 1); if (mg < S.power.goodMargin) { pp = T[1]; why = 'Power reserve is ' + Math.round(mg * 100) + '%, below 10%.'; } }
  if (pp === T[0] && unp.length) { pp = T[1]; why = unp.length + ' part(s) have no power connection (' + unp.slice(0, 3).map(i => part(i).name).join(', ') + ').'; }
  if (pp < T[0]) lose('power', T[0] - pp, why, !hasSrc ? 'Install a power source (' + (STAGE === 'cassini' ? 'RTGs' : STAGE === 'msl' ? 'the MMRTG' : 'solar wings') + ').' : unp.length ? 'Use Power mode to connect the unpowered parts to the power source.' : 'Add generation or remove power-hungry parts.');
  if (st.battery && !has('battery')) lose('power', S.power.batt, 'No battery installed (required for this stage).', 'Install a battery.');
  // D. propulsion readiness
  const needTypes = st.propNeed, present = needTypes.filter(t => has(t)), badP = ids.filter(i => needTypes.includes(part(i).type) && !(opS(i)));
  const ratio = c.prop / Math.max(REF.prop, 1), PR = S.prop; let pr = 0, pwhy = '', pfix = '';
  if (!present.length) { pr = PR.pts[3]; pwhy = 'No ' + st.propLabel + ' hardware installed.'; pfix = 'Install ' + needTypes.join(', ') + '.'; flag.propulsion = true; }
  else if (present.length < needTypes.length) { pr = PR.pts[2]; pwhy = 'Propulsion is incomplete: missing ' + needTypes.filter(t => !has(t)).join(', ') + '.'; pfix = 'Install the missing ' + needTypes.filter(t => !has(t)).join(', ') + '.'; }
  else if (badP.length === 0 && ratio >= PR.full) pr = PR.pts[0];
  else if (badP.length <= 1 && ratio >= PR.ok) { pr = PR.pts[1]; pwhy = badP.length ? badP.map(i => part(i).name).join(', ') + ' is not fully connected or powered.' : 'Propellant is ' + c.prop + ' kg, below the ' + REF.prop + ' kg target.'; pfix = badP.length ? 'Connect ' + part(badP[0]).name + '.' : 'Carry more propellant (bigger or extra tanks).'; }
  else if (ratio >= PR.partial || badP.length >= 2) { pr = PR.pts[2]; pwhy = (badP.length ? badP.length + ' propulsion part(s) are not connected or powered. ' : '') + (ratio < PR.ok ? 'Propellant is only ' + Math.round(ratio * 100) + '% of the ' + REF.prop + ' kg target.' : ''); pfix = 'Connect the propulsion parts and carry the full propellant load.'; }
  else { pr = PR.pts[3]; pwhy = 'Propellant is far too low (' + c.prop + ' of ' + REF.prop + ' kg).'; pfix = 'Add propellant tanks.'; flag.propulsion = true; }
  if (pr < 15) lose('prop', 15 - pr, pwhy, pfix);
  // E. communications & data
  const coreOK = st.radios.every(g => radioOps.some(i => g.includes(part(i).type))), anyRadio = ids.some(i => ['hga', 'uhf'].includes(part(i).type));
  const extraMiss = st.extra.filter(g => g === 'two' ? radioOps.length < 2 : !radioOps.some(i => g.includes(part(i).type)));
  const unrouted = ids.filter(i => part(i).type === 'sci' && !dataOK(i)), cdhOK = opId('d_cdh'), recOK = recOps.length > 0 && cdhOK, CP = S.comms.pts;
  if (!recOK) lose('comms', CP[0], 'No working data handling (' + (recOps.length ? '' : 'recorder') + (!recOps.length && !cdhOK ? ' and ' : '') + (cdhOK ? '' : 'C&DH unit') + ' missing or not operational).', 'Install and power the recorder and the C&DH unit.');
  else if (!coreOK) lose('comms', CP[0] - (anyRadio ? CP[2] : 0), anyRadio ? 'The required radio is installed but not working (unpowered or missing prerequisites).' : 'No radio or antenna installed.', 'Install and power the ' + st.radios.map(g => g.join('/').toUpperCase()).join(' + ') + '.');
  else if (!recLinked) lose('comms', CP[0] - CP[2], 'The recorder has no data link to a working radio.', 'Use Data mode to link the recorder to the antenna.');
  else { const n = unrouted.length + extraMiss.length; if (n === 1) lose('comms', CP[0] - CP[1], unrouted.length ? unrouted[0] && part(unrouted[0]).name + ' has no valid data path.' : 'Backup/secondary radio is missing.', unrouted.length ? 'Use Data mode to link ' + part(unrouted[0]).name + ' to the recorder.' : 'Add the secondary radio.'); else if (n > 1) lose('comms', CP[0] - CP[2], unrouted.length + ' instrument(s) have no data path' + (extraMiss.length ? ' and the secondary radio is missing' : '') + '.', 'Link every instrument to the recorder (Data mode).'); }
  // F. science payload
  st.sci.forEach(([label, w, list]) => { if (!list.some(opId)) lose('sci', w, label + ': no fully working instrument' + (list.some(id => ids.some(i => placed[i] === id)) ? ' (installed but unpowered, unsupported or without a data path)' : ' (install one of ' + list.map(id => P[id].name.split(' ')[0]).join(', ') + ')') + '.', label + ': ' + (list.some(id => ids.some(i => placed[i] === id)) ? 'finish connecting the instrument.' : 'install and connect one of ' + list.map(id => P[id].name.split(' ')[0]).join(', ') + '.')); });
  // G. mass efficiency
  const mr = c.mass / REF.mass, M = S.mass, essentials = has('bus') && gen > 0 && present.length === needTypes.length && radioOps.length > 0;
  let mp = mr <= M.good ? M.tiers[0] : mr <= 1 ? M.tiers[1] : mr <= M.over ? M.tiers[2] : M.tiers[3];
  if (mr <= M.good && !essentials) { mp = M.tiers[3]; lose('mass', 10, 'Essential hardware (bus, power, propulsion, radio) is missing, so low mass earns no credit.', 'Install the missing essentials before judging mass.'); }
  else if (mp < M.tiers[0]) lose('mass', M.tiers[0] - mp, 'Launch mass is ' + Math.round(mr * 100) + '% of the ' + REF.mass + ' kg limit' + (mr > 1 ? ' (over the limit: launch validation fails).' : ' (above 90%).'), mr > 1 ? 'Remove or swap heavy parts to get under ' + REF.mass + ' kg.' : 'Trim mass below 90% of the limit.');
  if (mr > M.over) flag.mass = true;
  const total = cats.reduce((a, x) => a + x.pts, 0), capList = [];
  if (flag.capability) capList.push(['Missing a mission-critical capability', S.caps.capability]);
  if (flag.power) capList.push(['No working power source', S.caps.power]);
  if (!has('bus')) capList.push(['No primary bus or chassis', S.caps.bus]);
  if (flag.mass) capList.push(['Mass above 105% of the stage limit', S.caps.mass]);
  if (flag.propulsion) capList.push(['Required propulsion is unusable', S.caps.propulsion]);
  const cap = capList.length ? capList.reduce((a, b) => (b[1] < a[1] ? b : a)) : null, final = cap ? Math.min(total, cap[1]) : total;
  const g = S.grades.find(x => final >= x[0]);
  const imps = [].concat(...cats.map(x => x.lines.filter(l => l.d < 0 && l.fix))).sort((a, b) => a.d - b.d), seen = new Set(), improvements = imps.filter(l => !seen.has(l.fix) && seen.add(l.fix)).slice(0, 3).map(l => l.fix);
  if (cap && !improvements.length) improvements.push('Resolve: ' + cap[0] + '.');
  return { total, score: final, grade: g[1], meaning: g[2], cap, cats, improvements };
}
const scoreSig = () => JSON.stringify([placed, links]);
let finalInfo = null, scoreOpen = false; try { finalInfo = JSON.parse(localStorage.getItem('oe_' + STAGE + '_final') || 'null'); } catch (e) {}
const isFinal = () => !!finalInfo && finalInfo.sig === scoreSig();
const scoreLines = x => (x.lines.length ? x.lines.map(l => `<li><b>${l.d}</b>: ${l.t}</li>`).join('') : '<li class="okl">No deductions.</li>');
function scoreCompact(sc) {
  return `<details class="score" ${scoreOpen ? 'open' : ''}><summary><span>ENGINEERING SCORE</span><b class="gr g${sc.grade}">${sc.score}/100 · ${sc.grade}</b><em>${isFinal() ? 'final' : 'provisional'}</em></summary>` +
    sc.cats.map(x => `<div class="sc-row"><span>${x.name}</span><b>${x.pts}/${x.max}</b></div><ul>${scoreLines(x)}</ul>`).join('') +
    (sc.cap ? `<p class="msg crit">Score capped at ${sc.cap[1]}: ${sc.cap[0]}.</p>` : '') + '<p class="note">Validation status is separate: a high score never means mission-ready.</p></details>';
}
function scoreReport(sc, crit) {
  return `<div class="scorebox"><div class="scorehead"><b>ENGINEERING SCORE: ${sc.score}/100 — ${sc.grade}</b><em>FINAL</em></div><p>${sc.meaning}. Mandatory validation: <b class="${crit ? 'bad' : 'good'}">${crit ? 'FAILED' : 'PASSED'}</b> (separate from the score).</p>` +
    (sc.cap ? `<p class="msg crit">Score capped at ${sc.cap[1]}: ${sc.cap[0]}.</p>` : '') +
    sc.cats.map(x => `<div class="sc-row"><span>${x.name}</span><b>${x.pts}/${x.max}</b></div><ul>${scoreLines(x)}</ul>`).join('') +
    (sc.improvements.length ? '<p class="imp"><b>Top improvements</b></p><ol>' + sc.improvements.map(t => '<li>' + t + '</li>').join('') + '</ol>' : '<p class="imp"><b>No improvements needed.</b></p>') + '</div>';
}

// ---------- rendering ----------
const STEPS_MRO = [['Assemble the structure: install a bus', c => c.of('bus').length], ['Install the power system: arrays and battery', c => c.of('solar').length && c.of('battery').length],
  ['Install propulsion: engine, thrusters, tank', c => c.of('engine').length && c.of('thruster').length && c.of('tank').length], ['Install navigation equipment', c => c.of('tracker').length],
  ['Select science instruments', c => c.sci.length], ['Install communications: antenna', c => c.of('hga').length], ['Install data storage and thermal control', c => c.of('store').length && c.of('thermal').length],
  ['Connect structure, power and data ports (use the mode buttons)', c => c.structOK === c.others.length && c.powered === c.consumers.length && c.routed === c.sci.length],
  ['Review the engineering status', () => false]];
const STEPS_CAS = [['Assemble the structure: install the bus', c => c.of('bus').length], ['Install the RTG power system (up to 3 RTGs)', c => c.of('solar').length],
  ['Install propulsion: engine, thrusters and tanks', c => c.of('engine').length && c.of('thruster').length && c.of('tank').length], ['Install navigation: star tracker', c => c.of('tracker').length],
  ['Select science instruments (and the Huygens probe)', c => c.sci.length], ['Install communications: high-gain antenna', c => c.of('hga').length],
  ['Install data and thermal: recorder, C&DH and thermal control', c => c.of('store').length && c.of('thermal').length && Object.values(placed).includes('d_cdh')],
  ['Connect structure, power and data ports (use the mode buttons)', c => c.structOK === c.others.length && c.powered === c.consumers.length && c.routed === c.sci.length],
  ['Review the engineering status', () => false]];
const STEPS_MSL = [['Assemble the structure: install the rover chassis', c => c.of('bus').length], ['Install the power system: MMRTG and battery', c => c.of('solar').length && c.of('battery').length],
  ['Install mobility and the landing system: wheels, sky crane, heat shield, backshell', c => c.of('mob').length && c.of('skycrane').length && Object.values(placed).includes('msl_edl_heatshield') && Object.values(placed).includes('msl_edl_backshell')],
  ['Install navigation: gyro / IMU', c => Object.values(placed).includes('a_gy')], ['Select science instruments and the robotic arm', c => c.sci.length], ['Install communications: antenna and UHF relay', c => c.of('hga').length || c.of('uhf').length],
  ['Install data and thermal: recorder, C&DH and thermal control', c => c.of('store').length && c.of('thermal').length && Object.values(placed).includes('d_cdh')],
  ['Connect structure, power and data ports (use the mode buttons)', c => c.structOK === c.others.length && c.powered === c.consumers.length && c.routed === c.sci.length],
  ['Review the engineering status', () => false]];
const STEPS_JUNO = [['Assemble the structure: install the bus and radiation vault', c => c.of('bus').length && Object.values(placed).includes('j_radiation_vault')], ['Install the power system: three solar wings and a battery', c => c.of('solar').length && c.of('battery').length],
  ['Install propulsion: engine, thrusters and tanks', c => c.of('engine').length && c.of('thruster').length && c.of('tank').length], ['Install navigation: stellar reference unit', c => Object.values(placed).includes('j_sru')],
  ['Select science instruments', c => c.sci.length], ['Install communications: high-gain antenna', c => c.of('hga').length],
  ['Install data and thermal: recorder, C&DH and thermal control', c => c.of('store').length && c.of('thermal').length && Object.values(placed).includes('d_cdh')],
  ['Connect structure, power and data ports (use the mode buttons)', c => c.structOK === c.others.length && c.powered === c.consumers.length && c.routed === c.sci.length],
  ['Review the engineering status', () => false]];
const STEPS_DAWN = [['Assemble the structure: install the bus', c => c.of('bus').length], ['Install the power system: solar wings (battery optional)', c => c.of('solar').length],
  ['Install ion propulsion: xenon tank, power processing unit, ion engines', c => ['d_xenon', 'd_ion_pdu', 'd_ion'].every(id => Object.values(placed).includes(id))], ['Install attitude control: gyro, star tracker, thrusters and hydrazine tank', c => c.of('tracker').length && c.of('thruster').length],
  ['Select science instruments', c => c.sci.length], ['Install communications: high-gain antenna', c => c.of('hga').length],
  ['Install data and thermal: recorder, C&DH and thermal control', c => c.of('store').length && c.of('thermal').length && Object.values(placed).includes('d_cdh')],
  ['Connect structure, power and data ports (use the mode buttons)', c => c.structOK === c.others.length && c.powered === c.consumers.length && c.routed === c.sci.length],
  ['Review the engineering status', () => false]];
const STEPS = DAWN ? STEPS_DAWN : JUNO ? STEPS_JUNO : MSL ? STEPS_MSL : CAS ? STEPS_CAS : STEPS_MRO;
function render() {
  const c = calc(); save(); $('#stencil').setAttribute('viewBox', '0 0 100 ' + STENCIL_H);
  $('#cats').innerHTML = CATS.map(([id, n, g]) => `<button class="cat ${cat === id ? 'on' : ''}" data-cat="${id}"><span class="g">${g}</span>${n}<small>${PARTS.filter(x => x.cat === id && placed && Object.values(placed).includes(x.id)).length || ''}</small></button>`).join('');
  $('#modes').innerHTML = [['build', 'Build'], ['structure', 'Structure'], ['power', 'Power'], ['data', 'Data']].map(([m, n]) => `<button data-m="${m}" class="${mode === m ? 'on' : ''}">${n}</button>`).join('') + (mode !== 'build' ? '<button data-auto>Auto-connect</button>' : '');
  const cur = selPart && P[selPart], curLocked = cur && missingFor(cur.id).length, ok = sl => mode === 'build' && cur && !curLocked && accepts(sl, cur), attn = new Set(needAttention());
  const lines = links.filter(l => mode === 'build' || l.t === mode).map(l => { const [x1, y1] = center(SL[l.a]), [x2, y2] = center(SL[l.b]); return `<g data-link="${links.indexOf(l)}"><line class="hit" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/><line class="link ${l.t}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" ${l.t === 'data' ? 'stroke-dasharray="1.5 .8"' : ''}/></g>`; }).join('');
  const slots = SLOTS.map(sl => { const q = part(sl.id), cx = sl.x + sl.w / 2, linkMode = mode !== 'build';
    const pills = linkMode ? portsFor(sl, mode) : [], has = k => portsOf(sl).some(x => x[0] === k);
    const hot = ok(sl) || (pending && linkMode && pending !== sl.id && compatible(mode, pending, sl.id));
    const dim = linkMode && !pills.length;
    const cls = ['slot', q ? 'on' : '', hot ? 'ok' : '', dim ? 'dim' : '', selSlot === sl.id ? 'cur' : '', pending === sl.id ? 'pend' : '', attn.has(sl.id) ? 'attn' : ''].join(' ');
    const ws = pills.map(t => t.length * 1.05 + 1.6), tot = ws.reduce((a, b) => a + b, 0) + .5 * Math.max(0, pills.length - 1); let px = cx - tot / 2;
    const pg = pills.map((t, i) => { const x = px; px += ws[i] + .5; return `<g class="pill ${t[0] === 'P' ? 'p' : t[0] === 'D' ? 'd' : 's'}"><rect x="${x}" y="${sl.y + sl.h - 3.5}" width="${ws[i]}" height="2.8" rx=".5"/><text x="${x + ws[i] / 2}" y="${sl.y + sl.h - 1.5}">${t}</text></g>`; }).join('');
    const flag = attn.has(sl.id) ? `<circle class="atn" cx="${sl.x + 1.6}" cy="${sl.y + 1.6}" r="1.3"/><text class="atx" x="${sl.x + 1.6}" y="${sl.y + 2.3}">!</text>` : '';
    const dots = !linkMode ? (has('P') ? `<circle class="dot p" cx="${sl.x + sl.w - 1.6}" cy="${sl.y + 1.6}" r=".9"/>` : '') + (has('D') ? `<circle class="dot d" cx="${sl.x + sl.w - (has('P') ? 3.6 : 1.6)}" cy="${sl.y + 1.6}" r=".9"/>` : '') : '';
    return `<g class="${cls}" data-slot="${sl.id}"><rect x="${sl.x}" y="${sl.y}" width="${sl.w}" height="${sl.h}" rx=".8"/><text x="${cx}" y="${pills.length ? sl.y + 3.8 : sl.y + sl.h / 2 + .8}" ${sl.label.length * 1.25 > sl.w - 1 ? `textLength="${sl.w - 1.4}" lengthAdjust="spacingAndGlyphs"` : ''}>${sl.label}</text>${pg}${dots}${flag}</g>`; }).join('');
  const heads = CATS.filter(([c1]) => EXTRA_HEAD[c1]).map(([c1, n]) => `<text class="gh" x="3" y="${EXTRA_HEAD[c1] + 3}">${n} - extra equipment</text>`).join('') + `<text class="gh sub" x="3" y="64">Scroll down for extra equipment slots</text>`;
  $('#stencil').innerHTML = `${heads}${lines}${slots}`;
  const step = STEPS.findIndex(x => !x[1](c)), allDone = step === -1 || step === STEPS.length - 1;
  $('#hint').innerHTML = (note ? `<b>${note}</b> ` : '') + (allDone ? 'Step 9-10: review the status panel, then press VALIDATE SPACECRAFT.' : `Step ${step + 1}/10: ${STEPS[step][0]}.`) + (mode !== 'build' ? ` Click an OUT port part, then an IN port part (${mode}). Click a line to remove it.` : (cur ? (curLocked ? '' : ' Click a highlighted slot to install.') : ' Pick a part below, then place it on its stencil slot.'));
  $('#inv').innerHTML = PARTS.filter(x => x.cat === cat && avail(x)).map(x => { const lk = missingFor(x.id).length; return `<button class="card ${selPart === x.id ? 'on' : ''} ${Object.values(placed).includes(x.id) ? 'placed' : ''} ${lk ? 'locked' : ''}" data-part="${x.id}"><span class="g">${lk ? '🔒' : CATS.find(z => z[0] === x.cat)[2]}</span><b>${x.name}</b><small>${lk ? '<span class="lk">LOCKED — ' + cardLock(x.id) + '</span>' : x.mass + ' kg · ' + (x.pw > 0 ? '+' : '') + x.pw + ' W' + (Object.values(placed).includes(x.id) ? ' · ✓' : '')}</small></button>`; }).join('');
  const pct = (v, m) => Math.min(100, v / m * 100), cls = (v, m) => v > m ? 'bad' : v > m * .9 ? 'warn' : '';
  const bar = (n, val, max, c2) => `<div class="stat"><div><span>${n}</span><span>${val}</span></div><div class="bar ${c2}"><i style="width:${pct(...max)}%"></i></div></div>`;
  const ck = checks(c).filter(x => !x.ok);
  $('#status').innerHTML = scoreCompact(computeScore(c)) + bar('Funding', '$' + c.cost.toFixed(1) + 'M / $' + REF.bud + 'M', [c.cost, REF.bud], cls(c.cost, REF.bud)) + bar('Launch mass', c.mass.toFixed(0) + ' / ' + REF.mass + ' kg', [c.mass, REF.mass], cls(c.mass, REF.mass))
    + bar(DUTY < 1 ? 'Power (avg est.)' : 'Power', c.demand + ' W demand / ' + c.gen + ' W', [c.demand, c.gen || 1], c.demand > c.gen ? 'bad' : '') + bar('Propellant', c.prop + ' / ' + REF.prop + ' kg', [c.prop, REF.prop], c.prop < REF.prop ? 'warn' : '')
    + `<div class="counts"><span>Structure attached</span><b>${c.structOK}/${c.others.length}</b><span>Powered</span><b>${c.powered}/${c.consumers.length}</b><span>Data routes</span><b>${c.routed}/${c.sci.length}</b><span>Science payload</span><b>${c.sci.length}</b></div>`
    + (ck.length ? ck.map(x => `<div class="msg ${x.level}">${x.msg}</div>`).join('') : '<div class="msg ok">No engineering problems detected.</div>');
  const q = cur || (selSlot && part(selSlot));
  $('#sel').innerHTML = q ? `<h3>${q.name}</h3>${!cur && selSlot && missingFor(q.id).length ? `<p class="lockmsg">NEEDS ATTENTION — REINSTALL ${missingFor(q.id).map(reqName).join(' + ').toUpperCase()}</p>` : cur && curLocked ? `<p class="lockmsg">LOCKED — ${lockText(cur.id)}</p>` : ''}<dl><dt>Developer</dt><dd>${q.dev}</dd><dt>Purpose</dt><dd>${q.why}</dd><dt>Mass</dt><dd>${q.mass} kg ${q.ref.includes('mass') ? '' : '(est.)'}</dd><dt>Power</dt><dd>${q.pw > 0 ? 'Generates ' + q.pw : q.pw < 0 ? 'Needs ' + -q.pw : 'None'}${q.pw > 0 && q.type === 'solar' && SOLAR_F < 1 ? ' (about ' + Math.round(q.pw * SOLAR_F) + ' W at ' + (JUNO ? 'Jupiter' : 'about 3 AU') + ')' : ''}${DEMAND_F[q.id] ? ' (counted at ' + Math.round(DEMAND_F[q.id] * 100) + '% throttle, est.)' : ''} ${q.pw ? 'W ' + (q.ref.includes('pw') ? '' : '(est.)') : ''}</dd>${q.cap && q.type === 'tank' ? `<dt>Propellant</dt><dd>${q.cap} kg ${q.ref.includes('cap') ? '' : '(est.)'}</dd>` : ''}${(RULES[q.id] || []).length ? `<dt>Requires</dt><dd>${RULES[q.id].map(t => `<span class="rq ${reqHave(t) ? 'ok' : 'no'}">${reqHave(t) ? '✓' : '✗'} ${reqName(t)}</span>`).join('<br>')}</dd>` : ''}<dt>Cost</dt><dd>${money(q.cost)} (${q.src === 'xl' ? 'catalogue gameplay estimate' : q.src ? 'catalogue midpoint' : 'gameplay estimate'})</dd>${q.year ? `<dt>Available</dt><dd>${q.year}</dd>` : ''}${q.isp ? `<dt>Isp</dt><dd>${q.isp} s</dd>` : ''}${q.rel ? `<dt>Reliability</dt><dd>${q.rel} (gameplay)</dd>` : ''}${q.adv ? `<dt>Pros</dt><dd>${q.adv}</dd>` : ''}${q.con ? `<dt>Cons</dt><dd>${q.con}</dd>` : ''}</dl><p class="note">Costs and values marked est. are simplified gameplay estimates, not historical figures.</p>${selSlot && part(selSlot) && !cur ? `<button data-remove="${selSlot}">Remove component</button>` : ''}` : '<p class="note">Select a component to inspect it.</p>';
}

// ---------- events ----------
document.addEventListener('click', e => {
  const t = e.target.closest('[data-cat],[data-m],[data-auto],[data-part],[data-slot],[data-link],[data-remove]'); if (!t) return;
  const d = t.dataset; note = '';
  if (d.cat) { cat = d.cat; }
  else if (d.m) { mode = d.m; pending = null; }
  else if ('auto' in d) { autoConnect(mode); }
  else if (d.remove) { removeSlot(d.remove); }
  else if (d.link !== undefined) { links.splice(+d.link, 1); note = 'Connection removed.'; }
  else if (d.part) {
    selPart = d.part; selSlot = null; mode = 'build';
    const open = SLOTS.filter(sl => accepts(sl, P[selPart]));
    if (open.length === 1 && install(open[0].id, selPart)) selPart = null; else if (missingFor(selPart).length) note = lockNote(selPart);
  } else if (d.slot) {
    const id = d.slot;
    if (mode === 'build') {
      if (selPart && accepts(SL[id], P[selPart])) { if (install(id, selPart)) selPart = null; } else if (part(id)) { selSlot = id; selPart = null; } else note = selPart ? 'That part does not go there. Highlighted slots are valid.' : 'Pick a part from the list first.';
    } else if (!part(id)) note = 'Install a part there first.';
    else if (!pending) { pending = id; selSlot = id; note = 'Now click the part to link to.'; }
    else if (pending === id) pending = null;
    else { note = addLink(mode, pending, id) || 'Connected.'; pending = null; }
  }
  render(); afterRender(d);
});
// keep the right slot in view inside the scrollable stencil
function showSlot(id) { const w = $('#stencilWrap'), sv = $('#stencil'), sl = SL[id]; if (!w || !sl || !sv.clientHeight) return; const k = sv.clientHeight / STENCIL_H;
  if (sl.y * k < w.scrollTop || (sl.y + sl.h) * k > w.scrollTop + w.clientHeight) w.scrollTop = Math.max(0, sl.y * k - w.clientHeight / 3); }
function afterRender(d) { const w = $('#stencilWrap'); if (!w) return;
  if (d.cat) w.scrollTop = 0;
  else if (d.part && selPart) { const o = SLOTS.find(sl => accepts(sl, P[selPart]) && !placed[sl.id]) || SLOTS.find(sl => accepts(sl, P[selPart])); if (o) showSlot(o.id); }
  else if (selSlot && (d.part || d.slot)) showSlot(selSlot); }
$('#validateBtn').onclick = () => {
  const k = checks(calc()), crit = k.filter(x => !x.ok && x.level === 'crit').length, warn = k.filter(x => !x.ok && x.level === 'warn').length;
  const sc = computeScore(calc()); finalInfo = { sig: scoreSig(), score: sc.score, grade: sc.grade }; try { localStorage.setItem('oe_' + STAGE + '_final', JSON.stringify(finalInfo)); } catch (e) {}
  render();
  $('#results').innerHTML = scoreReport(sc, crit) + `<div class="verdict">${crit ? 'VALIDATION FAILED: ' + crit + ' critical issue(s)' : 'VALIDATION PASSED' + (warn ? ' with ' + warn + ' warning(s)' : '')}</div>` + k.map(x => `<div class="msg ${x.ok ? 'ok' : x.level}">${x.ok ? '✓' : x.level === 'crit' ? '✗' : '!'} ${x.msg}</div>`).join('');
  $('#proceed').hidden = crit > 0; try { if (!crit) localStorage.setItem('oe_' + STAGE + '_validated', '1'); } catch (e) {}
  $('#modal').hidden = false;
};
document.addEventListener('toggle', e => { if (e.target.matches && e.target.matches('details.score')) scoreOpen = e.target.open; }, true);
// ---------- launch cinematic: plays after a validated craft proceeds to mission preparation ----------
const LAUNCH_INFO = { mro: ['Mars Reconnaissance Orbiter', 'Atlas V 401'], cassini: ['Cassini-Huygens', 'Titan IVB/Centaur'], msl: ['Mars Science Laboratory', 'Atlas V 541'], juno: ['Juno', 'Atlas V 551'], dawn: ['Dawn', 'Delta II 7925H'] };
function loadLaunchModule() { return new Promise(res => { if (window.OrbitalLaunch) return res(true); const sc = document.createElement('script'); sc.src = 'js/launch-animation.js'; sc.onload = () => res(true); sc.onerror = () => res(false); document.head.appendChild(sc); }); }
$('#proceed').addEventListener('click', e => {
  e.preventDefault(); const next = $('#proceed').getAttribute('href') || 'simulate.html', info = LAUNCH_INFO[STAGE] || ['Launch', ''];
  $('#modal').hidden = true;
  loadLaunchModule().then(ok => { if (!ok || !window.OrbitalLaunch) { location.href = next; return; } OrbitalLaunch.play({ missionName: info[0], vehicle: info[1], onDone: () => { location.href = next; } }); });
});
if (document.getElementById('validateBtn')) loadLaunchModule(); // preload so the launch starts instantly
$('#closeBtn').onclick = () => { $('#modal').hidden = true; };
if (document.createElement) { const sv = $('#stencil'), w = document.createElement('div'); w.id = 'stencilWrap'; sv.parentNode.insertBefore(w, sv); w.appendChild(sv); }
render();
