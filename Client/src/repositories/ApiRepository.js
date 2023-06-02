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
  },
  getMyAssets (authentication) {
    return Repository.new().auth(authentication).get("/getMyAssets");
  },
  setAddress (authentication, address, message) {
    return Repository.new().auth(authentication).post("/setAddress", {address, message});
  },
  getMyValidations (authentication) {
    return Repository.new().auth(authentication).get("/getMyValidations");
  },
  getMySecuredAssets(authentication) {
    return Repository.new().auth(authentication).get("/getMySecuredAssets");
  },
  getPermission(authentication, address) {
    return Repository.new().auth(authentication).get("/getPermission", {address});
  },
  sendToken(authentication, toAddress, contractAddress, amount) {
    return Repository.new().auth(authentication).post("/sendToken", {toAddress, contractAddress, amount});
  },
  sendNFT(authentication, toAddress, contractAddress, tokenId) {
    return Repository.new().auth(authentication).post("/sendNFT", {toAddress, contractAddress, tokenId});
  },
  createContract (authentication, address) {
    return Repository.new().auth(authentication).post("/createContract", {address});
  },
  getContractFromOriginalAddress(authentication, originalAddress) {
    console.log(authentication);
    return Repository.new().auth(authentication).get("/getContractFromOriginalAddress", {originalAddress});
  }
};
