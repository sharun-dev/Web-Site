/**
 * TalentTrade Marketplace - Main App Logic
 * Uses Firebase Data Connect (SQL) for database operations
 */

// Firebase Data Connect functions are available globally from firebase-db.js
// (loaded as regular script in index.html)

window.appReady = false;

// Mock JSON data for marketplace items (fallback)
const mockProducts = [
    {
        id: 'p1',
        title: 'Midnight Canvas Collection',
        category: 'Art',
        creator: 'Luna Artea',
        price: 120,
        type: 'Sell',
        rating: 4.8,
        reviews: 32,
        badge: 'For Sale',
        description: 'A series of moody acrylic paintings with vivid textures and expressive brush strokes.',
        image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=900&q=80'
    },
    {
        id: 'p2',
        title: 'Custom Hot Wheels Garage Set',
        category: 'HotWheels',
        creator: 'DieCastDan',
        price: 60,
        type: 'Sell',
        rating: 4.4,
        reviews: 19,
        badge: 'For Sale',
        description: 'Limited edition die-cast cars with custom decals and vintage packaging.',
        image: 'https://images.unsplash.com/photo-1517976487492-5750f3195933?auto=format&fit=crop&w=900&q=80'
    },
    {
        id: 'p3',
        title: 'Startup Landing Page Template',
        category: 'Tech',
        creator: 'CodeCraftr',
        price: 32,
        type: 'Sell',
        rating: 4.9,
        reviews: 47,
        badge: 'For Sale',
        description: 'A polished HTML/CSS template designed for SaaS brands and indie developers.',
        image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80'
    },
    {
        id: 'p4',
        title: 'Studio Drum Kit Rental',
        category: 'Music',
        creator: 'RhythmRae',
        price: 45,
        type: 'Rent',
        rating: 4.7,
        reviews: 25,
        badge: 'For Rent',
        description: 'Full drum kit available for weekly rental in the downtown creative studio.',
        image: 'https://images.unsplash.com/photo-1511376777868-611b54f68947?auto=format&fit=crop&w=900&q=80'
    },
    {
        id: 'p5',
        title: 'Camera Lens & Tripod Kit',
        category: 'Gear',
        creator: 'ShutterSavvy',
        price: 27,
        type: 'Rent',
        rating: 4.6,
        reviews: 14,
        badge: 'For Rent',
        description: 'Professional lens and tripod set for weekend rental, ideal for portraits and studio shoots.',
        image: 'https://images.unsplash.com/photo-1519183071298-a2962be90b16?auto=format&fit=crop&w=900&q=80'
    },
    {
        id: 'p6',
        title: '3D Character Model Pack',
        category: 'Tech',
        creator: 'VertexVault',
        price: 75,
        type: 'Sell',
        rating: 4.9,
        reviews: 18,
        badge: 'For Sale',
        description: 'A polished set of rigged 3D character models ready for animation, games, and AR/VR.',
        image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80'
    },
    {
        id: 'p7',
        title: 'Fashion Model Photoshoot',
        category: 'Art',
        creator: 'PosePerfect',
        price: 240,
        type: 'Sell',
        rating: 4.7,
        reviews: 12,
        badge: 'For Sale',
        description: 'High-end editorial model photography for brands, campaigns, and portfolios.',
        image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80'
    },
    {
        id: 'p8',
        title: 'AI Voice Model Subscription',
        category: 'Music',
        creator: 'SynthSpeaker',
        price: 18,
        type: 'Rent',
        rating: 4.5,
        reviews: 29,
        badge: 'For Rent',
        description: 'Access a library of premium AI voice models for on-demand narration, ads, and podcasts.',
        image: 'https://images.unsplash.com/photo-1511820752961-65c73dff5e71?auto=format&fit=crop&w=900&q=80'
    }
];

// Products array - will be populated from Firebase
let products = [...mockProducts];

// Cache references to key DOM elements once the document is loaded
let sectionMap = null;
let productGrid = null;
let browseGrid = null;
let reviewList = null;
let searchInput = null;
let searchBtn = null;
let categoryBtns = null;
let navLinks = null;
let uploadForm = null;
let detailElements = null;

let activeCategory = 'all';
let currentProduct = null;

