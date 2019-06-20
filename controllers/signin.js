const jwt = require("jsonwebtoken");
const redis = require("redis");

const redisClient = redis.createClient(process.env.REDIS_URI);

const handleSignin = (db, bcrypt, req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return Promise.reject("incorrect form submission"); // if the authentication info is wrong we retunr a rejected promise
  }
  return db // the return in this line is to be able to return a promise out of the function
    .select("email", "hash")
    .from("login")
    .where("email", "=", email)
    .then(data => {
      const isValid = bcrypt.compareSync(password, data[0].hash);
      if (isValid) {
        return db
          .select("*")
          .from("users")
          .where("email", "=", email)
          .then(user => user[0]) // now this promise will return the user matching with the email and pass
          .catch(err => Promise.reject("unable to get user"));
      } else {
        Promise.reject("wrong credentials");
      }
    })
    .catch(err => Promise.reject("wrong credentials"));
};

const getAuthTokenid = (req, res) => {
  let { authorization } = req.headers;
  if (authorization.startsWith("Bearer ")) {
    authorization = authorization.slice(7, authorization.length);
  }
  return redisClient.get(authorization, (err, reply) => {
    if (err || !reply) {
      return res.status(400).json("unauthorized");
    }
    return res.json({ id: reply });
  });
};

const signToken = email => {
  const jwtPayload = { email }; // we sign the token with the user email
  return jwt.sign(jwtPayload, process.env.JWT_SECRET, { expiresIn: "2 days" }); // payload to sign and a secret key
};

const setToken = (key, value) => {
  return Promise.resolve(redisClient.set(key, value));
};

const createSessions = user => {
  // create JWT token and return user data
  const { email, id } = user;
  const token = signToken(email);
  return setToken(token, id)
    .then(() => {
      return { success: "true", userId: id, token };
    })
    .catch(console.log);
};

const signinAuthentication = (db, bcrypt) => (req, res) => {
  const { authorization } = req.headers;
  return authorization
    ? getAuthTokenid(req, res)
    : handleSignin(db, bcrypt, req, res) // handleSignin now return a promise, we will do the responses to the frontend in this function now using the promise returned
        .then(data => {
          return data.id && data.email
            ? createSessions(data)
            : Promise.reject(data); // this is the same as doing and if else but using ternary operators
        })
        .then(session => res.json(session))
        .catch(err => res.status(400).json(err));
};

module.exports = {
  handleSignin: handleSignin,
  signinAuthentication: signinAuthentication,
  redisClient: redisClient
};
