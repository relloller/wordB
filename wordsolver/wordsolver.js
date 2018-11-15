/*
    https://www.github.com/relloller/wordisbond
*/

module.exports = {
    generateNewGame:newBoardAndWords
}

const fs = require('fs');

//distribution of letters in english words according to wikipedia
const abcFreq = 'aaaaaaaabbcccdddeeeeeeeeeeeefffggghhhhhhiiiiiiijjkkllllmmmnnnnnnnooooooooppqrrrrrrsssssstttttttttuuuvvwwwxyyyz';

//creates new board(string of letters)
function createBoard(boardsize){
    const strLength = boardsize*boardsize;
    let strTemp = '';
    for (let i = 0; i < strLength; i++) strTemp+=abcFreq.charAt(Math.floor(Math.random()*abcFreq.length));
    return strTemp;
}

//prints board
function printB(str) {
    const bs = Math.sqrt(str.length);
    let str1 = str.toUpperCase();
    for (let i = 0; i < str1.length; i += bs) console.log(str1.substring(i, i + bs).split('').join(' '));
}

//finds adjacent letters at indx position
function adjLtrs(indx, strA) {
    const bsize = Math.sqrt(strA.length);
    const endRow = (indx + 1) % bsize === 0;
    const beginRow = (indx + 1) % bsize === 1;
    const topRow = indx < bsize;
    const bottomRow = (indx + bsize > strA.length - 1);
    let p = {
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
    let boardTemp = {};
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
        for (let i = 0; i < board[ltrCurrentIndx][word.charAt(counter + 1)].length; i++) {
            if (!indxArr.some(e => {return e === board[ltrCurrentIndx][word.charAt(counter + 1)][i.toString()]})) {
                if (checkNextLetter(board, word, board[ltrCurrentIndx][word.charAt(counter + 1)][i.toString()], indxArr.concat([board[ltrCurrentIndx][word.charAt(counter + 1)][i.toString()]]), counter + 1)) return true;
            }
        }
    }
}

//checks each word in json word list 
function checkDict(board,dict) {
    let solsObj = {};
    let solsCount = 0;
    for (let i = 0; i < dict.length; i++) if (checkWord(board, dict[i])) solsObj[dict[i]]= ++solsCount;
    return solsObj;
}


function newBoardAndWords(){
    let rndStr = createBoard(6); //creates 6x6 board
    let strArr = rndStr.split(''); 
    let board = boardF(strArr); 
    let dictAZ = fs.readFileSync('./wordsolver/dictAZ3.json', 'UTF8'); //list of english words 3 letters or longer
    let dictAZjson = JSON.parse(dictAZ);
    let foundWords = checkDict(board, dictAZjson);
    dictAZ=null;
    dictAZjson=null;
    return {currentBoard: strArr, wordList: foundWords}
}

