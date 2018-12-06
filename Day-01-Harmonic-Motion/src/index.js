import p5 from 'p5/lib/p5.min';
import Tone from 'tone';

const sketch = (p) => {
	let num = 10;
	let triggers = [];
	let synths = [];
	let colors = [];

	for(let i=0;i<num;i++) {
		synths.push( new Tone.MonoSynth({
			"oscillator" : {
				"type" : "sine"
 			},
 			"envelope" : {
 				"attack" : 0.03,
				"decay" : 0.5,
				"sustain"  : 0.1,
				"release"  : 0.4
 			}
		}).toMaster() );
		synths[i].volume.value = -20;
	}
		
	p.setup = () => {
		let canvas = p.createCanvas(800,800, p.WEBGL);
		for(let i=0;i<num;i++) {
			triggers.push(false);
			colors.push(0);
		}
	}

	p.draw = () => {
		p.camera(p.mouseX, 0, 400, 0, 0, 0, 0, 1, 0);
		p.background(240);
		
		for(let i=0; i<num; i++) {
			let tempo = (i + 1) * p.frameCount * 0.008;
			p.push();
			p.translate(
				(i - 5) * 40,
				Math.sin(tempo) * (i+1) * 10,
				Math.cos(tempo) * (i+1) * 10);

			p.noStroke();
			p.fill(colors[i],0,0);
			p.sphere(3);
			
			p.pop();

			p.push();
			p.stroke(0,40);
			p.noFill();
			p.rotateY(p.PI/2);
			p.translate(0,0,(i - 5) * 40);
			p.ellipse(0, 0, (i+1) * 10 * 2, (i+1) * 10 * 2);
			p.pop();

			if(Math.sin(tempo)>0) {
				if(triggers[i]==false) {
					synths[i].triggerAttackRelease(Tone.Midi(i+1 + 60).toFrequency(), "8n");
					colors[i] = 255;
				}
				triggers[i] = true;
			} else {
				triggers[i] = false;
			}

			colors[i] -= 4;
		}
	}
}

export default sketch;

new p5(sketch);
