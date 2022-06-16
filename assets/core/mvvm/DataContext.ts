import { JsonOb } from "./JsonOb";

const VM_EMIT_HEAD = 'VC:';
const DEBUG_SHOW_PATH = true;

/** 绑定模式 */
export enum BindingMode {
    /** 双向绑定，导致对源属性或目标属性的更改自动更新另一个。 */
    TwoWay = 0,
    /** 单向绑定，当绑定源改变时更新绑定目标属性。 */
    OneWay = 1,
    /** 一次绑定，在应用程序启动或数据上下文更改时更新绑定目标。 */
    OneTime = 2,
    /** 当目标属性更改时更新源属性。 */
    OneWayToSource = 3,
}

/** 通过 .  路径 设置值 */
function setValueFromPath(obj: any, path: string, value: any, tag: string = '') {
    let props = path.split('.');
    for (let i = 0; i < props.length; i++) {
        const propName = props[i];
        if (propName in obj === false) { console.error('[' + propName + '] not find in ' + tag + '.' + path); break; }
        if (i == props.length - 1) {
            obj[propName] = value;
        } else {
            obj = obj[propName];
        }
    }
}

/** 通过 . 路径 获取值 */
function getValueFromPath(obj: any, path: string, def?: any, tag: string = ''): any {
    let props = path.split('.');
    for (let i = 0; i < props.length; i++) {
        const propName = props[i];
        if ((propName in obj === false)) { console.error('[' + propName + '] not find in ' + tag + '.' + path); return def; }
        obj = obj[propName];
    }
    if (obj === null || typeof obj === "undefined") obj = def;//如果g == null 则返回一个默认值
    return obj;

}

/** 数据上下文 */
class DataContext<T> {
    /**
     * 数据上下文
     * @param data 数据
     * @param tag 标记
     */
    constructor(data: T, tag: string) {
        new JsonOb(data, this._callback.bind(this));
        this.$data = data;
        this._tag = tag;
    }

    public $data: T;
    private _tag: string;
    /**激活状态, 将会通过 cc.director.emit 发送值变动的信号, 适合需要屏蔽的情况 */
    public active: boolean = true;
    /**是否激活根路径回调通知, 不激活的情况下 只能监听末端路径值来判断是否变化 */
    public emitToRootPath: boolean = false;

    private _callback(n: any, o: any, path: string[]): void {
        if (this.active == true) {
            let name = VM_EMIT_HEAD + this._tag + '.' + path.join('.')
            if (DEBUG_SHOW_PATH) cc.log(`${this._tag}.${path} >> old:${o} new:${n}`);

            cc.director.emit(name, n, o, [this._tag].concat(path)); //通知末端路径

            if (this.emitToRootPath) cc.director.emit(VM_EMIT_HEAD + this._tag, n, o, path);//通知主路径

            if (path.length >= 2) {
                for (let i = 0; i < path.length - 1; i++) {
                    const e = path[i];
                    //cc.log('中端路径');
                }
            }

        }
    }

    /**
     * 通过路径设置数据的方法
     * @param path 数据路径
     * @param value 数据值
     */
    public setValue(path: string, value: any) {
        setValueFromPath(this.$data, path, value, this._tag);
    }
    /**
     * 获取路径的值
     * @param path 数据路径
     * @param def 默认值
     * @returns 值
     */
    public getValue(path: string, def?: any): any {
        return getValueFromPath(this.$data, path, def, this._tag);
    }
}

/** 数据上下文管理 */
class DataContextManager {
    /**
     * 添加数据上下文
     */
    constructor() {
        this._array = [];
    }

    private _array: Array<{ tag: string, context: DataContext<any> }>;
    private _head: string;

    set<T>(data: T, tag: string = 'global') {
        if (!data) return;

        let has = this._array.some(item => item.tag == tag);
        if (has) {
            this.remove(tag);
        }

        let context = new DataContext<T>(data, tag);
        this._array.push({ tag, context });
    }

