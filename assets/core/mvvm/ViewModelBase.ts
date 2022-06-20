/**
 * CREATOR_2.4.9
 * DateTime = Mon Jun 20 2022 14:07:32 GMT+0800 (中国标准时间)
 * Author = eathon
 * github = https://github.com/eathonq/creator_2.4.9.git
 * email = vangagh@live.cn
 */

import DataContext from "./DataContext";

const { ccclass, property, executeInEditMode } = cc._decorator;

/** 
 * ViewModelBase 
 * @note 如果重写 onLoad 方法，则在 onLoad 方法中调用 super.onLoad()
*/
@ccclass
@executeInEditMode
export default class ViewModelBase extends DataContext {

    @property
    private _global = false;
    @property({
        tooltip: '开启全局',
    })
    get global() {
        return this._global;
    }
    private set global(value: boolean) {
        this._global = value;
        this.checkEditorComponent();
    }

    @property
    private _globalContext = "";
    @property({
        tooltip: '全局上下文',
        visible() {
            return this.global;
        },
        displayName: 'Data Context',
    })
    get globalContext() {
        return this._globalContext;
    }
    private set globalContext(value: string) {
        this._globalContext = value;
        this.checkEditorComponent();
    }

    // @property({
    //     tooltip: '设计时模式',
    // })
    // private isInDesignMode = false;

    onRestore() {
        this.checkEditorComponent();
    }

    protected onLoad() {
        //super.onLoad();

        this.checkEditorComponent();
        if (CC_EDITOR) return;

        if (this.global) {
            ViewModelManager.instance.set(this);
        }
        else {
            this.tag = this.constructor.name + this.constructor.prototype['__cid__'];
        }

        this.initContext();
    }

    // protected start() { }

    // protected update (dt) {}

    private checkEditorComponent() {
        if (this.global) {
            if(this._globalContext.length == 0) {
                this._globalContext = this.constructor.name;
            }
            this.tag = this._globalContext;
        }
        else {
            this.tag = this.constructor.name;
        }
    }
}

/**
 * ViewModel管理器
 */
export class ViewModelManager {
    //#region instance
    private static _instance: ViewModelManager;
    public static get instance(): ViewModelManager {
        if (!ViewModelManager._instance) {
            ViewModelManager._instance = new ViewModelManager();
        }
        return ViewModelManager._instance;
    }
    //#endregion

    //#region array
    private _array: Array<ViewModelBase> = [];
    set<T extends ViewModelBase>(viewModel: T) {
        if (!viewModel) return;

        let has = this._array.some(item => item.tag == viewModel.tag);
        if (has) {
            this.remove(viewModel.tag);
        }

        this._array.push(viewModel);
    }

    get<T extends ViewModelBase>(tag: string): T {
        let item = this._array.find(item => item.tag == tag);
        if (item) {
            return item as unknown as T;
        }
        return null;
    }

    private remove(tag: string) {
        let index = this._array.findIndex(item => item.tag == tag);
        if (index >= 0) {
            this._array.splice(index, 1);
        }
    }

    private clear() {
        this._array.length = 0;
    }
    //#endregion
}