/**
 * Firebase Data Connect Integration Example
 * Complete working example of connecting TalentTrade to Firebase Data Connect
 * 
 * This file shows how to:
 * 1. Initialize Firebase Data Connect
 * 2. Load products from the database
 * 3. Submit new listings
 * 4. Fetch and display reviews
 */

// Import Data Connect functions
import {
    initializeDataConnect,
    getAllItems,
    getItemsByCategory,
    getItemById,
    getItemReviews,
    searchItems,
    uploadItem,
    submitReview,
    formatPrice,
    formatDate,
    getItemBadge,
    handleDataConnectError,
} from './firebase-db.js';

// ==================== INITIALIZATION ====================

/**
 * Initialize the marketplace on page load
 */
async function initializeMarketplace() {
    try {
        console.log('Initializing TalentTrade with Firebase Data Connect...');
        
        // Initialize Firebase Data Connect
        await initializeDataConnect();
        console.log('✓ Firebase Data Connect initialized');
        
        // Load initial products
        await loadMarketplaceProducts();
        
        // Set up event listeners
        setupEventListeners();
        
        console.log('✓ Marketplace ready!');
    } catch (error) {
        console.error('Failed to initialize marketplace:', error);
        alert('Failed to connect to marketplace. Please refresh the page.');
    }
}

// ==================== PRODUCT LOADING ====================

/**
 * Load all products from Firebase Data Connect
 * This replaces the hardcoded mock data
 */
async function loadMarketplaceProducts() {
    try {
        console.log('Loading products from Firebase...');
        
        // Fetch from Data Connect
        const items = await getAllItems();
        console.log(`✓ Loaded ${items.length} items`);
        
        // Transform Firebase items to match UI format
        window.dbProducts = items.map(item => ({
            id: item.id,
            title: item.title,
            description: item.description,
            category: item.categoryId,
            creator: item.creator || 'Unknown Creator',
            price: item.price,
            type: item.type,
            rating: Math.round((item.avgRating || 5) * 10) / 10,
            reviews: item.reviewCount || 0,
            badge: getItemBadge(item.type),
            image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=900&q=80',
            createdAt: item.createdAt,
        }));
        
        // Render to home page
        renderProductsToDOM(window.dbProducts);
        
    } catch (error) {
        console.error('Error loading products:', error);
        const message = handleDataConnectError(error);
        alert(`Failed to load products: ${message}`);
    }
}

/**
 * Render products to the DOM
 * @param {Array} products - Array of product objects
 */
function renderProductsToDOM(products) {
    const homeGrid = document.getElementById('productGrid');
    const browseGrid = document.getElementById('browseGrid');
    
    if (!homeGrid && !browseGrid) return;
    
    const productHTML = products.map(product => `
        <article class="product-card" onclick="handleProductClick('${product.id}')">
            <img src="${product.image}" alt="${product.title}" loading="lazy" />
            <div class="badge ${product.type === 'rent' ? 'rent' : 'sale'}">${product.badge}</div>
            <h3>${product.title}</h3>
            <div class="product-meta">
                <span>${product.creator}</span>
                <span>${formatPrice(product.price)} • ${product.reviews} reviews</span>
                <div class="rating">${'★'.repeat(Math.floor(product.rating))}${'☆'.repeat(5 - Math.floor(product.rating))} ${product.rating}</div>
            </div>
        </article>
    `).join('');
    
    if (homeGrid) homeGrid.innerHTML = productHTML;
    if (browseGrid) browseGrid.innerHTML = productHTML;
}

// ==================== SEARCH & FILTER ====================

/**
 * Handle search form submission
 */