/**
 * Utility to return a string of star icons based on rating.
 */
function createStarRating(rating) {
    const fullStars = Math.floor(rating);
    const halfStar = rating - fullStars >= 0.5;
    let stars = '';

    for (let i = 0; i < fullStars; i += 1) {
        stars += '★';
    }
    if (halfStar) stars += '☆';
    while (stars.length < 5) stars += '☆';

    return `<span class="rating">${stars}</span>`;
}

/**
 * Render a single product card.
 * The card becomes interactive by listening for clicks.
 */
function createProductCard(product) {
    const card = document.createElement('article');
    card.className = 'product-card';
    card.innerHTML = `
        <img src="${product.image}" alt="${product.title}" />
        <div class="badge ${product.type.toLowerCase()}">${product.badge}</div>
        <h3>${product.title}</h3>
        <div class="product-meta">
            <span>${product.creator} · ${product.category}</span>
            <span>$${product.price} • ${product.reviews} reviews</span>
            ${createStarRating(product.rating)}
        </div>
    `;

    card.addEventListener('click', () => {
        currentProduct = product;
        showSection('detail');
        renderProductDetail(product);
    });

    return card;
}

/**
 * Render the grid of products inside a container.
 */
function renderProductGrid(productsToDisplay, container) {
    container.innerHTML = '';

    if (!productsToDisplay.length) {
        container.innerHTML = '<p class="empty-state">No items match your search yet.</p>';
        return;
    }

    productsToDisplay.forEach((product) => {
        const card = createProductCard(product);
        container.appendChild(card);
    });
}

/**
 * Return products filtered by category and search query.
 */
function getFilteredProducts() {
    const searchTerm = searchInput.value.trim().toLowerCase();

    return products.filter((product) => {
        const matchesCategory = activeCategory === 'all' || product.category === activeCategory;
        const matchesSearch = [product.title, product.creator, product.category, product.description]
            .some((text) => text.toLowerCase().includes(searchTerm));

        return matchesCategory && matchesSearch;
    });
}

/**
 * Show a specific application section and hide the others.
 */
function showSection(sectionId) {
    if (!sectionMap) {
        console.error('showSection called before sectionMap initialization');
        return;
    }

    Object.keys(sectionMap).forEach((key) => {
        if (sectionMap[key]) {
            sectionMap[key].classList.toggle('hidden', key !== sectionId);
        }
    });

    if (navLinks) {
        navLinks.forEach((link) => {
            link.classList.toggle('active', link.dataset.section === sectionId);
        });
    }

    if (sectionId === 'browse' && browseGrid) {
        renderProductGrid(getFilteredProducts(), browseGrid);
    }

    if (sectionId === 'home' && productGrid) {
        renderProductGrid(products, productGrid);
    }
}

/**
 * Populate the item detail section based on a clicked product.
 */
function renderProductDetail(product) {
    detailElements.image.src = product.image;
    detailElements.image.alt = product.title;
    detailElements.tag.textContent = product.badge;
    detailElements.title.textContent = product.title;
    detailElements.category.textContent = `${product.category} • ${product.creator}`;
    detailElements.price.textContent = `$${product.price}`;
    detailElements.description.textContent = product.description;

    renderReviews(product);
}

/**
 * Create a small set of dummy reviews for the detail view.
 */
function renderReviews(product) {
    const reviews = [
        {
            name: 'Mia R.',
            rating: 5,
            comment: `I loved the ${product.title}. The seller was responsive and delivery was fast.`
        },
        {
            name: 'Noah T.',
            rating: 4,
            comment: 'Great quality and the item matched the listing description perfectly.'
        },
        {
            name: 'Ava K.',
            rating: 5,
            comment: 'Excellent rental service, easy booking and clean gear.'
        }
    ];

    reviewList.innerHTML = '';

    reviews.forEach((review) => {
        const reviewCard = document.createElement('article');
        reviewCard.className = 'review-card';
        reviewCard.innerHTML = `
            <h4>${review.name}</h4>
            <div class="rating">${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}</div>
            <p>${review.comment}</p>
        `;
        reviewList.appendChild(reviewCard);
    });
}

/**
 * Update the active category button state.
 */
