import p5 from 'p5/lib/p5.min';
import Tone from 'tone';
import StartAudioContext from 'startaudiocontext';

const sketch = (p) => {
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
  			let y = p.map(this.pitch, baseNote, baseNote + p.max(keyScale), -200, 200) - 250;
  			let z = cRandZ;
  			this.center = p.createVector(x, y, z);
  			this.position = p.createVector(x, y, z);
  			this.color = ACTIVE_NODE_COLOR;
  			this.diameter = p.map(this.timeSincePrevEvent, 0, maxDuration, 2, 100);
  		}		
		isSimilar(node) {
		  if (this.type === node.type && this.pitch === node.pitch && this.duration === node.duration) {
		    return true;
		  } else {
		    return false;
		  }
		}
		update() {
		  let yAmplitude = p.height / 1000;
		  let xAmplitude = p.height / 600;
		  this.position.y = this.center.y + (yAmplitude * p.sin(this.oscillateCounter)) * 5;
		  this.position.x = this.center.x + (xAmplitude * p.cos(this.oscillateCounter)) * 5;
		  this.position.x = this.center.z + (xAmplitude * p.cos(this.oscillateCounter)) * 10;
		  this.oscillateCounter = this.oscillateCounter + 1;
		}
		display() {
		  p.noStroke();
		  let color = DEFAULT_NODE_COLOR;
		  if (this.id == latestNodeId) {
		    // Highlight latest node
		    p.fill(255,0,0,triggerAlpha);
		    p.push();
		    p.translate(this.position.x, this.position.y,this.position.z);
		  	p.sphere(30);
		  	p.pop(); 
		  }
		  // Fill circle if note-on, stroke circle if note-off
		  if (this.type == 1) {
		    p.fill(255);
		  } else {
		  	p.fill(255);
		  }
		  p.noStroke();
		  p.push();
		  p.translate(this.position.x, this.position.y,this.position.z);
		  if(this.type == 1) {
		  	p.push();
		  	p.ambientMaterial(255);
		  	p.rotateY(this.pitch*2);
		  	p.box(18);
		  	p.pop();
		  }
		  p.pop(); 
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
		  p.strokeWeight(1);
		  for (let i=0; i<graph.edges.length; i++) {
		    var startNode = i;
		    if (startNode == latestNodeId) { // Highlight the latest node's edges
		      p.stroke(255,0,0);
		  	} else {
		      p.stroke(255, 40);
		    }
		    
		    for (var j=0; j<graph.edges[i].length; j++) {
		      let endNode = graph.edges[i][j];
		      p.line(graph.nodes[startNode].position.x, graph.nodes[startNode].position.y+j,graph.nodes[startNode].position.z, 
		      	graph.nodes[endNode].position.x, graph.nodes[endNode].position.y+j, graph.nodes[endNode].position.z);
		    }
		  }
		}
	}

	var freeverb = new Tone.Freeverb().toMaster();
		freeverb.dampening.value = 1600;
		freeverb.roomSize.value = 0.19;
	var feedbackDelay = new Tone.PingPongDelay("32n", 0.9).connect(freeverb).toMaster();

	let fm = new Tone.FMSynth({
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

	p.setup = () => {
		let canvas = p.createCanvas(800,800, p.WEBGL);
		p.smooth();

		p.angleMode(p.DEGREES);

  		graph = new Graph();
  		prevEventMillis = p.millis();
	}

	p.draw = () => {
		p.frameRate(60);
		p.camera(0, -100, 600, 0, 0, 0, 0, 1, 0);
		p.pointLight(150, 150, 150, 500, 0, 200);
		p.directionalLight(255,255,255, -1, 0, -1);
		p.ambientLight(100);
		p.background(0);

		p.rotateY(p.frameCount/30);
  		  		
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
		
		let r = p.floor(p.random(3)) + 1;
  		if(r == 2) fm.triggerAttackRelease(Tone.Midi(48).toFrequency(), "64n");
  		if(r == 1) fm.triggerAttackRelease(Tone.Midi(36).toFrequency(), "64n");
  		if(r == 3) fm.triggerAttackRelease(Tone.Midi(42).toFrequency(), "64n");

  		// Play the sound of this node
  		let midiNoteNumber = graph.nodes[latestNodeId].pitch;
  		let type = graph.nodes[latestNodeId].type;
  		if (type == 1) {
  			feedbackDelay.delayTime.value = p.random(10)/1000;
  			fm.triggerAttackRelease(Tone.Midi(midiNoteNumber).toFrequency(), "64n");
  		  console.log(`on: ${midiNoteNumber} ${velocity}`);
  		  triggerAlpha = 200;
  		} else {
  		  console.log(`off: ${midiNoteNumber}`);
  		}
  		// Transition to a random new node
  		if (graph.edges[latestNodeId].length) {
  		  latestNodeId = p.random(graph.edges[latestNodeId]);
  		}
  		// Wait for the timeFromPrevEvent of the new node
  		//var timeSincePrevEvent = graph.nodes[latestNodeId].timeSincePrevEvent / 1000; // Millis to seconds

  		setTimeout(function(){ loop(); }, r*100);
	}


	p.keyPressed = () => {
		if(p.key == 'm') {
			p.save(Date.now() + ".jpg");
		}
	
		cRandZ = p.random(-200,200);
		cRandX = p.random(-200,200);
  		let keyIndex = keyOrder.indexOf(p.key);
  		// Check if valid note key pressed
  		if (keyIndex >= 0) {
  		  // Play synth
  		  let midiNoteNumber = notes[keyIndex]; // 0-127; 60 is Middle C (C4)
  		  fm.triggerAttackRelease(Tone.Midi(midiNoteNumber).toFrequency(), "64n");
  		  feedbackDelay.delayTime.value = p.random(10)/1000;
  		  triggerAlpha = 200;
  		  // Update time
  		  var timeSincePrevEvent = p.min(p.millis() - prevEventMillis, maxDuration);
  		  prevEventMillis = p.millis();
  		  var quantizedTimeSincePrevEvent = p.round(timeSincePrevEvent / timeQuantizationStep) * timeQuantizationStep;
  		  // Register node
  		  graph.registerNewNode(1, midiNoteNumber, quantizedTimeSincePrevEvent);
  		  // Activate key state
  		  keyStates[keyIndex] = 1;
  		}
	}

	p.keyReleased = () => {
		let keyIndex = keyOrder.indexOf(p.key);
		
		// Check if valid note key pressed
  		if (keyIndex >= 0) {
  		  // Stop synth
  		  let midiNoteNumber = notes[keyIndex]; // 0-127; 60 is Middle C (C4)
  		  console.log("release: " + midiNoteNumber);
  		  // Update time
  		  var timeSincePrevEvent = p.min(p.millis() - prevEventMillis, maxDuration);
  		  prevEventMillis = p.millis();
  		  var quantizedTimeSincePrevEvent = p.round(timeSincePrevEvent / timeQuantizationStep) * timeQuantizationStep;
  		  // Register node
  		  graph.registerNewNode(0, midiNoteNumber, quantizedTimeSincePrevEvent);
  		  // Reset key state
  		  keyStates[keyIndex] = 0;
  		  
  		  timeSincePrevEvent = 0;
  		} 
  		if(p.key == 'p') {
  		  loop();
  		}
	}
	p.mousePressed = () => {
		StartAudioContext(Tone.context).then(function(){});
	}
}

export default sketch;
new p5(sketch);


