import p5 from 'p5/lib/p5.min';
import Tone from 'tone';

const sketch = (p) => {
    class Pendulum {
        constructor(id, x,y,z,param) {
            this.r1 = 100;
            this.r2 = 100;
            this.m1 = 10;
            this.m2 = 10;
            this.a1 = 0;
            this.a2 = 0;
            this.a1_v = 0;
            this.a2_v = 0;
            this.g = param;
            this.px2 = -1;
            this.py2 = -1;
            this.cx = x;
            this.cy = y;
            this.cz = z;
            this.id = id;
            
            this.init();
            this.vol = new Tone.Volume(-500);
            this.osc = new Tone.Oscillator(Tone.Midi(id + 66).toFrequency(), "sine").chain(this.vol, Tone.Master).start();
        }
        init() {
            this.a1 = p.PI / 2;
            this.a2 = p.PI / 2;
            this.buffer = p.createGraphics(p.width, p.height);
            this.buffer.translate(this.cx, this.cy);
        }
        draw() {
            p.imageMode(p.CORNER);
            p.texture(this.buffer);
            
            p.push();
            p.rotateY(p.radians(90));
            p.push();
            p.rotateZ(p.radians(-90));
            p.pop();
            let num1 = -this.g * (2 * this.m1 + this.m2) * p.sin(this.a1);
            let num2 = -this.m2 * this.g * p.sin(this.a1 - 2 * this.a2);
            let num3 = -2 * p.sin(this.a1 - this.a2) * this.m2;
            let num4 = this.a2_v * this.a2_v * this.r2 + this.a1_v * this.a1_v * this.r1 * p.cos(this.a1 - this.a2);
            let den = this.r1 * (2 *this.m1 + this.m2 - this.m2 * p.cos(2 * this.a1 - 2 * this.a2));
            let a1_a = (num1 + num2 + num3 * num4) / den;
            
            num1 = 2 * p.sin(this.a1 - this.a2);
            num2 = (this.a1_v * this.a1_v * this.r1 * (this.m1 + this.m2));
            num3 = this.g * (this.m1 + this.m2) * p.cos(this.a1);
            num4 = this.a2_v * this.a2_v * this.r2 * this.m2 * p.cos(this.a1 - this.a2);
            den = this.r2 * (2 * this.m1 + this.m2 - this.m2 * p.cos(2 * this.a1 - 2 * this.a2));
            let a2_a = (num1 * (num2 + num3 + num4)) / den;
            
            p.translate(this.cx, this.cy);
            p.stroke(0,100);
            p.strokeWeight(2);
            
            let x1 = this.r1 * p.sin(this.a1);
            let y1 = this.r1 * p.cos(this.a1);
            
            let x2 = x1 + this.r2 * p.sin(this.a2);
            let y2 = y1 + this.r2 * p.cos(this.a2);

            this.x2 = x2;
            this.y2 = y2;

            this.buffer.strokeWeight(2);
            this.buffer.stroke(0,40);
            if (p.frameCount > 1) {
              this.buffer.line(this.px2+400, -this.py2+400, x2+400, -y2+400);
            }
            
            p.fill(0);
            p.push();
            p.translate(x1,y1,this.cz);
            p.sphere(this.m1/2);
            p.pop();

            p.line(0,0,this.cz,x1, y1, this.cz);
            p.line(x1, y1, this.cz, x2, y2, this.cz);

            p.push();
            p.translate(0,0,this.cz);
            p.fill(255,100);
            p.stroke(0,120);
            p.ellipse(0,0,30,30);
            p.pop();
            
            p.fill(0);
            p.push();
            p.translate(x2,y2,this.cz);
            p.sphere(this.m2/2);

            p.pop();
            
            this.a1_v += a1_a;
            this.a2_v += a2_a;
            this.a1 += this.a1_v;
            this.a2 += this.a2_v;
            
            this.px2 = x2;
            this.py2 = y2;

            p.pop();

            let distance = p.constrain( p.dist( this.x2,this.y2, this.cx, this.cy), 0, 400 ) ;
            if(!isNaN(distance)) this.vol.volume.rampTo(  p.map( distance, 0, 400, -120, -18 ), 0.01 );
        }
    }

    let pendulums1 = [];
    let pendulums2 = [];

    p.setup = () => {
        let canvas = p.createCanvas(800, 800, p.WEBGL);
        
        for(let i=0; i<12; i++) {
            pendulums1.push( new Pendulum(i,0,-200,i * 100 - 300, 1 - i/1.5/100000) );
            pendulums2.push( new Pendulum(i+12,0,100,i * 100 - 300, 1 - (i/2/100000)) );
        }

    }

    p.draw = () => {
        p.camera(-800 + p.mouseX,0, -600, 0, 0, 0, 0, 1, 0);
        p.background(240);
        p.smooth();

        p.stroke(0,30);
        p.line(-3000,-200,0,3000,-200,0);
        p.line(-3000,100,0,3000,100,0);
        for( let i=0; i< pendulums1.length; i++ ) {
            pendulums1[i].draw();
            pendulums2[i].draw();
        }
    }
}
export default sketch;
new p5(sketch);