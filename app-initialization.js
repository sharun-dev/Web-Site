/**
 * app-initialization.js
 * Initialize Firebase Auth, Dashboard, and Item Management
 * 
 * Add this as a module script in index.html before closing </head>:
 * <script type="module" src="app-initialization.js"></script>
 */

import { initFirebaseAuth, setupAuthUI, getCurrentUser } from './firebase-auth-integration.js';
import { initializeDashboard, loadUserDashboard } from './dashboard-module.js';
import { initItemManagement } from './item-upload-module.js';
import { initChatModule } from './chat-module.js';
import { db } from './firebase-auth-integration.js';

console.log('🚀 Initializing TalentTrade Firebase Integration...');

// Initialize everything when DOM is ready
async function initializeApp() {
    try {
        // Step 1: Initialize Firebase Auth
        console.log('📱 Initializing Firebase Auth...');
        const authReady = await initFirebaseAuth();
        
        if (!authReady) {
            console.error('❌ Firebase Auth failed to initialize');
            return;
        }
        
        // Step 2: Setup Auth UI (forms, buttons)
        console.log('🎨 Setting up Auth UI...');
        setupAuthUI();
        
        // Step 3: Check if user is logged in
        const user = getCurrentUser();
        
        if (user) {
            console.log('✅ User logged in:', user.username);
            
            // Show dashboard nav button
            const dashboardBtn = document.getElementById('dashboardNavBtn');
            const loginBtn = document.getElementById('loginNavBtn');
            const registerBtn = document.getElementById('registerNavBtn');
            const logoutBtn = document.getElementById('logoutNavBtn');
            
            if (dashboardBtn) dashboardBtn.classList.remove('hidden');
            if (loginBtn) loginBtn.classList.add('hidden');
            if (registerBtn) registerBtn.classList.add('hidden');
            if (logoutBtn) logoutBtn.classList.remove('hidden');
            
            // Step 4: Initialize item management
            console.log('📦 Initializing Item Management...');
            if (db) {
                initItemManagement(db);
            }
            
            // Step 5: Initialize dashboard
            console.log('📊 Initializing Dashboard...');
            await initializeDashboard();
            
            // Step 6: Initialize chat module
            console.log('💬 Initializing Chat...');
            if (db) {
                initChatModule(db);
            }
        } else {
            console.log('👤 No user logged in - showing auth buttons');
            
            // Hide dashboard button
            const dashboardBtn = document.getElementById('dashboardNavBtn');
            if (dashboardBtn) dashboardBtn.classList.add('hidden');
        }
        
        console.log('✨ TalentTrade fully initialized!');
        
    } catch (error) {
        console.error('❌ Initialization error:', error);
    }
}

// Wait for DOM to be ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}

// Export for global access if needed
window.TalentTradeApp = {
    initializeApp,
    getCurrentUser,
    loadUserDashboard
};
