import p5 from 'p5/lib/p5.min';
import Tone from 'tone';

const sketch = (p) => {
    var speed = 0.001;
    var circleSize = 20;
    var col = 1;
    var drawCirlces = false;
    var s = 200;
    var weaveFactors ;
    let loaded = false;


    var fft = new Tone.FFT(64);
    var player = new Tone.GrainPlayer({
            "url" : "./sound/tompa.[mp3|ogg]",
            "loop" : true,
            "grainSize" : 0.01,
            "overlap" : 0.05,
            "detune" : 2000
        }).fan(fft).toMaster();
    player.volume.value = -14;

    let index = 0;
    

    p.setup = () => {
        let canvas = p.createCanvas(800, 800, p.WEBGL);  
    }

    p.draw = () => {
        p.camera(0,150, 300, 0, 0, 0, 0, 1, 0);
        p.background(0);
        p.smooth(); 
        p.noFill();

        p.rotateX(p.radians(30));
        p.translate(-100,-200,100);

        
        var fftValues = fft.getValue();
        for (var x = 0; x < 8; x += 1) {
            for (var y = 0; y < 8; y+= 1) {
                //index++;
                
                if(index>fftValues.length) index = 0;
                    var circleCenter = p.createVector(x * 30, y * 30);
                    weaveFactors = p.createVector(p.sin(p.frameCount/300) * 300,p.cos(p.frameCount/300) * 300).sub(0,0,0).mult(1/1000);
                    var dotCenter = newVec(x,y);
                    dotCenter.add(circleCenter);
                    
                p.fill(col);
                
                p.stroke(255,40);
                p.line(dotCenter.x, dotCenter.y,(fftValues[x*y] * 2), dotCenter.x, dotCenter.y, -300)
                p.push();
                p.push();
                p.translate(dotCenter.x, dotCenter.y, -300);
                p.fill(100,100);
                p.noStroke();
                p.sphere(circleSize/4);
                p.pop();
                p.translate(dotCenter.x, dotCenter.y, (fftValues[x*y]*2));
                p.fill(255);
                p.sphere(circleSize/8);
                p.pop();
            }
        }

        if(loaded) {
            player.grainSize = 0.05 + (p.sin(p.frameCount/100) + 1);
        }
    }

    p.keyPressed = () => {
        loaded = true;
        player.start();
    }

    p.mousePressed = () => {
        //sampler.detune = p.ceil(p.random(4)) * 1000;
    }

    function newVec(x,y) {
        let vec = p5.Vector.fromAngle(p.millis()*speed + x*weaveFactors.x + y*weaveFactors.y, circleSize/2)
        return vec;
    }
}
export default sketch;
new p5(sketch);