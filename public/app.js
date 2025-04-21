
const firebaseConfig = {
  apiKey: "AIzaSyCXaMkMgjwx7L_2dlsdMTW__LGOxQB9H24",
  authDomain: "discord-7a126.firebaseapp.com",
  projectId: "discord-7a126",
  storageBucket: "discord-7a126.firebasestorage.app",
  messagingSenderId: "782453518599",
  appId: "1:782453518599:web:a86ce71043bbea2ef715a2",
  measurementId: "G-8JBGF4MMQD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const database = firebase.database();

// DOM Elements
const authContainer = document.getElementById('auth-container');
const chatContainer = document.getElementById('chat-container');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const loginBtn = document.getElementById('login-btn');
const signupBtn = document.getElementById('signup-btn');
const logoutBtn = document.getElementById('logout-btn');
const userEmailSpan = document.getElementById('user-email');
const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');
const messagesDiv = document.getElementById('messages');
const authErrorP = document.getElementById('auth-error');

// --- Authentication ---

// Sign up
signupBtn.addEventListener('click', async () => {
    const email = emailInput.value;
    const password = passwordInput.value;
    authErrorP.textContent = ''; // Clear previous errors
    try {
        await auth.createUserWithEmailAndPassword(email, password);
        console.log('Signed up successfully!');
        // Auth state change will handle UI update
    } catch (error) {
        console.error("Signup Error:", error);
        authErrorP.textContent = error.message;
    }
});

// Login
loginBtn.addEventListener('click', async () => {
    const email = emailInput.value;
    const password = passwordInput.value;
    authErrorP.textContent = ''; // Clear previous errors
    try {
        await auth.signInWithEmailAndPassword(email, password);
        console.log('Logged in successfully!');
         // Auth state change will handle UI update
    } catch (error) {
        console.error("Login Error:", error);
        authErrorP.textContent = error.message;
    }
});

// Logout
logoutBtn.addEventListener('click', async () => {
    try {
        await auth.signOut();
        console.log('Logged out successfully!');
        // Auth state change will handle UI update
    } catch (error) {
        console.error("Logout Error:", error);
    }
});

// Auth State Listener
auth.onAuthStateChanged(user => {
    if (user) {
        // User is signed in
        console.log("User logged in:", user.email);
        authContainer.style.display = 'none';
        chatContainer.style.display = 'block';
        userEmailSpan.textContent = user.email;
        authErrorP.textContent = ''; // Clear any lingering errors
        loadMessages(); // Load messages when user logs in
    } else {
        // User is signed out
        console.log("User logged out");
        authContainer.style.display = 'block';
        chatContainer.style.display = 'none';
        userEmailSpan.textContent = '';
        messagesDiv.innerHTML = ''; // Clear messages on logout
    }
});

// --- Realtime Database (Chat) ---

const messagesRef = database.ref('messages');

// Send Message
sendBtn.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

function sendMessage() {
    const messageText = messageInput.value.trim();
    const user = auth.currentUser;

    if (messageText && user) {
        messagesRef.push({ // Use push to generate unique key
            email: user.email,
            text: messageText,
            timestamp: firebase.database.ServerValue.TIMESTAMP // Use server timestamp
        })
        .then(() => {
            messageInput.value = ''; // Clear input field
            console.log("Message sent!");
        })
        .catch(error => {
            console.error("Error sending message:", error);
        });
    } else if (!user) {
       console.error("Cannot send message: User not logged in.");
    }
}

// Load Messages & Listen for New Ones
function loadMessages() {
    messagesDiv.innerHTML = ''; // Clear existing messages before loading/listening

    // Listen for new messages being added
    messagesRef.orderByChild('timestamp').limitToLast(50).on('child_added', (snapshot) => {
        const message = snapshot.val();
        displayMessage(message.email, message.text);
    });
}

// Display a single message
function displayMessage(email, text) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');

    // Basic security: prevent HTML injection by setting textContent
    const strong = document.createElement('strong');
    strong.textContent = `${email}: `;
    messageElement.appendChild(strong);

    const textNode = document.createTextNode(text);
    messageElement.appendChild(textNode);

    messagesDiv.appendChild(messageElement);

    // Scroll to the bottom
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// Initial check (optional, can rely purely on listener)
// if (auth.currentUser) {
//    loadMessages();
// }
