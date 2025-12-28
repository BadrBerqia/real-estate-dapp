# Real Estate Platform - Frontend Integration Guide

This document provides comprehensive information for frontend developers to integrate with the Real Estate Platform backend APIs.

## Table of Contents
- [Architecture Overview](#architecture-overview)
- [Base URL & Authentication](#base-url--authentication)
- [API Endpoints](#api-endpoints)
  - [User Service](#user-service)
  - [Property Service](#property-service)
  - [Rental Service](#rental-service)
  - [Payment Service](#payment-service)
  - [Blockchain Service](#blockchain-service)
- [Data Models](#data-models)
- [Error Handling](#error-handling)
- [Example Usage](#example-usage)

---

## Architecture Overview

The backend uses a **microservices architecture** with the following components:

- **API Gateway**: Single entry point for all requests (Port: `8080`)
- **Service Discovery**: Eureka server for service registration (Port: `8761`)
- **User Service**: Manages user registration and profiles
- **Property Service**: Handles property listings
- **Rental Service**: Manages rental bookings
- **Payment Service**: Processes payments
- **Blockchain Service**: Interacts with blockchain for transparency

All frontend requests should go through the **API Gateway** at `http://localhost:8080`.

---

## Base URL & Authentication

### Base URL
```
http://localhost:8080
```

When deployed, replace `localhost:8080` with your production API Gateway URL.

### Authentication
Currently, the API uses **wallet-based authentication**. Users are identified by their blockchain wallet addresses. Future enhancements may include JWT tokens.

---

## API Endpoints

### User Service

Base path: `/api/users`

#### 1. Register User
**POST** `/api/users/register`

Register a new user with their wallet address.

**Request Body:**
```json
{
  "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "username": "john_doe",
  "email": "john@example.com",
  "role": "RENTER"
}
```

**Response:** `200 OK`
```json
{
  "id": 1,
  "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "username": "john_doe",
  "email": "john@example.com",
  "role": "RENTER"
}
```

**Notes:**
- `walletAddress` must be unique
- `role` can be `OWNER` or `RENTER`

---

#### 2. Get User by Wallet Address
**GET** `/api/users/{walletAddress}`

Retrieve user information by wallet address.

**Example:**
```
GET /api/users/0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb
```

**Response:** `200 OK`
```json
{
  "id": 1,
  "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "username": "john_doe",
  "email": "john@example.com",
  "role": "RENTER"
}
```

**Error Response:** `404 Not Found` if user doesn't exist

---

### Property Service

Base path: `/api/properties`

#### 1. Get All Properties
**GET** `/api/properties`

Retrieve all available properties.

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "title": "Modern Downtown Apartment",
    "description": "A beautiful 2-bedroom apartment in the heart of downtown",
    "location": "123 Main St, New York, NY",
    "pricePerDay": 150.00,
    "ownerAddress": "0x1234567890abcdef1234567890abcdef12345678",
    "isAvailable": true,
    "imageUrl": "https://example.com/image.jpg"
  }
]
```

---

#### 2. Create Property
**POST** `/api/properties`

Create a new property listing (for property owners).

**Request Body:**
```json
{
  "title": "Modern Downtown Apartment",
  "description": "A beautiful 2-bedroom apartment in the heart of downtown",
  "location": "123 Main St, New York, NY",
  "pricePerDay": 150.00,
  "ownerAddress": "0x1234567890abcdef1234567890abcdef12345678",
  "imageUrl": "https://example.com/image.jpg"
}
```

**Validation Rules:**
- `title`: Required, cannot be blank
- `description`: Required, cannot be blank
- `location`: Required, cannot be blank
- `pricePerDay`: Required, must be greater than 0
- `ownerAddress`: Required, cannot be blank
- `imageUrl`: Optional

**Response:** `201 Created`
```json
{
  "id": 1,
  "title": "Modern Downtown Apartment",
  "description": "A beautiful 2-bedroom apartment in the heart of downtown",
  "location": "123 Main St, New York, NY",
  "pricePerDay": 150.00,
  "ownerAddress": "0x1234567890abcdef1234567890abcdef12345678",
  "isAvailable": true,
  "imageUrl": "https://example.com/image.jpg"
}
```

---

#### 3. Get Property by ID
**GET** `/api/properties/{id}`

Retrieve a specific property by its ID.

**Example:**
```
GET /api/properties/1
```

**Response:** `200 OK`
```json
{
  "id": 1,
  "title": "Modern Downtown Apartment",
  "description": "A beautiful 2-bedroom apartment in the heart of downtown",
  "location": "123 Main St, New York, NY",
  "pricePerDay": 150.00,
  "ownerAddress": "0x1234567890abcdef1234567890abcdef12345678",
  "isAvailable": true,
  "imageUrl": "https://example.com/image.jpg"
}
```

**Error Response:** `404 Not Found` if property doesn't exist

---

#### 4. Get Properties by Owner
**GET** `/api/properties/owner/{address}`

Get all properties owned by a specific wallet address.

**Example:**
```
GET /api/properties/owner/0x1234567890abcdef1234567890abcdef12345678
```

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "title": "Modern Downtown Apartment",
    "description": "A beautiful 2-bedroom apartment in the heart of downtown",
    "location": "123 Main St, New York, NY",
    "pricePerDay": 150.00,
    "ownerAddress": "0x1234567890abcdef1234567890abcdef12345678",
    "isAvailable": true,
    "imageUrl": "https://example.com/image.jpg"
  }
]
```

---

### Rental Service

Base path: `/api/rentals`

#### 1. Create Rental
**POST** `/api/rentals`

Create a new rental booking.

**Request Body:**
```json
{
  "propertyId": 1,
  "renterAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "startDate": "2025-01-15",
  "endDate": "2025-01-20",
  "totalPrice": 750.00,
  "status": "PENDING"
}
```

**Response:** `200 OK`
```json
{
  "id": 1,
  "propertyId": 1,
  "renterAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "startDate": "2025-01-15",
  "endDate": "2025-01-20",
  "totalPrice": 750.00,
  "status": "PENDING",
  "transactionHash": null
}
```

**Status Values:**
- `PENDING`: Rental created, awaiting confirmation
- `ACTION_REQUIRED`: User action needed (e.g., payment)
- `ACTIVE`: Rental is active
- `COMPLETED`: Rental completed
- `CANCELLED`: Rental cancelled

---

#### 2. Get My Rentals
**GET** `/api/rentals/my-rentals?address={walletAddress}`

Get all rentals for a specific renter.

**Example:**
```
GET /api/rentals/my-rentals?address=0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb
```

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "propertyId": 1,
    "renterAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    "startDate": "2025-01-15",
    "endDate": "2025-01-20",
    "totalPrice": 750.00,
    "status": "ACTIVE",
    "transactionHash": "0xabcdef..."
  }
]
```

---

#### 3. Update Rental Status
**PATCH** `/api/rentals/{id}/status?status={status}&txHash={transactionHash}`

Update the status of a rental (e.g., after payment confirmation).

**Example:**
```
PATCH /api/rentals/1/status?status=ACTIVE&txHash=0xabcdef1234567890
```

**Response:** `200 OK`
```json
{
  "id": 1,
  "propertyId": 1,
  "renterAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "startDate": "2025-01-15",
  "endDate": "2025-01-20",
  "totalPrice": 750.00,
  "status": "ACTIVE",
  "transactionHash": "0xabcdef1234567890"
}
```

---

### Payment Service

Base path: `/api/payments`

#### 1. Create Payment
**POST** `/api/payments`

Process a payment for a rental.

**Request Body:**
```json
{
  "rentalId": 1,
  "payerAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "amount": 750.00,
  "currency": "ETH",
  "status": "PENDING",
  "timestamp": "2025-01-10T10:30:00"
}
```

**Currency Options:**
- `USD`: US Dollar
- `ETH`: Ethereum

**Status Options:**
- `PENDING`: Payment initiated
- `COMPLETED`: Payment successful
- `FAILED`: Payment failed

**Response:** `200 OK`
```json
{
  "id": 1,
  "rentalId": 1,
  "payerAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "amount": 750.00,
  "currency": "ETH",
  "status": "COMPLETED",
  "transactionHash": "0xabcdef1234567890",
  "timestamp": "2025-01-10T10:30:00"
}
```

---

#### 2. Get Payment by ID
**GET** `/api/payments/{id}`

Retrieve payment details by ID.

**Example:**
```
GET /api/payments/1
```

**Response:** `200 OK`
```json
{
  "id": 1,
  "rentalId": 1,
  "payerAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "amount": 750.00,
  "currency": "ETH",
  "status": "COMPLETED",
  "transactionHash": "0xabcdef1234567890",
  "timestamp": "2025-01-10T10:30:00"
}
```

---

#### 3. Get Payments by Rental
**GET** `/api/payments/rental/{rentalId}`

Get all payments associated with a rental.

**Example:**
```
GET /api/payments/rental/1
```

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "rentalId": 1,
    "payerAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    "amount": 750.00,
    "currency": "ETH",
    "status": "COMPLETED",
    "transactionHash": "0xabcdef1234567890",
    "timestamp": "2025-01-10T10:30:00"
  }
]
```

---

### Blockchain Service

Base path: `/api/blockchain`

#### 1. Get Current Block Number
**GET** `/api/blockchain/block-number`

Get the current blockchain block number.

**Response:** `200 OK`
```json
12345678
```

---

#### 2. Get Wallet Balance
**GET** `/api/blockchain/balance/{address}`

Get the balance of a wallet address (in ETH).

**Example:**
```
GET /api/blockchain/balance/0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb
```

**Response:** `200 OK`
```json
1.5
```

---

## Data Models

### User
```typescript
interface User {
  id: number;
  walletAddress: string;  // Unique, required
  username: string;
  email: string;
  role: "OWNER" | "RENTER";
}
```

### Property
```typescript
interface Property {
  id: number;
  title: string;
  description: string;
  location: string;
  pricePerDay: number;
  ownerAddress: string;
  isAvailable: boolean;
  imageUrl: string;
}
```

### Rental
```typescript
interface Rental {
  id: number;
  propertyId: number;
  renterAddress: string;
  startDate: string;  // ISO 8601 date format: YYYY-MM-DD
  endDate: string;    // ISO 8601 date format: YYYY-MM-DD
  totalPrice: number;
  status: "PENDING" | "ACTION_REQUIRED" | "ACTIVE" | "COMPLETED" | "CANCELLED";
  transactionHash?: string;
}
```

### Payment
```typescript
interface Payment {
  id: number;
  rentalId: number;
  payerAddress: string;
  amount: number;
  currency: "USD" | "ETH";
  status: "PENDING" | "COMPLETED" | "FAILED";
  transactionHash?: string;
  timestamp: string;  // ISO 8601 datetime format
}
```

---

## Error Handling

The API uses standard HTTP status codes:

- **200 OK**: Request successful
- **201 Created**: Resource created successfully
- **400 Bad Request**: Invalid request (validation errors)
- **404 Not Found**: Resource not found
- **500 Internal Server Error**: Server error

### Validation Errors

When validation fails (e.g., missing required fields), you'll receive a `400 Bad Request` with error details:

```json
{
  "timestamp": "2025-01-10T10:30:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed",
  "errors": [
    {
      "field": "title",
      "message": "Title is required"
    }
  ]
}
```

---

## Example Usage

### Complete Rental Flow

Here's a typical flow for a user renting a property:

#### 1. Register User
```javascript
const registerUser = async (walletAddress) => {
  const response = await fetch('http://localhost:8080/api/users/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      walletAddress: walletAddress,
      username: "john_doe",
      email: "john@example.com",
      role: "RENTER"
    })
  });
  return await response.json();
};
```

#### 2. Browse Properties
```javascript
const getProperties = async () => {
  const response = await fetch('http://localhost:8080/api/properties');
  return await response.json();
};
```

#### 3. Create Rental Booking
```javascript
const createRental = async (propertyId, renterAddress) => {
  const response = await fetch('http://localhost:8080/api/rentals', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      propertyId: propertyId,
      renterAddress: renterAddress,
      startDate: "2025-01-15",
      endDate: "2025-01-20",
      totalPrice: 750.00,
      status: "PENDING"
    })
  });
  return await response.json();
};
```

#### 4. Process Payment
```javascript
const processPayment = async (rentalId, payerAddress, txHash) => {
  const response = await fetch('http://localhost:8080/api/payments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      rentalId: rentalId,
      payerAddress: payerAddress,
      amount: 750.00,
      currency: "ETH",
      status: "COMPLETED",
      transactionHash: txHash,
      timestamp: new Date().toISOString()
    })
  });
  return await response.json();
};
```

#### 5. Update Rental Status
```javascript
const updateRentalStatus = async (rentalId, txHash) => {
  const response = await fetch(
    `http://localhost:8080/api/rentals/${rentalId}/status?status=ACTIVE&txHash=${txHash}`,
    { method: 'PATCH' }
  );
  return await response.json();
};
```

---

## Testing with Postman

You can import the following Postman collection to test the APIs:

### Sample Postman Requests

1. **Register User**
   - Method: POST
   - URL: `http://localhost:8080/api/users/register`
   - Body (raw JSON):
   ```json
   {
     "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
     "username": "john_doe",
     "email": "john@example.com",
     "role": "RENTER"
   }
   ```

2. **Get All Properties**
   - Method: GET
   - URL: `http://localhost:8080/api/properties`

3. **Create Property**
   - Method: POST
   - URL: `http://localhost:8080/api/properties`
   - Body (raw JSON):
   ```json
   {
     "title": "Modern Downtown Apartment",
     "description": "A beautiful 2-bedroom apartment",
     "location": "123 Main St, New York, NY",
     "pricePerDay": 150.00,
     "ownerAddress": "0x1234567890abcdef1234567890abcdef12345678",
     "imageUrl": "https://example.com/image.jpg"
   }
   ```

---

## Additional Notes

### CORS Configuration
The API Gateway is configured to accept requests from any origin during development. In production, this should be restricted to your frontend domain.

### Date Formats
All dates should be in ISO 8601 format:
- Date only: `YYYY-MM-DD` (e.g., `2025-01-15`)
- DateTime: `YYYY-MM-DDTHH:mm:ss` (e.g., `2025-01-15T10:30:00`)

### Blockchain Integration
The blockchain service currently supports:
- Getting the current block number
- Checking wallet balances

Additional blockchain functionality (smart contracts, transactions) can be added as needed.

---

## Support

For questions or issues, please contact the backend development team or create an issue in the project repository.

**Happy coding! 🚀**
