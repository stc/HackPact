import p5 from 'p5/lib/p5.min';
import tone from 'tone';

const sketch = (p5) => {
	let num = 10;
	let triggers = [];
	let synths = [];
	let colors = [];

	for(let i=0;i<num;i++) {
		synths.push( new tone.MonoSynth({
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
		
	p5.setup = () => {
		let canvas = p5.createCanvas(800,800, p5.WEBGL);
		for(let i=0;i<num;i++) {
			triggers.push(false);
			colors.push(0);
		}
	}

	p5.draw = () => {
		p5.camera(p5.mouseX, 0, 400, 0, 0, 0, 0, 1, 0);
		p5.background(240);
		
		for(let i=0; i<num; i++) {
			let tempo = (i + 1) * p5.frameCount * 0.008;
			p5.push();
			p5.translate(
				(i - 5) * 40,
				Math.sin(tempo) * (i+1) * 10,
				Math.cos(tempo) * (i+1) * 10);

			p5.noStroke();
			p5.fill(colors[i],0,0);
			p5.sphere(3);
			
			p5.pop();

			p5.push();
			p5.stroke(0,40);
			p5.noFill();
			p5.rotateY(p5.PI/2);
			p5.translate(0,0,(i - 5) * 40);
			p5.ellipse(0, 0, (i+1) * 10 * 2, (i+1) * 10 * 2);
			p5.pop();

			if(Math.sin(tempo)>0) {
				if(triggers[i]==false) {
					//synths[i].triggerAttackRelease((num-i + 1) * 100, "8n");
					synths[i].triggerAttackRelease(tone.Midi(i+1 + 60).toFrequency(), "8n");
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
