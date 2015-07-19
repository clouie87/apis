var postgres = require('./../postgres');

//need to define User object//

var User = exports;

User.fbsave = function(data, req, callback) {

        console.log('saving the new User');

        var sql = 'INSERT INTO users(name, email, password, facebook_token, account_type, insta_token,  google_token) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING u_id';


        console.log(data);
        postgres.client.query(sql, data, function(err, result){
            if (err) {
                console.error('error in adding new user', err);

            }

            //consoles the id number we are at
            console.log('Insert result:', result.rows);


            console.log("checked", data);
            //req.User = results.rows[0];

            //next();
            var userData= {
                id: result.rows[0].u_id
            };

            console.log(userData);
            callback(userData);
        });

    };

User.googlesave = function(data, req, callback) {

  console.log('saving a new new google User');


  var sql = 'INSERT INTO users(name, email, password, account_type, insta_token, facebook_token, google_token) VALUES ($1, $2, $3, $4, $5,$6, $7) RETURNING u_id';

  console.log(data);
  postgres.client.query(sql, data, function(err, result){
    if (err) {
      console.error('error in adding new user', err);

    }

    //consoles the id number we are at
    console.log('Insert result:', result.rows);


    console.log("checked", data);
    //req.User = results.rows[0];

    //next();
    var userData= {
      id: result.rows[0].u_id
    };
    callback(userData);
  });

};

User.instasave = function(data, req, callback) {

    console.log('saving the new User');


    var sql = 'INSERT INTO users(name, email, password, account_type, insta_token, facebook_token, google_token) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING u_id';

    console.log(data);
    postgres.client.query(sql, data, function(err, result){
        if (err) {
            console.error('error in adding new user', err);

        }

        //consoles the id number we are at
        console.log('Insert result:', result.rows);


        console.log("checked", data);
        //req.User = results.rows[0];

        //next();
        var userData= {
            id: result.rows[0].u_id
        };
        callback(userData);
    });

};

User.save = function(req, callback) {
    console.log('saving the new User');


    var email = req.body.email;
    var password = req.body.password;

    //User.facebook.id    = profile.id; // set the users facebook id
    //var token = token; // we will save the token that facebook provides to the user
    //User.facebook.name  = profile.name.givenName + ' ' + profile.name.familyName; // look at the passport user profile to see how names are returned
    //var email = profile.emails[0].value; // facebook can return multiple emails so we'll take the first


    console.log( email, password);

    var local = 'local';

    var sql = 'INSERT INTO users(email, password, account_type) VALUES ($1, $2, $3) RETURNING u_id';
    var data = [
        req.body.email,
        req.body.password,
        local
    ];

    console.log(data);
    postgres.client.query(sql, data, function(err, result){
        if (err) {
            console.error('error in adding new user', err);

        }

        //consoles the id number we are at
        console.log('Insert result:', result.rows);


    console.log("checked", data);
    //req.User = results.rows[0];

    //next();
    var userData= {
        id: result.rows[0].u_id
    };
    callback(userData);
    });

};

User.linkSave = function(user, callback) {
  console.log('saving the new google User');
  var id = user.u_id;
  var google_token = user.google_token;
  console.log(google_token, 'and', id);

  var sql = 'UPDATE users SET google_token =$1 WHERE u_id=$2 RETURNING u_id, name, email, google_token';
  var data = [
    google_token,
    id
  ];


  console.log(data);

  postgres.client.query(sql, data, function(err, result){
    if (err) {
      console.error('error in adding new user', err);

    }

    console.log("checked", data);
    console.log(result.rows[0].u_id);
    //req.User = results.rows[0];

    //next();
    var userData= {
      u_id: result.rows[0].u_id,
      google_token: result.rows[0].google_token,
      email: result.rows[0].email,
      name: result.rows[0].name
    };

    console.log(userData.u_id);
    callback(userData);
  });

};

User.linkSaveFB = function(user, callback) {
  console.log('saving the new facebook User');
  var id = user.u_id;
  var facebook_token = user.facebook_token;
  console.log(facebook_token, 'and', id);

  var sql = 'UPDATE users SET facebook_token =$1 WHERE u_id=$2 RETURNING u_id, name, email, facebook_token';
  var data = [
    facebook_token,
    id
  ];


  console.log(data);

  postgres.client.query(sql, data, function(err, result){
    if (err) {
      console.error('error in adding new user', err);

    }

    console.log("checked", data);
    console.log(result.rows[0].u_id);
    //req.User = results.rows[0];

    //next();
    var userData= {
      u_id: result.rows[0].u_id,
      facebook_token: result.rows[0].facebook_token,
      email: result.rows[0].email,
      name: result.rows[0].name
    };

    console.log(userData.u_id);
    callback(userData);
  });

};


