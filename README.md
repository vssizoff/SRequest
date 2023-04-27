![SRequest docs](./SRequest.png)
# Importing
## CDN
```html
<script src="https://cdn.jsdelivr.net/gh/vssizoff/SRequest/cdn.js"></script>
```
## NPM
```
npm i srequest_js
```
# GET
## Async
```javascript
getRequest(url, {
    onSuccess(data, status, headers, response) {
        console.log(data); // parsed response
        console.log(status);
        console.log(headers);
        console.log(response);
    },
    onError(data, status, headers, response) {
        console.log(data);
        console.log(status);
        console.log(headers);
        console.log(response);
    }
});
```
## Sync
```javascript
let f = async () => {
    let {data, status, headers, response} = await getRequestSync(url);
    console.log(data);
    console.log(status);
    console.log(headers);
    console.log(response);
    successFunc(data);
};
f();
```
# POST
## Async
```javascript
postRequest(url, body, {
    onSuccess(data, status, headers, response) {
        console.log(data);
        console.log(status);
        console.log(headers);
        console.log(response);
        successFunc(data);

    },
    onError(data, status, headers, response) {
        console.log(data);
        console.log(status);
        console.log(headers);
        console.log(response);
        errorFunc(data);
    }
});
```
## Sync
```javascript
let f = async () => {
    let {data, status, headers, response} = await postRequestSync(url, body);
    console.log(data);
    console.log(status);
    console.log(headers);
    console.log(response);
    successFunc(data);
};
f();
```
# FormData
## Async
```javascript
formDataRequest(url, data, {
    onSuccess(data, status, headers, response) {
        console.log(data);
        console.log(status);
        console.log(headers);
        console.log(response);
        successFunc(data);

    },
    onError(data, status, headers, response) {
        console.log(data);
        console.log(status);
        console.log(headers);
        console.log(response);
        errorFunc(data);
    }
});
```
## Sync
```javascript
let f = async () => {
    let {data: d, status, headers, response} = await formDataRequestSync(url, data);
    console.log(d);
    console.log(status);
    console.log(headers);
    console.log(response);
    successFunc(d);
};
f();
```