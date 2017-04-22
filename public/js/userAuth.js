//  var userObj = {};
//  var ref = new Firebase("https://sizzling-fire-9187.firebaseio.com");
//  ref.onAuth(function(authData) {
//      if (authData) {
//          console.log("Authenticated with uid:", authData.uid);
//          // authData.uid;
//          var usernameuid = authData.uid;
//          $('.overlay').hide();
//          userObj.uid = usernameuid;
//          getUser(usernameuid);

//      } else {
//          console.log("Client unauthenticated.");
//          $('.overlay').show();
//      }
//  });

//  document.getElementById('loginButton').addEventListener('click', loginUser);

//  function loginUser() {
//      var loginUser = {};
//      loginUser.email = document.getElementById('eMail').value; //sanitize
//      loginUser.password = document.getElementById('passWord').value; //sanitize
//      document.getElementById('passWord').value = '';
//      // var ref = new Firebase("https://sizzling-fire-9187.firebaseio.com");
//      ref.authWithPassword({
//          email: loginUser.email,
//          password: loginUser.password
//      }, function(error, authData) {
//          if (error) {
//              console.log("Login Failed!", error);
//          } else {
//              console.log("Authenticated successfully with payload:", authData);
//              var usernameuid = authData.uid;
//              getUser(usernameuid);
//              console.log(userObj);
//              $('.overlay').hide();
//          }
//      }, {
//          remember: "sessionOnly"
//      });
//  }


//  function getUser(uid) {
//      ref.child('playersClub').child(uid).on("value", function(snappy) {
//          var uname = snappy.val();
//          // var userObj = {};
//          userObj.username = uname.username;
//          userObj.highscore = uname.highscore;
//          console.log('hi');
//          // if(!wordUpJSRun) { 
//          //     wordUpJSRun = true;
//          //     wordUpJS();
//          // }
//          console.log(userObj.username);
//          document.getElementById('userDiv').innerHTML = userObj.username;
//          document.getElementById('highScore').innerHTML = "Record: " + userObj.highscore;
//          return userObj;
//      });
//  }



// //register
//  document.getElementById('registerButton').addEventListener('click', registerUser);

//     function registerUser() {
//         var newUser = {};
//         newUser.email = document.getElementById('eMailSignUp').value; //sanitize
//         newUser.password = document.getElementById('passWordSignUp').value; //sanitize
//         document.getElementById('passWordSignUp').value ='';
//         newUser.username = document.getElementById('userNameSignUp').value; //sanitize

//         //if(!usernames[newUser.username]) 
//         // var ref = new Firebase("https://sizzling-fire-9187.firebaseio.com");
//         ref.createUser({
//             email: newUser.email,
//             password: newUser.password
//         }, function(error, userData) {
//             if (error) {
//                 switch (error.code) {
//                     case "EMAIL_TAKEN":
//                         console.log("The new user account cannot be created because the email is already in use.");
//                         break;
//                     case "INVALID_EMAIL":
//                         console.log("The specified email is not a valid email.");
//                         break;
//                     default:
//                         console.log("Error creating user:", error);
//                 }
//             } else {
//                 console.log("Successfully created user account with uid:", userData.uid);
//                 ref.authWithPassword({
//                     email: newUser.email,
//                     password: newUser.password
//                 }, function(error, authData) {
//                     if (error) {
//                         console.log("Login Failed!", error);
//                     } else {
//                         console.log("Authenticated successfully with payload:", authData);
//                         var playersClub = new Firebase("https://sizzling-fire-9187.firebaseio.com/playersClub");
//                         var playersClubID = playersClub.child(userData.uid);
//                         var onComplete = function(error) {
//                             if (error) {
//                                 console.log('Reg-Login-DB failed');
//                             } else {
//                                 console.log('Reg-Login-DB succeeded');
//                                  document.getElementById('userDiv').innerHTML = newUser.username;
//                                 document.getElementById('highScore').innerHTML = "Record: " + 0;
        
//                                 // window.location = "http://wordisbond.herokuapp.com/wordUp";
//                                 // window.location="http://wordUp-relloller.c9users.io/wordUp";

//                             }
//                         };

//                         playersClubID.set({
//                             username: newUser.username,
//                             email: newUser.email,
//                             highscore: 0,
//                             wordList: []
//                         }, onComplete);
//                     }
//                 });
//             }
//         });
//     }


// //logout function


 $(document).ready(function() {
     // $("#userNameDiv").hide();
     // $("#alreadyAccount").hide();
     // $("#registerButton").hide();
 $("#signUpForm").hide();
 });

 $('#registerLink').click(function() {
    $("#signUpForm").show();
     // $('#loginButton').hide();
     // $('#lostpassword').hide();
     // $("#registerLink").hide();
     // $('#userNameDiv').show();
     // $("#registerButton").show();
     // $("#alreadyAccount").show();
 });


 $('#alreadyAccount').click(function() {
    console.log('loginlink');
    $("#signUpForm").hide();
     // $('#userNameDiv').toggle();
     // $('#loginButton').show();
     // $('#lostpassword').show();
     // $("#registerButton").hide();
     // $("#alreadyAccount").hide();
     // $("#registerLink").show();
 });

//prevent default for touch event - logout is addressed in touchevents
 // $('#logOut').click(function() {
 //    console.log('logOut');
 //   ref.unauth(); });
