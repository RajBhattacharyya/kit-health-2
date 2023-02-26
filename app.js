require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require('express-session');
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require('mongoose-findorcreate');
const nodemailer = require('nodemailer');

const app = express();

app.set('view engine', 'ejs');
mongoose.set('strictQuery', true);

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.use(session({
    secret: 'SECRET',
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

mongoose.connect(process.env.DB);

const userSchema = new mongoose.Schema({
    email: String,
    password: String,
    googleId: String,
    secret: String,
});



userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

const User = new mongoose.model("User", userSchema);


passport.use(User.createStrategy());

passport.serializeUser(function(user, cb) {
    process.nextTick(function() {
      return cb(null, {
        id: user.id,
      });
    });
  });
  
  passport.deserializeUser(function(user, cb) {
    process.nextTick(function() {
      return cb(null, user);
    });
  });

  passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/kithealth",
  },
  function(accessToken, refreshToken, profile, cb) {
    console.log(profile);
    User.findOrCreate({ username: profile.displayName }, function (err, user) {
      return cb(err, user);
    });
  }
))
app.get("/auth/google", 
     passport.authenticate("google", { scope: ["profile"] })
);

app.get("/auth/google/kithealth", 
  passport.authenticate('google', { failureRedirect: "/login" }),
  function(req, res) {
    res.redirect("/");
  });
app.get("/", function(req, res){
    if (req.isAuthenticated()) {
        const loggedIn = true;
        res.render("home", { loggedIn: loggedIn });
    } else {
        const loggedIn = false;
        res.render("home", { loggedIn: loggedIn });
    }
    
});
app.get("/services",function(req,res){
    if (req.isAuthenticated()) {
        const loggedIn = true;
        res.render("services", { loggedIn: loggedIn });
    } else {
        const loggedIn = false;
        res.render("services", { loggedIn: loggedIn });
    }
});
app.get("/about",function(req,res){
    if (req.isAuthenticated()) {
        const loggedIn = true;
        res.render("about", { loggedIn: loggedIn });
    } else {
        const loggedIn = false;
        res.render("about", { loggedIn: loggedIn });
    }  
  });  


app.post("/confirm",function(req,res){
    if (req.isAuthenticated()) {
        const loggedIn = true;
        res.render("confirm", { loggedIn: loggedIn });
    } else {
        const loggedIn = false;
        res.render("confirm", { loggedIn: loggedIn });
    }
    });  

    app.get("/confirm2",function(req,res){
        if (req.isAuthenticated()) {
            const loggedIn = true;
            res.render("confirm2", { loggedIn: loggedIn });
        } else {
            const loggedIn = false;
            res.render("confirm2", { loggedIn: loggedIn });
        }
        });  


        app.get("/goHealth",function(req,res){
            if (req.isAuthenticated()) {
                const loggedIn = true;
                res.render("goHealth", { loggedIn: loggedIn });
            } else {
                const loggedIn = false;
                res.render("goHealth", { loggedIn: loggedIn });
            }
            });

  app.get("/emergency",function(req,res){
    if (req.isAuthenticated()) {
        const loggedIn = true;
        res.render("emergency", { loggedIn: loggedIn });
    } else {
        const loggedIn = false;
        res.render("emergency", { loggedIn: loggedIn });
    }
  });
  

app.get("/contactus",function(req,res){
    if (req.isAuthenticated()) {
        const loggedIn = true;
        res.render("contactus", { loggedIn: loggedIn });
    } else {
        const loggedIn = false;
        res.render("contactus", { loggedIn: loggedIn });
    }
});

app.post('/send-email', (req, res) => {
    const transporter = nodemailer.createTransport({
      host: 'smtp-mail.outlook.com',
      port: 587,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
      }
    });
  
    const mailOptions = {
      from: req.body.email,
      to: 'rajbhattacharyya18110@gmail.com',
      subject: req.body.name,
      text: `Name: ${req.body.name}\nEmail: ${req.body.email}\nMessage: ${req.body.message}`
    };
  
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
        res.redirect("contactus");
      } else {
        console.log('Email sent: ' + info.response);
        res.redirect('/');
      }
    });
  });



app.get("/insurance",function(req,res){
    if (req.isAuthenticated()) {
        const loggedIn = true;
        res.render("insurance", { loggedIn: loggedIn });
    } else {
        res.redirect("login");
    }
  });
  app.get("/bookTest",function(req,res){
    if (req.isAuthenticated()) {
        const loggedIn = true;
        res.render("bookTest", { loggedIn: loggedIn });
    } else {
        res.redirect("login");
    }
  });
  app.get("/bookApp",function(req,res){
    if (req.isAuthenticated()) {
        const loggedIn = true;
        res.render("bookApp", { loggedIn: loggedIn });
    } else {
        res.redirect("login");
    }
  });

  app.get("/medicalService",function(req,res){
    if (req.isAuthenticated()) {
        const loggedIn = true;
        res.render("medicalService", { loggedIn: loggedIn });
    } else {
        res.redirect("login");
    }
  });

  app.get("/order",function(req,res){
    if (req.isAuthenticated()) {
        const loggedIn = true;
        res.render("order", { loggedIn: loggedIn });
    } else {
    
        res.redirect("login");
    }
  });  

app.get("/login", function(req, res){
    const isAuthenticated = req.isAuthenticated();
    console.log(isAuthenticated);
    res.render("login", isAuthenticated);
});

app.get("/register", function(req, res){
    res.render("register");
});

app.get('/logout', function(req, res, next) {
    req.logout(function(err) {
        if (err) { 
            return next(err); 
        }
        res.redirect('/');
    });
});

app.post("/register", function(req, res){
    User.register({username: req.body.username}, req.body.password, function(err, user){
        if (err) {
            console.log(err);
            res.redirect("register");
        } else {
            passport.authenticate("local")(req, res, function(){
                res.redirect("/");
            });
        }
    });
});



// app.post("/login", function(req, res){
//     const user = new User({
//         username: req.body.username,
//         passport: req.body.password
//     });
//     req.login(user, function(err){
//         if (err) {
//             console.log(err);
//         } else {
//             passport.authenticate("local")(req, res, function(){
//                 res.redirect("/");
//             });
//         }
//     });
// });
app.post("/login", passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login"
    }), function (req, res) {
    });

app.listen(3000, function() {
    console.log("Server started on port 3000");
});