var postgres = require('./postgres');
var User = require('./../lib/models/user.js');

module.exports = function(app, passport) {
// =====================================
// HOME PAGE (with login links) ========
// =====================================
    app.get('/', function (req, res) {
        res.render('index.ejs'); // load the index.ejs file
    });

// =====================================
// LOGIN ===============================
// =====================================
// show the login form
    app.get('/login', function (req, res) {

        // render the page and pass in any flash data if it exists
        res.render('login.ejs', {message: req.flash('loginMessage')});
    });

// process the login form
// app.post('/login', do all our passport stuff here);
// process the login form
    app.post('/login', passport.authenticate('local-login', {
        successRedirect: '/profile', // redirect to the secure profile section
        failureRedirect: '/login', // redirect back to the signup page if there is an error
        failureFlash: true // allow flash messages
    }));

// =====================================
// SIGNUP ==============================
// =====================================
// show the signup form
    app.get('/signup', function (req, res) {

        // render the page and pass in any flash data if it exists
        res.render('signup.ejs', {message: req.flash('signupMessage')});
    });

// process the signup form
// app.post('/signup', do all our passport stuff here);
    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect: '/profile', // redirect to the secure profile section
        failureRedirect: '/signup', // redirect back to the signup page if there is an error
        failureFlash: true // allow flash messages
    }));

// =====================================
// PROFILE SECTION =====================
// =====================================
// we will want this protected so you have to be logged in to visit
// we will use route middleware to verify this (the isLoggedIn function)
  app.get('/profile', isLoggedIn, function(req, res) {
    console.log("in profile page");

    var sql = 'SELECT * FROM photo WHERE u_id = $1';
    postgres.client.query(sql, [req.user.id], function (err, results) {
      if (err) {
        console.error(err);
        res.statusCode = 500;
        return res.json({errors: ['Could not retrieve photo']});
      }


      res.render('profile.ejs', {
        user: req.user, // get the user out of session and pass to template
        photos: results.rows
      });
    });
  });
// =====================================
    // FACEBOOK ROUTES =====================
    // =====================================
    // route for facebook authentication and login
    app.get('/auth/facebook', passport.authenticate('facebook', { scope : 'email' }));
    //console.log('in facebook passport');
    // handle the callback after facebook has authenticated the user
    app.get('/auth/facebook/callback',
        passport.authenticate('facebook', {
            successRedirect : '/profile',
            failureRedirect : '/'
        }));

    // =====================================
    // INSTAGRAM ROUTES =====================
    // =====================================
    // route for facebook authentication and login
    app.get('/auth/instagram', passport.authenticate('instagram'));


    // handle the callback after facebook has authenticated the user
    app.get('/auth/instagram/callback',
        passport.authenticate('instagram', {
            successRedirect: '/profile',
            failureRedirect: '/'
        }));
        //function(req, res) {
        //    // Successful authentication, redirect home.
        //    res.redirect('/');
        //});

  // =====================================
  // GOOGLE ROUTES =====================
  // =====================================
  // route for facebook authentication and login
  app.get('/auth/google', passport.authenticate('google', {scope : ['profile', 'email']}));


  // handle the callback after facebook has authenticated the user
  app.get('/auth/google/callback',
    passport.authenticate('google', {
      successRedirect: '/profile',
      failureRedirect: '/'
    }));
  //function(req, res) {
  //    // Successful authentication, redirect home.
  //    res.redirect('/');
  //});


// =============================================================================
// AUTHORIZE (ALREADY LOGGED IN / CONNECTING OTHER SOCIAL ACCOUNT) =============
// =============================================================================

  // locally --------------------------------
  app.get('/connect/local', function(req, res) {
    console.log('in the connect local');
    res.render('connect-local.ejs', { message: req.flash('loginMessage') });

  });

  app.post('/connect/local', passport.authenticate('local-signup', {
    successRedirect : '/profile', // redirect to the secure profile section
    failureRedirect : '/connect/local', // redirect back to the signup page if there is an error
    failureFlash : true // allow flash messages
  }));

  app.get('/unlink/local', function(req, res){
    var user = req.user;
    console.log('the user details are', user);
    user.email = undefined;
    user.password = undefined;
    user.u_id = user.id;
    User.linkSave(user, function(userData) {
      console.log(userData);
      res.redirect('/profile');
    });
  });

  // facebook -------------------------------

  // send to facebook to do the authentication
  app.get('/connect/facebook', passport.authorize('facebook', { scope : 'email' }));

  // handle the callback after facebook has authorized the user
  app.get('/connect/facebook/callback',
    passport.authorize('facebook', {
      successRedirect : '/profile',
      failureRedirect : '/'
    }));

  app.get('/unlink/facebook', function(req, res){
    var user = req.user;
    console.log('the user details are', user);
    user.facebook_token= undefined;
    user.u_id = user.id;
    User.linkSaveFB(user, function(userData) {
      console.log(userData);
      res.redirect('/profile');
    });
  });


  // google ---------------------------------

  // send to google to do the authentication
  app.get('/connect/google', passport.authorize('google', { scope : ['profile', 'email'] }));

  // the callback after google has authorized the user
  app.get('/connect/google/callback',
    passport.authorize('google', {
      successRedirect : '/profile',
      failureRedirect : '/'
    }));

  app.get('/unlink/google', function(req, res) {
    var user = req.user;
    console.log('the user details are', user);
    user.google_token = undefined;
    user.u_id = user.id;
    User.linkSaveGoogle(user, function (userData) {
      console.log(userData);
      res.redirect('/profile');
    });
  });

  // instagram ------------------------------

  app.get('/connect/instagram', passport.authorize('instagram'));

  // the callback after google has authorized the user
  app.get('/connect/instagram/callback',
    passport.authorize('instagram', {
      successRedirect : '/profile',
      failureRedirect : '/'
    }));

  app.get('/unlink/instagram', function(req, res) {
    var user = req.user;
    console.log('the user details are', user);
    user.insta_token = undefined;
    user.u_id = user.id;
    User.linkSaveInsta(user, function (userData) {
      console.log(userData);
      res.redirect('/profile');
    });
  });




// =====================================
    // LOGOUT ==============================
    // =====================================
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });
};

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {
    console.log("isloggedinfunction");

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}
