var express = require('express');
var bodyParser = require('body-parser');
var expressValidator = require('express-validator');

var multer = require('multer');
var app = express();


var passport = require('passport');
var flash = require('connect-flash');

var morgan       = require('morgan');
var cookieParser = require('cookie-parser');
var session      = require('express-session');

//configure ==========
require('./config/passport')(passport); // pass passport for configuration
app.use('/uploads', express.static(__dirname +'/uploads'));

app.set('views', './views');
app.set('view engine', 'ejs');

// set up our express application
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser.json('application/json'));

app.use(bodyParser.urlencoded({ extended: true }));
//make sure to add the validator after the body parser!!
app.use(expressValidator());



var postgres = require('./lib/postgres');
var photos = require('./lib/models/photo');


// required for passport
app.use(session({ secret: 'ilovescotchscotchyscotchscotch' })); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session



// Create the express router object for Photos
var photoRouter = express.Router();
console.log ("photoRouter is set");

// A GET to the root of a resource returns a list of that resource
photoRouter.get('/', function(req, res){
    var page = parseInt(req.query.page, 10);
    if (isNaN(page) || page < 1){
        page = 1;
    }

    var limit = parseInt(req.query.limit, 10);
    if (isNaN(limit)){
        limit = 10;
    } else if (limit > 50){
        limit = 50;
    } else if (limit < 1) {
        limit = 1;
    }

    var sql = 'SELECT count(1) FROM photo';
    postgres.client.query(sql, function(err, result) {
        if (err) {
            console.error(err);
            res.statusCode = 500;
            return res.json({
                errors: ['Could not retrieve photos']
            });
        }

        var count = parseInt(result.rows[0].count, 10);
        var offset = (page - 1) * limit; //page - 1 * the limit so when we are on
        // page two the offset is 11.

        sql = 'SELECT * FROM photo OFFSET $1 LIMIT $2';
        postgres.client.query(sql, [offset, limit], function (err, result) {
            if (err) {
                console.error(err);
                res.statusCode = 500;
                return res.json({
                    errors: ['Could not retrieve photos']
                });
            }
            return res.json(result.rows);
        });
    });
});


// A POST to the root of a resource should create a new object
photoRouter.post('/', multer({
    dest: './uploads/',
    rename: function(field, filename){
        filename = filename.replace(/\W+/g, '-').toLowerCase();
        return filename + '_' + Date.now();
    },
    limits: {
        files: 1,
        fileSize: 2 * 1024 * 1024
    }
}), photos.validatePhoto, function(req, res) {

    console.log("Post to /photo is happening");
    var sql = 'INSERT INTO photo (description, filepath, album_id, u_id) VALUES ($1, $2, $3, $4) RETURNING id';
    var data = [
        req.body.description,
        req.files.photo.path,
        req.body.album_id,
        req.user.id
    ];
    //multer appends the field name (photo)

    console.log(data);
    postgres.client.query(sql, data, function(err, result){
        if (err) {
            console.error(err);
            res.statusCode = 500;
            return res.json({
                errors: ['Failed to create photo']
            });
        }

        //consoles the id number we are at
        console.log('Insert result:', result.rows);


        // what does the client want if they have succeeded
        var photoId = result.rows[0].id;
        var sql = 'SELECT * FROM photo WHERE id = $1';
        postgres.client.query(sql, [ photoId ], function(err, result){
            if (err){
                console.error(err);
                res.statusCode=500;
                return res.json({ errors: ['Could not retrieve photo after it was created'] });
            }

            res.statusCode= 201;
            console.log('Select result', result); // check to make sure i'm sending back an object
            res.json(result.rows[0]);
        });

    });
});
// We specify a param in our path for the GET of a specific object
photoRouter.get('/:id([0-9]+)', photos.lookupPhoto, function(req, res) {
    res.json(req.photo);

});
// Similar to the GET on an object, to update it we can PATCH
photoRouter.patch('/:id', function(req, res) { });
// Delete a specific object
//photoRouter.delete('/:id', lookupPhoto, function(req, res) { });
// Attach the routers for their respective paths
app.use('/photo', photoRouter);

var uploadRouter = express.Router();
uploadRouter.get('/', function(req, res) {
    res.render('form');
});
app.use('/upload', uploadRouter);

var challengeRouter = express.Router();
challengeRouter.get('/', function(req, res) {
    res.render('form');
});
app.use('/challenge', challengeRouter);

//var albumRouter = express.Router();
//albumRouter.get('/', function(req, res) { });
//albumRouter.post('/', function(req, res) { });
//albumRouter.get('/:id', function(req, res) { });
//albumRouter.patch('/:id', function(req, res) { });
//albumRouter.delete('/:id', function(req, res) { });
//app.use('/album', albumRouter);

// routes ======================================================================
require('./lib/routes.js')(app, passport); // load our routes and pass in our app and fully configured passport


module.exports = app;



