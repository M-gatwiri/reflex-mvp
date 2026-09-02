# Reflex

A delivery coordination MVP for small Kenyan retailers. Reflex replaces informal WhatsApp and phone-based delivery coordination with a structured workflow that provides visibility into delivery status, clear rider assignment, and a reliable request history.

**Stack:** React + Vite | Node.js + Express | MongoDB

---

## Problem

Small retailers in Kenya currently coordinate deliveries through WhatsApp and phone calls. This informal process creates:

- **No reliable record** of delivery requests
- **No clear assignment** of riders to deliveries
- **No visibility** into delivery status
- **No audit trail** of delivery history

Reflex transforms this into a structured, visible workflow.

---

## Core Features

### User Roles

| Role | Responsibilities |
|------|------------------|
| **Retailer** | Creates delivery requests; tracks delivery progress from creation to completion |
| **Dispatcher** | Views open delivery requests; assigns available riders to deliveries |
| **Rider** | Views assigned deliveries; updates delivery status through the workflow |

### Delivery Workflow

Deliveries progress through a strict state machine:

```
OPEN → ASSIGNED → PICKED_UP → DELIVERED
```

- **OPEN**: Delivery request created, waiting for dispatcher assignment
- **ASSIGNED**: Rider has been assigned by dispatcher
- **PICKED_UP**: Rider has collected the item
- **DELIVERED**: Item has reached the customer

The backend enforces these transitions and prevents invalid status changes. The assignment endpoint also prevents double-assignment by only allowing transitions from `OPEN` status.

### Current Capabilities

- ✓ Retailer delivery creation with customer details
- ✓ Retailer delivery tracking with timeline visualization
- ✓ Dispatcher delivery management and rider assignment
- ✓ Rider delivery workflow with status updates
- ✓ Delivery status history and audit trail
- ✓ Backend state-transition validation
- ✓ Prevention of delivery reassignment
- ✓ Responsive user interface
- ✓ Role-based demo views

---

## Architecture

```
┌─────────────────────┐
│   React Frontend    │
│  (Vite + Axios)     │
└──────────┬──────────┘
           │
           ↓ REST API
┌──────────────────────┐
│  Express Backend     │
│  (Node.js + CORS)    │
└──────────┬───────────┘
           │
           ↓ Mongoose ODM
┌──────────────────────┐
│     MongoDB          │
│  (Users, Deliveries, │
│  Status History)     │
└──────────────────────┘
```

**Design principles:**

- **React** handles the user interface and role-based workflow screens
- **Express** exposes the REST API for all delivery and user operations
- **MongoDB** stores users, deliveries, and status history as documents
- **Backend validation** enforces delivery state transitions—the frontend guides users through valid actions but is not treated as the security boundary
- **Status history** is stored separately to preserve an audit trail of all transitions

---

## API Reference

### Deliveries

#### `GET /api/deliveries`

Returns all deliveries, sorted by creation date (newest first).

**Response:**
```json
[
  {
    "_id": "...",
    "retailerId": "...",
    "customerName": "Jane Wanjiku",
    "customerPhone": "0712345678",
    "address": "Westlands, Nairobi",
    "itemDescription": "Samsung Galaxy A15",
    "riderId": null,
    "riderName": null,
    "status": "OPEN",
    "createdAt": "2026-09-02T19:00:00Z",
    "updatedAt": "2026-09-02T19:00:00Z"
  }
]
```

#### `POST /api/deliveries`

Creates a new delivery request.

**Request body:**
```json
{
  "retailerId": "demo-retailer",
  "customerName": "Jane Wanjiku",
  "customerPhone": "0712345678",
  "address": "Westlands, Nairobi",
  "itemDescription": "Samsung Galaxy A15"
}
```

**Response:** 201 Created with delivery object.

#### `PATCH /api/deliveries/:id/assign`

Assigns a rider to an open delivery.

**Request body:**
```json
{
  "riderId": "..."
}
```

**Behavior:**
- Only assigns deliveries with status `OPEN`
- Returns 409 Conflict if delivery is no longer open
- Updates delivery status to `ASSIGNED`
- Creates a status history entry

**Response:** 200 OK with updated delivery object.

#### `PATCH /api/deliveries/:id/status`

