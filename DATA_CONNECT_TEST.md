# Firebase Data Connect - Integration Test Guide

## ✅ What's Connected Now

Your marketplace is now fully integrated with **Firebase Data Connect (SQL)**:

1. **Upload Form** → Saves to SQL database via `uploadItem()`
2. **Home Page** → Displays products from SQL via `getAllItems()`
3. **Browse Page** → Filters & displays products from SQL
4. **Product Details** → Shows full details with reviews
5. **Search** → Searches SQL database via `searchItems()`

## 🚀 How to Test

### Test 1: Verify Data Connect Connection

1. Open `index.html` in browser
2. Open **Developer Console** (F12)
3. Look for these messages:
   ```
   🚀 Initializing TalentTrade with Firebase Data Connect...
   ✓ Firebase Data Connect initialized
   📥 Loading products from Data Connect...
   ✓ Loaded X items from database
   ```

### Test 2: Test Upload Form (Store in SQL)

1. Go to **"Sell / Upload"** page
2. Fill in the form:
   - Title: "Test Item"
   - Category: Select any category
   - Description: "Testing Data Connect integration"
   - Price: "99.99"
   - Type: Select "Sell" or "Rent"
3. Click **"Create listing"**
4. Check console for:
   ```
   💾 Saving new listing to Data Connect...
   ✓ Item uploaded to database: { id: "...", title: "Test Item", ... }
   ```
5. Verify alert says **"...Stored in database"**

### Test 3: Verify Product Displays on Home

After uploading:
1. Go to **"Home"** page
2. Your new item should appear in "Top listings today" grid
3. Console should show:
   ```
   📥 Loading products from Data Connect...
   ✓ Loaded X items from database
   ```

### Test 4: Verify Product Displays on Browse

1. Go to **"Browse categories"**
2. Select the category you uploaded to
3. Your item should appear
4. Try **"All"** filter - item should appear there too

### Test 5: Test Product Details

1. Click on your uploaded item
2. Should show:
   - Item image
   - Title, price, description
   - Creator info
   - Rating and reviews
3. Verify in console - no errors

### Test 6: Test Search

1. Go to **Home** or **Browse**
2. Use search box to find your item by title or description
3. Should appear in filtered results

## ⚙️ Configuration Required

Before tests will work, you need to update Firebase credentials in `firebase-db.js`:

```javascript
const firebaseConfig = {
    apiKey: 'YOUR_ACTUAL_API_KEY',           // ← Replace
    authDomain: 'website-d45d9.firebaseapp.com',
    projectId: 'website-d45d9',
    storageBucket: 'website-d45d9.appspot.com',
    messagingSenderId: 'YOUR_MESSAGING_SENDER_ID',  // ← Replace
    appId: 'YOUR_APP_ID',                           // ← Replace
};

const dataConnectConfig = {
    serviceId: 'website-d45d9-service',     // Verify correct
    location: 'us-east-4',                  // Verify correct
    instanceId: 'website-d45d9-instance',   // Verify correct
};
```

**How to get these values:**
1. Open [Firebase Console](https://console.firebase.google.com/)
2. Select project: `website-d45d9`
3. Go to: Settings ⚙️ → Project Settings
4. Scroll to "Your apps" → Web app
5. Copy the config object
6. Also verify Data Connect settings in Firebase Console

## 📊 Data Flow

```
User submits upload form
         ↓
app.js triggers: saveProductToFirebase()
         ↓
firebase-db.js calls: uploadItem()
         ↓
Data Connect sends SQL INSERT query
         ↓
Database stores item in Item table
         ↓
Function returns: { id, title, price, ... }
         ↓
Alert: "Listing created! Stored in database."
         ↓
app.js calls: loadProductsFromFirebase()
         ↓
firebase-db.js calls: getAllItems()
         ↓
Data Connect sends SQL SELECT query
         ↓
Database returns all items
         ↓
Products render on Home & Browse pages
```

## 🔧 File Structure

```
index.html
├── Includes firebase SDK
├── Imports firebase-db.js (module) ← Data Connect functions
└── Imports app.js (module) ← Main app logic

firebase-db.js (⭐ Core service)
├── initializeDataConnect()
├── getAllItems() → SELECT from SQL
├── uploadItem() → INSERT to SQL
├── getItemReviews() → JOIN with reviews
└── Other query/mutation functions

app.js (Main app logic)
├── Import from firebase-db.js
├── initializeFirebase() → Initialize Data Connect
├── loadProductsFromFirebase() → Query SQL database
├── saveProductToFirebase() → Mutate SQL database
├── Event listeners for forms
└── UI rendering functions
```

## 🐛 Troubleshooting

### Issue: "Cannot read property 'getAllItems' of undefined"

**Cause:** firebase-db.js not loaded as ES6 module

**Fix:** Verify in index.html:
```html
<script type="module" src="firebase-db.js"></script>
<script type="module" src="app.js"></script>
```

### Issue: "Data Connect not initialized"

**Cause:** Credentials not set in firebase-db.js

**Fix:** 
```javascript
const firebaseConfig = {
    apiKey: 'YOUR_ACTUAL_API_KEY',  // ← Must not be placeholder!
    // ...
};
```

### Issue: Upload form doesn't save

**Steps:**
1. Open Console (F12)
2. Try uploading
3. Look for error message in red
4. Search this guide for that error

### Issue: "Service not available" or "404"

**Cause:** Wrong service/instance IDs

**Fix:** Double-check in firebase-db.js:
```javascript
const dataConnectConfig = {
    serviceId: 'website-d45d9-service',    // ← Correct?
    location: 'us-east-4',                // ← Correct?
    instanceId: 'website-d45d9-instance', // ← Correct?
};
```

Verify these match Firebase Console → Data Connect → Service/Instance info

### Issue: Products not loading

**Debug:**
1. Console: Look for errors
2. Check Network tab: Is GraphQL query executing?
3. Firebase Console: Does database have data?

## ✨ Key Features Enabled

✅ **Upload Form**
- Title, category, description, price, type
- Stores in SQL `Item` table
- Creator ID tracked

✅ **Product Display**
- Home page: All products
- Browse page: Filtered by category
- Detail page: Full info + reviews

✅ **Search**
- Searches title & description
- Executes SQL LIKE query

✅ **Database Schema**
```sql
User (id, username, email, passwordHash, bio, avatarUrl)
Item (id, title, description, price, type, categoryId, creatorId)
Review (id, itemId, userId, rating, comment)
```

## 📚 Documentation

- Full function reference: See `DATA_CONNECT_GUIDE.md`
- Setup steps: See `SETUP_GUIDE.md`
- Firebase docs: https://firebase.google.com/docs/data-connect

## ✅ Verification Checklist

- [ ] Firebase credentials updated in firebase-db.js
- [ ] Data Connect service enabled in Firebase Console
- [ ] Console shows "✓ Firebase Data Connect initialized"
- [ ] Upload form saves item successfully
- [ ] Item appears on Home page
- [ ] Item appears on Browse page (correct category)
- [ ] Search finds the item
- [ ] Clicking item shows details
- [ ] No errors in console

## Next Steps

1. **Update Firebase config** in firebase-db.js
2. **Run tests above** to verify integration
3. **Check console** for any errors
4. **Read SETUP_GUIDE.md** for production setup
5. **Integrate authentication** (optional but recommended)

---

**Need help?** Check the console for detailed error messages. Each function logs what it's doing.
