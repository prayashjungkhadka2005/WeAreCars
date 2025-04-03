# WeAreCars - Car Rental Management System

A full-stack car rental management system built with React, Node.js, and MongoDB.

## Project Overview

WeAreCars is a comprehensive car rental management system that allows staff members to manage car rentals, process bookings, and maintain an inventory of vehicles.

### Key Features

- Staff authentication system
- Car rental booking system
- Real-time car inventory management
- Price calculation with various options
- Form validation and error handling
- Modern, responsive user interface

## Tech Stack

### Frontend
- React.js
- Tailwind CSS
- React Router
- Formik & Yup
- Axios

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/wearecars.git
   cd wearecars
   ```

2. Install Frontend Dependencies:
   ```bash
   cd frontend
   npm install
   ```

3. Install Backend Dependencies:
   ```bash
   cd ../backend
   npm install
   ```

4. Set up environment variables:
   - Copy `.env.example` to `.env` in both frontend and backend directories
   - Update the variables as needed

5. Start the development servers:

   Backend:
   ```bash
   cd backend
   npm run dev
   ```

   Frontend:
   ```bash
   cd frontend
   npm start
   ```

## Project Structure

```
wearecars/
├── frontend/          # React frontend application
├── backend/           # Node.js backend application
└── README.md          # This file
```

## Documentation

- [Frontend Documentation](./frontend/README.md)
- [Backend Documentation](./backend/README.md)

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 