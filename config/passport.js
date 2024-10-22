const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const db = require('../db/queries');
require('dotenv').config();

const options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET_KEY,
};

// jwt_payload will include some info about the user (like the id)
// behind the scenes the passport jwt strategy is:
// - taking the options,
// - grabbing the JWT from the auth header,
// - validating the token with the jsonwebtoken library,
// - then once it's validated it, it passes the payload object,
// grabs the id of the user from the payload, looks it up in the db and returns it to passport,
// - finally passport attaches it to the request.user object within the express framework.

const strategy = new JwtStrategy(options, async (jwt_payload, done) => {
  try {
    const user = await db.queryGetUserById(jwt_payload.id);
    if (!user) {
      return done(null, false, {
        message: `User with id: ${jwt_payload.id} doesn't exist.`,
      });
    } else {
      // in the JWT strategy we don't check the password etc like in the Local strategy, because we've already validated the JWT
      // if the user is succesfully authenticated, the user object will eventually be attached to the express request object
      return done(null, user);
    }
  } catch (err) {
    return done(err, false);
  }
});

// passport object is being provided from app.js
// we're taking that object and passing in the strategy
module.exports = (passport) => {
  passport.use(strategy);
};
