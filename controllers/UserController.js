const User = require("../models/User");
const path = require("path");

const passport = require("passport");
const RequestService = require("../services/RequestService");

// import and instantiate our userOps object
const UserOps = require("../data/UserOps");
const _userOps = new UserOps();

// Displays registration form.
exports.Register = async function (req, res) {
  let reqInfo = RequestService.reqHelper(req);
  res.render("user/register", { errorMessage: "", user: {}, reqInfo: reqInfo });
};

// Handles 'POST' with registration form submission.
exports.RegisterUser = async function (req, res) {
  const password = req.body.password;
  const passwordConfirm = req.body.passwordConfirm;
  console.log(req.files.picture.name);

  let image  = req.files.picture;
  let picturePath = req.body.profilePic || "";
  if (image) {
    picturePath = `/images/${image.name}`;
    const serverPath = path.join(__dirname, "../public", picturePath);
    image.mv(serverPath);
  }
  if (password == passwordConfirm) {
    // Creates user object with mongoose model.
    // Note that the password is not present.
    const newUser = new User({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      username: req.body.username,
      interests: req.body.interests.split(", "),
      picturePath: picturePath,

    });
    
    // Uses passport to register the user.
    // Pass in user object without password
    // and password as next parameter.
    User.register(
      new User(newUser),
      req.body.password,
      function (err, account) {
        // Show registration form with errors if fail.
        if (err) {
          let reqInfo = RequestService.reqHelper(req);
          return res.render("user/register", {
            user: newUser,
            errorMessage: err,
            reqInfo: reqInfo,

          });
        }

        
        // User registered so authenticate and redirect to profile
        passport.authenticate("local")(req, res, function () {
        

          // res.render("profile", {
          //   title: "Mongo Profiles - " + responseObj.obj.usename,
          //   profiles: users,
          //   profileId: responseObj.obj._id.valueOf(),
          //   layout: "./layouts/sidebar",
          // });
          res.redirect("/user/profile");

          
        })
     
     
        }
      );
    
      }
      
    else {
    let reqInfo = RequestService.reqHelper(req);
    res.render("user/register", {
      user: {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        username: req.body.username,

      },
      errorMessage: "Passwords do not match.",
      reqInfo: reqInfo,
    });
  }
};

// Shows login form.
exports.Login = async function (req, res) {
  let reqInfo = RequestService.reqHelper(req);
  let errorMessage = req.query.errorMessage;

  res.render("user/login", {
    user: {},
    errorMessage: errorMessage,
    reqInfo: reqInfo,
  });
};

// Receives login information & user roles, then store roles in session and redirect depending on authentication pass or fail.
exports.LoginUser = async (req, res, next) => {
    let userInfo = await _userOps.getUserByUsername(req.body.username);

  passport.authenticate("local", {
    successRedirect: "/user/"+userInfo.user._id,
    failureRedirect: "/user/login?errorMessage=Invalid login.",
  })(req, res, next);
};

// Log user out and direct them to the login screen.
exports.Logout = (req, res) => {
  // Use Passports logout function
  req.logout((err) => {
    if (err) {
      console.log("logout error");
      return next(err);
    } else {
      // logged out.  Update the reqInfo and redirect to the login page
      let reqInfo = RequestService.reqHelper(req);

      res.render("user/login", {
        user: {},
        isLoggedIn: false,
        errorMessage: "",
        reqInfo: reqInfo,
      });
    }
  });
};
exports.Index = async function (request, response) {
  console.log("loading profiles from controller");
  let profiles = null;

  if (request.query.search) {
    profiles = await _userOps.getProfilesByNameSearch(request.query.search);
  } else {
    profiles = await _userOps.getAllUsers();
  }
  let reqInfo = RequestService.reqHelper(request);

  if (profiles) {

    response.render("profiles", {
      title: "Mongo Profiles - Profiles",
      profiles: profiles,
      search: request.query.search,
      reqInfo: reqInfo,

    });
  } else {

    response.render("profiles", {
      title: "Mongo Profiles - Profiles",
      profiles: [],
      search: request.query.search,

    });
  }
};
// exports.Profile = async function (req, res) {
//   const username = req.params.id;

