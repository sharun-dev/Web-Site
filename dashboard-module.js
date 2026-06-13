/**
 * Dashboard Module
 * Handles user dashboard, item management (edit/delete), messages, and settings
 */

// ========== DASHBOARD INITIALIZATION ==========

export async function initializeDashboard() {
    setupDashboardTabs();
    setupDashboardEventListeners();
    await loadUserDashboard();
}

// ========== TAB SWITCHING ==========

function setupDashboardTabs() {
    const tabs = document.querySelectorAll('.dashboard-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.getAttribute('data-tab');
            switchDashboardTab(tabName);
        });
    });
}

function switchDashboardTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.dashboard-tab-content').forEach(content => {
        content.classList.add('hidden');
    });
    
    // Deactivate all tab buttons
    document.querySelectorAll('.dashboard-tab').forEach(tab => {
        tab.classList.remove('active', 'text-primary', 'border-primary');
        tab.classList.add('text-on-surface-variant', 'border-transparent');
    });
    
    // Show selected tab
    const selectedContent = document.getElementById(tabName + 'Tab');
    if (selectedContent) {
        selectedContent.classList.remove('hidden');
    }
    
    // Activate tab button
    const activeTab = document.querySelector(`[data-tab="${tabName}"]`);
    if (activeTab) {
        activeTab.classList.remove('text-on-surface-variant', 'border-transparent');
        activeTab.classList.add('active', 'text-primary', 'border-primary');
    }
}

// ========== LOAD USER ITEMS ==========

export async function loadUserDashboard() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (!currentUser) {
        console.log('No user logged in');
        return;
    }
    
    try {
        // Try to fetch from Firestore if available
        let userItems = [];
        
        if (typeof loadCreatedItemsFromFirestore !== 'undefined') {
            try {
                userItems = await loadCreatedItemsFromFirestore();
                // Filter for current user
                userItems = userItems.filter(item => item.creatorId === currentUser.uid);
            } catch (error) {
                console.warn('Firestore not available, using localStorage:', error);
                // Fall back to localStorage
                userItems = JSON.parse(localStorage.getItem('userItems') || '[]');
            }
        } else {
            // Use localStorage as fallback
            userItems = JSON.parse(localStorage.getItem('userItems') || '[]');
        }
        
        renderUserItems(userItems);
        
    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}

// ========== RENDER USER ITEMS ==========

function renderUserItems(items) {
    const userItemsGrid = document.getElementById('userItemsGrid');
    
    if (!userItemsGrid) return;
    
    if (items.length === 0) {
        userItemsGrid.innerHTML = `
            <div class="text-center py-12 text-on-surface-variant col-span-full">
                <span class="material-symbols-outlined text-4xl block mb-4">folder_open</span>
                <p>No items yet. <a href="#" class="text-primary hover:underline nav-link" data-section="upload">Create your first listing</a></p>
            </div>
        `;
        return;
    }
    
    userItemsGrid.innerHTML = '';
    
    items.forEach(item => {
        const itemCard = createDashboardItemCard(item);
        userItemsGrid.appendChild(itemCard);
    });
}

// ========== CREATE DASHBOARD ITEM CARD ==========

