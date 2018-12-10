import p5 from 'p5/lib/p5.min';
import Tone from 'tone';

const sketch = (p) => {
    let hexacodes = [];
    let hexagrams = [];

    var vol = new Tone.Volume(-70).toMaster();
    var freeverb = new Tone.Freeverb().connect(vol);
    freeverb.dampening.value = 10000;
    freeverb.roomSize.value = 0.89;

    var vol2 = new Tone.Volume(-10).toMaster();
    let osc = new Tone.Oscillator(100, "sine").connect(vol2).start() 
    
    class Hexagram {
        constructor(index, temppivotX, temppivotY, templineWeight) {
            this.offSet = [];
            this.hexList = [];
            this.spacing;
            this.lineLength;

            this.pivotX = temppivotX;
            this.pivotY = temppivotY;
            this.lineWeight = templineWeight;
            this.spacing = this.lineWeight*4;

            this.sampler = new Tone.Sampler({
              "C3" : "data/k.wav"}).connect(freeverb).toMaster();

            this.sampler.volume.value = 10;

            this.osc = [];
            for (let i = 0; i < 6; i++) {
                this.hexList.push(hexacodes[index][i]);
                let rnd = p.random(-800,800);
                this.offSet.push( rnd );
                
                if(rnd>0) {

                  this.osc.push(new Tone.Oscillator((rnd) * 4, "sine").connect(freeverb).start() );
                  
                } else {
                  this.osc.push(new Tone.Oscillator(0, "triangle").connect(freeverb).start() );
                }
            }
        }

        myline(lineStartX, lineStartY, lineLength, broken) {
            if (broken == 0) {
                p.strokeWeight(3);
                p.line(lineStartX, lineStartY, lineStartX+lineLength, lineStartY);
            } 
            if (broken == 1) {
                p.strokeWeight(3);
                p.line (lineStartX, lineStartY, lineStartX+lineLength/2 - this.spacing, lineStartY);
                p.line (lineStartX+lineLength/2 + this.spacing, lineStartY, lineStartX+lineLength, lineStartY);
            }  
        }

        change() {
            for (let i = 0; i < this.hexList.length; i++) {
                this.hexList[i] = p.int(p.random(0, 2));
            }
        }

        display() {
            this.lineLength = (this.lineWeight*18) + (this.spacing*4);
            p.strokeWeight (this.lineWeight);
            p.stroke(255);
            for( let i = 0; i < 6; i ++ ) {
                p.push();
                p.translate(this.offSet[i],0,0);
                
                if(this.offSet[i]>=0.5) {
                  this.offSet[i]-=0.5;
                  if(this.offSet[i]>0)this.osc[i].frequency.rampTo((this.offSet[i]+4) * 10,0.01);
                  
                } else if(this.offSet[i] <= -0.5){
                  this.offSet[i]+=0.5;
                } else {
                  this.offSet[i] = 0;
                }

                this.myline(this.pivotX, this.pivotY + i * this.spacing, this.lineLength, this.hexList[i]);
                p.pop();
            }
        }
    }
    p.setup = () => {
        let canvas = p.createCanvas(800, 800, p.WEBGL);
        p.smooth();

        generateHexaCodes();
        generateHexagrams(60, 1);
    }
    
    p.draw = () => {
        p.camera(-100,-100, 550, 0, 0, 0, 0, 1, 0);
        p.background(0);  
        p.translate(-p.width/4, -p.height/3.5);  

        p.stroke(255,40);
        p.strokeWeight(1);
        p.line(-1000,40,1000,40);
        p.line(-1000,100,1000,100);
        p.line(-1000,160,1000,160);
        p.line(-1000,220,1000,220);
        p.line(-1000,280,1000,280);
        p.line(-1000,340,1000,340);
        p.line(-1000,400,1000,400);

        for(let i=0; i<hexagrams.length; i++) {
            hexagrams[i].display();
        }
    }

    function generateHexagrams(padding, lineWeight) {
        let index = 0;
        for ( let y=0; y<8; y++) {
            for ( let x=0; x<8; x++) {
                hexagrams.push(new Hexagram(index, x * padding, y * padding, lineWeight));
               index++;
            }
        }
    }

    p.mousePressed = () => {
        //for(let i=0; i<hexagrams.length; i++) {
          let rnd = p.floor(p.random(64));

            hexagrams[rnd].change();
            hexagrams[rnd].sampler.triggerAttack(p.random(10000) );
        //}
    }

    function generateHexaCodes() {
          let tmp = [6];
          tmp = [0, 0, 0, 0, 0, 0 ];
          hexacodes.push(tmp);
          tmp = [ 1, 1, 1, 1, 1, 1 ];
          hexacodes.push(tmp);
          tmp = [ 1, 0, 1, 1, 1, 0 ];
          hexacodes.push(tmp);
          tmp = [ 0, 1, 1, 1, 0, 1 ];
          hexacodes.push(tmp);
          tmp = [ 1, 0, 1, 0, 0, 0 ];
          hexacodes.push(tmp);
          tmp = [ 0, 0, 0, 1, 0, 1 ];
          hexacodes.push(tmp);
          tmp = [ 1, 1, 1, 1, 0, 1 ];
          hexacodes.push(tmp);
          tmp = [ 1, 0, 1, 1, 1, 1 ];
          hexacodes.push(tmp);
          tmp = [ 0, 0, 1, 0, 0, 0 ];
          hexacodes.push(tmp);
          tmp = [ 0, 0, 0, 1, 0, 0 ];
          hexacodes.push(tmp);
          tmp = [ 1, 1, 1, 0, 0, 0 ];
          hexacodes.push(tmp);
          tmp = [ 0, 0, 0, 1, 1, 1 ];
          hexacodes.push(tmp);
          tmp = [ 0, 0, 0, 0, 1, 0 ];
          hexacodes.push(tmp);
          tmp = [ 0, 1, 0, 0, 0, 0 ];
          hexacodes.push(tmp);
          tmp = [ 1, 1, 1, 0, 1, 1 ];
          hexacodes.push(tmp);
          tmp = [ 1, 1, 0, 1, 1, 1 ];
          hexacodes.push(tmp);
          tmp = [ 1, 0, 0, 1, 1, 0 ];
          hexacodes.push(tmp);
          tmp = [ 0, 1, 1, 0, 0, 1 ];
          hexacodes.push(tmp);
          tmp = [ 1, 1, 1, 1, 0, 0 ];
          hexacodes.push(tmp);
          tmp = [ 0, 0, 1, 1, 1, 1 ];
          hexacodes.push(tmp);
          tmp = [ 0, 1, 0, 1, 1, 0 ];
          hexacodes.push(tmp);
          tmp = [ 0, 1, 1, 0, 1, 0 ];
          hexacodes.push(tmp);
          tmp = [ 0, 1, 1, 1, 1, 1 ];
          hexacodes.push(tmp);
          tmp = [ 1, 1, 1, 1, 1, 0 ];
          hexacodes.push(tmp);
          tmp = [ 0, 0, 0, 1, 1, 0 ];
          hexacodes.push(tmp);
          tmp = [ 0, 1, 1, 0, 0, 0 ];
          hexacodes.push(tmp);
          tmp = [ 0, 1, 1, 1, 1, 0 ];
          hexacodes.push(tmp);
          tmp = [ 1, 0, 0, 0, 0, 1 ];
          hexacodes.push(tmp);
          tmp = [ 1, 0, 1, 1, 0, 1 ];
          hexacodes.push(tmp);
          tmp = [ 0, 1, 0, 0, 1, 0 ];
          hexacodes.push(tmp);
          tmp = [ 1, 0, 0, 0, 1, 1 ];
          hexacodes.push(tmp);
          tmp = [ 1, 1, 0, 0, 0, 1 ];
          hexacodes.push(tmp);
          tmp = [ 0, 0, 0, 0, 1, 1 ];
          hexacodes.push(tmp);
          tmp = [ 1, 1, 0, 0, 0, 0 ];
          hexacodes.push(tmp);
          tmp = [ 0, 1, 0, 1, 1, 1 ];
          hexacodes.push(tmp);
          tmp = [ 1, 1, 1, 0, 1, 0 ];
          hexacodes.push(tmp);
          tmp = [ 0, 0, 1, 0, 1, 0 ];
          hexacodes.push(tmp);
          tmp = [ 0, 1, 0, 1, 0, 0 ];
          hexacodes.push(tmp);
          tmp = [ 1, 0, 1, 0, 1, 1 ];
          hexacodes.push(tmp);
          tmp = [ 1, 1, 0, 1, 0, 1 ];
          hexacodes.push(tmp);
          //
          tmp = [ 0, 1, 1, 1, 0, 0 ];
          hexacodes.push(tmp);
          tmp = [ 0, 0, 1, 1, 1, 0 ];
          hexacodes.push(tmp);
          tmp = [ 1, 0, 0, 0, 0, 0 ];
          hexacodes.push(tmp);
          tmp = [ 0, 0, 0, 0, 0, 1 ];
          hexacodes.push(tmp);
          tmp = [ 1, 0, 0, 1, 1, 1 ];
          hexacodes.push(tmp);
          tmp = [ 1, 1, 1, 0, 0, 1 ];
          hexacodes.push(tmp);
          tmp = [ 1, 0, 0, 1, 0, 1 ];
          hexacodes.push(tmp);
          tmp = [ 1, 0, 1, 0, 0, 1 ];
          hexacodes.push(tmp);
          tmp = [ 1, 0, 0, 0, 1, 0 ];
          hexacodes.push(tmp);
          tmp = [ 0, 1, 0, 0, 0, 1 ];
          hexacodes.push(tmp);
          tmp = [ 1, 1, 0, 1, 1, 0 ];
          hexacodes.push(tmp);
          tmp = [ 0, 1, 1, 0, 1, 1 ];
          hexacodes.push(tmp);
          tmp = [ 0, 0, 1, 0, 1, 1 ];
          hexacodes.push(tmp);
          tmp = [ 1, 1, 0, 1, 0, 0 ];
          hexacodes.push(tmp);
          tmp = [ 1, 1, 0, 0, 1, 0 ];
          hexacodes.push(tmp);
          tmp = [ 0, 1, 0, 0, 1, 1 ];
          hexacodes.push(tmp);
          tmp = [ 0, 0, 1, 0, 0, 1 ];
          hexacodes.push(tmp);
          tmp = [ 1, 0, 0, 1, 0, 0 ];
          hexacodes.push(tmp);
          tmp = [ 0, 0, 1, 1, 0, 1 ];
          hexacodes.push(tmp);
          tmp = [ 1, 0, 1, 1, 0, 0 ];
          hexacodes.push(tmp);
          tmp = [ 0, 0, 1, 1, 0, 0 ];
          hexacodes.push(tmp);
          tmp = [ 1, 1, 0, 0, 1, 1 ];
          hexacodes.push(tmp);
          tmp = [ 1, 0, 1, 0, 1, 0 ];
          hexacodes.push(tmp);
          tmp = [ 0, 1, 0, 1, 0, 1 ];
          hexacodes.push(tmp);
        }
}
export default sketch;
new p5(sketch);