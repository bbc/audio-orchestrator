/**
Copyright (C) 2025, BBC R&D

This file is part of Audio Orchestrator. Audio Orchestrator is free software: you can
redistribute it and/or modify it under the terms of the GNU General Public License as
published by the Free Software Foundation, either version 3 of the License, or (at
your option) any later version. Audio Orchestrator is distributed in the hope that it
will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License
for more details. You should have received a copy of the GNU General Public License
along with Audio Orchestrator. If not, see <https://www.gnu.org/licenses/>.
*/

import { electronLogger as logger } from '#logging';

// Returns a method that returns true if the given path matches the route.
const makeRouteTest = (route) => {
  if (!route.includes(':')) {
    // no params, check for exact equality
    return path => `/${path}` === route;
  }

  // Route may have params, find them and generate a regular expression
  // split route into fragments by `/`, after discarding first character (expected to be '/')
  // replace each fragment with a `.+` expression if it is a paramter, or use the fragment itself.
  // then recombine the fragments by adding the `/` back in.
  const fragments = route
    .slice(1)
    .split('/')
    .map(f => (f.startsWith(':') ? '.+' : f));
  const exprStr = `^/?${fragments.join('/')}/?$`;
  const expr = new RegExp(exprStr);

  return path => expr.test(path);
};

class Router {
  constructor() {
    this.routesByMethod = {
      get: [],
      post: [],
      delete: [],
    };
  }

  registerRouteHandler(method, route, handler) {
    const params = route.slice(1).split('/')
      .map((f, i) => ({
        name: f.slice(1),
        isParam: f.startsWith(':'),
        index: i,
      }))
      .filter(({ isParam }) => isParam);
    // logger.debug(`registered route ${route}`, params);
    this.routesByMethod[method].push({
      route,
      handler,
      test: makeRouteTest(route),
      params,
    });
  }

  registerGet(route, handler) {
    this.registerRouteHandler('get', route, handler);
  }

  registerPost(route, handler) {
    this.registerRouteHandler('post', route, handler);
  }

  registerDelete(route, handler) {
    this.registerRouteHandler('delete', route, handler);
  }

  getRouteHandler(method, path) {
    const route = this.routesByMethod[method].find(r => r.test(path));

    if (!route) {
      logger.error(`Cannot ${method} ${path} (no matching route)`);
      return () => Promise.resolve({ success: false });
    }

    const params = {};
    const fragments = path.split('/');
    route.params.forEach(({ name, index }) => {
      params[name] = fragments[index];
      // logger.debug(`route param ${name} = ${params[name]}`);
    });

    return body => new Promise((resolve, reject) => {
      // logger.debug(`handling route ${path} with ${route.route}`);
      const req = {
        body,
        params,
      };
      const res = {
        json: (result) => { resolve(result); },
      };
      const next = reject;

      route.handler(req, res, next);
    })
      .catch((err) => {
        logger.error(`error in ${method} handler for ${path}`, err);
        return { success: false };
      });
  }

  get(path) {
    return Promise.resolve().then(() => this.getRouteHandler('get', path)());
  }

  post(path, body) {
    return Promise.resolve().then(() => this.getRouteHandler('post', path)(body));
  }

  delete(path) {
    return Promise.resolve().then(() => this.getRouteHandler('delete', path)());
  }
}

export default Router;
