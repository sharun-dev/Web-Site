/**
 * FIREBASE INTEGRATION SETUP GUIDE
 * TalentTrade Marketplace - Complete User Account & Item Management
 * 
 * This guide shows how to connect your marketplace to Firebase with:
 * - User Authentication & Accounts
 * - Item Upload & Storage
 * - User Dashboard
 * - Delete/Edit Items
 * - Chat & Messages
 */

// ========== STEP 1: UPDATE firebase-config.js ==========
// Replace YOUR_* placeholders with actual Firebase credentials from Firebase Console

export const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "website-d45d9.firebaseapp.com",
    projectId: "website-d45d9",
    storageBucket: "website-d45d9.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID",
    measurementId: "YOUR_MEASUREMENT_ID"
};

// ========== STEP 2: UPDATE index.html (Add to <head>) ==========
// Add these script tags before closing </head>

/*
<script type="module">
    // Initialize authentication check on page load
    import { initFirebaseAuth, getCurrentUser } from './firebase-auth-integration.js';
    
    document.addEventListener('DOMContentLoaded', async () => {
        await initFirebaseAuth();
        const user = await getCurrentUser();
        if (user) {
            updateUIForLoggedInUser(user);
        } else {
            updateUIForLoggedOutUser();
        }
    });
</script>
*/

// ========== STEP 3: Update Register/Login Flows in script.js ==========

/*
REGISTRATION FLOW:

// Listen for register form submission (in script.js)
const registerForm = document.getElementById('registerForm');
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.querySelector('input[name="email"]').value;
        const password = document.querySelector('input[name="password"]').value;
        const username = document.querySelector('input[name="username"]').value;
        
        try {
            const user = await registerUser(email, password, username);
            console.log('User registered:', user);
            
            // Store user in localStorage for session
            localStorage.setItem('currentUser', JSON.stringify(user));
            
            // Redirect to dashboard or home
            window.location.href = 'index.html#dashboard';
        } catch (error) {
            alert('Registration failed: ' + error.message);
        }
    });
}

LOGIN FLOW:

// Listen for login form submission
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.querySelector('input[name="email"]').value;
        const password = document.querySelector('input[name="password"]').value;
        
        try {
            const user = await loginUser(email, password);
            console.log('User logged in:', user);
            
            // Store user in localStorage
            localStorage.setItem('currentUser', JSON.stringify(user));
            
            // Show dashboard
            switchSection('dashboard');
        } catch (error) {
            alert('Login failed: ' + error.message);
        }
    });
}

LOGOUT FLOW:

// Listen for logout button
const logoutBtn = document.getElementById('logoutNavBtn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
        try {
            await logoutUser();
            localStorage.removeItem('currentUser');
            window.location.reload();
        } catch (error) {
            console.error('Logout error:', error);
        }
    });
}
*/

// ========== STEP 4: UPLOAD ITEM FLOW ==========

/*
UPDATE UPLOAD FORM HANDLING:

const uploadForm = document.getElementById('uploadForm');
if (uploadForm) {
    uploadForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser) {
            alert('Please log in to upload items');
            return;
        }
        
        const itemData = {
            title: document.querySelector('input[name="title"]').value,
            description: document.querySelector('textarea[name="description"]').value,
            price: parseFloat(document.querySelector('input[name="price"]').value),
            type: document.querySelector('input[name="type"]:checked').value,
            categoryId: document.querySelector('select[name="category"]').value,
            imageUrl: document.querySelector('input[name="imageUrl"]').value || '',
            creatorId: currentUser.uid,
            creatorName: currentUser.username
        };
        
        try {
            // Save to Firestore
            const itemId = await saveCreatedItemToFirestore(itemData);
            console.log('Item saved:', itemId);
            
            // Add to local storage for persistence
            const items = JSON.parse(localStorage.getItem('userItems') || '[]');
            items.push({ id: itemId, ...itemData });
            localStorage.setItem('userItems', JSON.stringify(items));
            
            alert('Item uploaded successfully!');
            uploadForm.reset();
            
            // Refresh dashboard
            loadUserDashboard();
        } catch (error) {
            alert('Upload failed: ' + error.message);
        }
    });
}
*/

// ========== STEP 5: DASHBOARD DISPLAY & MANAGEMENT ==========

