import p5 from 'p5';
import 'p5/lib/addons/p5.dom';
import tone from 'tone';



const sketch = (p5) => {
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
      p5.fill(255,100);
      p5.stroke(0,100);
      p5.push();
      p5.translate(this.x,this.y,0);
      p5.box(this.w,this.h,100);

      p5.noStroke();
      p5.fill(255,0,0,this.fillColor);
      p5.box(this.w,this.h,100);

      p5.pop();

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
    this.body.SetLinearVelocity(new box2d.b2Vec2(p5.random(-1, 1), p5.random(2, 10)));
    this.body.SetAngularVelocity(p5.random(-25,25));
  
    // This function removes the particle from the box2d world
    this.killBody = function() {
      world.DestroyBody(this.body);
    }
  
    // Is the particle ready for deletion?
    this.done = function() {
      // Let's find the screen position of the particle
      var pos = scaleToPixels(this.body.GetPosition());
      // Is it off the bottom of the screen?
      if (pos.y > p5.height+this.w*this.h) {
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
      p5.rectMode(p5.CENTER);
      p5.push();
      p5.translate(pos.x, pos.y);
      //p5.rotate(a);
      p5.noStroke();
      //p5.rect(0,0,this.w,this.h);
      p5.fill(0);
      p5.sphere(this.r);
      p5.pop();
    }
  }

  let fm = new tone.MembraneSynth({
        "envelope"  : {
          "attack"  : 0.001 ,
          "decay"  : 0.002 ,
          "sustain"  : 0.03 ,
          "release"  : 0.1
        } 
      }).toMaster();

  fm.volume.value = -16;

  p5.setup = () => {
    let canvas = p5.createCanvas(800,800, p5.WEBGL);
    p5.smooth();

    world = createWorld();

    // Add a bunch of fixed boundaries
    boundaries.push(new Boundary( 0, p5.width / 2, p5.height / 3, 5, p5.width / 8, 0));
    boundaries.push(new Boundary( 1, p5.width / 2 - p5.width/8, p5.height / 3 + p5.height/6, 140, 10, 0));
    boundaries.push(new Boundary( 2, p5.width / 2 + p5.width/8, p5.height / 3 + p5.height/6, 140, 10, 0));

    boundaries.push(new Boundary( 3, p5.width / 2 - p5.width/4, p5.height / 2 + p5.height/6, 140, 10, 0));
    boundaries.push(new Boundary( 4, p5.width / 2 + p5.width/4, p5.height / 2 + p5.height/6, 140, 10, 0));
    
    let listener = new box2d.b2ContactListener;
    listener.BeginContact = function(contact) {
        console.log(contact.m_fixtureA.m_density);
        for(let i=0;i<boundaries.length;i++) {
          if(boundaries[i].density === contact.m_fixtureA.m_density) {
            boundaries[i].fillColor = 255;
            fm.triggerAttackRelease(tone.Midi(contact.m_fixtureA.m_density * 4 + 80).toFrequency(), "32n");
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
	p5.draw = () => {
		p5.frameRate(60);
		p5.camera(p5.frameCount/5, -200, 500, 0, 0, 0, 0, 1, 0);
		p5.background(240);

    p5.noFill();
    p5.stroke(0,100);
    p5.box(1000);

    p5.translate(-p5.width/2, -p5.height/2, 0);

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

    let tick1 = p5.floor(p5.millis()/1000);
    if(ptick1!=tick1) {
          var p = new Element(p5.width/2,-200);
          pops.push(p);
        }
    
    ptick1 = tick1;
	}
}

export default sketch;
new p5(sketch);


