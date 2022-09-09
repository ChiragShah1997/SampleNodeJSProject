const _ = require('lodash');
const os = require('os');
const mainConfig = require('./main');

class SettingsConfig {
  constructor() {
    this.config = undefined;
    this.initializeSettings();
  }

  loadDefaultSettings() {
    this.config = mainConfig.get();
  }

  loadEnvironmentConfigFile() {
    let settingsConfig = {};
    const configLocation = `./settings.config.${this.config.env}.json`;
    try {
      settingsConfig = require(configLocation);
      if (!settingsConfig.settings) {
        throw new Error(`Property "settings" is no defined: ${configLocation}`);
      }
      return settingsConfig;
    } catch (error) {
      throw new Error(
        `Unable to parse "${configLocation}", Error :: ${error.message}`,
      );
    }
  }

  loadConfigSettings() {
    const environmentConfigs = this.loadEnvironmentConfigFile();
    this.config = _.merge(this.config, ...environmentConfigs.settings);
  }

  loadServerSettings() {
    this.config.serverName = os.hostname().toLowerCase();
    this.config.serverCores = os.cpus().length;
  }

  initializeSettings() {
    this.loadDefaultSettings();
    this.loadConfigSettings();
    this.loadServerSettings();
  }
}

const settingsConfig = new SettingsConfig();
module.exports = settingsConfig;
