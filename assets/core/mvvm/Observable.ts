export const MVVM_DEBUG = false;

/**
 * 观察者
 */
export function observable(target: any, propertyName: string) {
    let contextCallback: { target: any, callback: Function } = target['__context_callback__'];
    if (!contextCallback) {
        contextCallback = target['__context_callback__'] = { target: null, callback: null };
    }
    observableValue(contextCallback, target, [propertyName]);
}

function doCallback(handle: { target: any, callback: Function }, n: any, o: any, path: string[]) {
    if (handle.callback) {
        if (handle.target) {
            handle.callback.call(handle.target, n, o, path);
        }
        else {
            handle.callback(n, o, path);
        }
    }
}

function observableValue(contextCallback: { target: any, callback: Function }, target: any, path: string[]) {
    let _property = path[path.length - 1];
    let _val = target[_property];

    // 属性劫持
    Object.defineProperty(target, _property, {
        get: function () {
            if (MVVM_DEBUG) cc.log(`get ${path.join('.')} => ${_val}`);
            return _val;
        },
        set: function (val) {
            if (val !== _val) {
                doCallback(contextCallback, val, _val, path);
                if (MVVM_DEBUG) cc.log(`set ${path.join('.')} => ${val}`);
                _val = val;
                if (Object.prototype.toString.call(val) === '[object Object]') {
                    observableObject(contextCallback, val, path);
                }
            }
        },
        enumerable: true,
        configurable: true
    });

    // 子属性劫持
    switch (Object.prototype.toString.call(_val)) {
        case '[object Object]':
            observableObject(contextCallback, _val, path);
            break;
        case '[object Array]':
            observableCollection(contextCallback, _val, path);
            break;
    }
}

function observableObject(contextCallback: { target: any, callback: Function }, target: any, path: string[]) {
    Object.keys(target).forEach(key => {
        let pathArray = path.slice();
        pathArray.push(key);
        observableValue(contextCallback, target, pathArray);
    });
}

const OAM = ['push', 'pop', 'shift', 'unshift', 'sort', 'reverse', 'splice'];
function observableCollection(contextCallback: { target: any, callback: Function }, target: any, path: string[]) {
    // 保存原始 Array 原型  
    let originalProto = Array.prototype;
    // 通过 Object.create 方法创建一个对象，该对象的原型是Array.prototype  
    let overrideProto = Object.create(Array.prototype);
    let result: any;

    // 遍历要重写的数组方法  
    OAM.forEach((method) => {
        Object.defineProperty(overrideProto, method, {
            value: function () {
                let oldVal = this.slice();
                //调用原始原型上的方法  
                result = originalProto[method].apply(this, arguments);
                //继续监听新数组  
                observableValue(contextCallback, this, path);
                doCallback(contextCallback, this, oldVal, path);
                return result;
            }
        })
    });

    // 最后 让该数组实例的 __proto__ 属性指向 假的原型 overrideProto  
    target['__proto__'] = overrideProto;
}