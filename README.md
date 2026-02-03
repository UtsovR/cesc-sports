# CESC Officers' Sports Club Website

A premium, full-stack web application designed for the CESC Officers' Sports Club. This platform streamlines event management, member interactions, and showcases the club's prestigious history through a modern, responsive interface.

## 🚀 Key Features

- **🏆 Hall of Fame**: Dynamic showcase of past winners and sports achievements.
- **📅 Event Management**: Interactive calendar and registration system for upcoming sports events.
- **🖼️ Gallery Module**: High-performance masonry-style gallery with lightbox support.
- **🛡️ Admin Dashboard**: Secure CMS to manage events, registrations, and feedback.
- **✨ Premium UI/UX**: Modern glassmorphism design with fluid animations and responsive layouts.
- **📝 Feedback System**: Integrated member feedback and experience rating collection.

## 🛠️ Tech Stack

### Frontend
- **React 18** with **TypeScript**
- **Vite** for optimized build tooling
- **Tailwind CSS** for modern styling
- **Lucide React** for consistent iconography
- **Framer Motion** for smooth transitions

### Backend
- **Node.js** & **Express**
- **SQLite** for lightweight, reliable data persistence
- **RESTful API** architecture

## 📦 Project Structure

```text
├── src/                # Frontend source code
│   ├── components/     # Reusable UI components
│   ├── assets/         # Static frontend assets
│   └── App.tsx         # Main application entry
├── server/             # Backend Node.js server
│   ├── index.js        # Express API routes
│   └── database.js     # Database schema & logic
├── public/             # Static public assets
└── package.json        # Project dependencies
```

## ⚙️ Getting Started

### Prerequisites
- Node.js (v18.x or later)
- npm (v9.x or later)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/UtsovR/cesc-sports-club-website.git
   cd cesc-sports-club-website
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Running the Application**
   For development (frontend & backend concurrently):
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:5173`.

## 🔒 Admin Access
The administrative dashboard provides full control over content. For security reasons, administrative credentials should be managed via environment variables on the server.

## 📄 License
Private and Confidential. © 2024 CESC Officers' Sports Club. All rights reserved.
