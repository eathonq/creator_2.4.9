/**
 * CREATOR_2.4.9
 * DateTime = Mon Jun 20 2022 14:07:32 GMT+0800 (中国标准时间)
 * Author = eathon
 * github = https://github.com/eathonq/creator_2.4.9.git
 * email = vangagh@live.cn
 */

import { ObservableManager } from "./Observable";

const { ccclass, property } = cc._decorator;

/**
 * 数据上下文
 */
@ccclass
export default class DataContext extends cc.Component {
    private _tag = '';
    /** 标签 */
    get tag(): string {
        return this._tag;
    }
    protected set tag(val: string) {
        this._tag = val;
    }

    private _isInitContext = false;
    protected initContext() {
        if (this._isInitContext) return;
        this._isInitContext = true;
        ObservableManager.instance.create(this._tag, this);
    }

    /**
     * 绑定数据
     * @param path 数据路径
     * @param callback 回调函数
     * @param target 回调函数的对象
     * @param useCapture 是否捕获
     * @returns 
     */
    static bind(path: string, callback: (newVal: any, oldVal: any, pathArray: string[]) => void, target?: any, useCapture?: boolean): void {
        ObservableManager.instance.bind(path, callback, target, useCapture);
    }

    /**
     * 解除绑定
     * @param path 数据路径
     * @param callback 回调函数
     * @param target 回调函数的对象
     * @returns 
     */
    static unbind(path: string, callback: (newVal: any, oldVal: any, pathArray: string[]) => void, target?: any): void {
        ObservableManager.instance.unbind(path, callback, target);
    }

    /**
     * 设置数据
     * @param path 数据路径
     * @param value 数据值
     */
    static setValue(path: string, value: any) {
        ObservableManager.instance.setValue(path, value);
    }

    /**
     * 获取数据
     * @param path 数据路径 
     * @param def 默认值
     * @returns 
     */
    static getValue(path: string, def?: any) {
        return ObservableManager.instance.getValue(path, def);
    }
}