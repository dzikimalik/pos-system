import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { config } from '../config/index.js';
import { UserRepository } from '../repositories/UserRepository.js';
import { ApiError } from '../utils/ApiError.js';

const userRepository = new UserRepository();

export class AuthService {
  async login(email: string, password: string): Promise<{ token: string; user: any }> {
    const user = await userRepository.findByEmail(email);

    if (!user) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    if (!user.isActive) {
      throw ApiError.forbidden('Account is deactivated');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role.name,
      },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn } as SignOptions
    );

    const { password: _, ...userWithoutPassword } = user;

    return {
      token,
      user: userWithoutPassword,
    };
  }

  async register(data: { email: string; password: string; name: string; roleId?: string }): Promise<any> {
    const existingUser = await userRepository.findByEmail(data.email);
    if (existingUser) {
      throw ApiError.conflict('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(data.password, 12);

    const user = await userRepository.create({
      email: data.email,
      password: hashedPassword,
      name: data.name,
      roleId: data.roleId,
      isActive: true,
    });

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async getCurrentUser(userId: string): Promise<any> {
    const user = await userRepository.findByIdWithRole(userId);
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}