User.linkSaveInsta = function(user, callback) {
  console.log('saving the new instagram User');
  var id = user.u_id;
  var insta_token = user.insta_token;
  console.log(insta_token, 'and', id);

  var sql = 'UPDATE users SET insta_token =$1 WHERE u_id=$2 RETURNING u_id, name, email, insta_token';
  var data = [
    insta_token,
    id
  ];


  console.log(data);

  postgres.client.query(sql, data, function(err, result){
    if (err) {
      console.error('error in adding new user', err);

    }

    console.log("checked", data);
    console.log(result.rows[0].u_id);
    //req.User = results.rows[0];

    //next();
    var userData= {
      u_id: result.rows[0].u_id,
      insta_token: result.rows[0].insta_token,
      email: result.rows[0].email,
      name: result.rows[0].name
    };

    console.log(userData.u_id);
    callback(userData);
  });

};
//needd to create a userData id with name, email pass etc. for each time we find one
//because it is no longer defined with this.email etc etc
User.localfindOne = function(email, password, callback) {

  var isNotAvailable = false; //we are assuming the email is taking
    //console.log(password);
    console.log(email + ' is in the findOne function test');
    //console.log(password, 'is in the findOne function');
    //check if there is a user available for this email;
    var sql = 'SELECT * FROM users WHERE email = $1 AND password = $2';
    var data = [
        email,
        password

    ];
    console.log(data);

    postgres.client.query(sql, data, function (err, result) {
      //console.log(result.rows.length);

        if (err) {
            console.error(err);
            return callback(err, isNotAvailable, this);
        }

        if (result.rows.length > 0) {
            isNotAvailable = true; // update the user for return in callback
            console.log(result.rows[0].u_id);

            data = {
              email: email,
              password: password,
              id: result.rows[0].u_id
            };
            ///email = email;
            //password = result.rows[0].password;
            console.log(data.email, data.id + ' is found in the database!');
        }
        else {
            isNotAvailable = false;
            //email = email;
        }
        return callback(false, isNotAvailable, data, this);
    });
};


User.findOne = function(token, callback) {

  var isNotAvailable = false; //we are assuming the email is taking

  console.log(token + ' is in the findOne function test');
  //check if there is a user available for this email;
  var sql = 'SELECT * FROM users WHERE email = $1';
  var data = [
    token
  ];

  console.log('the data is ', data);

  postgres.client.query(sql, data, function (err, result) {
    console.log(result.rows.length);

    if (err) {
      console.error(err);
      return callback(err, isNotAvailable, this);
    }
    if (result.rows.length > 0) {

      var data = {

        id: result.rows[0].u_id,
        name: result.rows[0].name,
        email: result.rows[0].email,
        account: result.rows[0].account_type,
        password: result.rows[0].password

      };
      console.log( data.id);

      isNotAvailable = true; // update the user for return in callback
      ///email = email;
      //password = result.rows[0].password;
      console.log(token + ' is found in the database!');
    }
    else {
      isNotAvailable = false;
      //email = email;
    }
    return callback(false, isNotAvailable, data, this);
  });
};


User.findOneFb = function(token, callback) {

    var isNotAvailable = false; //we are assuming the email is taking

    console.log(token + ' is in the findOne function test');
    //check if there is a user available for this email;
    var sql = 'SELECT * FROM users WHERE facebook_token = $1';
    var data = [
        token
    ];

    console.log('the data is ', data);

    postgres.client.query(sql, data, function (err, result) {
      console.log(result.rows.length);

      if (err) {
            console.error(err);
            return callback(err, isNotAvailable, this);
        }
        if (result.rows.length > 0) {

          var data = {
            id: result.rows[0].u_id,
            name: result.rows[0].name,
            email: result.rows[0].email,
            account: result.rows[0].account_type,
            password: result.rows[0].password,
            google_token: result.rows[0].google_token,
            insta_token: result.rows[0].insta_token,
            facebook_token: result.rows[0].facebook_token


          };
          console.log( data.id);

            isNotAvailable = true; // update the user for return in callback
            ///email = email;
            //password = result.rows[0].password;
            console.log(token + ' is found in the database!');
        }
        else {
            isNotAvailable = false;
            //email = email;
        }
        return callback(false, isNotAvailable, data, this);
    });
};


User.findOneInsta = function(token, callback) {

  var isNotAvailable = false; //we are assuming the email is taking

  console.log(token + ' is in the findOne function test');
  //check if there is a user available for this email;
  var sql = 'SELECT * FROM users WHERE insta_token = $1';
  var data = [
    token
  ];

  console.log('the data is ', data);

  postgres.client.query(sql, data, function (err, result) {
    console.log(result.rows.length);

    if (err) {
      console.error(err);
      return callback(err, isNotAvailable, this);
    }
    if (result.rows.length > 0) {

      var data = {

        id: result.rows[0].u_id,
        name: result.rows[0].name,
        email: result.rows[0].email,
        account: result.rows[0].account_type,
        password: result.rows[0].password,
        google_token: result.rows[0].google_token,
        insta_token: result.rows[0].insta_token,
        facebook_token: result.rows[0].facebook_token

      };
      console.log( data.id);

      isNotAvailable = true; // update the user for return in callback
      ///email = email;
      //password = result.rows[0].password;
      console.log(token + ' is found in the database!');
    }
    else {
      isNotAvailable = false;
      //email = email;
    }
    return callback(false, isNotAvailable, data, this);
  });
};

User.findById = function(id, callback){
    console.log('finding the user to deserialize');

    var sql = 'SELECT * FROM users WHERE u_id = $1';
    var data = [
       id
    ];


    console.log(data);
    postgres.client.query(sql, data, function (err, result) {
        if (err) {
            console.error(err);
        }
        if (result.rows.length > 0) {


          console.log(id + ' is found to be deserialized');

          var user = {

            id: id,
            name: result.rows[0].name,
            email: result.rows[0].email,
            account: result.rows[0].account_type,
            password: result.rows[0].password,
            google_token: result.rows[0].google_token,
            insta_token: result.rows[0].insta_token,
            facebook_token: result.rows[0].facebook_token

          };

          //console.log(user);
          callback(false, user);
        }
    });
};

User.query = function(callback){

};


//module.exports = ('User', User);
