# TalentTrade Firebase Integration Setup

Complete guide to integrate Firebase authentication, database, and item management into your TalentTrade marketplace.

## Prerequisites

- Firebase Console account with project "website-d45d9"
- Firebase credentials in `firebase-config.js`
- Node.js and npm (for building)
- VS Code

## Quick Start

### 1. Update firebase-config.js

Replace placeholder values with your actual Firebase credentials:

```javascript
export const firebaseConfig = {
    apiKey: "YOUR_API_KEY_FROM_FIREBASE",
    authDomain: "website-d45d9.firebaseapp.com",
    projectId: "website-d45d9",
    storageBucket: "website-d45d9.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID",
    measurementId: "YOUR_MEASUREMENT_ID"
};
```

**How to get these credentials:**
1. Go to Firebase Console > website-d45d9 project
2. Settings (gear icon) > Project settings
3. Copy values from "Web" app credentials

### 2. Update index.html

Add these sections before closing `</head>`:

```html
<!-- Import modules as ES6 modules -->
<script type="module">
    import { initFirebaseAuth, setupAuthUI, getCurrentUser } from './firebase-auth-integration.js';
    import { initializeDashboard } from './dashboard-module.js';
    
    document.addEventListener('DOMContentLoaded', async () => {
        // Initialize Firebase Auth
        await initFirebaseAuth();
        
        // Setup auth UI (forms, buttons)
        setupAuthUI();
        
        // Load dashboard if user is logged in
        const user = getCurrentUser();
        if (user) {
            await initializeDashboard();
        }
    });
</script>
```

### 3. Create Dashboard HTML Section

Add this section to index.html (before closing `</body>`):

```html
<!-- Dashboard Section -->
<section id="dashboardSection" class="hidden py-section-gap px-margin-desktop max-w-container-max mx-auto">
    <div class="mb-12">
        <div class="flex items-center justify-between mb-6">
            <div>
                <h2 class="font-headline-md text-headline-md mb-2">My Dashboard</h2>
                <p class="font-body-md text-body-md text-on-surface-variant">Manage your listings and items</p>
            </div>
            <button class="bg-primary-container text-on-primary-container font-bold px-8 py-4 rounded-xl text-body-lg hover:scale-105 transition-transform active:scale-95 nav-link" data-section="upload">
                + Create New Listing
            </button>
        </div>
    </div>
    
    <!-- Dashboard Tabs -->
    <div class="mb-8 flex gap-4 border-b border-outline-variant/30">
        <button class="dashboard-tab active pb-4 border-b-2 border-primary text-primary font-bold" data-tab="items">
            <span class="material-symbols-outlined align-middle mr-2">inventory_2</span>My Items
        </button>
        <button class="dashboard-tab pb-4 border-b-2 border-transparent text-on-surface-variant" data-tab="messages">
            <span class="material-symbols-outlined align-middle mr-2">message</span>Messages
        </button>
        <button class="dashboard-tab pb-4 border-b-2 border-transparent text-on-surface-variant" data-tab="settings">
            <span class="material-symbols-outlined align-middle mr-2">settings</span>Settings
        </button>
    </div>
    
    <!-- My Items Tab -->
    <div id="itemsTab" class="dashboard-tab-content">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="userItemsGrid">
            <div class="text-center py-12 text-on-surface-variant">
                <span class="material-symbols-outlined text-4xl block mb-4">folder_open</span>
                <p>No items yet</p>
            </div>
        </div>
    </div>
    
    <!-- Messages Tab -->
    <div id="messagesTab" class="dashboard-tab-content hidden">
        <div class="text-center py-12 text-on-surface-variant">
            <span class="material-symbols-outlined text-4xl block mb-4">mail</span>
            <p>No messages yet</p>
        </div>
    </div>
    
    <!-- Settings Tab -->
    <div id="settingsTab" class="dashboard-tab-content hidden">
        <div class="glass-card rounded-2xl p-8 max-w-2xl">
            <h3 class="font-headline-sm text-headline-sm mb-6">Account Settings</h3>
            <form id="accountSettingsForm" class="space-y-6">
                <div>
                    <label class="font-label-md text-label-md block mb-2">Username</label>
                    <input type="text" id="settingsUsername" disabled class="w-full bg-surface-container rounded-lg px-4 py-3"/>
                </div>
                <div>
                    <label class="font-label-md text-label-md block mb-2">Email</label>
                    <input type="email" id="settingsEmail" disabled class="w-full bg-surface-container rounded-lg px-4 py-3"/>
                </div>
                <div>
                    <label class="font-label-md text-label-md block mb-2">Bio</label>
                    <textarea id="settingsBio" rows="4" class="w-full bg-surface-container rounded-lg px-4 py-3"></textarea>
                </div>
                <div class="flex gap-4">
                    <button type="button" class="flex-1 bg-secondary-container px-8 py-3 rounded-xl font-bold" id="saveSettingsBtn">
                        Save Changes
                    </button>
                    <button type="button" class="flex-1 bg-error/20 text-error px-8 py-3 rounded-xl font-bold" id="logoutAccountBtn">
                        Logout
                    </button>
                </div>
            </form>
        </div>
    </div>
</section>
```

