/**
 * object 数据转换成 key=value&key2=value2 的字符串
 * @param obj object 数据
 * @returns 
 */
export let objectToKeyValue = (obj: any) => {
    let str = "";
    for (let key in obj) {
        if (obj[key] != null) {
            str += key + "=" + obj[key] + "&";
        }
    }
    return str.substring(0, str.length - 1);
}

class HttpRequestHelper {
    /**
     * get请求
     * @param url 请求地址 
     * @param callback 回调函数
     */
    get(url: string, callback: (response: string, error?: number) => void) {
        let xhr = new XMLHttpRequest();
        xhr.open("GET", url, true);
        // xhr.onprogress = function () {
        //     console.log('LOADING', xhr.readyState); // readyState 为 3
        // };
        // xhr.onload = function () {
        //     console.log('DONE', xhr.readyState); // readyState 为 4
        // };
        xhr.onreadystatechange = function () {
            // xhr.readyState
            // 0: request not initialized
            // 1: server connection established
            // 2: request received
            // 3: processing request
            // 4: request finished and response is ready

            // xhr.status
            // 200: "OK"
            // 403: "Forbidden"
            // 404: "Not Found"
            // 500: "Internal Server Error"

            if (xhr.readyState == 4 && xhr.status == 200) {
                callback(xhr.responseText);
            }
            else if (xhr.status != 200) {
                callback(xhr.responseText, xhr.status);
            }
        }
        xhr.timeout = 5000;
        xhr.send();
    }

    /**
     * post请求
     * @param url 请求地址
     * @param data 请求数据
     * @param callback 回调函数
     */
    post(url: string, data: any, callback: (response: string, error?: number) => void) {
        let xhr = new XMLHttpRequest();
        xhr.open("POST", url, true);
        // https://developer.mozilla.org/zh-CN/docs/Web/HTTP/CORS
        xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        if (cc.sys.isNative) {
            xhr.setRequestHeader('Access-Control-Allow-Origin', '*');
            xhr.setRequestHeader('Access-Control-Allow-Methods', 'GET, POST');
            xhr.setRequestHeader('Access-Control-Allow-Headers', 'x-requested-with,content-type');
            xhr.setRequestHeader("Content-Type", "application/json");
        }
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4 && xhr.status == 200) {
                callback(xhr.responseText);
            }
            else if (xhr.status != 200) {
                callback(xhr.responseText, xhr.status);
            }
        }
        xhr.timeout = 5000;

        if (typeof data == "object") {
            xhr.send(objectToKeyValue(data));
        }
        else {
            xhr.send(data);
        }
    }

    upload(url: string, file: string, callback: (response: string, error?: number) => void) {
        let xhr = new XMLHttpRequest();
        xhr.open("POST", url, true);
        const formData = new FormData();
        formData.append("file", file);
        xhr.setRequestHeader("Content-Type", "multipart/form-data");
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4 && xhr.status == 200) {
                callback(xhr.responseText);
            }
            else if (xhr.status != 200) {
                callback(xhr.responseText, xhr.status);
            }
        }
        xhr.timeout = 5000;
        xhr.send(formData);
    }

    download(url: string, callback: (response: string, error?: number) => void) {
        let xhr = new XMLHttpRequest();
        xhr.open("GET", url, true);
        xhr.responseType = "blob";
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4 && xhr.status == 200) {
                let blob = xhr.response;
                let reader = new FileReader();
                reader.readAsDataURL(blob);
                reader.onload = function (e) {
                    callback('');
                }
            }
        }
    }
    /**
     * get请求
     * @param url 请求地址 
     * @returns
     */
    async getAsync(url: string) {
        return new Promise<{ response: string, error?: number }>((resolve, reject) => {
            this.get(url, (response: string, error?: number) => {
                resolve({ response: response, error: error });
            });
        });
    }

    /**
     * post请求
     * @param url 请求地址
     * @param data 请求数据
     * @returns 
     */
    async postAsync(url: string, data: any) {
        return new Promise<{ response: string, error?: number }>((resolve, reject) => {
            this.post(url, data, (response: string, error?: number) => {
                resolve({ response: response, error: error });
            });
        });
    }
}

export let http = new HttpRequestHelper();

// class WebSocketHelper {
//     private _ws: WebSocket;
//     private _url: string;
//     private _onOpen: (event: Event) => void;
//     private _onClose: (event: Event) => void;
//     private _onMessage: (event: MessageEvent) => void;
//     private _onError: (event: Event) => void;
//     constructor(url: string) {
//         this._url = url;
//     }
//     open(onOpen: (event: Event) => void, onClose: (event: Event) => void, onMessage: (event: MessageEvent) => void, onError: (event: Event) => void) {
//         this._onOpen = onOpen;
//         this._onClose = onClose;
//         this._onMessage = onMessage;
//         this._onError = onError;
//         this._ws = new WebSocket(this._url);
//         this._ws.onopen = this._onOpen;
//         this._ws.onclose = this._onClose;
//         this._ws.onmessage = this._onMessage;
//         this._ws.onerror = this._onError;
//     }
//     send(data: string) {
//         this._ws.send(data);
//     }
//     close() {
//         this._ws.close();
//     }
//     get url(): string {
//         return this._url;
//     }
//     get ws(): WebSocket {
//         return this._ws;
//     }
// }
// export let socket = WebSocketHelper;