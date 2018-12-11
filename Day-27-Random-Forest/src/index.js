import p5 from 'p5/lib/p5.min';
import Tone from 'tone';
const sketch = (p) => {
        let parts;
        let w = 800;
        let h = 800;
        let g;
        let noiseoff = 0;
        let record = false;
        let melody = [40 - 12, 43 -12, 45 - 12, 47 -12, 49 -12, 52 - 12, 40, 43, 45, 47, 49, 52, 40 + 12, 43 + 12, 45 + 12, 49 + 12, 50 + 12, 52 + 12, 40 + 24, 43 + 24, 45 + 24, 49 + 24, 50 + 24, 52 + 24, 40 + 36, 43 + 36, 45 + 36, 47 + 36, 49 + 36, 52 + 36, 40 + 48, 43 + 48, 45 + 48, 47 + 48, 49 + 48, 52 + 48,40 + 60, 43 + 60, 45 + 60, 47 + 60, 49 + 48, 52 + 60]

        function paint(x, y, dx, dy, size, parent, bymouse) {
            let tx = x;
            let ty = y;
            let t = 15 + p.random(20);
            let pu = new Part(tx, ty, size);
            pu.velocity.x = 0;
            pu.velocity.y = 0;
            if (dy == 0 && dx == 0) {
                dx = p.random(1) - .5;
                dy = p.random(1) - .5;
            }
            pu.acceleration.x = dx;
            pu.acceleration.y = dy;
            pu.or_a.x = dx;
            pu.or_a.y = dy;
            pu.par = parent;
            parts.push(pu);
            return pu;
        }


        p.setup = () => {
            let canvas = p.createCanvas(800, 800, p.WEBGL);
            p.frameRate(30);
            g = p.createVector(0, .2);
            parts = [];

            p.smooth();
        }

        let obj1Param = [p.random(-200, -100), p.random(-300,-100), 3, p.random(100,300)];
        let obj2Param = [p.random(-50, 150), p.random(-100,200), 3, p.random(100,300)];
        let obj3Param = [p.random(0, 100), p.random(0,-200), 10, p.random(80,120)];

        var chorus = new Tone.Chorus(0.8, 2.5, 0.2).toMaster();  

        let v1 = new Tone.Volume(-100).connect(chorus);
        let f1 = new Tone.Filter(300, "highpass");
        let mosc1 = new Tone.Oscillator(Tone.Midi(40).toFrequency(), "sine").chain(f1, v1).start();

        let v2 = new Tone.Volume(-100).connect(chorus);
        let f2 = new Tone.Filter(400, "highpass");
        let mosc2 = new Tone.Oscillator(Tone.Midi(47).toFrequency(), "sine").chain(f2, v2).start();

        let v3 = new Tone.Volume(-100).connect(chorus);
        let f3 = new Tone.Filter(500, "highpass");
        let mosc3 = new Tone.Oscillator(Tone.Midi(52).toFrequency(), "sine").chain(f3, v3).start();

        let v4 = new Tone.Volume(-100).connect(chorus);
        let f4 = new Tone.Filter(600, "highpass");
        let mosc4 = new Tone.Oscillator(Tone.Midi(59).toFrequency(), "sine").chain(f4, v4).start();

        p.draw = () => {
            //p.camera(p.mouseX, 0, 400, 0, 0, 0, 0, 1, 0);
            p.background(0);
            
            p.stroke(255,40);
            p.line(0,-3000,0,3000);
            p.noStroke();
            p.fill(255);
        	p.rect(obj1Param[0],obj1Param[1],obj1Param[2],obj1Param[3]);
        	p.rect(obj1Param[0] + 30,obj1Param[1],obj1Param[2],obj1Param[3]);
        	p.rect(obj2Param[0],obj2Param[1],obj2Param[2],obj2Param[3]);
        	p.rect(obj3Param[0],obj3Param[1],obj3Param[2],obj3Param[3]);
            
            
            if (record) {
                if (p.random(1) > 0.5) {
                    if (p.random(1) > 0.5) {
                        nx = 100;
                    } else {
                        nx = 200;
                    }
                } else {
                    if (p.random(1) > 0.5) {
                        nx = -100;
                    } else {
                        nx = -200;
                    }
                }
                ny = p.mouseY - p.height / 2; // + random(-10,100);
                lastp = paint(nx, ny, (px - nx) - .1, (py - ny) - .1, p.random(10) + 5, lastp, true);
            } else {
                lastp = null;
            }
            updateParticles();
            px = nx;
            py = ny;
        }

        
        let fr = 0;
        let lastp = null;
        let nx = 0;
        let ny = 0;
        let px = 0;
        let py = 0;

        p.mousePressed = () => {
            record = true;
        }

        p.mouseReleased = () => {
            record = false;
        }

        p.keyPressed = () => {
           if(p.key == 'm') {
                p.save(Date.now() + ".jpg");
            }
        }

        function rotate2D(v, theta) {
            let xTemp = v.x;
            v.x = v.x * p.cos(theta) - v.y * p.sin(theta);
            v.y = xTemp * p.sin(theta) + v.y * p.cos(theta);
        }

        function updateParticles() {
            if (parts.length > 0) {
                noiseoff += .1;
                let s = parts.length - 1;
                for (let i = s; i >= 0; i--) {
                    let pu = parts[i];
                    pu.update();
                    if (pu.life < 0) {
                        parts.splice(i, 1);
                    }
                    if (pu.life < .9 && pu.spawned < 25 && parts.length < 650 && pu.life > .5) {
                        pu.spawned++;
                        if (p.random(1) > .95) {
                            let dir = p.createVector(pu.or_a.x, pu.or_a.y);
                            dir.normalize();
                            rotate2D(dir, p.radians(p.random(90) - 45));
                            dir.mult(3);
                            let np = paint(pu.position.x, pu.position.y, dir.x, dir.y, pu.size * .9, pu, false);
                            np.spawned = pu.spawned;
                        }
                    }
                    p.stroke(255, 5 + pu.life * 50);
                    p.strokeWeight(1);
                    if (pu.par != null) {
                        p.line(pu.position.x, pu.position.y, pu.position.z, pu.par.position.x, pu.par.position.y, pu.position.z);
                    }
                    pu.render();
                }
            }
        }

        class Part {
            constructor(x, y, size) {
                this.par = null;
                this.spawned = 0;
                this.life = 1;
                this.maxspeed = 12;
                this.r = p.random(360);
                this.position = p.createVector(0, 0);
                this.velocity = p.createVector(0, 0);
                this.acceleration = p.createVector(0, 0);
                this.or_a = p.createVector(0, 0);
                this.size = 10;
                this.min_d = 5;
                this.nei = null;
                this.position.x = x;
                this.position.y = y;
                this.size = size;
                this.alpha = 0;
                this.panner = new Tone.Panner(-1).toMaster();
                this.fm = new Tone.FMSynth({
                    "harmonicity": 18,
                    "modulationIndex": 8,
                    "detune": 0,
                    "oscillator": {
                        "type": "square"
                    },
                    "envelope": {
                        "attack": 0.01,
                        "decay": 0.02,
                        "sustain": 0.15,
                        "release": 2
                    },
                    "modulation": {
                        "type": "square"
                    },
                    "modulationEnvelope": {
                        "attack": 0.01,
                        "decay": 0.02,
                        "sustain": 0.03,
                        "release": 0.3
                    },
                    
                }).connect(this.panner);

                this.fm.volume.value = -14;
                this.panner.pan.value = this.position.x/p.width/2;
                this.fm.triggerAttackRelease(Tone.Midi((melody[p.ceil(this.size * 2)])).toFrequency(),"128n");
                
            }
            update() {
                this.life -= .01;
                this.velocity.add(this.acceleration);
                this.velocity.limit(5);
                // size=random(5);
                this.velocity.mult(.95);
                this.position.add(this.velocity);
                this.acceleration.mult(0);
            }
            render() {
            	if( (this.position.x > obj1Param[0]) &&
            		(this.position.x < obj1Param[0] + obj1Param[2]) && 
            		(this.position.y > obj1Param[1]) && 
            		(this.position.y < obj1Param[1] + obj1Param[3])) {
            		this.alpha = 255;
                    v1.volume.value = -4;
                    v1.volume.rampTo(-300,8);
            	}
            	if( (this.position.x > obj1Param[0] + 30) &&
            		(this.position.x < obj1Param[0] + 30 + obj1Param[2]) && 
            		(this.position.y > obj1Param[1]) && 
            		(this.position.y < obj1Param[1] + obj1Param[3])) {
            		this.alpha = 255;
                    v2.volume.value = -4;
                    v2.volume.rampTo(-300,8);
            	}

            	if( (this.position.x > obj2Param[0]) &&
            		(this.position.x < obj2Param[0] + obj2Param[2]) && 
            		(this.position.y > obj2Param[1]) && 
            		(this.position.y < obj2Param[1] + obj2Param[3])) {
            		this.alpha = 255;
                    v3.volume.value = -4;
                    v3.volume.rampTo(-300,8);
            	}

            	if( (this.position.x > obj3Param[0]) &&
            		(this.position.x < obj3Param[0] + obj3Param[2]) && 
            		(this.position.y > obj3Param[1]) && 
            		(this.position.y < obj3Param[1] + obj3Param[3])) {
            		this.alpha = 255;
                    v4.volume.value = -4;
                    v4.volume.rampTo(-300,8);
            	}

                
                p.push();
                p.translate(this.position.x, this.position.y, this.position.z);
                p.rotateY(p.radians(this.r));
                p.rotateZ(p.radians(this.r));
                this.r += this.size / 4;
                p.noStroke();
                p.fill(255, 5 + this.life * 255);
                p.box(this.size);
                p.fill(255,0,0,this.alpha);
                p.box(this.size * 1.5);
                p.pop();

                this.alpha-=10;
            }
            applyForce(force) {
                this.acceleration.add(force);
            }
        }

}
 export default sketch;
 new p5(sketch);