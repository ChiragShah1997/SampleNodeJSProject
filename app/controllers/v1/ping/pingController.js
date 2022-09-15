class PingController {
  get(settingsConfig, req, res, next) {
    throw new Error();
    return res.status(200).send({
      result: 'pong',
    });
  }
}

const pingController = new PingController();
module.exports = pingController;
