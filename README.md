# Chat Simple Web

Aplikasi chat real-time yang dibangun dengan Next.js, Socket.io, Prisma, dan MariaDB. Aplikasi ini memungkinkan pengguna untuk berkomunikasi secara real-time dengan antarmuka yang modern dan responsif, dilengkapi dengan sistem autentikasi dan chat rooms.

## ✨ Fitur

- 🔐 **Authentication System** - Register dan login dengan email & password
- 💬 **Real-time Messaging** - Pesan terkirim dan diterima secara instan menggunakan WebSocket
- 🏠 **Chat Rooms** - Buat dan bergabung dengan room chat (Public & Private)
- 👥 **User Management** - Sistem user dengan profile dan status online/offline
- 📜 **Message History** - Menyimpan dan menampilkan riwayat pesan per room
- 🎨 **Modern UI** - Antarmuka yang clean dan responsif menggunakan Tailwind CSS
- 🔄 **Auto-scroll** - Otomatis scroll ke pesan terbaru
- ⚡ **Fast & Efficient** - Menggunakan Prisma ORM dengan MariaDB adapter
- 🔒 **Protected Routes** - Halaman chat hanya bisa diakses setelah login
- 👤 **User Profiles** - Avatar dan username untuk setiap user

## 🛠️ Tech Stack