Updates the delivery status.

**Request body:**
```json
{
  "status": "PICKED_UP"
}
```

**Behavior:**
- Validates allowed transitions using the state machine
- Valid transitions:
  - `OPEN` → `ASSIGNED` (only via `/assign` endpoint)
  - `ASSIGNED` → `PICKED_UP`
  - `PICKED_UP` → `DELIVERED`
  - `DELIVERED` → (no further transitions)
- Returns 400 Bad Request for invalid transitions
- Creates a status history entry

**Response:** 200 OK with updated delivery object.

#### `GET /api/deliveries/:id/history`

Returns the status history for a delivery, sorted by creation date (oldest first).

**Response:**
```json
[
  {
    "_id": "...",
    "deliveryId": "...",
    "previousStatus": "OPEN",
    "newStatus": "ASSIGNED",
    "changedBy": "demo-user",
    "createdAt": "2026-09-02T19:05:00Z",
    "updatedAt": "2026-09-02T19:05:00Z"
  }
]
```

### Users

#### `GET /api/users`

Returns all users.

**Response:**
```json
[
  {
    "_id": "...",
    "name": "Mercy Retail",
    "email": "retailer@reflex.com",
    "phone": "0712345678",
    "role": "RETAILER"
  }
]
```

#### `GET /api/users/riders`

Returns users whose role is `RIDER`.

**Response:** Array of user objects with role `RIDER`.

---

## Database Models

### User

```javascript
{
  name: String,           // User's full name
  email: String,          // Email address
  phone: String,          // Phone number
  role: String            // One of: RETAILER, DISPATCHER, RIDER
}
```

### Delivery

```javascript
{
  retailerId: String,           // ID of the retailer who created the request
  customerName: String,         // Customer's name
  customerPhone: String,        // Customer's contact number
  address: String,              // Delivery address
  itemDescription: String,      // Description of item(s) to deliver
  riderId: String|null,         // ID of assigned rider (null if not assigned)
  riderName: String|null,       // Name of assigned rider (null if not assigned)
  status: String,               // One of: OPEN, ASSIGNED, PICKED_UP, DELIVERED
  createdAt: Date,              // Request creation timestamp
  updatedAt: Date               // Last modification timestamp
}
```

### StatusHistory

```javascript
{
  deliveryId: String,      // ID of the delivery
  previousStatus: String,  // Previous status
  newStatus: String,       // New status
  changedBy: String,       // User or system that triggered the change
  createdAt: Date,         // Timestamp of the transition
  updatedAt: Date          // Last modification timestamp
}
```

---

## Project Structure

```
reflex/
├── backend/
│   ├── models/
│   │   ├── Delivery.js
│   │   ├── User.js
│   │   └── StatusHistory.js
│   ├── routes/
│   │   ├── deliveryRoutes.js
│   │   └── userRoutes.js
│   ├── .env
│   ├── .gitignore
│   ├── seed.js
│   ├── server.js
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── App.jsx
    │   ├── App.css
    │   ├── index.css
    │   └── main.jsx
    ├── public/
    ├── index.html
    ├── package.json
    ├── vite.config.js
    └── eslint.config.js
```

---

## Local Setup

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud connection string)
- Git

### Backend

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   ```

   Example MongoDB URI formats:
   - Local: `mongodb://localhost:27017/reflex`
   - MongoDB Atlas: `mongodb+srv://username:password@cluster.mongodb.net/reflex`

4. Seed demo users:
   ```bash
   node seed.js
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

   The backend will run on `http://localhost:5000`.

### Frontend

1. In a new terminal, navigate to the frontend directory:
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

   The frontend will run on `http://localhost:5173` and will communicate with the backend at `http://localhost:5000/api`.

---

## Demo Users

The seed script creates the following demo users:

| Name | Email | Phone | Role |
|------|-------|-------|------|
| Mercy Retail | retailer@reflex.com | 0712345678 | RETAILER |
| James Dispatcher | dispatcher@reflex.com | 0723456789 | DISPATCHER |
| Brian Rider | brian@reflex.com | 0734567890 | RIDER |
| Ann Rider | ann@reflex.com | 0745678901 | RIDER |

> **Note:** The current demo uses role switching in the UI rather than authentication. In production, users will authenticate with real credentials.

