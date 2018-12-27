import p5 from 'p5/lib/p5.min';
import Tone from 'tone';
import StartAudioContext from 'startaudiocontext';


const sketch = (p) => {
	class Drone {
		constructor() {
			this.h = 0;
		}
		draw() {
			let _width = 1000;
			let _height = 200;
			let w = _width/600.0;
			 
  			p.push();
	
  			p.translate(-500,-200,0);
	
  			for (let i=0; i<600; i+=8) {
  				let l = 50*p.sin(p.radians(i-this.h));
    			let r =  4*p.sin(p.radians(i+this.h));
    			let po =  4*p.sin(p.PI/4+p.radians(i-this.h));
    			p.stroke(255, 60); 
    			p.line(i*w, 0, i*w, _height/2+l);
    			p.noStroke();
    			p.fill(160);
    			p.push();
    			p.translate(i*w, _height/2+l,0);
    			p.box(r/2);
    			p.pop();
    			p.stroke(100,60);
    			p.line(i*w+5, _height, i*w+5, _height/2-l); 
    			p.noStroke();
    			p.fill(160);
    			p.push();
    			p.translate(i*w+5, _height/2-l,0);
    			p.box(po/2);
    			p.pop();
  			}
  			p.pop();
  		this.h+=0.1;
		}
	}

	let field;	
	let NODES = 16;

	Tone.Master.volume.value = -25;
	let oscillators = {};
	let fundamental = 32;
	let reverb = new Tone.JCReverb().toMaster();

	function makeOscillators(type) {
  		for (var i = 1; i <= NODES; i++) {
    		var panner = new Tone.Panner(Math.random() * 1 - .5).toMaster();
    		var reverb = new Tone.JCReverb(0.7).connect(panner)
    		oscillators['node' + i] = new Tone.FMOscillator({
      		frequency: fundamental * i,
      		type: type,
      		modulationType: "sine",
      		harmonicity: 1,
      		modulationIndex: 1.5,
      		volume: -i * 4
    	}).connect(reverb).start();
  		}
	}
	
	p.setup = () => {
		let canvas = p.createCanvas(800,800, p.WEBGL);
		p.smooth();
		field = new Drone();
		makeOscillators('sine');
	}

	p.draw = () => {
		p.frameRate(60);
		p.camera(100, -100, 600, 0, 0, 0, 0, 1, 0);
		p.background(0);
		p.fill(255,100);
		p.noStroke();
		p.rect(-2000,-2000,4000,1960);
		p.rect(-2000,-1000,4000,800);
		p.push();
		p.rotateX(p.radians(90));
		field.draw();
		p.pop();
		p.push();
		p.rotateX(-p.radians(90));
		field.draw();
		p.translate(0,-200,0);
		field.draw();
		p.pop();
	}

	p.keyPressed = () => {
		if(p.key == 'm') {
			p.save(Date.now() + ".jpg");
		}
	}
	p.mousePressed = () => {
		StartAudioContext(Tone.context).then(function(){});
	}
}

export default sketch;
new p5(sketch);


