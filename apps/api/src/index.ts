import http from 'http';

import env from '@config/env';
import prisma from '@db/client';
import { initSocket } from '@services/socket';

import app from './app';

const server = http.createServer(app);

initSocket(server);

const start = async () => {
  try {
    await prisma.$connect();
    const PORT = env.port;
    server.listen(PORT, () => {
      console.log(`EduBloom API listening on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server', error);
    process.exit(1);
  }
};

start();

const shutdown = async () => {
  console.log('Shutting down server...');
  await prisma.$disconnect();
  server.close(() => process.exit(0));
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