function updateCategoryButtons() {
    categoryBtns.forEach((button) => {
        button.classList.toggle('active', button.dataset.category === activeCategory);
    });
}

/**
 * Set up event listeners for navigation and search.
 */
function initializeEvents() {
    if (!navLinks || !searchBtn || !searchInput || !categoryBtns || !uploadForm) {
        console.error('Unable to initialize events: missing DOM elements');
        return;
    }

    navLinks.forEach((link) => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            showSection(link.dataset.section);
        });
    });

    document.querySelectorAll('[data-section]').forEach((button) => {
        button.addEventListener('click', (event) => {
            event.preventDefault();
            showSection(button.dataset.section);
        });
    });

    searchBtn.addEventListener('click', (event) => {
        event.preventDefault();
        showSection('browse');
    });

    searchInput.addEventListener('keyup', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            showSection('browse');
        }
    });

    categoryBtns.forEach((button) => {
        button.addEventListener('click', () => {
            activeCategory = button.dataset.category;
            updateCategoryButtons();
            renderProductGrid(getFilteredProducts(), browseGrid);
        });
    });

    const backLink = document.querySelector('.back-link');
    if (backLink) {
        backLink.addEventListener('click', (event) => {
            event.preventDefault();
            showSection('browse');
        });
    }

    if (detailElements.chatButton) {
        detailElements.chatButton.addEventListener('click', () => {
            const creatorName = currentProduct?.creator || 'the creator';
            alert(`Chat started with ${creatorName}. This is a placeholder chat flow.`);
        });
    }

    uploadForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const formData = new FormData(uploadForm);
        const newItem = {
            title: formData.get('title'),
            category: formData.get('category'),
            creator: 'New Seller',
            price: Number(formData.get('price')),
            type: formData.get('type'),
            badge: formData.get('type') === 'Rent' ? 'For Rent' : 'For Sale',
            rating: 5,
            reviews: 0,
            description: formData.get('description'),
            image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=900&q=80',
            createdAt: new Date().toISOString(),
        };

        // Save to Firebase
        saveProductToFirebase(newItem);
        uploadForm.reset();
    });
}

/**
 * Initialize Firebase Data Connect and load products from SQL database
 */
async function initializeFirebase() {
    try {
        console.log('🚀 Initializing TalentTrade with Firebase Data Connect...');
        
        // Check if Data Connect is available
        if (!window.db || !window.db.initializeDataConnect) {
            console.warn('Firebase Data Connect not loaded, using mock data');
            return;
        }
        
        // Initialize Data Connect
        await window.db.initializeDataConnect();
        console.log('✓ Firebase Data Connect initialized');
        
        // Load products from SQL database
        await loadProductsFromFirebase();
        console.log('✓ Products loaded from database');
        
    } catch (error) {
        console.error('⚠️ Firebase initialization error:', error);
        console.log('Attempting to load Firestore created items as fallback...');

        try {
            const createdItems = await window.db.loadCreatedItemsFromFirestore();
            if (createdItems.length > 0) {
                products = createdItems.map((item) => ({
                    id: item.id,
                    title: item.title,
                    description: item.description || item.title,
                    category: item.category || 'General',
                    creator: item.creator || 'New Seller',
                    price: Number(item.price) || 0,
                    type: (item.type || 'Sell').toLowerCase(),
                    rating: Number(item.rating) || 5,
                    reviews: Number(item.reviews) || 0,
                    badge: item.badge || ((item.type || 'Sell').toLowerCase() === 'rent' ? 'For Rent' : 'For Sale'),
                    image: item.imageUrl || item.mediaUrl || 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=900&q=80',
                    createdAt: item.createdAt?.toDate?.().toISOString() || item.createdAt || new Date().toISOString(),
                }));
                console.log(`✓ Loaded ${products.length} Firestore-created items as fallback`);
                if (productGrid) renderProductGrid(products, productGrid);
                if (browseGrid) renderProductGrid(getFilteredProducts(), browseGrid);
                return;
            }
        } catch (firestoreError) {
            console.warn('Firestore fallback load failed:', firestoreError);
        }

        console.log('Using mock data as fallback');
    }
}

/**
 * Load products from Firebase Data Connect (SQL database)
 */
