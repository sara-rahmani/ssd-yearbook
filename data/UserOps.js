const User = require("../models/User");

class UserOps {
  // Constructor
  UserOps() {}

  async getUserByEmail(email) {
    let user = await User.findOne({ email: email });
    if (user) {
      const response = { obj: user, errorMessage: "" };
      return response;
    } else {
      return null;
    }
  }
  async getProfileById(id) {
    console.log(`getting profile by id ${id}`);
    let user = await User.findById(id);
    return user;
  }
  async getAllUsers() {
    console.log("getting all profiles");
    let users = await User.find().sort({ name: 1 });
    return users;
  }
  async getUserByUsername(username) {
    let user = await User.findOne(
      { username: username },
      { _id: 1, username: 1, email: 1, firstName: 1, lastName: 1,interests: 1,picturePath:1}
    );
    if (user) {
      const response = { user: user, errorMessage: "" };
      return response;
    } else {
      return null;
    }
  }
  async getProfilesByNameSearch(search,field) {
    console.log("searching profiles for: ", search);
    console.log("with field = : ", field);

    const filter = {  [`${field}`]: { $regex: search, $options: "i" } };

    let profiles = await User.find(filter).sort({ [`${field}`]: 1 });
console.log("profiles searched :",profiles)
    return profiles;
  }

  async getUserById(id) {
    console.log(`getting profile by id ${id}`);
    let user = await User.findById(id);
    console.log(user);
    return user;
  }
  async getRolesById(id) {
    console.log(id);
    let user = await User.findOne({ _id: id }, { _id: 0, roles: 1 });
    console.log(user);
    if (user.roles) {
      return user.roles;
    } else {
      return [];
    }
  }
  async getRolesByUsername(username) {
    console.log(username);
    let user = await User.findOne({ username: username }, { _id: 0, roles: 1 });
    console.log(user);
    if (user.roles) {
      return user.roles;
    } else {
      return [];
    }
  }
  async updateProfileById(id,profileEmail, profileFName,profileLName, profileInterests, picturePath) {
    console.log(`updating user profile by id ${id}`);
    const user = await User.findById(id);
    console.log("original user profile: ", user);
    user.firstName = profileFName;
    user.lastName = profileLName;
     user.email=profileEmail;
    user.interests = profileInterests;
    user.picturePath = picturePath;

    let result = await user.save();
    console.log("updated profile: ", result);
    return {
      obj: result,
      errorMsg: "",
    };}
    async deleteUserById(id) {
      console.log(`deleting user profile by id ${id}`);
      let result = await User.findByIdAndDelete(id);
      console.log(result);
      return result;
    }
}

module.exports = UserOps;
