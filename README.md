# Chat Simple Web

Aplikasi chat real-time yang dibangun dengan Next.js, Socket.io, Prisma, dan MariaDB. Aplikasi ini memungkinkan pengguna untuk berkomunikasi secara real-time dengan antarmuka yang modern dan responsif.

## ✨ Fitur

- 💬 **Real-time Messaging** - Pesan terkirim dan diterima secara instan menggunakan WebSocket
- 👤 **User Management** - Sistem username otomatis dengan pembuatan user baru
- 📜 **Message History** - Menyimpan dan menampilkan riwayat pesan
- 🎨 **Modern UI** - Antarmuka yang clean dan responsif menggunakan Tailwind CSS
- 🔄 **Auto-scroll** - Otomatis scroll ke pesan terbaru
- ⚡ **Fast & Efficient** - Menggunakan Prisma ORM dengan MariaDB adapter

## 🛠️ Tech Stack

- **Frontend:**
  - [Next.js 16](https://nextjs.org/) - React framework
  - [React 19](https://react.dev/) - UI library
  - [Tailwind CSS 4](https://tailwindcss.com/) - Utility-first CSS framework
  - [Radix UI](https://www.radix-ui.com/) - Headless UI components
  - [Lucide React](https://lucide.dev/) - Icon library
  - [Socket.io Client](https://socket.io/) - WebSocket client

- **Backend:**
  - [Socket.io Server](https://socket.io/) - Real-time bidirectional communication
  - [Prisma](https://www.prisma.io/) - Next-generation ORM
  - [MariaDB](https://mariadb.org/) - Database
  - [Node.js HTTP Server](https://nodejs.org/) - WebSocket server

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

Buat file `.env` di root project dan tambahkan konfigurasi database:

```env
DATABASE_URL="mysql://username:password@localhost:3306/database_name"
```

### 4. Setup Database

Generate Prisma Client dan migrate database:

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
│   │   ├── globals.css        # Global styles
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Chat page
│   ├── components/
│   │   └── ui/                # Reusable UI components
│   ├── generated/
│   │   └── prisma/            # Generated Prisma Client
│   └── lib/
│       └── utils.ts           # Utility functions
├── server.ts                  # Socket.io server
├── prisma.config.ts           # Prisma configuration
└── package.json
```

## 🗄️ Database Schema

Aplikasi ini menggunakan dua model utama:

- **User** - Menyimpan informasi pengguna (id, username, createdAt)
- **Message** - Menyimpan pesan chat (id, content, createdAt, userId)

## 🔌 Socket.io Events

### Client → Server

- `get_messages` - Mengambil riwayat pesan
- `send_message` - Mengirim pesan baru
  ```javascript
  { username: string, content: string }
  ```

### Server → Client

- `initial_messages` - Mengirim riwayat pesan awal
- `receive_message` - Broadcast pesan baru ke semua client

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

- **Radix UI** - Avatar, Scroll Area, Slot
- **Custom Components** - Button, Card, Input (menggunakan shadcn/ui pattern)

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

## 🤝 Contributing

Kontribusi selalu diterima! Silakan buat pull request atau buka issue untuk saran dan perbaikan.

## 📄 License

This project is private and proprietary.

---

Built with ❤️ using Next.js and Socket.io
