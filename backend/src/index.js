const cookieParser = require('cookie-parser')
require('dotenv').config();
const createServer = require('./createServer');
const db = require('./db');
const jwt = require('jsonwebtoken')

const { APP_SECRET, FRONTEND_URL } = process.env

const server = createServer();

// cookies middleware

server.express.use(cookieParser());

server.express.use((req, res, next) => {
  const { token } = req.cookies
  // decode the token to get the userId
  if (token) {
    const { userId } = jwt.verify(token, APP_SECRET)
    // put the userId in the request
    req.userId = userId;
  }
  next();
});

server.express.use(async (req, res, next) => {
  if (!req.userId) return next();
  const user = await db.query.user({ where: { id: req.userId } }, '{id, permissions, email, name}');
  req.user = user;
  next();
})


server.start(
  {
    cors: {
      credentials: true,
      origin: FRONTEND_URL
    },
  },
  deets => {
    console.log(`Server is now running on port http:/localhost:${deets.port}`);
  }
);