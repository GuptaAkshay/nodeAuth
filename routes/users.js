var express = require('express');
var router = express.Router();
var multer = require('multer');
var uploads = multer({ dest: './uploads' });
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;


var User = require('../models/user');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/register', function(req, res, next) {
    res.render('register', {title : 'Register'});
});

router.get('/login', function(req, res, next) {
    res.render('login', {title : 'Login'});
});

router.post('/register', uploads.array(), function(req, res, next) {
    //get the from values

    var name = req.body.name;
    var email = req.body.email;
    var username = req.body.username;
    var password = req.body.password;
    var cnfpassword = req.body.cnfpassword;


    //Check for image field
    if(req.files && req.files.profileImage){
         console.log('Uploading file...');
         var orginalImageName = req.files.profileimage.originalname;
         var profileImageName = req.files.profileimage.name;
         var profileImageMime = req.files.profileimage.mimetype;
         var profileImagePath = req.files.profileimage.path;
         var profileImageExt = req.files.profileimage.extension;
         var profileImageSize = req.files.profileimage.size;
    }else{
        console.log('profileImageFile not found....');
        var profileImageName = 'noimage.png';
    }

    //form Validations
    req.checkBody('name','Name field is required').notEmpty();
    req.checkBody('email','Email field is required').notEmpty();
    req.checkBody('email','Email not valid').isEmail();
    req.checkBody('username','UserName field is required').notEmpty();
    req.checkBody('password','Password field is required').notEmpty();
    req.checkBody('cnfpassword','Passwords do not match').equals(req.body.password);

    //check for error
    var errors = req.validationErrors();

    if(errors){
        res.render('register',{
            errors: errors,
            name : name,
            email : email,
            username : username,
            password:password,
            cnfpassword: cnfpassword
        });
    }else{
        var newUser  = new User({
            name : name,
            email : email,
            username : username,
            password:password,
            profileImage : profileImageName
        });

        //Create User
        User.createUser(newUser, function (err, user) {
            if(err) throw err;
            console.log(user);
        });

        //Success Message
        req.flash('success', 'You are now registered and may login');

        res.location('/');
        res.redirect('/');
    }
});

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    User.getUserById(id, function(err, user) {
        done(err, user);
    });
});

passport.use(new LocalStrategy(
   function (username, password, done) {
       User.getUserByUserName(username, function(err, user){
           if(err) throw err;
           if(!user){
               console.log('Unknown User');
               return done(null, false, {message: 'Unknown User'});
           }
           User.comparePassword(password, user.password,function (err, isMatch) {
                if(err) throw err;
                if(isMatch){
                    return done(null, user);
                }
                else{
                    console.log('Invalid Password');
                    return done(null, false, {message: 'Inavlid Password'});
                }
           });
       });
   }
));

router.post('/login',
    passport.authenticate('local',{
        failureRedirect: '/',
        failureFlash:'Invalid username or password'
    }), function (req, res) {
        console.log('Authentication Successful');
        req.flash('success', 'You are logged in');
        console.log('User Logged In');
        res.redirect('/');
});

router.get('/logout', function (req, res, next) {
    req.logout();
    req.flash('success', 'You have been Logged Out');
    console.log('User Logged Out');
    console.log(req.flash);
    res.redirect('/users/login');
});

module.exports = router;
