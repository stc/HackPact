import p5 from 'p5/lib/p5.min';
import Tone from 'tone';

const sketch = (p) => {
	let count = 1 + 20;
	let durationTime = 1200/count;
    
    let arrayA = [];
    for(let i=0;i<count;i++) arrayA.push(i);
    shuffle(arrayA);

    let unsortedArrayA = [...arrayA];
    let sortedArrayA = [];
    let stopA = false;
    
    let cElementA = 0;

    let arrayB = [];
    for(let i=0;i<count;i++) arrayB.push(i);
    shuffle(arrayB);

    let unsortedArrayB = [...arrayB];
    let sortedArrayB = [];
    let stopB = false;
    
    let cElementB = 0;

    let freeverb = new Tone.Freeverb().toMaster();
	freeverb.dampening.value = 1600;
	freeverb.roomSize.value = 0.92;

    let synth1 = new Tone.Synth({
			"oscillator" : {
				"type" : "amtriangle",
				"harmonicity" : 0.5,
				"modulationType" : "sine"
			},
			"envelope" : {
				"attackCurve" : 'exponential',
				"attack" : 0.05,
				"decay" : 0.2,
				"sustain" : 0.2,
				"release" : 0.5,
			},
			"portamento" : 0.02
			
		}).connect(freeverb);

    synth1.volume.value = -24;
    let synth2 = new Tone.Synth({
			"oscillator" : {
				"type" : "amtriangle",
				"harmonicity" : 0.5,
				"modulationType" : "sine"
			},
			"envelope" : {
				"attackCurve" : 'exponential',
				"attack" : 0.05,
				"decay" : 0.2,
				"sustain" : 0.2,
				"release" : 0.5,
			},
			"portamento" : 0.02
		}).connect(freeverb);
    synth2.volume.value = -24;

	p.setup = () => {
		let canvas = p.createCanvas(800,800, p.WEBGL);	
		insertionSort();
		bubbleSort();
	}

	p.draw = () => {
		p.camera(200, -400, 1000, 0, 0, 0, 0, 1, 0);
		p.background(240);
		p.smooth();

		p.strokeWeight(2);

		let resultA = sortedArrayA.concat(unsortedArrayA);

		p.rotateY(-p.radians(30));

		for(let i=0; i< count; i++) {
			p.ambientMaterial(255);
			p.stroke(0,200);
			if(cElementA == i) {
				p.ambientMaterial(255,0,0);
				p.stroke(255,0,0);
			}
			p.push();

			p.line(i * 50 - 700, 0, -200, i * 50 - 700, -resultA[i] * 20, -200);
			p.translate(i * 50 - 700, 0, -200);
			p.box(20);
			p.translate(0,-resultA[i] * 20,0);
			p.box(20);
			p.pop();
		}

		let resultB = sortedArrayB.concat(unsortedArrayB);

		p.rotateX(p.radians(-90));
		for(let i=0; i< count; i++) {
			p.ambientMaterial(255);
			p.stroke(0,200);
			if(cElementB == i) {
				p.ambientMaterial(255,0,0);
				p.stroke(255,0,0);
			}
			p.push();

			p.line(i * 50 - 700, 0, 200, i * 50 - 700, -resultB[i] * 20, 200);
			p.translate(i * 50 - 700, 0, 200);
			p.box(20);
			p.translate(0,-resultB[i] * 20,0);
			p.box(20);
			p.pop();
		}
	}

	p.keyPressed = () => {
		location.reload();
	}

	function shuffle(a) {
    	for (let i = a.length - 1; i > 0; i--) {
        	const j = Math.floor(Math.random() * (i + 1));
        	[a[i], a[j]] = [a[j], a[i]];
    	}
    	return a;
	}

	function reset() {
        unsortedArrayA = [...arrayA];
        sortedArrayA = [];
        stopA = false;

        unsortedArrayB = [...arrayB];
        sortedArrayB = [];
        stopB = false;
    }

    function insertionSort() {
        var value = unsortedArrayA.shift();
        sortedArrayA.push(value);      
        reArrange(sortedArrayA.length-1);

        function reArrange(n) {
            if (stopA) return stopA = false;            
            if (n > 0 && sortedArrayA[n-1] > value) {
                setTimeout(function() {
                    sortedArrayA.splice(n,1);
                    sortedArrayA.splice(n-1,0,value);
                    reArrange(--n)
                    cElementA = n;
                    synth1.triggerAttackRelease(Tone.Midi((21-n)*3 + 30).toFrequency(), "64n");
                }, durationTime * 2);
            } else if (unsortedArrayA.length) {
                setTimeout(function() {insertionSort()}, durationTime * 2);
            } else {
                // ready
            }
        }
    }

    let n;
    let sortedCount = 0;
    function bubbleSort() {
        
        sortedCount++;
        function sortPass(i) {
            if (!unsortedArrayB.length || stopB) {
            	return stopB = false
				
			} 
            if (i<=unsortedArrayB.length) {
                if (unsortedArrayB[i] < unsortedArrayB[i-1]) {
                    var temp = unsortedArrayB[i-1];
                    unsortedArrayB[i-1] = unsortedArrayB[i];
                    unsortedArrayB[i] = temp;

                    cElementB = temp;
                	synth2.triggerAttackRelease(Tone.Midi((21-temp)*3 + 30).toFrequency(), "64n");
                    setTimeout(function() {return sortPass(++i)}, durationTime*2);

                } else if (i == unsortedArrayB.length) {

                    for (n = i; n == unsortedArrayB[n-1]; n--) {
                    	
                        unsortedArrayB.pop();
                    }              

                    sortPass(++i);
                } else {   
                	        
                    sortPass(++i);
                }

            } else {
                bubbleSort();
            }
        }
        if(sortedCount<100)sortPass(1);
    }
}

export default sketch;
new p5(sketch);


