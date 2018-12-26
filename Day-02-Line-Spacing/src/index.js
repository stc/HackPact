import p5 from 'p5/lib/p5.min';
import Tone from 'tone';
import StartAudioContext from 'startaudiocontext';

const sketch = (p) => {	
	class Sequence {
		constructor(mySynth, yoffset, rate, pitch) {
			this.index = 1;
			this.pindex = 0;
			this.num = 7;
			this.p1 = [];
			this.alpha = 0;
			this.yoffset = yoffset;
			this.rate = rate;
			this.notes = [ 38 + pitch, 40 + pitch, 43 + pitch, 45 + pitch, 47 + pitch, 50 + pitch, 52 + pitch ];
			for(let i=0; i< this.num; i++) {
				let v = p.createVector(i * 10, p.random(-50,50), -p.random(-50,50));
				this.p1.push(v);
			}
			this.startPos = this.p1[0].copy();
			this.tpos = p.createVector(this.p1[this.index].x, this.p1[this.index].y + this.yoffset, this.p1[this.index].z);
			this.synth = mySynth;
		}

		draw() {
			for(let i=0; i<this.num; i++) {
				p.push();
				p.translate(this.p1[i].x, this.p1[i].y + this.yoffset, this.p1[i].z);
				p.fill(255);
				p.noStroke();
				p.sphere(2);	
				p.pop();
				if(i<this.num-1) {
					p.stroke(255,100);
					p.line(this.p1[i].x, this.p1[i].y + this.yoffset, this.p1[i].z,this.p1[i+1].x, this.p1[i+1].y + this.yoffset, this.p1[i+1].z)
				}
			}
		
			p.noStroke();
			p.fill(255,0,0,this.alpha);
			p.push();
			if(this.index>0) {
				p.translate( this.startPos.lerp(this.tpos, this.rate ) );

			} else {
				p.translate( this.startPos.lerp(this.tpos, 1 ) );
			}
			p.sphere(3);
			p.pop();

			if( p.dist(this.startPos.x,this.startPos.y + this.yoffset,this.tpos.x,this.tpos.y + this.yoffset) < 1 ) {
				this.index++;
				if(this.index>this.num-1) this.index = 0;
				this.tpos = p.createVector(this.p1[this.index].x, this.p1[this.index].y + this.yoffset, this.p1[this.index].z);
			}

			if(this.pindex != this.index) {
				console.log("play " + this.index);
				if(this.index !=undefined) {
					this.synth.triggerAttackRelease(Tone.Midi(this.notes[p.floor(p.random(this.num))]).toFrequency(), "4n");
					this.alpha = 255;
				}
			}
			this.pindex = this.index;
			this.alpha -= 2;
		}
	}

	let s1, s2, s3;

	p.setup = () => {
		let canvas = p.createCanvas(800,800, p.WEBGL);

		var freeverb = new Tone.Freeverb().toMaster();
		freeverb.dampening.value = 600;
		freeverb.roomSize.value = 0.99;
		
		let fm1 = new Tone.FMSynth({
				"harmonicity"  : 1 ,
				"modulationIndex"  : 2 ,
				"detune"  : 0 ,
				"oscillator"  : {
					"type"  : "sine"
				}  ,
				"envelope"  : {
					"attack"  : 0.03 ,
					"decay"  : 1 ,
					"sustain"  : 10 ,
					"release"  : 5
				}  ,
				"modulation"  : {
					"type"  : "square"
				}  ,
				"modulationEnvelope"  : {
					"attack"  : 0.2 ,
					"decay"  : 0.2 ,
					"sustain"  : 1 ,
					"release"  : 0.5
				}
			}).connect(freeverb);
		fm1.volume.value = -40;
		
		s1 = new Sequence(fm1, 0, 0.01, 0);

		let fm2 = new Tone.FMSynth({
				"harmonicity"  : 30 ,
				"modulationIndex"  : 22 ,
				"detune"  : 0 ,
				"oscillator"  : {
					"type"  : "sine"
				}  ,
				"envelope"  : {
					"attack"  : 0.003 ,
					"decay"  : 0.03 ,
					"sustain"  : 0.03 ,
					"release"  : 1
				}  ,
				"modulation"  : {
					"type"  : "square"
				}  ,
				"modulationEnvelope"  : {
					"attack"  : 0.01 ,
					"decay"  : 0.2 ,
					"sustain"  : 0.1 ,
					"release"  : 1
				}
			}).toMaster();

		s2 = new Sequence(fm2, -100, 0.05, 12);

		let fm3 = new Tone.FMSynth({
				"harmonicity"  : 10 ,
				"modulationIndex"  : 2 ,
				"detune"  : 0 ,
				"oscillator"  : {
					"type"  : "square"
				}  ,
				"envelope"  : {
					"attack"  : 0.001 ,
					"decay"  : 0.02 ,
					"sustain"  : 0.03 ,
					"release"  : 2
				}  ,
				"modulation"  : {
					"type"  : "square"
				}  ,
				"modulationEnvelope"  : {
					"attack"  : 0.01 ,
					"decay"  : 0.2 ,
					"sustain"  : 0.1 ,
					"release"  : 1
				}
			}).toMaster();

		s3 = new Sequence(fm3, 100, 0.03, 24);
	}

	p.draw = () => {
		p.camera(0, 0, 400, 0, 0, 0, 0, 1, 0);
		p.background(0);
		p.rotateY(p.frameCount/600);
		s1.draw();
		s2.draw();
		s3.draw();
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


