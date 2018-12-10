import p5 from 'p5/lib/p5.min';
import Tone from 'tone';
const sketch = (p) => {
    var noise = new Tone.Noise("pink").start();
    noise.volume.value = -20;
    //make an autofilter to shape the noise
    var autoFilter = new Tone.AutoFilter({
        "frequency": "8m",
        "min": 800,
        "max": 5000
    }).connect(Tone.Master);
    //connect the noise
    noise.connect(autoFilter);
    //start the autofilter LFO
    autoFilter.start()
    var chorus = new Tone.Chorus(0.8, 2.5, 0.2).toMaster();
    let fm = new Tone.FMSynth({
        "harmonicity": 10,
        "modulationIndex": 80,
        "detune": 0,
        "oscillator": {
            "type": "sine"
        },
        "envelope": {
            "attack": 0.001,
            "decay": 0.003,
            "sustain": 0.06,
            "release": 0.3
        },
        "modulation": {
            "type": "square"
        },
        "modulationEnvelope": {
            "attack": 0.01,
            "decay": 0.02,
            "sustain": 0.03,
            "release": 0.033
        },
        "portamento": 0.01
    }).connect(chorus);
    fm.volume.value = 0;

    function Walker(x, y) {
        this.ex = 0;
        this.ey = 0;
        this.easing = 0.05;
        this.red = p.random(100, 255);
        this.g = p.random(255);
        this.b = p.random(255);
        this.canPlay = true;
        this.alpha = 0;
        if (arguments.length == 2) {
            this.pos = p.createVector(x, y);
            this.stuck = true;
        } else {
            this.pos = p.createVector(p.random(-150, 150), p.random(-150, 150));
            this.stuck = false;
        }
        this.r = radius1;
        this.walk = function() {
            //var vel = p5.Vector.random2D();
            var vel = p.createVector(p.random(-0.5, 0.5), p.random(-0.5, 0.5));
            this.pos.add(vel);
            p.constrain(this.pos.x, -150, 150);
            p.constrain(this.pos.y, -150, 150);
        }
        this.checkStuck = function(others) {
            for (var i = 0; i < others.length; i++) {
                var d = distSq(this.pos, others[i].pos);
                if (d < (this.r * this.r + others[i].r * others[i].r + 2 * others[i].r * this.r)) {
                    //if (random(1) < 0.1) {
                    this.stuck = true;
                    if (this.canPlay) {
                        fm.triggerAttackRelease(Tone.Midi((this.r * 10) + 70).toFrequency(), "128n");
                        this.alpha = 255;
                        this.canPlay = false;
                    }
                    return true;
                    break;
                    //}
                }
            }
            return false;
        }
        this.setHue = function(hu) {
            this.hu = hu;
        }
        this.show = function() {
            p.noStroke();
            if (this.stuck && typeof this.hu !== 'undefined') {
                p.fill(255);
            } else {
                p.fill(this.b, 220 - p.dist(this.pos.x, this.pos.y, 0, 0));
            }
            p.push();
            //p.stroke(100);
            //if(this.stuck)p.line(0,0,0,this.pos.x,this.pos.y,this.pos.z)
            let targetX = this.pos.x;
            let dx = targetX - this.ex;
            this.ex += dx * this.easing;
            let targetY = this.pos.y;
            let dy = targetY - this.ey;
            this.ey += dy * this.easing;
            p.translate(this.ex, this.ey, this.pos.z);
            p.noStroke();
            if (this.stuck) {
                p.sphere(this.r);
                p.fill(255, 0, 0, this.alpha);
                p.sphere(this.r * 1.1);
            } else {
                p.sphere(this.r / 2);
            }
            p.pop();
            this.alpha -= 4;
        }
    }

    function distSq(a, b) {
        var dx = b.x - a.x;
        var dy = b.y - a.y;
        return dx * dx + dy * dy;
    }
    var tree1 = [];
    var walkers1 = [];
    var maxWalkers1 = 500;
    var iterations1 = 100;
    var radius1 = 5;
    var hu = 0;
    var shrink1 = 0.995;
    var tree2 = [];
    var walkers2 = [];
    var maxWalkers2 = 300;
    var iterations2 = 100;
    var radius2 = 5;
    var shrink2 = 0.995;
    p.setup = () => {
        let canvas = p.createCanvas(800, 800, p.WEBGL);
        tree1[0] = new Walker(0, 0);
        radius1 *= shrink1;
        for (var i = 0; i < maxWalkers1; i++) {
            walkers1[i] = new Walker();
            radius1 *= shrink1;
        }
        /*
                tree2[0] = new Walker(0, 0);
                radius2 *= shrink2;
                for (var i = 0; i < maxWalkers2; i++) {
                    walkers2[i] = new Walker();
                    radius2 *= shrink2;
                }
                */
    }
    p.draw = () => {
        p.camera(-100, -100, 400 - p.frameCount / 80, 0, 0, 0, 0, 1, 0);
        p.background(0);
        //p.pointLight(150, 150, 150, 500, 0, 200);
        //p.directionalLight(255,255,255, 0, 1, 0);
        //p.ambientLight(100);
        p.smooth();
        //p.rotateY(p.frameCount/100);
        p.rotateZ(p.frameCount / 600);
        for (var i = 0; i < tree1.length; i++) {
            tree1[i].show();
        }
        for (var i = 0; i < walkers1.length; i++) {
            walkers1[i].show();
        }
        for (var n = 0; n < iterations1; n++) {
            for (var i = walkers1.length - 1; i >= 0; i--) {
                walkers1[i].walk();
                if (walkers1[i].checkStuck(tree1)) {
                    walkers1[i].setHue(hu % 360);
                    hu += 2;
                    tree1.push(walkers1[i]);
                    walkers1.splice(i, 1);
                }
            }
        }
        var r = walkers1[walkers1.length - 1].r;
        while (walkers1.length < maxWalkers1 && radius1 > 1) {
            radius1 *= shrink1;
            walkers1.push(new Walker());
        }
        p.fill(255);
        p.sphere(6);
        //p.rotateX(p.HALF_PI);
        /*
                for (var i = 0; i < tree2.length; i++) {
                    tree2[i].show();
                }
                for (var i = 0; i < walkers2.length; i++) {
                    walkers2[i].show();
                }
                for (var n = 0; n < iterations2; n++) {
                    for (var i = walkers2.length - 1; i >= 0; i--) {
                        walkers2[i].walk();
                        if (walkers2[i].checkStuck(tree2)) {
                            walkers2[i].setHue(hu % 360);
                            hu += 2;
                            tree2.push(walkers2[i]);
                            walkers2.splice(i, 1);
                        }
                    }
                }
                r = walkers2[walkers2.length - 1].r;
                while (walkers2.length < maxWalkers2 && radius2 > 1) {
                    radius2 *= shrink2;
                    walkers2.push(new Walker());
                } */
    }
}
export default sketch;
new p5(sketch);