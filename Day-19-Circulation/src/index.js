import p5 from 'p5/lib/p5.min';
import Tone from 'tone';

const sketch = (p) => {

	let pitches1 = [60, 63, 67, 70, 72, 75, 77, 79, 81];
	let pitches2 = [58, 61, 65, 68, 70, 73, 75, 77, 79];
	let pitches3 = [55, 58, 62, 65, 68, 70, 72, 74, 76];

	let pitches = pitches1;
	let pindex = 0;
	
	var freeverb = new Tone.Freeverb().toMaster();
    freeverb.dampening.value = 3500;
    freeverb.roomSize.value = 0.26;

    var chorus = new Tone.Chorus(0.8, 2.5, 0.2).connect(freeverb);  

    let v = new Tone.Volume(-10).connect(chorus);
    let f = new Tone.Filter(200, "highpass");
	let mosc = new Tone.Oscillator(Tone.Midi(pitches[0] - 12).toFrequency(), "sine").chain(f, v).start();

	class Curve {
  		constructor(id) {
  			this.id = id;
  		  	this.path = [];
  		  	this.x = 0;
  		  	this.y = 0;
  		  	this.cx= 0;
  		  	this.cy = 0;
  		  	
  		  	this.vol = new Tone.Volume(-500);
  		  	this.filter = new Tone.Filter(1200, "highpass");
          	this.osc = new Tone.Oscillator(Tone.Midi(pitches[id]).toFrequency(), "triangle").chain(this.vol, this.filter, chorus).start();
  		}
		setCX( cx ) {
			this.cx = cx;
		}

		setCY( cy ) {
			this.cy = cy;
		}
  		setX( x) {
  		 	
  		  this.x = x;
  		}
		
  		 setY( y) {
  		  this.y = y;
  		}
		
  		 addPoint() {
  		  this.path.push(p.createVector(this.x, this.y));
  		}
  		
  		 reset() {
  		  this.path = []; 
  		}
		
  		 show() {
  		  p.stroke(255);
  		  p.strokeWeight(1);
  		  p.noFill();
  		  p.beginShape();
  		  for (let v of this.path) {
  		    p.vertex(v.x, v.y);
  		  }
  		  p.endShape();
		
  		  p.strokeWeight(8);
  		  p.point(this.x, this.y);
  		  this.current = p.createVector();


  		  let distance1 = p.constrain( p.dist( this.x, this.y, this.cx, this.cy), 0, 50 ) ;
  		  let distance2 = p.constrain( p.dist( this.y, 0, this.cy, 0), 0, 50 ) ;
  		  this.filter.frequency.rampTo( p.map( distance2, 0, 50, 50, 4000 ), 0.1 );
  		  this.vol.volume.rampTo( p.map( distance1, 0, 50, -320, -15 ), 0.01 );
  		}
	}

	function make2DArray(rows, cols) {
	  var arr = new Array(rows); //like arr[]; but with number of columns hardcoded
	  for (var i = 0; i < arr.length; i++) {
	    arr[i] = new Array(cols);
	  }
	  return arr;
	}
	
	let angle = 0;
	let w = 120;
	let cols;
	let rows;
	let curves;

	let randomizer = 2;
	let randomizer2 = 1;

    p.setup = () => {
        let canas = p.createCanvas(800, 800, p.WEBGL);
        cols = 3;//p.floor(p.width / w) - 1;
  		rows = 3;//p.floor(p.height / w) - 1;
  		curves = make2DArray(rows,cols);

  		let id = 0;
  		for (let j = 0; j < rows; j++) {
    		for (let i = 0; i < cols; i++) {
    			
    			curves[j][i] = new Curve(id);
    			id++;
    		}
  		}
    }

    p.draw = () => {
        p.camera(p.mouseX - 400,-200, -600, 0, 0, 0, 0, 1, 0);
        p.background(0);
        p.smooth();

        let d = w - 0.2 * w;
  		let r = d / 2;
		
		p.translate(-p.width/3, -p.height/2.8);
  		p.noFill();
  		p.stroke(255);
  		for (let i = 0; i < cols; i++) {
  		  let cx = w + i * w + w / 2;
  		  let cy = w / 2;
  		  p.strokeWeight(1);
  		  p.stroke(255,50);
  		  p.ellipse(cx, cy, d, d);
  		  let x = r * p.cos(angle * (i + 1) * randomizer);
  		  let y = r * p.sin(angle * (i + 1) * randomizer);
  		  p.strokeWeight(8);
  		  p.stroke(255);
  		  p.point(cx + x, cy + y);
  		  p.stroke(255, 50);
  		  p.strokeWeight(1);
  		  p.line(cx + x, 0, cx + x, p.height);
		
  		  for (let j = 0; j < rows; j++) {
  		  	curves[j][i].setCX(cx);
  		    curves[j][i].setX(cx + x);
  		  }
  		}
		
  		p.noFill();
  		p.stroke(255);
  		for (let j = 0; j < rows; j++) {
  		  let cx = w / 2;
  		  let cy = w + j * w + w / 2;
  		  p.strokeWeight(1);
  		  p.stroke(255,50);
  		  p.ellipse(cx, cy, d, d);
  		  let x = r * p.cos(angle * (j + 1) * randomizer2);
  		  let y = r * p.sin(angle * (j + 1) * randomizer2);
  		  p.strokeWeight(8);
  		  p.stroke(255);
  		  p.point(cx + x, cy + y);
  		  p.stroke(255, 50);
  		  p.strokeWeight(1);
  		  p.line(0, cy + y, p.width, cy + y);
		
  		  for (let i = 0; i < cols; i++) {
  		  	curves[j][i].setCY(cy);
  		    curves[j][i].setY(cy + y);
  		  }
  		}
		
  		for (let j = 0; j < rows; j++) {
  		  for (let i = 0; i < cols; i++) {
  		    curves[j][i].addPoint();
  		    curves[j][i].show();
  		  }
  		}
		
  		angle -= 0.01;
		
		let k = 0;
  		if (angle < -p.TWO_PI) {
  			pindex++;
  		  if(pindex>2) pindex = 0;	
  		  
  		  if(pindex == 0) pitches = pitches1;
  		  if(pindex == 1) pitches = pitches2;
  		  if(pindex == 2) pitches = pitches3;

  		  for (let j = 0; j < rows; j++) {
  		    for (let i = 0; i < cols; i++) {
  		      curves[j][i].reset();
  		      k++;
  		      randomizer = p.random(2);
  		      randomizer2 = p.random(4);

  		      curves[j][i].osc.frequency.rampTo( Tone.Midi(pitches[k]).toFrequency(), 0.1);

  		    }
  		  }
  		  f.frequency.rampTo(p.random(0,200), 1);
  		  mosc.frequency.rampTo(Tone.Midi(pitches[0] -12).toFrequency(), 0.2);
  		      
  		  // saveFrame("lissajous#####.png");
  		  angle = 0;
  		}

    }

    
}
export default sketch;
new p5(sketch);