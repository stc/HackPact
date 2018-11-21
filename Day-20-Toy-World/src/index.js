import p5 from 'p5/lib/p5.min';
import Tone from 'tone';
const sketch = (p) => {
	let elements = [];
	
	let frameCountPerCicle = 120;

	let currentCicleProgressRatio = [];
  	let	currentCicleQuadEaseInRatio = [];
  	let	currentCicleQuadEaseOutRatio = [];
  	let	currentCicleQuartEaseInRatio= [];
  	let	currentCicleQuartEaseOutRatio = [];

  	let triggers = [];
  	let canPlay = [];
  	let speeds = [];

  	let synths = [];
	
	var pingPong = new Tone.PingPongDelay("64n", 0.95).toMaster();
	let freeverb = new Tone.Freeverb().toMaster();
	freeverb.dampening.value = 1600;
	freeverb.roomSize.value = 0.92;

  	synths.push( new Tone.AMSynth().connect(freeverb) );
	synths.push( new Tone.DuoSynth().connect(freeverb) );
	synths.push( new Tone.FMSynth().connect(freeverb) );
	synths.push( new Tone.FMSynth().connect(freeverb) );
	synths.push( new Tone.PluckSynth().connect(pingPong) );
	synths.push( new Tone.PluckSynth().connect(pingPong) );
	synths.push( new Tone.FMSynth().connect(freeverb) );
	synths.push( new Tone.PluckSynth().connect(freeverb) );

	synths[0].volume.value = -11;
	synths[1].volume.value = -7;
	synths[2].volume.value = -7;
	synths[3].volume.value = -7;
	synths[4].volume.value = -7;
	synths[5].volume.value = -7;
	synths[6].volume.value = -7;
	synths[7].volume.value = -3;

    p.setup = () => {
        let canvas = p.createCanvas(800, 800, p.WEBGL);

        p.ellipseMode(p.CENTER);
  		p.rectMode(p.CENTER);
		

  		elements = new Elements(4, 40);
  		elements.push(drawShrinkingCircle);
  		elements.push(drawHittingLine);
  		elements.push(drawJitteringCircle);
  		elements.push(drawRotatingCross);
  		elements.push(drawRotatingCircles);
  		elements.push(drawOrbit);
  		elements.push(drawPoppingCircles);
  		elements.push(drawString);

  		for(let i=0; i<8; i++) {
  			triggers.push(0);
  			canPlay.push(true);
  			speeds.push(p.floor(p.random(4) + 1) );
  		}
        
    }
    p.draw = () => {
        p.camera(150,-200, -600, 0, 0, 0, 0, 1, 0);
        p.background(240);
        p.smooth();

        p.translate(-p.width/2,-p.height/1.8);
        updateCurrentCicleProgress();
		elements.display();

		for(let i=0; i<5; i++) {
			p.stroke(0,50);
			p.line(-3000, 500 + i*5, 0, 3000, 500 + i * 5, 0);
		}

		p.translate(0,100,0);
		for(let i=0; i<5; i++) {
			p.stroke(0,50);
			p.line(-3000, 500 + i*5, 0, 3000, 500 + i * 5, 0);
		}
       
    }

    p.keyPressed = () => {
    	if(p.key == '1') triggers[0] = 0;
    	if(p.key == '2') triggers[1] = 0;
    	if(p.key == '3') triggers[2] = 0;
    	if(p.key == '4') triggers[3] = 0;
    	if(p.key == '5') triggers[4] = 0;
    	if(p.key == '6') triggers[5] = 0;
    	if(p.key == '7') triggers[6] = 0;
    	if(p.key == '8') triggers[7] = 0;
    }

    function updateCurrentCicleProgress() {
    	for(let i=0; i<triggers.length; i++) {
    		if(triggers[i] < frameCountPerCicle) {
    			triggers[i]++;
    		}
    		currentCicleProgressRatio[i] = triggers[i] / frameCountPerCicle;
  			currentCicleQuadEaseInRatio[i] = currentCicleProgressRatio * currentCicleProgressRatio[i];
  			currentCicleQuadEaseOutRatio[i] = -p.sq(currentCicleProgressRatio[i] - 1) + 1;
  			currentCicleQuartEaseInRatio[i] = p.pow(currentCicleProgressRatio[i], 4);
  			currentCicleQuartEaseOutRatio[i] = -p.pow(currentCicleProgressRatio[i] - 1, 4) + 1;
    	}	
	}

	function Elements(elementXCount, elementDisplaySize) {
  		var elementArray = [];
  		var positionInterval = p.width / (elementXCount + 1);
  		var xIndex = 0;
  		var yIndex = 0;
		
  		this.push = function(displayFunction) {
  		  elementArray.push(new Element(
  		    xIndex * 200 + p.random(-50,50),
  		    xIndex * 15 + 300,
  		    p.random(50),
  		    displayFunction
  		  ));
  		  xIndex++;
  		  if (xIndex >= elementXCount) {
  		    yIndex++;
  		  }
  		};
		
  		this.display = function() {
  		  for (var elementIndex = 0, elementNumber = elementArray.length; elementIndex < elementNumber; elementIndex++) {
  		    elementArray[elementIndex].display(elementDisplaySize);
  		    elementArray[elementIndex].xPosition += speeds[elementIndex];
  		    if(elementArray[elementIndex].xPosition > p.width/2) {
  		    	if(canPlay[elementIndex]) {
  		    		triggers[elementIndex] = 0;
  		    		canPlay[elementIndex] = false;
  		    		pingPong.delayTime.value = p.random(0.01,0.1);
  		    		synths[elementIndex].triggerAttackRelease(Tone.Midi(p.floor(p.random(4)*4) + 60 ).toFrequency(), "32n");
  		    		
  		    	}
  		    }
  		    if(elementArray[elementIndex].xPosition > p.width * 0.9) {
  		    	elementArray[elementIndex].xPosition = p.random(-200,0);
  		    	canPlay[elementIndex] = true;
  		    	speeds[elementIndex] = p.floor(p.random(2) + 3);
  		    }
  		  }
  		}
	}

	let Element = function(x, y, z, displayFunction) {
  		this.xPosition = x;
  		this.yPosition = y;
  		this.zPosition = z;
  		this.display = displayFunction;
	};

	function drawShrinkingCircle(size) {
		p.stroke(0,100-this.zPosition);
	  p.line(-3000,this.yPosition,this.zPosition, 3000,this.yPosition, this.zPosition);

	  var diameter = size * (1.5 - currentCicleQuartEaseOutRatio[0]);
	  p.noStroke();
	  p.fill(0,255-this.zPosition);
	  p.push();
	  p.translate(this.xPosition, this.yPosition, this.zPosition);
	  p.sphere(diameter/2);
	  p.pop();
	  p.noFill();
	  p.stroke(255);
	  p.line(p.width/2,-3000,this.zPosition, p.width/2,3000, this.zPosition);
	}
	
	function drawHittingLine(size) {
		p.stroke(0,100-this.zPosition);
	  p.line(-3000,this.yPosition,this.zPosition, 3000,this.yPosition, this.zPosition);
	  var offsetYPosition = -size * 0.25 + size * 0.5 * (1 - currentCicleQuartEaseOutRatio[1]);
	  p.noStroke();
	  p.fill(255,150-this.zPosition);
	  p.stroke(0,255-this.zPosition);
	  p.push();
	  //p.rotateZ(p.radians(90));
	  p.translate(this.xPosition, this.yPosition + offsetYPosition+size, -this.zPosition/2);
	  
	  p.box(size*2, size*0.1, size*0.6);
	  p.pop();
	  p.noFill();
	}
	
	function drawRotatingCross(size) {
		p.stroke(0,100-this.zPosition);
	  p.line(-3000,this.yPosition,this.zPosition, 3000,this.yPosition, this.zPosition);
	  var rotationAngle = p.PI * currentCicleQuartEaseOutRatio[3];
	  p.noStroke();
	  p.fill(255,200-this.zPosition);
	  p.stroke(0,255-this.zPosition);
	  p.push();
	  p.translate(this.xPosition, this.yPosition, this.zPosition);
	  p.rotateX(p.radians(90));
	  p.rotate(rotationAngle);
	  p.box(size * 2, size * 0.15, size * 0.15);
	  p.box(size * 0.15, size*2, size * 0.15);
	  p.pop();
	  p.noFill();
	  
	}
	
	function drawRotatingCircles(size) {
		p.stroke(0,100-this.zPosition);
	  p.line(-3000,this.yPosition,this.zPosition, 3000,this.yPosition, this.zPosition);
	  var rotationAngle = p.PI * currentCicleQuartEaseOutRatio[4];
	  var diameter = size * 0.2;
	  p.noStroke();
	  p.fill(0,255-this.zPosition);
	  p.push();
	  p.translate(this.xPosition, this.yPosition, this.zPosition);
	  p.rotate(rotationAngle);
	  p.ellipse(0, -size * 0.5, diameter, diameter);
	  p.ellipse(0, +size * 0.5, diameter, diameter);
	  p.pop();
	  p.noFill();
	  
	}
		
	function drawOrbit(size) {
		p.stroke(0,100-this.zPosition);
	  p.line(-3000,this.yPosition,this.zPosition, 3000,this.yPosition, this.zPosition);
	  var angle = -p.HALF_PI + p.TWO_PI * currentCicleQuartEaseOutRatio[5];
	  var particleSize = size * 0.2;
	  var radius = size * 0.5;
	  p.stroke(0,200);
	  p.strokeWeight(1);
	  p.noFill();

	  p.push();
	  p.translate(0,0,this.zPosition);
	  p.ellipse(this.xPosition, this.yPosition, size, size);
	  p.noStroke();
	  p.fill(0,200);
	  p.ellipse(this.xPosition + radius * p.cos(angle), this.yPosition + radius * p.sin(angle), particleSize, particleSize);
	  p.pop();
	  p.noFill();
	  
	}
	
	function drawPoppingCircles(size) {
		p.stroke(0,100-this.zPosition);
	  p.line(-3000,this.yPosition,0, 3000,this.yPosition, 0);
	  var diameter = size * 0.3 * (1 - currentCicleProgressRatio[6]);
	  var distance = size * 0.7 * (currentCicleQuartEaseOutRatio[6]);
	  p.stroke(0,255-this.zPosition);
	  p.strokeWeight(1);
	  p.fill(255,255-this.zPosition);
	  p.push();
	  p.translate(this.xPosition, this.yPosition);
	  p.ellipse(0, 0, 4,4);
	  p.pop();
	  for (var i = 0; i < 5; i++) {
	    var rotationAngle = -p.HALF_PI + i * p.TWO_PI / 5;
	    p.push();
	    p.translate(this.xPosition, this.yPosition);
	    p.rotate(rotationAngle);
	    p.ellipse(distance, 0, diameter, diameter);
	    p.pop();
	  }
	  p.noFill();
	  
	}
	
	function drawJitteringCircle(size) {
		p.stroke(0,100-this.zPosition);
	  p.line(-3000,this.yPosition,0, 3000,this.yPosition, 0);
	  var maxDisplacement = size * 0.5 * (1 - currentCicleQuadEaseOutRatio[2]);
	  var diameter = size * 0.3;
	  p.noStroke();
	  p.fill(0,255-this.zPosition);
	  p.ellipse(
	    this.xPosition + p.random(-maxDisplacement, maxDisplacement),
	    this.yPosition + p.random(-maxDisplacement, maxDisplacement),
	    diameter,
	    diameter
	  );
	  p.noFill();
	  p.stroke(0,100-this.zPosition);
	  p.line(-3000,this.yPosition,0, 3000,this.yPosition, 0);
	}
	
	function drawString(size) {
		p.stroke(0,100-this.zPosition);
	  p.line(-3000,this.yPosition,0, 3000,this.yPosition, 0);
	  var diameter = size * 0.15;
	  var amplitude = size * 0.5 * (1 - currentCicleProgressRatio[7]);
	  var halfLength = size * 0.7;
	  var yDisplacement = amplitude;
	  if (triggers[7] % 2 == 0) {
	    yDisplacement = -yDisplacement;
	  }
	
	  p.stroke(0,255-this.zPosition);
	  p.strokeWeight(1);
	  p.noFill();
	  for (var i = 0; i < 3; i++) {
	    if (i >= 1) {
	      yDisplacement = amplitude * p.random(-1, 1);
	    }
	    p.beginShape();
	    p.vertex(this.xPosition - halfLength, this.yPosition);
	    p.vertex(this.xPosition, this.yPosition + yDisplacement);
	    p.vertex(this.xPosition + halfLength, this.yPosition);
	    p.endShape();
	  }
	  p.noStroke();
	  p.fill(0,255-this.zPosition);
	  p.ellipse(this.xPosition - halfLength, this.yPosition, diameter, diameter);
	  p.ellipse(this.xPosition + halfLength, this.yPosition, diameter, diameter);
	  p.noFill();
	  
	}
}
export default sketch;
new p5(sketch);