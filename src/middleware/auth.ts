import { Request, Response, NextFunction } from 'express';

// Simple API key authentication middleware
export function authenticateApiKey(req: Request, res: Response, next: NextFunction) {
  const apiKey = req.headers['x-api-key'] as string;
  const validApiKey = process.env.API_KEY;

  if (!validApiKey) {
    return res.status(500).json({
      error: 'Server configuration error',
      message: 'API key not configured'
    });
  }

  if (!apiKey) {
    return res.status(401).json({
      error: 'Authentication required',
      message: 'API key must be provided in x-api-key header'
    });
  }

  if (apiKey !== validApiKey) {
    return res.status(401).json({
      error: 'Invalid API key',
      message: 'The provided API key is not valid'
    });
  }

  next();
}

// Optional authentication for demo purposes
export function optionalAuth(req: Request, res: Response, next: NextFunction) {
  const apiKey = req.headers['x-api-key'] as string;
  const validApiKey = process.env.API_KEY;

  if (apiKey && validApiKey && apiKey !== validApiKey) {
    return res.status(401).json({
      error: 'Invalid API key',
      message: 'The provided API key is not valid'
    });
  }

  // Add user info to request if authenticated
  if (apiKey && validApiKey && apiKey === validApiKey) {
    (req as any).user = { authenticated: true, role: 'admin' };
  }

  next();
}