//   let reqInfo = RequestService.reqHelper(req);
//   if (reqInfo.authenticated) {
//     let roles = await _userOps.getRolesByUsername(username);
//     let sessionData = req.session;
//     sessionData.roles = roles;
//     reqInfo.roles = roles;
//     let userInfo = await _userOps.getUserById(username);
//     console.log(userInfo);
//     return res.render("user/profile", {
//       reqInfo: reqInfo,
//       userInfo: userInfo,
//       profileId:userInfo.user._id,
//     });
//   } else {
//     res.redirect(
//       "/user/login?errorMessage=You must be logged in to view this page."
//     );
//   }
// };
  exports.Edit = async function (request, response) {
    const profileId = request.params.id;
    //let profileObj = await _userOps.getRolesByUsername(profileId);
    console.log(`loading single profile by id ${profileId}`);

    let reqInfo = RequestService.reqHelper(request);
   // let profileObj = await _userOps.getProfileById(request.params.id);
    let userInfo = await _userOps.getUserByUsername(reqInfo.username);

    console.log(userInfo);
    response.render("user/register", {
      reqInfo: reqInfo,
    //  profile_id: profileId,
      //user: profileObj,


      userInfo: userInfo,
    });
  };
  exports.Detail = async function (request, response) {
    const profileId = request.params.id;
    let reqInfo = RequestService.reqHelper(request);
    console.log(`loading single profile by id ${profileId}`);
    let profile = await _userOps.getUserById(profileId);
    let profiles = await _userOps.getAllUsers();
    if (profile) {
      response.render("profile", {
        title: "Mongo Profiles - " + profile.name,
        profiles: profiles,
        profileId: request.params.id,
        layout: "./layouts/sidebar",
        reqInfo:reqInfo,
      });
    } else {
      response.render("profiles", {
        title: "Mongo Profiles - Profiles",
        profiles: [],
      });
    }
  };

// exports.Profile = async function (req, res) {
//   let reqInfo = RequestService.reqHelper(req);
//   const profileId = req.params.username;

//   if (reqInfo.authenticated) {
//     let roles = await _userOps.getRolesByUsername(reqInfo.username);
//     let sessionData = req.session;
//     sessionData.roles = roles;
//     reqInfo.roles = roles;
//     let profile = await _userOps.getUserByUsername(reqInfo.username);

//     let userInfo = await _userOps.getUserByUsername(reqInfo.username);
//     let users = await _userOps.getAllUsers();
//     if (profile) {


//     return res.render("user/profile/<% reqInfo.username%>", {
//       reqInfo: reqInfo,
//      userInfo: userInfo,
//       users: users,
//       profileId: reqInfo.username,
//        layout: "./layouts/sidebar",

//     });
//   } else {
//     response.render("profiles", {
//       title: "Mongo Profiles - Profiles",
//       profiles: [],
//     });
//   }

//   } else {
//     res.redirect(
//       "/user/login?errorMessage=You must be logged in to view this page."
//     );
//   }
// };

// Manager Area available to users who belong to Admin and/or Manager role
exports.ManagerArea = async function (req, res) {
  let reqInfo = RequestService.reqHelper(req, ["Admin", "Manager"]);

  if (reqInfo.rolePermitted) {
    res.render("user/manager-area", { errorMessage: "", reqInfo: reqInfo });
  } else {
    res.redirect(
      "/user/login?errorMessage=You must be a manager or admin to access this area."
    );
  }
};

// Admin Area available to users who belong to Admin role
exports.AdminArea = async function (req, res) {
  let reqInfo = RequestService.reqHelper(req, ["Admin"]);

  if (reqInfo.rolePermitted) {
    res.render("user/admin-area", { errorMessage: "", reqInfo: reqInfo });
  } else {
    res.redirect(
      "/user/login?errorMessage=You must be an admin to access this area."
    );
  }
};
