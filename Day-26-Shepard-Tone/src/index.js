import p5 from 'p5/lib/p5.min';
import Tone from 'tone';
const sketch = (p) => {
    let context = new AudioContext();

    var oscAmt = 30; 
    var freqX = [4000 * 2]; 
    var lowestFreq = 50; 
    var highestFreq = 16000; 
    var gainVal = 0.02; 

    var comp1 = context.createDynamicsCompressor(); 
    var analyser = context.createAnalyser(); 

    var osc = []; 
    var gain = []; 
    for (let i = 1; i <= oscAmt; i++) {
      osc[i] = context.createOscillator(); 
      osc[i].type = 'sine'; 
      freqX[i] = freqX[i - 1] / 2; 
      osc[i].frequency.value = freqX[i]; 

      gain[i] = context.createGain(); 
      gain[i].gain.value = 0; 
    }

    p.setup = () => {
        let canvas = p.createCanvas(800, 800, p.WEBGL);
        p.smooth();
        for (let i = 1; i <= oscAmt; i++) {
      osc[i].start(0); 
    }
    }
    let counters = [];
    for(let i = 0; i< 50; i++) {
        counters.push(-i * 10);
    }
    p.draw = () => {
        p.frameRate(60);
        p.camera(0,0, 600, 0, 0, 0, 0, 1, 0);
        p.background(240);

        for (let i = 1; i <= oscAmt; i++) {

        if (freqX[i] < 20) {
          freqX[i] = 20000;
        } else {
          freqX[i] = freqX[i] - (freqX[i] / 1024); 
        }

        osc[i].frequency.value = freqX[i]; 

        if (freqX[i] > lowestFreq) {
          gain[i].gain.value = gainVal; 
        }
        if (freqX[i] > highestFreq) {
          gain[i].gain.value = 0; 
        }
        

        osc[i].connect(gain[i]); 

        gain[i].connect(comp1); 
        comp1.connect(analyser);
        analyser.connect(context.destination); 
      }

      
      for(let i=0; i<36; i++) {
        p.push();
        p.stroke(0,180 - p.dist(counters[i],0,0,0));
        p.line(p.sin(p.frameCount / 200 + counters[i]/100) * 150, counters[i], p.cos(p.frameCount / 200 + counters[i]/100) * 150,
            0, counters[i], 0);
        p.noStroke();
        p.fill(0,180 - p.dist(counters[i],0,0,0));
        p.push();
        p.translate(0, counters[i], 0);
        p.sphere(2);
        p.pop();
        
        p.translate(p.sin(p.frameCount / 200 + counters[i]/100) * 150, counters[i], p.cos(p.frameCount / 200 + counters[i]/100) * 150);

        p.sphere(3);
        p.pop();
        counters[i]+=0.5;
        if(counters[i]>180) counters[i] = -180;
      }
      
      

      
    }
}
export default sketch;
new p5(sketch);