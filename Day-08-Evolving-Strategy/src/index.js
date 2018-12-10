import p5 from 'p5';
import 'p5/lib/addons/p5.dom';
import Tone from 'tone';

const sketch = (p) => {
	let W = 600;
	let H = 400;
	let c = 0;

	function resetGame() {
    counter = 0;
  
    // Resetting best bird score to 0
    if (bestBird) {
    bestBird.score = 0;
  }
  pipes = [];
  c = 255;
  bell.triggerAttackRelease('1n' );
}

// Create the next generation
function nextGeneration() {
  resetGame();
  // Normalize the fitness values 0-1
  normalizeFitness(allBirds);
  // Generate a new set of birds
  activeBirds = generate(allBirds);
  // Copy those birds to another array
  allBirds = activeBirds.slice();
}

// Generate a new population of birds
function generate(oldBirds) {
  let newBirds = [];
  for (let i = 0; i < oldBirds.length; i++) {
    // Select a bird based on fitness
    let bird = poolSelection(oldBirds);
    newBirds[i] = bird;
  }
  return newBirds;
}

// Normalize the fitness of all birds
function normalizeFitness(birds) {
  // Make score exponentially better?
  for (let i = 0; i < birds.length; i++) {
    birds[i].score = p.pow(birds[i].score, 2);
  }

  // Add up all the scores
  let sum = 0;
  for (let i = 0; i < birds.length; i++) {
    sum += birds[i].score;
  }
  // Divide by the sum
  for (let i = 0; i < birds.length; i++) {
    birds[i].fitness = birds[i].score / sum;
  }
}


// An algorithm for picking one bird from an array
// based on fitness
function poolSelection(birds) {
  // Start at 0
  let index = 0;

  // Pick a random number between 0 and 1
  let r = p.random(1);

  // Keep subtracting probabilities until you get less than zero
  // Higher probabilities will be more likely to be fixed since they will
  // subtract a larger number towards zero
  while (r > 0) {
    r -= birds[index].fitness;
    // And move on to the next
    index += 1;
  }

  // Go back one
  index -= 1;

  // Make sure it's a copy!
  // (this includes mutation)
  return birds[index].copy();
}
	function mutate(x) {
  if (p.random(1) < 0.1) {
    let offset = p.randomGaussian() * 0.5;
    let newx = x + offset;
    return newx;
  } else {
    return x;
  }
}

class Pipe {
  constructor() {

    // How big is the empty space
    let spacing = 100;
    // Where is th center of the empty space
    let centery = p.random(spacing, H - spacing);

    // Top and bottom of pipe
    this.top = centery - spacing / 2;
    this.bottom = H - (centery + spacing / 2);
    // Starts at the edge
    this.x = W*2;
    // Width of pipe
    this.w = 40;
    // How fast
    this.speed = 6;
  }

  // Did this pipe hit a bird?
  hits(bird) {
    if ((bird.y - bird.r) < this.top || (bird.y + bird.r) > (H - this.bottom)) {
      if (bird.x > this.x && bird.x < this.x + this.w) {
        return true;
      }
    }
    return false;
  }

  // Draw the pipe
  show() {
    p.noStroke();
    p.fill(255,30);
    p.strokeWeight(3);
    p.stroke(255,200);
    p.push();
    //p.rect(this.x, 0, this.w, this.top);
    p.translate(this.x + this.w/2,this.top/2,0);
    p.box(this.w,this.top,100);
    p.pop();

    p.push();
    p.translate(this.x + this.w/2, H-this.bottom/2,0);
    //p.rect(this.x, H - this.bottom, this.w, this.bottom);
    p.box(this.w,this.bottom,100);
    p.pop();
  }

  // Update the pipe
  update() {
    this.x -= this.speed;
  }

  // Has it moved offscreen?
  offscreen() {
    if (this.x < -W * 4) {
      return true;
    } else {
      return false;
    }
  }
}

class Bird {
  constructor(brain) {
    // position and size of bird
    this.x = 64;
    this.y = H / 2;
    this.r = 12;

    // Gravity, lift and velocity
    this.gravity = 0.8;
    this.lift = -12;
    this.velocity = 0;

    // Is this a copy of another Bird or a new one?
    // The Neural Network is the bird's "brain"
    if (brain instanceof NeuralNetwork) {
      this.brain = brain.copy();
      this.brain.mutate(mutate);
    } else {
      this.brain = new NeuralNetwork(5, 8, 2);
    }

    // Score is how many frames it's been alive
    this.score = 0;
    // Fitness is normalized version of score
    this.fitness = 0;
  }

  // Create a copy of this bird
  copy() {
    return new Bird(this.brain);
  }

  // Display the bird
  show() {
    p.fill(255, 100);
    p.noStroke();
    p.fill(255);
    p.push();
    p.translate(this.x, this.y,0);
    p.sphere(this.r);
    p.pop();
  }

  // This is the key function now that decides
  // if it should jump or not jump!
  think(pipes) {
    // First find the closest pipe
    let closest = null;
    let record = Infinity;
    for (let i = 0; i < pipes.length; i++) {
      let diff = pipes[i].x - this.x;
      if (diff > 0 && diff < record) {
        record = diff;
        closest = pipes[i];
      }
    }

    if (closest != null) {
      // Now create the inputs to the neural network
      let inputs = [];
      // x position of closest pipe
      inputs[0] = p.map(closest.x, this.x, W, 0, 1);
      // top of closest pipe opening
      inputs[1] = p.map(closest.top, 0, H, 0, 1);
      // bottom of closest pipe opening
      inputs[2] = p.map(closest.bottom, 0, H, 0, 1);
      // bird's y position
      inputs[3] = p.map(this.y, 0, H, 0, 1);
      // bird's y velocity
      inputs[4] = p.map(this.velocity, -5, 5, 0, 1);

      // Get the outputs from the network
      let action = this.brain.predict(inputs);
      // Decide to jump or not!
      if (action[1] > action[0]) {
        this.up();
      }
    }
  }

  // Jump up
  up() {
    this.velocity += this.lift;
    if(this.y > 0) {
      if(runBest) {
        pingPong.delayTime.value = p.random(40)/3000;
        fm.triggerAttackRelease(Tone.Midi(p.floor(p.map(this.y,0,H,2,10)) *5).toFrequency(), "64n");
      }
    }
  }

  bottomTop() {
    // Bird dies when hits bottom?
    return (this.y > H || this.y < 0);
  }

  // Update bird's position based on velocity, gravity, etc.
  update() {
    this.velocity += this.gravity;
    // this.velocity *= 0.9;
    this.y += this.velocity;

    // Every frame it is alive increases the score
    this.score++;
  }
}

	var bestBird;
	// How big is the population
	let totalPopulation = 400;
	// All active birds (not yet collided with pipe)
	let activeBirds = [];
	// All birds for any given population
	let allBirds = [];
	// Pipes
	let pipes = [];
	// A frame counter to determine when to add a pipe
	let counter = 0;
	
	// Interface elements
	let speedSlider;
	let speedSpan;
	let highScoreSpan;
	let allTimeHighScoreSpan;
	
	// All time high score
	let highScore = 0;
	
	// Training or just showing the current best
	let runBest = false;
	let runBestButton;


	p.setup = () => {
		let canvas = p.createCanvas(800,800, p.WEBGL);
		p.smooth();
		
  		// Access the interface elements
  		
  		speedSlider = p.select('#speedSlider');
  		speedSpan = p.select('#speed');
  		highScoreSpan = p.select('#hs');
  		allTimeHighScoreSpan = p.select('#ahs');
  		runBestButton = p.select('#best');
  		
  		runBestButton.mousePressed(toggleState);

  		// Create a population
  		for (let i = 0; i < totalPopulation; i++) {
    		let bird = new Bird();
    		activeBirds[i] = bird;
    		allBirds[i] = bird;
  		}
	}

	// Toggle the state of the simulation
	function toggleState() {
  		runBest = !runBest;
  		// Show the best bird
  		if (runBest) {
    		resetGame();
    		runBestButton.html('continue training');
   		 	// Go train some more
  		} else {
    		nextGeneration();
    		runBestButton.html('run best');
  		}
	}
  var pingPong = new Tone.PingPongDelay("32n", 0.7).toMaster();

	let fm = new Tone.FMSynth({
				"harmonicity"  : 12 ,
				"modulationIndex"  : 40 ,
				"detune"  : 0 ,
				"oscillator"  : {
					"type"  : "sine"
				}  ,
				"envelope"  : {
					"attack"  : 0.003 ,
					"decay"  : 0.1 ,
					"sustain"  : 0.5 ,
					"release"  : 2
				}  ,
				"modulation"  : {
					"type"  : "square"
				}  ,
				"modulationEnvelope"  : {
					"attack"  : 0.02 ,
					"decay"  : 0.2 ,
					"sustain"  : 0.3 ,
					"release"  : 3
				}
			}).connect(pingPong);
	fm.volume.value = -15;

  

	var bell = new Tone.MetalSynth({
			"harmonicity" : 16,
			"resonance" : 60,
			"modulationIndex" : 80,
			"envelope" : {
				"attack" : 0.1, 
				"decay" : 2.8,
				"sustain" : 10,
				"release"  : 14
			},
			"volume" : -30
		}).toMaster()

	p.draw = () => {
		
		p.frameRate(60);
		p.camera(0, 0, 1500, 0, 0, 0, 0, 1, 0);
		p.background(0);



		p.rotateX(p.radians(20));
		p.fill(255,30);
		p.rect(-2000,-400,4000,800);
		p.fill(255,0,0, c);
		p.stroke(0,100);
		p.rect(-2000,-400,4000,800);

		p.translate(-W/2,-H/2,0);

		c-=10;

		// Should we speed up cycles per frame
  let cycles = speedSlider.value();
  speedSpan.html(cycles);


  // How many times to advance the game
  for (let n = 0; n < cycles; n++) {
    // Show all the pipes
    for (let i = pipes.length - 1; i >= 0; i--) {
      pipes[i].update();
      if (pipes[i].offscreen()) {
        pipes.splice(i, 1);
      }
    }
    // Are we just running the best bird
    if (runBest) {
      bestBird.think(pipes);
      bestBird.update();
      for (let j = 0; j < pipes.length; j++) {
        // Start over, bird hit pipe
        if (pipes[j].hits(bestBird)) {
          resetGame();
          break;
        }
      }

      if (bestBird.bottomTop()) {
        resetGame();
      }
      // Or are we running all the active birds
    } else {
      for (let i = activeBirds.length - 1; i >= 0; i--) {
        let bird = activeBirds[i];
        // Bird uses its brain!
        bird.think(pipes);
        bird.update();

        // Check all the pipes
        for (let j = 0; j < pipes.length; j++) {
          // It's hit a pipe
          if (pipes[j].hits(activeBirds[i])) {
            // Remove this bird
            activeBirds.splice(i, 1);
            break;
          }
        }

        if (bird.bottomTop()) {
          activeBirds.splice(i, 1);
        }

      }
    }

    // Add a new pipe every so often
    if (counter % 75 == 0) {
      pipes.push(new Pipe());
    }
    counter++;
  }

  // What is highest score of the current population
  let tempHighScore = 0;
  // If we're training
  if (!runBest) {
    // Which is the best bird?
    let tempBestBird = null;
    for (let i = 0; i < activeBirds.length; i++) {
      let s = activeBirds[i].score;
      if (s > tempHighScore) {
        tempHighScore = s;
        tempBestBird = activeBirds[i];
      }
    }

    // Is it the all time high scorer?
    if (tempHighScore > highScore) {
      highScore = tempHighScore;
      bestBird = tempBestBird;
    }
  } else {
    // Just one bird, the best one so far
    tempHighScore = bestBird.score;
    if (tempHighScore > highScore) {
      highScore = tempHighScore;
    }
  }

  // Update DOM Elements
  highScoreSpan.html(tempHighScore);
  allTimeHighScoreSpan.html(highScore);

  // Draw everything!
  for (let i = 0; i < pipes.length; i++) {
    pipes[i].show();
  }

  if (runBest) {
    bestBird.show();
  } else {
    for (let i = 0; i < activeBirds.length; i++) {
      activeBirds[i].show();
    }
    // If we're out of birds go to the next generation
    if (activeBirds.length == 0) {
      nextGeneration();
    }
  }

	}
}

export default sketch;
new p5(sketch);


