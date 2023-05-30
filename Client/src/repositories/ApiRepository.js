import Repository from "./Repository";

export default {
  // Example GET
  exampleGet () {
    return Repository.new().get("/get");
  },
  // Example POST
  examplePost () {
    return Repository.new().post("/post", {arg1: 1});
  },
  login (username, password) {
    return Repository.new().post("/login", {username: username, password: password});
  },
  register (username, name, lastName, email, password) {
    return Repository.new().post("/register", {username: username, name: name, lastName: lastName, email: email, password: password});
  },
  getUserByAuth (authentication) {
    return Repository.new().auth(authentication).get("/getUserByAuth");
  }
};
