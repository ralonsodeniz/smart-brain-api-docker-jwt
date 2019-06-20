const redisClient = require("./signin").redisClient;

const handleSingout = (req, res) => {
  let { authorization } = req.headers;
  if (authorization.startsWith("Bearer ")) {
    authorization = authorization.slice(7, authorization.length);
  }
  redisClient.del(authorization, (err, reply) => {
    if (err || !reply) {
      return res.status(404).json("error deleting");
    } else {
      res.status(200).json(reply);
    }
  });
};

module.exports = {
  handleSingout
};
