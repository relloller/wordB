//relloller was h3re
var userObj = {};
var mousedownTF = false;
var uID = '';
var ref = new Firebase("https://sizzling-fire-9187.firebaseio.com");
ref.onAuth(function(authData) {
    if (authData) {
        console.log("Authenticated wiasdfasdfth uid:", authData.uid);
        uID = authData.uid;
        $('.overlay').hide();
    } else {
        console.log("Client unauthenticated.");
        $('.overlay').show();
    }
});

document.getElementById('loginButton').addEventListener('click', loginUser);

function loginUser() {
    var loginUser = {};
    loginUser.email = document.getElementById('eMail').value; //sanitize
    loginUser.password = document.getElementById('passWord').value; //sanitize
    document.getElementById('passWord').value = '';
    // var ref = new Firebase("https://sizzling-fire-9187.firebaseio.com");
    ref.authWithPassword({
        email: loginUser.email,
        password: loginUser.password
    }, function(error, authData) {
        if (error) {
            console.log("Login Failed!", error);
        } else {
            console.log("Authenticated successfully with payload:", authData);
            var usernameuid = authData.uid;
            getUser(usernameuid);
            uID = authData.uid;
            $('.overlay').hide();
        }
    }, {
        remember: "sessionOnly"
    });
}

function getUser(uid) {
    ref.child('playersClub').child(uid).on("value", function(snappy) {
        var uname = snappy.val();
        userObj.username = uname.username;
        userObj.highscore = uname.highscore;
        console.log(userObj.username);
        document.getElementById('userDiv').innerHTML = userObj.username;
        document.getElementById('highScore').innerHTML = "Record: " + userObj.highscore;
        return userObj;
    });
}

//register
document.getElementById('registerButton').addEventListener('click', registerUser);

function registerUser() {
    var newUser = {};
    newUser.email = document.getElementById('eMailSignUp').value; //sanitize
    newUser.password = document.getElementById('passWordSignUp').value; //sanitize
    document.getElementById('passWordSignUp').value = '';
    newUser.username = document.getElementById('userNameSignUp').value; //sanitize

    //if(!usernames[newUser.username]) 
    // var ref = new Firebase("https://sizzling-fire-9187.firebaseio.com");
    ref.createUser({
        email: newUser.email,
        password: newUser.password
    }, function(error, userData) {
        if (error) {
            switch (error.code) {
                case "EMAIL_TAKEN":
                    console.log("The new user account cannot be created because the email is already in use.");
                    break;
                case "INVALID_EMAIL":
                    console.log("The specified email is not a valid email.");
                    break;
                default:
                    console.log("Error creating user:", error);
            }
        } else {
            console.log("Successfully created user account with uid:", userData.uid);
            ref.authWithPassword({
                email: newUser.email,
                password: newUser.password
            }, function(error, authData) {
                if (error) {
                    console.log("Login Failed!", error);
                } else {
                    console.log("Authenticated successfully with payload:", authData);
                    var playersClub = new Firebase("https://sizzling-fire-9187.firebaseio.com/playersClub");
                    var playersClubID = playersClub.child(userData.uid);
                    var onComplete = function(error) {
                        if (error) {
                            console.log('Reg-Login-DB failed');
                        } else {
                            console.log('Reg-Login-DB succeeded');
                            document.getElementById('userDiv').innerHTML = newUser.username;
                            document.getElementById('highScore').innerHTML = "Record: " + 0;

                        }
                    };

                    playersClubID.set({
                        username: newUser.username,
                        email: newUser.email,
                        highscore: 0,
                        wordList: []
                    }, onComplete);
                }
            });
        }
    });
}

//anonymous authentication
document.getElementById('guestLink').addEventListener('click', anonLogin);

function anonLogin() {
    ref.authAnonymously(function(error, authData) {
        if (error)  {
            console.log("Login Failed!", error);
        }
        else {
            console.log("Authenticated successfully with payload:", authData);
            uID = authData.uid;
            $('.overlay').hide();
        }
    });
}

