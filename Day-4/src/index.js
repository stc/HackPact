import p5 from 'p5/lib/p5.min';
import tone from 'tone';

const sketch = (p5) => {
	let ptick = 0;
	let index = 0;

	class Gate {
		constructor(pos, state) {
			this.pos = pos;
			this.state = state;
		}
		draw() {
			p5.noStroke();
			p5.push();
			p5.translate(this.pos.x,this.pos.y,this.pos.z);

			if(this.state == 0) {
				p5.fill(255);
			} else {
				p5.fill(0);
			}
			
			if(this.state == 0) {
				p5.fill(0);
			} else {
				p5.fill(255);
			}
			p5.box(6);
			p5.pop(); 
		}
	}

	class GateTree {
		constructor(tempo) {
			this.gates = [];
			this.addGates();
			this.index = 0;
			this.ptick = 0;
			this.tempo = tempo;
			this.fm = new tone.FMSynth({
				"harmonicity"  : 1 ,
				"modulationIndex"  : p5.random(10) + 2 ,
				"detune"  : 0 ,
				"oscillator"  : {
					"type"  : "sine"
				}  ,
				"envelope"  : {
					"attack"  : 0.003 ,
					"decay"  : 0.1 ,
					"sustain"  : 5 ,
					"release"  : 5
				}  ,
				"modulation"  : {
					"type"  : "square"
				}  ,
				"modulationEnvelope"  : {
					"attack"  : 0.2 ,
					"decay"  : 0.2 ,
					"sustain"  : 0.3 ,
					"release"  : 0.5
				}
			}).connect(freeverb);
		this.fm.volume.value = -40;
			
		}

		addGates() {
			this.gates.push( new Gate( p5.createVector(0, 0, 0), p5.floor(p5.random(2)) ) );
			this.gates.push( new Gate( p5.createVector(-50, 100, 0), p5.floor(p5.random(2)) ) );
			this.gates.push( new Gate( p5.createVector(50, 100, 0), p5.floor(p5.random(2)) ) );
			this.gates.push( new Gate( p5.createVector(-75, 200, 0), p5.floor(p5.random(2)) ) );
			this.gates.push( new Gate( p5.createVector(-25, 200, 0), p5.floor(p5.random(2)) ) );
			this.gates.push( new Gate( p5.createVector(25, 200, 0), p5.floor(p5.random(2)) ) );
			this.gates.push( new Gate( p5.createVector(75, 200, 0), p5.floor(p5.random(2)) ) );
			this.gates.push( new Gate( p5.createVector(-87, 300, 0), p5.floor(p5.random(2)) ) );
			this.gates.push( new Gate( p5.createVector(-62, 300, 0), p5.floor(p5.random(2)) ) );
			this.gates.push( new Gate( p5.createVector(-37, 300, 0), p5.floor(p5.random(2)) ) );
			this.gates.push( new Gate( p5.createVector(-12, 300, 0), p5.floor(p5.random(2)) ) );
			this.gates.push( new Gate( p5.createVector(12, 300, 0), p5.floor(p5.random(2)) ) );
			this.gates.push( new Gate( p5.createVector(37, 300, 0), p5.floor(p5.random(2)) ) );
			this.gates.push( new Gate( p5.createVector(62, 300, 0), p5.floor(p5.random(2)) ) );
			this.gates.push( new Gate( p5.createVector(87, 300, 0), p5.floor(p5.random(2)) ) );
		}

		drawArcs() {
			p5.stroke(0,120);
			for(let i=0; i<7; i++) {
				p5.line(this.gates[i].pos.x,this.gates[i].pos.y,this.gates[i].pos.z,this.gates[i + i + 1].pos.x,this.gates[i + i + 1].pos.y,this.gates[i + i + 1].pos.z);
				p5.line(this.gates[i].pos.x,this.gates[i].pos.y,this.gates[i].pos.z,this.gates[i + i + 2].pos.x,this.gates[i + i + 1].pos.y,this.gates[i + i + 1].pos.z);
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
			this.fm.triggerAttackRelease(tone.Midi(notes[this.index]).toFrequency(), "16n");
		}

		draw() {
			let tick = p5.floor(p5.millis()/this.tempo);
			if(this.ptick!=tick) {
				this.nextStep();
			}
			this.ptick = tick;
		
			p5.push();
			p5.rotateX(p5.PI/3);
			for(let i=0; i<this.gates.length; i++) {
				this.gates[i].draw();
			}
			this.drawArcs();

			p5.fill(255,0,0, this.ta);
			p5.noStroke();
			p5.translate(this.gates[this.index].pos.x, this.gates[this.index].pos.y, this.gates[this.index].pos.z);
			p5.box(7);
			p5.pop();

			this.ta -=10;
		}
	}

	let G1, G2;
	
	let pitch = 10;
	let notes = [ 38 + pitch, 40 + pitch, 43 + pitch, 45 + pitch, 47 + pitch, 50 + pitch, 52 + pitch,  
					55 + pitch, 57 + pitch, 59 + pitch, 62 + pitch, 65 + pitch, 69 + pitch, 71 + pitch, 74 + pitch ];

	var freeverb = new tone.Freeverb().toMaster();
		freeverb.dampening.value = 600;
		freeverb.roomSize.value = 0.9;

	

	p5.setup = () => {
		let canvas = p5.createCanvas(800,800, p5.WEBGL);
		p5.smooth();
		G1 = new GateTree(1000);
		G2 = new GateTree(666);
	}

	p5.draw = () => {
		//p5.camera(p5.millis()/100, -150, 400, 0, 0, 0, 0, 1, 0);
		p5.camera(p5.millis()/300 - 100, p5.millis()/400 - 100, 600, 0, 0, 0, 0, 1, 0);
		p5.background(240);
		
		G1.draw();
		p5.push();
		p5.rotateZ(400/100);
		G2.draw();
		p5.pop();
	}
}

export default sketch;
new p5(sketch);