async function handleSearch(event) {
    event.preventDefault();
    
    const searchTerm = document.getElementById('searchInput')?.value || '';
    
    if (!searchTerm.trim()) {
        renderProductsToDOM(window.dbProducts);
        return;
    }
    
    try {
        console.log(`Searching for: ${searchTerm}`);
        const results = await searchItems(searchTerm);
        
        // Transform results
        const transformed = results.map(item => ({
            id: item.id,
            title: item.title,
            description: item.description,
            category: item.categoryId,
            creator: item.creator || 'Unknown Creator',
            price: item.price,
            type: item.type,
            rating: Math.round((item.avgRating || 5) * 10) / 10,
            reviews: item.reviewCount || 0,
            badge: getItemBadge(item.type),
            image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=900&q=80',
        }));
        
        renderProductsToDOM(transformed);
        console.log(`✓ Found ${transformed.length} matching items`);
        
    } catch (error) {
        console.error('Search error:', error);
        alert('Search failed. Please try again.');
    }
}

/**
 * Handle category filter
 */
async function handleCategoryFilter(categoryId) {
    try {
        if (categoryId === 'all') {
            renderProductsToDOM(window.dbProducts);
            return;
        }
        
        console.log(`Filtering by category: ${categoryId}`);
        const filtered = await getItemsByCategory(categoryId);
        
        const transformed = filtered.map(item => ({
            id: item.id,
            title: item.title,
            description: item.description,
            category: item.categoryId,
            creator: item.creator || 'Unknown Creator',
            price: item.price,
            type: item.type,
            rating: Math.round((item.avgRating || 5) * 10) / 10,
            reviews: item.reviewCount || 0,
            badge: getItemBadge(item.type),
            image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=900&q=80',
        }));
        
        renderProductsToDOM(transformed);
        
    } catch (error) {
        console.error('Filter error:', error);
    }
}

// ==================== ITEM DETAILS ====================

/**
 * Display item details with reviews
 */
async function handleProductClick(itemId) {
    try {
        console.log(`Loading details for item: ${itemId}`);
        
        const item = await getItemById(itemId);
        const reviews = await getItemReviews(itemId);
        
        if (!item) {
            alert('Item not found');
            return;
        }
        
        // Update detail page elements
        const detailImage = document.getElementById('detailImage');
        const detailTag = document.getElementById('detailTag');
        const detailTitle = document.getElementById('detailTitle');
        const detailCategory = document.getElementById('detailCategory');
        const detailPrice = document.getElementById('detailPrice');
        const detailDescription = document.getElementById('detailDescription');
        const reviewList = document.getElementById('reviewList');
        
        if (detailImage) detailImage.src = 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=900&q=80';
        if (detailTag) detailTag.textContent = getItemBadge(item.type);
        if (detailTitle) detailTitle.textContent = item.title;
        if (detailCategory) detailCategory.textContent = `${item.categoryId} • ${item.creator}`;
        if (detailPrice) detailPrice.textContent = formatPrice(item.price);
        if (detailDescription) detailDescription.textContent = item.description;
        
        // Render reviews
        if (reviewList) {
            if (reviews.length === 0) {
                reviewList.innerHTML = '<p>No reviews yet. Be the first to review!</p>';
            } else {
                reviewList.innerHTML = reviews.map(review => `
                    <article class="review-card">
                        <h4>${review.reviewer}</h4>
                        <div class="rating">${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}</div>
                        <p>${review.comment || 'No comment'}</p>
                        <small>${formatDate(review.createdAt)}</small>
                    </article>
                `).join('');
            }
        }
        
        // Store current item for review submission
        window.currentItemId = itemId;
        
        // Show detail section
        const detailSection = document.getElementById('detail');
        if (detailSection) {
            detailSection.classList.remove('hidden');
            document.querySelectorAll('.page-section').forEach(section => {
                if (section.id !== 'detail') section.classList.add('hidden');
            });
        }
        
    } catch (error) {
        console.error('Error loading item details:', error);
        alert('Failed to load item details');
    }
}

// ==================== UPLOAD LISTING ====================

/**
 * Handle upload form submission
 * Called when user clicks "Create listing" on the Sell/Upload page
 */
