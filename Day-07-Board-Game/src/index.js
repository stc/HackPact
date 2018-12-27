import p5 from 'p5/lib/p5.min';
import Tone from 'tone';
import StartAudioContext from 'startaudiocontext';

const sketch = (p) => {
  	var players = { SELF: 'self', OPPONENT: 'opponent', ROOT: 'root' }
  	, scores = { UNKNOWN: 2, DRAW: 0.25, LOSE: 0, WIN: 1 }   // Duplication with arbiter.js but I don't want to externalize this just yet
                                                             // DRAW is ranked less than UNKNOWN are there may be untested winning moves
  	;

	function Node(player, parent, height) {
	  this.score = scores.UNKNOWN;
	  this.player = player;
	  this.children = {};
	  this.parent = parent;
	  this.height = height;   // Number of possible moves from this node
	}
	
	
	/*
	 * Return the list of explored moves for this node
	 */
	Node.prototype.moves = function () {
	  return Object.keys(this.children);
	};
	
	
	/**
	 * Return number of nodes with the given score, or all if no parameter given
	 */
	Node.prototype.nodeCount = function (score) {
	  var self = this
	    , res = (score === undefined || this.score === score) ? 1 : 0
	    ;
	
	  if (this.moves().length === 0) { return res; }
	
	  this.moves().forEach(function (move) {
	    res += self.children[move].nodeCount(score);
	  });
	
	  return res;
	};
	
	
	Node.prototype.summary = function () {
	  return this.nodeCount() + ' nodes - U: ' + this.nodeCount(scores.UNKNOWN) + ' - W: ' + this.nodeCount(scores.WIN) + ' - L: ' + this.nodeCount(scores.LOSE) + ' - D: ' + this.nodeCount(scores.DRAW);
	};
	
	
	/*
	 * Draw the tree originating from this node, with offset spaces every level
	 */
	Node.prototype.drawDescendants = function (offset) {
	  var self = this;
	
	  this.moves().forEach(function (move) {
	    console.log(offset + move + ' (' + self.children[move].player + ' - score: ' + self.children[move].score + ' - height: ' + self.children[move].height + ')');
	    self.children[move].drawDescendants(offset + '  ');
	  });
	};
	
	
	Node.prototype.draw = function () {
	  console.log("ROOT (score: " + this.score + ')');
	  this.drawDescendants('');
	};
	
	
	function Player () {
	  this.decisionTree = new Node(players.ROOT);
	  this.currentNode = this.decisionTree;   // No game started
	  this.randomize = false;    // By default no randoization to build decision tree faster. Can be set to true for testing and playing vs human.
	}
	
	
	/* 
	 * validMoves is a list of valid moves passed by arbiter. Could also be gotten by all parents of current node until root
	 * Returns the chosen move
	 */
	Player.prototype.play = function (validMoves) {
	  var maxScore = scores.LOSE, chosenMove
	    , movesByScore = {}
	    , self = this;
	
	  movesByScore[scores.LOSE] = []; movesByScore[scores.WIN] = []; movesByScore[scores.DRAW] = []; movesByScore[scores.UNKNOWN] = [];
	
	  // Select best move given data collected to date
	  validMoves.forEach(function (move) {
	    var score, moveNode = self.currentNode.children[move];
	
	    if (moveNode !== undefined) {
	      score = moveNode.score;
	    } else {
	      score = scores.UNKNOWN;
	    }
	
	    movesByScore[score].push(move);
	    if (score >= maxScore) {
	      maxScore = score;
	      chosenMove = move;
	    }
	  });
	
	  // Choosing one of the optimal moves at random to avoid to always play the same game which is
	  // boring for human players and bad for testing
	  if (this.randomize) {
	    chosenMove = movesByScore[maxScore][Math.floor(Math.random() * movesByScore[maxScore].length)];
	  }
	
	  // Move to the node corresponding to the chosen move, lazily create it if it doesn't exist
	  if (self.currentNode.children[chosenMove] === undefined) {
	    self.currentNode.children[chosenMove] = new Node(players.SELF, self.currentNode, validMoves.length - 1);
	  }
	  self.currentNode = self.currentNode.children[chosenMove];
	
	  return chosenMove;
	};
	
	
	/*
	 * Update state when opponent has played, lazily creating the corresponding node if it doesn't exist
	 */
	Player.prototype.opponentPlayed = function (move, validMoves) {
	  if (this.currentNode.children[move] === undefined) {
	    this.currentNode.children[move] = new Node(players.OPPONENT, this.currentNode, validMoves.length - 1);
	  }
	  this.currentNode = this.currentNode.children[move];
	};
	
	
	Player.prototype.drawTree = function () {
	  console.log("===== " + this.decisionTree.summary());
	  this.decisionTree.draw();
	};
	
	
	/*
	 * Updates the AI that the game is finished and give result
	 * Result bubbles up using minimax algorithm
	 */
	Player.prototype.result = function (score) {
	  var s, self = this;
	
	  this.currentNode.score = score;
	
	  while (this.currentNode.parent) {
	    this.currentNode = this.currentNode.parent;
	    s = scores.UNKNOWN;
	
	    // Could be factored a bit but I prefer this semantic
	    if (this.currentNode.player === players.SELF) {
	        if (this.currentNode.moves().length === this.currentNode.height) {
	          s = scores.WIN;
	          Object.keys(this.currentNode.children).forEach(function (move) {
	            s = Math.min(s, self.currentNode.children[move].score);
	          });
	        } else {
	          s = scores.UNKNOWN;
	        }
	    } else {
	      if (this.currentNode.moves().length === this.currentNode.height) {
	        s = scores.LOSE;
	        Object.keys(this.currentNode.children).forEach(function (move) {
	          s = Math.max(s, self.currentNode.children[move].score);
	        });
	      } else {
	        s = scores.UNKNOWN;
	      }
	    }
	
	    this.currentNode.score = s;
	  }
	};
	
	
	
	//---------------------------------------------------------------------------------
	
	var autoPlayer = './player'
	  , player1 =  autoPlayer
	  , player2 =  autoPlayer
	  , scores = { UNKNOWN: 0.5, DRAW: 0.25, LOSE: 0, WIN: 1 }   
	  , gridSymbols = { EMPTY: ' ', PLAYER1: 'X', PLAYER2: 'O' }
	  , results = { PLAYER1_WIN: 'Player 1 wins', PLAYER2_WIN: 'Player 2 wins', DRAW: 'Draw', NONE: 'No result yet' }
	  , currentGame = []
	  , N = 3
	  ;
	
	player1 = new Player();
	player2 = new Player();
	
	
	function createNewGrid () {
	  var res = [];
	  for (var i = 0; i < N; i += 1) {
	    res[i] = [];
	    for (var j = 0; j < N; j += 1) {
	      res[i][j] = gridSymbols.EMPTY
	    }
	  }
	  return res;
	}
	
	
	function drawGrid(grid) {
	  var line
	    , horizontalLine = ''
	    ;
	
	  for (var i = 0; i < 2*N+1; i += 1) {
	    horizontalLine += '-';
	  }
	
	  console.log(horizontalLine);
	  for (var i = 0; i < N; i += 1) {
	    line = '|';
	    for (var j = 0; j < N; j += 1) {
	      line += grid[i][j] + '|';
	    }
	    console.log(line);
	    console.log(horizontalLine);
	  }
	}
	
	
	function getLegalMoves (grid) {
	  var res = [];
	
	  for (var i = 0; i < N; i += 1) {
	    for (var j = 0; j < N; j += 1) {
	      if (grid[i][j] === gridSymbols.EMPTY) { res.push('' + i + '-' + j); }
	    }
	  }
	
	  return res;
	}
	
	
	function checkResult(grid) {
	  var l1, l2, c1, c2;
	
	  var d1 = true, d2 = true, d1i = true, d2i = true;
	
	  for (var i = 0; i < N; i += 1) {
	    l1 = true; l2 = true; c1 = true; c2 = true;
	    for (var j = 0; j < N; j += 1) {
	      l1 = l1 && (grid[i][j] === gridSymbols.PLAYER1);
	      l2 = l2 && (grid[i][j] === gridSymbols.PLAYER2);
	      c1 = c1 && (grid[j][i] === gridSymbols.PLAYER1);
	      c2 = c2 && (grid[j][i] === gridSymbols.PLAYER2);
	    }
	
	    if (l1 || c1) { return results.PLAYER1_WIN; }
	    if (l2 || c2) { return results.PLAYER2_WIN; }
	
	    d1 = d1 && (grid[i][i] === gridSymbols.PLAYER1);
	    d2 = d2 && (grid[i][i] === gridSymbols.PLAYER2);
	    
	    d1i = d1i && (grid[i][N - 1 - i] === gridSymbols.PLAYER1);
	    d2i = d2i && (grid[i][N - 1 - i] === gridSymbols.PLAYER2);
	  }
	
	  if (d1 || d1i) { return results.PLAYER1_WIN; }
	  if (d2 || d2i) { return results.PLAYER2_WIN; }
	
	  if (getLegalMoves(grid).length === 0) {
	    return results.DRAW;
	  } else {
	    return results.NONE;
	  }
	}
	
	var grid = createNewGrid()
  		  , move, i, j
  		  ;


  		  function runOneGame (debug) {
  var grid = createNewGrid()
    , move, i, j
    ;

  if (debug) { console.log("=============================================================="); }

  while (true) {
    move = player1.play(getLegalMoves(grid));
    player2.opponentPlayed(move, getLegalMoves(grid));
     if (debug) { console.log("Player 1 plays " + move); }
      i = parseInt(move.split('-')[0], 10);
      j = parseInt(move.split('-')[1], 10);
      grid[i][j] = gridSymbols.PLAYER1;
      if (checkResult(grid) !== results.NONE) { break; }
    
      move = player2.play(getLegalMoves(grid));
      player1.opponentPlayed(move, getLegalMoves(grid));
      if (debug) { console.log("Player 2 plays " + move); }
      i = parseInt(move.split('-')[0], 10);
      j = parseInt(move.split('-')[1], 10);
    grid[i][j] = gridSymbols.PLAYER2;
    if (checkResult(grid) !== results.NONE) { break; }
    
  } 

  switch (checkResult(grid)) {
    case results.PLAYER1_WIN:
      player1.result(scores.WIN);
      player2.result(scores.LOSE);
      break;
    case results.PLAYER2_WIN:
      player2.result(scores.WIN);
      player1.result(scores.LOSE);
      break;
    case results.DRAW:
      player1.result(scores.DRAW);
      player2.result(scores.DRAW);
      break;
  }

  if (debug) { drawGrid(grid); }
  if (debug) { console.log('RESULT: ' + checkResult(grid)) };
  if (debug) { player1.drawTree(); }

  return grid;
}
	function runStepGame (debug, stepCount) {
  		if (debug) { console.log("=============================================================="); }
		
		if(stepCount%2==0) {
  			if(checkResult(grid) == results.NONE) {
  		  		move = player1.play(getLegalMoves(grid));
  		  		player2.opponentPlayed(move, getLegalMoves(grid));
  		   		if (debug) { console.log("Player 1 plays " + move); }
  		    		i = parseInt(move.split('-')[0], 10);
  		    		j = parseInt(move.split('-')[1], 10);
  		    		grid[i][j] = gridSymbols.PLAYER1;
  		    		fm1.triggerAttackRelease(Tone.Midi(i * 5 + 58).toFrequency(), "16n");
  		    		fm2.triggerAttackRelease(Tone.Midi(j * 5 + 58).toFrequency(), "16n");
  			}
  		} else {
  		    
  			if(checkResult(grid) == results.NONE) {  
  		    	move = player2.play(getLegalMoves(grid));
  		    	player1.opponentPlayed(move, getLegalMoves(grid));
  		    	if (debug) { console.log("Player 2 plays " + move); }
  		    	i = parseInt(move.split('-')[0], 10);
  		    	j = parseInt(move.split('-')[1], 10);
  		    	grid[i][j] = gridSymbols.PLAYER2;
  		    	fm3.triggerAttackRelease(Tone.Midi(i * 5 + 70).toFrequency(), "64n");
  		    	fm4.triggerAttackRelease(Tone.Midi(j * 5 + 70).toFrequency(), "64n");
  			}
  		}
  		 
		
  		switch (checkResult(grid)) {
  		  case results.PLAYER1_WIN:
  		    player1.result(scores.WIN);
  		    player2.result(scores.LOSE);
  		    break;
  		  case results.PLAYER2_WIN:
  		    player2.result(scores.WIN);
  		    player1.result(scores.LOSE);
  		    break;
  		  case results.DRAW:
  		    player1.result(scores.DRAW);
  		    player2.result(scores.DRAW);
			break;
  		}
		
  		if (debug) { drawGrid(grid); }
  		if (debug) { console.log('RESULT: ' + checkResult(grid)) };
  		//if (debug) { player1.drawTree(); }
		
  		return grid;
	}

	let stepCount = 0;
	let canStartNew = false; 

	var freeverb = new Tone.Freeverb().toMaster();
		freeverb.dampening.value = 600;
		freeverb.roomSize.value = 0.9;

	let fm1 = new Tone.FMSynth({
				"harmonicity"  : 4 ,
				"modulationIndex"  : 3 ,
				"detune"  : 0 ,
				"oscillator"  : {
					"type"  : "sine"
				}  ,
				"envelope"  : {
					"attack"  : 0.003 ,
					"decay"  : 0.1 ,
					"sustain"  : 2 ,
					"release"  : 5
				}  ,
				"modulation"  : {
					"type"  : "square"
				}  ,
				"modulationEnvelope"  : {
					"attack"  : 0.02 ,
					"decay"  : 0.08 ,
					"sustain"  : 0.3 ,
					"release"  : 0.5
				}
			}).toMaster();
	fm1.volume.value = -5;

	let fm2 = new Tone.FMSynth({
				"harmonicity"  : 4 ,
				"modulationIndex"  : 10 ,
				"detune"  : 0 ,
				"oscillator"  : {
					"type"  : "sine"
				}  ,
				"envelope"  : {
					"attack"  : 0.003 ,
					"decay"  : 0.1 ,
					"sustain"  : 2 ,
					"release"  : 5
				}  ,
				"modulation"  : {
					"type"  : "square"
				}  ,
				"modulationEnvelope"  : {
					"attack"  : 0.02 ,
					"decay"  : 0.08 ,
					"sustain"  : 0.3 ,
					"release"  : 0.5
				}
			}).toMaster();
	fm2.volume.value = -10;

	let fm3 = new Tone.FMSynth({
				"harmonicity"  : 4 ,
				"modulationIndex"  : 3 ,
				"detune"  : 0 ,
				"oscillator"  : {
					"type"  : "sine"
				}  ,
				"envelope"  : {
					"attack"  : 0.003 ,
					"decay"  : 0.1 ,
					"sustain"  : 2 ,
					"release"  : 5
				}  ,
				"modulation"  : {
					"type"  : "square"
				}  ,
				"modulationEnvelope"  : {
					"attack"  : 0.02 ,
					"decay"  : 0.08 ,
					"sustain"  : 0.3 ,
					"release"  : 0.5
				}
			}).toMaster();
	fm3.volume.value = -30;

	let fm4 = new Tone.FMSynth({
				"harmonicity"  : 4 ,
				"modulationIndex"  : 10 ,
				"detune"  : 0 ,
				"oscillator"  : {
					"type"  : "sine"
				}  ,
				"envelope"  : {
					"attack"  : 0.003 ,
					"decay"  : 0.1 ,
					"sustain"  : 2 ,
					"release"  : 5
				}  ,
				"modulation"  : {
					"type"  : "square"
				}  ,
				"modulationEnvelope"  : {
					"attack"  : 0.02 ,
					"decay"  : 0.08 ,
					"sustain"  : 0.3 ,
					"release"  : 0.5
				}
			}).connect(freeverb).toMaster();
	fm4.volume.value = -15;

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

	p.setup = () => {
		bell.triggerAttackRelease('1n' );

		let canvas = p.createCanvas(800,800, p.WEBGL);
		p.smooth();

		player1.randomize = true;
		player2.randomize = true;
		var dc = 0, g;
		for (var z = 0; z < 100000; z += 1) {
  			g = runOneGame();
  			if (checkResult(g) === results.DRAW) { dc += 1; }
		}

		if (dc === 100000) {
  			console.log("100,000 draws in a row, both AIs play perfectly");
		} else {
  			console.log(dc + " draws, the code needs to be checked");
		}
	}

	let ptick1 = 0;
	let ptick2 = 0;
	let a = 0;
	p.draw = () => {
		p.frameRate(60);
		p.camera(p.frameCount/10 - 100, -100, 600, 0, 0, 0, 0, 1, 0);
		p.background(0);

		p.rotateX(p.radians(60));
		p.rotateZ(p.frameCount / 500);

		
		p.stroke(255,40);
		p.line(0,-150,0,150);
		p.line(-150,0,150,0);
		p.line(-150,-100,150,-100);
		
		p.line(-150,100,150,100);
		p.line(-100,-150,-100,150);
		p.line(100,-150,100,150);
		//p.line(-100,-150,-100,150);
		
		p.fill(255,100);
		p.stroke(0,40);
		p.rect(-200,-200,400,400);
		p.push();
		p.translate(0,0,-1);
		p.fill(255,0,0,a);
		p.rect(-200,-200,400,400);
		p.pop();

		p.noStroke();
		for (var i = 0; i < N; i += 1) {
	    	for (var j = 0; j < N; j += 1) {
	    		if(grid[i][j]==='X') {
	    			p.fill(0);
	    			p.push();
	    			p.translate(i * 100-100, j * 100 - 100,0);
	    			p.sphere(10);
	    			p.pop();
	    		} else if(grid[i][j]==='O') {
	    			p.fill(255);
	      			p.push();
	    			p.translate(i * 100 - 100, j * 100 - 100,0);
	    			p.sphere(10);
	    			p.pop();
	    		}
	    	}
	    }

	    let tick1 = p.floor(p.millis()/1000);
			if(ptick1!=tick1) {
				if(canStartNew) {
					grid = createNewGrid();
					canStartNew = false;
				}
				stepCount++;
				runStepGame(false, stepCount);
				if(checkResult(grid) !== results.NONE) {
					canStartNew = true;
					a = 100;
					bell.triggerAttackRelease('1n' );
					
				}
		}
		ptick1 = tick1;

		let tick2 = p.floor(p.millis()/666);
			if(ptick2!=tick2) {
				if(canStartNew) {
					grid = createNewGrid();
					canStartNew = false;
				}
				stepCount++;
				runStepGame(false, stepCount);
				if(checkResult(grid) !== results.NONE) {
					canStartNew = true;
					a = 100;
					bell.triggerAttackRelease('2n');
				}
		}
		ptick2 = tick2;

		a -=10;
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