/*
LOAD USER DASHBOARD:

async function loadUserDashboard() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        alert('Please log in');
        return;
    }
    
    try {
        // Fetch user's items from Firestore
        const userItems = await loadCreatedItemsFromFirestore();
        
        const dashboardGrid = document.getElementById('userItemsGrid');
        dashboardGrid.innerHTML = '';
        
        userItems.forEach(item => {
            const itemCard = createDashboardItemCard(item);
            dashboardGrid.appendChild(itemCard);
        });
    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}

// CREATE DASHBOARD ITEM CARD WITH DELETE/EDIT:

function createDashboardItemCard(item) {
    const card = document.createElement('div');
    card.className = 'glass-card p-4 rounded-lg flex flex-col gap-4';
    
    card.innerHTML = `
        <img src="${item.imageUrl}" alt="${item.title}" class="w-full h-48 object-cover rounded-lg"/>
        <div>
            <h3 class="font-bold text-lg">${item.title}</h3>
            <p class="text-sm text-gray-400">${item.category}</p>
            <p class="text-lg text-primary font-bold mt-2">$${item.price}</p>
            <span class="text-xs bg-primary/20 px-2 py-1 rounded-full">${item.type}</span>
        </div>
        <div class="flex gap-2">
            <button class="flex-1 bg-secondary-container px-4 py-2 rounded-lg edit-btn" data-item-id="${item.id}">
                ✏️ Edit
            </button>
            <button class="flex-1 bg-error/20 text-error px-4 py-2 rounded-lg delete-btn" data-item-id="${item.id}">
                🗑️ Delete
            </button>
        </div>
    `;
    
    // Edit button listener
    card.querySelector('.edit-btn').addEventListener('click', () => {
        editItem(item.id, item);
    });
    
    // Delete button listener
    card.querySelector('.delete-btn').addEventListener('click', async () => {
        if (confirm('Are you sure you want to delete this item?')) {
            try {
                await deleteItem(item.id);
                card.remove();
                alert('Item deleted successfully');
            } catch (error) {
                alert('Delete failed: ' + error.message);
            }
        }
    });
    
    return card;
}

// EDIT ITEM:

async function editItem(itemId, currentData) {
    // Show edit form pre-filled with current data
    const formInputs = {
        title: document.querySelector('input[name="title"]'),
        description: document.querySelector('textarea[name="description"]'),
        price: document.querySelector('input[name="price"]'),
        type: document.querySelector('input[name="type"]'),
        imageUrl: document.querySelector('input[name="imageUrl"]')
    };
    
    // Fill form with current data
    Object.keys(formInputs).forEach(key => {
        if (formInputs[key]) {
            formInputs[key].value = currentData[key] || '';
        }
    });
    
    // Change submit button to "Update"
    const submitBtn = document.querySelector('#uploadForm button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Update Item';
    
    // Handle update submission
    const uploadForm = document.getElementById('uploadForm');
    uploadForm.onsubmit = async (e) => {
        e.preventDefault();
        
        const updates = {
            title: formInputs.title?.value,
            description: formInputs.description?.value,
            price: parseFloat(formInputs.price?.value),
            type: formInputs.type?.value,
            imageUrl: formInputs.imageUrl?.value
        };
        
        try {
            // Update in Firestore
            const itemsRef = collection(db, 'created_items');
            const itemDoc = doc(itemsRef, itemId);
            await updateDoc(itemDoc, updates);
            
            alert('Item updated successfully!');
            submitBtn.textContent = originalText;
            uploadForm.reset();
            loadUserDashboard();
        } catch (error) {
            alert('Update failed: ' + error.message);
        }
    };
}

// DELETE ITEM:

async function deleteItem(itemId) {
    try {
        const itemsRef = collection(db, 'created_items');
        const itemDoc = doc(itemsRef, itemId);
        await deleteDoc(itemDoc);
        
        // Remove from localStorage
        const items = JSON.parse(localStorage.getItem('userItems') || '[]');
        const filtered = items.filter(item => item.id !== itemId);
        localStorage.setItem('userItems', JSON.stringify(filtered));
        
        console.log('Item deleted:', itemId);
    } catch (error) {
        console.error('Error deleting item:', error);
        throw error;
    }
}
*/

