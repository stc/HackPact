import p5 from 'p5/lib/p5.min';
import Tone from 'tone';

const sketch = (p) => {
    var phaser = new Tone.Phaser({
        "frequency": 0.5,
        "octaves": 0.5,
        "baseFrequency": 1600
    }).toMaster();

    var chorus = new Tone.Chorus(0.8, 2.5, 0.2).toMaster();
    
    class Hexagon {
      constructor(note, x, y, s) {
        this.note = note;
        this.x = x;
        this.y = y;
        this.s = s;
        this.canplay = true;
        this.fillColor = 0;

        this.fm = new Tone.PolySynth(8, Tone.Synth, {
        "oscillator": {
            "partials": [100, 20, 30, 4],
        },
        "envelope": {
            attack: 0.3,
            decay: 0.6,
            sustain: 4,
            release: 6
        },
      }).chain(chorus, phaser);
        this.fm.volume.value = -4;
      }

      draw() {
        p.push();
        p.noStroke();
        p.translate(this.x,this.y,0);

        if(this.note == "C#4") {
          p.ambientMaterial((255/9) * 5  );
        }
        else if(this.note == "G#4" || this.note == "G#3") {
          p.ambientMaterial( (255/9) * 4);

        }
        else if(this.note == "D#5" || this.note == "D#4" || this.note == "D#3") {
          p.ambientMaterial( (255/9) * 6);
        }

        else if(this.note == "A#4" || this.note == "A#3") {
          p.ambientMaterial( (255/9) * 3);

        }

        else if(this.note == "F5" || this.note == "F4" || this.note == "F3") {
          p.ambientMaterial( (255/9) * 7);
        }

        else if(this.note == "C5" || this.note == "C4") {
          p.ambientMaterial( (255/9) * 2);
        }

        else if(this.note == "G5" || this.note == "G4" || this.note == "G3") {
          p.ambientMaterial( (255/9) * 8);
        }

        else if(this.note == "D5" || this.note == "D4") {
          p.ambientMaterial( (255/9) * 1);

        }
        else if(this.note == "A4") {
          p.ambientMaterial( (255/9) * 9);

        }

        p.push();
        p.translate(0,0,-this.s/2);
        p.rotateX(-p.HALF_PI);
        p.cylinder(this.s * 1.8, this.s/2, 6);
        p.fill(255,0,0,this.fillColor);
        p.cylinder(this.s * 1.9, this.s/1.8, 6);
        p.pop()
        p.pop();

        this.fillColor-=10;
      }
    }

    let xVal = 0;
    let yVal = 0;
    let pMouseX = 0;
    let pMouseY = 0;
    let ballX = 0;
    let ballY = 0;

    let tiles = [];

    p.setup = () => {
        let canvas = p.createCanvas(800, 800, p.WEBGL);
    
        tiles.push( new Hexagon("C#4", -200, 0, 30) );
        tiles.push( new Hexagon("G#4", -150, -100, 30) );
        tiles.push( new Hexagon("G#3", -150, 100, 30) );
        tiles.push( new Hexagon("D#5", -100, -200, 30) );
        tiles.push( new Hexagon("D#4", -100, 0, 30) );
        tiles.push( new Hexagon("D#3", -100, 200, 30) );
        tiles.push( new Hexagon("A#4", -50, -100, 30) );
        tiles.push( new Hexagon("A#3", -50, 100, 30) );
        tiles.push( new Hexagon("F5", 0, -200, 30) );
        tiles.push( new Hexagon("F4", 0, 0, 30) );
        tiles.push( new Hexagon("F3", 0, 200, 30) );
        tiles.push( new Hexagon("C5", 50, -100, 30) );
        tiles.push( new Hexagon("C4", 50, 100, 30) );
        tiles.push( new Hexagon("G5", 100, -200, 30) );
        tiles.push( new Hexagon("G4", 100, 0, 30) );
        tiles.push( new Hexagon("G3", 100, 200, 30) );
        tiles.push( new Hexagon("D5", 150, -100, 30) );
        tiles.push( new Hexagon("D4", 150, 100, 30) );
        tiles.push( new Hexagon("A4", 200, 0, 30) );
    }

    let tx = 0;
    let ty = 10000;
    let nx = 0;
    let ny = 0;

    p.draw = () => {
        //p.camera(p.frameCount/5 - 400,-200, -600, 0, 0, 0, 0, 1, 0);
        p.background(0);
        p.smooth();

        p.pointLight(150, 150, 150, 500, 0, 100);
        p.directionalLight(255,255,255, 0, 1, -1);
        p.ambientLight(200);

        nx = p.map(p.noise(tx), 0, 1, p.width/2 - p.width/6, p.width - p.width/3);
        ny = p.map(p.noise(ty), 0, 1, p.height, p.height/2);

        // mouse
        //xVal = p.map(p.mouseX, 0, p.width,-p.PI/4, p.PI/4);
        //yVal = p.map(p.mouseY, 0, p.width,p.PI/4, -p.PI/4);

        // noise
        xVal = p.map(nx, 0, p.width,-p.PI/4, p.PI/4);
        yVal = p.map(ny, 0, p.height,p.PI/4, -p.PI/4);
        
        tx += 0.01;
        ty += 0.005;
        
        if( (ballX > -150) && (ballX < 150) ) {
          ballX += xVal * 20;
        } else {
          if(ballX <= -150) {
            ballX = -149;
          }
          if(ballX >= 150) {
            ballX = 149;
          }
        }
        if( (ballY > -150) && (ballY < 150) ) {
          ballY -= (yVal+p.PI/8) * 32;
        } else {
          if(ballY <= -150) {
            ballY = -149;
          }
          if(ballY >= 150) {
            ballY = 149;
          }
        }

        ballX = ballX + p.sin(p.frameCount/30) * 4;
        ballY = ballY + p.cos(p.frameCount/30) * 4;
        
        
        p.push();
        p.rotateX(p.radians(80));
        p.rotateY(xVal);
        p.rotateX(yVal);

        for(let i=0; i<tiles.length; i++) {
          tiles[i].draw();
          if(p.dist(ballX,ballY,tiles[i].x,tiles[i].y) < tiles[i].s*2) {
            if(tiles[i].canPlay) tiles[i].fm.triggerAttackRelease(tiles[i].note, "64n");
            tiles[i].canPlay = false;
            tiles[i].fillColor = 200;
          } else {
            tiles[i].canPlay = true;
          }
        }

        p.stroke(255,200);
        p.line(ballX,ballY,220,ballX,ballY,0);
        p.noFill();
        p.stroke(255,100);
        p.ellipse(ballX,ballY,10,10);
        p.ellipse(ballX,ballY,20,20);
        p.ellipse(ballX,ballY,40,40);
        
        p.noStroke();
        p.fill(255,200);
        p.push();
        p.translate(ballX,ballY,220);
        p.sphere(15);
        
        p.pop();

        p.pop();

        pMouseX = p.mouseX;
        pMouseY = p.mouseY;

    }

    p.keyPressed = () => {
        if(p.key == 'm') {
            p.save(Date.now() + ".jpg");
        }
    }
}
export default sketch;
new p5(sketch);