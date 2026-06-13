/**
 * Firebase UI Handler
 * Manages all UI interactions for Firebase operations
 */

// Import the functions you need from the SDKs you need
// import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = window.TALENTTRADE_FIREBASE_CONFIG || {
  apiKey: 'REPLACE_WITH_YOUR_API_KEY',
  authDomain: 'REPLACE_WITH_YOUR_AUTH_DOMAIN',
  projectId: 'REPLACE_WITH_YOUR_PROJECT_ID',
  storageBucket: 'REPLACE_WITH_YOUR_STORAGE_BUCKET',
  messagingSenderId: 'REPLACE_WITH_YOUR_MESSAGING_SENDER_ID',
  appId: 'REPLACE_WITH_YOUR_APP_ID',
  measurementId: 'REPLACE_WITH_YOUR_MEASUREMENT_ID'
};

// Initialize Firebase
if (typeof firebase !== 'undefined') {
  firebase.initializeApp(firebaseConfig);
  if (typeof firebase.analytics === 'function') {
    firebase.analytics();
  }
} else {
  console.warn('Firebase SDK not loaded before firebase-ui.js');
}

const auth = window.firebase?.auth();
const firestore = window.firebase?.firestore();

// Tab switching
document.querySelectorAll('.tab-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
        const tabName = btn.dataset.tab;
        document.querySelectorAll('.tab-content').forEach((tab) => {
            tab.classList.remove('active');
        });
        document.getElementById(tabName).classList.add('active');

        document.querySelectorAll('.tab-btn').forEach((b) => {
            b.classList.remove('active');
        });
        btn.classList.add('active');
    });
});

// Status box helper
function updateStatus(elementId, message, isError = false) {
    const statusBox = document.getElementById(elementId);
    statusBox.textContent = message;
    statusBox.className = `status-box ${isError ? 'error' : 'success'}`;
}

// ==================== AUTHENTICATION ====================

async function handleSignUp() {
    const email = document.getElementById('authEmail').value;
    const password = document.getElementById('authPassword').value;

    if (!email || !password) {
        updateStatus('authStatus', 'Please fill in all fields', true);
        return;
    }

    try {
        const result = await auth.createUserWithEmailAndPassword(email, password);
        updateStatus('authStatus', `✓ Signed up successfully! UID: ${result.user.uid}`);
        document.getElementById('authEmail').value = '';
        document.getElementById('authPassword').value = '';
    } catch (error) {
        updateStatus('authStatus', `Sign up failed: ${error.message}`, true);
    }
}

async function handleLogin() {
    const email = document.getElementById('authEmail').value;
    const password = document.getElementById('authPassword').value;

    if (!email || !password) {
        updateStatus('authStatus', 'Please fill in all fields', true);
        return;
    }

    try {
        const result = await auth.signInWithEmailAndPassword(email, password);
        updateStatus('authStatus', `✓ Logged in successfully! UID: ${result.user.uid}`);
        document.getElementById('authEmail').value = '';
        document.getElementById('authPassword').value = '';
    } catch (error) {
        updateStatus('authStatus', `Login failed: ${error.message}`, true);
    }
}

async function handleLogout() {
    try {
        await auth.signOut();
        updateStatus('authStatus', '✓ Logged out successfully!');
    } catch (error) {
        updateStatus('authStatus', `Logout failed: ${error.message}`, true);
    }
}

// ==================== PROFILES ====================

async function handleSaveProfile() {
    const role = document.getElementById('profileRole').value;
    const name = document.getElementById('profileName').value;
    const specialization = document.getElementById('profileSpec').value;
    const bio = document.getElementById('profileBio').value;

    if (!name) {
        updateStatus('profileStatus', 'Please enter your name', true);
        return;
    }

    try {
        const profileData = {
            name,
            specialization,
            bio,
        };
        await FirebaseService.saveProfessionalProfile(role, profileData);
        updateStatus('profileStatus', '✓ Profile saved successfully!');
        document.getElementById('profileName').value = '';
        document.getElementById('profileSpec').value = '';
        document.getElementById('profileBio').value = '';
    } catch (error) {
        updateStatus('profileStatus', `Error: ${error.message}`, true);
    }
}

async function handleFetchAllProfessionals() {
    try {
        updateStatus('profileStatus', 'Loading professionals...');
        const professionals = await FirebaseService.fetchAllProfessionals();

        const container = document.getElementById('professionalsList');
        if (professionals.length === 0) {
            container.innerHTML = '<p>No professionals found.</p>';
            return;
        }

        container.innerHTML = professionals
            .map(
                (prof) => `
            <div class="list-item">
                <h4>${prof.name} (${prof.role})</h4>
                <p><strong>Specialization:</strong> ${prof.specialization || 'N/A'}</p>
                <p><strong>Bio:</strong> ${prof.bio || 'N/A'}</p>
                <p><strong>Likes:</strong> ${prof.likes || 0}</p>
                <p class="meta-note">ID: ${prof.id}</p>
            </div>
        `
            )
            .join('');

        updateStatus('profileStatus', `✓ Loaded ${professionals.length} professionals`);
    } catch (error) {
        updateStatus('profileStatus', `Error: ${error.message}`, true);
    }
}