// ========== STEP 6: CHAT FUNCTIONALITY ==========

/*
SAVE CHAT MESSAGE ABOUT CREATED ITEM:

async function saveChatMessage(itemId, senderName, messageText) {
    try {
        const chatRoomId = `item-${itemId}`;
        const chatsRef = collection(db, 'chats');
        const chatRoomRef = doc(chatsRef, chatRoomId);
        const messagesRef = collection(chatRoomRef, 'messages');
        
        const docRef = await addDoc(messagesRef, {
            sender: senderName,
            text: messageText,
            timestamp: serverTimestamp(),
            itemId: itemId
        });
        
        console.log('Chat message saved:', docRef.id);
        return docRef.id;
    } catch (error) {
        console.error('Error saving chat:', error);
        throw error;
    }
}

LOAD CHAT MESSAGES FOR ITEM:

function listenForChatMessages(itemId, callback) {
    const chatRoomId = `item-${itemId}`;
    const chatsRef = collection(db, 'chats');
    const chatRoomRef = doc(chatsRef, chatRoomId);
    const messagesRef = collection(chatRoomRef, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));
    
    return onSnapshot(q, (snapshot) => {
        const messages = [];
        snapshot.forEach((doc) => {
            messages.push({ id: doc.id, ...doc.data() });
        });
        callback(messages);
    });
}

DISPLAY CHAT MESSAGES:

function renderChatMessages(messages, itemId) {
    const chatContainer = document.getElementById(`chat-${itemId}`);
    if (!chatContainer) return;
    
    chatContainer.innerHTML = messages.map(msg => `
        <div class="p-3 bg-surface-container rounded-lg mb-2">
            <p class="font-bold text-sm">${msg.sender}</p>
            <p class="text-sm text-on-surface-variant">${msg.text}</p>
            <span class="text-xs text-on-surface-variant/50">
                ${new Date(msg.timestamp?.toDate()).toLocaleString()}
            </span>
        </div>
    `).join('');
}
*/

// ========== FIRESTORE COLLECTIONS STRUCTURE ==========

/*
Create these collections in Firebase Console > Firestore Database:

1. users (auto-created via Firebase Auth)
   ├─ uid (document ID)
   ├─ email: string
   ├─ username: string
   ├─ bio: string
   └─ avatarUrl: string

2. created_items
   ├─ id (auto-generated)
   ├─ title: string
   ├─ description: string
   ├─ price: number
   ├─ type: string ('sell' or 'rent')
   ├─ categoryId: string
   ├─ imageUrl: string
   ├─ creatorId: string (user uid)
   ├─ creatorName: string
   ├─ createdAt: timestamp
   └─ updatedAt: timestamp

3. chats
   ├─ item-{itemId} (document ID for each item's chat room)
   │  └─ messages (subcollection)
   │     ├─ id (auto-generated)
   │     ├─ sender: string
   │     ├─ text: string
   │     ├─ timestamp: timestamp
   │     └─ itemId: string

4. reviews
   ├─ id (auto-generated)
   ├─ itemId: string
   ├─ userId: string
   ├─ rating: number
   ├─ comment: string
   └─ createdAt: timestamp
*/

// ========== SECURITY RULES FOR FIRESTORE ==========

/*
Add these rules in Firebase Console > Firestore Database > Rules:

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users - only read own profile, create own on signup
    match /users/{userId} {
      allow read: if request.auth.uid == userId;
      allow create: if request.auth.uid == request.resource.data.uid;
      allow update: if request.auth.uid == userId;
    }
    
    // Created Items - anyone read, creator write
    match /created_items/{document=**} {
      allow read: if true;
      allow create: if request.auth != null && request.resource.data.creatorId == request.auth.uid;
      allow update, delete: if request.auth.uid == resource.data.creatorId;
    }
    
    // Chats - anyone can read, authenticated users write
    match /chats/{chatId}/messages/{message} {
      allow read: if true;
      allow create: if request.auth != null;
    }
    
    // Reviews - anyone read, authenticated users write
    match /reviews/{document=**} {
      allow read: if true;
      allow create: if request.auth != null;
    }
  }
}
*/

export default {
    firebaseConfig,
    instructions: 'See comments above for complete integration steps'
};
