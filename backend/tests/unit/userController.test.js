// tests/unit/userController.test.js
const userController = require('../../controllers/userController');
const User = require('../../models/userModel');

jest.mock('../../models/userModel');

describe('User Controller', () => {
  let req, res;

  beforeEach(() => {
    req = { params: {}, body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  describe('getUsers', () => {
    it('should return all users', async () => {
      const mockUsers = [{ name: 'A' }, { name: 'B' }];
      User.find.mockReturnValue({ select: jest.fn().mockResolvedValue(mockUsers) });

      await userController.getUsers(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockUsers);
    });

    it('should return 500 on error', async () => {
      User.find.mockImplementation(() => { throw new Error('DB error') });

      await userController.getUsers(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'DB error' });
    });
  });

  describe('getUser', () => {
    it('should return single user', async () => {
      const mockUser = { name: 'Test' };
      req.params.id = '123';

      User.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser)
      });

      await userController.getUser(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockUser);
    });

    it('should return 404 if user not found', async () => {
      req.params.id = '123';

      User.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue(null)
      });

      await userController.getUser(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'User not found.' });
    });
  });

  describe('updateUser', () => {
    it('should update user and return updated user', async () => {
      req.params.id = '123';
      req.body = { name: 'Updated' };

      User.findOne.mockResolvedValueOnce({}); // check user exists
      User.updateOne.mockResolvedValue({});
      User.findOne.mockReturnValueOnce({
        select: jest.fn().mockResolvedValue({ _id: '123', name: 'Updated' })
      });

      await userController.updateUser(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Update user successfully.',
        user: { _id: '123', name: 'Updated' }
      });
    });

    it('should return 404 if user not found', async () => {
      req.params.id = 'not-exist';

      User.findOne.mockResolvedValue(null);

      await userController.updateUser(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'User not found.' });
    });
  });

  describe('deleteUser', () => {
    it('should mark user as deleted', async () => {
      req.params.id = '123';

      User.findOne.mockResolvedValueOnce({}); // user exists
      User.updateOne.mockResolvedValue({});

      await userController.deleteUser(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Delete user successfully.' });
    });

    it('should return 404 if user not found', async () => {
      req.params.id = '404';
      User.findOne.mockResolvedValue(null);

      await userController.deleteUser(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'User not found.' });
    });
  });
});
