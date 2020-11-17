var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var userSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String,
    pet: [
        {
            detail: String
        }
    ]
});
userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);
