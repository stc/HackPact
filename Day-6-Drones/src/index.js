import p5 from 'p5/lib/p5.min';
import tone from 'tone';

const sketch = (p5) => {
	class Drone {
		constructor() {
			this.h = 0;
		}
		draw() {
			let _width = 1000;
			let _height = 200;
			let w = _width/600.0;
			 
  			p5.push();
	
  			p5.translate(-500,-200,0);
	
  			for (let i=0; i<600; i+=8) {
  				let l = 50*p5.sin(p5.radians(i-this.h));
    			let r =  4*p5.sin(p5.radians(i+this.h));
    			let p =  4*p5.sin(p5.PI/4+p5.radians(i-this.h));
    			p5.stroke(0, 60); 
    			p5.line(i*w, 0, i*w, _height/2+l);
    			p5.noStroke();
    			p5.fill(60);
    			p5.push();
    			p5.translate(i*w, _height/2+l,0);
    			p5.box(r/2);
    			p5.pop();
    			p5.stroke(0,60);
    			p5.line(i*w+5, _height, i*w+5, _height/2-l); 
    			p5.noStroke();
    			p5.fill(60);
    			p5.push();
    			p5.translate(i*w+5, _height/2-l,0);
    			p5.box(p/2);
    			p5.pop();
  			}
  			p5.pop();
  		this.h+=0.1;
		}
	}


	let field;
	
	let NODES = 16;

	tone.Master.volume.value = -25;
	let oscillators = {};
	let fundamental = 32;
	let reverb = new tone.JCReverb().toMaster();

	function makeOscillators(type) {
  		for (var i = 1; i <= NODES; i++) {
    		var panner = new tone.Panner(Math.random() * 1 - .5).toMaster();
    		var reverb = new tone.JCReverb(0.7).connect(panner)
    		oscillators['node' + i] = new tone.FMOscillator({
      		frequency: fundamental * i,
      		type: type,
      		modulationType: "sine",
      		harmonicity: 1,
      		modulationIndex: 1.5,
      		volume: -i * 4
    	}).connect(reverb).start();
  		}
	}
	
	p5.setup = () => {
		let canvas = p5.createCanvas(800,800, p5.WEBGL);
		p5.smooth();
		field = new Drone();
		makeOscillators('sine');
	}

	p5.draw = () => {
		p5.frameRate(60);
		p5.camera(p5.frameCount/10 - 100, -100, 600, 0, 0, 0, 0, 1, 0);
		p5.background(240);
		p5.fill(255,100);
		p5.noStroke();
		p5.rect(-2000,-2000,4000,1960);
		p5.rect(-2000,-1000,4000,800);
		p5.push();
		p5.rotateX(p5.radians(90));
		field.draw();
		p5.pop();
		p5.push();
		p5.rotateX(-p5.radians(90));
		field.draw();
		p5.translate(0,-200,0);
		field.draw();
		p5.pop();
	}
}

export default sketch;
new p5(sketch);


