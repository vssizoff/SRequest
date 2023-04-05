# Importing
Download [this file](https://disk.yandex.ru/d/S16Krj_BUvpbOg)
```html
<script src="./sRequest.js"></script>
```
# GET
## Async
```javascript
get(url, {
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
    let {data, status, headers, response} = await getSync(url);
    console.log(data);
    console.log(status);
    console.log(headers);
    console.log(response);
    successFunc(data);
};
f();
```
# POST
# Async
```javascript
post(url, body, {
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
    let {data, status, headers, response} = await postSync(url, body);
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
formData(url, data, {
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
    let {data: d, status, headers, response} = await formDataSync(url, data);
    console.log(d);
    console.log(status);
    console.log(headers);
    console.log(response);
    successFunc(d);
};
f();
```