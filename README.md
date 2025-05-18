# MOOD MORI

MOOD MORI is a social-based Emotion Log platform that helps users track and share their emotional journey. The application features a comprehensive chat system, group functionality, and location/image sharing capabilities.

## Team Members

- Andi Muhammad Alvin Farhansyah (2306161933)
- Aliya Rizqiningrum Salamun (2306161813)
- Raka Arrayan Muttaqien (2306161800)
- Filaga Tifira Muthi (2306208445)

## Features

- **Emotion Logging**: Track and monitor your emotional state
- **Chat System**:
  - Personal chat functionality
  - Group chat support
  - Image sharing capabilities
  - Location sharing
- **Social Features**:
  - User profiles
  - Group system
  - Favorites system
  - Comments and interactions
- **Dashboard**: Visual representation of mood patterns and statistics
- **Authentication**: Secure user registration and login system

## Tech Stack

### Frontend
- React (v19)
- Vite
- TailwindCSS
- React Router DOM
- React Icons
- Axios for API calls

### Backend
- Node.js with Express
- PostgreSQL database
- Cloudinary for image storage
- Authentication with bcrypt
- Session management
- Multer for file uploads

## Project Structure

```
├── backend/
│   ├── src/
│   │   ├── controllers/     # Request handlers
│   │   ├── repositories/    # Database queries
│   │   ├── routes/         # API routes
│   │   ├── utils/          # Helper functions
│   │   └── database/       # Database connection
│   └── index.js            # Entry point
└── frontend/
    ├── src/
    │   ├── api/            # API configurations
    │   ├── components/     # Reusable UI components
    │   ├── pages/          # Application views
    │   └── assets/         # Static resources
    └── index.html
```

## Setup Instructions

### Prerequisites
- Node.js
- PostgreSQL
- npm or yarn

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a .env file with necessary configurations
4. Start the development server:
   ```bash
   npm run dev
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## Features Overview

### Emotion Logging
- Create and track daily mood entries
- Add context and notes to mood logs
- View historical mood patterns
- Add images to mood entries

### Chat System
- Real-time personal and group messaging
- Image sharing in chats
- Location sharing capabilities
- Group chat management features

### Social Features
- Create and join groups
- Add posts to favorites
- Comment on mood logs
- User profile customization

### Security Features
- Secure authentication
- Protected routes
- Session management
- File upload validation
