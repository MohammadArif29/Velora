# Velora - Smart Transportation Management System

## Overview
Velora is a comprehensive real-time transportation management system designed exclusively for Mohan Babu University students, providing seamless travel services between the campus and key destinations in Tirupati. The platform connects students with verified auto-rickshaw drivers through a modern, user-friendly interface.

## Features

### For Students
- **User Authentication**
  - Secure login/signup system
  - Password reset functionality
  - Email verification

- **Ride Management**
  - Real-time ride booking with location selection
  - Google Maps integration for accurate location picking
  - Fare calculation based on distance
  - Special instructions for drivers
  - Live ride tracking
  - Ride history view
  - Ride rating system

- **Payment System**
  - Digital wallet integration
  - Multiple payment methods support
  - Transaction history
  - Auto-payment after ride completion

- **Profile Management**
  - Personal information management
  - Ride preferences
  - Notification settings

### For Drivers (Captains)
- **Account Management**
  - Professional profile setup
  - KYC verification system
  - Vehicle information management
  - Document uploads

- **Ride Operations**
  - Real-time ride requests
  - Accept/reject ride functionality
  - Navigation assistance
  - Earnings tracking
  - Daily/weekly/monthly reports

### For Administrators
- **User Management**
  - Student account oversight
  - Driver verification
  - KYC approval system
  - User activity monitoring

- **System Management**
  - Ride monitoring
  - Payment tracking
  - Analytics dashboard
  - Rate management
  - System configuration

## Tech Stack

### Frontend
- HTML5, CSS3, JavaScript
- Google Maps API integration
- Real-time updates with WebSocket
- Responsive design with mobile-first approach
- Dark/Light theme support with system-wide consistency
- AI-powered chatbot with Gemini integration

### Backend
- Node.js
- Express.js
- RESTful API architecture
- JWT authentication
- Real-time WebSocket server

### Database
- MySQL
- Structured for:
  - User management
  - Ride tracking
  - Payment processing
  - Activity logging

## Project Structure
```
Velora/
├── backend/                 # Node.js/Express server
│   ├── config/             # Configuration files
│   ├── middleware/         # Custom middleware (auth, validation)
│   ├── models/            # Database models
│   ├── routes/            # API endpoints
│   ├── services/          # Business logic services
│   └── src/               # Core server files
├── frontend/              # Client-side application
│   ├── admin/            # Admin dashboard
│   ├── css/              # Stylesheets
│   ├── js/               # JavaScript files
│   └── pages/            # HTML pages
└── database/             # Database scripts and migrations
```

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MySQL Server
- npm or yarn

### Setup Steps
1. Clone the repository:
   ```bash
   git clone https://github.com/MohammadArif29/Velora.git
   cd Velora
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment:
   ```bash
   cp backend/config/env.example backend/.env
   ```

4. Set up database:
   ```bash
   mysql -u root -p < database/scripts/create_database.sql
   ```

5. Start the application:
   - Development: `npm run dev`
   - Production: `npm start`

## Design System

### Color Palette
- Primary: Deep Violet (#5A31F4)
- Secondary: Electric Blue (#2CE5FF)
- Accent: Neon Green (#20E3B2)
- Alert: Bright Pink (#FF4ECD)
- Background: Dynamic (Light/Dark theme support)

### Theme Support
- Light and Dark mode with consistent UI across all components
- Automatic system preference detection
- Manual toggle option with smooth transitions
- Persistent user preference
- Instagram-inspired dark theme design
- Theme-aware components (including chatbot interface)

## Chatbot Assistant
- AI-powered support using Google's Gemini API
- Intelligent responses for transportation queries
- Theme-aware Instagram-inspired interface
- Real-time interaction with smooth animations
- Context-aware responses about Velora services
- Seamless integration with the main application

## Security Features
- JWT-based authentication
- Password hashing
- Input validation
- XSS protection
- Rate limiting
- CORS configuration

## License
MIT License - see LICENSE file for details

## Team
Velora Development Team

## Status
Active Development - Version 1.0
