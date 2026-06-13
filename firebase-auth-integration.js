/**
 * Firebase Authentication Integration
 * Handles user registration, login, logout, and session management
 */

import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged 
} from 'https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js';
import { 
    getFirestore, 
    collection, 
    doc, 
    setDoc, 
    getDoc, 
    updateDoc,
    serverTimestamp 
} from 'https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js';

let auth = null;
let db = null;
let app = null;

// ========== INITIALIZATION ==========

export async function initFirebaseAuth() {
    try {
        // Firebase app is expected to be initialized in the page (index.html)
        auth = getAuth();
        db = getFirestore();

        console.log('✓ Firebase Auth (client) initialized');

        // Listen for auth state changes
        onAuthStateChanged(auth, (user) => {
            if (user) {
                console.log('User logged in:', user.uid);
                loadUserProfile(user.uid);
            } else {
                console.log('No user logged in');
            }
        });

        return true;
    } catch (error) {
        console.error('Firebase Auth initialization failed:', error);
        return false;
    }
}

// ========== REGISTRATION ==========

/**
 * Register a new user with email and password
 * @param {string} email - User email
 * @param {string} password - User password (min 6 chars)
 * @param {string} username - Display name
 * @param {string} fullName - Full name (optional)
 * @param {string} mobile - Mobile number (optional)
 * @returns {Promise<Object>} User object with uid, email, username, fullName
 */
export async function registerUser(email, password, username, fullName = '', mobile = '') {
    try {
        // Validate inputs
        if (!email || !password || !username) {
            throw new Error('Email, password, and username are required');
        }

        if (password.length < 6) {
            throw new Error('Password must be at least 6 characters');
        }

        if (!email.includes('@')) {
            throw new Error('Invalid email address');
        }

        // Create user in Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        console.log('✓ User created in Firebase Auth:', user.uid);

        // Create user profile in Firestore with all details
        const userProfile = {
            uid: user.uid,
            email: email,
            username: username,
            fullName: fullName || username,
            mobile: mobile || '',
            avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            listings: [],
            bio: ''
        };

        console.log('Saving to Firestore:', userProfile);

        try {
            const userDocRef = doc(db, 'users', user.uid);
            await setDoc(userDocRef, userProfile);
            console.log('✓ User profile created in Firestore:', user.uid);
            console.log('  - Email:', email);
            console.log('  - Username:', username);
            console.log('  - Full Name:', fullName);
            console.log('  - Mobile:', mobile);
        } catch (firestoreErr) {
            console.error('❌ Firestore save FAILED:', firestoreErr);
            console.error('Error code:', firestoreErr.code);
            console.error('Error message:', firestoreErr.message);
            throw new Error(`Firestore error: ${firestoreErr.message}`);
        }

        // Store in localStorage
        localStorage.setItem('currentUser', JSON.stringify({
            uid: user.uid,
            email: email,
            username: username,
            fullName: fullName || username,
            mobile: mobile || '',
            avatarUrl: userProfile.avatarUrl
        }));

        return {
            uid: user.uid,
            email: email,
            username: username,
            fullName: fullName || username,
            mobile: mobile || '',
            avatarUrl: userProfile.avatarUrl
        };

    } catch (error) {
        console.error('Registration error:', error);

        // Provide user-friendly error messages
        if (error.code === 'auth/email-already-in-use') {
            throw new Error('Email is already registered');
        }
        if (error.code === 'auth/weak-password') {
            throw new Error('Password is too weak');
        }
        if (error.code === 'auth/invalid-email') {
            throw new Error('Invalid email address');
        }

        throw error;
    }
}

// ========== LOGIN ==========

/**
 * Login user with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} User object with uid, email, username
 */
