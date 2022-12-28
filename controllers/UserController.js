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
  res.render("user/register", { errorMessage: "", user: {}, reqInfo: reqInfo ,    profile_id: null
});
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
         // let roles=await _userOps.getRolesByUsername(reqInfo.username);

          return res.render("user/register", {
            user: newUser,
            errorMessage: err,
            reqInfo: reqInfo,
           // roles:roles,


          });
        }


        // User registered so authenticate and redirect to profile
        passport.authenticate("local")(req, res, function () {

          res.redirect("/user/"+newUser._id);        
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
  let reqInfo = RequestService.reqHelper(request);
  if (reqInfo.authenticated) {
    let roles = await _userOps.getRolesByUsername(reqInfo.username);
    let sessionData = request.session;
    sessionData.roles = roles;
    reqInfo.roles = roles;
    console.log("reqqqqqq"+reqInfo.roles);
  console.log("loading profiles from controller");
  let profiles = null;

  if (request.query.search && request.query.selectFilter) {
    profiles = await _userOps.getProfilesByNameSearch(request.query.search,request.query.selectFilter);
  } else {
    profiles = await _userOps.getAllUsers();
  }
  if (profiles) {
    console.log(reqInfo.username);

let profile= await _userOps.getUserByUsername(reqInfo.username);
console.log(profile._id)
    response.render("profiles", {
      title: "Mongo Profiles - Profiles",
      profiles: profiles,
      search: request.query.search,
      reqInfo: reqInfo,
      profileId: profile.user._id,
     // roles:roles,

    });
  } else {

    response.render("profiles", {
      title: "Mongo Profiles - Profiles",
      profiles: [],
      search: request.query.search,
     // roles:roles,
      reqInfo: reqInfo,
      profileId: profile.user._id,



    });
  }}
};
exports.Comment = async function (request, response) {
  console.log("Comment");
  let reqInfo = RequestService.reqHelper(request);
  let profileInfo ;
  if(request.body.comments != ""){
  const comment = {
    commentBody: request.body.comments,
    commentAuthor: reqInfo.username,
  };
  profileInfo = await _userOps.addCommentToUser(
    comment,
    request.params.id
  );}
    // let roles = await _userOps.getRolesByUsername(reqInfo.username);
    // let sessionData = request.session;
    // sessionData.roles = roles;
    // reqInfo.roles = roles;
    
    
  const profileId = request.params.id;
  console.log(`loading single profile by id ${profileId}`);
  let profile = await _userOps.getUserById(profileId);
  let profiles = await _userOps.getAllUsers();
  if (profile) {
    response.render("profile", {
      profiles: profiles,
        profile:profile,
        profileId: request.params.id,
        profileComment: profile.comments,
        profileCommentBody: profileInfo.commentBody,
        profileCommentAuthor: profileInfo.commentAuthor,
        layout: "./layouts/sidebar",
        
        reqInfo:reqInfo,
      // roles:roles,

    });
  } else {
    response.render("profiles", {
      title: "Express Yourself - Profiles",
      profiles: [],
      reqInfo: reqInfo
    });
  }
};

  // Handle edit profile form GET request
exports.Edit = async function (request, response) {
  console.log("ediiiiit0"+request);

  let reqInfo = RequestService.reqHelper(request);
  console.log("ediiiiit0"+reqInfo.username);

  const profileId = request.params.id;
  console.log("ediiiiit1"+reqInfo.username);
  let roles = await _userOps.getRolesById(profileId);
  let profile = await _userOps.getUserById(profileId);
  console.log("ediiiiit"+profile);

  response.render("user/edit", {
    errorMessage: "",
    profile_id: profileId,
    user: profile,
    reqInfo: reqInfo,
    roles: roles
  });
};
// Handle profile edit form submission
exports.EditProfile = async function (request, response) {
  const profileId = request.body.profile_id;
  let profile=await _userOps.getUserById(request.body.profile_id);
   let picturePath = request.body.profilePic ? request.body.profilePic : profile.imagePath;
  
  if(request.files) {
    const { picture } = request.files;
  //let picturePath = request.body.profilePic || "";
  if (picture) {
    picturePath = `/images/${picture.name}`;
    const serverPath = path.join(__dirname, "../public", picturePath);
    picture.mv(serverPath);
  }
  }
  //const profileId = request.body.profile_id;
  const profileFName = request.body.firstName;
  const profileLName = request.body.lastName;
  const profileRoles = request.body.roles ? request.body.roles : profile.roles;
  console.log(profileRoles);
  const profileEmail = request.body.email;

  let profileInterests = [];
  if (request.body.interests) {
    profileInterests = request.body.interests.split(", ");
  }

  // send these to profileOps to update and save the document
  let responseObj = await _userOps.updateProfileById(
    profileId,
    profileEmail,
    profileFName,
    profileLName,
    profileInterests,
    picturePath,
    profileRoles

  );
  let reqInfo = RequestService.reqHelper(request);
 profile=await _userOps.getUserById(request.body.profile_id);
  // if no errors, save was successful
  if (responseObj.errorMsg == "") {
    let profiles = await _userOps.getAllUsers();
    response.render("profile", {
      title: "Mongo Profiles - " + responseObj.obj.name,
      profile:profile,
      profiles: profiles,
      profileId: responseObj.obj._id.valueOf(),
      layout: "./layouts/sidebar",
      reqInfo:reqInfo,

    });
  }
  // There are errors. Show form the again with an error message.
  else {
    console.log("An error occured. Item not created.");
    response.render("user/edit", {
      title: "Mongo Profiles - Edit Profile",
      profile: responseObj.obj,
      profileId: profileId,
      errorMessage: responseObj.errorMsg,
    });
  }
};

  exports.Detail = async function (request, response) {

    const profileId = request.params.id;
    let reqInfo = RequestService.reqHelper(request);
    let roles = await _userOps.getRolesByUsername(reqInfo.username);
    let sessionData = request.session;
    sessionData.roles = roles;
    reqInfo.roles = roles;
    console.log(`loading single profile by id ${profileId}`);
    let profile = await _userOps.getUserById(profileId);
    let profiles = await _userOps.getAllUsers();
    console.log("reqInfo",reqInfo.roles);
   
    console.log("checkkkkkk"+profile.comments);
    
    if (profile) {
      response.render("profile", {
        profiles: profiles,
        profile:profile,
        profileId: request.params.id,
        layout: "./layouts/sidebar",
        profileComment: profile.comments,
        reqInfo:reqInfo,
       roles:roles,
      });
    } else {
      response.render("profiles", {
        profiles: [],
        reqInfo:reqInfo,

       roles:roles,

      });
    }
    

  };


// Handle delete profile GET request
exports.DeleteUserById = async function (request, response) {
  const profileId = request.params.id;
  console.log(`deleting single profile by id ${profileId}`);
  let deletedProfile = await _userOps.deleteUserById(profileId);
  let profiles = await _userOps.getAllUsers();
  let reqInfo = RequestService.reqHelper(request);
  let profile= await _userOps.getUserByUsername(reqInfo.username);

let roles=await _userOps.getRolesByUsername(reqInfo.username);
  if (deletedProfile) {
    response.render("profiles", {
      profiles: profiles,
      search: "",
      reqInfo: reqInfo,
      roles:roles,
      profileId: profile.user._id,

    });
  } else {
    response.render("profiles", {
      profiles: profiles,
      errorMessage: "Error.  Unable to Delete",
      search: "",
      reqInfo: reqInfo,
      roles:roles,
      profileId: profile.user._id,

    });
  }
};