/**
 * CREATOR_2.4.9
 * DateTime = Mon Jun 20 2022 14:07:32 GMT+0800 (中国标准时间)
 * Author = eathon
 * github = https://github.com/eathonq/creator_2.4.9.git
 * email = vangagh@live.cn
 */

const OBSERVABLE_DEBUG = false;
const OBSERVABLE_EMIT_HEAD = 'observable_emit:';

//#region observable
type ValueCallback = {
    target: any,
    callback: (newVal: any, oldVal: any, pathArray: string[]) => void
};

let getNodePath = (node: cc.Node) => {
    let nodePath = [];
    let check = node;
    while (check) {
        nodePath.splice(0, 0, check.name);
        check = check.parent;
    }
    return nodePath.join('/');
}

/**
 * 通知属性装饰器   
 * @note 如果绑定的属性带初始化，需要手动去获取初始值
 */
export default function observable(target: any, propertyName: string) {
    let handle: ValueCallback = target['__context_callback__'];
    if (!handle) {
        handle = target['__context_callback__'] = { target: null, callback: null };
        if (target.initContext) {
            target.initContext();
        }
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
    // 如果默认值不为空，则马上触发回调
    if (oldVal !== undefined && oldVal !== null) {
        doCallback(handle, oldVal, oldVal, pathArray);
    }

    // 属性劫持
    Object.defineProperty(target, property, {
        get: function () {
            if (OBSERVABLE_DEBUG) cc.log(`get ${pathArray.join('.')} => ${oldVal}`);
            return oldVal;
        },
        set: function (val) {
            if (val !== oldVal) {
                let _oldVal = oldVal;
                if (OBSERVABLE_DEBUG) cc.log(`set ${pathArray.join('.')} => ${val}`);
                oldVal = val;
                doCallback(handle, val, _oldVal, pathArray);

                if (val !== null || val !== undefined) {
                    // 重新劫持子属性
                    switch (Object.prototype.toString.call(val)) {
                        case '[object Object]':
                            observableObject(handle, val, pathArray);
                            break;
                        case '[object Array]':
                            observableCollection(handle, val, pathArray);
                            break;
                    }
                }
            }
        },
        enumerable: true,
        configurable: true
    });

    if (oldVal !== undefined && oldVal !== null) {
        // 重新劫持子属性
        switch (Object.prototype.toString.call(oldVal)) {
            case '[object Object]':
                observableObject(handle, oldVal, pathArray);
                break;
            case '[object Array]':
                observableCollection(handle, oldVal, pathArray);
                break;
        }
    }
}

function observableObject(handle: ValueCallback, target: any, pathArray: string[]) {
    // 监听所有属性
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

    // 监听所有数组项
    for (let i = 0; i < target.length; i++) {
        let newPathArray = pathArray.slice();
        newPathArray.push(i.toString());
        observableValue(handle, target, newPathArray);
    }
}
//#endregion

//#region ObservableObject
/** 
 * 可监听对象
 * @note 对象属性需要使用 observable 装饰
 */
class ObservableObject {
    /**
     * 可监听对象
     * @param tag 标签
     * @param obj 对象
     */
    constructor(tag: string, obj: any) {
        this.$_obj = obj;
        this.tag = tag;

        let handle = obj['__context_callback__'];
        if (!handle) {
            handle = obj['__context_callback__'] = { target: null, callback: null };
        }
        handle.target = this;
        handle.callback = this.callback;
    }

    /** 标签 */
    tag: string;
    private $_obj: any;

    private callback(newVal: any, oldVal: any, pathArray: string[]): void {
        if (OBSERVABLE_DEBUG) cc.log(`${this.tag}.${pathArray} >> old:${oldVal} new:${newVal}`);
        cc.director.emit(OBSERVABLE_EMIT_HEAD + this.tag + '.' + pathArray.join('.'), newVal, oldVal, pathArray);
    }

    setValue(path: string, val: any) {
        let obj = this.$_obj;
        let props = path.split('.');
        for (let i = 0; i < props.length; i++) {
            if (!obj) return;
            const propName = props[i];
            if (propName in obj === false) {
                let tag = this.tag;
                if (OBSERVABLE_DEBUG) cc.warn('[' + propName + '] not find in ' + tag + '.' + path);
                break;
            }
            if (i == props.length - 1) {
                obj[propName] = val;
            } else {
                obj = obj[propName];
            }
        }
    }

    getValue(path: string, def?: any) {
        let obj = this.$_obj;
        let props = path.split('.');
        for (let i = 0; i < props.length; i++) {
            if (!obj) return def;
            const propName = props[i];
            if ((propName in obj === false)) {
                let tag = this.tag;
                if (OBSERVABLE_DEBUG) cc.warn('[' + propName + '] not find in ' + tag + '.' + path);
                return def;
            }
            obj = obj[propName];
        }
        if (obj === null || typeof obj === "undefined") obj = def;
        return obj;
    }
}
//#endregion

//#region ObservableManager
export class ObservableManager {
    //#region instance
    private static _instance: ObservableManager;
    static get instance(): ObservableManager {
        if (!ObservableManager._instance) {
            ObservableManager._instance = new ObservableManager();
        }
        return ObservableManager._instance;
    }
    //#endregion

    //#region array
    private _array: Array<ObservableObject> = [];
    set(obj: ObservableObject) {
        if (!obj) return;

        let has = this._array.some(item => item.tag == obj.tag);
        if (has) {
            this.remove(obj.tag);
        }

        this._array.push(obj);
    }

    get(tag: string): ObservableObject {
        let item = this._array.find(item => item.tag == tag);
        if (item) {
            return item;
        }
        return null;
    }

    remove(tag: string) {
        let index = this._array.findIndex(item => item.tag == tag);
        if (index >= 0) {
            this._array.splice(index, 1);
        }
    }

    clear() {
        this._array.length = 0;
    }

    /**
     * 创建一个可监听对象
     * @param tag 标签
     * @param obj 对象
     */
    create(tag: string, obj: any) {
        let item = new ObservableObject(tag, obj);
        this.set(item);
    }
    //#endregion

    //#region value
    setValue(path: string, value: any) {
        path = path.trim();
        let rs = path.split('.');
        if (rs.length < 2) {
            cc.warn(`${path} is not a valid path`);
            return;
        }
        let object = this.get(rs[0]);
        if (!object) {
            // cc.warn(`${rs[0]} not exist`);
            return;
        }
        if (object) {
            object.setValue(rs.slice(1).join('.'), value);
        }
    }

    getValue(path: string, def?: any) {
        path = path.trim();
        let rs = path.split('.');
        if (rs.length < 2) {
            cc.warn(`${path} is not a valid path`);
            return;
        }
        let object = this.get(rs[0]);
        if (!object) {
            // cc.warn(`${rs[0]} not exist`);
            return;
        }
        if (object) {
            return object.getValue(rs.slice(1).join('.'), def);
        }
    }

    addValue(path: string, value: any) {
        path = path.trim();
        let rs = path.split('.');
        if (rs.length < 2) {
            cc.warn(`${path} is not a valid path`);
            return;
        }
        let object = this.get(rs[0]);
        if (!object) {
            // cc.warn(`${rs[0]} not exist`);
            return;
        }
        if (object) {
            let path = rs.slice(1).join('.');
            object.setValue(path, object.getValue(path) + value);
        }
    }
    //#endregion

    //#region bind
    /**
     * 绑定数据
     * @param path 数据路径
     * @param callback 回调函数
     * @param target 回调函数的对象
     * @param useCapture 是否捕获
     * @returns 
     */
    bind(path: string, callback: (newVal: any, oldVal: any, pathArray: string[]) => void, target?: any, useCapture?: boolean): void {
        path = path.trim();
        if (path == '') {
            cc.warn(`path:${getNodePath(target.node)} `, '节点绑定的路径为空');
            return;
        }
        if (path.split('.')[0] === '*') {
            cc.warn(`path:${getNodePath(target.node)} `, path, '路径不合法,可能错误覆盖了其他路径');
            return;
        }
        cc.director.on(OBSERVABLE_EMIT_HEAD + path, callback, target, useCapture);
    }

    /**
     * 解除绑定
     * @param path 数据路径
     * @param callback 回调函数
     * @param target 回调函数的对象
     * @returns 
     */
    unbind(path: string, callback: (newVal: any, oldVal: any, pathArray: string[]) => void, target?: any): void {
        path = path.trim();
        if (path.split('.')[0] === '*') {
            cc.warn(path, '路径不合法,可能错误覆盖了其他路径');
            return;
        }
        cc.director.off(OBSERVABLE_EMIT_HEAD + path, callback, target);
    }
    //#endregion

}
//#endregion