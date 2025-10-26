import axios from 'axios';
import FormData from 'form-data';
import type { Request, Response } from 'express';

import env from '@config/env';
import { getRealtimeNamespace } from '@services/socket';

const aiClient = axios.create({
  baseURL: env.aiServiceUrl,
  timeout: 5000
});

export const predictRisk = async (req: Request, res: Response) => {
  const response = await aiClient.post('/predict', req.body);

  try {
    const realtime = getRealtimeNamespace();
    realtime.emit('risk:update', {
      metrics: req.body,
      prediction: response.data,
      studentId: req.body.studentId
    });
  } catch (error) {
    // socket might not be initialised in serverless environments
  }

  res.json(response.data);
};

export const explainRisk = async (req: Request, res: Response) => {
  const response = await aiClient.post('/explain', req.body);
  res.json(response.data);
};

export const retrainModel = async (req: Request, res: Response) => {
  if (!req.file) {
    res.status(400).json({ message: 'Training dataset CSV is required' });
    return;
  }

  const formData = new FormData();
  formData.append('file', req.file.buffer, {
    filename: req.file.originalname,
    contentType: req.file.mimetype
  });

  const response = await aiClient.post('/retrain', formData, {
    headers: formData.getHeaders()
  });

  res.status(202).json(response.data);
};
