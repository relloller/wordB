/*
https://www.github.com/relloller/wordisbond 
*/
const http = require("http");
const socketio = require("socket.io");
const express = require("express");
const router = express();
const server = http.createServer(router);
const io = socketio.listen(server);
const _ = require("lodash");
const uuid = require("uuid");
const bodyParser = require('body-parser');
const wordSolver = require("./wordsolver/wordsolver.js");

let players = {};
let playersUId = {};
let playersUIdMap = {};
let gameTimer = false;
let intermissionTimer = false;

let { currentBoard, wordList } = wordSolver.generateNewGame();
// console.log('currentBoard', currentBoard, "wordList", wordList);
// router.use(bodyParser.urlencoded({extended: true}));
router.use(bodyParser.json());
// router.use(morgan('dev'));
router.use(express.static("public"));

function startGameTimer(varIO) {
	const startGameTime = new Date();
	let startGameTimerRef = setInterval(() => {
		const elapsedGameTime = new Date() - startGameTime;
		//2min sec game time
		const gameTime = 120000;
		if (elapsedGameTime < gameTime) {
			let playerStats = playersRanking(players);
			// console.log('playerStats',playerStats );
			let varIOSockets = varIO.of("/").sockets;
			for (let sckt in varIOSockets) {
				// console.log('sckt', sckt);
				let pUId = playersUIdMap[sckt];
				varIOSockets[sckt].emit("updateStats", {
					totalPlayers: playerStats.totalPlayers,
					rank: playerStats[pUId].rank,
					score: playerStats[pUId].score,
					timeLeft: Math.floor((gameTime - elapsedGameTime) / 1000)
				});
			}
		} else {
			intermissionTimer = true;
			gameTimer = false;
			clearInterval(startGameTimerRef);
			varIO.emit("start intermission");
			startIntermissionTimer(varIO);
		}
	}, 1000);
}

function startIntermissionTimer(varIO) {
	let boardWords = wordSolver.generateNewGame();
	currentBoard = boardWords.currentBoard;
	wordList = boardWords.wordList;
	const startIntermissionTime = new Date();
	let startIntermissionTimerRef = setInterval(() => {
		const elapsedIntermissionTime = new Date() - startIntermissionTime;
		//30 sec intermission time
		const intermissionTime = 30000;
		if (elapsedIntermissionTime < intermissionTime) {
			varIO.emit(
				"elapsedIntermissionTime",
				Math.floor((intermissionTime - elapsedIntermissionTime) / 1000)
			);
		} else {
			gameTimer = true;
			intermissionTimer = false;
			clearInterval(startIntermissionTimerRef);
			clearScores(players);
			varIO.emit("newGame", {
				currentBoard,
				wordList,
				gameIntermission: intermissionTimer && !gameTimer
			});
			startGameTimer(varIO);
		}
	}, 1000);
}

function sortDescNum(a, b) {
	return b.score - a.score;
}

function playersRanking(playersObj) {
	let playersRankArr = [];
	let playersRankObj = {};
	let objTemp = {};
	for (let prop in playersObj)
		playersRankArr.push({
			score: playersObj[prop]["score"],
			uID: playersObj[prop]["uID"]
		});
	playersRankArr.sort(sortDescNum);
	for (let i = 0; i < playersRankArr.length; i++)
		playersUId[playersRankArr[i].uID] = {
			score: playersRankArr[i].score,
			rank: i + 1
		};

	playersUId.totalPlayers = playersRankArr.length;
	return playersUId;
}

function clearScores(playersObj) {
	for (let prop in playersObj) {
		playersObj[prop]["score"] = 0;
		playersObj[prop]["words"] = {};
	}
}

io.on("connection", socket => {
	if (!gameTimer && !intermissionTimer) {
		gameTimer = true;
		startGameTimer(io);
	}

	console.log("new player joined", socket.id);

	socket.emit("newGame", {
		currentBoard,
		wordList,
		gameIntermission: intermissionTimer && !gameTimer
	});

	const uIDTemp = uuid.v1();
	playersUIdMap[socket.id] = uIDTemp;
	players[socket.id] = { score: 0, words: {}, rank: 0, uID: uIDTemp };

	socket.on("wordCheck", word => {
		// console.log('word', word,socket.id);
		if (gameTimer === false || !wordList[word]) socket.emit("wordNot");
		else if (wordList[word]) {
			players[socket.id]["words"][word] = wordList[word];
			players[socket.id]["score"] += word.length;
			socket.emit("updateScore", players[socket.id]["score"]);
		}
	});

	socket.on("disconnect", () => {
		delete players[socket.id];
		console.log(socket.id + " disconnected");
	});
});

server.listen(process.env.PORT || 8080, process.env.IP || "0.0.0.0", () => {
	const addr = server.address();
	console.log("Chat server listening at", addr.address + ":" + addr.port);
});
