/**
 * Chat & Messaging Module
 * Handles real-time messaging between buyers and sellers for created items
 */

import {
    getFirestore,
    collection,
    doc,
    addDoc,
    query,
    orderBy,
    limit,
    getDocs,
    onSnapshot,
    serverTimestamp,
    setDoc
} from 'https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js';

let db = null;
let chatListeners = new Map(); // Store unsubscribe functions

// ========== INITIALIZATION ==========

export function initChatModule(firebaseDb) {
    db = firebaseDb;
    console.log('✓ Chat module initialized');
}

// ========== CREATE/GET CHAT ROOM ==========

/**
 * Get or create a chat room for an item
 * @param {string} itemId - Item ID
 * @param {string} sellerId - Seller user ID
 * @param {string} buyerId - Buyer user ID
 * @returns {Promise<string>} Chat room ID
 */
export async function getOrCreateChatRoom(itemId, sellerId, buyerId) {
    try {
        if (!db) {
            throw new Error('Chat module not initialized');
        }
        
        // Create chat room ID
        const chatRoomId = `item-${itemId}`;
        
        const chatsRef = collection(db, 'chats');
        const chatRoomRef = doc(chatsRef, chatRoomId);
        
        // Get or create chat room document
        await setDoc(chatRoomRef, {
            itemId: itemId,
            sellerId: sellerId,
            buyerId: buyerId,
            createdAt: serverTimestamp(),
            lastMessageAt: serverTimestamp()
        }, { merge: true });
        
        return chatRoomId;
        
    } catch (error) {
        console.error('Error creating chat room:', error);
        throw error;
    }
}

// ========== SEND MESSAGE ==========

/**
 * Send a message in a chat room
 * @param {string} chatRoomId - Chat room ID
 * @param {string} senderId - Sender user ID
 * @param {string} senderName - Sender display name
 * @param {string} messageText - Message content
 * @param {string} messageType - 'text', 'image', 'file' (default: 'text')
 * @returns {Promise<string>} Message ID
 */
export async function sendChatMessage(chatRoomId, senderId, senderName, messageText, messageType = 'text') {
    try {
        if (!db) {
            throw new Error('Chat module not initialized');
        }
        
        if (!messageText.trim()) {
            throw new Error('Message cannot be empty');
        }
        
        const chatsRef = collection(db, 'chats');
        const chatRoomRef = doc(chatsRef, chatRoomId);
        const messagesRef = collection(chatRoomRef, 'messages');
        
        const docRef = await addDoc(messagesRef, {
            senderId: senderId,
            senderName: senderName,
            text: messageText.trim(),
            type: messageType,
            timestamp: serverTimestamp(),
            isRead: false
        });
        
        // Update last message timestamp
        await setDoc(chatRoomRef, {
            lastMessageAt: serverTimestamp(),
            lastMessage: messageText.substring(0, 100)
        }, { merge: true });
        
        console.log('✓ Message sent:', docRef.id);
        return docRef.id;
        
    } catch (error) {
        console.error('Error sending message:', error);
        throw error;
    }
}

// ========== GET CHAT HISTORY ==========

/**
 * Get previous messages from chat room
 * @param {string} chatRoomId - Chat room ID
 * @param {number} messageLimit - Number of messages to fetch (default: 50)
 * @returns {Promise<Array>} Array of message objects
 */
export async function getChatHistory(chatRoomId, messageLimit = 50) {
    try {
        if (!db) {
            throw new Error('Chat module not initialized');
        }
        
        const chatsRef = collection(db, 'chats');
        const chatRoomRef = doc(chatsRef, chatRoomId);
        const messagesRef = collection(chatRoomRef, 'messages');
        
        const q = query(
            messagesRef,
            orderBy('timestamp', 'desc'),
            limit(messageLimit)
        );
        
        const snapshot = await getDocs(q);
        const messages = [];
        
        snapshot.forEach((doc) => {
            messages.unshift({
                id: doc.id,
                ...doc.data()
            });
        });
        
        console.log(`✓ Fetched ${messages.length} messages from ${chatRoomId}`);
        return messages;
        
    } catch (error) {
        console.error('Error getting chat history:', error);
        return [];
    }
}

// ========== LISTEN TO MESSAGES (REAL-TIME) ==========

/**
 * Listen for new messages in real-time
 * @param {string} chatRoomId - Chat room ID
 * @param {Function} callback - Called with new messages array
 * @returns {Function} Unsubscribe function
 */
export function listenToChatMessages(chatRoomId, callback) {
    try {
        if (!db) {
            throw new Error('Chat module not initialized');
        }
        
        const chatsRef = collection(db, 'chats');
        const chatRoomRef = doc(chatsRef, chatRoomId);
        const messagesRef = collection(chatRoomRef, 'messages');
        
        const q = query(messagesRef, orderBy('timestamp', 'asc'));
        
        // Subscribe to real-time updates
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const messages = [];
            
            snapshot.forEach((doc) => {
                messages.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            callback(messages);
        });
        
        // Store unsubscribe function
        chatListeners.set(chatRoomId, unsubscribe);
        
        console.log('✓ Listening to messages in', chatRoomId);
        return unsubscribe;
        
    } catch (error) {
        console.error('Error listening to messages:', error);
        return () => {}; // Return no-op unsubscribe
    }
}

// ========== STOP LISTENING ==========

/**
 * Stop listening to chat messages
 * @param {string} chatRoomId - Chat room ID
 */
export function stopListeningToChat(chatRoomId) {
    const unsubscribe = chatListeners.get(chatRoomId);
    if (unsubscribe) {
        unsubscribe();
        chatListeners.delete(chatRoomId);
        console.log('✓ Stopped listening to', chatRoomId);
    }
}

