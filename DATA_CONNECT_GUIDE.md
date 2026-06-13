# Firebase Data Connect Integration Guide

## Overview
This guide shows how to integrate Firebase Data Connect with your TalentTrade marketplace. Data Connect provides SQL-based backend queries and mutations for your vanilla JavaScript app.

## Quick Start

### 1. Update Your Firebase Configuration

Open `firebase-db.js` and replace the placeholder config:

```javascript
const firebaseConfig = {
    apiKey: 'YOUR_API_KEY',                    // Get from Firebase Console
    authDomain: 'website-d45d9.firebaseapp.com',
    projectId: 'website-d45d9',
    storageBucket: 'website-d45d9.appspot.com',
    messagingSenderId: 'YOUR_MESSAGING_SENDER_ID',
    appId: 'YOUR_APP_ID',
};
```

### 2. Initialize Data Connect on App Start

In your main app initialization (top of `app.js`):

```javascript
import { initializeDataConnect, getAllItems } from './firebase-db.js';

// Initialize Data Connect when app loads
try {
    await initializeDataConnect();
    console.log('Data Connect ready!');
} catch (error) {
    console.error('Failed to initialize Data Connect:', error);
}
```

### 3. Load Products on Page Load

```javascript
// In app.js, replace product loading logic
async function loadMarketplaceData() {
    try {
        const items = await getAllItems();
        // Transform items to match your UI format
        products = items.map(item => ({
            id: item.id,
            title: item.title,
            description: item.description,
            price: item.price,
            type: item.type,
            creator: item.creator,
            image: item.creatorImage || 'https://via.placeholder.com/300',
            rating: item.avgRating || 5,
            reviews: item.reviewCount || 0,
            badge: getItemBadge(item.type),
            category: item.categoryId,
        }));
        
        renderProductGrid(products, productGrid);
    } catch (error) {
        console.error('Error loading marketplace:', error);
    }
}
```

## Integration Examples

### Example 1: Display All Items on Home Page

```html
<!-- HTML: Product grid container -->
<div id="productGrid" class="product-grid"></div>

<script type="module">
import { getAllItems, formatPrice, getItemBadge } from './firebase-db.js';

async function displayHomeProducts() {
    const items = await getAllItems();
    const grid = document.getElementById('productGrid');
    
    grid.innerHTML = items.map(item => `
        <article class="product-card" onclick="viewItem('${item.id}')">
            <img src="${item.creatorImage}" alt="${item.title}" />
            <h3>${item.title}</h3>
            <p>${item.creator}</p>
            <p>${formatPrice(item.price)} • ${getItemBadge(item.type)}</p>
            <div class="rating">★ ${item.avgRating?.toFixed(1) || 'N/A'} (${item.reviewCount} reviews)</div>
        </article>
    `).join('');
}

displayHomeProducts();
</script>
```

### Example 2: Upload Item from Form

```html
<!-- HTML: Upload form -->
<form id="uploadForm" onsubmit="handleUploadItem(event)">
    <input type="text" id="itemTitle" placeholder="Item title" required />
    <textarea id="itemDesc" placeholder="Description" required></textarea>
    <input type="number" id="itemPrice" placeholder="Price" required />
    <select id="itemType" required>
        <option value="sale">For Sale</option>
        <option value="rent">For Rent</option>
    </select>
    <select id="itemCategory" required>
        <option value="cat-art">Art</option>
        <option value="cat-music">Music</option>
        <option value="cat-tech">Tech</option>
    </select>
    <button type="submit">Create Listing</button>
</form>

<script type="module">
import { uploadItem, handleDataConnectError } from './firebase-db.js';

async function handleUploadItem(event) {
    event.preventDefault();
    
    try {
        const currentUserId = await getCurrentUserId(); // Your auth logic
        
        const newItem = await uploadItem({
            title: document.getElementById('itemTitle').value,
            description: document.getElementById('itemDesc').value,
            price: parseFloat(document.getElementById('itemPrice').value),
            type: document.getElementById('itemType').value,
            categoryId: document.getElementById('itemCategory').value,
            creatorId: currentUserId,
        });
        
        alert(`✓ Item "${newItem.title}" created successfully!`);
        document.getElementById('uploadForm').reset();
        
        // Reload marketplace
        loadMarketplaceData();
        
    } catch (error) {
        const message = handleDataConnectError(error);
        alert(`Error: ${message}`);
    }
}

window.handleUploadItem = handleUploadItem;
</script>
```

### Example 3: Display Item Details and Reviews

```html
<!-- HTML: Item detail page -->
<section id="itemDetail">
    <div id="itemImageCard"></div>
    <div id="itemInfo"></div>
    <div id="reviewsSection"></div>
</section>

<script type="module">
import { getItemById, getItemReviews, formatPrice, getItemBadge, formatDate } from './firebase-db.js';

async function displayItemDetail(itemId) {
    try {
        const item = await getItemById(itemId);
        const reviews = await getItemReviews(itemId);
        
        // Display item info
        document.getElementById('itemInfo').innerHTML = `
            <span class="badge">${getItemBadge(item.type)}</span>
            <h1>${item.title}</h1>
            <p>By <strong>${item.creator}</strong></p>
            <h2>${formatPrice(item.price)}</h2>
            <p>${item.description}</p>
            <p>⭐ ${item.avgRating?.toFixed(1) || 'N/A'} (${item.reviewCount} reviews)</p>
        `;
        
        // Display reviews
        document.getElementById('reviewsSection').innerHTML = reviews.map(review => `
            <div class="review-card">
                <h4>${review.reviewer}</h4>
                <p>${'★'.repeat(review.rating)}${'☆'.repeat(5-review.rating)}</p>
                <p>${review.comment}</p>
                <small>${formatDate(review.createdAt)}</small>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Error loading item detail:', error);
    }
}

