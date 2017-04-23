/*
    https://www.github.com/relloller/wordisbond
*/

module.exports = {
    generateNewGame:newBoardAndWords
}

var fs = require('fs');

//distribution of letters in english words according to wikipedia
var abcFreq = 'aaaaaaaabbcccdddeeeeeeeeeeeefffggghhhhhhiiiiiiijjkkllllmmmnnnnnnnooooooooppqrrrrrrsssssstttttttttuuuvvwwwxyyyz';

//creates new board(string of letters)
function createBoard(boardsize){
    var strLength = boardsize*boardsize;
    var strTemp = '';
    for (var i = 0; i < strLength; i++) strTemp+=abcFreq.charAt(Math.floor(Math.random()*abcFreq.length));
    return strTemp;
}

//prints board
function printB(str) {
    var bs = Math.sqrt(str.length);
    var str1 = str.toUpperCase();
    for (var i = 0; i < str1.length; i += bs) console.log(str1.substring(i, i + bs).split('').join(' '));
}

//finds adjacent letters at indx position
function adjLtrs(indx, strA) {
    var bsize = Math.sqrt(strA.length);
    var endRow = (indx + 1) % bsize === 0;
    var beginRow = (indx + 1) % bsize === 1;
    var topRow = indx < bsize;
    var bottomRow = (indx + bsize > strA.length - 1);
    var p = {
        letter: strA[indx],
        indx: indx
    };

    //up-right neighbor
    if (!endRow && !topRow) {
        if (!p[strA[indx - bsize + 1]]) p[strA[indx - bsize + 1]] = [];
        p[strA[indx - bsize + 1]].push(indx - bsize + 1);
    }

    //right neighbor
    if (!endRow) {
        if (!p[strA[indx + 1]]) p[strA[indx + 1]] = [];
        p[strA[indx + 1]].push(indx + 1);
    }

    //down-right neighbor
    if (!endRow && !bottomRow) {
        if (!p[strA[indx + bsize + 1]]) p[strA[indx + bsize + 1]] = [];
        p[strA[indx + bsize + 1]].push(indx + bsize + 1);
    }

    //up-left neighbor
    if (!beginRow && !topRow) {
        if (!p[strA[indx - bsize - 1]]) p[strA[indx - bsize - 1]] = [];
        p[strA[indx - bsize - 1]].push(indx - bsize - 1)
    }

    //left neighbor
    if (!beginRow) {
        if (!p[strA[indx - 1]]) p[strA[indx - 1]] = [];
        p[strA[indx - 1]].push(indx - 1);
    }

    //down-left neighbor
    if (!beginRow && !bottomRow) {
        if (!p[strA[indx + bsize - 1]]) p[strA[indx + bsize - 1]] = [];
        p[strA[indx + bsize - 1]].push(indx + bsize - 1);
    }

    //up neighbor
    if (!topRow) {
        if (!p[strA[indx - bsize]]) p[strA[indx - bsize]] = [];
        p[strA[indx - bsize]].push(indx - bsize);
    }

    //down neighbor
    if (!bottomRow) {
        if (!p[strA[indx + bsize]]) p[strA[indx + bsize]] = [];
        p[strA[indx + bsize]].push(indx + bsize);
    }

    return p;
}

//creates object with an array of indices for each letter, and adjacent letters for each index
function boardF(strA) {
    var boardTemp = {};
    for (var i = 0; i < strA.length; i++) {
        boardTemp[i] = adjLtrs(i, strA);
        if (!boardTemp[strA[i]]) boardTemp[strA[i]] = [];
        boardTemp[strA[i]].push(i);
    }
    return boardTemp;
}

//checks word **refactor for global board
function checkWord(board, word) {
    if (board[word.charAt(0)]) {
        for (var i = 0; i < board[word.charAt(0)].length; i++) {
            if (checkNextLetter(board, word, board[word.charAt(0)][i])) return true;
        }
    }
    return false;
}

//checks next letter recursively *needs a refactor for global board..also...looks crazy
function checkNextLetter(board, word, ltrCurrentIndx, indxArr = [ltrCurrentIndx], counter = 0) {
    if (indxArr.length === word.length) return true;
    if (board[ltrCurrentIndx][word.charAt(counter + 1)]) {
        for (var i = 0; i < board[ltrCurrentIndx][word.charAt(counter + 1)].length; i++) {
            if (!indxArr.some(e => {return e === board[ltrCurrentIndx][word.charAt(counter + 1)][i.toString()]})) {
                if (checkNextLetter(board, word, board[ltrCurrentIndx][word.charAt(counter + 1)][i.toString()], indxArr.concat([board[ltrCurrentIndx][word.charAt(counter + 1)][i.toString()]]), counter + 1)) return true;
            }
        }
    }
}

//checks each word in json word list 
function checkDict(board,dict) {
    var solsObj = {};
    var solsCount = 0;
    for (var i = 0; i < dict.length; i++) if (checkWord(board, dict[i])) solsObj[dict[i]]= ++solsCount;
    return solsObj;
}


function newBoardAndWords(){
    var rndStr = createBoard(6); //creates 6x6 board
    var strArr = rndStr.split(''); 
    var board = boardF(strArr); 
    var dictAZ = fs.readFileSync('./wordsolver/dictAZ3.json', 'UTF8'); //list of english words 3 letters or longer
    var dictAZjson = JSON.parse(dictAZ);
    var foundWords = checkDict(board, dictAZjson);
    dictAZ=null;
    dictAZjson=null;
    return {currentBoard: strArr, wordList: foundWords}
}

