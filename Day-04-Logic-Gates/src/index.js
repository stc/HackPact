import p5 from 'p5/lib/p5.min';
import Tone from 'tone';

const sketch = (p) => {
	let ptick = 0;
	let index = 0;

	class Gate {
		constructor(pos, state) {
			this.pos = pos;
			this.state = state;
		}
		draw() {
			p.noStroke();
			p.push();
			p.translate(this.pos.x,this.pos.y,this.pos.z);

			if(this.state == 0) {
				p.fill(255);
			} else {
				p.fill(0);
			}
			
			if(this.state == 0) {
				p.fill(80);
			} else {
				p.fill(255);
			}
			p.box(6);
			p.pop(); 
		}
	}

	class GateTree {
		constructor(tempo) {
			this.gates = [];
			this.addGates();
			this.index = 0;
			this.ptick = 0;
			this.tempo = tempo;
			this.fm = new Tone.FMSynth({
				"harmonicity"  : 4 ,
				"modulationIndex"  : p.random(10) + 2 ,
				"detune"  : 0 ,
				"oscillator"  : {
					"type"  : "sine"
				}  ,
				"envelope"  : {
					"attack"  : 0.003 ,
					"decay"  : 0.1 ,
					"sustain"  : 2 ,
					"release"  : 5
				}  ,
				"modulation"  : {
					"type"  : "square"
				}  ,
				"modulationEnvelope"  : {
					"attack"  : 0.02 ,
					"decay"  : 0.08 ,
					"sustain"  : 0.3 ,
					"release"  : 0.5
				}
			}).connect(freeverb);
		this.fm.volume.value = -25;
			
		}

		addGates() {
			this.gates.push( new Gate( p.createVector(0, 0, 0), p.floor(p.random(2)) ) );
			this.gates.push( new Gate( p.createVector(-50, 100, 0), p.floor(p.random(2)) ) );
			this.gates.push( new Gate( p.createVector(50, 100, 0), p.floor(p.random(2)) ) );
			this.gates.push( new Gate( p.createVector(-75, 200, 0), p.floor(p.random(2)) ) );
			this.gates.push( new Gate( p.createVector(-25, 200, 0), p.floor(p.random(2)) ) );
			this.gates.push( new Gate( p.createVector(25, 200, 0), p.floor(p.random(2)) ) );
			this.gates.push( new Gate( p.createVector(75, 200, 0), p.floor(p.random(2)) ) );
			this.gates.push( new Gate( p.createVector(-87, 300, 0), p.floor(p.random(2)) ) );
			this.gates.push( new Gate( p.createVector(-62, 300, 0), p.floor(p.random(2)) ) );
			this.gates.push( new Gate( p.createVector(-37, 300, 0), p.floor(p.random(2)) ) );
			this.gates.push( new Gate( p.createVector(-12, 300, 0), p.floor(p.random(2)) ) );
			this.gates.push( new Gate( p.createVector(12, 300, 0), p.floor(p.random(2)) ) );
			this.gates.push( new Gate( p.createVector(37, 300, 0), p.floor(p.random(2)) ) );
			this.gates.push( new Gate( p.createVector(62, 300, 0), p.floor(p.random(2)) ) );
			this.gates.push( new Gate( p.createVector(87, 300, 0), p.floor(p.random(2)) ) );
		}

		drawArcs() {
			p.stroke(255,120);
			for(let i=0; i<7; i++) {
				p.line(this.gates[i].pos.x,this.gates[i].pos.y,this.gates[i].pos.z,this.gates[i + i + 1].pos.x,this.gates[i + i + 1].pos.y,this.gates[i + i + 1].pos.z);
				p.line(this.gates[i].pos.x,this.gates[i].pos.y,this.gates[i].pos.z,this.gates[i + i + 2].pos.x,this.gates[i + i + 1].pos.y,this.gates[i + i + 1].pos.z);
			}
		}
		

		nextStep() {
			this.ta = 255;
			if(this.gates[this.index].state == 0) {
				this.index = this.index + this.index + 1;
			} else if(this.gates[this.index].state == 1) {
				this.index = this.index + this.index + 2;
			}
			if(this.index > 14) {
				this.gates = [];
				this.addGates();
				this.index= 0;
			}
			this.fm.triggerAttackRelease(Tone.Midi(notes[this.index]).toFrequency(), "16n");
		}

		draw() {
			let tick = p.floor(p.millis()/this.tempo);
			if(this.ptick!=tick) {
				this.nextStep();
			}
			this.ptick = tick;
		
			p.push();
			p.rotateX(p.PI/3);
			for(let i=0; i<this.gates.length; i++) {
				if(i>0)this.gates[i].draw();
			}
			this.drawArcs();

			p.fill(255,0,0, this.ta);
			p.noStroke();
			p.translate(this.gates[this.index].pos.x, this.gates[this.index].pos.y, this.gates[this.index].pos.z);
			p.box(7);
			p.pop();

			this.ta -=10;
		}
	}

	let G1, G2;
	
	let pitch = 10;
	let notes = [ 38 + pitch, 40 + pitch, 43 + pitch, 45 + pitch, 47 + pitch, 50 + pitch, 52 + pitch,  
					55 + pitch, 57 + pitch, 59 + pitch, 62 + pitch, 65 + pitch, 69 + pitch, 71 + pitch, 74 + pitch ];

	var freeverb = new Tone.Freeverb().toMaster();
		freeverb.dampening.value = 600;
		freeverb.roomSize.value = 0.9;

	

	p.setup = () => {
		let canvas = p.createCanvas(800,800, p.WEBGL);
		p.smooth();
		G1 = new GateTree(900);
		G2 = new GateTree(566);
	}

	p.draw = () => {
		p.camera(p.mouseX - 100, p.mouseY - 100, 600, 0, 0, 0, 0, 1, 0);
		p.background(0);
		
		G1.draw();
		p.push();
		p.rotateZ(400/100);
		G2.draw();
		p.pop();

		p.noStroke();
		p.fill(0,10);
		p.sphere(20)
		p.fill(0,20);
		p.sphere(8)
	}

	p.keyPressed = () => {
		if(p.key == 'm') {
			p.save(Date.now() + ".jpg");
		}
	}
}

export default sketch;
new p5(sketch);


