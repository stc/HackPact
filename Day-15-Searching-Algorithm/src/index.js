import p5 from 'p5/lib/p5.min';
import Tone from 'tone';

const sketch = (p) => {
    let gridSize = 9;
    let grid = [];
    for(let i=0; i< gridSize; i++) {
        grid[i] = [];
        for(let j=0; j< gridSize; j++) {
            grid[i][j] = 'Empty';
        }
    }

    grid[0][0] = 'Start';
    grid[8][8] = 'Goal';

    
    

    let solution;
    let solutionAlpha = [];
    let index = 0;
    let nodes = [];
    let canAdd = true;
    let visitedAlpha = 0;

    let canRun = false;

    let canPlay = [];
    let fm = new Tone.MembraneSynth({
                "envelope"  : {
                    "attack"  : 0.001 ,
                    "decay"  : 0.002 ,
                    "sustain"  : 0.03 ,
                    "release"  : 0.1
                } 
            }).toMaster();

    fm.volume.value = -16;


    var phaser = new Tone.Phaser({
        "frequency": 1,
        "octaves": 2,
        "baseFrequency": 400
    }).toMaster();

    var osc = new Tone.Oscillator(0, "sine").connect(phaser).start();
    osc.volume.value = -16;
    var osc2 = new Tone.Oscillator(0, "sine").connect(phaser).start();
    osc2.volume.value = -16;

    p.setup = () => {
        let canvas = p.createCanvas(800, 800, p.WEBGL);
        
        for(let i = 0; i < 4; i++) {
        for(let j = 0; j < 4; j++) {
            let p1 = p.floor(p.random(1,8));
            let p2 = p.floor(p.random(1,8));
            console.log (p1 + " " + p2);
            if(p1==7 && p2==7) {
                } else {
                    grid[p1][p2] = "Obstacle";
            }
        }

        grid[4][8] = "Obstacle";
    }
    }

    let pc = 24;
    let notes = [54+pc,50+pc,46+pc,45+pc,43+pc,40+pc,38+pc,34+pc,30+pc,26+pc,25+pc,23+pc,10+pc,18+pc,14+pc];
    p.draw = () => {
        p.camera(p.cos(p.frameCount/80) * 50, -50 + p.sin(p.frameCount/120) * 50, 400, 0, 0, 0, 0, 1, 0);
        p.background(0);
        p.smooth(); 

        let offset = 30;

        p.rotateZ(p.radians(45));
        p.rotateX(p.radians(30));
        p.rotateY(-p.radians(30));
        p.translate(0,-offset * gridSize/8, 0);

        p.noFill();

        
        p.translate(0,offset * gridSize/8, 0);
        p.translate(-offset * (gridSize-1)/2, -offset * gridSize / 2,0);

        //p.noFill();
        //p.stroke(0,15);
        //p.ellipse(0 + offset * (gridSize-1)/2, 0 + offset * (gridSize-1)/2,450,450);


        for(let i=0; i< gridSize; i++) {
            for(let j=0; j< gridSize; j++) {
                //p.stroke(0,180);
                //p.strokeWeight(2);
                //p.fill(240);

                p.noFill();
                    p.stroke(210, p.abs(gridSize - (i-gridSize/2))*20);
                    p.push();
                    p.translate(i * offset, j * offset, 0);
                    //p.rotateZ(p.radians(45));
                    p.line(0,0,-10,0,offset,-10);
                    p.line(0,0,-10,offset,0,-10);

                    p.pop();

                if(i== 0 && j == 0) {
                    p.noStroke();
                    p.fill(255,180);
                    p.push();
                    p.translate(i * offset, j * offset, -10);
                    //p.rotateZ(p.radians(45));
                    p.sphere(8);
                    p.pop();
                }

                if(grid[j][i] == "Obstacle") {
                    p.fill(255,180);
                    p.push();
                    p.stroke(0);
                    p.translate(i * offset, j * offset, -0);
                    p.rotateX(p.radians(90));
                    //p.rotateZ(p.radians(45));
                    p.cone(10,35,50);
                    p.pop();
                    
                }

                if(grid[j][i] == "Goal") {
                    p.fill(255,0,0,200);
                    p.push();
                    p.noStroke();
                    p.translate(i * offset, j * offset, -10);
                    //p.rotateZ(p.radians(45));
                    p.sphere(8);
                    p.pop();
                }

                if(grid[j][i] == "Visited") {
                    if(visitedAlpha>0) {
                        p.fill(255,visitedAlpha);
                    } else {
                        p.fill(255,0);
                    }
                    p.noStroke();
                    p.push();
                    p.translate(i * offset, j * offset, -10);
                    //p.rotateZ(p.radians(45));
                    p.sphere(4);
                    p.pop();
                }

                if(grid[j][i] == "oPath") {
                    p.fill(255,0,200,200);
                    
                }
            }

            if(visitedAlpha>0) {
                visitedAlpha-=2;
            } 
        } 

       

        for(let i=0; i< p.ceil(index); i++) {
            p.strokeWeight(2);
            p.stroke(255,255);
            if(i<nodes.length-1) {
                p.line(nodes[i].x,nodes[i].y,nodes[i].z,nodes[i+1].x,nodes[i+1].y,nodes[i+1].z);
                p.noStroke();
                p.push();
                p.fill(255, solutionAlpha[i]);
                p.translate(nodes[i+1].x,nodes[i+1].y,nodes[i+1].z);
                p.sphere(3);
                p.pop();
                
                if(solutionAlpha[i] < 190) {
                    if(solutionAlpha[i]==0) {
                        if(canPlay[i]) {
                            osc.frequency.rampTo(Tone.Midi((9*30 - nodes[i+1].x) /6 + 50).toFrequency(), 0);
                            osc2.frequency.rampTo(Tone.Midi((9*30 - nodes[i+1].y)/10 + 50).toFrequency(), 0);   
                            //fm3.triggerAttackRelease(Tone.Midi(nodes[i].y/5+60).toFrequency(), "64n");
                            canPlay[i]=false;
                        }
                    }
                    solutionAlpha[i] += 1;
                }
            }
            p.strokeWeight(1);
        }
        

        if(solution) {
                index += 0.1;
                if(index > solution.length) index = solution.length;
                if(index == solution.length) {
                    p.strokeWeight(2);
                    p.stroke(255,255);
                    p.line(nodes[nodes.length-1].x,nodes[nodes.length-1].y,nodes[nodes.length-1].z,(gridSize-1) * offset, (gridSize-1) * offset, -10);
                    p.strokeWeight(1);
                }
                if(canAdd) {
                    for(let i=0; i<solution.length; i++) {
                        nodes.push( p.createVector(solution[i].distanceFromLeft * offset, solution[i].distanceFromTop * offset, -10 ));
                        solutionAlpha.push(0);
                        canPlay.push(true);
                    }
                    canAdd = false;
                }
        }
        
    }

     p.keyPressed = () => {
            if(p.key == 's') {
                canRun = true;
                findShortestPath([0,0], grid);
            }
            else if (p.key == 'r') {
                location.reload();
            }
        }

    function findShortestPath(startCoordinates, grid) {
            let distanceFromTop = startCoordinates[0];
            let distanceFromLeft = startCoordinates[1];
                
            let location = {
              distanceFromTop: distanceFromTop,
              distanceFromLeft: distanceFromLeft,
              path: [],
              status: 'Start'
            };
            
            let queue = [location];
            explore(queue);
        
    }

    let delay = 40;
    function explore(queue) {
          let currentLocation = queue.shift();
          let newLocation = exploreInDirection(currentLocation, 'North', grid);
          if (newLocation.status === 'Goal') {
            solution = newLocation.path;
            return newLocation.path;
            
          } else if (newLocation.status === 'Valid') {
            queue.push(newLocation);
            setTimeout(function() {explore(queue)}, delay);
          }
        
          newLocation = exploreInDirection(currentLocation, 'East', grid);
          if (newLocation.status === 'Goal') {
            solution = newLocation.path;
            return newLocation.path;
            
          } else if (newLocation.status === 'Valid') {
            queue.push(newLocation);
            setTimeout(function() {explore(queue)}, delay);
          }
         
          newLocation = exploreInDirection(currentLocation, 'South', grid);
          if (newLocation.status === 'Goal') {
            solution = newLocation.path;
            return newLocation.path;
            
          } else if (newLocation.status === 'Valid') {
            queue.push(newLocation);
            setTimeout(function() {explore(queue)}, delay);
          }
        
          newLocation = exploreInDirection(currentLocation, 'West', grid);
          if (newLocation.status === 'Goal') {
            solution = newLocation.path;
            return newLocation.path;
            
          } else if (newLocation.status === 'Valid') {
            queue.push(newLocation);
            setTimeout(function() {explore(queue)}, delay);
          } 

        
        return false;
    }    
    function locationStatus(location, grid) {
        let gridSize = grid.length;
        let dft = location.distanceFromTop;
        let dfl = location.distanceFromLeft;
            if (location.distanceFromLeft < 0 ||
            location.distanceFromLeft >= gridSize ||
            location.distanceFromTop < 0 ||
            location.distanceFromTop >= gridSize) {
          return 'Invalid';
        } else if (grid[dft][dfl] === 'Goal') {
          return 'Goal';
        } else if (grid[dft][dfl] !== 'Empty') {
          return 'Blocked';
        } else {
          return 'Valid';
        }
    }
    //let p = [];

    function exploreInDirection(currentLocation, direction, grid) {
        let newPath = currentLocation.path.slice();
        newPath.push(currentLocation);
        fm.envelope.release = p.random(2)+1.2;
        fm.triggerAttackRelease(Tone.Midi(currentLocation.distanceFromLeft * 5 + 80).toFrequency(), "32n");
        let dft = currentLocation.distanceFromTop;
        let dfl = currentLocation.distanceFromLeft;
            if (direction === 'North') {
          dft -= 1;
        } else if (direction === 'East') {
          dfl += 1;
        } else if (direction === 'South') {
          dft += 1;
        } else if (direction === 'West') {
          dfl -= 1;
        }
        let newLocation = {
          distanceFromTop: dft,
          distanceFromLeft: dfl,
          path: newPath,
          status: 'Unknown'
        };
        newLocation.status = locationStatus(newLocation, grid);
        if (newLocation.status === 'Valid') {
          grid[newLocation.distanceFromTop][newLocation.distanceFromLeft] = 'Visited';
          visitedAlpha = 255;
        }
        return newLocation;
    }
}
export default sketch;
new p5(sketch);