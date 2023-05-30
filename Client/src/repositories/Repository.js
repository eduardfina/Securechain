import axios from "axios";
import LocalRepository from "./LocalRepository";

const CancelToken = axios.CancelToken;
const CancelMessage = "cancelled";

/**
 * The Global Vars
 */

// Set up API params
const ApiPath = "/api";
const SocketPath = "/socket";

// The cancel tokens
const petitions = [];

// Interceptor
axios.interceptors.response.use((response) => {
  // Response Middleware
  return response;
}, (error) => {
  // Error Middleware
  if (error.response && error.response.headers.hasOwnProperty('content-type')) {
    const contentType = error.response.headers['content-type'];
    if (contentType.includes('application/json') && (error.response.data instanceof ArrayBuffer)) {
      try {
        let dataStr;
        if (contentType.includes('utf-16')) {
          dataStr = String.fromCharCode.apply(null, new Uint16Array(error.response.data));
        } else {
          dataStr = String.fromCharCode.apply(null, new Uint8Array(error.response.data));
        }

        if (dataStr) {
          error.response.data = JSON.parse(dataStr);
        } else {
          error.response.data = {message: "Could not parse JSON response"};
        }
      } catch (err) {
        error.response.data = {message: "Could not parse JSON response (" + err + ")"};
      }
    }
  } else if (error.message && error.message === CancelMessage) {
    error.cancelled = true;
  }
  return Promise.reject(error);
});

/**
 * Each petition is a new instance of this class
 */
class Repository {

  constructor () {
    this.token = null;
    this.cancel = false;
  }

  auth (token) {
    this.token = token;
    return this;
  }

  cancellable () {
    this.cancel = true;
    return this;
  }

  get (url, params = null) {
    return this.getRequest(url, { params: params });
  }

  getFile (url) {
    return this.getRequest(url, { responseType: 'arraybuffer' });
  }

  post (url, params) {
    return this.postRequest(url, { data: params });
  }

  postFile (url, files, params) {
    const options = { headers: { 'Content-Type': 'multipart/form-data' } };

    const formData = new FormData();

    for (const file of files) {
      formData.append('files', file);
    }

    for (const propt in params) {
      this.appendArray(formData, params[propt], propt);
    }
    options.data = formData;
    return this.postRequest(url, options);
  }

  getRequest (url, options) {
    return this.axiosRequest("GET", url, options);
  }

  postRequest (url, options) {
    return this.axiosRequest("POST", url, options);
  }

  axiosRequest (method, url, options) {
    // Default options values
    options.method = method;
    if (!options.responseType) options.responseType = 'json';
    if (!options.url) options.url = ApiPath + url;
    if (!options.headers) options.headers = {};
    // options.headers["Access-Control-Allow-Headers"] = "accept";
    // options.headers["Access-Control-Allow-Origin"] = "*";
    options.headers["Authorization"] = this.buildAuthHeader();

    // Do the petition if no cancellable
    if (!this.cancel) {
      return axios(options);
    }

    // Get the petition Uid
    const index = this.getMethodUid(options);

    // Cancel previous petition if not finished
    if (this.cancel && petitions[index] && !petitions[index].finished) {
      petitions[index].cancel(CancelMessage);
      petitions[index] = null;
    }

    // Add cancel token to petition
    petitions[index] = {finished: false};
    options.cancelToken = new CancelToken((c) => { petitions[index].cancel = c; });

    // Do petition
    return async () => {
      const result = await axios(options);
      if (petitions[index]) {
        petitions[index].finished = true;
      }
      return result;
    };
  }

  getMethodUid (options) {
    return options.method + "+" + options.url;
  }

  buildAuthHeader () {
    // First check for forced token
    let token = null;
    if (this.token) {
      token = this.token;
      this.token = null;
    }

    // Check local storage if null
    if (!token) {
      token = LocalRepository.get('token');
    }

    // Build Auth Header
    if (token) {
      return "Bearer " + token;
    }
    return "";
  }

  appendArray (form_data, values, name) {
    if (!values && name)
      form_data.append(name, '');
    else if (typeof values == 'object') {
      for (const key in values) {
        if (typeof values[key] == 'object')
          this.appendArray(form_data, values[key], name + '[' + key + ']');
        else
          form_data.append(name + '[' + key + ']', values[key]);
      }
    } else {
      form_data.append(name, values);
    }

    return form_data;
  }
}

export default {

  new () {
    return new Repository();
  },

  getApiPath () {
    return ApiPath;
  },

  getSocketPath () {
    return SocketPath;
  },

};
