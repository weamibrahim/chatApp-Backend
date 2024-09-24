require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const cors = require('cors');
const app = express();
const port = process.env.PORT;

const corsOptions = {
  origin: ["https://chat-app-2cap.vercel.app", "http://localhost:5173"],
  credentials: true,
};

// Middleware to parse JSON data
app.use(express.json());
app.use(cors(corsOptions)); 
app.options('*', cors(corsOptions));

// Import routes
const UserRoute = require('./Routes/UserRoute');
const MessageRoute = require('./Routes/MassageRoute');

// Routes
app.use('/api/users', UserRoute);
app.use('/api/messages', MessageRoute);

// Connect to MongoDB using Mongoose
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB:', err));

// Create an HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
require('./socket')(server); // Import and initialize socket functionality

// Root endpoint
app.get('/', (req, res) => {
  res.send('Hello, World!');
});

// Listen on the provided port using the HTTP server
server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
