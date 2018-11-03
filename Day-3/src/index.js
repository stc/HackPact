import p5 from 'p5/lib/p5.min';
import tone from 'tone';

const sketch = (p5) => {
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
					fm.triggerAttackRelease(tone.Midi(this.weight * 10 + 20).toFrequency(), "32n");
					this.canPlay = false;
				}
				this.pos.y += this.weight/10;
				this.fade = true;

			} else {
				this.pos.y += this.weight;	
			}
			if(!this.fade) {
				p5.fill(0);
			} else {
				p5.fill(255, this.fadecol);
				this.fadecol-=4;
				if(this.fadecol <= 0) this.canremove = true;
			}
			p5.noStroke();
			p5.push();
			p5.translate(this.pos.x, this.pos.y, this.pos.z);
			p5.sphere(this.size);
			p5.pop();

			p5.stroke(0,40);
			p5.line(this.startpos.x,this.startpos.y, this.startpos.z, this.startpos.x,0, this.startpos.z);
		}
	}

	let drops = [];
	let ptick = 0;

	let fm = new tone.MembraneSynth({
				"envelope"  : {
					"attack"  : 0.001 ,
					"decay"  : 0.002 ,
					"sustain"  : 0.03 ,
					"release"  : 0.1
				} 
			}).toMaster();

	fm.volume.value = -16;

	p5.setup = () => {
		let canvas = p5.createCanvas(800,800, p5.WEBGL);
	}

	p5.draw = () => {
		p5.camera(p5.millis()/100, -150, 400, 0, 0, 0, 0, 1, 0);
		p5.background(240);
		
		for(let d in drops) drops[d].draw();

		p5.push();
		p5.rotateX(p5.PI/2);
		p5.noFill(0);
		p5.stroke(0,40);
		p5.rect(-200,-200,400,400);
		p5.line(0,-200,0,0,200,0);
		p5.translate(0,0,200);
		p5.line(0,-200,0,0,200,0);
		p5.rect(-200,-200,400,400);
		p5.pop();

		let tick = p5.floor(p5.millis()/500);
		if(ptick!=tick) {
			let v1 = p5.createVector(0,-200,p5.random(-200,200));
			let v2 = p5.createVector(0,-200,p5.random(-200,200));
			let v3 = p5.createVector(0,-200,p5.random(-200,200));
			drops.push( new Drop(p5.floor(p5.random(8)) + 1, v1) );
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