### 4. Create Login/Register Forms

Add to index.html:

```html
<!-- Login Section -->
<section id="loginSection" class="hidden py-section-gap px-margin-desktop max-w-container-max mx-auto">
    <div class="max-w-md mx-auto glass-card rounded-2xl p-8">
        <h2 class="font-headline-md text-headline-md mb-8 text-center">Login to TalentTrade</h2>
        <form id="loginForm" class="space-y-6">
            <div>
                <label class="font-label-md text-label-md block mb-2">Email</label>
                <input type="email" name="email" required class="w-full bg-surface-container rounded-lg px-4 py-3 border border-outline-variant/30 focus:border-primary outline-none"/>
            </div>
            <div>
                <label class="font-label-md text-label-md block mb-2">Password</label>
                <input type="password" name="password" required class="w-full bg-surface-container rounded-lg px-4 py-3 border border-outline-variant/30 focus:border-primary outline-none"/>
            </div>
            <button type="submit" class="w-full bg-primary text-on-primary font-bold py-3 rounded-lg hover:scale-105 transition-transform">
                Login
            </button>
        </form>
        <p class="text-center mt-4 text-on-surface-variant">
            Don't have an account? <a href="#" class="text-primary hover:underline nav-link" data-section="register">Register here</a>
        </p>
    </div>
</section>

<!-- Register Section -->
<section id="registerSection" class="hidden py-section-gap px-margin-desktop max-w-container-max mx-auto">
    <div class="max-w-md mx-auto glass-card rounded-2xl p-8">
        <h2 class="font-headline-md text-headline-md mb-8 text-center">Join TalentTrade</h2>
        <form id="registerForm" class="space-y-6">
            <div>
                <label class="font-label-md text-label-md block mb-2">Username</label>
                <input type="text" name="username" required class="w-full bg-surface-container rounded-lg px-4 py-3 border border-outline-variant/30 focus:border-primary outline-none"/>
            </div>
            <div>
                <label class="font-label-md text-label-md block mb-2">Email</label>
                <input type="email" name="email" required class="w-full bg-surface-container rounded-lg px-4 py-3 border border-outline-variant/30 focus:border-primary outline-none"/>
            </div>
            <div>
                <label class="font-label-md text-label-md block mb-2">Password (min 6 chars)</label>
                <input type="password" name="password" required class="w-full bg-surface-container rounded-lg px-4 py-3 border border-outline-variant/30 focus:border-primary outline-none"/>
            </div>
            <div>
                <label class="font-label-md text-label-md block mb-2">Confirm Password</label>
                <input type="password" name="confirmPassword" required class="w-full bg-surface-container rounded-lg px-4 py-3 border border-outline-variant/30 focus:border-primary outline-none"/>
            </div>
            <button type="submit" class="w-full bg-primary text-on-primary font-bold py-3 rounded-lg hover:scale-105 transition-transform">
                Create Account
            </button>
        </form>
        <p class="text-center mt-4 text-on-surface-variant">
            Already have an account? <a href="#" class="text-primary hover:underline nav-link" data-section="login">Login here</a>
        </p>
    </div>
</section>
```

