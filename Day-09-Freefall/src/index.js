import p5 from 'p5';
import 'p5/lib/addons/p5.dom';
import Tone from 'tone';
import StartAudioContext from 'startaudiocontext';

const sketch = (p) => {
  class Boundary {
    constructor(i_, x_,y_, w_, h_) {
    

    this.x = x_;
    this.y = y_;
    this.w = w_;
    this.h = h_;
    this.fillColor = 255;
    this.density = i_;
    var fd = new box2d.b2FixtureDef();
    fd.density = i_;
    fd.friction = 0.5;
    fd.restitution = 0.2;
    fd.index = i_;
  
    var bd = new box2d.b2BodyDef();
  
    bd.type = box2d.b2BodyType.b2_staticBody;
    bd.position.x = scaleToWorld(this.x);
    bd.position.y = scaleToWorld(this.y);
    fd.shape = new box2d.b2PolygonShape();
    fd.shape.SetAsBox(this.w/(scaleFactor*2), this.h/(scaleFactor*2));
    this.body = world.CreateBody(bd).CreateFixture(fd);
  
    this.display = function() {
      p.strokeWeight(2);
      p.fill(0,100);
      p.stroke(255,200);
      p.push();
      p.translate(this.x,this.y,0);
      p.box(this.w,this.h,100);

      p.noStroke();
      p.fill(255,0,0,this.fillColor);
      p.box(this.w,this.h,100);

      p.pop();

      this.fillColor -=20;
    }
    } 
  }

  function Element(x, y) {
    this.w = 8;
    this.h = 24;
    this.r = 8;
  
    // Define a body
    var bd = new box2d.b2BodyDef();
    bd.type = box2d.b2BodyType.b2_dynamicBody;
    bd.position = scaleToWorld(x,y);
  
    var fd2 = new box2d.b2FixtureDef();
    fd2.shape = new box2d.b2CircleShape();
    fd2.shape.m_radius = scaleToWorld(this.r);
    var offset = scaleToWorld(new box2d.b2Vec2(0,0));
    fd2.shape.m_p = new box2d.b2Vec2(offset.x,offset.y);
    fd2.density = 0;
    fd2.friction = 0.01;
    fd2.restitution = .6;
  
    // Create the body
    this.body = world.CreateBody(bd);
    // Attach the fixture
    //this.body.CreateFixture(fd1);
    this.body.CreateFixture(fd2);
  
    // Some additional stuff
    this.body.SetLinearVelocity(new box2d.b2Vec2(p.random(-1, 1), p.random(2, 10)));
    this.body.SetAngularVelocity(p.random(-25,25));
  
    // This function removes the particle from the box2d world
    this.killBody = function() {
      world.DestroyBody(this.body);
    }
  
    // Is the particle ready for deletion?
    this.done = function() {
      // Let's find the screen position of the particle
      var pos = scaleToPixels(this.body.GetPosition());
      // Is it off the bottom of the screen?
      if (pos.y > p.height+this.w*this.h) {
        this.killBody();
        return true;
      }
      return false;
    }

    // Drawing the box
    this.display = function() {
      // Get the body's position
      var pos = scaleToPixels(this.body.GetPosition());
      // Get its angle of rotation
      var a = this.body.GetAngleRadians();
      
      // Draw it!
      p.rectMode(p.CENTER);
      p.push();
      p.translate(pos.x, pos.y);
      //p.rotate(a);
      p.noStroke();
      //p.rect(0,0,this.w,this.h);
      p.fill(255);
      p.sphere(this.r);
      p.pop();
    }
  }

  let fm = new Tone.MembraneSynth({
        "envelope"  : {
          "attack"  : 0.001 ,
          "decay"  : 0.002 ,
          "sustain"  : 0.03 ,
          "release"  : 0.1
        } 
      }).toMaster();

  fm.volume.value = -16;

  p.setup = () => {

    let canvas = p.createCanvas(800,800, p.WEBGL);
    p.smooth();

    world = createWorld();

    // Add a bunch of fixed boundaries
    boundaries.push(new Boundary( 0, p.width / 2, p.height / 3, 5, p.width / 8, 0));
    boundaries.push(new Boundary( 1, p.width / 2 - p.width/8, p.height / 3 + p.height/6, 140, 10, 0));
    boundaries.push(new Boundary( 2, p.width / 2 + p.width/8, p.height / 3 + p.height/6, 140, 10, 0));

    boundaries.push(new Boundary( 3, p.width / 2 - p.width/4, p.height / 2 + p.height/6, 140, 10, 0));
    boundaries.push(new Boundary( 4, p.width / 2 + p.width/4, p.height / 2 + p.height/6, 140, 10, 0));
    
    let listener = new box2d.b2ContactListener;
    listener.BeginContact = function(contact) {
        console.log(contact.m_fixtureA.m_density);
        for(let i=0;i<boundaries.length;i++) {
          if(boundaries[i].density === contact.m_fixtureA.m_density) {
            boundaries[i].fillColor = 255;
            fm.triggerAttackRelease(Tone.Midi(contact.m_fixtureA.m_density * 4 + 80).toFrequency(), "32n");
          }
        }
    }
    listener.EndContact = function(contact) {
        // console.log(contact.GetFixtureA().GetBody().GetUserData());
    }
    listener.PostSolve = function(contact, impulse) {}
    listener.PreSolve = function(contact, oldManifold) {}
    world.SetContactListener(listener);
    
  }

  let ptick1 = 0;
  p.draw = () => {

		p.frameRate(60);
		p.camera(p.mouseX - p.width/2, -200, 500, 0, 0, 0, 0, 1, 0);
		p.background(0);

    p.noFill();
    p.stroke(255,100);
    p.box(1000);

    p.translate(-p.width/2, -p.height/2, 0);

    // We must always step through time!
    let timeStep = 1.0/30;
    // 2nd and 3rd arguments are velocity and position iterations
    world.Step(timeStep,10,10);

    // Display all the boundaries
    for (let i = 0; i < boundaries.length; i++) {
      boundaries[i].display();
    }

    // Display all the boxes
    for (let i = pops.length-1; i >= 0; i--) {
      pops[i].display();
      if (pops[i].done()) {
        pops.splice(i,1);
      }
    }

    let tick1 = p.floor(p.millis()/1000);
    if(ptick1!=tick1) {
          var po = new Element(p.width/2,-200);
          pops.push(po);
        }
    
    ptick1 = tick1;
	}

  p.keyPressed = () => {
    if(p.key == 'm') {
      p.save(Date.now() + ".jpg");
    }
  }
  p.mousePressed = () => {
    StartAudioContext(Tone.context).then(function(){});
  }
}

export default sketch;
new p5(sketch);


