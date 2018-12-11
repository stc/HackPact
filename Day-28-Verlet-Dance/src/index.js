import p5 from 'p5/lib/p5.min';
import Tone from 'tone';
const sketch = (p) => {
    const PI2 = Math.PI * 2;
    
    const mouse1 = {
        x: 0,
        y: 0
    };

    const mouse2 = {
        x: 0,
        y: 0
    };
    
    let melody1 = [40 + 24, 43 + 48, 45 + 36, 49 + 24, 50 + 24, 52 + 24, 40 + 36, 43 + 36, 45 + 36]
    let melody2 = [40 + 12, 43 + 12, 45 + 12, 49 + 12, 50 + 12, 52 + 12, 40 + 24, 43 + 24, 45 + 24];

    var freeverb = new Tone.Freeverb().toMaster();
        freeverb.dampening.value = 3600;
        freeverb.roomSize.value = 0.4;

    var chorus = new Tone.Chorus(0.8, 2.5, 0.2).connect(freeverb);

    let vol1 = new Tone.Volume(-26).toMaster();
    let osc = new Tone.Oscillator( Tone.Midi(52).toFrequency(), "sine").connect(vol1).start();
    let vol2 = new Tone.Volume(-20).toMaster();
    let osc2 = new Tone.Oscillator( Tone.Midi(45).toFrequency(), "sine").connect(vol2).start();

    class Entity {
        constructor(id, num, mel) {
            this.id = id;
            this.mel = mel;
            this.gravity = 0.3;
            this.friction = 0.99;
            this.w = 800;
            this.wH = this.w >> 1;
            this.h = 400;
            this.hH = this.h >> 1;

            this.alpha = [];
            
            this.points = [];
            this.sticks = [];

            this.triggers = [];
            this.counters = [];

            this.numPoints = num;
            this.r = 40;
            this.startX = this.wH;
            this.startY = this.hH;
            this.points.push({
                x: this.startX,
                y: this.startY,
                oldX: this.startX,
                oldY: this.startY
            });
            for (let i = 1; i < this.numPoints; i++) {
                this.startX += (Math.cos(Math.random() * PI2) * this.r);
                this.startY += (Math.sin(Math.random() * PI2) * this.r);
                this.points.push({
                    x: this.startX,
                    y: this.startY,
                    oldX: this.startX,
                    oldY: this.startY
                });
            }

            this.oscillators = [];
            this.drums = [];

            for(let i=0; i<this.points.length; i++) {
                this.triggers.push(true);
                this.oscillators.push(new Tone.FMSynth({
                "harmonicity"  : 8 ,
                "modulationIndex"  : 2 ,
                "detune"  : 0 ,
                "oscillator"  : {
                    "type"  : "triangle"
                }  ,
                "envelope"  : {
                    "attack"  : 0.03 ,
                    "decay"  : 0.08 ,
                    "sustain"  : 0.02 ,
                    "release"  : 0.3
                }  ,
                "modulation"  : {
                    "type"  : "sine"
                }  ,
                "modulationEnvelope"  : {
                    "attack"  : 0.01 ,
                    "decay"  : 0.1 ,
                    "sustain"  : 0.2 ,
                    "release"  : 0.22
                }, "volume" : -6
                }).connect(chorus));

                this.drums.push(new Tone.MembraneSynth({
                "envelope"  : {
                    "attack"  : 0.001 ,
                    "decay"  : 0.002 ,
                    "sustain"  : 0.03 ,
                    "release"  : 1
                }, "volume" : -20 
                }).connect(chorus));
                this.alpha.push(0);
            }

            for (let i = 0; i < this.points.length - 1; i++) {
                const p0 = this.points[i];
                const p1 = this.points[i + 1];
                const length = 50; // distanceBetween(p0, p1);
                this.sticks.push({
                    p0,
                    p1,
                    length
                });
            }
            const p0 = this.points[this.points.length - 1];
            const p1 = this.points[0];
            const length = 50;
            this.sticks.push({
                p0,
                p1,
                length
            });
        }

        draw(c) {
            this.updatePoints();
            for (let i = 0; i < 3; i++) {
                this.updateSticks();
                this.constrainPoints(c);
            }
            for (let i = 0; i < this.sticks.length; i++) {
                p.stroke(255, 100);
                p.line(this.sticks[i].p0.x, this.sticks[i].p0.y, this.sticks[i].p1.x, this.sticks[i].p1.y);
            }

            for (let i = 0; i < this.points.length; i++) {
                p.push();
                p.translate(this.points[i].x,this.points[i].y,0);
                p.fill(255);
                p.noStroke();
                p.sphere(3);

                p.fill(255  ,0,0,this.alpha[i]);
                p.sphere(4);
                p.pop();

                this.alpha[i]-=10;

                let distance = p.dist(this.points[i].y, 0, 400, 0);
                if(distance < 1) {
                    if(this.triggers[i]) {
                        this.counters[i]++;
                        this.alpha[i] = 255;
                        this.oscillators[i].triggerAttackRelease(Tone.Midi(this.mel[i]).toFrequency(), "128n");
                        this.drums[i].triggerAttackRelease(Tone.Midi(this.mel[i]).toFrequency(), "64n");
                        if(this.counters[i] > 1) {
                            this.triggers[i] = false;
                        }
                    }
                } else {
                    this.counters[i] = 0;
                    this.triggers[i] = true;
                }
            }
        }

        updatePoints() {
            this.points.forEach((body) => {
                const velX = body.x - body.oldX;
                const velY = body.y - body.oldY;
                body.oldX = body.x;
                body.oldY = body.y;
                body.x += velX * this.friction;
                body.y += velY * this.friction;
                body.y += this.gravity;
            });
        }

        constrainPoints(c) {
            this.points.slice(1).forEach((body) => {
                const velX = body.x - body.oldX;
                const velY = body.y - body.oldY;
                if (body.x < 0) {
                    body.x = 0;
                    body.oldX = body.x + velX;
                } else if (body.x > this.w) {
                    body.x = this.w;
                    body.oldX = body.x + velX;
                }
                if (body.y < 0) {
                    body.y = 0;
                    body.oldY = body.y + velY;
                } else if (body.y > this.h) {
                    body.y = this.h;
                    body.oldY = body.y + velY;
                }
            });
            this.points[0].x = c.x;
            this.points[0].y = c.y;
            this.points[1].x = c.x;
        }
        
        updateSticks() {
            this.sticks.forEach((stick) => {
                const dx = stick.p1.x - stick.p0.x;
                const dy = stick.p1.y - stick.p0.y;
                const distance = distanceBetween(stick.p0, stick.p1);
                const difference = stick.length - distance;
                const percent = difference / distance / 2;
                const offsetX = dx * percent;
                const offsetY = dy * percent;
                stick.p0.x -= offsetX;
                stick.p0.y -= offsetY;
                stick.p1.x += offsetX;
                stick.p1.y += offsetY;
            });
        }
    }

    const distanceBetween = (p1, p2) => Math.sqrt((p1.x - p2.x) * (p1.x - p2.x) + (p1.y - p2.y) * (p1.y - p2.y));
    
    let tx1 = 0;
    let ty1 = 10000;
    
    let tx2 = 0;
    let ty2 = 10000;
    
    let e1;
    let e2;

    p.setup = () => {
        let canvas = p.createCanvas(800, 800, p.WEBGL);
        p.smooth();
        e1 = new Entity(0, 6, melody1); 
        e2 = new Entity(1, 8, melody2);  
    }
    
    p.draw = () => {
        p.camera(-100, -100, 550, 0, 0, 0, 0, 1, 0);
        p.background(0);
        p.translate(-p.width / 2, -p.height/ 2, 0);
        
        mouse1.x = p.map(p.noise(tx1), 0, 1, p.width/2 - p.width/6, p.width/2);
        mouse1.y = p.map(p.noise(ty1), 0, 1, p.height/2+100, p.height/3.5);
        
        mouse2.x = p.map(p.noise(tx2), 0, 1, p.width/2 - p.width/6, p.width/2);
        mouse2.y = p.map(p.noise(ty2), 0, 1, p.height/2+100, p.height/3.5);

        let val = p.sin( p.frameCount / 100 );

        // noise        
        if(val>0) {
            tx1 += 0.01; 
            ty1 += 0.02; 
        } else {
            tx2 += 0.023; 
            ty2 += 0.031;

        } 

        
        p.push();
        
        p.translate(p.width / 2, p.height/ 2, 0);
        
        p.push();
        p.translate(0,0,0);
        p.noFill();
        p.stroke(255,160);
        p.box(1000,4,1000);
        p.pop();
        


        p.fill(0,100);
        p.stroke(255,180);
        //p.rotateY(p.frameCount/1000);

        p.push();
        p.translate(-110,0,0);
        p.box(150,10,150);
        p.pop();

        p.push();
        p.translate(50,0,100);
        p.box(150,10,150);
        p.pop();

        p.pop();
        p.push();
        p.translate(-50,0,0);
        e1.draw(mouse1);
        p.pop();
        p.rotateY(p.radians(30));
        p.translate(0, 0, 300);

        e2.draw(mouse2);

        
    }
    p.keyPressed = () => {
        if(p.key == 'm') {
            p.save(Date.now() + ".jpg");
        }
    }
}
export default sketch;
new p5(sketch);