
export default {

  get (key) {
    if (localStorage[key]) {
      return JSON.parse(localStorage[key]);
    }
    return null;
  },

  has (key) {
    return (this.get(key));
  },

  set (key, object) {
    localStorage[key] = JSON.stringify(object);
  },

  clear (key) {
    localStorage.removeItem(key);
  },

};
