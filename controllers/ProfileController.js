const path = require("path");

const Profile = require("../models/Profile.js");

const ProfileOps = require("../data/ProfileOps");
// instantiate the class so we can use its methods
const _profileOps = new ProfileOps();

exports.Index = async function (request, response) {
  console.log("loading profiles from controller");
  let profiles = null;
  if (request.query.search) {
    profiles = await _profileOps.getProfilesByNameSearch(request.query.search);
  } else {
    profiles = await _profileOps.getAllProfiles();
  }

  if (profiles) {
    response.render("profiles", {
      title: "Mongo Profiles - Profiles",
      profiles: profiles,
      search: request.query.search,
    });
  } else {
    response.render("profiles", {
      title: "Mongo Profiles - Profiles",
      profiles: [],
      search: request.query.search,
    });
  }
};

exports.Detail = async function (request, response) {
  const profileId = request.params.id;
  console.log(`loading single profile by id ${profileId}`);
  let profile = await _profileOps.getProfileById(profileId);
  let profiles = await _profileOps.getAllProfiles();
  if (profile) {
    response.render("profile", {
      title: "Mongo Profiles - " + profile.name,
      profiles: profiles,
      profileId: request.params.id,
      layout: "./layouts/sidebar",
    });
  } else {
    response.render("profiles", {
      title: "Mongo Profiles - Profiles",
      profiles: [],
    });
  }
};

// Handle profile form GET request
exports.Create = async function (request, response) {
  response.render("profile-form", {
    title: "Mongo Profiles - Create Profile",
    errorMessage: "",
    profile_id: null,
    profile: {
      name: "",
      interests: [],
      picture: "",
    },
  });
};

// Handle profile form GET request
exports.CreateProfile = async function (request, response) {
  const { picture } = request.files;
  let picturePath = request.body.profilePic || "";
  if (picture) {
    picturePath = `/images/${picture.name}`;
    const serverPath = path.join(__dirname, "../public", picturePath);
    picture.mv(serverPath);
  }

  // instantiate a new Profile Object populated with form data
  let tempProfileObj = new Profile({
    name: request.body.name,
    interests: request.body.interests.split(", "),
    picturePath: picturePath,
  });

  //
  let responseObj = await _profileOps.createProfile(tempProfileObj);

  // if no errors, save was successful
  if (responseObj.errorMsg == "") {
    let profiles = await _profileOps.getAllProfiles();
    console.log(responseObj.obj);
    response.render("profile", {
      title: "Mongo Profiles - " + responseObj.obj.name,
      profiles: profiles,
      profileId: responseObj.obj._id.valueOf(),
      layout: "./layouts/sidebar",
    });
  }
  // There are errors. Show form the again with an error message.
  else {
    console.log("An error occured. Item not created.");
    response.render("profile-form", {
      title: "Mongo Profiles - Create Profile",
      profile: responseObj.obj,
      errorMessage: responseObj.errorMsg,
    });
  }
};

// Handle delete profile GET request
exports.DeleteProfileById = async function (request, response) {
  const profileId = request.params.id;
  console.log(`deleting single profile by id ${profileId}`);
  let deletedProfile = await _profileOps.deleteProfileById(profileId);
  let profiles = await _profileOps.getAllProfiles();

  if (deletedProfile) {
    response.render("profiles", {
      title: "Mongo Profiles - Profiles",
      profiles: profiles,
      search: "",
    });
  } else {
    response.render("profiles", {
      title: "Mongo Profiles - Profiles",
      profiles: profiles,
      errorMessage: "Error.  Unable to Delete",
      search: "",
    });
  }
};

// Handle edit profile form GET request
exports.Edit = async function (request, response) {
  const profileId = request.params.id;
  let profileObj = await _profileOps.getProfileById(profileId);
  response.render("profile-form", {
    title: "Mongo Profiles - Edit Profile",
    errorMessage: "",
    profile_id: profileId,
    profile: profileObj,
  });
};

// Handle profile edit form submission
exports.EditProfile = async function (request, response) {
  const { picture } = request.files;
  let picturePath = request.body.profilePic || "";
  if (picture) {
    picturePath = `/images/${picture.name}`;
    const serverPath = path.join(__dirname, "../public", picturePath);
    picture.mv(serverPath);
  }

  const profileId = request.body.profile_id;
  const profileName = request.body.name;
  let profileInterests = [];
  if (request.body.interests) {
    profileInterests = request.body.interests.split(", ");
  }

  // send these to profileOps to update and save the document
  let responseObj = await _profileOps.updateProfileById(
    profileId,
    profileName,
    profileInterests,
    picturePath
  );

  // if no errors, save was successful
  if (responseObj.errorMsg == "") {
    let profiles = await _profileOps.getAllProfiles();
    response.render("profile", {
      title: "Mongo Profiles - " + responseObj.obj.name,
      profiles: profiles,
      profileId: responseObj.obj._id.valueOf(),
      layout: "./layouts/sidebar",
    });
  }
  // There are errors. Show form the again with an error message.
  else {
    console.log("An error occured. Item not created.");
    response.render("profile-form", {
      title: "Mongo Profiles - Edit Profile",
      profile: responseObj.obj,
      profileId: profileId,
      errorMessage: responseObj.errorMsg,
    });
  }
};
