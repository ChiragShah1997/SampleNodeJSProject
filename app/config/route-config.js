const _ = require('lodash');

class RouteConfig {
  loadRouteConfig() {
    try {
      const config = require('./route.config.json');

      if (!config.routes || !config.routes.length) {
        throw new Error(`"Routes" not defined`);
      }

      return config;
    } catch (error) {
      throw new Error(
        `Unable to parse "./route.config.json", Error : ${error.message}`,
      );
    }
  }

  loadController(routeItem) {
    if (!routeItem || !routeItem.controller) {
      throw new Error(
        `Undefined "controller" property in "./route.config.json"`,
      );
    }
    try {
      const controller = require(routeItem.controller);
      return controller;
    } catch (error) {
      throw new Error(
        `Unable to load ${routeItem.controller}, Error : ${error.message}`,
      );
    }
  }

  getRoute(routeItem) {
    if (!routeItem || !routeItem.route || !routeItem.route.length) {
      throw new Error(
        `Undefined or empty "route" property in "./route.config.json"`,
      );
    }
    return routeItem.route;
  }

  getMethod(routeItem) {
    if (!routeItem || !routeItem.method || !routeItem.method.length) {
      throw new Error(
        `Undefined or empty "method" property in "./route.config.json"`,
      );
    }

    const method = routeItem.method.toLowerCase();

    switch (method) {
      case 'get':
      case 'put':
      case 'post':
      case 'delete':
      case 'patch':
        return method;
      default:
        throw new Error(
          `Invalid REST "method" property in "./route.config.json": ${method}`,
        );
    }
  }

  getAction(routeItem) {
    if (!routeItem || !routeItem.action || !routeItem.action.length) {
      return this.getMethod(routeItem);
    }
    return routeItem.action;
  }

  registerRoute(
    application,
    controller,
    route,
    method,
    action,
    settingsConfig,
  ) {
    application.route(route)[method]((req, res, next) => {
      controller[action](settingsConfig, req, res, next);
    });
  }

  createConfigRoute(application, settingsConfig) {
    application.route('/config').get((req, res) => {
      res.status(200).json(settingsConfig);
    });
  }

  registerRoutes(application, settingsConfig) {
    const config = this.loadRouteConfig();
    _.forEach(config.routes, (configRoute) => {
      const routeItem = configRoute;
      const controller = this.loadController(routeItem, application);
      const route = this.getRoute(routeItem);
      const method = this.getMethod(routeItem);
      const action = this.getAction(routeItem);

      this.registerRoute(
        application,
        controller,
        route,
        method,
        action,
        settingsConfig,
      );
    });
    if (settingsConfig.env === 'development') {
      this.createConfigRoute(application, settingsConfig);
    }
  }
}

const routeConfig = new RouteConfig();
module.exports = routeConfig;
