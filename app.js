require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require('express-session');
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
//const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require('mongoose-findorcreate');

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

mongoose.connect('mongodb+srv://Raj:Raj18110@cluster0.y9rbp48.mongodb.net/userDB?retryWrites=true&w=majority');

const userSchema = new mongoose.Schema({
    email: String,
    password: String,
    googleId: String,
    secret: String
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

// passport.use(new GoogleStrategy({
//     clientID: process.env.CLIENT_ID,
//     clientSecret: process.env.CLIENT_SECRET,
//     callbackURL: "http://localhost:3000/auth/google/secrets",
//   },
//   function(accessToken, refreshToken, profile, cb) {
//     console.log(profile);
//     User.findOrCreate({ googleId: profile.id }, function (err, user) {
//       return cb(err, user);
//     });
//   }
// ))
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
  

app.get("/contactus",function(req,res){
    if (req.isAuthenticated()) {
        const loggedIn = true;
        res.render("contactus", { loggedIn: loggedIn });
    } else {
        const loggedIn = false;
        res.render("contactus", { loggedIn: loggedIn });
    }
});

app.get("/insurance",function(req,res){
    if (req.isAuthenticated()) {
        const loggedIn = true;
        res.render("insurance", { loggedIn: loggedIn });
    } else {
        res.redirect("login");
    }
  });

// app.get("/auth/google", 
//     passport.authenticate("google", { scope: ["profile"] })
// );

// app.get("/auth/google/secrets", 
//   passport.authenticate('google', { failureRedirect: "/login" }),
//   function(req, res) {
//     res.redirect("/secrets");
//   });

app.get("/login", function(req, res){
    const isAuthenticated = req.isAuthenticated()
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

app.post("/login", function(req, res){
    const user = new User({
        username: req.body.username,
        passport: req.body.password
    });
    req.login(user, function(err){
        if (err) {
            console.log(err);
        } else {
            passport.authenticate("local")(req, res, function(){
                res.redirect("/");
            });
        }
    });
});

app.listen(3000, function() {
    console.log("Server started on port 3000");
});