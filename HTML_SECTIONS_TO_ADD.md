/**
 * HTML_SECTIONS_TO_ADD.md
 * 
 * Copy and paste these HTML sections into your index.html file.
 * 
 * LOCATION: Add these sections BEFORE closing </body> tag
 * (after the cart drawer and before closing </body>)
 */

<!-- ========== LOGIN SECTION ========== -->
<!-- Add this after the cart drawer (after </aside> and before </body>) -->

<section id="loginSection" class="hidden py-section-gap px-margin-desktop max-w-container-max mx-auto">
    <div class="max-w-md mx-auto glass-card rounded-2xl p-8">
        <h2 class="font-headline-md text-headline-md mb-8 text-center">Login to TalentTrade</h2>
        <form id="loginForm" class="space-y-6">
            <div>
                <label class="font-label-md text-label-md block mb-2">Email</label>
                <input 
                    type="email" 
                    name="email" 
                    required 
                    class="w-full bg-surface-container rounded-lg px-4 py-3 border border-outline-variant/30 text-on-surface placeholder-on-surface-variant focus:border-primary outline-none transition-colors"
                    placeholder="your@email.com"
                />
            </div>
            <div>
                <label class="font-label-md text-label-md block mb-2">Password</label>
                <input 
                    type="password" 
                    name="password" 
                    required 
                    class="w-full bg-surface-container rounded-lg px-4 py-3 border border-outline-variant/30 text-on-surface placeholder-on-surface-variant focus:border-primary outline-none transition-colors"
                    placeholder="••••••••"
                />
            </div>
            <button 
                type="submit" 
                class="w-full bg-primary text-on-primary font-bold py-3 rounded-lg hover:scale-105 transition-transform active:scale-95"
            >
                Login
            </button>
        </form>
        <p class="text-center mt-4 text-on-surface-variant">
            Don't have an account? 
            <a href="#" class="text-primary hover:underline nav-link" data-section="register">Register here</a>
        </p>
    </div>
</section>

<!-- ========== REGISTER SECTION ========== -->
<!-- Add this after login section -->

<section id="registerSection" class="hidden py-section-gap px-margin-desktop max-w-container-max mx-auto">
    <div class="max-w-md mx-auto glass-card rounded-2xl p-8">
        <h2 class="font-headline-md text-headline-md mb-8 text-center">Join TalentTrade</h2>
        <form id="registerForm" class="space-y-6">
            <div>
                <label class="font-label-md text-label-md block mb-2">Username</label>
                <input 
                    type="text" 
                    name="username" 
                    required 
                    class="w-full bg-surface-container rounded-lg px-4 py-3 border border-outline-variant/30 text-on-surface placeholder-on-surface-variant focus:border-primary outline-none transition-colors"
                    placeholder="Choose a username"
                />
            </div>
            <div>
                <label class="font-label-md text-label-md block mb-2">Email</label>
                <input 
                    type="email" 
                    name="email" 
                    required 
                    class="w-full bg-surface-container rounded-lg px-4 py-3 border border-outline-variant/30 text-on-surface placeholder-on-surface-variant focus:border-primary outline-none transition-colors"
                    placeholder="your@email.com"
                />
            </div>
            <div>
                <label class="font-label-md text-label-md block mb-2">Password (min 6 chars)</label>
                <input 
                    type="password" 
                    name="password" 
                    required 
                    class="w-full bg-surface-container rounded-lg px-4 py-3 border border-outline-variant/30 text-on-surface placeholder-on-surface-variant focus:border-primary outline-none transition-colors"
                    placeholder="••••••••"
                />
            </div>
            <div>
                <label class="font-label-md text-label-md block mb-2">Confirm Password</label>
                <input 
                    type="password" 
                    name="confirmPassword" 
                    required 
                    class="w-full bg-surface-container rounded-lg px-4 py-3 border border-outline-variant/30 text-on-surface placeholder-on-surface-variant focus:border-primary outline-none transition-colors"
                    placeholder="••••••••"
                />
            </div>
            <button 
                type="submit" 
                class="w-full bg-primary text-on-primary font-bold py-3 rounded-lg hover:scale-105 transition-transform active:scale-95"
            >
                Create Account
            </button>
        </form>
        <p class="text-center mt-4 text-on-surface-variant">
            Already have an account? 
            <a href="#" class="text-primary hover:underline nav-link" data-section="login">Login here</a>
        </p>
    </div>
