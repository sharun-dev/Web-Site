# Cloudinary Upload Setup Guide

## ✅ Fixed: Upload Error Resolution

The `net::ERR_CONNECTION_CLOSED` error has been fixed! The upload now uses a direct upload method instead of the upload widget.

## 🔧 Setup Required: Create Unsigned Upload Preset

To enable image uploads from your marketplace, you need to create an **unsigned upload preset** in your Cloudinary dashboard.

### Steps:

1. **Go to Cloudinary Dashboard**
   - Visit: https://cloudinary.com/console
   - Login with your account

2. **Navigate to Upload Settings**
   - Click on **Settings** (gear icon) in the top right
   - Select **Upload** tab
   - Look for **Upload presets** section

3. **Create New Preset**
   - Click **Add upload preset**
   - Configure:
     - **Name**: `unsigned_talenttrade` (IMPORTANT - must match exactly)
     - **Unsigned**: Toggle **ON** (this is critical)
     - **Folder**: `talenttrade/listings` (optional but recommended)
     - **Resource type**: Image
     - **Save**: Click to save the preset

4. **Verify Your Settings**
   - Cloud Name: `new-major-26` ✓
   - Upload Preset: `unsigned_talenttrade` ✓
   - API Key: `963188428949552` (for reference)

## 🎯 What This Does

When you click "📤 Upload Image" in the marketplace or dashboard:
1. A file picker appears
2. Select an image (JPG, PNG, GIF, WebP - max 5MB)
3. Image uploads directly to Cloudinary
4. Secure URL is auto-filled in the form
5. Preview displays in real-time
6. Item is created with Cloudinary-hosted image

## ✨ Features

- ✅ Client-side direct upload (no server needed)
- ✅ Works offline for file selection
- ✅ Automatic image preview
- ✅ 5MB file size limit
- ✅ Supported formats: JPG, PNG, GIF, WebP
- ✅ Images stored in `talenttrade/listings` folder
- ✅ Secure HTTPS URLs returned

## 🐛 Troubleshooting

**Issue**: "Upload failed" error
- **Solution**: Verify the unsigned upload preset `unsigned_talenttrade` exists

**Issue**: File browser doesn't open
- **Solution**: Check browser console (F12) for errors

**Issue**: Upload succeeds but image doesn't appear
- **Solution**: Check the Image URL field in the form - it should have the Cloudinary URL

## 📝 Code Reference

**Homepage Upload** (`index.html`):
- Button: `id="cloudinaryUploadBtn"`
- URL Input: `id="cloudinaryImageUrl"`
- Status Text: `id="cloudinaryFileName"`

**Dashboard Upload** (`dashboard.html`):
- Button: `id="dashboardCloudinaryBtn"`
- URL Input: `id="dashboardImageUrl"`
- Status Text: `id="dashboardImageStatus"`

Both use the same Cloudinary API endpoint:
```
https://api.cloudinary.com/v1_1/new-major-26/image/upload
```

## 🔐 Security Note

- The upload preset is **unsigned** = no API secrets exposed
- Only image files allowed (secure format filtering)
- File size limited to 5MB (rate limiting)
- Images stored in dedicated folder for organization

---

**Once you create the preset, image uploads will work immediately!** 🚀
