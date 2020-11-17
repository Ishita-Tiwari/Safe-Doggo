var express = require('express');
var app = express();
var port = process.env.PORT || 3000;
var path = require('path');
var nodemailer = require('nodemailer');
var bodyparser = require("body-parser");
var mongoose = require("mongoose");
const passport = require("passport");
var LocalStrategy = require("passport-local");
var User = require("./models/user");
var qr = require('qrcode');


mongoose.connect(
  process.env.MONGO_URL,
  { useNewUrlParser: true, useUnifiedTopology: true }
);
app.use(
  require("express-session")({
    secret: "safe",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(bodyparser.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");




// get methods
app.get("", (req, res) => {
  res.render("index", { currentUser: req.user });
});
app.get("/index", (req, res) => {
  res.render("index", { currentUser: req.user });
});
app.get("/quick", (req, res) => {
  res.render("quick", { currentUser: req.user });
});
app.get("/download", (req, res) => {
  res.render("download", { currentUser: req.user });
});
app.get("/login", (req, res, next) => {
  res.render("login", { currentUser: req.user });
});
app.get("/register", (req, res) => {
  res.render("register", { currentUser: req.user });
});
app.get("/profile", (req, res) => {
  res.render("profile", { currentUser: req.user });
});
app.get("/logout", function (req, res) {
  req.logout();
  res.redirect("/");
  console.log("logged out");
});



// post methods
app.post("/login", 
  passport.authenticate('local', { failureRedirect: "/login"}),
  function (req, res) {
    console.log("logged in");
    res.redirect("/profile");
  }
);


app.post("/register", function (req, res) {
  var newUser = new User({
    username: req.body.username,
    email: req.body.email,
  });
  User.register(newUser, req.body.password, function (err, user) {
    if (err) {
      console.log(err);
      res.render("register", { currentUser: req.user, message: 'an error'});
    } else {
      console.log('registered');

      var transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: "safe.doggo.here@gmail.com",
          pass: "newsafedoggo",
        },
      });
      var mailOptions = {
        from: "safe.doggo.here@gmail.com",
        to: req.body.email,
        subject: "Welcome to Safe Doggo",
        text: `Welcome, ${req.body.username}! You have successfully registered on our website. Go ahead and add your pet's details. We are here to help you all the way.`,
      };
      transporter.sendMail(mailOptions, function (err, info) {
        if (err) {
          console.log(err);
        } else {
          console.log("Email sent: " + info.response);
        }
      });
      res.redirect("/login");
    }
  });
});

app.post("/quick", function (req, res) {
    // console.log("quick");
    const data = req.body.details;
    // console.log(`${data}`);
    qr.toDataURL(data, (err, qrrec) => {
      if(err) res.send('Error');
      console.log(qrrec);
      res.render("download", { currentUser: req.user, qrrec });
    });
  }
);


app.post("/profile", function (req, res) {
  const data = req.body.details;
  const ps_data = {detail: data};
  console.log('body------------------------------');
  console.log(req.body);
  console.log('user------------------------------');
  console.log(req.user);
  console.log(req.user.id);

  User.findById(req.user.id, function(err, user){
    if(err){
      console.log('ERROR IS HERE. CHECK THIS PART')
      console.log(err);
    }
    else{
      console.log(req.body.details);
      user.pet.push(ps_data);
      user.save();
      console.log(req.user.pet);
    }
  });

  qr.toDataURL(data, (err, qrrec) => {
    if (err){
      console.log('Error at QR profile');
      res.send('Error');
    }
    console.log(qrrec);
    res.render("downprof", { currentUser: req.user, qrrec });
  });
}
);



app.post("/del/:id", function (req, res) { 
  const id = req.params.id; 
  console.log(id);
  User.updateOne(
      { '_id': req.user._id },
      { $pull: { pet: {_id: id} } }
    )
    .then(err => {
      console.log('error in deleting');
      console.log(err);
    });

  console.log('rendering page now');
  res.redirect("/profile");
  
}
);

app.post("/regen/:i", function (req, res) {
  const i = Number(req.params.i);
  const data = req.user.pet[i].detail;


  console.log(data);
  qr.toDataURL(data, (err, qrrec) => {
    if (err) {
      console.log('Error at QR profile');
      res.send('Error');
    }
    console.log(qrrec);
    res.render("downprof", { currentUser: req.user, qrrec });
  });

}
);



app.listen(port, () => console.info('Running on 3000'));