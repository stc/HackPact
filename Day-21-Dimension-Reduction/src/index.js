import p5 from 'p5/lib/p5.min';
import Tone from 'tone';
import tsnejs from 'tsne';

const sketch = (p5) => {
	class DataPoint {
		constructor() {
  			this.pos = p5.createVector(0,0,0);
  			this.label = "";
  			this.color = p5.color(255);
  			this.size = 1;
  			this.trig = 0;
  			this.canTrig = true;
		}

  		drawPoint(){
  		  p5.noStroke();
  		  p5.fill(this.color);
  		  p5.ambientMaterial(this.r, this.r,this.r);
  		  p5.push();
  		  p5.translate(this.pos.x, this.pos.y, this.pos.z);
  		  //p5.rotateX(this.size,0,0);
  		  p5.box(this.size);

  		  p5.fill(255,0,0,this.trig);
  		  p5.box(this.size * 1.5);
  		  
  		  if(this.trig == 255) {
  		  	if(this.canTrig) {
  		  		let rnd = p5.floor(p5.random(10));
  		  		synths[ rnd ].envelope.attack = this.r/1000;
  		  		synths[ rnd ].triggerAttackRelease( Tone.Midi( ((255/20 + 2) - this.size + 2) * 10 ).toFrequency(), this.size/500);
  		  		this.canTrig = false;
  		  	}
  		  }


  		  this.trig-=100;

  		  p5.pop();


  		}
		
  		setPos(p) {
  			this.pos = p;
  			return this;
  		}
		
  		setCol(r,g,b,a) {
  			this.color = p5.color(r,g,b,a);
  			this.r = r;
  			this.g = g;
  			this.b = b;
  			return this;
  		}
		
  		setSize(s) {
  			this.size = s;
  			return this;
  		}
	}

	let num = 500;
	let tsne;
	let Y;
	let stepCount = 0;
	let data = [];
	let features = [];

	let playHeadx = -250;
	let playHeady = -250;
	
	let x = 0;
	let y = 0;
	let  easing = 0.9;
	let synths = [];


	var panner = new Tone.Panner(-1).toMaster();
	var freeverb = new Tone.Freeverb().connect(panner);
        freeverb.dampening.value = 3500;
        freeverb.roomSize.value = 0.79;
	
	for(let i=0; i<10; i++) {
		synths.push(new Tone.FMSynth({
                "harmonicity"  : 10 ,
                "modulationIndex"  : 80 ,
                "detune"  : 0 ,
                "oscillator"  : {
                    "type"  : "sine"
                }  ,
                "envelope"  : {
                    "attack"  : 0.001 ,
                    "decay"  : 0.003 ,
                    "sustain"  : 0.06 ,
                    "release"  : 0.3
                }  ,
                "modulation"  : {
                    "type"  : "square"
                }  ,
                "modulationEnvelope"  : {
                    "attack"  : 0.01 ,
                    "decay"  : 0.02 ,
                    "sustain"  : 0.03 ,
                    "release"  : 0.033
                },
                "portamento" : 0.01 
            }).connect(freeverb));
	}
	p5.setup = () => {
		let canvas = p5.createCanvas(800,800, p5.WEBGL);
		p5.smooth();

		let opt = {}
  		opt.epsilon = 30; // epsilon is learning rate (10 = default)
  		opt.perplexity = 30; // roughly how many neighbors each point influences (30 = default)
  		opt.dim = 3; // dimensionality of the embedding (2 = default)
		
  		tsne = new tsnejs.tSNE(opt); // create a tSNE instance
  		
  		for(let i=0; i<num; i++) {
  		  
  		  // generating random data
  		  let f1 = p5.random(255);
  		  let f2 = p5.random(255);
  		  let f3 = p5.random(255);
		
  		  // add generated data to an array of feature vectors
  		  features.push( [f1, f2, f3] ); // feature vector's length (components) can be selected freely
		
  		  let d = new DataPoint();
  		  // use data as color components for the datapoints
  		  d.setCol( f1, f2, f3, 255 ).setSize(f2/20 + 2);
  			data.push(d);
  		}
  		
  		tsne.initDataRaw(features);
  		Y = tsne.getSolution(); // Y is an array of 2-D points that you can plot
	}

	let zp = 0;
	p5.draw = () => {
		p5.camera(p5.sin(p5.frameCount/300) * 100, p5.cos(p5.frameCount/300) * 100, 800, 0, 0, 0, 0, 1, 0);
		p5.background(0);
		p5.frameRate(60);

		let targetX = p5.constrain(p5.mouseX + p5.sin(-p5.frameCount/20) * 80,0,p5.width);
  		let dx = targetX - x;
  		x += dx * easing;

  		let targetY = p5.constrain(p5.mouseY + p5.cos(-p5.frameCount/20) * 80,0,p5.height);
  		let dy = targetY - y;
  		y += dy * easing;
		
		playHeadx = p5.map(x,0,p5.width,-250,250);
		playHeady = p5.map(y,0,p5.height,-250,250);
		
		/*if(playHeadx > 250) {
			playHeadx = -250;
			for(let i=0; i< Y.length; i++) {
    			data[i].canTrig = true;
    		}
		}*/

		panner.pan.value = playHeadx / 250;

		p5.pointLight(150, 150, 150, 500, 0, 200);
		//p5.directionalLight(255,255,255, -1, 0, -1);
		p5.ambientLight(255);

		//p5.rotateY(p5.sin(p5.frameCount/1000) * p5.PI/4);
		//p5.rotateX(-p5.frameCount/1000);

		zp = p5.sin(p5.frameCount/100) * 250;
		p5.push();
		p5.translate(playHeadx,0,0);
		p5.fill(255,120);
		p5.noStroke();
		p5.box(5,500,0);
		p5.pop();

		p5.push();
		p5.translate(0,playHeady,0);
		p5.fill(255,120);
		p5.noStroke();
		p5.box(500,5,0);
		p5.pop();

		p5.push();
		p5.translate(playHeadx,playHeady,0);
		p5.fill(255,0,0,40);
		p5.noStroke();
		p5.box(5,5,500);
		p5.pop();

		stepCount++;
  		if(stepCount<600) {
    		tsne.step();
  		}

  		for(let i=0; i< Y.length; i++) {
    		data[i].setPos( p5.createVector(Y[i][0] * 10, Y[i][1] * 10, Y[i][2] * 10) ).drawPoint();
    		if(p5.dist(data[i].pos.x,data[i].pos.y,0, playHeadx,playHeady, 0) <= 10) {
    			data[i].trig = 255;
    		} else {
    			data[i].canTrig = true;
    		}
  		}

  		p5.noFill();
  		p5.stroke(255, 50);
  		p5.box(500);
	}
}

export default sketch;
new p5(sketch);