---

## Demo Flow

Follow this end-to-end workflow to demonstrate Reflex:

1. **Switch to Retailer**
   - Navigate to the Retailer dashboard
   
2. **Create a delivery request**
   - Fill in customer details (name, phone, address, item description)
   - Submit the form
   
3. **Switch to Dispatcher**
   - View the new delivery in the `OPEN` state
   
4. **Assign a rider**
   - Select a rider from the dropdown (e.g., Brian Rider)
   - The delivery status changes to `ASSIGNED`
   
5. **Switch to Rider**
   - Select the assigned rider from the rider selector
   - View the assigned delivery
   
6. **Mark as picked up**
   - Click "Mark as picked up"
   - Status updates to `PICKED_UP`
   
7. **Mark as delivered**
   - Click "Mark as delivered"
   - Status updates to `DELIVERED`
   
8. **Switch back to Retailer**
   - View the completed delivery with final status
   - See the delivery timeline showing all transitions
   
9. **Inspect status history** (via API)
   - Call `GET /api/deliveries/:id/history`
   - Verify all status transitions are recorded

---

## Engineering Decisions

### MongoDB

Chosen because it allows fast iteration for the MVP. The delivery object maps naturally to a document structure with no complex joins required. Timestamps are automatically managed by Mongoose.

### REST API

Chosen for straightforward resource-based operations such as creating deliveries, assigning riders, and updating status. Each endpoint maps to a single, predictable action.

### State Machine

Used to make delivery progression explicit and prevent invalid status changes. Implemented in the backend, ensuring the state machine cannot be bypassed by the client.

### Status History Model

Stored separately from the current delivery status so the system preserves an audit trail. This allows reporting on delivery timelines and troubleshooting, rather than only retaining the latest state.

### No Offline Mode in MVP

Deliberately deferred because offline synchronization introduces local persistence, retry mechanisms, conflict resolution, and idempotency concerns—adding significant complexity unsuitable for the MVP scope.

---

## Limitations

This is an MVP with deliberately scoped-out features:

- **Demo role switching** instead of authentication
- **No production authorization** enforcement
- **No real-time WebSocket updates**—status changes require page refresh
- **No offline support**
- **No full proof-of-delivery evidence** (photos, signatures, OTP)
- **No location tracking**
- **No QR/barcode scanning**
- **No customer confirmation**

These are not failures but deliberate scope decisions to focus on core delivery coordination.

---

## Roadmap

### Phase 1: Authentication & Authorization
- JWT-based authentication
- Session management
- Role-based backend authorization

### Phase 2: Real-time Updates
- WebSocket integration
- Live delivery status streaming
- Notification system

### Phase 3: Proof of Delivery
- OTP verification for delivery confirmation
- Customer confirmation workflow
- Photo/signature capture
- Optional location verification

### Phase 4: Offline Support
- Local event queue
- Retry mechanism
- Conflict resolution
- Idempotent status updates

### Phase 5: Scanning
- QR/barcode code generation for deliveries
- In-app scanning for order identification and confirmation

### Phase 6: Production Hardening
- Enhanced input validation
- Rate limiting
- Comprehensive error handling
- Structured logging
- Application monitoring
- Automated test coverage

---

## Success Metrics

Reflex should ultimately be evaluated using:

- **Time from request to assignment**: How quickly does a delivery move from OPEN to ASSIGNED?
- **Active delivery status currency**: What percentage of in-flight deliveries have a current status?
- **Communication reduction**: How many manual WhatsApp/phone interactions are eliminated per delivery?
- **Delivery completion rate**: What percentage of deliveries reach the DELIVERED status?
- **Status synchronization reliability**: How consistently do riders and retailers see the same status?

---

## Technologies Used

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, Vite, Axios, CSS |
| **Backend** | Node.js, Express 5, Mongoose |
| **Database** | MongoDB |
| **Development** | Git, GitHub, Nodemon, ESLint |

---

## Contributing

To contribute to Reflex:

1. Clone the repository
2. Create a feature branch
3. Make your changes
4. Test locally using the demo flow
5. Submit a pull request

---

## License

ISC

---

## Author

M-gatwiri

---

**Last updated:** September 2, 2026
