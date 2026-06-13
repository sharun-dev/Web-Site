// ========== FIRESTORE INTEGRATION ==========

// Initialize Firestore connection
let firestoreDb = null;

async function initializeFirestore() {
    if (firestoreDb) return firestoreDb;

    try {
        const { getFirestore } = await import('https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js');
        firestoreDb = getFirestore();
        console.log('Firestore initialized');
        return firestoreDb;
    } catch (err) {
        console.warn('Firestore initialization failed:', err);
        return null;
    }
}

async function saveItemToFirestore(itemData) {
    try {
        const db = await initializeFirestore();
        if (!db) {
            console.warn('Firestore not available');
            return null;
        }

        const { collection, addDoc, serverTimestamp } = await import('https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js');

        const itemsRef = collection(db, 'created_items');
        const docRef = await addDoc(itemsRef, {
            ...itemData,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });

        console.log('Item saved to Firestore with ID:', docRef.id);
        return docRef.id;
    } catch (err) {
        console.error('Error saving to Firestore:', err);
        return null;
    }
}

async function loadItemsFromFirestore() {
    try {
        const db = await initializeFirestore();
        if (!db) return [];

        const { collection, getDocs, orderBy, query } = await import('https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js');

        const itemsRef = collection(db, 'created_items');
        const q = query(itemsRef, orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);

        const items = [];
        querySnapshot.forEach((doc) => {
            items.push({ id: doc.id, ...doc.data() });
        });

        console.log('Loaded items from Firestore:', items.length);
        return items;
    } catch (err) {
        console.error('Error loading from Firestore:', err);
        return [];
    }
}

// ========== SHARED TALENTRADE MARKETPLACE FUNCTIONALITY ==========

