# WeAreCars Backend API

A comprehensive car rental management system API built with Node.js, Express, and MongoDB.

## Features

- Staff authentication and authorization
- Car management (CRUD operations)
- Booking management with pricing calculations
- Rental history tracking
- Booking statistics and analytics
- Car availability checking
- Secure JWT-based authentication

## API Endpoints

### Authentication Routes
- `POST /api/auth/staff/register` - Register new staff member
- `POST /api/auth/staff/login` - Staff login

### Car Routes
- `GET /api/cars` - Get all cars (with filters)
- `GET /api/cars/:id` - Get single car
- `POST /api/cars` - Create new car
- `PUT /api/cars/:id` - Update car
- `DELETE /api/cars/:id` - Delete car
- `GET /api/cars/check/availability` - Check car availability
- `GET /api/cars/:id/rental-history` - Get car's rental history

### Booking Routes
- `GET /api/bookings` - Get all bookings
- `GET /api/bookings/:id` - Get single booking
- `POST /api/bookings` - Create new booking
- `PUT /api/bookings/:id` - Update booking
- `DELETE /api/bookings/:id` - Delete booking
- `GET /api/bookings/stats` - Get booking statistics

## Data Models

### User (Staff)
```javascript
{
  username: String,
  email: String,
  password: String,
  firstName: String,
  lastName: String,
  phoneNumber: String,
  address: String,
  role: String // 'staff'
}
```

### Car
```javascript
{
  brand: String,
  model: String,
  type: String, // 'City car', 'Family car', 'Sports car', 'SUV'
  fuelType: String, // 'Petrol', 'Diesel', 'Hybrid', 'Full electric'
  pricePerDay: Number,
  isAvailable: Boolean,
  rentalHistory: [{
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
    startDate: Date,
    endDate: Date
  }]
}
```

### Booking
```javascript
{
  car: { type: mongoose.Schema.Types.ObjectId, ref: 'Car' },
  customer: {
    firstName: String,
    surname: String,
    email: String,
    phoneNumber: String,
    address: String
  },
  rentalDetails: {
    startDate: Date,
    endDate: Date,
    numberOfDays: Number,
    extras: {
      unlimitedMileage: Boolean,
      breakdownCover: Boolean
    }
  },
  pricing: {
    basePrice: Number,
    carTypeExtra: Number,
    fuelTypeExtra: Number,
    extrasPrice: Number,
    totalPrice: Number,
    deposit: Number
  },
  status: String // 'pending', 'confirmed', 'completed', 'cancelled'
}
```

## Pricing Structure

### Base Prices
- City car: £25 per day
- Family car: £75 per day (£25 + £50)
- Sports car: £100 per day (£25 + £75)
- SUV: £90 per day (£25 + £65)

### Fuel Type Extras
- Hybrid: +£30 per day
- Full electric: +£50 per day

### Additional Extras
- Unlimited mileage: £10 per day
- Breakdown cover: £2 per day

### Deposit
- 20% of total booking price

## Authentication

All routes except staff registration and login require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## Error Handling

The API returns appropriate HTTP status codes and error messages:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Server Error

## Environment Variables

Create a `.env` file in the root directory with:
```
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables

3. Start the server:
```bash
npm start
```

## Testing

Test the API endpoints using Postman or any API testing tool. Default staff credentials:
- Username: sta001
- Password: givemethekeys123 