### 5. Setup Firestore Collections

In Firebase Console:

1. Go to **Firestore Database** > Create Collection

2. Create collection `users`:
   ```
   uid (document ID)
   - email: string
   - username: string
   - bio: string
   - avatarUrl: string
   - createdAt: timestamp
   - updatedAt: timestamp
   ```

3. Create collection `created_items`:
   ```
   id (auto-generated)
   - title: string
   - description: string
   - price: number
   - type: string ('sale' or 'rent')
   - categoryId: string
   - imageUrl: string
   - creatorId: string
   - creatorName: string
   - createdAt: timestamp
   - updatedAt: timestamp
   ```

4. Create collection `chats`:
   ```
   item-{itemId} (document ID)
   - messages (subcollection)
     - sender: string
     - text: string
     - timestamp: timestamp
   ```

### 6. Setup Firestore Security Rules

In Firebase Console > Firestore > Rules, replace with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users - only read own profile
    match /users/{userId} {
      allow read: if request.auth.uid == userId;
      allow create: if request.auth.uid == request.resource.data.uid;
      allow update: if request.auth.uid == userId;
    }
    
    // Items - anyone read, creator write
    match /created_items/{document=**} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth.uid == resource.data.creatorId;
    }
    
    // Chats
    match /chats/{chatId}/messages/{message} {
      allow read: if true;
      allow create: if request.auth != null;
    }
  }
}
```

### 7. Update script.js

Add this to initialize item management and dashboard:

```javascript
import { initItemManagement } from './item-upload-module.js';
import { initializeDashboard } from './dashboard-module.js';
import { db } from './firebase-auth-integration.js';

// After TalentTrade is defined
document.addEventListener('DOMContentLoaded', async () => {
    // Initialize item management
    if (db) {
        initItemManagement(db);
    }
    
    // Initialize dashboard if user logged in
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (user) {
        await initializeDashboard();
    }
});
```

## File Structure

```
- index.html (main page with auth forms & dashboard section)
- script.js (cart & navigation logic)
- firebase-config.js (credentials)
- firebase-auth-integration.js (authentication)
- dashboard-module.js (dashboard UI & management)
- item-upload-module.js (upload & CRUD operations)
- FIREBASE-INTEGRATION-GUIDE.js (reference)
```

## Features Enabled

✅ User Registration with email/password
✅ User Login/Logout
✅ Dashboard with item management
✅ Create/Upload items
✅ Edit existing items
✅ Delete items with confirmation
✅ View user profile & bio
✅ Account settings
✅ Item images (stored as data URLs or URLs)
✅ LocalStorage fallback for offline support

## Testing

1. **Register User:**
   - Fill register form with email, password, username
   - Should create Firebase Auth account and Firestore profile
   - Redirect to dashboard

2. **Upload Item:**
   - On dashboard, click "Create New Listing"
   - Fill title, description, price, category, image
   - Click "Upload Item"
   - Should appear in dashboard

3. **Edit Item:**
   - On dashboard, click "Edit" on any item
   - Form pre-fills with item data
   - Change values and click "Update Item"
   - Should update in dashboard

4. **Delete Item:**
   - On dashboard, click "Delete" on any item
   - Confirm deletion
   - Item should disappear from dashboard

5. **Settings:**
   - Go to Settings tab
   - Update bio and save
   - Should persist in Firestore and localStorage

## Troubleshooting

**"Firebase not initialized"** 
- Check firebase-config.js credentials
- Verify project ID matches Firebase Console

**Items not saving**
- Check Firestore Rules allow creates
- Verify user is authenticated
- Check browser console for errors

**Images not displaying**
- Ensure image URLs are valid
- Check CORS if using external image URLs
- Data URLs may have size limits

**Dashboard not loading**
- Verify user localStorage has currentUser
- Check network tab for Firestore query errors
- Check browser console for JavaScript errors

## Next Steps

1. Add item search/filtering
2. Implement cart checkout with Stripe
3. Add real-time chat messaging
4. Create seller ratings/reviews system
5. Add item favorites/bookmarking
6. Implement notifications

---

Need help? Check firebase-db.js for existing data functions.
