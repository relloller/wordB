/*
    https://www.github.com/relloller/wordisbond
*/

var fs = require('fs');
var dictAZ = fs.readFileSync('dictAZ.json', 'UTF8'); //list of english words
var dictAZjson = JSON.parse(dictAZ);
console.log('dictAZjson.length', dictAZjson.length);

//distribution of letters according to wikipedia
var abcFreq = 'aaaaaaaabbcccdddeeeeeeeeeeeeffgghhhhhhiiiiiiijkllllmmnnnnnnnooooooooppqrrrrrrsssssstttttttttuuuvwwxyyz';

//creates new board(string of letters)
function createBoard(boardsize){
    var strLength = boardsize*boardsize;
    var strTemp = '';
    for (var i = 0; i < strLength; i++) {
        strTemp+=abcFreq.charAt(Math.floor(Math.random()*abcFreq.length));
    }
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
function boardObjF(strA) {
    var boardObjTemp = {};
    for (var i = 0; i < strA.length; i++) {
        boardObjTemp[i] = adjLtrs(i, strA);
        if (!boardObjTemp[strA[i]]) boardObjTemp[strA[i]] = [];
        boardObjTemp[strA[i]].push(i);
    }
    return boardObjTemp;
}

//checks word **refactor for global boardObj
function checkWord(word) {
    if (boardObj[word.charAt(0)]) {
        for (var i = 0; i < boardObj[word.charAt(0)].length; i++) {
            if (checkNextLetter(word, boardObj[word.charAt(0)][i])) return true;
        }
    }
    return false;
}

//checks next letter recursively *needs a refactor for global boardObj..also...looks crazy
function checkNextLetter(word, ltrCurrentIndx, indxArr = [ltrCurrentIndx], counter = 0) {
    if (indxArr.length === word.length) return true;
    if (boardObj[ltrCurrentIndx][word.charAt(counter + 1)]) {
        for (var i = 0; i < boardObj[ltrCurrentIndx][word.charAt(counter + 1)].length; i++) {
            if (!indxArr.some(e => {
                    return e === boardObj[ltrCurrentIndx][word.charAt(counter + 1)][i.toString()]
                })) {
                if (checkNextLetter(word, boardObj[ltrCurrentIndx][word.charAt(counter + 1)][i.toString()], indxArr.concat([boardObj[ltrCurrentIndx][word.charAt(counter + 1)][i.toString()]]), counter + 1)) return true;
            }
        }
    }
}

//checks each word in dictionary that is at least 4 letters
function checkDict(dict) {
    var sols = [];
    for (var i = 0; i < dict.length; i++) {
        if (dict[i].length > 3 && checkWord(dict[i])) sols.push(dict[i]);
    }
    return sols;
}



var rndStr = createBoard(6); //creates 6x6 board
var strArr = rndStr.split(''); 
printB(rndStr); //prints board to console
var boardObj = boardObjF(strArr); 
console.log('boardObj',boardObj );

console.time('wordFind');
var foundWords = checkDict(dictAZjson);
console.timeEnd('wordFind');

printB(rndStr);
console.log('foundWords', foundWords, foundWords.length);
