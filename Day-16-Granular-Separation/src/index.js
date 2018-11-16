import p5 from 'p5/lib/p5.min';
import Tone from 'tone';

const sketch = (p) => {
    var speed = 0.005;
    var circleSize = 20;
    var col = 1;
    var drawCirlces = false;
    var s = 200;
    var weaveFactors ;
    let loaded = false;

    var fft = new Tone.FFT(256);
    var player = new Tone.GrainPlayer({
            "url" : "../sound/tompa.[mp3|ogg]",
            "loop" : true,
            "grainSize" : 0.1,
            "overlap" : 0.05,
            "detune" : 2000
        }).fan(fft).toMaster();
    player.volume.value = -14;

    let index = 0;
    

    p.setup = () => {
        let canvas = p.createCanvas(800, 800, p.WEBGL);  
    }

    p.draw = () => {
        p.camera(p.cos(p.frameCount/80) * 150,-200 + p.sin(p.frameCount/120) * 150, 200, 0, 0, 0, 0, 1, 0);
        p.background(240);
        p.smooth(); 
        p.noFill();

        p.rotateZ(p.radians(30));

        
        var fftValues = fft.getValue();
        for (var x = 0; x < 16; x += 1) {
            for (var y = 0; y < 16; y+= 1) {
                index++;
                
                if(index>fftValues.length) index = 0;
                    var circleCenter = p.createVector(x * 10, y * 10);
                    weaveFactors = p.createVector(1 + p.sin(p.frameCount/300) * 150,1 + p.cos(p.frameCount/300) * 150).sub(p.width/2,p.height/2).mult(1/2000);
                    var dotCenter = newVec(x,y);
                    dotCenter.add(circleCenter);
                    
                p.fill(col);
                
                p.stroke(0,80);
                p.line(dotCenter.x, dotCenter.y,(fftValues[index]), dotCenter.x, dotCenter.y, -300)
                p.push();
                p.push();
                p.translate(dotCenter.x, dotCenter.y, -300);
                p.fill(255);
                p.noStroke();
                p.sphere(circleSize/8);
                p.pop();
                p.translate(dotCenter.x, dotCenter.y, (fftValues[index]));
                p.fill(0);
                p.sphere(circleSize/8);
                p.pop();
            }
        }

        if(loaded) {
            player.grainSize = 0.05 + p.abs((p.sin(p.frameCount/300)) / 10);
        }
    }

    p.keyPressed = () => {
        loaded = true;
        player.start();
    }

    function newVec(x,y) {
        let vec = p5.Vector.fromAngle(p.millis()*speed + x*weaveFactors.x + y*weaveFactors.y, circleSize/2)
        return vec;
    }
}
export default sketch;
new p5(sketch);