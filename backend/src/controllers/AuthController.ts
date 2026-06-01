import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/AuthService.js';
import { sendSuccess, sendError } from '../utils/response.js';

const authService = new AuthService();

export class AuthController {
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);
      sendSuccess(res, result, 'Login successful');
    } catch (error) {
      next(error);
    }
  }

  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await authService.register(req.body);
      sendSuccess(res, user, 'User registered successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async getCurrentUser(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await authService.getCurrentUser(req.user!.userId);
      sendSuccess(res, user, 'User retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async logout(_req: Request, res: Response) {
    sendSuccess(res, null, 'Logout successful');
  }
}