// Global namespace
const TalentTrade = {
    // User Authentication
    auth: {
        isLoggedIn() {
            return !!localStorage.getItem('talenttradeCurrentUser');
        },

        getCurrentUser() {
            const user = localStorage.getItem('talenttradeCurrentUser');
            return user ? JSON.parse(user) : null;
        },

        logout() {
            localStorage.removeItem('talenttradeCurrentUser');
            window.location.href = 'login.html';
        },

        hasUserEmail(email) {
            const users = JSON.parse(localStorage.getItem('talenttradeUsers')) || [];
            return users.some(u => u.email === email);
        },

        hasUsername(username) {
            const users = JSON.parse(localStorage.getItem('talenttradeUsers')) || [];
            return users.some(u => u.username === username);
        }
    },

    // Product Management
    products: {
        getAll() {
            return JSON.parse(localStorage.getItem('talenttradeProducts')) || this.getDefaults();
        },

        getDefaults() {
            return [
                {
                    id: 'f1',
                    title: 'Model Render Kit',
                    category: 'Tech',
                    creator: 'RenderLab',
                    price: 49,
                    type: 'Sell',
                    badge: 'For Sale',
                    rating: 5,
                    reviewsCount: 15,
                    description: 'High-quality 3D model bundle ready for architectural visualization, gaming environments, and virtual production pipelines. Optimized topology with 4K PBR textures.',
                    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80',
                    reviews: [
                        { author: "Alex M.", rating: 5, text: "Extremely crisp models. Saved me days of production work!" },
                        { author: "Sara T.", rating: 4, text: "Good layout, clean loops. Highly recommended." }
                    ]
                },
                {
                    id: 'f2',
                    title: 'Fashion Model Photoshoot',
                    category: 'Art',
                    creator: 'PosePerfect',
                    price: 220,
                    type: 'Sell',
                    badge: 'For Sale',
                    rating: 4,
                    reviewsCount: 12,
                    description: 'Editorial high-fashion creative direction and model photography session for model portfolio builders and independent apparel brand campaigns.',
                    image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80',
                    reviews: [
                        { author: "Devon K.", rating: 4, text: "Amazing direction on-set. Pictures came back phenomenal." }
                    ]
                },
                {
                    id: 'f3',
                    title: 'AI Voice Model Subscription',
                    category: 'Music',
                    creator: 'SynthSpeaker',
                    price: 18,
                    type: 'Rent',
                    badge: 'For Rent',
                    rating: 4,
                    reviewsCount: 29,
                    description: 'Monthly commercial license access to a premium trained synthetic AI voice model database ideal for seamless text-to-speech audiobooks, multi-character narration, and audio designs.',
                    image: 'https://images.unsplash.com/photo-1511820752961-65c73dff5e71?auto=format&fit=crop&w=900&q=80',
                    reviews: [
                        { author: "Lofi Beats Co.", rating: 5, text: "The timbre modulation is incredibly natural sounding." }
                    ]
                },
                {
                    id: 'f4',
                    title: 'Handmade Ceramic Mug Set',
                    category: 'Art',
                    creator: 'ClayCanvas',
                    price: 35,
                    type: 'Sell',
                    badge: 'For Sale',
                    rating: 5,
                    reviewsCount: 27,
                    description: 'Stoneware mug set with hand-painted glaze and matte finish. Perfect for coffee lovers and cozy gifting. Each piece is unique with artisan charm.',
                    image: 'https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=900&q=80',
                    reviews: [
                        { author: "Mia R.", rating: 5, text: "Beautiful set and feels so solid. My morning coffee tastes better." }
                    ]
                },
                {
                    id: 'f5',
                    title: 'Leather Travel Journal',
                    category: 'Art',
                    creator: 'BoundStories',
                    price: 42,
                    type: 'Sell',
                    badge: 'For Sale',
                    rating: 4,
                    reviewsCount: 18,
                    description: 'Handcrafted leather journal with refillable pages, embossed cover, and brass clasp. Ideal for writers, travelers, and sketchbook lovers.',
                    image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=900&q=80',
                    reviews: [
                        { author: "Oliver P.", rating: 4, text: "Great quality leather and lovely detail work." }
                    ]
                },
                {
                    id: 'f6',
                    title: 'Vintage HotWheels Collector Pack',
                    category: 'HotWheels',
                    creator: 'RetroRides',
                    price: 78,
                    type: 'Sell',
                    badge: 'For Sale',
                    rating: 5,
                    reviewsCount: 33,
                    description: 'Limited edition vintage HotWheels set featuring rare racing cars and classic packaging. Perfect collectible for enthusiasts and display collections.',
                    image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=900&q=80',
                    reviews: [
                        { author: "Chris J.", rating: 5, text: "Excellent condition and arrived fast. My collection is complete now." }
                    ]
                },
                {
                    id: 'f7',
                    title: 'Custom Synth Sample Pack',
                    category: 'Music',
                    creator: 'BeatSmith',
                    price: 24,
                    type: 'Sell',
                    badge: 'For Sale',
                    rating: 5,
                    reviewsCount: 42,
                    description: 'Exclusive custom modular synth analog wav loops, punchy 808 sub-basses, crisp snare stems, and processed Serum presets formatted for immediate drag-and-drop workflow compatibility.',
                    image: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=900&q=80',
                    reviews: [
                        { author: "HyperPop Producer", rating: 5, text: "Pure fire textures. Buying everything this creator uploads." }
                    ]
                },
                {
                    id: 'f8',
                    title: 'Minimal Tech Desk Lamp',
                    category: 'Tech',
                    creator: 'GlowForge',
                    price: 65,
                    type: 'Sell',
                    badge: 'For Sale',
                    rating: 4,
                    reviewsCount: 21,
                    description: 'Adjustable LED desk lamp with wireless charging base and warm-to-cool light modes. Designed for productivity and modern workspaces.',
                    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=900&q=80',
                    reviews: [
                        { author: "Nina K.", rating: 5, text: "Love the charger built into the base. Perfect for my home office." }
                    ]
                },
                {
                    id: 'f9',
                    title: 'Vintage Style Bluetooth Speaker',
                    category: 'Tech',
                    creator: 'RetroSound',
                    price: 89,
                    type: 'Sell',
                    badge: 'For Sale',
                    rating: 4,
                    reviewsCount: 26,
                    description: 'Compact portable speaker with retro wooden finish, Bluetooth connectivity, and deep bass. Great for creative studios and cozy listening rooms.',
                    image: 'https://images.unsplash.com/photo-1517059224940-d4af9eec41e5?auto=format&fit=crop&w=900&q=80',
                    reviews: [
                        { author: "Sam W.", rating: 4, text: "Fun design and solid sound quality for the size." }
                    ]
                },
                {
                    id: 'f10',
                    title: 'Hand-stitched Leather Laptop Sleeve',
                    category: 'Gear',
                    creator: 'CarryCreative',
                    price: 54,
                    type: 'Sell',
                    badge: 'For Sale',
                    rating: 5,
                    reviewsCount: 37,
                    description: 'Premium leather sleeve with soft felt lining and hand-stitched seams. Fits most 13- to 15-inch laptops and tablets with secure snap closure.',
                    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=900&q=80',
                    reviews: [
                        { author: "Taylor V.", rating: 5, text: "Beautiful craftsmanship and extremely durable." }
                    ]
                },
                {
                    id: 'f11',
                    title: 'Eco-Friendly Yoga Mat',
                    category: 'Gear',
                    creator: 'ZenFlow',
                    price: 32,
                    type: 'Rent',
                    badge: 'For Rent',
                    rating: 4,
                    reviewsCount: 14,
                    description: 'Non-slip natural rubber yoga mat with extra cushioning and sustainable materials. Ideal for studio classes and at-home practice.',
                    image: 'https://images.unsplash.com/photo-1518611012118-f0a8c8ef64e0?auto=format&fit=crop&w=900&q=80',
                    reviews: [
                        { author: "Emma S.", rating: 4, text: "Great grip and very comfortable to practice on." }
                    ]
                },
                {
                    id: 'f12',
                    title: 'Boho Macramé Wall Hanging',
                    category: 'Art',
                    creator: 'ThreadedDreams',
                    price: 55,
                    type: 'Sell',
                    badge: 'For Sale',
                    rating: 5,
                    reviewsCount: 22,
                    description: 'Hand-knotted boho-inspired macramé wall hanging made from organic cotton. Adds texture and warmth to any living room or creative studio.',
                    image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80',
                    reviews: [
                        { author: "Lena W.", rating: 5, text: "Beautiful craftsmanship and perfect for my apartment wall." }
                    ]
                },
                {
                    id: 'f13',
                    title: 'Custom HotWheels Decal Set',
                    category: 'HotWheels',
                    creator: 'TinyTorque',
                    price: 18,
                    type: 'Sell',
                    badge: 'For Sale',
                    rating: 4,
                    reviewsCount: 9,
                    description: 'Personalized vinyl decal set for HotWheels collectors. Includes racing stripes, sponsor logos, and custom nameplates.',
                    image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=900&q=80',
                    reviews: [
                        { author: "Jake H.", rating: 4, text: "Decals were crisp and fit my models perfectly." }
                    ]
                },
                {
                    id: 'f14',
                    title: 'Studio VST Preset Bundle',
                    category: 'Music',
                    creator: 'WaveCraft',
                    price: 39,
                    type: 'Sell',
                    badge: 'For Sale',
                    rating: 5,
                    reviewsCount: 31,
                    description: 'Curated VST preset collection for synths, pads, basses, and leads. Designed for modern pop, EDM, and cinematic sound design.',
                    image: 'https://images.unsplash.com/photo-1511376777868-611b54f68947?auto=format&fit=crop&w=900&q=80',
                    reviews: [
                        { author: "DJ Aura", rating: 5, text: "These presets transformed my mix instantly." }
                    ]
                },
                {
                    id: 'f15',
                    title: 'Wireless Mechanical Keyboard',
                    category: 'Tech',
                    creator: 'KeyCrafted',
                    price: 120,
                    type: 'Sell',
                    badge: 'For Sale',
                    rating: 4,
                    reviewsCount: 28,
                    description: 'Compact wireless mechanical keyboard with RGB lighting and hot-swappable switches. Built for creators, coders, and gamers who want premium feel.',
                    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=900&q=80',
                    reviews: [
                        { author: "Ana P.", rating: 5, text: "So satisfying to type on, and the wireless range is excellent." }
                    ]
                },
                {
                    id: 'f16',
                    title: 'Vintage Film Camera Bundle',
                    category: 'Gear',
                    creator: 'AnalogLens',
                    price: 140,
                    type: 'Sell',
                    badge: 'For Sale',
                    rating: 5,
                    reviewsCount: 19,
                    description: 'Curated vintage film camera bundle with lenses, light meter, and leather case. Perfect for collectors and analog photography enthusiasts.',
                    image: 'https://images.unsplash.com/photo-1519183071298-a2962be66bd3?auto=format&fit=crop&w=900&q=80',
                    reviews: [
                        { author: "Noah F.", rating: 5, text: "Great condition and a beautiful finish. Love the nostalgia." }
                    ]
                },
                {
                    id: 'f17',
                    title: 'Personalized Digital Portrait',
                    category: 'Art',
                    creator: 'PixelMuse',
                    price: 85,
                    type: 'Sell',
                    badge: 'For Sale',
                    rating: 5,
                    reviewsCount: 23,
                    description: 'Custom digital portrait illustration delivered as a high-resolution print-ready file. Great for gifts, avatars, and creative branding.',
                    image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80',
                    reviews: [
                        { author: "Carly J.", rating: 5, text: "The portrait was more beautiful than expected. Excellent service." }
                    ]
                },
                {
                    id: 'f18',
                    title: '3D Printed Drone Parts Kit',
                    category: 'Tech',
                    creator: 'FlightForge',
                    price: 68,
                    type: 'Sell',
                    badge: 'For Sale',
                    rating: 4,
                    reviewsCount: 17,
                    description: 'Durable 3D printed replacement parts kit for custom racing drones. Includes prop guards, arm mounts, and camera mounts.',
                    image: 'https://images.unsplash.com/photo-1496307653780-42ee777d4833?auto=format&fit=crop&w=900&q=80',
                    reviews: [
                        { author: "Mason L.", rating: 4, text: "Parts are accurate and saved me from ordering a full replacement." }
                    ]
                }
            ];
        },

        addProduct(product) {
            const products = this.getAll();
            product.id = 'product-' + Date.now();
            products.unshift(product);
            localStorage.setItem('talenttradeProducts', JSON.stringify(products));
            return product;
        },

        getById(id) {
            return this.getAll().find(p => p.id === id);
        },

        getByCategory(category) {
            if (category.toLowerCase() === 'all') {
                return this.getAll();
            }
            return this.getAll().filter(p => p.category === category);
        },

        search(query) {
            const products = this.getAll();
            const lowerQuery = query.toLowerCase();
            return products.filter(p => 
                p.title.toLowerCase().includes(lowerQuery) ||
                p.description.toLowerCase().includes(lowerQuery) ||
                p.category.toLowerCase().includes(lowerQuery)
            );
        }
    },

    // Shopping Cart (user-scoped)
    cart: {
        getCartKey() {
            const user = TalentTrade.auth.getCurrentUser();
            if (user && (user.id || user.uid)) return `talenttradeCart_${user.id || user.uid}`;
            return 'talenttradeCart';
        },

        // Migrate legacy global cart into a user's cart on login
        migrateLegacyCartToUser() {
            const user = TalentTrade.auth.getCurrentUser();
            if (!user) return;
            const legacyKey = 'talenttradeCart';
            const legacy = JSON.parse(localStorage.getItem(legacyKey) || '[]');
            const targetKey = this.getCartKey();
            const existing = JSON.parse(localStorage.getItem(targetKey) || '[]');
            if (legacy.length && !existing.length) {
                localStorage.setItem(targetKey, JSON.stringify(legacy));
                // mirror into talenttradeUsers if present
                const users = JSON.parse(localStorage.getItem('talenttradeUsers') || '[]');
                const idx = users.findIndex(u => u.id === (user.id || user.uid));
                if (idx !== -1) {
                    users[idx].cart = legacy;
                    localStorage.setItem('talenttradeUsers', JSON.stringify(users));
                }
                localStorage.removeItem(legacyKey);
            }
        },

        getItems() {
            const key = this.getCartKey();
            return JSON.parse(localStorage.getItem(key) || '[]');
        },

        saveItems(items) {
            const key = this.getCartKey();
            localStorage.setItem(key, JSON.stringify(items));
            // mirror into user's record if available
            const user = TalentTrade.auth.getCurrentUser();
            if (user) {
                const users = JSON.parse(localStorage.getItem('talenttradeUsers') || '[]');
                const idx = users.findIndex(u => u.id === (user.id || user.uid));
                if (idx !== -1) {
                    users[idx].cart = items;
                    localStorage.setItem('talenttradeUsers', JSON.stringify(users));
                }
            }
        },

        addItem(productId) {
            const product = TalentTrade.products.getById(productId);
            if (!product) return null;

            const cartItems = this.getItems();
            const existing = cartItems.find(item => item.id === productId);
            if (existing) {
                existing.quantity += 1;
            } else {
                cartItems.push({
                    id: product.id,
                    title: product.title,
                    price: product.price,
                    image: product.image,
                    quantity: 1
                });
            }
            this.saveItems(cartItems);
            return cartItems;
        },

        removeItem(productId) {
            const cartItems = this.getItems().filter(item => item.id !== productId);
            this.saveItems(cartItems);
            return cartItems;
        },

        clear() {
            const key = this.getCartKey();
            localStorage.removeItem(key);
            const user = TalentTrade.auth.getCurrentUser();
            if (user) {
                const users = JSON.parse(localStorage.getItem('talenttradeUsers') || '[]');
                const idx = users.findIndex(u => u.id === (user.id || user.uid));
                if (idx !== -1) {
                    users[idx].cart = [];
                    localStorage.setItem('talenttradeUsers', JSON.stringify(users));
                }
            }
            return [];
        },

        getTotalCount() {
            return this.getItems().reduce((sum, item) => sum + item.quantity, 0);
        },

        getTotalPrice() {
            return this.getItems().reduce((sum, item) => sum + item.price * item.quantity, 0);
        }
    },

    // Messaging
    messages: {
        sendMessage(from, to, subject, text) {
            const messages = JSON.parse(localStorage.getItem('talenttradeMessages')) || [];
            messages.push({
                id: 'msg-' + Date.now(),
                from: from,
                to: to,
                subject: subject,
                text: text,
                timestamp: new Date().toISOString(),
                read: false
            });
            localStorage.setItem('talenttradeMessages', JSON.stringify(messages));
        },

        getForUser(userId) {
            const messages = JSON.parse(localStorage.getItem('talenttradeMessages')) || [];
            return messages.filter(m => m.to === userId || m.from === userId);
        },

        getUnreadCount(userId) {
            const messages = JSON.parse(localStorage.getItem('talenttradeMessages')) || [];
            return messages.filter(m => m.to === userId && !m.read).length;
        }
    },

    // Orders
    orders: {
        getAll() {
            return JSON.parse(localStorage.getItem('talenttradeOrders')) || [];
        },

        saveAll(orders) {
            localStorage.setItem('talenttradeOrders', JSON.stringify(orders));
            return orders;
        },

        saveOrder(order) {
            const orders = this.getAll();
            orders.push(order);
            this.saveAll(orders);
            this.linkOrderToSeller(order);
            return order;
        },

        getForSeller(sellerId) {
            return this.getAll().filter(order => order.sellerId === sellerId);
        },

        getForBuyer(buyerId) {
            return this.getAll().filter(order => order.buyerId === buyerId);
        },

        linkOrderToSeller(order) {
            if (!order.sellerId) return;
            const users = JSON.parse(localStorage.getItem('talenttradeUsers')) || [];
            const idx = users.findIndex(u => u.id === order.sellerId || u.uid === order.sellerId);
            if (idx === -1) return;

            users[idx].orders = users[idx].orders || [];
            users[idx].orders.push(order);

            if (users[idx].listings) {
                const listing = users[idx].listings.find(item => item.id === order.productId);
                if (listing) {
                    listing.status = 'sold';
                    listing.purchaseDate = order.createdAt;
                    listing.paymentDetails = {
                        buyerName: order.buyerName,
                        upiId: order.upiId,
                        upiNotes: order.upiNotes,
                        address: order.address,
                        pincode: order.pincode,
                        orderId: order.id
                    };
                }
            }

            localStorage.setItem('talenttradeUsers', JSON.stringify(users));

            const products = TalentTrade.products.getAll();
            const product = products.find(p => p.id === order.productId);
            if (product) {
                product.status = 'sold';
                product.purchaseDate = order.createdAt;
                product.paymentDetails = {
                    buyerName: order.buyerName,
                    upiId: order.upiId,
                    upiNotes: order.upiNotes,
                    address: order.address,
                    pincode: order.pincode,
                    orderId: order.id
                };
                localStorage.setItem('talenttradeProducts', JSON.stringify(products));
            }
        }
    },

    // Utilities
    utils: {
        formatPrice(price) {
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD'
            }).format(price);
        },

        formatDate(dateString) {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        },

        generateStars(rating) {
            const filled = '★'.repeat(Math.floor(rating));
            const empty = '☆'.repeat(5 - Math.floor(rating));
            return filled + empty;
        },

        showNotification(message, type = 'info') {
            const notification = document.createElement('div');
            notification.className = `notification notification-${type}`;
            notification.textContent = message;
            document.body.appendChild(notification);
            setTimeout(() => {
                notification.classList.add('notification-exit');
                setTimeout(() => notification.remove(), 300);
            }, 3000);
        }
    }
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    initializeMarketplace();
    updateNavigationUI();
});

