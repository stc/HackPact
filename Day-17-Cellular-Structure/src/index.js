import p5 from 'p5/lib/p5.min';
import Tone from 'tone';

const sketch = (p) => {
    let w;
    let columns;
    let rows;
    let board;
    let next;
    let layers = [];
    let maxLayers = 70;

    let phaser;
    let synth;
    
    var freeverb = new Tone.Freeverb().toMaster();
        freeverb.dampening.value = 1600;
        freeverb.roomSize.value = 0.89;
        
    phaser = new Tone.Phaser({
            "frequency": 0.1,
            "octaves": 2,
            "baseFrequency": 1440
        }).toMaster();



    var osc = new Tone.Oscillator(0, "sine").connect(phaser).start();
    osc.volume.value = -16;

    var osc2 = new Tone.Oscillator(0, "square").connect(freeverb).start();
    osc2.volume.value = -30;

    var osc3 = new Tone.Oscillator(0, "sine").connect(phaser).start();
    osc3.volume.value = -4;
   

    let s = new Tone.MonoSynth({
            "oscillator" : {
                "type" : "sine"
            },
            "envelope" : {
                "attack" : 0.01,
                "decay" : 0.03,
                "sustain"  : 0.04,
                "release"  : 0.05
            }
        }).toMaster();

    let s2 = new Tone.MonoSynth({
            "oscillator" : {
                "type" : "sine"
            },
            "envelope" : {
                "attack" : 0.01,
                "decay" : 0.03,
                "sustain"  : 0.04,
                "release"  : 0.05
            }
        }).toMaster();

    s.volume.value = -14;
    s2.volume.value = -14;

    p.setup = () => {
        let canvas = p.createCanvas(800, 800, p.WEBGL);
        w = 50;
        columns = p.floor(p.width / w);
        rows = p.floor(p.height / w);
        board = new Array(columns);
        for (let i = 0; i < columns; i++) {
            board[i] = new Array(rows);
        }
        next = new Array(columns);
        for (let i = 0; i < columns; i++) {
            next[i] = new Array(rows);
        }
        init();
    }

    let a1, a2;
    p.draw = () => {
        p.camera(0,-500, -4000, 0, 0, 0, 0, 1, 0);
        p.background(240);
        p.smooth();

        //p.pointLight(255,255,255, -500, -500, -200);
        p.directionalLight(255,255,255, 0, 1, 1);
        p.ambientLight(60);

        p.rotateX(p.radians(-90));
        p.rotateZ(p.radians(-76) );
        p.rotateZ(p.frameCount/1000);
        p.translate(-w * columns / 2, -w * rows / 2, 0);
        
        if(layers.length < maxLayers) { 
            if(p.frameCount%4==0) {
                if(a1>1){
                    console.log(a1);
                    s.triggerAttackRelease(Tone.Midi((a1*5) + 40).toFrequency(),"64n");
                    s2.triggerAttackRelease(Tone.Midi((a2*5) + 40).toFrequency(),"64n");
                }
                generate();
            }
        }

        p.noStroke();            
         
        let avgx = [];
        let avgy = [];
        for(let h = 0; h < layers.length; h++) {
            
            p.push();
            p.translate(0,0,-h * w + 2000);
            for (var i = 0; i < columns; i++) {
                for (var j = 0; j < rows; j++) {
                    if ((layers[h][i][j] == 1)) {
                        avgx.push(i);
                        avgy.push(j);
                        p.push();
                        p.translate(i * w, j * w,0);
                        p.ambientMaterial(200); 
                        p.box((w - 1), (w - 1), (w - 1));
                        if(h == layers.length-1) {
                            p.ambientMaterial(255,0,0); 
                            //p.fill(255,0,0,200);
                        p.box((w - 1), (w - 1), (w - 1));
                        }
                        
                        p.pop();
                    } else {
                    
                    }
                }
            }
            p.pop();
        }

        a1 = avgx[avgx.length-1];
        a2 = avgy[avgy.length-1];
       
    }

    p.keyPressed = () => {
        init();
    }

    function init() {
        for (var i = 0; i < columns; i++) {
            for (var j = 0; j < rows; j++) {
                if (i == 0 || j == 0 || i == columns - 1 || j == rows - 1) board[i][j] = 0;
                else board[i][j] = p.floor(p.random(2));
                next[i][j] = 0;
            }
        }
    }
    
    function generate() {
        for (var x = 1; x < columns - 1; x++) {
            for (var y = 1; y < rows - 1; y++) {
                var neighbors = 0;
                for (var i = -1; i <= 1; i++) {
                    for (var j = -1; j <= 1; j++) {
                        neighbors += board[x + i][y + j];
                    }
                }
                neighbors -= board[x][y];
                if ((board[x][y] == 1) && (neighbors < 2)) next[x][y] = 0; // Loneliness
                else if ((board[x][y] == 1) && (neighbors > 3)) next[x][y] = 0; // Overpopulation
                else if ((board[x][y] == 0) && (neighbors == 3)) next[x][y] = 1; // Reproduction
                else next[x][y] = board[x][y]; // Stasis
            }
        }
        
        var temp = board;
        board = next;
        
        let tb = new Array(columns);
        for (let i = 0; i < columns; i++) {
            tb[i] = board[i].slice();
        }
        
        layers.push(tb);

        next = temp;

        
    }
}
export default sketch;
new p5(sketch);