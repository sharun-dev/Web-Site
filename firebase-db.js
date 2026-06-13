/**
 * Firebase Firestore Integration (firebase-db.js)
 * Lightweight Firestore helpers for TalentTrade
 * Assumes Firebase app is already initialized in the page (index.html)
 */

import {
  getFirestore,
  collection,
  addDoc,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  updateDoc,
  deleteDoc,
  serverTimestamp
} from 'https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js';

let firestore = null;

function ensureFirestore() {
  if (!firestore) {
    try {
      firestore = getFirestore();
    } catch (err) {
      console.error('Firestore initialization error:', err);
      throw err;
    }
  }
}

// ======= Items =======

export async function getAllItems() {
  ensureFirestore();
  try {
    const itemsRef = collection(firestore, 'created_items');
    const q = query(itemsRef, orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    const items = [];
    snap.forEach((d) => items.push({ id: d.id, ...d.data() }));
    return items;
  } catch (err) {
    console.error('getAllItems error', err);
    return [];
  }
}

export async function getItemsByCategory(categoryName) {
  ensureFirestore();
  try {
    const itemsRef = collection(firestore, 'created_items');
    const q = query(itemsRef, where('category', '==', categoryName), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    const items = [];
    snap.forEach((d) => items.push({ id: d.id, ...d.data() }));
    return items;
  } catch (err) {
    console.error('getItemsByCategory error', err);
    return [];
  }
}

export async function getItemById(itemId) {
  ensureFirestore();
  try {
    const itemRef = doc(firestore, 'created_items', itemId);
    const snap = await getDoc(itemRef);
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() };
  } catch (err) {
    console.error('getItemById error', err);
    return null;
  }
}

export async function searchItems(searchTerm) {
  ensureFirestore();
  try {
    // Firestore doesn't support complex OR text search without external index.
    // We'll fetch recent items and do a client-side filter for simplicity.
    const all = await getAllItems();
    const term = String(searchTerm || '').toLowerCase();
    if (!term) return all;
    return all.filter((it) => {
      return (it.title || '').toLowerCase().includes(term) || (it.description || '').toLowerCase().includes(term);
    });
  } catch (err) {
    console.error('searchItems error', err);
    return [];
  }
}

// ======= User Profiles =======

export async function getUserProfile(userId) {
  ensureFirestore();
  try {
    const userRef = doc(firestore, 'users', userId);
    const snap = await getDoc(userRef);
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() };
  } catch (err) {
    console.error('getUserProfile error', err);
    return null;
  }
}

// ======= Item CRUD =======

export async function uploadItem(itemData) {
  ensureFirestore();
  try {
    const itemsRef = collection(firestore, 'created_items');
    const docRef = await addDoc(itemsRef, {
      ...itemData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  } catch (err) {
    console.error('uploadItem error', err);
    throw err;
  }
}

export async function updateItem(itemId, updates) {
  ensureFirestore();
  try {
    const itemRef = doc(firestore, 'created_items', itemId);
    await updateDoc(itemRef, { ...updates, updatedAt: serverTimestamp() });
    return true;
  } catch (err) {
    console.error('updateItem error', err);
    throw err;
  }
}

export async function deleteItem(itemId) {
  ensureFirestore();
  try {
    const itemRef = doc(firestore, 'created_items', itemId);
    await deleteDoc(itemRef);
    return true;
  } catch (err) {
    console.error('deleteItem error', err);
    throw err;
  }
}

// ======= Reviews =======

export async function getItemReviews(itemId) {
  ensureFirestore();
  try {
    const reviewsRef = collection(firestore, 'reviews');
    const q = query(reviewsRef, where('itemId', '==', itemId), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    const items = [];
    snap.forEach((d) => items.push({ id: d.id, ...d.data() }));
    return items;
  } catch (err) {
    console.error('getItemReviews error', err);
    return [];
  }
}

// Lightweight export for compatibility
const db = {
  getAllItems,
  getItemsByCategory,
  getItemById,
  searchItems,
  getUserProfile,
  uploadItem,
  updateItem,
  deleteItem,
  getItemReviews
};

export default db;
