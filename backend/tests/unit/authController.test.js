// tests/unit/authController.test.js
const authController = require('../../controllers/authController');
const userService = require('../../services/userService');
const jwt = require('jsonwebtoken');

jest.mock('../../services/userService');
jest.mock('jsonwebtoken');

describe('Auth Controller', () => {
  let req, res;

  beforeEach(() => {
    req = { body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      cookie: jest.fn(),
    };
  });

  describe('login', () => {
    it('should return 400 if user not found', async () => {
      req.body = { email: 'test@example.com', password: '123456' };
      userService.findUser.mockResolvedValue(null);

      await authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid credentials.' });
    });

    it('should return 400 if password does not match', async () => {
      const mockUser = { comparePassword: jest.fn().mockResolvedValue(false) };
      req.body = { email: 'test@example.com', password: 'wrongpass' };

      userService.findUser.mockResolvedValue(mockUser);

      await authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid credentials.' });
    });

    it('should return token and user on success', async () => {
      const mockUser = {
        _id: 'user123',
        email: 'test@example.com',
        role: 'user',
        comparePassword: jest.fn().mockResolvedValue(true),
      };
      req.body = { email: 'test@example.com', password: '123456' };

      userService.findUser.mockResolvedValue(mockUser);
      jwt.sign.mockReturnValue('mocked-token');

      await authController.login(req, res);

      expect(res.cookie).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ user: mockUser, token: 'mocked-token' });
    });
  });

  describe('register', () => {
    it('should return 400 if email already exists', async () => {
      req.body = { email: 'test@example.com', name: 'Test', password: '123456' };
      userService.findUser.mockResolvedValue({ email: 'test@example.com' });

      await authController.register(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Email already exists.' });
    });

    it('should return user and token on success', async () => {
      const newUser = { _id: 'new123', email: 'new@example.com', role: 'user' };
      req.body = { email: 'new@example.com', name: 'New', password: '123456' };

      userService.findUser.mockResolvedValue(null);
      userService.createUser.mockResolvedValue(newUser);
      jwt.sign.mockReturnValue('new-token');

      await authController.register(req, res);

      expect(res.cookie).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ user: newUser, token: 'new-token' });
    });
  });

  describe('logout', () => {
    it('should clear the token and return logout message', () => {
      authController.logout(req, res);

      expect(res.cookie).toHaveBeenCalledWith('token', '', expect.any(Object));
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Logout successfully.' });
    });
  });
});
