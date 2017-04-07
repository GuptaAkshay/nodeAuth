/**
 * Created by Sinner on 20-Mar-17.
 */
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/nodeauth');
var db = mongoose.connection;

var bcrypt = require('bcryptjs');
//User Schema

var UserSchema = mongoose.Schema({
    username:{
        type:String,
        index:true
    },
    password:{
        type:String,
        required : true,
        bcrypt:true
    },
    email :{
        type:String
    },
    name :{
        type:String
    },
    profileImage :{
        type:String
    }
});

var User = module.exports = mongoose.model('User', UserSchema);


module.exports.getUserByUserName =function(username, callback){
    var query = {username:username};
    User.findOne(query, callback);
}

module.exports.getUserById =function(id, callback){
    User.findById(id, callback);
}

module.exports.comparePassword =function(candidatePassword, hash, callback){
    bcrypt.compare(candidatePassword, hash, function (err, isMatch) {
       if(err) return callback(err);
       callback(null, isMatch);
    });
}

module.exports.createUser = function(newUser, callback){
    bcrypt.hash(newUser.password, 10, function (err, hash) {
        if(err) throw err;
        //set hashed password
        newUser.password = hash;
        //create User
        newUser.save(callback);
    });
}