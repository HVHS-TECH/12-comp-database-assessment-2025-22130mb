import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { 
  getDatabase, 
  ref, 
  set, 
  query, 
  orderByChild, 
  limitToLast, 
  onValue,
  serverTimestamp 
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

const COL_C = 'white';
const COL_B = '#CD7F32';

console.log('%c fb_io.js', 'color: blue; background-color: white;');

// Firebase Configuration
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
const auth = getAuth(FB_GAMEAPP);


let currentUser = null;
onAuthStateChanged(auth, (user) => {
  currentUser = user;
  console.log(user ? "User logged in:" : "User logged out", user?.uid);
});


async function fb_authenticate() {
  console.log('%c fb_authenticate(): ', `color: ${COL_C}; background-color: ${COL_B};`);
  
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });

  try {
    const result = await signInWithPopup(auth, provider);
    console.log("Authenticated user:", result.user.uid);
    return result.user;
  } catch (error) {
    console.error("Authentication failed:", error);
    throw error;
  }
}


async function fb_write() {
  if (!currentUser) {
    console.error("User is nt authenticated");
    return false;
  }

  const name = document.getElementById("name")?.value?.trim();
  if (!name) {
    console.error("Name is needed to plau game");
    return false;
  }

  const safeUid = currentUser.uid.replace(/\./g, '_');
  const userRef = ref(fb_gameDB, `Users/${safeUid}`);

  try {
    await set(userRef, {
      name: name,
      Age: Age,
      email: currentUser.email,
      lastUpdated: serverTimestamp()
    });
    console.log("User profile has been updated");
    return true;
  } catch (error) {
    console.error("Profile update failed:", error);
    return false;
  }
}


async function fb_writeScore(score) {
  if (!currentUser) {
    console.error("Cannot save score: No authenticated user");
    return false;
  }

  if (typeof score !== 'number' || score < 0) {
    console.error("Invalid score value:", score);
    return false;
  }

  const safeUid = currentUser.uid.replace(/\./g, '_');
  const scoresRef = ref(fb_gameDB, `Scores/${safeUid}`);

  try {
    await set(scoresRef, {
      name: document.getElementById("name")?.value?.trim() || "Anonymous",
      score: score,
      timestamp: serverTimestamp()
    });
    console.log("Score saved successfully");
    return true;
  } catch (error) {
    console.error("Score save failed:", error);
    return false;
  }
}


function fb_getLeaderboard(callback) {
  const scoresRef = ref(fb_gameDB, 'Scores');
  const leaderboardQuery = query(
    scoresRef,
    orderByChild('score'),
    limitToLast(10)
  );

  const unsubscribe = onValue(leaderboardQuery, (snapshot) => {
    const scores = [];
    snapshot.forEach((child) => {
      scores.push({
        id: child.key,
        ...child.val()
      });
    });
    callback(scores.sort((a, b) => b.score - a.score));
  });

  return unsubscribe;
}

export {
  fb_authenticate,
  fb_write,
  fb_writeScore,
  fb_getLeaderboard
};