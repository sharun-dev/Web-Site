/**
 * Item Upload & Management Module
 * Handles creating, uploading, and persisting user items to Firestore
 */

import { 
    getFirestore, 
    collection, 
    addDoc, 
    doc, 
    updateDoc,
    deleteDoc,
    query,
    where,
    getDocs,
    serverTimestamp 
} from 'https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js';

let db = null;

// ========== INITIALIZATION ==========

export function initItemManagement(firebaseDb) {
    db = firebaseDb;
    setupUploadFormListeners();
}

// ========== UPLOAD FORM SETUP ==========

function setupUploadFormListeners() {
    const uploadForm = document.getElementById('uploadForm');
    if (!uploadForm) return;
    
    // Handle drag and drop
    const uploadArea = document.getElementById('uploadArea');
    if (uploadArea) {
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('border-primary', 'bg-primary/5');
        });
        
        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('border-primary', 'bg-primary/5');
        });
        
        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('border-primary', 'bg-primary/5');
            
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                handleImageUpload(files[0]);
            }
        });
    }
    
    // Handle file input
    const fileInput = document.querySelector('input[type="file"][name="image"]');
    if (fileInput) {
        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                handleImageUpload(e.target.files[0]);
            }
        });
    }
    
    // Handle form submission
    uploadForm.addEventListener('submit', handleUploadSubmit);
}

// ========== IMAGE UPLOAD ==========

function handleImageUpload(file) {
    // Validate file type
    if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
    }
    
    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
        alert('Image must be less than 5MB');
        return;
    }
    
    // Read and preview image
    const reader = new FileReader();
    reader.onload = (e) => {
        const preview = document.getElementById('imagePreview');
        if (preview) {
            preview.src = e.target.result;
            preview.style.display = 'block';
        }
        
        // Store in hidden input for upload
        const imageInput = document.querySelector('input[name="imageUrl"]');
        if (imageInput) {
            imageInput.value = e.target.result; // Data URL
        }
    };
    
    reader.readAsDataURL(file);
    
    // Show success message
    const statusDiv = document.getElementById('uploadStatus');
    if (statusDiv) {
        statusDiv.textContent = `✓ ${file.name} ready to upload`;
        statusDiv.classList.remove('text-error');
        statusDiv.classList.add('text-success');
    }
}

// ========== UPLOAD SUBMIT ==========

async function handleUploadSubmit(e) {
    e.preventDefault();
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        alert('Please log in to upload items');
        return;
    }
    
    try {
        const form = e.target;
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Uploading...';
        submitBtn.disabled = true;
        
        // Collect form data
        const itemData = {
            title: form.querySelector('input[name="title"]').value.trim(),
            description: form.querySelector('textarea[name="description"]').value.trim(),
            price: parseFloat(form.querySelector('input[name="price"]').value),
            type: form.querySelector('input[name="type"]:checked').value,
            categoryId: form.querySelector('select[name="category"]')?.value || 'general',
            imageUrl: form.querySelector('input[name="imageUrl"]').value,
            creatorId: currentUser.uid,
            creatorName: currentUser.username,
            createdAt: new Date().toISOString()
        };
        
        // Validate required fields
        if (!itemData.title || !itemData.description || !itemData.price || !itemData.imageUrl) {
            alert('Please fill in all required fields');
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
            return;
        }
        
        if (itemData.price <= 0) {
            alert('Price must be greater than 0');
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
            return;
        }
        
        // Save to Firestore
        let itemId = null;
        try {
            if (db) {
                const itemsRef = collection(db, 'created_items');
                const docRef = await addDoc(itemsRef, {
                    ...itemData,
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp()
                });
                itemId = docRef.id;
                console.log('✓ Item saved to Firestore:', itemId);
            }
        } catch (firestoreError) {
            console.warn('Firestore save failed, using localStorage only:', firestoreError);
            itemId = Date.now().toString(); // Generate ID locally
        }
        
        // Save to localStorage as backup
        const userItems = JSON.parse(localStorage.getItem('userItems') || '[]');
        itemData.id = itemId;
        userItems.push(itemData);
        localStorage.setItem('userItems', JSON.stringify(userItems));
        
        // Success feedback
        alert('Item uploaded successfully!');
        
        // Reset form
        form.reset();
        const preview = document.getElementById('imagePreview');
        if (preview) preview.style.display = 'none';
        
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        
        // Reload dashboard
        if (typeof loadUserDashboard === 'function') {
            await loadUserDashboard();
        }
        
        // Switch to dashboard
        if (typeof switchSection === 'function') {
            switchSection('dashboard');
        }
        
    } catch (error) {
        console.error('Upload error:', error);
        alert('Upload failed: ' + error.message);
        
        const submitBtn = e.target.querySelector('button[type="submit"]');
        submitBtn.textContent = 'Upload Item';
        submitBtn.disabled = false;
    }
}

// ========== UPDATE ITEM ==========

/**
 * Update an existing item
 * @param {string} itemId - Item ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<void>}
 */
