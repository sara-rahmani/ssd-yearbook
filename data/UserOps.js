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

  async getRolesByUsername(username) {
    let user = await User.findOne({ username: username }, { _id: 0, roles: 1 });
    if (user.roles) {
      return user.roles;
    } else {
      return [];
    }
  }
}

module.exports = UserOps;
