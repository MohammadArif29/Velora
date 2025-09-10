# Velora - Smart Transportation Management

## Overview
Velora is a smart, real-time transportation management app designed exclusively for Mohan Babu University students to streamline travel between the campus and Tirupati's key destinations.

## Project Structure

```
Velora/
├── backend/                 # Node.js/Express server
│   ├── src/                # Source code
│   │   └── server.js       # Main server file
│   ├── config/             # Configuration files
│   ├── controllers/        # Route controllers
│   ├── models/            # Database models
│   ├── routes/            # API routes
│   ├── middleware/        # Custom middleware
│   └── utils/             # Utility functions
├── frontend/              # Client-side application
│   ├── pages/             # HTML pages
│   ├── css/               # Stylesheets
│   ├── js/                # JavaScript files
│   ├── images/            # Images and assets
│   ├── components/        # Reusable components
│   └── assets/            # Static assets
├── database/              # Database related files
│   ├── migrations/        # Database migrations
│   ├── seeds/             # Sample data
│   └── scripts/           # SQL scripts
└── docs/                  # Documentation
```

## Tech Stack
- **Frontend**: HTML, CSS, JavaScript, Bootstrap
- **Backend**: Node.js, Express.js
- **Database**: MySQL
- **Real-time**: Socket.io (planned)

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MySQL Server
- npm or yarn

### Installation
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   ```bash
   cp backend/config/env.example backend/.env
   ```
4. Configure your database credentials in the .env file
5. Create the database:
   ```bash
   mysql -u root -p < database/scripts/create_database.sql
   ```

### Running the Application
- Development mode: `npm run dev`
- Production mode: `npm start`

## Features (Planned)
- Student and Driver registration/login
- Real-time ride booking and matching
- Transparent fare calculation
- Live tracking with Google Maps integration
- Ride sharing/pooling options
- Admin panel for management
- AI-powered demand prediction
- Data analytics dashboard

## Color Palette
- **Primary**: Deep Violet (#5A31F4)
- **Secondary**: Electric Blue (#2CE5FF)
- **Accent**: Neon Green (#20E3B2)
- **Alert**: Bright Pink (#FF4ECD)

## License
MIT License

## Team
Velora Development Team
