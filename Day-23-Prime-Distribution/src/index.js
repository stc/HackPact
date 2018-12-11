import p5 from 'p5/lib/p5.min';
import Tone from 'tone';

const sketch = (p) => {
    let primeNumbers = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97, 101, 103, 107, 109, 113, 127, 131, 137, 139, 149, 151, 157, 163, 167, 173, 179, 181, 191, 193, 197, 199, 211, 223, 227, 229, 233, 239, 241, 251, 257, 263, 269, 271, 277, 281, 283, 293, 307, 311, 313, 317, 331, 337, 347, 349, 353, 359, 367, 373, 379, 383, 389, 397, 401, 409, 419, 421, 431, 433, 439, 443, 449, 457, 461, 463, 467, 479, 487, 491, 499, 503, 509, 521, 523, 541];
    
    var chorus = new Tone.Chorus(0.8, 2.5, 0.2).toMaster();

    class Prime {
        constructor(num, id) {
            this.num = num;
            this.id = id;
            this.counter = 0;
            this.alpha = 0;
            this.lifetime = 0;

            this.fm = new Tone.FMSynth({
                "harmonicity"  : 10 ,
                "modulationIndex"  : 80 ,
                "detune"  : 0 ,
                "oscillator"  : {
                    "type"  : "sine"
                }  ,
                "envelope"  : {
                    "attack"  : 0.001 ,
                    "decay"  : 0.003 ,
                    "sustain"  : 0.06 ,
                    "release"  : 0.3
                }  ,
                "modulation"  : {
                    "type"  : "square"
                }  ,
                "modulationEnvelope"  : {
                    "attack"  : 0.01 ,
                    "decay"  : 0.02 ,
                    "sustain"  : 0.03 ,
                    "release"  : 0.033
                },
                "portamento" : 0.01 
            }).connect(chorus);

            this.fm.volume.value = -6;
        }
        draw() {
            p.push();
            p.stroke(255,140);
            p.line(0,this.id * 8,0,this.num,this.id * 8,0);
            p.translate(0,this.id * 8,0);
            //p.stroke(0);
            p.noStroke();
            p.fill(255,180);
            p.sphere(3);
            p.translate(this.num,0,0);
            p.sphere(3);
            p.fill(255,0,0,this.alpha);
            p.sphere(5);
            p.pop();

            if(this.lifetime<10) {
                p.push();
                p.fill(255,180);
                p.translate(this.counter,this.id * 8, 0);
                p.sphere(3);
                p.pop();

                this.counter++;
                
            }

            this.alpha -= 10;

            if(this.counter > this.num) {
                this.counter = 0;
                this.alpha = 255;
                this.lifetime++;
                // trigger sound here
                this.fm.triggerAttackRelease( Tone.Midi( (541 - this.num)/10 + 60 ).toFrequency(), "128n" );
            }
        }
    }

    let primes = [];
    p.setup = () => {
        let canvas = p.createCanvas(800, 800, p.WEBGL);
        for(let i=0; i<primeNumbers.length; i++) {
            primes.push( new Prime(primeNumbers[i], i) );
        }  
    }

    p.draw = () => {
        p.camera(p.mouseX - p.width/2,0, 800, 0, 0, 0, 0, 1, 0);
        p.background(0);
        p.smooth();

        p.translate(-p.width/2, p.height/6,0);
        
        p.rotateZ(-p.HALF_PI);
        //p.rotateY(p.frameCount/1000);
        for(let i=0; i<primes.length; i++) {
            p.rotateY(p.radians(i/100));
            primes[i].draw();
        }
    }

    p.keyPressed = () => {
        if(p.key == 'm') {
            p.save(Date.now() + ".jpg");
        }
    }
}
export default sketch;
new p5(sketch);