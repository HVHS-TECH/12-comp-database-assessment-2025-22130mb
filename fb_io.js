
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { 
  getDatabase, ref, set, query, orderByChild, limitToLast, onValue 
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";
import { 
  getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut 
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

//colours for messages
const COL_PRIMARY = '#00A8E8';
const COL_ERROR = 'red';

// log to see if file loaded right
console.log('%c fb_io.js', 'color: blue; background-color: white;');

// My Firebase project setup/config
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

// Initialize Firebase App
const FB_GAMEAPP = initializeApp(FB_GAMECONFIG);
// Get access to Realtime Database and Auth
const fb_gameDB = getDatabase(FB_GAMEAPP);
const auth = getAuth(FB_GAMEAPP);

// holds signed in user 
let currentUser = null;

// looks for changed on auth state 
onAuthStateChanged(auth, (user) => {
  currentUser = user;
  window.currentUser = user; 

  // Grab elements from the page to update UI
  const statusMessage = document.getElementById("statusMessage");
  const profilePicture = document.getElementById("profilePicture");
  const whackBtn = document.getElementById("whackBtn");
  const coinBtn = document.getElementById("coinBtn");

  if (user) {
    // someone just logged in
    console.log("User logged in:", user.uid);

    statusMessage.textContent = `Welcome back, ${user.displayName || "player"}!`;
    statusMessage.style.color = COL_PRIMARY;

    // show profile pic if they have one
    if (profilePicture) {
      profilePicture.src = user.photoURL || "";
      profilePicture.style.display = user.photoURL ? "block" : "none";
    }

    // enable game buttons once logged i
    if (whackBtn) whackBtn.disabled = false;
    if (coinBtn) coinBtn.disabled = false;

  } else {
    // no one has logged in
    console.log("User logged out");

    statusMessage.textContent = "You are not logged in.";
    statusMessage.style.color = COL_ERROR;

    if (profilePicture) {
      profilePicture.src = "";
      profilePicture.style.display = "none";
    }

    // disable game buttons until login
    if (whackBtn) whackBtn.disabled = true;
    if (coinBtn) coinBtn.disabled = true;
  }
});

// google authentication
async function fb_authenticate() {
  console.log('%c fb_authenticate(): ', `color: white; background-color: ${COL_PRIMARY};`);

  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' }); // always ask to choose account

  try {
    const result = await signInWithPopup(auth, provider);

    const statusMessage = document.getElementById("statusMessage");
    statusMessage.textContent = `You successfully logged in as ${result.user.displayName || "player"}!`;
    statusMessage.style.color = COL_PRIMARY;

    console.log("Authenticated user:", result.user.uid);
    return result.user;
  } catch (error) {
    const statusMessage = document.getElementById("statusMessage");
    statusMessage.textContent = "Login failed. Please try again.";
    statusMessage.style.color = COL_ERROR;

    console.error("Authentication failed:", error);
    throw error;
  }
}

// Logs the user out
async function fb_signout() {
  const AUTH = getAuth();

  try {
    await signOut(AUTH); 
    console.log("Logout success");
  } catch (error) {
    console.log("Logout error");
    console.error(error);
  }
}

// Saves the user’s name and age to fb
async function fb_write() {
  if (!currentUser) {
    console.error("User is not authenticated");
    return false;
  }

  const name = document.getElementById("name")?.value?.trim();    
  const age = parseInt(document.getElementById("age")?.value?.trim(), 10);

  if (!name) {
    console.error("Name is needed to play the game");
    return false;
  }

  if (isNaN(age) || age < 0 || age > 100) { //age cant be less than 0 or more than 100
    console.error("Invalid age value");
    return false;
  }

  // Replaces . with _ because fb doesn't like .
  const safeUid = currentUser.uid.replace(/\./g, '_');
  const userRef = ref(fb_gameDB, `Users/${safeUid}`);

  try {
    await set(userRef, {
      name: name,
      age: age,
      email: currentUser.email,
    });
    console.log("User profile has been updated");
    return true;
  } catch (error) {
    console.error("Profile update failed:", error);
    return false;
  }
}

//write just the score, after game ends
async function fb_writeScore(score) {
  if (!currentUser) {
    console.error("Cannot save score: No authenticated user");
    return false;
  }

  if (typeof score !== 'number' || score < 0) { //means score has to be 0 or more
    console.error("Invalid score value:", score); //error for negative score
    return false; 
  }

  const safeUid = currentUser.uid.replace(/\./g, '_'); // referenced in game projects already, prevents names with those charachters that in it
  const scoresRef = ref(fb_gameDB, `Scores/${safeUid}`); //saves scores in db under user id

  try {
    await set(scoresRef, { //write score and data to user score path
      name: document.getElementById("name")?.value?.trim() || "Anonymous",
      score: score, //score saving
    });
    console.log("Score saved successfully");
    return true;
  } catch (error) {
    console.error("Score save failed:", error);//returns the error if score can be found
    return false;
  }
}

// get top 10 scores from firebase
function fb_getLeaderboard(callback) {
  const scoresRef = ref(fb_gameDB, 'Scores');
  const leaderboardQuery = query(
    scoresRef,
    orderByChild('score'),  // sort by score
    limitToLast(10)         //limits only op 10
  );

  // Listen for updates in real time
  const unsubscribe = onValue(leaderboardQuery, (snapshot) => {
    const scores = [];
    snapshot.forEach((child) => {
      scores.push({ //pushes scores through to fb
        id: child.key, 
        ...child.val()
      });
    });

    // sorts all scores from low to high, 1-10
    callback(scores.sort((a, b) => b.score - a.score));
  });

  return unsubscribe; // used later to stop looking for updates
}


export {
  fb_authenticate,
  fb_write,
  fb_writeScore,
  fb_getLeaderboard,
  fb_signout
};
