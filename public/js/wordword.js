// wordword.js

(function() {
  const strAZ = "abcdefghijklmnopqrstuvwxy".split("");
  let boardSols = {};
  let boardLetters = [];
  let lettersPressed = [];
  let letterCells = document.getElementsByClassName("letterCell");
  let cellIdsPressed = {};
  let cellIdLastPressed = "";
  let cellIdsPressedArr = [];
  let wordsFound = {};
  let currentSolution = "";
  let selectedSol;
  let cellIdsAvail = {};
  let gameIntermission = false;
  let touchInProgress = false;
  let mousePressInProgress = false;

  function renderNewBoard() {
    for (let i = 0; i < letterCells.length; i++) {
      let el = letterCells[i];
      el.textContent = boardLetters[i].toUpperCase();
    }
  }

  function newGameRender(data) {
    wordSolutionsList.classList.add("hideSolutions");
    currentWordDiv.classList.remove("hideSolutions");
    currentWordDiv.innerHTML = "";

    for (var i = 0; i < letterCells.length; i++) {
      if (letterCells[i].classList.contains("solution"))
        letterCells[i].classList.toggle("solution");
    }
    currentSolution = "";
    wordSolutionsList.innerHTML = "";
    boardSols = data.wordList;
    boardLetters = data.currentBoard;
    gameIntermission = data.gameIntermission;
    if (gameIntermission) showSolutions();
    renderNewBoard();
  }

  function getUId() {
    if (!window.localStorage) return false;
    else return window.localStorage.getItem("uId");
  }

  function setUId(uId) {
    if (!window.localStorage) return;
    window.localStorage.setItem("uId", uId);
  }

  function updateScore(score) {
    scoreDiv.textContent = "Score: " + score;
  }

  function updateStats(stats) {
    scoreDiv.textContent = "Score: " + stats.score;
    rankDiv.textContent = "Rank: " + stats.rank + " of " + stats.totalPlayers;
    timerDiv.textContent = "Timer: " + stats.timeLeft;
  }

  function updateIntermissionTime(intermissionTime) {
    if (gameIntermission === false) {
      gameIntermission = true;
      showSolutions();
    }
    timerDiv.textContent = "Next round in: " + intermissionTime;
  }

  function showSolutions() {
    for (let i = 0; i < letterCells.length; i++) {
      if (letterCells[i].classList.contains("pressed"))
        letterCells[i].classList.remove("pressed");
    }
    currentWordDiv.classList.add("hideSolutions");
    wordSolutionsList.classList.remove("hideSolutions");
    // create a new div element
    var newFrag = document.createDocumentFragment();
    var newContent;
    for (sol in boardSols) {
      let newDiv = document.createElement("div");
      newDiv.classList.add("foundWordInList");
      newDiv.setAttribute("data-word", sol);
      newContent = document.createTextNode(sol.toUpperCase());
      newDiv.appendChild(newContent);
      newFrag.appendChild(newDiv);
    }

    // add the newly created element and its content into the DOM
    wordSolutionsList.append(newFrag);
  }

  function startIntermission() {
    gameIntermission = true;
    showSolutions();
  }

  function connectSocket() {
    var getUIdResult = getUId();
    var socket = io();
    socket.on("newGame", newGameRender);
    socket.on("updateScore", updateScore);
    socket.on("updateStats", updateStats);
    socket.on("elapsedIntermissionTime", updateIntermissionTime);
    socket.on("start intermission", startIntermission);

    function verifyCellsAdjacent(cf) {
      let cfNum = parseInt(cf.slice(1));
      for (let i = 0; i < cellIdsAvail.length; i++) {
        if (cellIdsAvail[i] === cfNum) return true;
      }
      return false;
    }

    //finds adjacent letters at indx position
    function adjCellIds(cNum, strA) {
      var indx = parseInt(cNum.slice(1));
      var bsize = Math.sqrt(strA.length);
      var endRow = (indx + 1) % bsize === 0;
      var beginRow = (indx + 1) % bsize === 1;
      var topRow = indx < bsize;
      var bottomRow = indx + bsize > strA.length - 1;
      var p = {
        letter: strA[indx],
        indx: indx,
        adjLetters: []
      };

      //up-right neighbor
      if (!endRow && !topRow) {
        if (!p[strA[indx - bsize + 1]]) p[strA[indx - bsize + 1]] = [];
        p[strA[indx - bsize + 1]].push(indx - bsize + 1);
        p.adjLetters.push(indx - bsize + 1);
      }

      //right neighbor
      if (!endRow) {
        if (!p[strA[indx + 1]]) p[strA[indx + 1]] = [];
        p[strA[indx + 1]].push(indx + 1);
        p.adjLetters.push(indx + 1);
      }

      //down-right neighbor
      if (!endRow && !bottomRow) {
        if (!p[strA[indx + bsize + 1]]) p[strA[indx + bsize + 1]] = [];
        p[strA[indx + bsize + 1]].push(indx + bsize + 1);
        p.adjLetters.push(indx + bsize + 1);
      }

      //up-left neighbor
      if (!beginRow && !topRow) {
        if (!p[strA[indx - bsize - 1]]) p[strA[indx - bsize - 1]] = [];
        p[strA[indx - bsize - 1]].push(indx - bsize - 1);
        p.adjLetters.push(indx - bsize - 1);
      }

      //left neighbor
      if (!beginRow) {
        if (!p[strA[indx - 1]]) p[strA[indx - 1]] = [];
        p[strA[indx - 1]].push(indx - 1);
        p.adjLetters.push(indx - 1);
      }

      //down-left neighbor
      if (!beginRow && !bottomRow) {
        if (!p[strA[indx + bsize - 1]]) p[strA[indx + bsize - 1]] = [];
        p[strA[indx + bsize - 1]].push(indx + bsize - 1);
        p.adjLetters.push(indx + bsize - 1);
      }

      //up neighbor
      if (!topRow) {
        if (!p[strA[indx - bsize]]) p[strA[indx - bsize]] = [];
        p[strA[indx - bsize]].push(indx - bsize);
        p.adjLetters.push(indx - bsize);
      }

      //down neighbor
      if (!bottomRow) {
        if (!p[strA[indx + bsize]]) p[strA[indx + bsize]] = [];
        p[strA[indx + bsize]].push(indx + bsize);
        p.adjLetters.push(indx + bsize);
      }

      let adj = {};

      p.adjLetters.forEach(l => {
        if (l < 10) adj["l0" + l] = true;
        else adj["l" + l] = true;
      });

      return adj;
    }

    function addLetterToCurrentWord(letter) {
      var newDiv = document.createElement("div");
      newDiv.classList.add("rowsmini");
      var newContent = document.createTextNode(letter);
      newDiv.appendChild(newContent);
      currentWordDiv.appendChild(newDiv);
    }

    wordUpBoard.addEventListener("touchstart", function(ev) {
      ev.preventDefault();
      if (touchInProgress || gameIntermission) return;
      currentWordDiv.innerHTML = "";
      touchInProgress = true;
      var elemCurrent = document.elementFromPoint(ev.touches[0].clientX, ev.touches[0].clientY);
      let cId;
      if (elemCurrent) cId = elemCurrent.id || false;
      if (cId === "wordUpBoard" || cId === false) return;
      let cellIdsPressedLen = cellIdsPressedArr.length;
      if (
        cId &&
        !cellIdsPressed[cId] &&
        (cellIdsPressedLen === 0 || cellIdsAvail[cId])
      ) {
        let cellLetter = elemCurrent.textContent;
        cellIdsPressed[cId] = true;
        cellIdsPressedArr.push(cId);
        cellIdLastPressed = cId;
        cellIdsAvail = adjCellIds(cId, strAZ);
        lettersPressed.push(cellLetter);
        elemCurrent.classList.toggle("pressed");
        addLetterToCurrentWord(cellLetter);
      }
    });

    wordUpBoard.addEventListener("mousedown", function(ev) {
      ev.preventDefault();
      if (mousePressInProgress || gameIntermission) return;
      currentWordDiv.innerHTML = "";
      mousePressInProgress = true;
      var elemCurrent = document.elementFromPoint(ev.clientX, ev.clientY);
      let cId;
      if (elemCurrent) cId = elemCurrent.id || false;
      if (cId === "wordUpBoard" || cId === false) return;
      let cellIdsPressedLen = cellIdsPressedArr.length;
      if (
        cId &&
        !cellIdsPressed[cId] &&
        (cellIdsPressedLen === 0 || cellIdsAvail[cId])
      ) {
        let cellLetter = elemCurrent.textContent;
        cellIdsPressed[cId] = true;
        cellIdsPressedArr.push(cId);
        cellIdLastPressed = cId;
        cellIdsAvail = adjCellIds(cId, strAZ);
        lettersPressed.push(cellLetter);
        elemCurrent.classList.toggle("pressed");
        addLetterToCurrentWord(cellLetter);
      }
    });

    wordUpBoard.addEventListener("touchmove", function(ev) {
      ev.preventDefault();
      ev.stopPropagation();
      ev.stopImmediatePropagation();

      if (!touchInProgress || gameIntermission) return;
      var elemCurrent = document.elementFromPoint(ev.touches[0].clientX,ev.touches[0].clientY);
      let cId = elemCurrent.id || false;
      if (cId === "wordUpBoard" || cId === false) return;

      let cellIdsPressedLen = cellIdsPressedArr.length;
      if (
        cId &&
        !cellIdsPressed[cId] &&
        (cellIdsPressedLen === 0 || cellIdsAvail[cId])
      ) {
        let cellLetter = elemCurrent.textContent;
        cellIdsPressed[cId] = true;
        cellIdsPressedArr.push(cId);
        cellIdLastPressed = cId;
        cellIdsAvail = adjCellIds(cId, strAZ);
        lettersPressed.push(cellLetter);
        elemCurrent.classList.toggle("pressed");
        addLetterToCurrentWord(cellLetter);
      }
    });

    wordUpBoard.addEventListener("mousemove", function(ev) {
      ev.preventDefault();
      ev.stopPropagation();
      ev.stopImmediatePropagation();

      if (!mousePressInProgress || gameIntermission) return;
      var elemCurrent = document.elementFromPoint(ev.clientX, ev.clientY);
      let cId = elemCurrent.id || false;
      if (cId === "wordUpBoard" || cId === false) return;

      let cellIdsPressedLen = cellIdsPressedArr.length;
      if (
        cId &&
        !cellIdsPressed[cId] &&
        (cellIdsPressedLen === 0 || cellIdsAvail[cId])
      ) {
        let cellLetter = elemCurrent.textContent;
        cellIdsPressed[cId] = true;
        cellIdsPressedArr.push(cId);
        cellIdLastPressed = cId;
        cellIdsAvail = adjCellIds(cId, strAZ);
        lettersPressed.push(cellLetter);
        elemCurrent.classList.toggle("pressed");
        addLetterToCurrentWord(cellLetter);
      }
    });

    wordUpBoard.addEventListener("touchend", function(ev) {
      ev.preventDefault();
      ev.stopPropagation();
      ev.stopImmediatePropagation();
      if (gameIntermission) return;
      if (touchInProgress && ev.touches.length === 0) {
        touchInProgress = false;
        let currentWord = lettersPressed.join("").toLowerCase();
        if (boardSols[currentWord] && !wordsFound[currentWord]) {
          wordsFound[currentWord] = true;
          socket.emit("wordCheck", currentWord);

          let rowsmini = document.getElementsByClassName("rowsmini");
          for (var i = 0; i < rowsmini.length; i++) {
            rowsmini[i].classList.toggle("miniValid");
          }

          for (let i = 0; i < letterCells.length; i++) {
            if (letterCells[i].classList[1] === "pressed") {
              letterCells[i].classList.remove("pressed");
              letterCells[i].classList.add("wordValid");
              letterCells[i].addEventListener("transitionend", function(e) {
                e.preventDefault();
                this.classList.remove("wordValid");
              });
            }
          }
        } else {
          currentWordDiv.innerHTML = "";

          for (let i = 0; i < letterCells.length; i++) {
            if (letterCells[i].classList[1] === "pressed") {
              letterCells[i].classList.remove("pressed");
            }
          }
        }
        cellIdsPressedArr = [];
        cellIdsPressed = {};
        lettersPressed = [];
        cellIdsAvail = {};
      }
    });

    wordUpBoard.addEventListener("mouseup", function(ev) {
      ev.preventDefault();
      ev.stopPropagation();
      ev.stopImmediatePropagation();
      if (gameIntermission) return;
      if (mousePressInProgress) {
        mousePressInProgress = false;
        let currentWord = lettersPressed.join("").toLowerCase();
        if (boardSols[currentWord] && !wordsFound[currentWord]) {
          wordsFound[currentWord] = true;
          socket.emit("wordCheck", currentWord);
          let rowsmini = document.getElementsByClassName("rowsmini");
          for (let i = 0; i < rowsmini.length; i++) {
            rowsmini[i].classList.toggle("miniValid");
          }
          for (let i = 0; i < letterCells.length; i++) {
            if (letterCells[i].classList[1] === "pressed") {
              letterCells[i].classList.remove("pressed");
              letterCells[i].classList.add("wordValid");
              letterCells[i].addEventListener("transitionend", function(e) {
                e.preventDefault();
                this.classList.remove("wordValid");
              });
            }
          }
        } else {
          currentWordDiv.innerHTML = "";

          for (let i = 0; i < letterCells.length; i++) {
            if (letterCells[i].classList[1] === "pressed") {
              letterCells[i].classList.remove("pressed");
            }
          }
        }
        cellIdsPressedArr = [];
        cellIdsPressed = {};
        lettersPressed = [];
        cellIdsAvail = {};
      }
    });

    wordSolutionsList.addEventListener("touchmove", function(ev) {});

    wordSolutionsList.addEventListener("click", function(ev) {
      ev.preventDefault();
      var wordCurrent = document.elementFromPoint(ev.pageX, ev.pageY);
      if (selectedSol) selectedSol.classList.remove("selectedSolution");
      if (wordCurrent) wordCurrent.classList.add("selectedSolution");
      selectedSol = wordCurrent;
      let newWord = wordCurrent.getAttribute("data-word");
      if (currentSolution !== newWord) {
        if (currentSolution !== "") {
          boardSols[currentSolution].forEach(s => {
            letterCells[s].classList.toggle("solution");
          });
        }
        boardSols[newWord].forEach(s => {
          letterCells[s].classList.toggle("solution");
        });
        currentSolution = newWord;
      }
    });

    let statsColumnDiv = document.getElementsByClassName("statsColumn")[0];

    statsColumnDiv.addEventListener("touchstart", function(ev) {
      ev.preventDefault();
      ev.stopPropagation();
      ev.stopImmediatePropagation();
    });

    statsColumnDiv.addEventListener("touchmove", function(ev) {
      ev.preventDefault();
      ev.stopPropagation();
      ev.stopImmediatePropagation();
    });
  }
  connectSocket();
})();
