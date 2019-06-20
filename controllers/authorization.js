// we building an authentication middleware

const redisClient = require("./signin").redisClient; // we import redisclient from the exports of signin,js

const requireAuth = (req, res, next) => {
  // next is a third parameter in express that allow us to create a middleware since it makes the call to continue what is next in the line where we use this middleware
  let { authorization } = req.headers;
  if (!authorization) {
    return res.status(401).json("unathorized");
  }
  if (authorization.startsWith("Bearer ")) {
    authorization = authorization.slice(7, authorization.length);
  }
  return redisClient.get(authorization, (err, reply) => {
    if (err || !reply) {
      return res.status(401).json("unathorized");
    }
    return next();
  });
};

module.exports = {
  requireAuth
};
