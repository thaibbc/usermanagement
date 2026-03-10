# Backend for User Management

This is a simple Node.js/Express backend that connects to MongoDB via Mongoose.
It provides REST endpoints for creating, reading, updating, and deleting user records.

## Setup

1. **Install dependencies**

   ```bash
   cd backend
   npm install
   ```

2. **Configure environment**
   - Edit the `.env` file at the project root to set `MONGODB_URI` and optionally `PORT`.
   - A default `.env` has been provided with a local MongoDB URI.

3. **Run the server**

   ```bash
   npm run dev   # uses nodemon for auto-restart during development
   # or
   npm start     # production mode
   ```

4. **Access the API**
   - Base URL: `http://localhost:5000/api/users`
   - Example operations:

     ```bash
     GET    /api/users           # list all
     GET    /api/users/:id       # get one
     POST   /api/users           # create
     PUT    /api/users/:id       # update
     DELETE /api/users/:id       # delete
     ```

## User Schema

The Mongoose model `models/User.js` defines the following fields:

```js
{ name, accountType, level, city, district, email, phone, createdAt, status }
```

Feel free to adapt field names or validation to suit your frontend needs.