// ==================== AUDITIONS ====================

async function handleCreateAudition() {
    const title = document.getElementById('auditionTitle').value;
    const description = document.getElementById('auditionDescription').value;
    const deadline = document.getElementById('auditionDeadline').value;

    if (!title || !description) {
        updateStatus('auditionStatus', 'Please fill in all fields', true);
        return;
    }

    try {
        const auditionData = {
            title,
            description,
            deadline: deadline || null,
            eventType: 'Live Session', // or other type as needed
        };
        const auditionId = await FirebaseService.saveAudition(auditionData);
        updateStatus('auditionStatus', `✓ Audition created! ID: ${auditionId}`);
        document.getElementById('auditionTitle').value = '';
        document.getElementById('auditionDescription').value = '';
        document.getElementById('auditionDeadline').value = '';
    } catch (error) {
        updateStatus('auditionStatus', `Error: ${error.message}`, true);
    }
}

async function handleFetchAllAuditions() {
    try {
        updateStatus('auditionStatus', 'Loading auditions...');
        const auditions = await FirebaseService.fetchAllAuditions();

        const container = document.getElementById('auditionsList');
        if (auditions.length === 0) {
            container.innerHTML = '<p>No auditions found.</p>';
            return;
        }

        container.innerHTML = auditions
            .map(
                (aud) => `
            <div class="list-item">
                <h4>${aud.title}</h4>
                <p>${aud.description}</p>
                <p><strong>Deadline:</strong> ${aud.deadline || 'N/A'}</p>
                <p class="meta-note">Producer: ${aud.producerId}</p>
            </div>
        `
            )
            .join('');

        updateStatus('auditionStatus', `✓ Loaded ${auditions.length} auditions`);
    } catch (error) {
        updateStatus('auditionStatus', `Error: ${error.message}`, true);
    }
}

// ==================== MESSAGES ====================

async function handleStartChat() {
    const userId = document.getElementById('chatUserId').value;

    if (!userId) {
        updateStatus('chatStatus', 'Please enter a user ID', true);
        return;
    }

    try {
        updateStatus('chatStatus', 'Starting chat...');
        const chatId = await FirebaseService.createOrGetChat(userId);
        updateStatus('chatStatus', `✓ Chat created/retrieved! ID: ${chatId}`);
        document.getElementById('messageChatId').value = chatId;
        document.getElementById('viewChatId').value = chatId;
    } catch (error) {
        updateStatus('chatStatus', `Error: ${error.message}`, true);
    }
}

async function handleSendMessage() {
    const chatId = document.getElementById('messageChatId').value;
    const message = document.getElementById('messageText').value;

    if (!chatId || !message) {
        updateStatus('messageStatus', 'Please enter chat ID and message', true);
        return;
    }

    try {
        updateStatus('messageStatus', 'Sending...');
        await FirebaseService.sendMessage(chatId, message);
        updateStatus('messageStatus', '✓ Message sent successfully!');
        document.getElementById('messageText').value = '';
    } catch (error) {
        updateStatus('messageStatus', `Error: ${error.message}`, true);
    }
}

async function handleViewMessages() {
    const chatId = document.getElementById('viewChatId').value;

    if (!chatId) {
        updateStatus('messageStatus', 'Please enter a chat ID', true);
        return;
    }

    try {
        updateStatus('messageStatus', 'Loading messages...');
        const unsubscribe = FirebaseService.getMessagesStream(chatId, (messages) => {
            const container = document.getElementById('messagesList');
            if (messages.length === 0) {
                container.innerHTML = '<p>No messages yet.</p>';
                return;
            }

            container.innerHTML = messages
                .map(
                    (msg) => `
                <div class="message-item ${msg.senderId === auth.currentUser?.uid ? 'sent' : 'received'}">
                    <p><strong>${msg.senderId.substring(0, 8)}...</strong></p>
                    <p>${msg.message}</p>
                    <small>${msg.timestamp?.toDate?.().toLocaleString() || 'N/A'}</small>
                </div>
            `
                )
                .join('');

            updateStatus('messageStatus', `✓ Loaded ${messages.length} messages`);
        });
    } catch (error) {
        updateStatus('messageStatus', `Error: ${error.message}`, true);
    }
}

// ==================== REPORTS ====================

async function handleSubmitReport() {
    const reportType = document.getElementById('reportType').value;
    const reportedUserId = document.getElementById('reportedUserId').value;
    const message = document.getElementById('reportMessage').value;

    if (!message) {
        updateStatus('reportStatus', 'Please enter a message', true);
        return;
    }

    try {
        updateStatus('reportStatus', 'Submitting...');
        await FirebaseService.submitReport(
            message,
            reportedUserId || null,
            reportType
        );
        updateStatus('reportStatus', '✓ Report submitted successfully!');
        document.getElementById('reportMessage').value = '';
        document.getElementById('reportedUserId').value = '';
    } catch (error) {
        updateStatus('reportStatus', `Error: ${error.message}`, true);
    }
}
