import p5 from 'p5/lib/p5.min';
import Tone from 'tone';

const sketch = (p) => {
	class Drop {
		constructor(weight, pos) {
			this.weight = weight;
			this.pos = pos;
			this.canremove = false;
			this.size = this.weight / 2;
			this.fade = false;
			this.fadecol = 255;
			this.startpos = this.pos.copy();
			this.canPlay = true;
		}

		draw() {
			if(this.pos.y > 0) {
				if(this.canPlay) {
					fm.triggerAttackRelease(Tone.Midi(this.weight * 10 + 20).toFrequency(), "32n");
					this.canPlay = false;
				}
				this.pos.y += this.weight/10;
				this.fade = true;

			} else {
				this.pos.y += this.weight;	
			}
			if(!this.fade) {
				p.fill(255);
			} else {
				p.fill(255, 0, 0, this.fadecol);
				this.fadecol-=4;
				if(this.fadecol <= 0) this.canremove = true;
			}
			p.noStroke();
			p.push();
			p.translate(this.pos.x, this.pos.y, this.pos.z);
			p.sphere(this.size);
			p.pop();

			p.stroke(255,100);
			p.line(this.startpos.x,this.startpos.y, this.startpos.z, this.startpos.x,0, this.startpos.z);
		}
	}

	let drops = [];
	let ptick = 0;

	let fm = new Tone.MembraneSynth({
				"envelope"  : {
					"attack"  : 0.001 ,
					"decay"  : 0.002 ,
					"sustain"  : 0.03 ,
					"release"  : 0.1
				} 
			}).toMaster();

	fm.volume.value = -16;

	p.setup = () => {
		let canvas = p.createCanvas(800,800, p.WEBGL);
		p.smooth();
	}

	p.draw = () => {
		p.camera(p.mouseX, -150, 400, 0, 0, 0, 0, 1, 0);
		p.background(0);
		
		for(let d in drops) drops[d].draw();

		p.push();
		p.rotateX(p.PI/2);
		p.noFill(0);
		p.stroke(255,200);
		p.rect(-200,-200,400,400);
		p.line(0,-200,0,0,200,0);
		p.translate(0,0,200);
		p.line(0,-200,0,0,200,0);
		p.rect(-200,-200,400,400);
		p.pop();

		let tick = p.floor(p.millis()/500);
		if(ptick!=tick) {
			let v1 = p.createVector(0,-200,p.random(-200,200));
			let v2 = p.createVector(0,-200,p.random(-200,200));
			let v3 = p.createVector(0,-200,p.random(-200,200));
			drops.push( new Drop(p.floor(p.random(8)) + 1, v1) );
			drops.push( new Drop(4, v2) );
			drops.push( new Drop(7, v3) );
		}
		ptick = tick;

		for(let i = 0; i < drops.length; i++) {
			if(drops[i].canremove) {
				drops.splice(i, 1);
			}
		}
	}
}

export default sketch;
new p5(sketch);