function createDashboardItemCard(item) {
    const card = document.createElement('div');
    card.className = 'glass-card rounded-2xl overflow-hidden flex flex-col';
    card.setAttribute('data-item-id', item.id);
    
    const imageUrl = item.imageUrl || item.image || placeholderDataUrl(300,200,'No Image');
    const badge = item.type === 'rent' ? 'For Rent' : 'For Sale';
    const badgeColor = item.type === 'rent' ? 'bg-secondary/20' : 'bg-primary/20';
    
    card.innerHTML = `
        <div class="relative">
            <img src="${imageUrl}" alt="${item.title}" class="w-full h-40 object-cover" onerror="this.onerror=null;this.src='${placeholderDataUrl(300,200,'No Image')}'"/>
            <span class="absolute top-3 right-3 ${badgeColor} text-xs font-bold px-3 py-1 rounded-full">
                ${badge}
            </span>
        </div>
        <div class="flex-1 p-4 flex flex-col gap-3">
            <div>
                <h3 class="font-bold text-lg line-clamp-2">${item.title}</h3>
                <p class="text-sm text-on-surface-variant line-clamp-2">${item.description || 'No description'}</p>
            </div>
            <div class="flex justify-between items-center">
                <div>
                    <p class="text-xs text-on-surface-variant">${item.category || 'Uncategorized'}</p>
                    <p class="text-lg text-primary font-bold">$${parseFloat(item.price).toFixed(2)}</p>
                </div>
            </div>
        </div>
        <div class="border-t border-outline-variant/20 p-3 flex gap-2">
            <button class="flex-1 bg-secondary-container/20 text-secondary-container hover:bg-secondary-container/40 font-bold py-2 rounded-lg transition-colors edit-item-btn flex items-center justify-center gap-2">
                <span class="material-symbols-outlined text-sm">edit</span>
                Edit
            </button>
            <button class="flex-1 bg-error/20 text-error hover:bg-error/40 font-bold py-2 rounded-lg transition-colors delete-item-btn flex items-center justify-center gap-2">
                <span class="material-symbols-outlined text-sm">delete</span>
                Delete
            </button>
        </div>
    `;
    
    // Event listeners
    const editBtn = card.querySelector('.edit-item-btn');
    const deleteBtn = card.querySelector('.delete-item-btn');
    
    editBtn.addEventListener('click', () => {
        editItem(item);
    });
    
    deleteBtn.addEventListener('click', () => {
        deleteItemConfirm(item.id, card);
    });
    
    return card;
}

// ========== EDIT ITEM ==========

function editItem(item) {
    // Scroll to upload section
    const uploadSection = document.getElementById('uploadSection');
    if (uploadSection) {
        uploadSection.classList.remove('hidden');
        
        // Fill form with current item data
        const form = document.getElementById('uploadForm');
        if (form) {
            form.querySelector('input[name="title"]').value = item.title;
            form.querySelector('textarea[name="description"]').value = item.description;
            form.querySelector('input[name="price"]').value = item.price;
            form.querySelector('input[name="category"]').value = item.categoryId || '';
            form.querySelector('input[name="imageUrl"]').value = item.imageUrl || '';
            
            // Set type radio button
            const typeRadio = form.querySelector(`input[name="type"][value="${item.type}"]`);
            if (typeRadio) typeRadio.checked = true;
            
            // Change button text
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Update Item';
            
            // Store item ID for update
            form.setAttribute('data-editing-item-id', item.id);
            
            // Update form submission
            const originalOnSubmit = form.onsubmit;
            form.onsubmit = async (e) => {
                e.preventDefault();
                
                const updatedData = {
                    id: item.id,
                    title: form.querySelector('input[name="title"]').value,
                    description: form.querySelector('textarea[name="description"]').value,
                    price: parseFloat(form.querySelector('input[name="price"]').value),
                    type: form.querySelector('input[name="type"]:checked').value,
                    categoryId: form.querySelector('input[name="category"]').value || item.categoryId,
                    imageUrl: form.querySelector('input[name="imageUrl"]').value,
                    ...item
                };
                
                try {
                    // Update in localStorage
                    const items = JSON.parse(localStorage.getItem('userItems') || '[]');
                    const index = items.findIndex(i => i.id === item.id);
                    if (index > -1) {
                        items[index] = updatedData;
                        localStorage.setItem('userItems', JSON.stringify(items));
                    }
                    
                    // Optionally update in Firestore if available
                    if (typeof updateDoc !== 'undefined' && typeof doc !== 'undefined') {
                        try {
                            const docRef = doc(db, 'created_items', item.id);
                            await updateDoc(docRef, updatedData);
                        } catch (err) {
                            console.warn('Firestore update failed, using localStorage only');
                        }
                    }
                    
                    alert('Item updated successfully!');
                    
                    // Reset form
                    form.onsubmit = originalOnSubmit;
                    submitBtn.textContent = originalText;
                    form.removeAttribute('data-editing-item-id');
                    form.reset();
                    
                    // Reload dashboard
                    await loadUserDashboard();
                    
                } catch (error) {
                    alert('Update failed: ' + error.message);
                }
            };
            
            // Scroll to form
            uploadSection.scrollIntoView({ behavior: 'smooth' });
        }
    }
}