// ========== GET ALL CHATS FOR USER ==========

/**
 * Get all chat rooms for a user (buyer or seller)
 * @param {string} userId - User ID
 * @param {string} role - 'buyer' or 'seller' (default: both)
 * @returns {Promise<Array>} Array of chat rooms
 */
export async function getUserChats(userId, role = 'all') {
    try {
        if (!db) {
            throw new Error('Chat module not initialized');
        }
        
        const chatsRef = collection(db, 'chats');
        const chats = [];
        
        const snapshot = await getDocs(chatsRef);
        
        snapshot.forEach((doc) => {
            const chatData = doc.data();
            
            // Filter by role
            if (role === 'buyer' && chatData.buyerId === userId) {
                chats.push({
                    id: doc.id,
                    ...chatData
                });
            } else if (role === 'seller' && chatData.sellerId === userId) {
                chats.push({
                    id: doc.id,
                    ...chatData
                });
            } else if (role === 'all' && (chatData.buyerId === userId || chatData.sellerId === userId)) {
                chats.push({
                    id: doc.id,
                    ...chatData
                });
            }
        });
        
        return chats;
        
    } catch (error) {
        console.error('Error getting user chats:', error);
        return [];
    }
}

// ========== RENDER CHAT UI ==========

/**
 * Render chat messages in a container
 * @param {Array} messages - Array of message objects
 * @param {string} containerId - HTML element ID for chat container
 * @param {string} currentUserId - Current logged-in user ID
 */
export function renderChatMessages(messages, containerId, currentUserId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    if (messages.length === 0) {
        container.innerHTML = `
            <div class="text-center py-8 text-on-surface-variant">
                <p>No messages yet. Start a conversation!</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = messages.map(msg => {
        const isCurrentUser = msg.senderId === currentUserId;
        const timestamp = msg.timestamp?.toDate?.() || new Date();
        const timeString = new Date(timestamp).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
        
        return `
            <div class="mb-4 ${isCurrentUser ? 'flex justify-end' : 'flex justify-start'}">
                <div class="${isCurrentUser ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface'} rounded-lg px-4 py-3 max-w-xs break-words">
                    ${!isCurrentUser ? `<p class="text-xs font-bold opacity-75 mb-1">${msg.senderName}</p>` : ''}
                    <p class="text-sm">${escapeHtml(msg.text)}</p>
                    <p class="text-xs opacity-50 mt-1">${timeString}</p>
                </div>
            </div>
        `;
    }).join('');
    
    // Scroll to bottom
    container.scrollTop = container.scrollHeight;
}

/**
 * Create chat UI component
 * @param {string} chatRoomId - Chat room ID
 * @param {string} itemTitle - Title of the item
 * @param {string} otherUserName - Name of other user
 * @param {string} currentUserId - Current user ID
 * @returns {HTMLElement} Chat UI element
 */
export function createChatUI(chatRoomId, itemTitle, otherUserName, currentUserId) {
    const chatContainer = document.createElement('div');
    chatContainer.className = 'glass-card rounded-2xl flex flex-col h-96 overflow-hidden';
    
    chatContainer.innerHTML = `
        <div class="border-b border-outline-variant/20 p-4">
            <h3 class="font-bold">${escapeHtml(itemTitle)}</h3>
            <p class="text-sm text-on-surface-variant">Chatting with ${escapeHtml(otherUserName)}</p>
        </div>
        
        <div id="chat-${chatRoomId}" class="flex-1 overflow-y-auto p-4 space-y-4">
            <div class="text-center py-8 text-on-surface-variant">
                <p>Loading messages...</p>
            </div>
        </div>
        
        <div class="border-t border-outline-variant/20 p-4 flex gap-2">
            <input 
                type="text" 
                id="message-${chatRoomId}" 
                placeholder="Type a message..."
                class="flex-1 bg-surface-container rounded-lg px-4 py-2 text-sm outline-none focus:border-primary"
            />
            <button 
                id="send-${chatRoomId}"
                class="bg-primary text-on-primary px-6 py-2 rounded-lg font-bold hover:scale-105 transition-transform"
            >
                <span class="material-symbols-outlined text-sm align-middle">send</span>
            </button>
        </div>
    `;
    
    // Setup send button
    const sendBtn = chatContainer.querySelector(`#send-${chatRoomId}`);
    const messageInput = chatContainer.querySelector(`#message-${chatRoomId}`);
    
    sendBtn.addEventListener('click', async () => {
        const messageText = messageInput.value;
        if (!messageText.trim()) return;
        
        try {
            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            await sendChatMessage(chatRoomId, currentUser.uid, currentUser.username, messageText);
            messageInput.value = '';
            messageInput.focus();
        } catch (error) {
            alert('Failed to send message: ' + error.message);
        }
    });
    
    // Enter key to send
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendBtn.click();
        }
    });
    
    return chatContainer;
}

// ========== UTILITY FUNCTIONS ==========

/**
 * Escape HTML special characters
 */
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

/**
 * Format timestamp for display
 */
export function formatChatTimestamp(timestamp) {
    const date = timestamp?.toDate?.() || new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const isYesterday = date.toDateString() === new Date(now - 86400000).toDateString();
    
    if (isToday) {
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else if (isYesterday) {
        return 'Yesterday';
    } else {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
}

// Export all functions
export {
    initChatModule,
    getOrCreateChatRoom,
    sendChatMessage,
    getChatHistory,
    listenToChatMessages,
    stopListeningToChat,
    getUserChats,
    renderChatMessages,
    createChatUI,
    formatChatTimestamp,
    escapeHtml
};