</section>

<!-- ========== DASHBOARD SECTION ========== -->
<!-- Add this after register section -->

<section id="dashboardSection" class="hidden py-section-gap px-margin-desktop max-w-container-max mx-auto">
    <div class="mb-12">
        <div class="flex items-center justify-between mb-6">
            <div>
                <h2 class="font-headline-md text-headline-md mb-2">My Dashboard</h2>
                <p class="font-body-md text-body-md text-on-surface-variant">Manage your listings and items</p>
            </div>
            <button class="bg-primary-container text-on-primary-container font-bold px-8 py-4 rounded-xl text-body-lg hover:scale-105 transition-transform active:scale-95 nav-link" data-section="upload">
                <span class="material-symbols-outlined align-middle mr-2">add</span>Create New Listing
            </button>
        </div>
    </div>
    
    <!-- Dashboard Tabs -->
    <div class="mb-8 flex gap-4 border-b border-outline-variant/30 overflow-x-auto">
        <button class="dashboard-tab active pb-4 border-b-2 border-primary text-primary font-bold whitespace-nowrap" data-tab="items">
            <span class="material-symbols-outlined align-middle mr-2">inventory_2</span>My Items
        </button>
        <button class="dashboard-tab pb-4 border-b-2 border-transparent text-on-surface-variant hover:text-on-surface whitespace-nowrap" data-tab="messages">
            <span class="material-symbols-outlined align-middle mr-2">message</span>Messages
        </button>
        <button class="dashboard-tab pb-4 border-b-2 border-transparent text-on-surface-variant hover:text-on-surface whitespace-nowrap" data-tab="settings">
            <span class="material-symbols-outlined align-middle mr-2">settings</span>Settings
        </button>
    </div>
    
    <!-- My Items Tab -->
    <div id="itemsTab" class="dashboard-tab-content">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="userItemsGrid">
            <div class="text-center py-12 text-on-surface-variant col-span-full">
                <span class="material-symbols-outlined text-4xl block mb-4">folder_open</span>
                <p>No items yet. <a href="#" class="text-primary hover:underline nav-link" data-section="upload">Create your first listing</a></p>
            </div>
        </div>
    </div>
    
    <!-- Messages Tab -->
    <div id="messagesTab" class="dashboard-tab-content hidden">
        <div class="glass-card rounded-2xl p-6">
            <div class="space-y-4" id="messagesList">
                <div class="text-center py-12 text-on-surface-variant">
                    <span class="material-symbols-outlined text-4xl block mb-4">mail</span>
                    <p>No messages yet</p>
                </div>
            </div>
        </div>
    </div>
    
    <!-- Settings Tab -->
    <div id="settingsTab" class="dashboard-tab-content hidden">
        <div class="glass-card rounded-2xl p-8 max-w-2xl">
            <h3 class="font-headline-sm text-headline-sm mb-6">Account Settings</h3>
            <form id="accountSettingsForm" class="space-y-6">
                <div>
                    <label class="font-label-md text-label-md block mb-2">Username</label>
                    <input 
                        type="text" 
                        id="settingsUsername" 
                        disabled 
                        class="w-full bg-surface-container rounded-lg px-4 py-3 border border-outline-variant/30 text-on-surface/50"
                    />
                </div>
                <div>
                    <label class="font-label-md text-label-md block mb-2">Email</label>
                    <input 
                        type="email" 
                        id="settingsEmail" 
                        disabled 
                        class="w-full bg-surface-container rounded-lg px-4 py-3 border border-outline-variant/30 text-on-surface/50"
                    />
                </div>
                <div>
                    <label class="font-label-md text-label-md block mb-2">Bio</label>
                    <textarea 
                        id="settingsBio" 
                        rows="4" 
                        placeholder="Tell us about yourself"
                        class="w-full bg-surface-container rounded-lg px-4 py-3 border border-outline-variant/30 text-on-surface placeholder-on-surface-variant focus:border-primary outline-none transition-colors resize-none"
                    ></textarea>
                </div>
                <div class="flex gap-4">
                    <button 
                        type="button" 
                        class="flex-1 bg-secondary-container text-on-secondary-container font-bold px-8 py-3 rounded-xl hover:scale-105 transition-transform"
                        id="saveSettingsBtn"
                    >
                        Save Changes
                    </button>
                    <button 
                        type="button" 
                        class="flex-1 bg-error/20 text-error font-bold px-8 py-3 rounded-xl hover:scale-105 transition-transform"
                        id="logoutAccountBtn"
                    >
                        Logout
                    </button>
                </div>
            </form>
        </div>
    </div>
