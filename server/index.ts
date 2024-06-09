import path from 'path';
import dotEnv from 'dotenv';
import express, { NextFunction, Request, Response } from 'express';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import { auth, requiresAuth } from 'express-openid-connect';
import routes from './routes';
import fileUpload from 'express-fileupload';
import { PrismaClient, User } from '@prisma/client';

const prisma = new PrismaClient();

const { CLIENT_ID, SECRET, PORT = 3000 } = process.env;

dotEnv.config();
const CLIENT = path.resolve(__dirname, '..', 'dist');

const app = express();
const socket = express();
const server = createServer(socket);
const io = new Server(server, {
  connectionStateRecovery: {},
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

app.use(fileUpload());
app.use(express.json());
//app.use(express.urlencoded({ extended: true }));
app.use(express.static(CLIENT));

/*** AUTH ***/
const config = {
  authRequired: false,
  auth0Logout: true,
  baseURL: `http://localhost:${PORT}`,
  clientID: CLIENT_ID,
  secret: SECRET,
  issuerBaseURL: 'https://dev-uatvgw7p2cq7mmm0.us.auth0.com',
};

// * Auth * //
//Everything below this middleware will require authentication to access
app.use(auth(config));
/**********************/

app.use((req: Request, res: Response, next: NextFunction) => {
  res.locals.user = req.oidc.user;
  next();
});
// get the logged in user
app.get('/', (req: Request, res: Response) => {
  res.send(req.oidc.isAuthenticated() ? 'Logged in' : 'Logged out');
});

declare global {
  namespace Express {
    interface Request {
      user: User;
    }
  }
}

// get logged in user profile
// * Must be /profile for Auth0 to work
app.get('/profile', requiresAuth(), (req: Request, res: Response) => {
  const jason = JSON.stringify(req.oidc.user, null, 2);
  const user = JSON.parse(jason);

  const currentUser = {
    sid: user.sid,
    name: user.name,
    email: user.email,
    picture: user.picture,
  };

  prisma.user
    .upsert({
      where: { username: currentUser.username },
      update: {},
      create: currentUser,
    })
    .then((data) => console.log('user', data))
    .then(() => console.log('auth', user))
    .catch((err) => {
      console.error('Failed to save user:', err);
    });
});
app.use('/api', routes);

app.get('*', (req: Request, res: Response) => {
  res.sendFile(path.join(CLIENT, 'index.html'));
});
// * Auth * //

// socket handling ----------------------------------------- //
io.on('connection', (socket) => {
  // console.log('A user has connected');

  // on disconnection
  socket.on('disconnect', () => {
    // console.log('A user has disconnected');
  });

  // on 'message' event
  socket.on('message', (message) => {
    // console.log(`message: ${message}`);

    // broadcast message to all clients
    io.emit('message', message);
  });
});
// socket handling ----------------------------------------- //

// websocket server
io.listen(4000);

app.listen(PORT, () => {
  console.info(`\nhttp://localhost:${PORT}\nhttp://127.0.0.1:${PORT}`);
});

export default app;
