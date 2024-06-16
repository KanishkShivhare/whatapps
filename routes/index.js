var express = require("express");
var router = express.Router();
const usermodal = require("./users");
const passport = require("passport");
const localStrategy = require("passport-local");
passport.use(new localStrategy(usermodal.authenticate()));

/* GET home page. */
router.get("/", isLoggedIn, async function (req, res, next) {
  // const loggedinuser = await usermodal.findOne({
  //   _id:req.user._id
  // })
  const loggedInUser = req.user;
  // console.log(loggedInUser);
  res.render("profile", { title: "Whatapp", loggedInUser });
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
}

router.get("/register", (req, res, next) => {
  res.render("register");
});
router.post("/register", function (req, res) {
  var newUser = {
    username: req.body.username,
    contact: req.body.contact,
  };
  usermodal
    .register(newUser, req.body.password)
    .then(function (result) {
      passport.authenticate("local")(req, res, function () {
        res.redirect("/");
      });
    })
    .catch((err) => {
      res.send(err);
    });
});

router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
  }),
  function (req, res) {}
);
router.get("/login", (req, res, next) => {
  res.render("login");
});

router.get("/logout", function (req, res, next) {
  if (req.isAuthenticated())
    req.logout(function (err) {
      if (err) {
        res.send(err);
      } else res.redirect("/login");
    });
  else {
    res.redirect("/login");
  }
});

module.exports = router;
