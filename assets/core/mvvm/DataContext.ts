const { ccclass, property, executeInEditMode, menu } = cc._decorator;
const MVVM_EMIT_HEAD = 'mvvm_emit:';

export const GLOBAL_MVVM = 'MVVM';
export const MVVM_DEBUG = false;

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
        if (!obj) return;
        const propName = props[i];
        if (propName in obj === false) {
            if (MVVM_DEBUG) console.warn('[' + propName + '] not find in ' + tag + '.' + path);
            break;
        }
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
        if (!obj) return def;
        const propName = props[i];
        if ((propName in obj === false)) {
            if (MVVM_DEBUG) console.warn('[' + propName + '] not find in ' + tag + '.' + path);
            return def;
        }
        obj = obj[propName];
    }
    if (obj === null || typeof obj === "undefined") obj = def;
    return obj;

}

type ValueCallback = {
    target: any,
    callback: (newVal: any, oldVal: any, pathArray: string[]) => void
};

/**
 * 数据上下文 (如果有重写onLoad，则必须在onLoad中调用super.onLoad)
 */
@ccclass
@executeInEditMode
export class DataContext extends cc.Component {
    @property({
        tooltip: '全局启用',
    })
    private global = false;

    @property({
        tooltip: '全局标识',
        visible() {
            return this.global;
        }
    })
    private globalContext: string = '';

    private _tag: string = '';
    get tag(): string {
        return this._tag;
    }
    private set tag(value: string) {
        this._tag = value;
    }

    onRestore() {
        this.checkEditorComponent();
    }

    protected onLoad() {
        this.checkEditorComponent();
        if (CC_EDITOR) return;

        this.init();
    }

    protected start(): void { }

    private _isInit = false;
    private _handle: ValueCallback;
    private init() {
        if (this._isInit) return;
        this._isInit = true;

        this._handle = this['__context_callback__'];
        if (!this._handle) {
            this._handle = this['__context_callback__'] = { target: null, callback: null };
        }

        this._handle.target = this;
        this._handle.callback = this.callback;

        if (!this.global) {
            this.tag = this.constructor.name + this.constructor.prototype['__cid__'];
        }

        mvvm.set(this);
    }

    private checkEditorComponent() {
        this.globalContext = this.constructor.name;
        this.tag = this.globalContext;
    }

    callback(newVal: any, oldVal: any, pathArray: string[]): void {
        if (MVVM_DEBUG) cc.log(`${this.tag}.${pathArray} >> old:${oldVal} new:${newVal}`);
        cc.director.emit(MVVM_EMIT_HEAD + this.tag + '.' + pathArray.join('.'), newVal, oldVal, pathArray);
    }

    setValue(path: string, value: any) {
        setValueFromPath(this, path, value, this.tag);
    }

    getValue(path: string, def?: any): any {
        return getValueFromPath(this, path, def, this.tag);
    }
}

class DataContextManager {
    //#region array
    private _array: Array<{ tag: string, context: DataContext }> = [];
    set<T>(context: DataContext) {
        if (!context) return;

        let has = this._array.some(item => item.tag == context.tag);
        if (has) {
            this.remove(context.tag);
        }

        this._array.push({ tag: context.tag, context: context });
    }

    get<T>(tag: string): DataContext {
        let item = this._array.find(item => item.tag == tag);
        if (item) {
            return item.context;
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
    //#endregion

    //#region value
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

    getValue(path: string, def?: any) {
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
            console.error(target.node.name, '节点绑定的路径为空');
            return;
        }
        if (path.split('.')[0] === '*') {
            console.error(path, '路径不合法,可能错误覆盖了其他路径');
            return;
        }
        cc.director.on(MVVM_EMIT_HEAD + path, callback, target, useCapture);
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
            console.error(path, '路径不合法,可能错误覆盖了其他路径');
            return;
        }
        cc.director.off(MVVM_EMIT_HEAD + path, callback, target);
    }
    //#endregion
}

let mvvm = new DataContextManager();

/**
 * 绑定数据
 * @param path 数据路径
 * @param callback 回调函数
 * @param target 回调函数的对象
 * @param useCapture 是否捕获
 * @returns 
 */
export function contextBind(path: string, callback: (newVal: any, oldVal: any, pathArray: string[]) => void, target?: any, useCapture?: boolean): void {
    mvvm.bind(path, callback, target, useCapture);
}

/**
 * 解除绑定
 * @param path 数据路径
 * @param callback 回调函数
 * @param target 回调函数的对象
 * @returns 
 */
export function contextUnbind(path: string, callback: (newVal: any, oldVal: any, pathArray: string[]) => void, target?: any): void {
    mvvm.unbind(path, callback, target);
}

/**
 * 设置数据
 * @param path 数据路径
 * @param value 数据值
 */
export function contextSetValue(path: string, value: any) {
    mvvm.setValue(path, value);
}

/**
 * 获取数据
 * @param path 数据路径 
 * @param def 默认值
 * @returns 
 */
export function contextGetValue(path: string, def?: any) {
    return mvvm.getValue(path, def);
}