</section>

<!-- ========== ADD THESE CHANGES TO EXISTING ELEMENTS ========== -->

<!-- 
UPDATE THE TOP NAV BAR LOGIN/REGISTER BUTTONS:

Replace the existing buttons in the <nav> with these:

OLD CODE TO REPLACE:
<a class="font-label-md text-label-md px-6 py-2 rounded-full border border-primary text-primary hover:bg-primary/10 transition-all active:scale-95" href="login.html" id="loginNavBtn">Login</a>
<a class="font-label-md text-label-md px-6 py-2 rounded-full bg-primary-container text-on-primary-container font-bold hover:scale-105 transition-transform active:scale-95" href="register.html" id="registerNavBtn">Register</a>
<a class="font-label-md text-label-md px-6 py-2 rounded-full bg-primary-container text-on-primary-container font-bold hover:scale-105 transition-transform active:scale-95 hidden" href="dashboard.html" id="dashboardNavBtn">Dashboard</a>
<button class="font-label-md text-label-md px-6 py-2 rounded-full bg-error text-on-error font-bold hover:scale-105 transition-transform active:scale-95 hidden" id="logoutNavBtn">Logout</button>

REPLACE WITH THIS:
<button class="font-label-md text-label-md px-6 py-2 rounded-full border border-primary text-primary hover:bg-primary/10 transition-all active:scale-95 nav-link" id="loginNavBtn" data-section="login">Login</button>
<button class="font-label-md text-label-md px-6 py-2 rounded-full bg-primary-container text-on-primary-container font-bold hover:scale-105 transition-transform active:scale-95 nav-link" id="registerNavBtn" data-section="register">Register</button>
<button class="font-label-md text-label-md px-6 py-2 rounded-full bg-primary-container text-on-primary-container font-bold hover:scale-105 transition-transform active:scale-95 hidden nav-link" id="dashboardNavBtn" data-section="dashboard">Dashboard</button>
<button class="font-label-md text-label-md px-6 py-2 rounded-full bg-error text-on-error font-bold hover:scale-105 transition-transform active:scale-95 hidden" id="logoutNavBtn">Logout</button>

This changes the href to data-section attributes so they work with the existing switchSection() function in script.js
-->

<!-- ========== SCRIPT INITIALIZATION ========== -->

<!--
ADD THIS TO THE HEAD SECTION (before closing </head>):

<script type="module" src="app-initialization.js"></script>

This initializes Firebase, Auth, Dashboard, and Chat when the page loads.
-->

<!-- ========== FIRESTORE COLLECTIONS TO CREATE ========== -->

<!--
Create these in Firebase Console > Firestore Database:

1. "users" collection
   Document ID: uid (auto)
   Fields:
   - email: string
   - username: string
   - bio: string
   - avatarUrl: string
   - createdAt: timestamp
   - updatedAt: timestamp

2. "created_items" collection
   Document ID: auto-generate
   Fields:
   - title: string
   - description: string
   - price: number
   - type: string (sale or rent)
   - categoryId: string
   - imageUrl: string
   - creatorId: string
   - creatorName: string
   - createdAt: timestamp
   - updatedAt: timestamp

3. "chats" collection
   Document ID: item-{itemId}
   Fields:
   - itemId: string
   - sellerId: string
   - buyerId: string
   - lastMessage: string
   - lastMessageAt: timestamp
   
   Subcollection "messages" under each chat:
   - sender: string
   - text: string
   - timestamp: timestamp
   - type: string (text, image, etc)
-->

<!-- ========== FIRESTORE SECURITY RULES ========== -->

<!--
Copy this to Firebase Console > Firestore Database > Rules:

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users - only read own profile, create on signup
    match /users/{userId} {
      allow read: if request.auth.uid == userId;
      allow create: if request.auth.uid == request.resource.data.uid;
      allow update: if request.auth.uid == userId;
    }
    
    // Created Items - anyone read, creator write
    match /created_items/{document=**} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth.uid == resource.data.creatorId;
    }
    
    // Chats - anyone read, authenticated users write
    match /chats/{chatId}/messages/{message} {
      allow read: if true;
      allow create: if request.auth != null;
    }
  }
}
-->
