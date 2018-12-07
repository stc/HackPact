import p5 from 'p5';
import Tone from 'tone';

const sketch = (p) => {
  class Vehicle {
    constructor(x, y, ms, mf) {
      this.position = p.createVector(x, y);
      this.acceleration = p.createVector(0, 0);
      this.velocity = p.createVector(0, 0);
      this.r = 4;
      this.maxspeed = 0.9;
      this.maxforce = 0.005;
    }
  
    run() {
      this.update();
      this.borders();
      this.display();
    }
  
    // Implementing Reynolds' flow field following algorithm
    // http://www.red3d.com/cwr/steer/FlowFollow.html
    follow(flow) {
      // What is the vector at that spot in the flow field?
      let desired = flow.lookup(this.position);
      // Scale it up by maxspeed
      desired.mult(this.maxspeed);
      // Steering is desired minus velocity

      let steer = desired.sub(this.velocity);
      steer.limit(this.maxforce); // Limit to maximum steering force
      this.applyForce(steer);
    }
  
    applyForce(force) {
      // We could add mass here if we want A = F / M
      this.acceleration.add(force);
    }
  
    // Method to update location
    update() {
      // Update velocity
      this.velocity.add(this.acceleration);
      // Limit speed
      this.velocity.limit(this.maxspeed);
      this.position.add(this.velocity);
      // Reset accelerationelertion to 0 each cycle
      this.acceleration.mult(0);
    }
    
    // Wraparound
    borders() {
      if (this.position.x < -this.r) this.position.x = p.width + this.r;
      if (this.position.y < -this.r) this.position.y = p.height + this.r;
      if (this.position.x > p.width + this.r) this.position.x = -this.r;
      if (this.position.y > p.height + this.r) this.position.y = -this.r;
    }
  
    display() {
      // Draw a triangle rotated in the direction of velocity
      let theta = this.velocity.heading() + p.PI / 2;
      p.fill(0,100);
      p.noStroke(0);
      p.push();
      p.translate(this.position.x, this.position.y);
      let targetX = theta;
      let dx = targetX - this.aa;
      this.aa += dx * this.easing;
      p.rotate(theta);
      //p.beginShape();
      //p.vertex(0, -this.r * 2);
      //p.vertex(-this.r, this.r * 2);
      //p.vertex(this.r, this.r * 2);
      //p.endShape(p.CLOSE);
      p.box(1,50,1);
      p.fill(255);
      p.sphere(2);
      p.pop();
    }
  }

  class FlowField {
    constructor(r) {
      // How large is each "cell" of the flow field
      this.resolution = r;
      // Determine the number of columns and rows based on sketch's width and height
      this.cols = p.width / this.resolution;
      this.rows = p.height / this.resolution;
      // A flow field is a two dimensional array of p.Vectors
      // We can't make 2D arrays, but this is sort of faking it
      this.field = this.make2Darray(this.cols);
      this.init();
    }

    make2Darray(n) {
      let array = [];
      for (let i = 0; i < n; i++) {
        array[i] = [];
      }
      return array;
    }

    init() {
      // Reseed noise so we get a new flow field every time
      // Need to get noise working
      p.noiseSeed(Math.floor(p.random(10000)));
      let xoff = 0;
      for (let i = 0; i < this.cols; i++) {
        let yoff = 0;
        for (let j = 0; j < this.rows; j++) {
          let theta = p.map(p.noise(xoff, yoff), 0, 1, 0, p.TWO_PI);
          //let theta = map(sin(xoff)+cos(yoff),-2,2,0,TWO_PI);
          // Polar to cartesian coordinate transformation to get x and y components of the vector
          this.field[i][j] = p.createVector(p.cos(theta), p.sin(theta));
          yoff += 0.1;
        }
        xoff += 0.1;
      }
    }

    // Draw every vector
    display() {
      for (let i = 0; i < this.cols; i++) {
        for (let j = 0; j < this.rows; j++) {
          this.drawVector(this.field[i][j], i * this.resolution, j * this.resolution, this.resolution - 2);
        }
      }
    }

    lookup(lookup) {
      let column = Math.floor(p.constrain(lookup.x / this.resolution, 0, this.cols - 1));
      let row = Math.floor(p.constrain(lookup.y / this.resolution, 0, this.rows - 1));
      //println(lookup.x);
      return this.field[column][row].copy();
    }

    // Renders a vector object 'v' as an arrow and a location 'x,y'
    drawVector(v, x, y, scayl) {
      p.push();
      let arrowsize = 4;
      // Translate to location to render vector
      p.translate(x, y);
      p.stroke(200, 100);
      // Call vector heading function to get direction (note that pointing to the right is a heading of 0) and rotate
      p.rotate(v.heading());
      // Calculate length of vector & scale it to be bigger or smaller if necessary
      let len = v.mag() * scayl;
      // Draw three lines to make an arrow (draw pointing up since we've rotate to the proper direction)
      p.line(0, 0, len, 0);
      //line(len,0,len-arrowsize,+arrowsize/2);
      //line(len,0,len-arrowsize,-arrowsize/2);
      p.pop();
    }
  }
  
  var noise = new Tone.Noise("pink").start();

//make an autofilter to shape the noise
var autoFilter = new Tone.AutoFilter({
  "frequency" : "8m",
  "min" : 800,
  "max" : 15000
}).connect(Tone.Master);

//connect the noise
noise.connect(autoFilter);
//start the autofilter LFO
autoFilter.start()
  

  let debug = true;

  // Flowfield object
  let flowfield1, flowfield2;
  // An ArrayList of vehicles
  let vehicles1 = []; 
  let vehicles2 = [];

  p.setup = () => {
    let canvas = p.createCanvas(800,800, p.WEBGL);
    p.smooth();

   flowfield1 = new FlowField(10);
    // Make a whole bunch of vehicles with random maxspeed and maxforce values
    for (let i = 0; i < 300; i++) {
      vehicles1.push(new Vehicle(p.random(p.width), p.random(p.height), p.random(2, 5), p.random(0.1, 0.5)));
    }

    flowfield2 = new FlowField(40);
    // Make a whole bunch of vehicles with random maxspeed and maxforce values
    for (let i = 0; i < 300; i++) {
      vehicles2.push(new Vehicle(p.random(p.width), p.random(p.height), p.random(2, 5), p.random(0.1, 0.5)));
    }
  }

  p.draw = () => {
    p.frameRate(60);
		p.camera(0, -100, 800, 0, 0, 0, 0, 1, 0);
		p.background(240);

    p.translate(-p.width/2,-p.height/2,0);
    p.rotateX(p.PI/4);
    for (let i = 0; i < vehicles1.length; i++) {
      vehicles1[i].follow(flowfield1);
      vehicles1[i].run();
    }

    p.translate(0,200,0);
    for (let i = 0; i < vehicles2.length; i++) {
      vehicles2[i].follow(flowfield2);
      vehicles2[i].run();
    }
  }
}

export default sketch;
new p5(sketch);


