import p5 from 'p5/lib/p5.min';
import tone from 'tone';

const sketch = (p5) => {
	// Music
	let fmOsc;
	let velocity = 0.7; // From 0-1
	let baseNote = 40;
	let keyOrder = "asdfghjkl";
	let keyScale = [24,22,20,18,16,14,12,10,8];
	let keyStates = [0,0,0,0,0,0,0,0,0];
	let pitch = 20;
	let notes = [ 38 + pitch, 40 + pitch, 44 + pitch, 45 + pitch, 47 + pitch, 50 + pitch, 52 + pitch, 54 + pitch, 56 + pitch ];
			
	// Markov Chain
	let graph;
	let latestNodeId;
	
	// Playback Loops
	let sloop;
	let playing = false;
	let secondsPerTick = 0.1;
	let prevEventMillis = 0;
	let timeQuantizationStep = 100; // Quantize to 10 milliseconds
	let maxDuration = 5000;
	let longestDurationSoFar = timeQuantizationStep;
	
	// Colors
	let DEFAULT_NODE_COLOR = [0, 0, 0];
	let ACTIVE_NODE_COLOR = [255, 0, 0];
	let cRandZ = 0;
	let cRandX = 0;
	let triggerAlpha = 0;
	class Node {
  		constructor(id, type, pitch, timeSincePrevEvent) {
  			this.id = id;
  			this.type = type; // 1 (note on) or 0 (note off)
  			this.pitch = pitch;
  			this.timeSincePrevEvent = timeSincePrevEvent;
  			this.oscillateCounter = 0;
  			
  			let x = cRandX;
  			let y = p5.map(this.pitch, baseNote, baseNote + p5.max(keyScale), -200, 200) - 250;
  			let z = cRandZ;
  			this.center = p5.createVector(x, y, z);
  			this.position = p5.createVector(x, y, z);
  			this.color = ACTIVE_NODE_COLOR;
  			this.diameter = p5.map(this.timeSincePrevEvent, 0, maxDuration, 2, 100);
  		}		
		isSimilar(node) {
		  if (this.type === node.type && this.pitch === node.pitch && this.duration === node.duration) {
		    return true;
		  } else {
		    return false;
		  }
		}
		update() {
		  let yAmplitude = p5.height / 1000;
		  let xAmplitude = p5.height / 600;
		  this.position.y = this.center.y + (yAmplitude * p5.sin(this.oscillateCounter)) * 5;
		  this.position.x = this.center.x + (xAmplitude * p5.cos(this.oscillateCounter)) * 5;
		  this.position.x = this.center.z + (xAmplitude * p5.cos(this.oscillateCounter)) * 10;
		  this.oscillateCounter = this.oscillateCounter + 1;
		}
		display() {
		  p5.noStroke();
		  let color = DEFAULT_NODE_COLOR;
		  if (this.id == latestNodeId) {
		    // Highlight latest node
		    p5.fill(255,0,0,triggerAlpha);
		    p5.push();
		    p5.translate(this.position.x, this.position.y,this.position.z);
		  	p5.sphere(30);
		  	p5.pop(); 
		  }
		  // Fill circle if note-on, stroke circle if note-off
		  if (this.type == 1) {
		    p5.fill(255);
		  } else {
		  	p5.fill(255);
		  }
		  p5.noStroke();
		  p5.push();
		  p5.translate(this.position.x, this.position.y,this.position.z);
		  if(this.type == 1) {
		  	p5.push();
		  	p5.ambientMaterial(255);
		  	p5.rotateY(this.pitch*2);
		  	p5.box(18);
		  	p5.pop();
		  }
		  p5.pop(); 
		}
	}

	class Graph {
		constructor() {
	  		this.nodes = [];
	  		this.nodeIds = [];
	  		this.edges = [];
	  		this.numberOfEdges = 0;
	  		
		}
		findNode(node) {
		  for (let i=0; i<this.nodes.length; i++) {
		    if (node.isSimilar(this.nodes[i])) {
		      return i;
		    }
		  }
		  return -1; // Not found
		}
		registerNewNode(type, midiNoteNumber, timeSincePrevEvent) {
		  let node = new Node(0, type, midiNoteNumber, timeSincePrevEvent);
		  let nodeId = graph.findNode(node);
		  if (nodeId == -1) { // If necessary, create the node
		    nodeId = this.nodes.length;
		    this.addNode(node);
		  }
		  node.id = nodeId;
		  if (latestNodeId != null) { // On initialization it will be null
		    this.addEdge(latestNodeId, nodeId);
		  }
		  latestNodeId = nodeId;
		}
		addNode(node) {
		  let nodeId = this.nodes.length;
		  this.nodeIds.push(nodeId);
		  this.nodes.push(node);
		  this.edges[nodeId] = [];
		  
		}
		addEdge(nodeId1, nodeId2) {
		  this.edges[nodeId1].push(nodeId2);
		  this.numberOfEdges++;

		};
		drawEdges() {
		  p5.strokeWeight(1);
		  for (let i=0; i<graph.edges.length; i++) {
		    var startNode = i;
		    if (startNode == latestNodeId) { // Highlight the latest node's edges
		      p5.stroke(255,0,0);
		  	} else {
		      p5.stroke(0, 40);
		    }
		    
		    for (var j=0; j<graph.edges[i].length; j++) {
		      let endNode = graph.edges[i][j];
		      p5.line(graph.nodes[startNode].position.x, graph.nodes[startNode].position.y+j,graph.nodes[startNode].position.z, 
		      	graph.nodes[endNode].position.x, graph.nodes[endNode].position.y+j, graph.nodes[endNode].position.z);
		    }
		  }
		}
	}

	var freeverb = new tone.Freeverb().toMaster();
		freeverb.dampening.value = 1600;
		freeverb.roomSize.value = 0.19;
	var feedbackDelay = new tone.PingPongDelay("32n", 0.9).connect(freeverb).toMaster();

	let fm = new tone.FMSynth({
				"harmonicity"  : 23 ,
				"modulationIndex"  : 30 ,
				"detune"  : 0 ,
				"oscillator"  : {
					"type"  : "square"
				}  ,
				"envelope"  : {
					"attack"  : 0.01 ,
					"decay"  : 0.2 ,
					"sustain"  : 0.7 ,
					"release"  : 0.8
				}  ,
				"modulation"  : {
					"type"  : "sine"
				}  ,
				"modulationEnvelope"  : {
					"attack"  : 0.1 ,
					"decay"  : 0.2 ,
					"sustain"  : 0.6 ,
					"release"  : 1
				}
			}).connect(feedbackDelay).toMaster();
	fm.volume.value = -16;

	p5.setup = () => {
		let canvas = p5.createCanvas(800,800, p5.WEBGL);
		p5.smooth();

		p5.angleMode(p5.DEGREES);

  		graph = new Graph();
  		prevEventMillis = p5.millis();
	}

	p5.draw = () => {
		p5.frameRate(60);
		p5.camera(0, -100, 600, 0, 0, 0, 0, 1, 0);
		p5.pointLight(150, 150, 150, 500, 0, 200);
		p5.directionalLight(255,255,255, -1, 0, -1);
		p5.ambientLight(100);
		p5.background(240);

		p5.rotateY(p5.frameCount/30);
  		  		
  		for (let i=0; i<graph.nodes.length; i++) {
  		  graph.nodes[i].update();
  		  graph.nodes[i].display();
  		}

  		graph.drawEdges();
  		
  		if (latestNodeId != null && graph.edges[latestNodeId].length == 0) {
  		  console.log("release all notes");
  		}

  		triggerAlpha -= 2;
	}

	function loop() {
		
		let r = p5.floor(p5.random(3)) + 1;
  		if(r == 2) fm.triggerAttackRelease(tone.Midi(48).toFrequency(), "64n");
  		if(r == 1) fm.triggerAttackRelease(tone.Midi(36).toFrequency(), "64n");
  		if(r == 3) fm.triggerAttackRelease(tone.Midi(42).toFrequency(), "64n");

  		// Play the sound of this node
  		let midiNoteNumber = graph.nodes[latestNodeId].pitch;
  		let type = graph.nodes[latestNodeId].type;
  		if (type == 1) {
  			feedbackDelay.delayTime.value = p5.random(10)/1000;
  			fm.triggerAttackRelease(tone.Midi(midiNoteNumber).toFrequency(), "64n");
  		  console.log(`on: ${midiNoteNumber} ${velocity}`);
  		  triggerAlpha = 200;
  		} else {
  		  console.log(`off: ${midiNoteNumber}`);
  		}
  		// Transition to a random new node
  		if (graph.edges[latestNodeId].length) {
  		  latestNodeId = p5.random(graph.edges[latestNodeId]);
  		}
  		// Wait for the timeFromPrevEvent of the new node
  		//var timeSincePrevEvent = graph.nodes[latestNodeId].timeSincePrevEvent / 1000; // Millis to seconds

  		setTimeout(function(){ loop(); }, r*100);
	}


	p5.keyPressed = () => {
		cRandZ = p5.random(-200,200);
		cRandX = p5.random(-200,200);
  		let keyIndex = keyOrder.indexOf(p5.key);
  		// Check if valid note key pressed
  		if (keyIndex >= 0) {
  		  // Play synth
  		  let midiNoteNumber = notes[keyIndex]; // 0-127; 60 is Middle C (C4)
  		  fm.triggerAttackRelease(tone.Midi(midiNoteNumber).toFrequency(), "64n");
  		  feedbackDelay.delayTime.value = p5.random(10)/1000;
  		  triggerAlpha = 200;
  		  // Update time
  		  var timeSincePrevEvent = p5.min(p5.millis() - prevEventMillis, maxDuration);
  		  prevEventMillis = p5.millis();
  		  var quantizedTimeSincePrevEvent = p5.round(timeSincePrevEvent / timeQuantizationStep) * timeQuantizationStep;
  		  // Register node
  		  graph.registerNewNode(1, midiNoteNumber, quantizedTimeSincePrevEvent);
  		  // Activate key state
  		  keyStates[keyIndex] = 1;
  		}
	}

	p5.keyReleased = () => {
		let keyIndex = keyOrder.indexOf(p5.key);
		
		// Check if valid note key pressed
  		if (keyIndex >= 0) {
  		  // Stop synth
  		  let midiNoteNumber = notes[keyIndex]; // 0-127; 60 is Middle C (C4)
  		  console.log("release: " + midiNoteNumber);
  		  // Update time
  		  var timeSincePrevEvent = p5.min(p5.millis() - prevEventMillis, maxDuration);
  		  prevEventMillis = p5.millis();
  		  var quantizedTimeSincePrevEvent = p5.round(timeSincePrevEvent / timeQuantizationStep) * timeQuantizationStep;
  		  // Register node
  		  graph.registerNewNode(0, midiNoteNumber, quantizedTimeSincePrevEvent);
  		  // Reset key state
  		  keyStates[keyIndex] = 0;
  		  
  		  timeSincePrevEvent = 0;
  		} 
  		if(p5.key == 'P') {
  		  loop();
  		}
	}
}

export default sketch;
new p5(sketch);


