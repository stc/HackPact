import p5 from 'p5/lib/p5.min';
import tone from 'tone';

const sketch = (p5) => {	
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
				let v = p5.createVector(i * 10, p5.random(-50,50), -p5.random(-50,50));
				this.p1.push(v);
			}
			this.startPos = this.p1[0].copy();
			this.tpos = p5.createVector(this.p1[this.index].x, this.p1[this.index].y + this.yoffset, this.p1[this.index].z);
			this.synth = mySynth;
		}

		draw() {
			for(let i=0; i<this.num; i++) {
				p5.push();
				p5.translate(this.p1[i].x, this.p1[i].y + this.yoffset, this.p1[i].z);
				p5.fill(0);
				p5.noStroke();
				p5.sphere(2);	
				p5.pop();
				if(i<this.num-1) {
					p5.stroke(0,100);
					p5.line(this.p1[i].x, this.p1[i].y + this.yoffset, this.p1[i].z,this.p1[i+1].x, this.p1[i+1].y + this.yoffset, this.p1[i+1].z)
				}
			}
		
			p5.noStroke();
			p5.fill(255,0,0,this.alpha);
			p5.push();
			if(this.index>0) {
				p5.translate( this.startPos.lerp(this.tpos, this.rate ) );

			} else {
				p5.translate( this.startPos.lerp(this.tpos, 1 ) );
			}
			p5.sphere(3);
			p5.pop();

			if( p5.dist(this.startPos.x,this.startPos.y + this.yoffset,this.tpos.x,this.tpos.y + this.yoffset) < 1 ) {
				this.index++;
				if(this.index>this.num-1) this.index = 0;
				this.tpos = p5.createVector(this.p1[this.index].x, this.p1[this.index].y + this.yoffset, this.p1[this.index].z);
			}

			if(this.pindex != this.index) {
				console.log("play " + this.index);
				if(this.index !=undefined) {
					this.synth.triggerAttackRelease(tone.Midi(this.notes[p5.floor(p5.random(this.num))]).toFrequency(), "4n");
					this.alpha = 255;
				}
			}
			this.pindex = this.index;
			this.alpha -= 4;
		}
	}

	let s1, s2, s3;

	p5.setup = () => {
		let canvas = p5.createCanvas(800,800, p5.WEBGL);

		var freeverb = new tone.Freeverb().toMaster();
		freeverb.dampening.value = 600;
		freeverb.roomSize.value = 0.99;
		
		let fm1 = new tone.FMSynth({
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

		let fm2 = new tone.FMSynth({
				"harmonicity"  : 30 ,
				"modulationIndex"  : 82 ,
				"detune"  : 0 ,
				"oscillator"  : {
					"type"  : "sine"
				}  ,
				"envelope"  : {
					"attack"  : 0 ,
					"decay"  : 0.01 ,
					"sustain"  : 0.03 ,
					"release"  : 0.1
				}  ,
				"modulation"  : {
					"type"  : "square"
				}  ,
				"modulationEnvelope"  : {
					"attack"  : 0 ,
					"decay"  : 0.2 ,
					"sustain"  : 0.1 ,
					"release"  : 1
				}
			}).toMaster();

		s2 = new Sequence(fm2, -100, 0.05, 12);

		let fm3 = new tone.FMSynth({
				"harmonicity"  : 10 ,
				"modulationIndex"  : 42 ,
				"detune"  : 0 ,
				"oscillator"  : {
					"type"  : "square"
				}  ,
				"envelope"  : {
					"attack"  : 0 ,
					"decay"  : 0.01 ,
					"sustain"  : 0.03 ,
					"release"  : 2
				}  ,
				"modulation"  : {
					"type"  : "square"
				}  ,
				"modulationEnvelope"  : {
					"attack"  : 0 ,
					"decay"  : 0.2 ,
					"sustain"  : 0.1 ,
					"release"  : 1
				}
			}).toMaster();

		s3 = new Sequence(fm3, 100, 0.03, 24);
	}

	p5.draw = () => {
		p5.camera(p5.sin(p5.frameCount/100) * 100, 0, 400, 0, 0, 0, 0, 1, 0);
		p5.background(240);
		s1.draw();
		s2.draw();
		s3.draw();
	}
}

export default sketch;
new p5(sketch);


