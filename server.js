/*
https://www.github.com/relloller/wordisbond 
*/
var http = require('http');
var socketio = require('socket.io');
var express = require('express');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var router = express();
var server = http.createServer(router);
var io = socketio.listen(server);
var uuid = require('node-uuid');
var wordSolver = require('./wordsolver/wordsolver.js')

var players={};
var playersUID={};
var gameTimer = false;
var intermissionTimer = false;

var {currentBoard, wordList} = wordSolver.generateNewGame()
console.log('currentBoard', currentBoard, "wordList", wordList);
router.use(bodyParser.urlencoded({extended: true}));
router.use(bodyParser.json());
router.use(morgan('dev'));
router.use(express.static('public'));

function startGameTimer(varIO) {
	var startGameTime = new Date();
	var startGameTimerRef = setInterval(() => {
		var elapsedGameTime = new Date() - startGameTime;
		//2min 30sec game time
		if(elapsedGameTime < 150000) {
			varIO.emit('elapsedGameTime', elapsedGameTime);
		} else {
			intermissionTimer=true;
			gameTimer=false;
			clearInterval(startGameTimerRef);
			varIO.emit('start intermission');
			startIntermissionTimer(varIO);
		}
	}, 1000);

	var rankEmit = setInterval(function() {
		return function(p){
			if(gameTimer===true) varIO.emit('ranking', p);
			else clearInterval(rankEmit);
		}(playersRanking(players))
	}, 1234);
}


function startIntermissionTimer(varIO) {
	var boardWords = wordSolver.generateNewGame();
	currentBoard = boardWords.currentBoard;
	wordList = boardWords.wordList;
	var startIntermissionTime = new Date();
	var startIntermissionTimerRef = setInterval(() => {
		var elapsedIntermissionTime = new Date() - startIntermissionTime;
			//30 sec intermission time
		if(elapsedIntermissionTime < 30000) {
			varIO.emit('elapsedIntermissionTime', elapsedIntermissionTime)
		} else {
			gameTimer = true;
			intermissionTimer = false;
			clearInterval(startIntermissionTimerRef);
			clearScores(players);
			varIO.emit('currentBoard', currentBoard);
			startGameTimer(varIO);
		}
	},1000);
}

function sortDescNum(a,b){
	return b[0]-a[0];
}

function playersRanking(playersObj) {
	var playersRankArr = [];
	var playersRankObj={};
	var objTemp ={};
	for (prop in playersObj) playersRankArr.push([playersObj[prop]['score'], playersObj[prop]['uID']]);
	playersRankArr.sort(sortDescNum);
	for (var i = 0; i < playersRankArr.length; i++) playersRankObj[playersRankArr[i][1]] = i;
	return {uID: playersRankObj, totalPlayers: playersRankArr.length};
}

function clearScores(playersObj){
	for(prop in playersObj) {
		playersObj[prop]['score'] = 0;
		playersObj[prop]['words'] = {};
	}
}


io.on('connection', (socket) => {
	if(!gameTimer && !intermissionTimer) {
		gameTimer=true;
		startGameTimer(io);
	}

	console.log('new player joined', socket.id);

	var uIDTemp = uuid.v1();
	socket.emit('Set uID', uIDTemp)
	players[socket.id]={score:0, words:{}, rank:0, 'uID':uIDTemp};

	socket.emit('currentBoard', currentBoard);

	socket.on('wordCheck',  (word) => {
		if(gameTimer===true && wordList[word]) {
			players[socket.id]['words'][word]=wordList[word];
			players[socket.id]['score']+=word.length;
			socket.emit('wordUp', word);
		}
		else socket.emit('wordToBigBird');
	});

	socket.on('disconnect',()=> {
		delete players[socket.id];
		console.log(socket.id + ' disconnected');
	});
});


server.listen(process.env.PORT || 8080, process.env.IP || "0.0.0.0", ()=> {
    var addr = server.address();
    console.log("Chat server listening at", addr.address + ":" + addr.port);
});
