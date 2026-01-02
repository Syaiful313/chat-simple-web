---
description: Phase 1 - Essential Features Implementation Plan
---

# Phase 1: Essential Features Implementation

Estimasi waktu: 1-2 minggu

## 📋 Fitur yang Akan Diimplementasikan

1. ✨ **Dark Mode**
2. ✏️ **Message Edit & Delete**
3. 🖼️ **Image Upload**
4. ⚙️ **Room Settings**
5. 👤 **User Profile Editing**

---

## 1. 🌙 Dark Mode Implementation

### Step 1.1: Install Dependencies

```bash
npm install next-themes
```

### Step 1.2: Setup Theme Provider

- Create `src/components/ThemeProvider.tsx`
- Wrap app with ThemeProvider in `layout.tsx`
- Add theme toggle button component

### Step 1.3: Update Tailwind Config

- Configure dark mode in `tailwind.config.js`
- Add dark mode variants to existing components

### Step 1.4: Create Theme Toggle Component

- Create `src/components/ThemeToggle.tsx`
- Add to header/navigation

### Files to Create/Modify:

- `src/components/ThemeProvider.tsx` (new)
- `src/components/ThemeToggle.tsx` (new)
- `src/app/layout.tsx` (modify)
- `tailwind.config.js` (modify)
- Update all page components with dark mode classes

---

## 2. ✏️ Message Edit & Delete

### Step 2.1: Update Database Schema

- Schema sudah support `edited` field
- Tambahkan `deletedAt` field untuk soft delete (optional)

### Step 2.2: Create API Endpoints

- `PATCH /api/messages/[messageId]` - Edit message
- `DELETE /api/messages/[messageId]` - Delete message

### Step 2.3: Update Socket Events

- Add `edit_message` event
- Add `delete_message` event
- Broadcast changes to room members

### Step 2.4: Update UI Components

- Add message action menu (3-dot menu)
- Add edit modal/inline editing
- Add delete confirmation dialog
- Show "edited" indicator on messages

### Files to Create/Modify:

- `src/app/api/messages/[messageId]/route.ts` (new)
- `src/components/MessageActions.tsx` (new)
- `src/components/EditMessageDialog.tsx` (new)
- `src/components/DeleteMessageDialog.tsx` (new)
- `server.ts` (modify - add socket events)
- `src/app/chat/[roomId]/page.tsx` (modify - add UI)

---

## 3. 🖼️ Image Upload

### Step 3.1: Install Dependencies

```bash
npm install uploadthing @uploadthing/react
```

### Step 3.2: Setup UploadThing

- Create UploadThing account
- Get API keys
- Add to `.env`

### Step 3.3: Create Upload API Route

- `src/app/api/uploadthing/core.ts`
- `src/app/api/uploadthing/route.ts`

### Step 3.4: Update Message Schema

- Schema sudah support `fileUrl` field
- Update message type to include IMAGE

### Step 3.5: Create Upload Component

- Image upload button in chat input
- Image preview before send
- Display images in chat

### Files to Create/Modify:

- `.env` (add UPLOADTHING keys)
- `src/app/api/uploadthing/core.ts` (new)
- `src/app/api/uploadthing/route.ts` (new)
- `src/components/ImageUpload.tsx` (new)
- `src/components/ImagePreview.tsx` (new)
- `src/app/chat/[roomId]/page.tsx` (modify)

---

## 4. ⚙️ Room Settings

### Step 4.1: Create API Endpoints

- `PATCH /api/rooms/[roomId]` - Update room details
- `DELETE /api/rooms/[roomId]` - Delete room (admin only)

### Step 4.2: Create Room Settings Dialog

- Edit room name
- Edit room description
- Change room type (PUBLIC/PRIVATE)
- Upload room avatar
- Delete room (admin only)

### Step 4.3: Add Permission Checks

- Only creator/admin can edit
- Validate user permissions

### Files to Create/Modify:

- `src/app/api/rooms/[roomId]/route.ts` (modify/create)
- `src/components/RoomSettings.tsx` (new)
- `src/components/RoomSettingsDialog.tsx` (new)
- `src/app/chat/[roomId]/page.tsx` (modify - add settings button)

---

## 5. 👤 User Profile Editing

### Step 5.1: Create API Endpoints

- `PATCH /api/user/profile` - Update user profile
- `GET /api/user/profile` - Get user profile

### Step 5.2: Create Profile Page/Dialog

- Edit username
- Edit bio
- Upload avatar
- Change password (optional)

### Step 5.3: Update UI

- Profile button in header
- Profile dialog/page
- Avatar upload component

### Files to Create/Modify:

- `src/app/api/user/profile/route.ts` (new)
- `src/app/profile/page.tsx` (new) or `src/components/ProfileDialog.tsx`
- `src/components/AvatarUpload.tsx` (new)
- `src/app/page.tsx` (modify - add profile button)

---

## 🎯 Implementation Order (Recommended)

### Week 1:

1. **Day 1-2**: Dark Mode (paling mudah, quick win)
2. **Day 3-4**: User Profile Editing
3. **Day 5**: Room Settings (basic)

### Week 2:

1. **Day 1-3**: Image Upload (butuh setup UploadThing)
2. **Day 4-5**: Message Edit & Delete

---

## 📝 Testing Checklist

### Dark Mode:

- [ ] Toggle works correctly
- [ ] Theme persists on reload
- [ ] All pages support dark mode
- [ ] No contrast issues

### Message Edit & Delete:

- [ ] Only message owner can edit/delete
- [ ] Real-time updates work
- [ ] Edited indicator shows
- [ ] Deleted messages handled properly

### Image Upload:

- [ ] Images upload successfully
- [ ] Images display in chat
- [ ] File size validation
- [ ] Loading states work

### Room Settings:

- [ ] Only admin can edit
- [ ] Changes save correctly
- [ ] Validation works
- [ ] Real-time updates

### User Profile:

- [ ] Profile updates save
- [ ] Avatar uploads work
- [ ] Validation works
- [ ] Changes reflect everywhere

---

## 🚀 Getting Started

Pilih fitur mana yang ingin dimulai terlebih dahulu, atau kita bisa mulai dengan urutan yang direkomendasikan (Dark Mode → User Profile → Room Settings → Image Upload → Message Edit/Delete).

Saya siap membantu implementasi step-by-step! 🎨
