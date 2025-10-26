import { Server } from 'socket.io';
import type { Server as HttpServer } from 'http';

import env from '@config/env';
import { verifyAccessToken } from '@utils/jwt';

let io: Server | null = null;

export const initSocket = (server: HttpServer): Server => {
  io = new Server(server, {
    cors: {
      origin: env.clientOrigin === '*' ? true : env.clientOrigin,
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  const realtime = io.of('/realtime');

  realtime.use((socket, next) => {
    try {
      const token =
        (socket.handshake.auth?.token as string | undefined) ??
        (socket.handshake.headers.authorization?.toString().replace('Bearer ', '') ?? undefined);

      if (!token) {
        next(new Error('Authentication token required'));
        return;
      }

      const payload = verifyAccessToken(token);
      socket.data.user = {
        id: payload.sub,
        email: payload.email,
        role: payload.role
      };
      next();
    } catch (error) {
      next(new Error('Invalid token'));
    }
  });

  realtime.on('connection', (socket) => {
    socket.on('disconnect', () => {
      // noop placeholder for logging
    });
  });

  return io;
};

export const getSocket = (): Server => {
  if (!io) {
    throw new Error('Socket.io server not initialised');
  }
  return io;
};

export const getRealtimeNamespace = () => {
  const socket = getSocket();
  return socket.of('/realtime');
};
