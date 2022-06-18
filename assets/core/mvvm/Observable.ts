export const MVVM_DEBUG = false;

type ValueCallback = {
    target: any,
    callback: (newVal: any, oldVal: any, pathArray: string[]) => void
};

/**
 * 通知属性装饰器
 */
export function observable(target: any, propertyName: string) {
    let handle: ValueCallback = target['__context_callback__'];
    if (!handle) {
        handle = target['__context_callback__'] = { target: null, callback: null };
    }
    observableValue(handle, target, [propertyName]);
}

function doCallback(handle: ValueCallback, newVal: any, oldVal: any, pathArray: string[]) {
    if (handle.callback) {
        if (handle.target) {
            handle.callback.call(handle.target, newVal, oldVal, pathArray);
        }
        else {
            handle.callback(newVal, oldVal, pathArray);
        }
    }
}

function observableValue(handle: ValueCallback, target: any, pathArray: string[]) {
    let property = pathArray[pathArray.length - 1];
    let oldVal = target[property];

    // 属性劫持
    Object.defineProperty(target, property, {
        get: function () {
            if (MVVM_DEBUG) cc.log(`get ${pathArray.join('.')} => ${oldVal}`);
            return oldVal;
        },
        set: function (val) {
            if (val !== oldVal) {
                doCallback(handle, val, oldVal, pathArray);
                if (MVVM_DEBUG) cc.log(`set ${pathArray.join('.')} => ${val}`);
                oldVal = val;
                if (Object.prototype.toString.call(val) === '[object Object]') {
                    observableObject(handle, val, pathArray);
                }
            }
        },
        enumerable: true,
        configurable: true
    });

    // 子属性劫持
    switch (Object.prototype.toString.call(oldVal)) {
        case '[object Object]':
            observableObject(handle, oldVal, pathArray);
            break;
        case '[object Array]':
            observableCollection(handle, oldVal, pathArray);
            break;
    }
}

function observableObject(handle: ValueCallback, target: any, pathArray: string[]) {
    Object.keys(target).forEach(key => {
        let newPathArray = pathArray.slice();
        newPathArray.push(key);
        observableValue(handle, target, newPathArray);
    });
}

const OAM = ['push', 'pop', 'shift', 'unshift', 'sort', 'reverse', 'splice'];
function observableCollection(handle: ValueCallback, target: any, pathArray: string[]) {
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
                observableValue(handle, this, pathArray);
                doCallback(handle, this, oldVal, pathArray);
                return result;
            }
        })
    });

    // 最后 让该数组实例的 __proto__ 属性指向 假的原型 overrideProto  
    target['__proto__'] = overrideProto;
}