var wordUpJSRun = false;
var foundWords = {};
var foundWordsArr = [];
wordUpJS(uID);

function wordUpJS(uID) {
    // console.log('userObjWordup.js', userObj);
    var socket = io();
    var boardLetters = [];
    var rows = document.getElementsByClassName('rows');
    var fillersFooterDiv = document.getElementsByClassName('fillersfooter');
    var statsDivCol = document.getElementById('statsDiv');
    var bondedWordDiv = document.getElementById('bondedWord');
    var foundWordsListDiv = document.getElementById('foundWordsList');
    var pointsDiv = document.getElementById('pointsDiv');
    var pointsWordDiv = document.getElementById('pointsWordDiv');
    var rankingDiv = document.getElementById('rankingDiv');
    var timerDiv = document.getElementById('timerDiv');
    var fillersDiv = document.getElementsByClassName('fillers');
    var logOutDiv = document.getElementById('logOut');
    var lettersArr = document.getElementsByClassName('rows');
    var firstWord = true;
    var roundPoints = 0;
    var showWordUp = false;
    var showWordToBigBird = false;
    var wordArr = [];
    var wordArrDOM = [];
    var letterIDArr = {};
    

    //socket.on
    socket.on('Set uID', function(uid){
        uID=uid;
        console.log('uID Duplicate', uID);
    });

    // socket.emit('uID', uID);

    socket.on('currentBoard', function(currentBoard) {
        foundWords = {};
        foundWordsArr = [];
        console.log('newBoardLetters', currentBoard[1]);
        for (var i = 0; i < 36; i++) {
            rows[i].id = '' + (i + 1);
            rows[i].setAttribute('data-abc', currentBoard[i]);
            rows[i].innerHTML = currentBoard[i];
        }
        roundPoints = 0;
        document.getElementsByClassName('fillers')[1].innerHTML = "";
        foundWordsListDiv.innerHTML = '';
        pointsDiv.innerHTML = 'Score: ' + roundPoints;
    });

    socket.on('elapsedGameTime', function(time) {
        var timer = Math.floor(time / 1000);
        var minutes = Math.floor((150 - timer) / 60);
        var seconds = (150 - timer) % 60;
        if (seconds > 9) {
            timerDiv.innerHTML = minutes + ':' + seconds;
        } else {
            timerDiv.innerHTML = minutes + ':0' + seconds;
        }
    });

    socket.on('wordUp', function(wordUpped) {
        console.log('wordUpped', wordUpped);
        for (var i = 0, len = rows.length; i < len; i++) {
            if (rows[i].classList[1] === 'pressed') {
                rows[i].classList.remove('pressed');
                rows[i].classList.add('wiggleWordTransition');
                rows[i].addEventListener('transitionend', function(e) {
                    e.preventDefault();
                    this.classList.remove('wiggleWordTransition');
                });
            }
        }
        var wordBox = document.getElementsByClassName('rowsmini');
        // wordBox.innerHTML = '';
        for (var i = 0; i < wordBox.length; i++) {
            wordBox[i].classList.add('wordBond');
        };
        // bondedWordDiv.classList.add('letterUp');
        showWordUp = true;
        foundWords[wordUpped] = 1;
        foundWordsArr.push(wordUpped.toUpperCase());
        foundWordsArr = foundWordsArr.sort();
        var insertHere = foundWordsArr.indexOf(wordUpped);
        foundWordsListDiv.innerHTML = '<br>' + foundWordsArr.join("<br>");
        var wordLength = wordUpped.length;
        var pointsforWord = wordLength;
        roundPoints += wordLength;
        pointsDiv.innerHTML = 'Score: ' + roundPoints;
        pointsWordDiv.innerHTML = " +" + wordLength;
        setTimeout(function() {
            if (showWordUp === true) {
                showWordUp = false;
                // bondedWordDiv.classList.remove('letterUp');
                bondedWordDiv.innerHTML = "";
                pointsWordDiv.innerHTML = "";
            }
        }, 800);
    });


    socket.on('wordToBigBird', function() {
        showWordToBigBird = true;
        bondedWordDiv.classList.add('wordToBigBird');
        for (var i = 0, len = rows.length; i < len; i++) {
            if (rows[i].classList[1] === 'pressed') {
                rows[i].classList.remove('pressed');
            }
        }
        setTimeout(function() {
            if (showWordToBigBird === true) {
                showWordToBigBird = false;
                bondedWordDiv.classList.remove('wordToBigBird');
                bondedWordDiv.innerHTML = '';
                pointsWordDiv.innerHTML = '';
            }
        }, 150);
    });


    socket.on('elapsedIntermissionTime', function(time) {
        var userRef = new Firebase("https://sizzling-fire-9187.firebaseio.com/playersClub/" + userObj.uid);
        if (roundPoints > userObj.highscore) {
            userObj.highscore = roundPoints;
            var onComplete = function(error) {
                if (error) {
                    console.log('Synchronization failed');
                } else {
                    console.log('Synchronization succeeded');
                }
            };
            userRef.update({
                highscore: roundPoints
            }, onComplete);
            document.getElementById('highScore').innerHTML = "*NEW Record*<br>" + roundPoints;
        }

        var timer = Math.floor(time / 1000);
        var minutes = Math.floor((180 - timer) / 60);
        var seconds = (180 - timer) % 60;
        timerDiv.innerHTML = "0:00";
        fillersDiv[1].innerHTML = 30 - timer;
    });

    socket.on('ranking', function(rankInfo) {
        // var rank = rankInfo.rank + 1;
        console.log('rankInfo', rankInfo, rankInfo['uID'][uID]);
        var rank = rankInfo['uID'][uID]+1;
        var totalPlayers = rankInfo.totalPlayers;
        rankingDiv.innerHTML = rank + " of " + totalPlayers;
    });

    socket.on('endGame', function(winners) {
        console.log('endgametestwinners', winners);
        if (roundPoints > userObj.highscore) {
            userObj.highscore = roundPoints;
            var onComplete = function(error) {
                if (error) {
                    console.log('Synchronization failed');
                } else {
                    console.log('Synchronization succeeded');
                }
            };
            userRef.update({
                highscore: roundPoints
            }, onComplete);
            document.getElementById('highScore').innerHTML = "*NEW Record*<br>" + roundPoints;
        }
    });


    foundWordsListDiv.addEventListener('touchstart', function(e) {
        e.stopImmediatePropagation();
        // e.preventDefault();
        e.stopPropagation();
        console.log(e);

        function checkScroll() {
            if (foundWordsListDiv.scrollHeight - foundWordsListDiv.scrollTop < 140) {
                foundWordsListDiv.innerHTML += '<br>';
            }
            requestAnimationFrame(checkScroll);
        };
        var checkScrollAni = requestAnimationFrame(checkScroll);
        foundWordsListDiv.addEventListener('touchend', function(e) {
            // e.preventDefault();
            cancelAnimationFrame(checkScrollAni);
        });
    });



    fillersDiv[0].addEventListener('touchstart', function(e) {
        var posX = e.touches[0].clientX;
        var posY = e.touches[0].clientY;
        var elemCurrent;
        var elemCurrent = document.elementFromPoint(posX, posY);
        if (elemCurrent.id === 'logOut') {
            console.log('asdflogout');
            ref.unauth();
            logOutDiv.innerHTML = '';
        }
        e.stopImmediatePropagation();
        e.stopPropagation();
        e.preventDefault();
    });


    elPrevDefStopImmProp(fillersDiv[0], ['touchmove']);
    elPrevDefStopImmProp(fillersDiv[1], ['touchstart', 'touchmove']);
    elPrevDefStopImmProp(fillersFooterDiv[0], ['touchstart', 'touchmove']);
    elPrevDefStopImmProp(statsDivCol, ['touchstart', 'touchmove']);
    elPrevDefStopImmProp(bondedWordDiv, ['touchstart', 'touchmove']);




    function elPrevDefStopImmProp(el, arrEv) {
        for (var i = 0; i < arrEv.length; i++) el.addEventListener(arrEv[i], prevDefStopImmProp);
    }

    function prevDefStopImmProp(ev) {
        ev.stopImmediatePropagation();
        ev.stopPropagation();
        ev.preventDefault();
    }

    //////desktop
    document.getElementById('wordUpBoard').addEventListener('mousedown', function(e) {
        e.preventDefault();
        var posX = e.pageX;
        var posY = e.pageY;
        var elemCurrent;
        mousedownTF = true;
        var elemCurrent = document.elementFromPoint(posX, posY);
        if (elemCurrent.classList[0] === 'rows' && !letterIDArr[elemCurrent.id]) {
            showWordToBigBird = false;
            if (showWordUp) {
                showWordUp = false;
                bondedWordDiv.classList.remove('letterUp');
                pointsWordDiv.innerHTML = "";
            }
            elemCurrent.classList.add('pressed');
            wordArrDOM.push('<div class="rowsmini">');
            wordArrDOM.push(elemCurrent.getAttribute('data-abc'));
            wordArrDOM.push('</div>');
            wordArr.push(elemCurrent.getAttribute('data-abc'));
            elemCurrentID = elemCurrent.id;
            letterIDArr[elemCurrentID] = true;
            bondedWordDiv.innerHTML = wordArrDOM.join('');
            // bondedWordDiv.innerHTML = '<div class="rowsmini">' + wordArr[0] + '</div>';
        }
    });

    for (var i = 0; i < lettersArr.length; i++) {

        lettersArr[i].addEventListener('mousemove', function(e) {
            if (mousedownTF) {
                e.preventDefault();
                var posX = e.pageX;
                var posY = e.pageY;
                var elemCurrent;
                var elemCurrent = document.elementFromPoint(posX, posY);
                if (elemCurrent.classList[0] === 'rows' && !letterIDArr[elemCurrent.id]) {
                    showWordToBigBird = false;
                    if (showWordUp) {
                        showWordUp = false;
                        bondedWordDiv.classList.remove('letterUp');
                        pointsWordDiv.innerHTML = "";
                    }
                    elemCurrent.classList.add('pressed');
                    wordArrDOM.push('<div class="rowsmini">');
                    wordArrDOM.push(elemCurrent.getAttribute('data-abc'));
                    wordArrDOM.push('</div>');
                    wordArr.push(elemCurrent.getAttribute('data-abc'));
                    elemCurrentID = elemCurrent.id;
                    letterIDArr[elemCurrentID] = true;
                    bondedWordDiv.innerHTML = wordArrDOM.join('');
                }
            }
        });
    }

    document.getElementById('wordUpBoard').addEventListener('mouseup', function(e) {
        console.log('mouseup');
        mousedownTF = false;
        e.preventDefault();
        //query for word
        var wordMaybe = wordArr.join('');
        if (wordMaybe.length > 2 && !foundWords[wordMaybe]) {
            // console.time('wordCheckSocket');
            socket.emit('wordCheck', wordMaybe);
        } else {
            bondedWordDiv.innerHTML = "";
            for (var i = 0; i < 36; i++) {
                if (rows[i].classList[1] === 'pressed') {
                    rows[i].classList.remove('pressed');
                }
            }
        }
        wordArrDOM = [];
        wordArr = [];
        letterIDArr = {};
    });


    document.getElementById('wordUpBoard').addEventListener('touchstart', function(e) {
        e.preventDefault();
        var posX = e.touches[0].clientX;
        var posY = e.touches[0].clientY;
        var elemCurrent;
        var elemCurrent = document.elementFromPoint(posX, posY);
        if (elemCurrent.classList[0] === 'rows' && !letterIDArr[elemCurrent.id]) {
            showWordToBigBird = false;
            if (showWordUp) {
                showWordUp = false;
                bondedWordDiv.classList.remove('letterUp');
                pointsWordDiv.innerHTML = "";
            }
            elemCurrent.classList.add('pressed');
            wordArrDOM.push('<div class="rowsmini">');
            wordArrDOM.push(elemCurrent.getAttribute('data-abc'));
            wordArrDOM.push('</div>');
            wordArr.push(elemCurrent.getAttribute('data-abc'));
            elemCurrentID = elemCurrent.id;
            letterIDArr[elemCurrentID] = true;
            // console.log(wordArr);
            bondedWordDiv.innerHTML = wordArrDOM.join('');
            // bondedWordDiv.innerHTML = '<div class="rowsmini">' + wordArr[0] + '</div>';
        }
    });

    document.getElementById('wordUpBoard').addEventListener('touchmove', function(e) {
        e.preventDefault();
        var posX = e.touches[0].clientX;
        var posY = e.touches[0].clientY;
        var elemCurrent;
        var elemCurrent = document.elementFromPoint(posX, posY);
        if (elemCurrent.classList[0] === 'rows' && !letterIDArr[elemCurrent.id]) {
            showWordToBigBird = false;
            if (showWordUp) {
                showWordUp = false;
                bondedWordDiv.classList.remove('letterUp');
                pointsWordDiv.innerHTML = "";
            }
            elemCurrent.classList.add('pressed');
            wordArrDOM.push('<div class="rowsmini">');
            wordArrDOM.push(elemCurrent.getAttribute('data-abc'));
            wordArrDOM.push('</div>');
            wordArr.push(elemCurrent.getAttribute('data-abc'));
            elemCurrentID = elemCurrent.id;
            letterIDArr[elemCurrentID] = true;
            bondedWordDiv.innerHTML = wordArrDOM.join('');
        }
    });

    document.getElementById('wordUpBoard').addEventListener('touchend', function(e) {
        e.preventDefault();
        //query for word
        var wordMaybe = wordArr.join('');
        if (wordMaybe.length > 2 && !foundWords[wordMaybe]) {
            // console.time('wordCheckSocket');
            socket.emit('wordCheck', wordMaybe);
        } else {
            bondedWordDiv.innerHTML = "";
            for (var i = 0; i < 36; i++) {
                if (rows[i].classList[1] === 'pressed') {
                    rows[i].classList.remove('pressed');
                }
            }
        }
        wordArrDOM = [];
        wordArr = [];
        letterIDArr = {};
    });
};


//touch event manipulation


// document.getElementById('wordUpBoard').addEventListener('touchstart', function(e) {
//     e.preventDefault();
//     var posX = e.touches[0].clientX;
//     var posY = e.touches[0].clientY;
//     var elemCurrent;
//     var elemCurrent = document.elementFromPoint(posX, posY);
//     if (elemCurrent.classList[0] === 'rows' && !letterIDArr[elemCurrent.id]) {
//         showWordToBigBird = false;
//         if (showWordUp) {
//             showWordUp = false;
//             bondedWordDiv.classList.remove('letterUp');
//             document.getElementById('pointsWordDiv').innerHTML = "";
//         }
//         elemCurrent.classList.add('pressed');
//         wordArr.push(elemCurrent.getAttribute('data-abc'));
//         elemCurrentID = elemCurrent.id;
//         letterIDArr[elemCurrentID] = true;
//         // console.log(wordArr);
//         bondedWordDiv.innerHTML = wordArr.join('');
//     }
//     // console.log(elemCurrent);
// });