class HttpRequestHelper {
    get(url: string, callback: (response: string) => void, errorCallback?: (readyState: number, status: number) => void) {
        var xhr = new XMLHttpRequest();
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
            else if(xhr.status != 200) {
                errorCallback ? errorCallback(xhr.readyState, xhr.status) : null;
            }
        }
        xhr.timeout = 5000;
        xhr.send();
    }

    post(url: string, data: string, callback: (response: string) => void, errorCallback?: (readyState: number, status: number) => void) {
        var xhr = new XMLHttpRequest();
        xhr.open("POST", url, true);
        xhr.setRequestHeader("Content-type", "application/json");
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
            else {
                errorCallback ? errorCallback(xhr.readyState, xhr.status) : null;
            }
        }
        xhr.send(data);
    }

    async getAsync(url: string) {
        return new Promise<string>((resolve, reject) => {
            this.get(url, resolve, reject);
        });
    }

    async postAsync(url: string, data: string) {
        return new Promise<string>((resolve, reject) => {
            this.post(url, data, resolve, reject);
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