/*
    https://www.github.com/relloller/wordisbond
*/

const fs = require('fs');



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
    for (let i = 0; i < strA.length; i++) {
        boardTemp[i] = adjLtrs(i, strA);
        if (!boardTemp[strA[i]]) boardTemp[strA[i]] = [];
        boardTemp[strA[i]].push(i);
    }
    return boardTemp;
}

//checks word **refactor for global board
function checkWord(board, word) {
    if (board[word.charAt(0)]) {
        for (let ii = 0; ii < board[word.charAt(0)].length; ii++) {
        let asdf=[];
            asdf = checkNextLetter(board, word, board[word.charAt(0)][ii]);
            if(asdf) {
                // console.log('asdf', asdf);
                return asdf;
            }
        }
    }
    return false;
}
let routeMap;
//checks next letter recursively *needs a refactor for global board..also...looks crazy
function checkNextLetter(board, word, ltrCurrentIndx, indxArr = [ltrCurrentIndx], counter = 0) {
    if (indxArr.length === word.length) {
     // let indxArrMap = indxArr.map(ind=> ind);
        routeMap  = indxArr.map(ind=> ind);
        // console.log('indxArrMap', word,routeMap);
        return true;
    }
    else if (board[ltrCurrentIndx][word.charAt(counter + 1)]) {
        for (let i = 0; i < board[ltrCurrentIndx][word.charAt(counter + 1)].length; i++) {
            if (!indxArr.some(e => {return e === board[ltrCurrentIndx][word.charAt(counter + 1)][i.toString()]})) {
                if (checkNextLetter(board, word, board[ltrCurrentIndx][word.charAt(counter + 1)][i.toString()], indxArr.concat([board[ltrCurrentIndx][word.charAt(counter + 1)][i.toString()]]), counter + 1)) {
                 // indxArrMap = indxArr.map(ind=>  true);
                return true;                }
            }
        }
    }
}

//checks each word in json word list 
function checkDict(board,dict) {
    var solsObj = {};
    var solsCount = 0;
    for (let i = 0; i < dict.length; i++) {
        let wordRoute = checkWord(board, dict[i]); 
        if(wordRoute) solsObj[dict[i]]= routeMap;
    }
    return solsObj;
}


function newBoardAndWords(){
    var rndStr = createBoard(5); //creates 5x5 board
    var strArr = rndStr.split(''); 
    var board = boardF(strArr); 
    var dictAZ = fs.readFileSync('./wordsolver/dictAZ3.json','UTF-8');
    var dictAZjson = JSON.parse(dictAZ);
    var foundWords = checkDict(board, dictAZjson);
    dictAZ=null;
    dictAZjson=null;
    return {currentBoard: strArr, wordList: foundWords}
}

// var nBoardSolve = newBoardAndWords();
// console.log(nBoardSolve,Object.keys(nBoardSolve.wordList).length);

module.exports = {
    generateNewGame:newBoardAndWords
}