// attempt cart migration when auth state changes / on load
document.addEventListener('DOMContentLoaded', function() {
    try {
        TalentTrade.cart.migrateLegacyCartToUser();
    } catch (e) {
        console.warn('Cart migration skipped:', e);
    }
});

// Inline SVG placeholder generator to avoid external network calls
function placeholderDataUrl(w = 600, h = 420, text = 'No Image') {
    const fontSize = Math.max(12, Math.floor(w / 20));
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><rect width="100%" height="100%" fill="#0b1326"/><text x="50%" y="50%" fill="#cbd5e1" font-family="Arial, Helvetica, sans-serif" font-size="${fontSize}" text-anchor="middle" dominant-baseline="middle">${text}</text></svg>`;
    return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

// Add float animation class to hero card for subtle motion
document.addEventListener('DOMContentLoaded', function() {
    const hero = document.getElementById('featuredCard') || document.querySelector('.hero-card');
    if (hero) {
        hero.classList.add('is-animated');
    }
});

// Initialize marketplace products on first load
function initializeMarketplace() {
    if (!localStorage.getItem('talenttradeProducts')) {
        localStorage.setItem('talenttradeProducts', JSON.stringify(TalentTrade.products.getDefaults()));
    }
    
    if (!localStorage.getItem('talenttradeUsers')) {
        localStorage.setItem('talenttradeUsers', JSON.stringify([]));
    }
}

// Update navigation based on login status
function updateNavigationUI() {
    const isLoggedIn = TalentTrade.auth.isLoggedIn();
    const loginNavBtn = document.getElementById('loginNavBtn');
    const registerNavBtn = document.getElementById('registerNavBtn');
    const dashboardNavBtn = document.getElementById('dashboardNavBtn');
    const logoutNavBtn = document.getElementById('logoutNavBtn');
    const authCardsSection = document.getElementById('authCardsSection');

    if (isLoggedIn) {
        if (loginNavBtn) loginNavBtn.classList.add('hidden');
        if (registerNavBtn) registerNavBtn.classList.add('hidden');
        if (dashboardNavBtn) dashboardNavBtn.classList.remove('hidden');
        if (logoutNavBtn) logoutNavBtn.classList.remove('hidden');
        if (authCardsSection) authCardsSection.classList.add('hidden');

        if (dashboardNavBtn) {
            dashboardNavBtn.addEventListener('click', function(e) {
                e.preventDefault();
                window.location.href = 'dashboard.html';
            });
        }

        if (logoutNavBtn) {
            logoutNavBtn.addEventListener('click', function(e) {
                e.preventDefault();
                if (confirm('Are you sure you want to logout?')) {
                    TalentTrade.auth.logout();
                }
            });
        }
    } else {
        if (loginNavBtn) loginNavBtn.classList.remove('hidden');
        if (registerNavBtn) registerNavBtn.classList.remove('hidden');
        if (dashboardNavBtn) dashboardNavBtn.classList.add('hidden');
        if (logoutNavBtn) logoutNavBtn.classList.add('hidden');
        if (authCardsSection) authCardsSection.classList.remove('hidden');
    }
}

// Marketplace page specific functions
if (document.getElementById('productGrid')) {
    const initMarketplace = function() {
        let activeCategoryFilter = 'all';
        let historyStack = ['home'];
        let currentDetailProductId = null;

        function updateCartCount() {
            const countEl = document.getElementById('cartCount');
            if (countEl) {
                countEl.textContent = TalentTrade.cart.getTotalCount();
            }
        }

        function renderCartDrawer() {
            const drawerBody = document.getElementById('cartDrawerBody');
            if (!drawerBody) return;

            const cartItems = TalentTrade.cart.getItems();
            if (!cartItems.length) {
                drawerBody.innerHTML = '<p class="text-on-surface-variant">Your cart is empty.</p>';
                return;
            }

            drawerBody.innerHTML = cartItems.map(item => {
                const img = item.image || item.imageUrl || placeholderDataUrl(120, 120, 'No Image');
                return `
                <div class="cart-item">
                    <img src="${img}" alt="${item.title}" />
                    <div class="cart-item-info">
                        <p class="font-bold text-on-surface">${item.title}</p>
                        <div class="cart-item-meta">
                            <span>${item.quantity} × $${item.price}</span>
                            <button class="cart-remove-btn" data-remove-id="${item.id}">Remove</button>
                        </div>
                    </div>
                </div>
            `}).join('');

            drawerBody.innerHTML += `
                <div class="cart-item-meta" style="margin-top: 1rem; font-weight: 700; color: #f8fafc;">
                    <span>Total</span>
                    <span>$${TalentTrade.cart.getTotalPrice().toFixed(2)}</span>
                </div>
            `;
        }

        function openCartDrawer() {
            const drawer = document.getElementById('cartDrawer');
            if (!drawer) return;
            renderCartDrawer();
            drawer.classList.add('open');
            updateCartCount();
        }

        function closeCartDrawer() {
            const drawer = document.getElementById('cartDrawer');
            if (!drawer) return;
            drawer.classList.remove('open');
        }

        function addToCart(productId) {
            const cartItems = TalentTrade.cart.addItem(productId);
            updateCartCount();
            if (cartItems) {
                window.location.href = 'cart.html';
            }
            return cartItems;
        }

        function navigateToCheckout(productId) {
            if (!productId) {
                alert('No product selected for checkout.');
                return;
            }
            const checkoutUrl = `checkout.html?productId=${encodeURIComponent(productId)}`;
            if (TalentTrade.auth.isLoggedIn()) {
                window.location.href = checkoutUrl;
            } else {
                window.location.href = `login.html?redirect=${encodeURIComponent(checkoutUrl)}`;
            }
        }

        // If arriving with a section hash, show that section on load
        const initialHash = window.location.hash.slice(1).trim();
        if (initialHash && ['home', 'browse', 'upload', 'detail'].includes(initialHash)) {
            switchSection(initialHash, false);
        }

        // Navigation controller
        function switchSection(sectionId, trackHistory = true) {
            // Centralized section toggling for the Tailwind layout
            const actions = {
                home() {
                    document.querySelector('header')?.classList.remove('hidden');
                    document.getElementById('listingsSection')?.classList.remove('hidden');
                    document.getElementById('featuredCategoriesSection')?.classList.remove('hidden');
                    document.getElementById('termsSection')?.classList.add('hidden');
                    document.getElementById('browseSection')?.classList.add('hidden');
                    document.getElementById('uploadSection')?.classList.add('hidden');
                    document.getElementById('detailSection')?.classList.add('hidden');
                },
                browse() {
                    document.querySelector('header')?.classList.add('hidden');
                    document.getElementById('listingsSection')?.classList.add('hidden');
                    document.getElementById('featuredCategoriesSection')?.classList.add('hidden');
                    document.getElementById('termsSection')?.classList.add('hidden');
                    document.getElementById('browseSection')?.classList.remove('hidden');
                    document.getElementById('uploadSection')?.classList.add('hidden');
                    document.getElementById('detailSection')?.classList.add('hidden');
                },
                upload() {
                    document.querySelector('header')?.classList.add('hidden');
                    document.getElementById('listingsSection')?.classList.add('hidden');
                    document.getElementById('featuredCategoriesSection')?.classList.add('hidden');
                    document.getElementById('termsSection')?.classList.add('hidden');
                    document.getElementById('browseSection')?.classList.add('hidden');
                    document.getElementById('uploadSection')?.classList.remove('hidden');
                    document.getElementById('detailSection')?.classList.add('hidden');
                },
                detail() {
                    document.querySelector('header')?.classList.add('hidden');
                    document.getElementById('listingsSection')?.classList.add('hidden');
                    document.getElementById('featuredCategoriesSection')?.classList.add('hidden');
                    document.getElementById('termsSection')?.classList.add('hidden');
                    document.getElementById('browseSection')?.classList.add('hidden');
                    document.getElementById('uploadSection')?.classList.add('hidden');
                    document.getElementById('detailSection')?.classList.remove('hidden');
                }
            };

            if (!actions[sectionId]) return;
            actions[sectionId]();

            // Update active state for the top navigation tabs only
            document.querySelectorAll('.top-nav-tabs .nav-link').forEach(link => {
                link.classList.toggle('active', link.dataset.section === sectionId);
            });
            updateTopTabIndicator();

            if (trackHistory && historyStack[historyStack.length - 1] !== sectionId) {
                historyStack.push(sectionId);
            }

            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        // Generate product card HTML
        function updateTopTabIndicator() {
            const indicator = document.querySelector('.top-nav-tabs .nav-tab-indicator');
            const activeLink = document.querySelector('.top-nav-tabs .nav-link.active');
            if (!indicator || !activeLink) return;

            indicator.style.width = `${activeLink.offsetWidth}px`;
            indicator.style.left = `${activeLink.offsetLeft}px`;
        }

        function generateProductCardHTML(item) {
            const starsFilled = '★'.repeat(Math.floor(item.rating));
            const starsEmpty = '☆'.repeat(5 - Math.floor(item.rating));
            const imgSrc = item.image || item.imageUrl || placeholderDataUrl(600, 420, 'No Image');
            return `
                <article class="glass-card rounded-2xl overflow-hidden cursor-pointer hover:scale-105 transition-transform product-card" data-id="${item.id}">
                    <div class="relative aspect-video overflow-hidden bg-surface-container">
                        <img src="${imgSrc}" alt="${item.title}" class="w-full h-full object-cover"/>
                        <div class="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold ${item.type === 'Rent' ? 'bg-secondary-container text-on-secondary-container' : 'bg-primary-container text-on-primary-container'}">${item.badge}</div>
                    </div>
                    <div class="p-4">
                        <h3 class="font-headline-sm text-headline-sm line-clamp-2 mb-2">${item.title}</h3>
                        <p class="text-sm text-on-surface-variant mb-2">By <strong>${item.creator}</strong></p>
                        <div class="flex justify-between items-center">
                            <span class="font-bold text-primary">$${item.price}</span>
                            <span class="text-xs text-on-surface-variant">${item.reviewsCount} reviews</span>
                        </div>
                        <div class="flex items-center mt-3 text-secondary">
                            <span class="text-sm">${starsFilled}${starsEmpty}</span>
                        </div>
                        <button type="button" class="w-full mt-4 bg-primary-container text-on-primary-container font-semibold rounded-xl py-3 add-to-cart-btn" data-product-id="${item.id}">Add to Cart</button>
                    </div>
                </article>
            `;
        }

        // Render marketplace grids
        function renderMarketplaceGrids() {
            console.debug('renderMarketplaceGrids: start');
            const productGrid = document.getElementById('productGrid');
            const browseGrid = document.getElementById('browseGrid');
            const allProducts = TalentTrade.products.getAll();

            if (productGrid) {
                productGrid.innerHTML = allProducts.map(item => generateProductCardHTML(item)).join('');
                console.debug('renderMarketplaceGrids: rendered', allProducts.length);
                // Debug: show count visibly for troubleshooting
                let dbg = document.getElementById('debug-render-count');
                if (!dbg) {
                    dbg = document.createElement('div');
                    dbg.id = 'debug-render-count';
                    dbg.style.cssText = 'position:fixed;right:12px;bottom:12px;background:#111;color:#fff;padding:8px 10px;border-radius:8px;z-index:99999;font-size:12px;opacity:0.9';
                    document.body.appendChild(dbg);
                }
                dbg.textContent = `Products rendered: ${allProducts.length}`;
            }

            if (browseGrid) {
                const filtered = allProducts.filter(item => 
                    activeCategoryFilter === 'all' || item.category === activeCategoryFilter
                );
                
                if (filtered.length === 0) {
                    browseGrid.innerHTML = `<p class="subtle-text empty-state">No active listings found in this category.</p>`;
                } else {
                    browseGrid.innerHTML = filtered.map(item => generateProductCardHTML(item)).join('');
                }
            }

            attachCardClickListeners();
        }

        // Show product detail
        function showProductDetailView(productId) {
            const allProducts = TalentTrade.products.getAll();
            const targetProduct = allProducts.find(p => p.id === productId);
            if (!targetProduct) return;

            currentDetailProductId = productId;

            const detailImage = document.getElementById('detailImage');
            const detailImgSrc = targetProduct.image || targetProduct.imageUrl || placeholderDataUrl(900, 600, 'No Image');
            if (detailImage) detailImage.src = detailImgSrc;
            detailImage.alt = targetProduct.title;
            document.getElementById('detailTitle').textContent = targetProduct.title;
            document.getElementById('detailTag').textContent = targetProduct.badge;
            const tagEl = document.getElementById('detailTag');
            tagEl.className = `${targetProduct.type === 'Rent' ? 'bg-secondary-container text-on-secondary-container' : 'bg-primary-container text-on-primary-container'} font-label-md text-xs px-3 py-1 rounded-full uppercase tracking-wider inline-block`;
            document.getElementById('detailCategory').textContent = `${targetProduct.category} • By ${targetProduct.creator}`;
            document.getElementById('detailPrice').textContent = `$${targetProduct.price}`;
            document.getElementById('detailDescription').textContent = targetProduct.description;

            document.getElementById('buyNowBtn').textContent = targetProduct.type === 'Rent' ? 'Rent Now' : 'Buy Now';

            const reviewListContainer = document.getElementById('reviewList');
            if (reviewListContainer) {
                if (targetProduct.reviews && targetProduct.reviews.length > 0) {
                    reviewListContainer.innerHTML = targetProduct.reviews.map(rev => `
                        <div class="review-item">
                            <div class="review-header">
                                <strong>${rev.author}</strong>
                                <span class="review-stars">${'★'.repeat(rev.rating)}</span>
                            </div>
                            <p>"${rev.text}"</p>
                        </div>
                    `).join('');
                } else {
                    reviewListContainer.innerHTML = `<p class="subtle-text">No user reviews posted yet for this listing.</p>`;
                }
            }

            switchSection('detail');
        }

        // Attach click listeners to product cards
        function attachCardClickListeners() {
            document.querySelectorAll('.product-card').forEach(card => {
                card.addEventListener('click', function() {
                    const pid = this.dataset.id;
                    if (pid) showProductDetailView(pid);
                });
            });
        }

        // Navigation click handler
        document.body.addEventListener('click', function (event) {
            const cartButton = event.target.closest('.add-to-cart-btn');
            if (cartButton) {
                event.preventDefault();
                event.stopPropagation();
                const productId = cartButton.dataset.productId;
                if (productId) {
                    addToCart(productId);
                }
                return;
            }

            const cartFab = event.target.closest('#cartFab');
            if (cartFab) {
                event.preventDefault();
                window.location.href = 'cart.html';
                return;
            }

            const cartClose = event.target.closest('#cartCloseBtn');
            if (cartClose) {
                event.preventDefault();
                closeCartDrawer();
                return;
            }

            const cartRemove = event.target.closest('[data-remove-id]');
            if (cartRemove) {
                event.preventDefault();
                const productId = cartRemove.dataset.removeId;
                TalentTrade.cart.removeItem(productId);
                renderCartDrawer();
                updateCartCount();
                return;
            }

            const checkoutBtn = event.target.closest('#checkoutBtn');
            if (checkoutBtn) {
                event.preventDefault();
                alert('Checkout is not enabled yet. Your cart is saved locally.');
                return;
            }

            const targetBtn = event.target.closest('[data-section]');
            if (!targetBtn) return;
            
            const dest = targetBtn.dataset.section;
            if (dest) {
                event.preventDefault();
                switchSection(dest);
            }
        });

        // Brand click handler
        const brandLogo = document.getElementById('brandLogo');
        if (brandLogo) {
            brandLogo.addEventListener('click', () => switchSection('home'));
        }

        // Back button
        const backBtn = document.getElementById('backToBrowseBtn');
        if (backBtn) {
            backBtn.addEventListener('click', function() {
                if (historyStack.length > 1) {
                    historyStack.pop();
                        const prevSection = historyStack[historyStack.length - 1] || 'browse';
                        switchSection(prevSection, false);
                } else {
                    switchSection('browse');
                }
            });
        }


        // Hero pills
        document.querySelectorAll('.hero-pill').forEach(pill => {
            pill.addEventListener('click', function() {
                const cat = this.dataset.cat;
                activeCategoryFilter = cat;
                
                document.querySelectorAll('.category-btn').forEach(btn => {
                    btn.classList.toggle('active', btn.dataset.category === cat);
                });

                renderMarketplaceGrids();

                        // Category pills (featured categories in hero)
                        document.querySelectorAll('.category-pill').forEach(pill => {
                            pill.addEventListener('click', function() {
                                const cat = this.dataset.category;
                                activeCategoryFilter = cat;
                
                                document.querySelectorAll('.category-btn').forEach(btn => {
                                    btn.classList.toggle('active', btn.dataset.category === cat);
                                });

                                renderMarketplaceGrids();
                                switchSection('browse');
                            });
                        });
                switchSection('browse');
            });
        });

        // Category tabs
        document.querySelectorAll('.category-btn').forEach(button => {
            button.addEventListener('click', function() {
                document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                
                activeCategoryFilter = this.dataset.category;
                renderMarketplaceGrids();
            });
        });

        // Upload form
        const uploadForm = document.getElementById('uploadForm');
        if (uploadForm) {
            uploadForm.addEventListener('submit', async function(e) {
                e.preventDefault();

                const formData = new FormData(this);
                const title = formData.get('title');
                const category = formData.get('category');
                const description = formData.get('description');
                const price = parseFloat(formData.get('price')) || 0;
                const type = formData.get('type');
                const customImg = formData.get('imageUrl');
                const currentUser = TalentTrade.auth.getCurrentUser();

                const defaultImages = {
                    'Art': 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80',
                    'Tech': 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80',
                    'Music': 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=900&q=80',
                    'HotWheels': 'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&w=900&q=80',
                    'Gear': 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=900&q=80'
                };

                const upiId = formData.get('upiId')?.trim() || '';

                const newListing = {
                    title: title,
                    category: category,
                    creator: currentUser?.username || currentUser?.email || 'Current User',
                    creatorId: currentUser?.id || currentUser?.uid || null,
                    userId: currentUser?.uid || currentUser?.id || 'anonymous',
                    price: price,
                    type: type,
                    badge: type === 'Rent' ? 'For Rent' : 'For Sale',
                    rating: 5,
                    reviewsCount: 0,
                    description: description,
                    image: customImg && customImg.trim() !== "" ? customImg : (defaultImages[category] || placeholderDataUrl(600,420,'Marketplace Upload')),
                    upiId: upiId,
                    reviews: [],
                    status: 'active'
                };

                // Save to localStorage
                const localProduct = TalentTrade.products.addProduct(newListing);
                console.log('Saved to marketplace products:', localProduct.id);

                // ALSO add to user's listings in dashboard
                if (currentUser) {
                    const users = JSON.parse(localStorage.getItem('talenttradeUsers')) || [];
                    const userId = currentUser.id || currentUser.uid;
                    const userIndex = users.findIndex(u => u.id === userId);

                    if (userIndex !== -1) {
                        if (!users[userIndex].listings) {
                            users[userIndex].listings = [];
                        }

                        const userListing = {
                            ...newListing,
                            id: localProduct.id
                        };

                        users[userIndex].listings.push(userListing);
                        localStorage.setItem('talenttradeUsers', JSON.stringify(users));
                        console.log('Added to user listings in dashboard');
                    }
                }

                // Save to Firestore (async, don't wait)
                saveItemToFirestore(newListing).then(firestoreId => {
                    if (firestoreId) {
                        console.log('✓ Item saved to Firestore:', firestoreId);
                    } else {
                        console.warn('⚠ Firestore save failed, but item saved locally');
                    }
                });

                this.reset();
                renderMarketplaceGrids();
                alert(`Success! "${title}" has been added to the marketplace.\n\nIt will appear on the home page and in your dashboard.`);
                switchSection('home');
            });
        }

        function openChatCreator() {
            if (!currentDetailProductId) return;
            const product = TalentTrade.products.getById(currentDetailProductId);
            if (!product) return;

            const currentUser = TalentTrade.auth.getCurrentUser();
            const userId = currentUser?.uid || currentUser?.id || currentUser?.email || `guest-${Date.now()}`;
            const userName = currentUser?.username || currentUser?.fullName || currentUser?.email || 'Buyer';
            const chatContext = {
                creator: product.creator || 'Creator',
                creatorId: product.creatorId || null,
                userId,
                userName,
                chatRoomId: `chat-${product.id}`,
                listing: {
                    id: product.id,
                    title: product.title,
                    category: product.category,
                    price: product.price,
                    type: product.type,
                    description: product.description,
                    imageUrl: product.image || product.imageUrl || '',
                    status: product.status || 'active',
                    creator: product.creator,
                    creatorId: product.creatorId || null
                }
            };

            sessionStorage.setItem('chatContext', JSON.stringify(chatContext));
            window.location.href = 'chatin.html';
        }

        // Event handlers
        const buyNowBtn = document.getElementById('buyNowBtn');
        if (buyNowBtn) {
            buyNowBtn.addEventListener('click', () => {
                if (!currentDetailProductId) {
                    alert('Please select an item before checkout.');
                    return;
                }
                navigateToCheckout(currentDetailProductId);
            });
        }

        const addToCartDetailsBtn = document.getElementById('addToCartBtn');
        if (addToCartDetailsBtn) {
            addToCartDetailsBtn.addEventListener('click', () => {
                if (currentDetailProductId) {
                    addToCart(currentDetailProductId);
                }
            });
        }

        const msgCreatorBtn = document.getElementById('msgCreatorBtn');
        if (msgCreatorBtn) {
            msgCreatorBtn.addEventListener('click', () => {
                openChatCreator();
            });
        }

        const chatBtn = document.getElementById('chatBtn');
        if (chatBtn) {
            chatBtn.addEventListener('click', () => {
                openChatCreator();
            });
        }

        const searchBtn = document.getElementById('searchBtn');
        if (searchBtn) {
            searchBtn.addEventListener('click', function() {
                const query = document.getElementById('searchInput').value;
                if (query.trim()) {
                    const browseGrid = document.getElementById('browseGrid');
                    const allProducts = TalentTrade.products.getAll();
                    const filtered = allProducts.filter(item =>
                        item.title.toLowerCase().includes(query.toLowerCase()) ||
                        item.description.toLowerCase().includes(query.toLowerCase()) ||
                        item.category.toLowerCase().includes(query.toLowerCase())
                    );

                    if (browseGrid) {
                        if (filtered.length === 0) {
                            browseGrid.innerHTML = `<p class="subtle-text empty-state">No products found matching "${query}"</p>`;
                        } else {
                            browseGrid.innerHTML = filtered.map(item => generateProductCardHTML(item)).join('');
                            attachCardClickListeners();
                        }
                    }

                    activeCategoryFilter = 'all';
                    switchSection('browse');
                }
            });
        }

        const termsLink = document.getElementById('termsLink');
        const privacyLink = document.getElementById('privacyLink');
        const termsSection = document.getElementById('termsSection');
        const termsCloseBtn = document.getElementById('termsCloseBtn');

        function showTermsPanel() {
            if (termsSection) {
                termsSection.classList.remove('hidden');
                termsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }

        if (termsLink) {
            termsLink.addEventListener('click', function(e) {
                e.preventDefault();
                showTermsPanel();
            });
        }

        if (privacyLink) {
            privacyLink.addEventListener('click', function(e) {
                e.preventDefault();
                showTermsPanel();
            });
        }

        if (termsCloseBtn) {
            termsCloseBtn.addEventListener('click', function() {
                if (termsSection) {
                    termsSection.classList.add('hidden');
                }
            });
        }

        // Initialize
        renderMarketplaceGrids();
        updateCartCount();
        updateTopTabIndicator();
    };

    if (document.readyState !== 'loading') {
        initMarketplace();
    } else {
        document.addEventListener('DOMContentLoaded', initMarketplace);
    }

    window.addEventListener('resize', function() {
        if (typeof updateTopTabIndicator === 'function') {
            updateTopTabIndicator();
        }
    });

    // ===== Cloudinary Upload (Direct Upload) ======
    const cloudinaryUploadBtn = document.getElementById('cloudinaryUploadBtn');
    const cloudinaryImageUrl = document.getElementById('cloudinaryImageUrl');
    const cloudinaryFileName = document.getElementById('cloudinaryFileName');
    const previewContainer = document.getElementById('previewContainer');

    if (cloudinaryUploadBtn) {
        // Create a hidden file input for better UX
        const hiddenFileInput = document.createElement('input');
        hiddenFileInput.type = 'file';
        hiddenFileInput.accept = 'image/jpeg,image/png,image/gif,image/webp';
        hiddenFileInput.style.display = 'none';
        document.body.appendChild(hiddenFileInput);

        cloudinaryUploadBtn.addEventListener('click', function(e) {
            e.preventDefault();
            hiddenFileInput.click();
        });

        hiddenFileInput.addEventListener('change', async function(e) {
            const file = e.target.files[0];
            if (!file) return;

            // Validate file size
            if (file.size > 5 * 1024 * 1024) {
                cloudinaryFileName.textContent = '❌ Error: File size exceeds 5MB limit';
                cloudinaryFileName.style.color = '#ffb4ab';
                return;
            }

            cloudinaryFileName.textContent = '⏳ Uploading...';
            cloudinaryFileName.style.color = '#cbd5e1';

            try {
                const cloudinaryConfig = window.TALENTRADE_CLOUDINARY_CONFIG || {
                    uploadPreset: 'unsigned_talenttrade',
                    uploadUrl: 'https://api.cloudinary.com/v1_1/dkz5wmhge/image/upload'
                };
                const formData = new FormData();
                formData.append('file', file);
                formData.append('upload_preset', cloudinaryConfig.uploadPreset);
                formData.append('folder', 'talenttrade/listings');

                const response = await fetch(cloudinaryConfig.uploadUrl, {
                    method: 'POST',
                    body: formData
                });

                const data = await response.json();
                if (!response.ok) {
                    const message = data.error?.message || data.message || `Upload failed with status ${response.status}`;
                    throw new Error(message);
                }

                const imageUrl = data.secure_url;
                
                cloudinaryImageUrl.value = imageUrl;
                cloudinaryFileName.textContent = `✓ Uploaded: ${file.name}`;
                cloudinaryFileName.style.color = '#22c55e';
                
                // Update preview
                previewContainer.innerHTML = `<img src="${imageUrl}" alt="Preview" class="max-w-full max-h-[200px] rounded-lg object-cover" />`;
                
                console.log('Image uploaded to Cloudinary:', imageUrl);
            } catch (error) {
                cloudinaryFileName.textContent = `❌ Error: ${error.message}`;
                cloudinaryFileName.style.color = '#ffb4ab';
                console.error('Upload error:', error);
            }

            // Reset file input
            hiddenFileInput.value = '';
        });
    }

    // ===== Image Carousel (CSS-based continuous sliding) ======
    const carouselContainer = document.getElementById('imageCarousel');
    const carouselDots = document.querySelectorAll('.carousel-dot');

    if (carouselContainer && carouselDots.length > 0) {
        // Dot click handlers to restart animation
        carouselDots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                dot.classList.add('active');
                carouselDots.forEach((d, i) => {
                    if (i !== index) d.classList.remove('active');
                });
            });
        });
    }
}

// Add CSS animation styles dynamically
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// --------- Simple AI Assistant (UI-driven, client-side) ---------
(function initSimpleAIAssistant(){
    function appendMessage(text, isUser = false) {
        const container = document.getElementById('aiMessagesContainer');
        if (!container) return;
        const msg = document.createElement('div');
        msg.className = `ai-message ${isUser ? 'ai-user-message' : 'ai-bot-message'}`;
        msg.innerHTML = `<p>${String(text).replace(/\n/g, '<br>')}</p>`;
        container.appendChild(msg);
        container.scrollTop = container.scrollHeight;
    }

    function generateAIResponse(userText) {
        const q = String(userText || '').toLowerCase();
        const products = TalentTrade.products.getAll();

        if (!q) return "Hi! Ask me about prices, product use, or categories. For example, 'price of AI Voice Model Subscription'.";

        const matchedProducts = products.filter(p =>
            q.includes(p.title.toLowerCase()) ||
            q.includes(p.category.toLowerCase()) ||
            q.includes(p.creator.toLowerCase()) ||
            p.description.toLowerCase().includes(q)
        );

        const exactProduct = products.find(p =>
            q.includes(p.title.toLowerCase()) ||
            q.includes(p.creator.toLowerCase()) ||
            q.includes(p.category.toLowerCase())
        );

        const formatPrice = price => TalentTrade.utils.formatPrice(price);
        const shortSummary = p => `${p.title} (${p.category}) — ${formatPrice(p.price)}.`;

        if (q.includes('price') || q.includes('cost') || q.includes('how much') || q.includes('market value')) {
            if (exactProduct) {
                return `${exactProduct.title} is currently listed at ${formatPrice(exactProduct.price)}.`;
            }
            if (matchedProducts.length) {
                return `I found ${matchedProducts.length} matching item(s). Example: ${shortSummary(matchedProducts[0])}`;
            }
            return 'Tell me the item name or category you want price info for, like "price of Handmade Ceramic Mug Set".';
        }

        if (q.includes('use') || q.includes('used for') || q.includes('purpose') || q.includes('what is')) {
            if (exactProduct) {
                return `${exactProduct.title} is used for ${exactProduct.description}`;
            }
            if (matchedProducts.length) {
                return `Here is one: ${matchedProducts[0].title}. ${matchedProducts[0].description}`;
            }
            return 'Tell me the item name and I will explain what it is used for.';
        }

        if (q.includes('category') || q.includes('browse') || q.includes('show me')) {
            const categories = [...new Set(products.map(p => p.category))];
            return `I can help with categories like ${categories.join(', ')}. Ask for a category name to see prices and uses.`;
        }

        if (q.includes('all items') || q.includes('list all') || q.includes('market')) {
            const list = products.slice(0, 4).map(shortSummary).join(' ');
            return `Here are a few market listings: ${list}`;
        }

        if (matchedProducts.length) {
            return `I found ${matchedProducts.length} matching item(s). Example: ${shortSummary(matchedProducts[0])}`;
        }

        const defaults = [
            "I can answer prices and uses for listed items. Try 'price of AI Voice Model Subscription'.",
            "Ask about item use, market price, or categories like Art, Tech, Music, Gear, or HotWheels.",
        ];
        return defaults[Math.floor(Math.random() * defaults.length)];
    }

    function handleSend() {
        const input = document.getElementById('aiUserInput');
        if (!input) return;
        const text = input.value.trim();
        if (!text) return;
        appendMessage(text, true);
        input.value = '';
        setTimeout(() => {
            const resp = generateAIResponse(text);
            appendMessage(resp, false);
        }, 400);
    }

    document.addEventListener('DOMContentLoaded', () => {
        const card = document.getElementById('aiAssistantCard');
        const openBtn = document.getElementById('aiOpenBtn');
        const sendBtn = document.getElementById('aiSendBtn');
        const input = document.getElementById('aiUserInput');
        const closeBtn = document.getElementById('aiCloseBtn');

        if (openBtn) openBtn.addEventListener('click', () => { card && card.classList.add('ai-visible'); });
        if (sendBtn) sendBtn.addEventListener('click', handleSend);
        if (input) input.addEventListener('keypress', (e) => { if (e.key === 'Enter') { e.preventDefault(); handleSend(); } });
        if (closeBtn) closeBtn.addEventListener('click', () => { card && card.classList.remove('ai-visible'); });

        // Auto-open assistant panel after short delay for quick access
        setTimeout(() => {
            if (card) card.classList.add('ai-visible');
        }, 2000);
    });
})();