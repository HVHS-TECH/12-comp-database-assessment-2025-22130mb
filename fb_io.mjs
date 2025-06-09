import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { ref, set } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";

const COL_C = 'white';	    // These two const are part of the coloured 	
const COL_B = '#CD7F32'; 
var fb_gameDB;
var fb_uid;

function fb_initialise() {
    console.log('%c fb_initialise(): ', 'color: ' + COL_C + '; background-color: ' + COL_B + ';');
    console.log("hello world");
    const FB_GAMECONFIG = {
        apiKey: "AIzaSyCHDtQ5nuCxgp_XCL_RtR7YVHv8mO1rhmc",
        authDomain: "comp-2025-max-bergman-4bb13.firebaseapp.com",
        databaseURL: "https://comp-2025-max-bergman-4bb13-defaut-rtdb.asia-southeast1.firebasedatabase.app",
        projectId: "comp-2025-max-bergman-4bb13",
        storageBucket: "comp-2025-max-bergman-4bb13.firebasestorage.app",
        messagingSenderId: "75891205088",
        appId: "1:75891205088:web:9ce6dd10fe8f59fb6f8185",
        measurementId: "G-860HVWZ49V"
    };

    const FB_GAMEAPP = initializeApp(FB_GAMECONFIG);
    fb_gameDB = getDatabase(FB_GAMEAPP);

    console.info(fb_gameDB);
}

function fb_authenticate() {
    console.log("In autghenticate")
    const AUTH = getAuth();
    const PROVIDER = new GoogleAuthProvider();

    // The following makes Google ask the user to select the account

    PROVIDER.setCustomParameters({

        prompt: 'select_account'
    });
    signInWithPopup(AUTH, PROVIDER).then((result) => {
         console.log(result);
        console.log(result.user.uid);
        fb_uid = result.user.uid;
    })
        .catch((error) => {
            console.log(error);
        });
}

 function fb_writeto(){
    const dbReference = ref(fb_gameDB, ("Users/" + fb_uid));
    var _Address = document.getElementById("Address").value;
    var _Age = document.getElementById("Age").value;
    var _Name = document.getElementById("Name").value;
    var UserInformation = {Address: _Address, favoriteFruit: _favoriteFruit, _fruitQuantity: _fruitQuantity };
    set(dbReference, UserInformation).then(() => {

        console.log("written the following indformation to the database");
        console.log(UserInformation);
    }).catch((error) => {

        console.log("write error");
        console.log(error);
    });
}



export {
  fb_initialise,
  fb_authenticate,
  fb_writeto
};