window.displayItemDetail = displayItemDetail;
</script>
```

### Example 4: Submit Review

```html
<!-- HTML: Review form -->
<form id="reviewForm" onsubmit="handleSubmitReview(event)">
    <select id="reviewRating" required>
        <option value="">Select rating...</option>
        <option value="1">1 ★ - Poor</option>
        <option value="2">2 ★ - Fair</option>
        <option value="3">3 ★ - Good</option>
        <option value="4">4 ★ - Very Good</option>
        <option value="5">5 ★ - Excellent</option>
    </select>
    <textarea id="reviewComment" placeholder="Share your experience..."></textarea>
    <button type="submit">Submit Review</button>
</form>

<script type="module">
import { submitReview, handleDataConnectError } from './firebase-db.js';

async function handleSubmitReview(event) {
    event.preventDefault();
    
    try {
        const currentUserId = await getCurrentUserId(); // Your auth logic
        const itemId = new URLSearchParams(window.location.search).get('itemId');
        
        const review = await submitReview({
            itemId: itemId,
            userId: currentUserId,
            rating: parseInt(document.getElementById('reviewRating').value),
            comment: document.getElementById('reviewComment').value,
        });
        
        alert('✓ Review submitted!');
        document.getElementById('reviewForm').reset();
        
        // Reload reviews
        displayItemDetail(itemId);
        
    } catch (error) {
        const message = handleDataConnectError(error);
        alert(`Error: ${message}`);
    }
}

window.handleSubmitReview = handleSubmitReview;
</script>
```

### Example 5: Search Items

```html
<!-- HTML: Search form -->
<form onsubmit="handleSearchItems(event)">
    <input type="search" id="searchBox" placeholder="Search items..." />
    <button type="submit">Search</button>
</form>
<div id="searchResults"></div>

<script type="module">
import { searchItems, formatPrice, getItemBadge } from './firebase-db.js';

async function handleSearchItems(event) {
    event.preventDefault();
    
    const searchTerm = document.getElementById('searchBox').value;
    const results = await searchItems(searchTerm);
    
    document.getElementById('searchResults').innerHTML = results.map(item => `
        <div class="product-card" onclick="displayItemDetail('${item.id}')">
            <h3>${item.title}</h3>
            <p>${formatPrice(item.price)} • ${getItemBadge(item.type)}</p>
        </div>
    `).join('');
}

window.handleSearchItems = handleSearchItems;
</script>
```

## Available Functions

### Queries (Fetching Data)

| Function | Purpose | Parameters | Returns |
|----------|---------|-----------|---------|
| `getAllItems()` | Fetch all marketplace items | None | Array of items |
| `getItemsByCategory(categoryId)` | Filter items by category | categoryId (UUID) | Array of items |
| `getItemById(itemId)` | Get single item details | itemId (UUID) | Item object |
| `getItemReviews(itemId)` | Get reviews for an item | itemId (UUID) | Array of reviews |
| `searchItems(searchTerm)` | Search by title/description | searchTerm (string) | Array of items |
| `getUserProfile(userId)` | Get user info | userId (UUID) | User object |

### Mutations (Saving Data)

| Function | Purpose | Parameters | Returns |
|----------|---------|-----------|---------|
| `uploadItem(itemData)` | Create new item | title, description, price, type, categoryId, creatorId | Created item |
| `submitReview(reviewData)` | Create review | itemId, userId, rating, comment | Created review |
| `updateItem(itemId, updateData)` | Edit existing item | itemId, {title, description, price, type} | Updated item |
| `deleteItem(itemId)` | Remove item | itemId | Boolean success |

### Helpers

| Function | Purpose |
|----------|---------|
| `formatPrice(price)` | Convert number to currency string |
| `formatDate(date)` | Format date for display |
| `getItemBadge(type)` | Convert 'sale'/'rent' to display text |
| `handleDataConnectError(error)` | Get user-friendly error message |

## Common Patterns

### Pattern 1: Auto-refresh on Create
After uploading an item, reload the marketplace:
```javascript
await uploadItem(itemData);
const items = await getAllItems();
renderProductGrid(items, productGrid);
```

### Pattern 2: Pagination (if needed)
```javascript
// Add LIMIT/OFFSET to queries
const query = `SELECT * FROM Item LIMIT 10 OFFSET $offset`;
```

### Pattern 3: Filter + Sort
```javascript
// Chain multiple queries or use WHERE/ORDER BY
const items = await getItemsByCategory(categoryId);
items.sort((a, b) => b.price - a.price); // Sort client-side
```

## Testing in Console

```javascript
// Import in browser console (if using modules)
import * as db from './firebase-db.js';

// Test query
await db.getAllItems();

// Test mutation
await db.uploadItem({
    title: 'Test Item',
    description: 'Test Description',
    price: 99.99,
    type: 'sale',
    categoryId: 'test-cat',
    creatorId: 'test-user'
});
```

## Troubleshooting

### "Data Connect not initialized"
- Make sure `initializeDataConnect()` is called first
- Check browser console for initialization errors

### Items not showing
- Open DevTools → Network tab
- Check if requests are succeeding
- Verify database has data in Firebase Console

### Authentication errors
- Ensure user is logged in before mutations
- Check Data Connect security rules in Firebase Console

### Performance issues
- Use category filtering instead of `getAllItems()`
- Implement pagination with LIMIT/OFFSET
- Cache results client-side

## Next Steps

1. Replace placeholder Firebase config with your credentials
2. Update your `app.js` to use these functions
3. Connect HTML forms to the mutation functions
4. Test in browser console before deploying
5. Monitor Firebase Data Connect usage in console
