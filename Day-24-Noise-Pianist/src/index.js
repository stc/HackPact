import p5 from 'p5/lib/p5.min';
import Tone from 'tone';

const sketch = (p) => {
    let noiseScale=0.03;
    let n=0.00;
    let d=0.6; 

    let piano;

    let melody = [40 -12, 43 -12, 45 - 12, 47 -12, 49 -12, 52 - 12, 40, 43, 45, 47, 49, 52, 40 + 12, 43 + 12, 45 + 12, 49 + 12, 50 + 12, 52 + 12, 40 + 24, 43 + 24, 45 + 24, 49 + 24, 50 + 24, 52 + 24, 40 + 36, 43 + 36, 45 + 36, 47 + 36, 49 + 36, 52 + 36, 40 + 48, 43 + 48, 45 + 48, 47 + 48, 49 + 48, 52 + 48,40 + 60, 43 + 60, 45 + 60, 47 + 60, 49 + 48, 52 + 60]

    p.preload = () => {
        piano = new Tone.Sampler({
      'A0' : 'A0.[mp3|ogg]',
      'C1' : 'C1.[mp3|ogg]',
      'D#1' : 'Ds1.[mp3|ogg]',
      'F#1' : 'Fs1.[mp3|ogg]',
      'A1' : 'A1.[mp3|ogg]',
      'C2' : 'C2.[mp3|ogg]',
      'D#2' : 'Ds2.[mp3|ogg]',
      'F#2' : 'Fs2.[mp3|ogg]',
      'A2' : 'A2.[mp3|ogg]',
      'C3' : 'C3.[mp3|ogg]',
      'D#3' : 'Ds3.[mp3|ogg]',
      'F#3' : 'Fs3.[mp3|ogg]',
      'A3' : 'A3.[mp3|ogg]',
      'C4' : 'C4.[mp3|ogg]',
      'D#4' : 'Ds4.[mp3|ogg]',
      'F#4' : 'Fs4.[mp3|ogg]',
      'A4' : 'A4.[mp3|ogg]',
      'C5' : 'C5.[mp3|ogg]',
      'D#5' : 'Ds5.[mp3|ogg]',
      'F#5' : 'Fs5.[mp3|ogg]',
      'A5' : 'A5.[mp3|ogg]',
      'C6' : 'C6.[mp3|ogg]',
      'D#6' : 'Ds6.[mp3|ogg]',
      'F#6' : 'Fs6.[mp3|ogg]',
      'A6' : 'A6.[mp3|ogg]',
      'C7' : 'C7.[mp3|ogg]',
      'D#7' : 'Ds7.[mp3|ogg]',
      'F#7' : 'Fs7.[mp3|ogg]',
      'A7' : 'A7.[mp3|ogg]',
      'C8' : 'C8.[mp3|ogg]'
    }, {
      'release' : 1,
      'baseUrl' : './sounds/'
    }).toMaster();
    }
    
    let val1, val2 = 0;
    let loaded = false;
    let alpha = 0;
    p.setup = () => {
        let canvas = p.createCanvas(800, 800, p.WEBGL);
        
    }
    let ptick = 0;
    let ptick2 = 0;
    p.draw = () => {
        p.camera(0,0, 800, 0, 0, 0, 0, 1, 0);
        p.background(240);
        //p.smooth();

        p.stroke(255);
        p.line(0,-3000,0,1000);

        p.translate(-p.width/2, p.height/4,0);
        p.rotateX(p.PI);
        
        n=n+d;
        for (let y=0; y<20; y++) {
            for(let x=0; x<200; x++) { 
                let noiseVal = p.noise((n+x)*noiseScale,(-n+y)*noiseScale,y*noiseScale); 
                p.noStroke();
                p.fill((noiseVal*50)); 
                if(x==100) {
                    p.fill(255,0,0);
                    if(y==0) {
                        val1 = noiseVal;
                    }
                    if(y==19) {
                        val2 = noiseVal;
                    }
                }
                p.push();
                p.translate(x*4,noiseVal*400);
                p.sphere(1);
                p.pop();
            } 
        }
        alpha-=100;

        p.push();
                
                p.translate(100*4,val1*400);
                p.fill(255,0,0,alpha);
                p.sphere(5);
                p.pop();

        p.push();
                
                p.translate(100*4,val2*400);
                p.sphere(5);
                p.pop();

        if(loaded) {
            let tick = p.floor(p.millis()/300);
            if(ptick!=tick) {
                let rnd = p.random(2);
                if(rnd > 0.5) {
                    alpha = 255;
                    piano.triggerAttackRelease(Tone.Midi(melody[p.ceil(val1*42)] + 6).toFrequency(),"132n");
                    piano.triggerAttackRelease(Tone.Midi(melody[p.ceil(val2*42)] + 6).toFrequency(),"132n");
                    
                }
            }
            ptick = tick;

            let tick2 = p.floor(p.millis()/400);
            if(ptick2!=tick2) {
                let rnd = p.random(2);
                if(rnd > 0.6) {
                    alpha = 255;
                    piano.triggerAttackRelease(Tone.Midi(melody[p.ceil(val2*42)] + 6).toFrequency(),"64n");
                    //piano.triggerAttackRelease(Tone.Midi(p.floor(val2*100) + 30).toFrequency(),"128n");  
                }
            }
            ptick2 = tick2;

                            
        }
    }

    p.keyPressed = () => {
        loaded = true;
    }
}
export default sketch;
new p5(sketch);