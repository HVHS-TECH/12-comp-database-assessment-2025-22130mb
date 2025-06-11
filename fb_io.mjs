import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { ref, set, get } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";

const COL_C = 'white';
const COL_B = '#CD7F32';

console.log('%c fb_io.mjs', 'color: blue; background-color: white;');

var fb_gameDB;
var fb_uid;

function fb_authenticate() {
    console.log('%c fb_initialise(): ', 'color: ' + COL_C + '; background-color: ' + COL_B + ';');
    console.log("hello world");
    const FB_GAMECONFIG = {
        apiKey: "AIzaSyCHDtQ5nuCxgp_XCL_RtR7YVHv8mO1rhmc",
        authDomain: "comp-2025-max-bergman-4bb13.firebaseapp.com",
        databaseURL: "https://comp-2025-max-bergman-4bb13-default-rtdb.asia-southeast1.firebasedatabase.app",
        projectId: "comp-2025-max-bergman-4bb13",
        storageBucket: "comp-2025-max-bergman-4bb13.firebasestorage.app",
        messagingSenderId: "75891205088",
        appId: "1:75891205088:web:9ce6dd10fe8f59fb6f8185",
        measurementId: "G-860HVWZ49V"
    };

    const FB_GAMEAPP = initializeApp(FB_GAMECONFIG);
    fb_gameDB = getDatabase(FB_GAMEAPP);

    console.info(fb_gameDB);
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
    }).catch((error) => {
        console.log(error);
    });
}

function fb_write() {
    const dbReference = ref(fb_gameDB, ("Users/" + fb_uid));
    var _name = document.getElementById("name").value;
    var _email = document.getElementById("email").value;
    var UserInformation = { name: _name, email: _email };
    set(dbReference, UserInformation).then(() => {
        console.log("written the following indformation to the database");
        console.log(UserInformation);
    }).catch((error) => {
        console.log("write error");
        console.log(error);
    });
}

function fb_read() {
    const dbReference = ref(fb_gameDB, ("Users/" + fb_uid));
    get(dbReference).then((snapshot) => {
        var fb_data = snapshot.val();
        if (fb_data != null) {
            console.log("successful read");
            console.log(fb_data);
        } else {
            console.log("no record found");
            console.log(fb_data);
        }
    }).catch((error) => {
        console.log("read error");
        console.log(error);
    });
}

export {
    fb_authenticate,
    fb_write,
    fb_read
};