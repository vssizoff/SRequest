JSON.safeStringify = (obj, indent = 2) => {
    let cache = [];
    const retVal = JSON.stringify(
        obj,
        (key, value) =>
            typeof value === "object" && value !== null
                ? cache.includes(value)
                    ? undefined
                    : cache.push(value) && value
                : value,
        indent
    );
    cache = null;
    return retVal;
};

export default {
    query(query) {
        let str = "";
        Object.keys(query).forEach((key, index) => {
            str += `${index === 0 ? '?' : '&'}${key}=${query[key]}`;
        });
        return str;
    },
    params(url, params) {
        if (params === undefined || params === null || typeof params !== "object") return url;
        Object.keys(params).forEach(key => {
            url = url.replace(':' + key, params[key]);
        });
        return url;
    },
    headers(headers) {
        let obj = {};
        headers.forEach((value, key) => {
            obj[key] = value;
            try {
                obj[key] = JSON.parse(obj[key]);
            }
            catch (error) {
                let num = Number(obj[key]);
                if (!isNaN(num)) {
                    obj[key] = num;
                }
            }
        })
        return obj;
    }
};