async function loadProductsFromFirebase() {
    try {
        console.log('📥 Loading products from Data Connect...');
        
        // Fetch all items from SQL database
        const items = await window.db.getAllItems();
        console.log(`✓ Loaded ${items.length} items from database`);
        
        // Transform database items to UI format
        const dbProducts = items.map(item => ({
            id: item.id,
            title: item.title,
            description: item.description,
            category: item.category || item.categoryId || 'Unknown',
            creator: item.creator || 'Unknown Creator',
            price: item.price,
            type: item.type,
            rating: Math.round((item.ratingAvg || 5) * 10) / 10,
            reviews: item.reviewCount || 0,
            badge: window.db.getItemBadge(item.type),
            image: item.imageUrl || 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=900&q=80',
            createdAt: item.createdAt,
        }));
        
        // Load Firestore-created items as well, if available
        let firestoreProducts = [];
        try {
            const createdItems = await window.db.loadCreatedItemsFromFirestore();
            firestoreProducts = createdItems.map((item) => ({
                id: item.id,
                title: item.title,
                description: item.description || item.title,
                category: item.category || 'General',
                creator: item.creator || 'New Seller',
                price: Number(item.price) || 0,
                type: (item.type || 'Sell').toLowerCase(),
                rating: Number(item.rating) || 5,
                reviews: Number(item.reviews) || 0,
                badge: item.badge || ((item.type || 'Sell').toLowerCase() === 'rent' ? 'For Rent' : 'For Sale'),
                image: item.imageUrl || item.mediaUrl || 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=900&q=80',
                createdAt: item.createdAt?.toDate?.().toISOString() || item.createdAt || new Date().toISOString(),
            }));
            if (firestoreProducts.length) {
                console.log(`✓ Loaded ${firestoreProducts.length} additional Firestore-created items`);
            }
        } catch (firestoreError) {
            console.warn('Could not load Firestore created_items:', firestoreError);
        }

        // Replace products array with database items and any Firestore-created items
        if (dbProducts.length > 0 || firestoreProducts.length > 0) {
            products = [...firestoreProducts, ...dbProducts];
            console.log(`✓ Using ${products.length} products from remote sources`);
        } else {
            console.log('No products in database or Firestore, using mock data');
            products = [...mockProducts];
        }
        
        // Render products to home page
        if (productGrid) {
            renderProductGrid(products, productGrid);
        }
        
    } catch (error) {
        console.error('Error loading products from Data Connect:', error);
        const message = window.db ? window.db.handleDataConnectError(error) : error.message;
        console.warn(`Using mock data. Reason: ${message}`);
        products = [...mockProducts];
    }
}

/**
 * Save product listing to Firebase Data Connect (SQL database)
 */
