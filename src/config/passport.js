var passport = require('passport');


module.exports = function(app) {

    // For Simple Authentication
    app.use(passport.initialize());
    app.use(passport.session());


    // User Management in the Session
    // Seriliazeuser to bundle user and stores in session
    // deSeriliaze pulls user from the session
    // Strategy - Local Strategy used
    passport.serializeUser(function(user, done) {
        done(null, user);
    });

    passport.deserializeUser(function(user, done) {
        done(null, user);
    });

    require('./strategies/local.strategy')();




};