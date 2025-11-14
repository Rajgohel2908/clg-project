ReWear - Backend (MERN)

This folder contains the backend scaffold for the ReWear platform.

## Getting started

1. Copy `.env.example` to `.env` and fill values (MONGO_URI, JWT_SECRET, PORT).
2. Install deps: `npm install`
3. Run in dev: `npm run dev`
4. Run tests: `npm test`

## What's included

- `src/index.js` - Express server entry, CORS, JSON parsing, static uploads mount, mounts routes
- `src/config/db.js` - Mongoose connection helper
- `src/models/` - Mongoose models (User, Item, Swap)
- `src/routes/` - Route handlers (auth, items, swaps, admin)
- `src/controllers/` - Business logic controllers
- `src/middleware/auth.js` - JWT verification middleware
- `src/uploads/` - Static folder for uploaded images (served via /uploads)
- `tests/` - Unit tests with Jest

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (auth required)

### Items
- `GET /api/items` - List approved items (public)
- `GET /api/items/my` - List user's items (auth required)
- `GET /api/items/:id` - Get item details (public)
- `POST /api/items` - Create new item (auth, multipart/form-data for images)
- `PUT /api/items/:id` - Update item (auth, uploader only)
- `DELETE /api/items/:id` - Delete item (auth, uploader or admin)

### Swaps
- `POST /api/swaps` - Request swap or redeem points (auth)
- `GET /api/swaps` - List user's swaps (auth)
- `PUT /api/swaps/:id/accept` - Accept swap (auth, owner only)
- `PUT /api/swaps/:id/reject` - Reject swap (auth, owner only)

### Admin
- `GET /api/admin/items/pending` - List pending items (admin only)
- `POST /api/admin/items/:id/approve` - Approve item (admin only)
- `POST /api/admin/items/:id/reject` - Reject item (admin only)
- `DELETE /api/admin/items/:id` - Delete item (admin only)

## Models

### User
- name, email, password (hashed), role (user/admin), points, createdAt

### Item
- title, description, images[], category, type, size, condition, tags[], uploader (ref User), status, pointsValue, createdAt

### Swap
- requester (ref User), owner (ref User), itemRequested (ref Item), itemOffered (ref Item, optional), status, createdAt

## Next steps
- Implement frontend with React
- Add email notifications
- Enhance validation and error handling
- Add pagination and search
- Deploy to production