async function saveProductToFirebase(productData) {
    try {
        console.log('💾 Saving new listing to Data Connect...');
        
        if (!window.db || !window.db.uploadItem) {
            throw new Error('Data Connect module is not loaded. Please check firebase-db.js and index.html script order.');
        }

        if (window.dataConnectReady !== true) {
            console.warn('⚠️ Data Connect not ready; attempting initialization before upload...');
            if (window.db && window.db.initializeDataConnect) {
                await window.db.initializeDataConnect();
            }
        }

        if (window.dataConnectReady !== true) {
            throw new Error('Data Connect is not ready. Ensure initializeDataConnect() finished successfully and firebase-db.js is configured with valid Firebase credentials.');
        }
        
        // Map form data to Data Connect schema
        const categoryMap = {
            'Art': 'cat-art-uuid',
            'HotWheels': 'cat-hotwheels-uuid',
            'Tech': 'cat-tech-uuid',
            'Music': 'cat-music-uuid',
            'Gear': 'cat-gear-uuid',
        };
        
        // Generate demo user ID (in production, get from Firebase Auth)
        const currentUserId = `user-${Date.now()}`;
        
        const itemType = productData.type.toLowerCase() === 'sell' ? 'sale' : 'rent';
        const itemData = {
            title: productData.title,
            description: productData.description,
            price: productData.price,
            type: itemType,
            categoryId: categoryMap[productData.category] || 'cat-general-uuid',
            creatorId: currentUserId,
        };
        
        // Call Data Connect mutation to save to SQL database
        const newItem = await window.db.uploadItem(itemData);
        console.log('✓ Item uploaded to database:', newItem);
        
        alert(`✓ Listing "${newItem.title}" created successfully! Stored in database.`);
        
        // Add the new item locally immediately so it appears in the UI
        const localItem = {
            id: newItem.id,
            title: newItem.title || itemData.title,
            description: itemData.description,
            category: productData.category,
            creator: 'New Seller',
            price: newItem.price ?? itemData.price,
            type: newItem.type ?? itemData.type.toLowerCase(),
            rating: 5,
            reviews: 0,
            badge: window.db.getItemBadge(itemData.type),
            image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=900&q=80',
            createdAt: newItem.createdAt || new Date().toISOString(),
        };

        products.unshift(localItem);

        // Render updated grids immediately
        if (productGrid) renderProductGrid(products, productGrid);
        if (browseGrid) renderProductGrid(getFilteredProducts(), browseGrid);

        // Reload products from database in the background
        loadProductsFromFirebase().then(() => {
            if (productGrid) renderProductGrid(products, productGrid);
            if (browseGrid) renderProductGrid(getFilteredProducts(), browseGrid);
        }).catch((error) => {
            console.warn('Unable to refresh products from Firebase after upload:', error);
        });
        
        // Navigate to home
        showSection('home');
        
    } catch (error) {
        console.error('Error saving product to Data Connect:', error);
        const message = window.db ? window.db.handleDataConnectError(error) : error.message;

        const localFallbackItem = {
            id: `local-${Date.now()}`,
            title: productData.title,
            description: productData.description,
            category: productData.category,
            creator: 'New Seller',
            price: productData.price,
            type: productData.type.toLowerCase() === 'sell' ? 'sale' : 'rent',
            rating: 5,
            reviews: 0,
            badge: productData.type === 'Rent' ? 'For Rent' : 'For Sale',
            image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=900&q=80',
            createdAt: new Date().toISOString(),
        };

        products.unshift(localFallbackItem);
        if (productGrid) renderProductGrid(products, productGrid);
        if (browseGrid) renderProductGrid(getFilteredProducts(), browseGrid);
        showSection('home');

        alert(`⚠️ Listing added locally. Remote save failed: ${message}`);
    }
}

/**
 * Initialize the application and render the homepage
 */
function init() {
    sectionMap = {
        home: document.getElementById('home'),
        browse: document.getElementById('browse'),
        detail: document.getElementById('detail'),
        upload: document.getElementById('upload')
    };
    productGrid = document.getElementById('productGrid');
    browseGrid = document.getElementById('browseGrid');
    reviewList = document.getElementById('reviewList');
    searchInput = document.getElementById('searchInput');
    searchBtn = document.getElementById('searchBtn');
    categoryBtns = document.querySelectorAll('.category-btn');
    navLinks = document.querySelectorAll('.nav-link');
    uploadForm = document.getElementById('uploadForm');
    detailElements = {
        image: document.getElementById('detailImage'),
        tag: document.getElementById('detailTag'),
        title: document.getElementById('detailTitle'),
        category: document.getElementById('detailCategory'),
        price: document.getElementById('detailPrice'),
        description: document.getElementById('detailDescription'),
        chatButton: document.getElementById('chatBtn')
    };

    if (!sectionMap.home || !sectionMap.browse || !sectionMap.upload) {
        console.error('Navigation init failed: essential sections are missing from the DOM.');
        return;
    }

    console.log('Initializing app, navLinks:', navLinks.length, 'sections with data-section:', document.querySelectorAll('[data-section]').length);

    // Set up event listeners first
    initializeEvents();

    // Mark app ready so fallback rendering does not override the grid
    window.appReady = true;
    
    // Show home page initially
    showSection('home');
    
    // Render with mock data
    if (productGrid) renderProductGrid(products, productGrid);
    if (browseGrid) renderProductGrid(getFilteredProducts(), browseGrid);
    
    // Initialize Data Connect and load products from SQL database
    initializeFirebase().then(() => {
        if (productGrid) renderProductGrid(products, productGrid);
        if (browseGrid) renderProductGrid(getFilteredProducts(), browseGrid);
    }).catch(error => {
        console.error('Failed to initialize Firebase:', error);
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
