
// const defaultOptions = {
//     url: null,
//     store: 'default',
//     userAgent: 'QuangThai',
//     home_cms_block_id: '',
//     authentication: {
//       integration: {
//         access_token: undefined,
//       },
//     },
//   };
function MagentoAPI(opt) {
    if (!(this instanceof MagentoAPI)) {
        return new MagentoAPI(opt);
    }

    let newOpt = opt || {};

    if (!newOpt.url) {
        throw new Error("url is required");
    }
    if (!newOpt.access_token) {
        throw new Error("consumerKey is required");
    }
    this._setDefaultsOptions(newOpt);
}

MagentoAPI.prototype._setDefaultsOptions = function (opt) {
    this.url = opt.url;
    this.wpAPI = opt.wpAPI || false;
    this.wpAPIPrefix = opt.wpAPIPrefix || "wp-json";
    this.store = opt.store || "default";
    this.isSsl = /^https/i.test(this.url);
    this.access_token = opt.access_token;
    this.verifySsl = opt.verifySsl;
    this.encoding = opt.encoding || "utf8";
    this.queryStringAuth = opt.queryStringAuth || true;
    this.port = opt.port || "";
    this.version = opt.version || 1
    this.timeout = opt.timeout || 10;
    this.language = opt.language || "en";
};

MagentoAPI.prototype._normalizeQueryString = function (url) {
    // Exit if don't find query string
    if (url.indexOf("?") === -1) return url;

    const query = url;
    const params = [];
    let queryString = "";

    for (const p in query) params.push(p);
    params.sort();

    for (const i in params) {
        if (queryString.length) queryString += "&";

        queryString += encodeURIComponent(params[i])
            .replace("%5B", "[")
            .replace("%5D", "]");
        queryString += "=";
        queryString += encodeURIComponent(query[params[i]]);
    }

    return `${url.split("?")[0]}?${queryString}`;
};

MagentoAPI.prototype._getUrl = function (endpoint, store, version) {
    let url = this.url.slice(-1) === "/" ? this.url : `${this.url}/`;
    const api = this.wpAPI ? `${this.wpAPIPrefix}/` : "rest/";
    this.store = store ? store : "default/";
    this.version = version ? version : "V1";
    url = `${url + api + this.store + this.version}/${endpoint}`;

    // Include port.
    if (this.port !== "") {
        const hostname = url; // _url.parse(url, true).hostname;
        url = url.replace(hostname, `${hostname}:${this.port}`);
    }

    if (!this.isSsl) return this._normalizeQueryString(url);

    return url;
};

MagentoAPI.prototype.join = function (obj, separator) {
    const arr = [];
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            arr.push(`${key}=${obj[key]}`);
        }
    }
    return arr.join(separator);
};

MagentoAPI.prototype._request = async function (method, endpoint, newData, store = null) {
    const url = this._getUrl(endpoint, store, this.version);
    let data = {
        ...newData,
        // lang: this.language,
    };
    const params = {
        url,
        method,
        encoding: this.encoding,
        timeout: this.timeout,
    };

    if (this.isSsl) {
        if (this.verifySsl) {
            params.strictSSL = this.verifySsl;
        }
    }
    params.qs = data

    if (method == "GET") {
        params.headers = { "Content-Type": "application/json", };
    } else if (method == "POST") {
        params.headers = {
            "Content-Type": "application/json",
        };
        params.body = JSON.stringify(data);
    }
    params.headers.Authorization = `Bearer ${this.access_token}`;
    params.url = `${params.url}?${this.join(params.qs, "&")}`;

    return await fetch(params.url, params)
        .catch((error, data) => {
            console.log('error network -', error, data);
        }
        );
};

MagentoAPI.prototype.get = async function (endpoint, data, store) {
    return await this._request("GET", endpoint, data, store);
};

MagentoAPI.prototype.post = async function (endpoint, data, callback) {
    return await this._request("POST", endpoint, data, callback);
};

MagentoAPI.prototype.put = async function (endpoint, data, callback) {
    return await this._request("PUT", endpoint, data, callback);
};

MagentoAPI.prototype.delete = async function (endpoint, callback) {
    return await this._request("DELETE", endpoint, null, callback);
};

MagentoAPI.prototype.options = async function (endpoint, callback) {
    return await this._request("OPTIONS", endpoint, null, callback);
};

export default MagentoAPI;
