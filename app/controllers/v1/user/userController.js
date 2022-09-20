const userService = require('../../../services/user/userService');

class UserController {
  async get(settingsConfig, req, res, next) {
    const logger = settingsConfig.logger;
    try {
      const result = await userService.getAllUser();
      return res.status(200).send(result);
    } catch (error) {
      logger.error(`Could not get all users, Error :: ${error}`);
      return res.status(500).send(error);
    }
  }

  async getUserById(settingsConfig, req, res, next) {
    const logger = settingsConfig.logger;
    const userId = req.params.id;
    if (!userId) {
      return res.status(400).send({
        err: 'Bad Request',
        desc: 'userId is missing'
      });
    }
    try {
      const result = await userService.getUserById(userId);
      return res.status(200).send(result);
    } catch (error) {
      logger.error(`Could not get user with id :: ${userId}, Error :: ${error}`);
      return res.status(500).send(error);
    }
  }

  async post(settingsConfig, req, res, next) {
    const logger = settingsConfig.logger;
    const data = req.body.user;
    if (!data) {
      return res.status(400).send({
        err: 'Bad Request',
        desc: 'data is required',
      });
    }
    try {
      const result = await userService.createUser(data);
      return res.status(201).send(result);
    } catch (error) {
      logger.error(`User cannot be created, Error :: ${error}`);
      return res.status(500).send(error);
    }
  }

  async delete(settingsConfig, req, res, next) {
    const logger = settingsConfig.logger;
    const userId = req.params.id;
    if (!userId) {
      return res.status(400).send({
        err: 'Bad Request',
        desc: 'userId is missing',
      });
    }
    try {
      const result = await userService.deleteUser(userId);
      return res.status(200).send(result);
    } catch (error) {
      logger.error(`User cannot be deleted, Error :: ${error}`);
      return res.status(500).send(error);
    }
  }

  // Note :: Put - replace, Patch - update props
  async patch(settingsConfig, req, res, next) {
    const logger = settingsConfig.logger;
    const userId = req.params.id;
    if (!userId) {
      return res.status(400).send({
        err: 'Bad Request',
        desc: 'userId is missing',
      });
    }
    const data = req.body.user;
    if (!data) {
      return res.status(400).send({
        err: 'Bad Request',
        desc: 'data is required',
      });
    }
    const inputs = {
      userId,
      data,
    }
    try {
      const result = await userService.updateUser(inputs);
      return res.status(201).send(result);
    } catch (error) {
      logger.error(`User cannot be updated, Error :: ${error}`);
      return res.status(500).send(error);
    }
  }
}

const userController = new UserController();
module.exports = userController;
