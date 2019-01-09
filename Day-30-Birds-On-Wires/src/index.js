import p5 from 'p5/lib/p5.min';
import Tone from 'tone';
import StartAudioContext from 'startaudiocontext';

const sketch = (p) => {
  let center = {};
    let wcolors = [];
    for (let i=0; i< 8; i++) {
      wcolors.push(0);
    }
    let flySynths = [];

    var chorus = new Tone.Chorus(0.8, 2.5, 0.2).toMaster();  

    var freeverb = new Tone.Freeverb().toMaster();
    freeverb.dampening.value = 2600;
    freeverb.roomSize.value = 0.3;
    var pingpong = new Tone.PingPongDelay("4n", 0.1).connect(freeverb);


    var autoFilter = new Tone.AutoFilter({
      "frequency" : "8m",
      "min" : 100,
      "max" : 15000,
      "filter"  : {
"type"  : "highpass" ,
"rolloff"  : -12 ,
"Q"  : 1
}
    }).connect(chorus);

    autoFilter.start()    

    let v1 = new Tone.Volume(-100).connect(autoFilter);
    let f1 = new Tone.Filter(300, "highpass");
    let mosc1 = new Tone.Oscillator(Tone.Midi(53).toFrequency(), "sine").chain(f1, v1).start();

    let v2 = new Tone.Volume(-100).connect(autoFilter);
    let f2 = new Tone.Filter(400, "highpass");
    let mosc2 = new Tone.Oscillator(Tone.Midi(60).toFrequency(), "sine").chain(f2, v2).start();

    let v3 = new Tone.Volume(-100).connect(autoFilter);
    let f3 = new Tone.Filter(500, "highpass");
    let mosc3 = new Tone.Oscillator(Tone.Midi(65).toFrequency(), "sine").chain(f3, v3).start();

    let v4 = new Tone.Volume(-100).connect(autoFilter);
    let f4 = new Tone.Filter(600, "highpass");
    let mosc4 = new Tone.Oscillator(Tone.Midi(79).toFrequency(), "sine").chain(f4, v4).start();

    let wiresynths = [];
    let wireMelody = [53, 56, 60, 65, 68, 69, 74 , 77];
    for(let i=0; i< 8; i++) {
      wiresynths.push (new Tone.FMSynth({
                    "harmonicity": 28,
                    "modulationIndex": 2,
                    "detune": 0,
                    "oscillator": {
                        "type": "sawtooth"
                    },
                    "envelope": {
                        "attack": 0.01,
                        "decay": 0.1,
                        "sustain": 0.18,
                        "release": 8
                    },
                    "modulation": {
                        "type": "square"
                    },
                    "modulationEnvelope": {
                        "attack": 0.01,
                        "decay": 0.02,
                        "sustain": 0.3,
                        "release": 1
                    },
                    "volume":-16
                    
                }).chain(chorus, pingpong));
      }
                
    var FLOCK_SIZE = 200,
        NUM_POWER_LINES = 8,
        POWER_LINES_Z = 20.0,
        POWER_LINES_Y = 8.0,
        POWER_LINES_SPACING = 1.0,
        COLLISION_DISTANCE = 2.0,
        WALL_COLLISION_DISTANCE = 4.0,
        CENTER_ATTRACTION_WEIGHT = 0.01,
        VELOCITY_ATTRACTION_WEIGHT = 0.125,
        COLLISION_AVOIDANCE_WEIGHT = 0.1,
        POWER_LINE_ATTRACTION_WEIGHT = 0.05,
        MAXIMUM_VELOCITY = 1.0,
        POWER_LINE_ATTRACT_DISTANCE = 3.0,
        MESMARIZE_DISTANCE = 2.0,
        POWER_LINE_SIT_DISTANCE = 0.4,
        MINIMUM_SIT_VELOCITY = 0.5,
        SITTING_INFLUENCE_DISTANCE = 3.5,
        LAUNCH_INFLUENCE = 3.0,
        STEP_DISTANCE = 0.2,
        STEP_TIMING = 10,
        IDEAL_LINE_DISTANCE = 1.0,
        TOLERABLE_LINE_DISTANCE = .5,
        MINIMUM_LINE_DISTANCE = 0.4,
        LAUNCH_VELOCITY = 1.0,
        PYRAMID_BASE = 1.0,
        PYRAMID_TOP = 100.0,
        PYRAMID_HALFWIDTH_AT_BASE = PYRAMID_BASE,
        PYRAMID_HALFWIDTH_AT_TOP = PYRAMID_TOP,
        WALL_SLOPE = (PYRAMID_HALFWIDTH_AT_TOP - PYRAMID_HALFWIDTH_AT_BASE) / (PYRAMID_TOP - PYRAMID_BASE),
        WIDTH_AT_BASE = PYRAMID_HALFWIDTH_AT_BASE - PYRAMID_BASE * WALL_SLOPE;
    var timer, flock = [],
        lines = [];

    function el(id) {
        return document.getElementById(id);
    }

    function each(a, f) {
        for (var i = 0, l = a.length; i < l; i++) f(a[i], i);
    }

    function padd(p1, p2) {
        return {
            x: p1.x + p2.x,
            y: p1.y + p2.y,
            z: p1.z + p2.z
        }
    }

    function paddto(p1, p2) {
        p1.x += p2.x;
        p1.y += p2.y;
        p1.z += p2.z;
    }

    function psub(p1, p2) {
        return {
            x: p1.x - p2.x,
            y: p1.y - p2.y,
            z: p1.z - p2.z
        }
    }

    function psubfrom(p1, p2) {
        p1.x -= p2.x;
        p1.y -= p2.y;
        p1.z -= p2.z;
    }

    function pmul(p, c) {
        return {
            x: p.x * c,
            y: p.y * c,
            z: p.z * c
        };
    }

    function pmulby(p, c) {
        p.x *= c;
        p.y *= c;
        p.z *= c;
    }

    function metric(p1, p2) {
        var dx = p1.x - p2.x,
            dy = p1.y - p2.y,
            dz = p1.z - p2.z;
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }

    function magnitude(p) {
        return metric(p, {
            x: 0,
            y: 0,
            z: 0
        });
    }

    function near(p1, p2, r) {
        return metric(p1, p2) <= r;
    }

    function yz(p) {
        return {
            x: 0,
            y: p.y,
            z: p.z
        };
    }

    function Boid(x, y, z) {
        var boid = {
            p: {
                x: x,
                y: y,
                z: z
            },
            powerLine: -1,
            v: {
                x: 0,
                y: 0,
                z: 0
            }
        };
        var lastStep = 0;

        function stepSitting() {
            var i, b;
            var rightNeighbor = boid.p.z * WALL_SLOPE + WIDTH_AT_BASE,
                leftNeighbor = -rightNeighbor,
                difference = 0.0,
                flockInfluence = {
                    x: 0,
                    y: 0,
                    z: 0
                },
                influence = 0.0,
                distance = 0.0;
            for (i = 0; b = flock[i]; i++) {
                if (b === boid) continue;
                if (b.powerLine == boid.powerLine) {
                    if (b.p.x < boid.p.x && b.p.x > leftNeighbor) leftNeighbor = b.p.x;
                    if (b.p.x > boid.p.x && b.p.x < rightNeighbor) rightNeighbor = b.p.x;
                } else if ((b.powerLine < 0) && (near(boid.p, b.p, SITTING_INFLUENCE_DISTANCE))) {
                    flockInfluence = padd(flockInfluence, b.v);
                }
            }
            leftNeighbor = boid.p.x - leftNeighbor;
            rightNeighbor -= boid.p.x;
            // if nearest neighbor is below minimum distance, launch
            if ((leftNeighbor < MINIMUM_LINE_DISTANCE) || (rightNeighbor < MINIMUM_LINE_DISTANCE)) {
                return launch();
            }
            // determine if the flock has influenced this boid to launch
            influence = magnitude(flockInfluence);
            if (influence > LAUNCH_INFLUENCE) return launch(pmul(flockInfluence, 1 / influence));
            if (++lastStep >= STEP_TIMING) {
                if (leftNeighbor < IDEAL_LINE_DISTANCE) {
                    if (rightNeighbor < IDEAL_LINE_DISTANCE) {
                        difference = rightNeighbor - leftNeighbor;
                        if (difference < -STEP_DISTANCE) {
                            boid.p.x -= STEP_DISTANCE;
                            lastStep = 0;
                        } else if (difference > STEP_DISTANCE) {
                            boid.p.x += STEP_DISTANCE;
                            lastStep = 0;
                        } else if ((rightNeighbor < TOLERABLE_LINE_DISTANCE) || (leftNeighbor < TOLERABLE_LINE_DISTANCE)) {
                            return launch();
                        }
                    } else if (leftNeighbor < IDEAL_LINE_DISTANCE - STEP_DISTANCE) {
                        boid.p.x += STEP_DISTANCE;
                        lastStep = 0;
                    }
                } else if (rightNeighbor < IDEAL_LINE_DISTANCE - STEP_DISTANCE) {
                    boid.p.x -= STEP_DISTANCE;
                    lastStep = 0;
                }
            }
        }

        

        function stepFlying() {
            var centerOfFlock = {
                    x: 0,
                    y: 0,
                    z: 0
                },
                averageVelocity = {
                    x: 0,
                    y: 0,
                    z: 0
                },
                collisionAvoidance = {
                    x: 0,
                    y: 0,
                    z: 0
                },
                powerLineAttraction = {
                    x: 0,
                    y: 0,
                    z: 0
                },
                powerLineAdjustment = 1.0,
                tmpPowerLineAdj = 1.0,
                distance = 0.0,
                vBar = 0.0,
                widthAtZ = 0.0,
                flying = 0,
                mesmarized = false;
            // perform power line calculations
            for (var i = 0, line; line = lines[i]; i++) {
                distance = metric(yz(boid.p), line);
                if (distance <= POWER_LINE_ATTRACT_DISTANCE) {
                    vBar = line.directionalVelocity(boid.p, boid.v);
                    if (vBar >= 0) {
                        powerLineAttraction.y += line.y - boid.p.y;
                        powerLineAttraction.z += line.z - boid.p.z;
                        tmpPowerLineAdj = distance / POWER_LINE_ATTRACT_DISTANCE;
                        if (tmpPowerLineAdj < powerLineAdjustment) powerLineAdjustment = tmpPowerLineAdj;
                        if ((distance < POWER_LINE_SIT_DISTANCE) && (vBar < MINIMUM_SIT_VELOCITY)) {
                            // bird is now sitting, discontinue calculations
                            boid.v.x = boid.v.y = boid.v.z = 0;
                            boid.p.y = line.y;
                            boid.p.z = line.z;
                            boid.powerLine = i;
                            return;
                        }
                        if (distance < MESMARIZE_DISTANCE) mesmarized = true;
                    }
                }
            }
            // iterate through all boids calculating new velocity
            for (var i = 0, b; b = flock[i]; i++) {
                if ((b === boid) || (b.powerLine >= 0)) continue;
                if (!mesmarized) {
                    centerOfFlock = padd(centerOfFlock, b.p);
                    averageVelocity = padd(averageVelocity, b.v);
                }
                if (near(b.p, boid.p, COLLISION_DISTANCE)) psubfrom(collisionAvoidance, psub(b.p, boid.p));
                flying++
            }
            if (!mesmarized) centerOfFlock = psub(pmul(centerOfFlock, 1.0 / flying), boid.p);
            // perform collision avoidance on area boundries
            if (boid.p.z > PYRAMID_TOP - WALL_COLLISION_DISTANCE) collisionAvoidance.z += PYRAMID_TOP - WALL_COLLISION_DISTANCE - boid.p.z;
            if (boid.p.z < PYRAMID_BASE + WALL_COLLISION_DISTANCE) collisionAvoidance.z += PYRAMID_BASE + WALL_COLLISION_DISTANCE - boid.p.z;
            widthAtZ = boid.p.z * WALL_SLOPE + WIDTH_AT_BASE;
            if (boid.p.x > widthAtZ - WALL_COLLISION_DISTANCE) collisionAvoidance.x += widthAtZ - WALL_COLLISION_DISTANCE - boid.p.x;
            if (boid.p.x < -widthAtZ + WALL_COLLISION_DISTANCE) collisionAvoidance.x += -widthAtZ + WALL_COLLISION_DISTANCE - boid.p.x;
            if (boid.p.y > widthAtZ - WALL_COLLISION_DISTANCE) collisionAvoidance.y += widthAtZ - WALL_COLLISION_DISTANCE - boid.p.y;
            if (boid.p.y < -widthAtZ + WALL_COLLISION_DISTANCE) collisionAvoidance.y += -widthAtZ + WALL_COLLISION_DISTANCE - boid.p.y;
            // scale velocity modifiers
            if (!mesmarized) {
                pmulby(centerOfFlock, CENTER_ATTRACTION_WEIGHT);
                pmulby(averageVelocity, VELOCITY_ATTRACTION_WEIGHT / flying);
            }
            pmulby(collisionAvoidance, COLLISION_AVOIDANCE_WEIGHT);
            pmulby(powerLineAttraction, POWER_LINE_ATTRACTION_WEIGHT);
            // use calculations to compute new velocity
            paddto(boid.v, padd(padd(centerOfFlock, averageVelocity), padd(collisionAvoidance, powerLineAttraction)));
            vBar = magnitude(boid.v);
            if ((powerLineAdjustment < 1.0) && (vBar > 0.2)) pmulby(boid.v, powerLineAdjustment);
            // do not let velocity exceed a maximum
            if (vBar > MAXIMUM_VELOCITY) pmulby(boid.v, MAXIMUM_VELOCITY / vBar);
            paddto(boid.p, boid.v);

            center = centerOfFlock;
        }

        function launch(direction) {
            if (!direction) {
                var theta = 2.0 * Math.PI * Math.random();
                direction = {
                    x: 0,
                    y: Math.sin(theta),
                    z: Math.cos(theta)
                };
            }
            lastStep = 0;
            
            wiresynths[boid.powerLine].triggerAttackRelease(Tone.Midi((wireMelody[boid.powerLine])).toFrequency(),"128n");
            wcolors[boid.powerLine] = 255;
            boid.powerLine = -1;
            boid.v.x = LAUNCH_VELOCITY * direction.x;
            boid.v.y = LAUNCH_VELOCITY * direction.y;
            boid.v.z = LAUNCH_VELOCITY * direction.z;

            return 0;
        }
        boid.step = function() {
            var pl = boid.powerLine;
            if (boid.powerLine >= 0) stepSitting();
            else stepFlying();
        }
        return boid;
    }

    function PowerLine(y, z) {
        var line = {
            x: 0,
            y: y,
            z: z
        };
        line.directionalVelocity = function(p, v) {
            var distance = metric(yz(p), line);
            return distance > 0.0 ? ((line.y - p.y) * v.y + (line.z - p.z) * v.z) / distance : -magnitude(yz(v));
        }
        return line;
    }

    function init() {
        // place all boids on side edge of world
        for (var i = 0; i < FLOCK_SIZE; i++) {
            var z = (PYRAMID_TOP - PYRAMID_BASE) * Math.random() + PYRAMID_BASE,
                w = (z - PYRAMID_BASE) * (PYRAMID_HALFWIDTH_AT_TOP - PYRAMID_HALFWIDTH_AT_BASE) / (PYRAMID_TOP - PYRAMID_BASE) - PYRAMID_HALFWIDTH_AT_BASE,
                w2 = 2 * w * Math.random() - w;
            var xy = [{
                x: w2,
                y: w
            }, {
                x: w2,
                y: -w
            }, {
                y: w2,
                x: w
            }, {
                y: w2,
                x: -w
            }][parseInt(Math.random() * 3.99999)];
            flock.push(Boid(xy.x, xy.y, z));
        }
        // create power lines
        for (var i = 0; i < NUM_POWER_LINES; i++) lines.push(PowerLine(POWER_LINES_Y + i * POWER_LINES_SPACING, POWER_LINES_Z));
        var timer = setInterval(step, 50);
    }

    function step() {
        each(flock, function(b) {
            b.step();
        })
    }

    function fog(z) {
        var c = Math.max(50, parseInt(0 + 300 * (z / PYRAMID_TOP)));
        p.noStroke();
        p.fill(255,255-c);
        
    }
    p.setup = () => {
        let canvas = p.createCanvas(800, 800, p.WEBGL);
        p.smooth();
        init();
    }
    p.draw = () => {
        p.camera(-100 + p.sin(p.frameCount/50) * 50, 100 + + p.cos(p.frameCount/50) * 50, 600, 0, 0, 0, 0, 1, 0);
        p.background(0)

        //p.rotateY(p.frameCount/100);
        
        p.translate(-p.width/3,-p.height/2.5);
        //p.rotateY(p.mouseX);
        flock.sort(function(a, b) {
            return b.p.z - a.p.z;
        });

        
        for(let i=0; i<lines.length;i++) {
            var v = parseInt(225 * lines[i].y / lines[i].z + 225);
            p.stroke(255,100);
            p.line(-1000, v, p.width, v);
            p.fill(255,0,0,wcolors[i]);
            p.push();
            p.noStroke();
            p.translate(0,v,0);
            p.box(2000,2,2);
            p.pop();
        }

        each(flock, function(b) {

            fog(b.p.z);
            circle(225 * b.p.x / b.p.z + 300, 225 * b.p.y / b.p.z + 225, 62.5 / b.p.z);
        })

        if(flock[0].p.z > 0) v1.volume.rampTo( p.map(flock[0].p.z,80,0,-60,-30), 0.01);
        if(flock[1].p.z > 0) v2.volume.rampTo( p.map(flock[1].p.z,80,0,-60,-30), 0.01);
        if(flock[2].p.z > 0) v3.volume.rampTo( p.map(flock[2].p.z,80,0,-60,-30), 0.01);
        if(flock[3].p.z > 0) v4.volume.rampTo( p.map(flock[3].p.z,80,0,-60,-30), 0.01);

        for(let i=0; i< wcolors.length; i++) {

          wcolors[i] -=20;
        }
    }

    p.keyPressed = () => {
        if(p.key == 'm') {
            p.save(Date.now() + ".jpg");
        }
    }

    p.mousePressed = () => {
        StartAudioContext(Tone.context).then(function(){});    
    }

    function circle(x, y, r) {
        p.push();
        p.translate(x, y, r);
        p.sphere(1 + r/2);
        p.pop();
    }
}
export default sketch;
new p5(sketch);