import p5 from 'p5/lib/p5.min';
import Tone from 'tone';
import StartAudioContext from 'startaudiocontext';

const sketch = (p) => {

	class Pluck {
		constructor(x,y,z,w) {
			this.x = x;
			this.y = y;
			this.z = z;
			this.w = w;
			this.alpha = 0;
			this.easedVal = 0;
			this.easing = 0.05;
			this.counter = 0;
		}
		draw() {
			let targetY = this.w;
  			let dy = targetY - this.easedVal;
 			this.easedVal += dy * this.easing;
			
			for (let i=0; i<4; i++) {
				p.stroke(255,200);
				p.strokeWeight(1);
				p.noFill();
				//p.line(- this.easedVal/2,this.y,this.z+i*10,this.x+this.easedVal/2,this.y,this.z+i*10);
				p.beginShape();
				p.vertex(- this.easedVal/2,this.y,this.z+i*10);
				p.vertex(0,this.y + p.sin(p.frameCount) * this.counter,this.z+i*10);
				p.vertex(this.x+this.easedVal/2,this.y,this.z+i*10);
				p.endShape();

				p.push();
				p.translate(- this.easedVal/2,this.y,this.z+i*10);
				p.fill(255,200);
				p.box(4,4,10);
				p.pop();

				p.push();
				p.translate(this.easedVal/2,this.y,this.z+i*10);
				p.fill(255,200);
				p.box(4,4,10);
				p.pop();
			}

			if(this.counter>0) {
				this.counter-=0.5;
			}	
		}
	}

	class Ball {
		constructor(x,y,speed){
			this.x = 0;
			this.y = -200;
			this.speed = 3;
			this.alpha = 0;
		}
		draw() {
			p.fill(255);
			p.noStroke();
			p.push();
			p.translate(this.x,this.y,0);
			p.sphere(4);
			p.fill(255,0,0,this.alpha);
			p.sphere(6);
			p.pop();
			this.y += this.speed;
			this.alpha -=20;
		}
	}
	let lineIndex = 0;	
	let songlines = [
						[60,58,55,53,53,58],
						[60,58,55,53,55,51],
						[55,53,51,48,46,51],
						[53,52,48,46,48,48]
					]

	let plucks = [];

	let freeverb = new Tone.Freeverb().toMaster();
	freeverb.dampening.value = 1600;
	freeverb.roomSize.value = 0.92;
	
	let syn = new Tone.FMSynth({
		'harmonicity'  : 80 ,
		'modulationIndex'  : 180 ,
		'detune'  : 0 ,
		'oscillator'  : {
		'type'  : 'square'
		}  ,
		'envelope'  : {
		'attack'  : 0.01 ,
		'decay'  : 0.01 ,
		'sustain'  : 1 ,
		'release'  : 2
		}  ,
		modulation  : {
		'type'  : 'square'
		}  ,
		modulationEnvelope  : {
		'attack'  : 0.05 ,
		'decay'  : 0.06 ,
		'sustain'  : 1 ,
		'release'  : 1.5
		}
		}).connect(freeverb);
		syn.volume.value = -16;

	let syn2 = new Tone.FMSynth({
		'harmonicity'  : 80 ,
		'modulationIndex'  : 180 ,
		'detune'  : 0 ,
		'oscillator'  : {
		'type'  : 'square'
		}  ,
		'envelope'  : {
		'attack'  : 1 ,
		'decay'  : 2 ,
		'sustain'  : 3 ,
		'release'  : 4
		}  ,
		modulation  : {
		'type'  : 'square'
		}  ,
		modulationEnvelope  : {
		'attack'  : 0.05 ,
		'decay'  : 1 ,
		'sustain'  : 2 ,
		'release'  : 3
		}
		}).connect(freeverb);
		syn2.volume.value = -4;
			
	let b;
	p.setup = () => {
		let canvas = p.createCanvas(800,800, p.WEBGL);	

		plucks.push(new Pluck (0,-200,0,p.map(songlines[0][0],48,60,600,50)));
		plucks.push(new Pluck (0,-90,0,p.map(songlines[0][1],48,60,600,50)));
		plucks.push(new Pluck (0,-30,0,p.map(songlines[0][2],48,60,600,50)));
		plucks.push(new Pluck (0,30,0,p.map(songlines[0][3],48,60,600,50)));
		plucks.push(new Pluck (0,180,0,p.map(songlines[0][4],48,60,600,50)));
		plucks.push(new Pluck (0,340,0,p.map(songlines[0][5],48,60,600,50)));
		
		b = new Ball();
	}

	p.draw = () => {
		p.camera(200, -100, 900, 0, 0, 0, 0, 1, 0);
		p.background(0);
		p.smooth();

		p.push();
		p.rotateY(-p.frameCount/3000);
		p.noFill();
		p.stroke(255,180);
		p.strokeWeight(2);
		p.box(3000,2000,4000);
		
		for(let i=0; i<plucks.length; i++) {
			plucks[i].draw();
			
		}

		p.stroke(255,100);
		p.line(0,-4000,0,0,4000,0);
		b.draw();
		if(b.y > plucks[0].y && plucks[0].canPlay) playNext();
		if(b.y > plucks[1].y && plucks[1].canPlay) playNext();
		if(b.y > plucks[2].y && plucks[2].canPlay) playNext();
		if(b.y > plucks[3].y && plucks[3].canPlay) playNext();
		if(b.y > plucks[4].y && plucks[4].canPlay) playNext();
		if(b.y > plucks[5].y && plucks[5].canPlay) playNext();

		if(b.y>600) {
			b.y = -300;
			for(let i=0; i<plucks.length; i++) {
				plucks[i].canPlay = true;
			}
		}
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

	let counter = 0;	
	function playNext() {
		if(counter == 0) {
			syn2.triggerAttackRelease(Tone.Midi(songlines[lineIndex][counter] +7+12).toFrequency(),"4n");
			for(let i=0; i<plucks.length; i++) {
				plucks[i].w = p.map(songlines[lineIndex][i],48,60,600,50);
			}
		}
		if(plucks[counter].canPlay) {
			syn.triggerAttackRelease(Tone.Midi(songlines[lineIndex][counter]+12).toFrequency(),"16n");
			plucks[counter].canPlay = false;
			plucks[counter].counter = 10;
			b.alpha = 255;
		}

		counter++;
		if(counter>5) {
			counter = 0;
			lineIndex++;
			if(lineIndex>3) {
				lineIndex = 0;
			}
		}	
	}
}

export default sketch;
new p5(sketch);


