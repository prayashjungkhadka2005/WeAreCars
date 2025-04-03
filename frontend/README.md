# WeAreCars - Frontend

This is the frontend application for WeAreCars, a car rental management system built with React, Vite, and Tailwind CSS.

## Features

### Authentication
- Staff-only login system
- JWT token-based authentication
- Protected routes
- Default credentials:
  - Username: sta001
  - Password: givemethekeys123

### Splash Screen
- Animated welcome screen
- Appears only on first visit
- Smooth fade-in/fade-out transitions
- Close button to dismiss
- Responsive design

### Car Management
- View all cars with filtering options
- Detailed car information display
- Car availability status
- Rental history tracking
- Price management

### Booking System
- Create new bookings
- View booking history
- Booking status management
- Price calculation with:
  - Base rate per car type
  - Fuel type extras
  - Additional services
  - Deposit calculation

### Dashboard
- Overview of system statistics
- Recent bookings
- Car availability status
- Quick actions for common tasks

## Tech Stack

- React 18
- Vite
- Tailwind CSS
- React Router v6
- Axios for API calls
- Headless UI components
- Heroicons

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn

## Installation

1. Clone the repository
2. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Create a `.env` file in the frontend directory:
   ```
   VITE_API_URL=http://localhost:5000
   ```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Project Structure

```
frontend/
├── src/
│   ├── components/          # Reusable components
│   │   ├── ui/             # UI components
│   │   │   ├── SplashScreen.jsx
│   │   │   └── ...
│   │   └── ...
│   ├── pages/              # Page components
│   │   ├── Login.jsx       # Staff login page
│   │   ├── Dashboard.jsx   # Main dashboard
│   │   └── ...
│   ├── services/           # API services
│   ├── utils/              # Utility functions
│   ├── hooks/              # Custom React hooks
│   ├── context/            # React context
│   └── assets/             # Static assets
├── index.html
└── package.json
```

## Key Components

### SplashScreen
- Located in `src/components/ui/SplashScreen.jsx`
- Features:
  - Welcome message
  - System overview
  - Animated transitions
  - Local storage for first visit tracking

### Login Page
- Located in `src/pages/Login.jsx`
- Features:
  - Staff authentication
  - Error handling
  - Loading states
  - Token management
  - Redirect to dashboard

## Styling

The application uses Tailwind CSS for styling with:
- Custom color scheme
- Responsive design
- Dark mode support
- Custom animations
- Component-specific styles

## API Integration

The frontend communicates with the backend API:
- Base URL: `http://localhost:5000`
- Endpoints:
  - `/api/auth/staff/login`
  - `/api/cars`
  - `/api/bookings`
  - `/api/bookings/stats`

## Development Guidelines

1. **Component Structure**
   - Use functional components
   - Implement proper prop types
   - Follow React best practices

2. **State Management**
   - Use React hooks for local state
   - Context API for global state
   - Proper error handling

3. **Styling**
   - Use Tailwind CSS classes
   - Follow mobile-first approach
   - Maintain consistent spacing

4. **Code Quality**
   - Follow ESLint rules
   - Write meaningful comments
   - Use proper naming conventions

## Getting Started

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open your browser and navigate to:
   ```
   http://localhost:5173
   ```

3. Use the default credentials to log in:
   - Username: sta001
   - Password: givemethekeys123

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License.