export async function loginUser(email, password) {
    try {
        if (!email || !password) {
            throw new Error('Email and password are required');
        }
        
        // Sign in with Firebase Auth
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        console.log('✓ User logged in:', user.uid);
        
        // Fetch user profile from Firestore
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);
        
        if (userDocSnap.exists()) {
            const userProfile = userDocSnap.data();
            
            // Store in localStorage
            localStorage.setItem('currentUser', JSON.stringify({
                uid: user.uid,
                email: userProfile.email || email,
                username: userProfile.username || email.split('@')[0],
                bio: userProfile.bio || '',
                avatarUrl: userProfile.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`
            }));
            
            return {
                uid: user.uid,
                email: userProfile.email || email,
                username: userProfile.username || email.split('@')[0],
                bio: userProfile.bio || '',
                avatarUrl: userProfile.avatarUrl
            };
        }
        
        // Fallback if profile doesn't exist
        const fallbackProfile = {
            uid: user.uid,
            email: email,
            username: email.split('@')[0],
            bio: '',
            avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`
        };
        
        localStorage.setItem('currentUser', JSON.stringify(fallbackProfile));
        return fallbackProfile;
        
    } catch (error) {
        console.error('Login error:', error);
        
        // Provide user-friendly error messages
        if (error.code === 'auth/user-not-found') {
            throw new Error('Email not found. Please register first.');
        }
        if (error.code === 'auth/wrong-password') {
            throw new Error('Incorrect password');
        }
        if (error.code === 'auth/invalid-email') {
            throw new Error('Invalid email address');
        }
        if (error.code === 'auth/user-disabled') {
            throw new Error('This account has been disabled');
        }
        
        throw error;
    }
}

// ========== LOGOUT ==========

/**
 * Logout current user
 * @returns {Promise<void>}
 */
export async function logoutUser() {
    try {
        await signOut(auth);
        localStorage.removeItem('currentUser');
        console.log('✓ User logged out');
    } catch (error) {
        console.error('Logout error:', error);
        throw error;
    }
}

// ========== GET CURRENT USER ==========

/**
 * Get current logged-in user
 * @returns {Object|null} User object or null if not logged in
 */
export function getCurrentUser() {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
}

/**
 * Listen for auth state changes (returns unsubscribe function)
 * @param {Function} callback - Callback when auth state changes
 * @returns {Function} Unsubscribe function
 */
export function onUserAuthStateChanged(callback) {
    return onAuthStateChanged(auth, callback);
}

// ========== LOAD USER PROFILE ==========

/**
 * Load user profile from Firestore
 * @param {string} uid - User ID
 * @returns {Promise<Object>} User profile
 */
export async function loadUserProfile(uid) {
    try {
        const userDocRef = doc(db, 'users', uid);
        const userDocSnap = await getDoc(userDocRef);
        
        if (userDocSnap.exists()) {
            return userDocSnap.data();
        }
        return null;
    } catch (error) {
        console.error('Error loading user profile:', error);
        return null;
    }
}

// ========== UPDATE USER PROFILE ==========

/**
 * Update user profile
 * @param {string} uid - User ID
 * @param {Object} updates - Fields to update (username, bio, avatarUrl, etc.)
 * @returns {Promise<void>}
 */
export async function updateUserProfile(uid, updates) {
    try {
        const userDocRef = doc(db, 'users', uid);
        
        const updateData = {
            ...updates,
            updatedAt: serverTimestamp()
        };
        
        await updateDoc(userDocRef, updateData);
        
        // Update localStorage if it's current user
        const currentUser = getCurrentUser();
        if (currentUser && currentUser.uid === uid) {
            const updated = { ...currentUser, ...updates };
            localStorage.setItem('currentUser', JSON.stringify(updated));
        }
        
        console.log('✓ User profile updated');
        
    } catch (error) {
        console.error('Error updating user profile:', error);
        throw error;
    }
}

// ========== AUTH UI SETUP ==========

/**
 * Setup authentication UI listeners
 * Call this after DOM loads
 */
export function setupAuthUI() {
    // Handle Register Form
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegisterSubmit);
    }
    
    // Handle Login Form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLoginSubmit);
    }
    
    // Handle Logout Button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogoutClick);
    }
    
    // Update UI based on auth state
    updateAuthUI();
}

/**
 * Handle register form submission
 */
async function handleRegisterSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const email = form.querySelector('input[name="email"]').value;
    const password = form.querySelector('input[name="password"]').value;
    const confirmPassword = form.querySelector('input[name="confirmPassword"]')?.value;
    const username = form.querySelector('input[name="username"]')?.value;
    
    // Validate passwords match
    if (confirmPassword && password !== confirmPassword) {
        alert('Passwords do not match');
        return;
    }
    
    try {
        const btn = form.querySelector('button[type="submit"]');
        const originalText = btn.textContent;
        btn.textContent = 'Registering...';
        btn.disabled = true;
        
        const user = await registerUser(email, password, username);
        alert(`Welcome, ${user.username}! Account created successfully.`);
        
        // Reset form
        form.reset();
        
        // Redirect to dashboard
        if (typeof switchSection === 'function') {
            switchSection('dashboard');
        }
        
        btn.textContent = originalText;
        btn.disabled = false;
        
    } catch (error) {
        alert('Registration failed: ' + error.message);
    }
}

/**
 * Handle login form submission
 */
async function handleLoginSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const email = form.querySelector('input[name="email"]').value;
    const password = form.querySelector('input[name="password"]').value;
    
    try {
        const btn = form.querySelector('button[type="submit"]');
        const originalText = btn.textContent;
        btn.textContent = 'Logging in...';
        btn.disabled = true;
        
        const user = await loginUser(email, password);
        alert(`Welcome back, ${user.username}!`);
        
        // Reset form
        form.reset();
        
        // Redirect to dashboard
        if (typeof switchSection === 'function') {
            switchSection('dashboard');
        }
        
        // Update UI
        updateAuthUI();
        
        btn.textContent = originalText;
        btn.disabled = false;
        
    } catch (error) {
        alert('Login failed: ' + error.message);
    }
}

/**
 * Handle logout button click
 */
async function handleLogoutClick(e) {
    e.preventDefault();
    
    if (confirm('Are you sure you want to logout?')) {
        try {
            await logoutUser();
            alert('Logged out successfully');
            
            // Redirect to home
            window.location.href = 'index.html';
        } catch (error) {
            alert('Logout failed: ' + error.message);
        }
    }
}

/**
 * Update UI based on auth state
 */
function updateAuthUI() {
    const user = getCurrentUser();
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const userMenuBtn = document.getElementById('userMenuBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    
    if (user) {
        // User is logged in
        if (loginBtn) loginBtn.classList.add('hidden');
        if (registerBtn) registerBtn.classList.add('hidden');
        if (userMenuBtn) userMenuBtn.classList.remove('hidden');
        
        // Update user menu with current user name
        const userNameSpan = userMenuBtn?.querySelector('.username');
        if (userNameSpan) {
            userNameSpan.textContent = user.username;
        }
    } else {
        // User is logged out
        if (loginBtn) loginBtn.classList.remove('hidden');
        if (registerBtn) registerBtn.classList.remove('hidden');
        if (userMenuBtn) userMenuBtn.classList.add('hidden');
    }
}

// All functions are already exported above with 'export' keyword