    get<T>(tag: string): DataContext<T> {
        let context = this._array.find(item => item.tag == tag);
        if (context) {
            return context.context;
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

    setValue(path: string, value: any) {
        path = path.trim();
        let rs = path.split('.');
        if (rs.length < 2) {
            cc.warn(`${path} is not a valid path`);
            return;
        }
        let context = this.get(rs[0]);
        if (!context) {
            cc.warn(`${rs[0]} not exist`);
            return;
        }
        if (context) {
            context.setValue(rs.slice(1).join('.'), value);
        }
    }

    getValue(path: string, def?: any): any {
        path = path.trim();
        let rs = path.split('.');
        if (rs.length < 2) {
            cc.warn(`${path} is not a valid path`);
            return;
        }
        let context = this.get(rs[0]);
        if (!context) {
            cc.warn(`${rs[0]} not exist`);
            return;
        }
        if (context) {
            return context.getValue(rs.slice(1).join('.'), def);
        }
    }

    addValue(path: string, value: any) {
        path = path.trim();
        let rs = path.split('.');
        if (rs.length < 2) {
            cc.warn(`${path} is not a valid path`);
            return;
        }
        let context = this.get(rs[0]);
        if (!context) {
            cc.warn(`${rs[0]} not exist`);
            return;
        }
        if (context) {
            let path = rs.slice(1).join('.');
            context.setValue(path, context.getValue(path) + value);
        }
    }

    /**
     * 绑定数据
     * @param path 数据路径
     * @param callback 回调函数
     * @param target 回调函数的对象
     * @param useCapture 是否捕获
     * @returns 
     */
    bind(path: string, callback: (n: any, o: any, pathArray: string[]) => void, target?: any, useCapture?: boolean): void {
        path = path.trim(); //防止空格,自动剔除
        if (path == '') {
            console.error(target.node.name, '节点绑定的路径为空');
            return;
        }
        if (path.split('.')[0] === '*') {
            console.error(path, '路径不合法,可能错误覆盖了其他路径');
            return;
        }

        cc.director.on(VM_EMIT_HEAD + path, callback, target, useCapture);
    }

    /**
     * 解除绑定
     * @param path 数据路径
     * @param callback 回调函数
     * @param target 回调函数的对象
     * @returns 
     */
    unbind(path: string, callback: (n: any, o: any, pathArray: string[]) => void, target?: any): void {
        path = path.trim();//防止空格,自动剔除
        if (path.split('.')[0] === '*') {
            console.error(path, '路径不合法,可能错误覆盖了其他路径');
            return;
        }
        cc.director.off(VM_EMIT_HEAD + path, callback, target);
    }
}

let DM = new DataContextManager();

/** 数据上上下文属性装饰器 */
export function context(tag?: string) {
    return function context(target: any, propertyName: string) {
        let _val = target[propertyName];

        // 属性读取访问器
        const getter = () => {
            return _val;
        };

        // 属性写入访问器
        const setter = (newVal: any) => {
            _val = newVal;
            DM.set(newVal, tag);
        };

        // 删除属性
        if (delete this[propertyName]) {
            // 创建新属性及其读取访问器、写入访问器
            Object.defineProperty(target, propertyName, {
                get: getter,
                set: setter,
                enumerable: true,
                configurable: true
            });
        }
    }
}

/**
 * 绑定数据
 * @param path 数据路径
 * @param callback 回调函数
 * @param target 回调函数的对象
 * @param useCapture 是否捕获
 * @returns 
 */
export function contextBind(path: string, callback: (n: any, o: any, pathArray: string[]) => void, target?: any, useCapture?: boolean): void {
    DM.bind(path, callback, target, useCapture);
}

/**
 * 解除绑定
 * @param path 数据路径
 * @param callback 回调函数
 * @param target 回调函数的对象
 * @returns 
 */
export function contextUnbind(path: string, callback: (n: any, o: any, pathArray: string[]) => void, target?: any): void {
    DM.unbind(path, callback, target);
}

/**
 * 设置数据
 * @param path 数据路径
 * @param value 数据值
 */
export function contextSetValue(path: string, value: any) {
    DM.setValue(path, value);
}