- **Frontend:**
  - [Next.js 16](https://nextjs.org/) - React framework
  - [React 19](https://react.dev/) - UI library
  - [Tailwind CSS 4](https://tailwindcss.com/) - Utility-first CSS framework
  - [Radix UI](https://www.radix-ui.com/) - Headless UI components
  - [Lucide React](https://lucide.dev/) - Icon library
  - [Socket.io Client](https://socket.io/) - WebSocket client
  - [React Hook Form](https://react-hook-form.com/) - Form validation
  - [Zod](https://zod.dev/) - Schema validation

- **Backend:**
  - [NextAuth.js v5](https://next-auth.js.org/) - Authentication
  - [Socket.io Server](https://socket.io/) - Real-time bidirectional communication
  - [Prisma](https://www.prisma.io/) - Next-generation ORM
  - [MariaDB](https://mariadb.org/) - Database
  - [bcryptjs](https://www.npmjs.com/package/bcryptjs) - Password hashing

## 📋 Prerequisites

Sebelum memulai, pastikan Anda telah menginstall:

- Node.js (versi 20 atau lebih tinggi)
- npm, yarn, pnpm, atau bun
- MariaDB atau MySQL database

## 🚀 Getting Started

### 1. Clone Repository

```bash
git clone <repository-url>
cd chat-simple-web
```

### 2. Install Dependencies

```bash
npm install
# atau
yarn install
# atau
pnpm install
```

### 3. Setup Environment Variables

Buat file `.env` di root project dan tambahkan konfigurasi berikut:

```env
# Database
DATABASE_URL="mysql://username:password@localhost:3306/database_name"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"
```

Untuk generate `NEXTAUTH_SECRET`, jalankan:

```bash
openssl rand -base64 32
```

### 4. Setup Database

Generate Prisma Client dan push schema ke database:

```bash
npx prisma generate
npx prisma db push
```

Untuk membuka Prisma Studio (GUI untuk database):

```bash
npx prisma studio
```

### 5. Run Development Server

Jalankan Socket.io server di terminal pertama:

```bash
npm run server
```

Jalankan Next.js development server di terminal kedua:

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser Anda.

## 📁 Project Structure

```
chat-simple-web/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/          # NextAuth endpoints
│   │   │   ├── register/      # Registration endpoint
│   │   │   └── rooms/         # Room management endpoints
│   │   ├── chat/
│   │   │   └── [roomId]/      # Chat room page
│   │   ├── login/             # Login page
│   │   ├── register/          # Register page
│   │   ├── globals.css        # Global styles
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Home page (room list)
│   ├── components/
│   │   ├── ui/                # Reusable UI components
│   │   └── providers.tsx      # Session provider
│   ├── lib/
│   │   ├── auth.ts            # NextAuth configuration
│   │   ├── prisma.ts          # Prisma client
│   │   ├── utils.ts           # Utility functions
│   │   └── validations.ts     # Zod schemas
│   ├── types/
│   │   └── next-auth.d.ts     # NextAuth type definitions
│   └── generated/
│       └── prisma/            # Generated Prisma Client
├── server.ts                  # Socket.io server
├── prisma.config.ts           # Prisma configuration
└── package.json
```

## 🗄️ Database Schema

Aplikasi ini menggunakan 4 model utama:

- **User** - Menyimpan informasi pengguna (id, username, email, password, avatar, status, dll)
- **Room** - Menyimpan informasi chat room (id, name, description, type, creator, dll)
- **RoomMember** - Menyimpan membership user di room (userId, roomId, role, joinedAt)
- **Message** - Menyimpan pesan chat (id, content, type, userId, roomId, createdAt)

### Enums:

- **UserStatus**: ONLINE, OFFLINE, AWAY
- **RoomType**: PUBLIC, PRIVATE, DIRECT
- **MemberRole**: ADMIN, MODERATOR, MEMBER
- **MessageType**: TEXT, IMAGE, FILE, SYSTEM

## 🔌 Socket.io Events

### Client → Server

- `join_room` - Bergabung ke room tertentu
  ```javascript
  { roomId: string, userId: string }
  ```
- `get_room_messages` - Mengambil riwayat pesan room
  ```javascript
  roomId: string;
  ```
- `send_room_message` - Mengirim pesan ke room
  ```javascript
  { roomId: string, userId: string, username: string, content: string }
  ```
- `leave_room` - Keluar dari room
  ```javascript
  { roomId: string, userId: string }
  ```

### Server → Client

- `room_messages` - Mengirim riwayat pesan room
- `new_message` - Broadcast pesan baru ke semua member room
- `user_joined` - Notifikasi user bergabung ke room
- `user_left` - Notifikasi user keluar dari room

## 🔐 API Endpoints

### Authentication

- `POST /api/register` - Register user baru
- `POST /api/auth/signin` - Login user
- `POST /api/auth/signout` - Logout user

### Rooms

- `GET /api/rooms` - Get semua room yang accessible
- `POST /api/rooms` - Buat room baru
- `GET /api/rooms/[roomId]` - Get detail room
- `POST /api/rooms/[roomId]/join` - Join room

## 📝 Available Scripts

```bash
npm run dev      # Menjalankan Next.js development server
npm run build    # Build aplikasi untuk production
npm run start    # Menjalankan production server
npm run lint     # Menjalankan ESLint
npm run server   # Menjalankan Socket.io server
```

## 🎨 UI Components

Aplikasi ini menggunakan komponen dari:

- **Radix UI** - Avatar, Scroll Area, Dialog, Slot
- **Custom Components** - Button, Card, Input, Label (menggunakan shadcn/ui pattern)
- **Lucide Icons** - Modern icon library

## 🔧 Configuration Files

- `next.config.ts` - Konfigurasi Next.js
- `tailwind.config.js` - Konfigurasi Tailwind CSS
- `tsconfig.json` - Konfigurasi TypeScript
- `components.json` - Konfigurasi shadcn/ui
- `prisma.config.ts` - Konfigurasi Prisma

## 🌐 Ports

- **Next.js App**: `http://localhost:3000`
- **Socket.io Server**: `http://localhost:3001`
- **Prisma Studio**: `http://localhost:5555`

## 📦 Production Build

Untuk membuat production build:

```bash
npm run build
npm run start
```

Jangan lupa untuk menjalankan Socket.io server:

```bash
npm run server
```

## 🎯 Fitur yang Akan Datang

- [ ] Dark mode
- [ ] File/image upload
- [ ] Message reactions
- [ ] Typing indicator
- [ ] Direct messaging (DM)
- [ ] User search
- [ ] Room settings & management
- [ ] Message editing & deletion
- [ ] Emoji picker
- [ ] Notifications

## 📸 Screenshots

_(Coming soon)_

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
