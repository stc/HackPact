import p5 from 'p5/lib/p5.min';
import Tone from 'tone';

const sketch = (p5) => {
    class Rotor {
        constructor(id, baseSize, sequence, rotation) {
            this.id = id;
            this.baseSize = baseSize;
            this.sequence = sequence;
            this.d = this.baseSize * this.sequence.length * 4;
            this.r = this.d / 2;
            this.speed = -(19 - this.sequence.length) / 600;
            this.counter = 0;
            this.rotation = p5.radians(rotation);
            this.triggers = [];
            this.colors = [];
            this.sphereSizes = [];
            for(let i=0; i< this.sequence.length; i++) {
                this.triggers.push(false);
                this.colors.push(0);
                this.sphereSizes.push(2);
            }

        }
        draw() {
            p5.push();
            p5.rotateY(this.rotation + this.counter * (18 - this.sequence.length) / 40);
            p5.rotateZ(this.rotation + this.counter * (18 - this.sequence.length) / 50);
            p5.rotateX(this.id * 30);
            p5.noFill();
            p5.stroke(0,180);
            p5.push();
            //p5.rotateY(p5.radians(90));
            p5.line(0,-this.r + 10,0,0,-this.r - 10,0);
            p5.line(0,-this.r,-10,0,-this.r,10);
            p5.pop();
            //p5.ellipse(0,0, this.d, this.d);

            p5.stroke(0,40);
            p5.arc(0,0, this.d, this.d, p5.PI + p5.PI/3 + p5.PI/3, p5.TWO_PI * 2);
            p5.arc(0,0, this.d, this.d, p5.PI, p5.PI + p5.PI/3);
            p5.stroke(0,160);
            p5.arc(0,0, this.d, this.d, 0, p5.PI);
            p5.arc(0,0, this.d, this.d, p5.PI + p5.PI/3, p5.PI + p5.PI/3 + p5.PI/3);

            let step = p5.TWO_PI / this.sequence.length;

            for( let i = 0; i< this.sequence.length; i++) {
                p5.push();
                p5.translate( p5.sin( step * i + this.counter) * this.r, p5.cos( step * i + this.counter) * this.r, 0 );
                p5.noStroke();
                if(this.sequence[i] == 0) {
                    //p5.fill(255,100);
                } else {
                    if( p5.sin( step * i + this.counter) > 0 ) {
                        if( this.triggers[i]==false) {
                            this.colors[i] = 255;
                            this.sphereSizes[i] = 12;
                            synths[this.id].triggerAttackRelease(Tone.Midi(notes[this.id]).toFrequency(), "32n");
                        }
                        this.triggers[i] = true;
                    } else {
                        this.triggers[i] = false;
                    }
                    p5.fill(this.colors[i],0,0,200);
                }
                p5.sphere(this.sphereSizes[i]);
                p5.pop();
                this.colors[i] -= 4;
                if(this.sphereSizes[i] > 3)this.sphereSizes[i] -= 1;
            }
            p5.pop();
            this.counter += this.speed;
        }
    }

    let r1, r2, r3, r4, r5, r6;

    let p = 12;
    let notes = [28 + p, 40 + p, 43 + p, 45 + p, 57 + p, 60 + p];

    var freeverb = new Tone.Freeverb().toMaster();
        freeverb.dampening.value = 600;
        freeverb.roomSize.value = 0.89;

    let synths = [];
    for(let i=0; i<6; i++) {
        synths.push( 

            new Tone.FMSynth({
                "harmonicity"  : 10 ,
                "modulationIndex"  : 80 ,
                "detune"  : 0 ,
                "oscillator"  : {
                    "type"  : "sine"
                }  ,
                "envelope"  : {
                    "attack"  : 0.03 ,
                    "decay"  : 0.05 ,
                    "sustain"  : 0.2 ,
                    "release"  : 1
                }  ,
                "modulation"  : {
                    "type"  : "square"
                }  ,
                "modulationEnvelope"  : {
                    "attack"  : 0.01 ,
                    "decay"  : 0.2 ,
                    "sustain"  : 0.3 ,
                    "release"  : 2
                }
            }));
        
    }

    for(let i=0; i<6; i++) {
        synths[i].connect(freeverb);
        synths[i].volume.value = -10;
    }

    p5.setup = () => {
        let canvas = p5.createCanvas(800, 800, p5.WEBGL);
        r1 = new Rotor( 0, 10, [ 1, 1, 0], 0 );
        r2 = new Rotor( 1, 10, [ 1, 1, 1, 1], 0, );
        r3 = new Rotor( 2, 10, [ 1, 0, 1, 0, 1, 1, 0], 0, );
        r4 = new Rotor( 3, 10, [ 1, 0, 1, 0, 1, 0, 1, 0], 0 );
        r5 = new Rotor( 4, 10, [ 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 0, 1, 0], 0 );
        r6 = new Rotor( 5, 10, [ 1, 0, 1, 1, 1, 0, 0, 0, 1, 1, 0, 1, 0, 0, 1, 1, 0, 1], 0 );
    }

    p5.draw = () => {
        p5.camera(0,0, 800, 0, 0, 0, 0, 1, 0);
        p5.background(240);
        p5.smooth();
        p5.rotateY(p5.radians(30));
        r1.draw();
        r2.draw();
        r3.draw();
        r4.draw();
        r5.draw();
        r6.draw();
    }
}
export default sketch;
new p5(sketch);