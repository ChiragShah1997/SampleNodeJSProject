const user = require('../../models/user');

class UserService {
  async getUserById(input) {
    try {
      const result = await user.findById(input);
      return result;
    } catch (error) {
      throw error;
    }
  }

  async getAllUser() {
    try {
      const result = await user.find({});
      return result;
    } catch (error) {
      throw error;
    }
  }

  async createUser(input) {
    try {
      const result = await user.create(input);
      return result;
    } catch (error) {
      throw error;
    }
  }

  async deleteUser(input) {
    try {
      const result = await user.findByIdAndDelete(input);
      return result;
    } catch (error) {
      throw error;
    }
  }

  async updateUser(inputs) {
    const { userId, data } = inputs;
    try {
      const result = await user.findByIdAndUpdate(userId, data, {
        new: true,
        runValidators: true,
      });
      return result;
    } catch (error) {
      throw error;
    }
  }
}

const userService = new UserService();
module.exports = userService;