// ========== DELETE ITEM ==========

function deleteItemConfirm(itemId, cardElement) {
    if (confirm('Are you sure you want to delete this item? This action cannot be undone.')) {
        deleteItem(itemId, cardElement);
    }
}

async function deleteItem(itemId, cardElement) {
    try {
        // Remove from localStorage
        const items = JSON.parse(localStorage.getItem('userItems') || '[]');
        const filtered = items.filter(item => item.id !== itemId);
        localStorage.setItem('userItems', JSON.stringify(filtered));
        
        // Remove from Firestore if available
        if (typeof deleteDoc !== 'undefined' && typeof doc !== 'undefined') {
            try {
                const docRef = doc(db, 'created_items', itemId);
                await deleteDoc(docRef);
            } catch (err) {
                console.warn('Firestore deletion failed, using localStorage only');
            }
        }
        
        // Remove card from UI with animation
        cardElement.style.opacity = '0';
        cardElement.style.transform = 'scale(0.9)';
        cardElement.style.transition = 'all 0.3s ease';
        
        setTimeout(() => {
            cardElement.remove();
            
            // Check if grid is empty
            const grid = document.getElementById('userItemsGrid');
            if (grid && grid.children.length === 0) {
                grid.innerHTML = `
                    <div class="text-center py-12 text-on-surface-variant col-span-full">
                        <span class="material-symbols-outlined text-4xl block mb-4">folder_open</span>
                        <p>No items yet. <a href="#" class="text-primary hover:underline nav-link" data-section="upload">Create your first listing</a></p>
                    </div>
                `;
            }
        }, 300);
        
        alert('Item deleted successfully');
        
    } catch (error) {
        alert('Delete failed: ' + error.message);
        console.error('Error deleting item:', error);
    }
}

// ========== ACCOUNT SETTINGS ==========

function setupDashboardEventListeners() {
    const saveSettingsBtn = document.getElementById('saveSettingsBtn');
    const logoutAccountBtn = document.getElementById('logoutAccountBtn');
    
    if (saveSettingsBtn) {
        saveSettingsBtn.addEventListener('click', saveAccountSettings);
    }
    
    if (logoutAccountBtn) {
        logoutAccountBtn.addEventListener('click', logoutAccount);
    }
    
    // Load account settings
    loadAccountSettings();
}

function loadAccountSettings() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (currentUser) {
        const usernameField = document.getElementById('settingsUsername');
        const emailField = document.getElementById('settingsEmail');
        const bioField = document.getElementById('settingsBio');
        
        if (usernameField) usernameField.value = currentUser.username || '';
        if (emailField) emailField.value = currentUser.email || '';
        if (bioField) bioField.value = currentUser.bio || '';
    }
}

async function saveAccountSettings() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (!currentUser) {
        alert('Please log in first');
        return;
    }
    
    try {
        const bioField = document.getElementById('settingsBio');
        const bio = bioField ? bioField.value : '';
        
        // Update in localStorage
        currentUser.bio = bio;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        // Optionally update in Firestore if available
        if (typeof updateDoc !== 'undefined' && typeof doc !== 'undefined') {
            try {
                const userDoc = doc(db, 'users', currentUser.uid);
                await updateDoc(userDoc, { bio: bio });
            } catch (err) {
                console.warn('Firestore update failed');
            }
        }
        
        alert('Account settings saved successfully!');
        
    } catch (error) {
        alert('Save failed: ' + error.message);
    }
}

async function logoutAccount() {
    if (confirm('Are you sure you want to logout?')) {
        try {
            // Try to use Firebase logout if available
            if (typeof logoutUser !== 'undefined') {
                await logoutUser();
            }
            
            // Clear localStorage
            localStorage.removeItem('currentUser');
            localStorage.removeItem('userItems');
            
            // Redirect to home
            window.location.href = 'index.html';
            
        } catch (error) {
            console.error('Logout error:', error);
            alert('Logout failed: ' + error.message);
        }
    }
}

// Export all functions
export {
    setupDashboardTabs,
    switchDashboardTab,
    renderUserItems,
    createDashboardItemCard,
    editItem,
    deleteItem,
    loadAccountSettings,
    saveAccountSettings,
    logoutAccount
};