async function handleUploadListing(event) {
    event.preventDefault();
    
    try {
        // Get form values
        const title = document.querySelector('input[name="title"]')?.value;
        const description = document.querySelector('textarea[name="description"]')?.value;
        const price = document.querySelector('input[name="price"]')?.value;
        const type = document.querySelector('input[name="type"]:checked')?.value;
        const category = document.querySelector('select[name="category"]')?.value;
        
        if (!title || !description || !price || !type || !category) {
            alert('Please fill in all fields');
            return;
        }
        
        // In production, get current user ID from Firebase Auth
        // For now, using placeholder
        const currentUserId = 'user-demo-uuid-123';
        const categoryMap = {
            'Art': 'cat-art-uuid',
            'HotWheels': 'cat-hotwheels-uuid',
            'Tech': 'cat-tech-uuid',
            'Music': 'cat-music-uuid',
            'Gear': 'cat-gear-uuid',
        };
        
        console.log('Uploading new listing...');
        
        // Call Data Connect mutation
        const newItem = await uploadItem({
            title: title,
            description: description,
            price: parseFloat(price),
            type: type.toLowerCase(),
            categoryId: categoryMap[category] || 'cat-general-uuid',
            creatorId: currentUserId,
        });
        
        console.log('✓ Listing created:', newItem);
        alert(`✓ Your listing "${newItem.title}" has been created!`);
        
        // Reset form
        event.target.reset();
        
        // Reload products
        await loadMarketplaceProducts();
        
        // Navigate to home
        showSection('home');
        
    } catch (error) {
        console.error('Upload error:', error);
        const message = handleDataConnectError(error);
        alert(`Failed to create listing: ${message}`);
    }
}

// ==================== REVIEWS ====================

/**
 * Handle review submission
 */
async function handleSubmitReviewForm(event) {
    event.preventDefault();
    
    try {
        const rating = document.getElementById('reviewRating')?.value;
        const comment = document.getElementById('reviewComment')?.value;
        const itemId = window.currentItemId;
        
        if (!rating || !itemId) {
            alert('Please select a rating');
            return;
        }
        
        // In production, get current user ID from Firebase Auth
        const currentUserId = 'user-demo-uuid-456';
        
        console.log('Submitting review...');
        
        const review = await submitReview({
            itemId: itemId,
            userId: currentUserId,
            rating: parseInt(rating),
            comment: comment || null,
        });
        
        console.log('✓ Review submitted:', review);
        alert('✓ Thank you for your review!');
        
        // Reset form
        event.target.reset();
        
        // Reload item details
        await handleProductClick(itemId);
        
    } catch (error) {
        console.error('Review error:', error);
        const message = handleDataConnectError(error);
        alert(`Failed to submit review: ${message}`);
    }
}

// ==================== EVENT SETUP ====================

/**
 * Attach event listeners to forms and buttons
 */
function setupEventListeners() {
    // Search
    const searchBtn = document.getElementById('searchBtn');
    if (searchBtn) {
        searchBtn.addEventListener('click', handleSearch);
    }
    
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') handleSearch(e);
        });
    }
    
    // Category filters
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            handleCategoryFilter(e.target.dataset.category);
        });
    });
    
    // Upload form
    const uploadForm = document.getElementById('uploadForm');
    if (uploadForm) {
        uploadForm.addEventListener('submit', handleUploadListing);
    }
    
    // Review form
    const reviewForm = document.querySelector('form[onsubmit*="Review"]') || 
                      document.querySelector('#reviewForm');
    if (reviewForm) {
        reviewForm.addEventListener('submit', handleSubmitReviewForm);
    }
}

// ==================== UTILITY ====================

/**
 * Show/hide page sections
 */
function showSection(sectionId) {
    document.querySelectorAll('.page-section').forEach(section => {
        section.classList.add('hidden');
    });
    const section = document.getElementById(sectionId);
    if (section) {
        section.classList.remove('hidden');
    }
}

// ==================== STARTUP ====================

// Start the marketplace when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeMarketplace);
} else {
    initializeMarketplace();
}

// Export functions for global access
window.handleProductClick = handleProductClick;
window.handleSearch = handleSearch;
window.handleCategoryFilter = handleCategoryFilter;
window.handleUploadListing = handleUploadListing;
window.handleSubmitReviewForm = handleSubmitReviewForm;
window.showSection = showSection;
