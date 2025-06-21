import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

const COL_C = 'white';
const COL_B = '#CD7F32';

console.log('%c fb_io.mjs', 'color: blue; background-color: white;');

// Firebase App Initialization
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
const fb_gameDB = getDatabase(FB_GAMEAPP);

var fb_uid;
var fb_email;

function fb_authenticate() {
    console.log('%c fb_initialise(): ', 'color: ' + COL_C + '; background-color: ' + COL_B + ';');
    const AUTH = getAuth();
    const PROVIDER = new GoogleAuthProvider();

    PROVIDER.setCustomParameters({
        prompt: 'select_account'
    });

    signInWithPopup(AUTH, PROVIDER).then((result) => {
        console.log(result);
        console.log(result.user.email);
        fb_email = result.user.email;
        console.log(result.user.uid);
        fb_uid = result.user.uid;
    }).catch((error) => {
        console.log(error);
    });
}

function fb_write() {
    if (!fb_uid || !fb_email) {
        console.log("User is not authenticated");
        return;  // Prevent writing if the user is not authenticated
    }

    const safe_uid = fb_uid.replace(/\./g, '_');
    const dbReference = ref(fb_gameDB, `Users/${safe_uid}`);
    var _name = document.getElementById("name").value;

    if (!_name) {
        console.log("Please provide a name");
        return;  // Prevent writing if the name is not provided
    }

    var UserInformation = { name: _name, email: fb_email };

    set(dbReference, UserInformation)
        .then(() => {
            console.log("Written the following information to the database:");
            console.log(UserInformation);
        })
        .catch((error) => {
            console.log("Write error:");
            console.log(error);
        });
}

export {
    fb_authenticate,
    fb_write
};