export async function updateItem(itemId, updates) {
    try {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser) {
            throw new Error('Please log in to update items');
        }
        
        // Update in Firestore
        if (db) {
            const itemRef = doc(db, 'created_items', itemId);
            await updateDoc(itemRef, {
                ...updates,
                updatedAt: serverTimestamp()
            });
        }
        
        // Update in localStorage
        const userItems = JSON.parse(localStorage.getItem('userItems') || '[]');
        const index = userItems.findIndex(item => item.id === itemId);
        if (index > -1) {
            userItems[index] = { ...userItems[index], ...updates };
            localStorage.setItem('userItems', JSON.stringify(userItems));
        }
        
        console.log('✓ Item updated:', itemId);
        
    } catch (error) {
        console.error('Error updating item:', error);
        throw error;
    }
}

// ========== DELETE ITEM ==========

/**
 * Delete an item
 * @param {string} itemId - Item ID
 * @returns {Promise<void>}
 */
export async function deleteItem(itemId) {
    try {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser) {
            throw new Error('Please log in to delete items');
        }
        
        // Delete from Firestore
        if (db) {
            const itemRef = doc(db, 'created_items', itemId);
            await deleteDoc(itemRef);
        }
        
        // Delete from localStorage
        const userItems = JSON.parse(localStorage.getItem('userItems') || '[]');
        const filtered = userItems.filter(item => item.id !== itemId);
        localStorage.setItem('userItems', JSON.stringify(filtered));
        
        console.log('✓ Item deleted:', itemId);
        
    } catch (error) {
        console.error('Error deleting item:', error);
        throw error;
    }
}

// ========== RETRIEVE USER ITEMS ==========

/**
 * Get all items for current user
 * @returns {Promise<Array>} User's items
 */
export async function getUserItems() {
    try {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser) {
            return [];
        }
        
        let items = [];
        
        // Try Firestore first
        if (db) {
            try {
                const itemsRef = collection(db, 'created_items');
                const q = query(itemsRef, where('creatorId', '==', currentUser.uid));
                const snapshot = await getDocs(q);
                
                snapshot.forEach(doc => {
                    items.push({
                        id: doc.id,
                        ...doc.data()
                    });
                });
            } catch (error) {
                console.warn('Firestore query failed, using localStorage:', error);
                items = JSON.parse(localStorage.getItem('userItems') || '[]')
                    .filter(item => item.creatorId === currentUser.uid);
            }
        } else {
            // Use localStorage only
            items = JSON.parse(localStorage.getItem('userItems') || '[]')
                .filter(item => item.creatorId === currentUser.uid);
        }
        
        return items;
        
    } catch (error) {
        console.error('Error getting user items:', error);
        return [];
    }
}

/**
 * Get item by ID
 * @param {string} itemId - Item ID
 * @returns {Promise<Object|null>} Item data or null
 */
export async function getItemById(itemId) {
    try {
        // Try localStorage first (faster)
        const userItems = JSON.parse(localStorage.getItem('userItems') || '[]');
        const localItem = userItems.find(item => item.id === itemId);
        if (localItem) return localItem;
        
        // Try Firestore
        if (db) {
            const itemRef = doc(db, 'created_items', itemId);
            const docSnap = await getDoc(itemRef);
            if (docSnap.exists()) {
                return {
                    id: docSnap.id,
                    ...docSnap.data()
                };
            }
        }
        
        return null;
        
    } catch (error) {
        console.error('Error getting item:', error);
        return null;
    }
}

// ========== LOAD ALL ITEMS ==========

/**
 * Load items from Firestore
 * @returns {Promise<Array>} All marketplace items
 */
export async function loadCreatedItemsFromFirestore() {
    try {
        if (!db) {
            console.warn('Firestore not initialized');
            return JSON.parse(localStorage.getItem('userItems') || '[]');
        }
        
        const itemsRef = collection(db, 'created_items');
        const snapshot = await getDocs(itemsRef);
        
        const items = [];
        snapshot.forEach(doc => {
            items.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        return items;
        
    } catch (error) {
        console.error('Error loading items from Firestore:', error);
        return JSON.parse(localStorage.getItem('userItems') || '[]');
    }
}

/**
 * Save item to Firestore
 * @param {Object} itemData - Item to save
 * @returns {Promise<string>} Item ID
 */
export async function saveCreatedItemToFirestore(itemData) {
    try {
        if (!db) {
            throw new Error('Firestore not initialized');
        }
        
        const itemsRef = collection(db, 'created_items');
        const docRef = await addDoc(itemsRef, {
            ...itemData,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });
        
        return docRef.id;
        
    } catch (error) {
        console.error('Error saving item to Firestore:', error);
        throw error;
    }
}

// Export all functions
export {
    setupUploadFormListeners,
    handleImageUpload,
    handleUploadSubmit,
    getUserItems,
    getItemById,
    loadCreatedItemsFromFirestore,
    saveCreatedItemToFirestore
};
