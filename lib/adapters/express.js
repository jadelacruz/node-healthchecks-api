'use strict';

const constants = require('../constants');

/**
 * Adds a particular Health Check API route to the Express.js Application or Route.
 * The route is one of these difined by the {@link https://hootsuite.github.io/health-checks-api/|Health Checks API} specification.
 * The route handler takes combined request parameters and the service descriptor (usually `package.json` as an object) as the parameters
 * and returns the object with the response data (`status`, `headers`, `contentType` and `body`).
 * 
 * @async
 * @param {object} service      - The service/application descriptor (usually a package.json).
 * @param {object} server       - The Express.js application or Route.
 * @param {object} route        - The Health Check API route descriptor object.
 * @param {string} route.path   - The Health Check API route path.
 * @param {Function} route.path - The Health Check API route handler function.
 */
module.exports = async (service, server, route) => server.get(('/status' + route.path.replace('\\', '/')),
    async (req, res, next) => {
        try {
            const result = await route.handler(Object.assign({}, req.params, req.query, req.headers), service);
            res.status(result.status);
            res.set(constants.HEADER_CONTENT_TYPE, result.contentType);
            res.set(result.headers);
            switch (result.contentType) {
                case constants.MIME_APPLICATION_JSON:
                    res.json(result.body);
                    break;
                default:
                    res.send(result.body);
            }
        } catch (err) {
            next(err);
        }
    });
