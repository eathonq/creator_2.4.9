// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { BindingMode, DataContext, contextBind, contextGetValue, contextSetValue, contextUnbind } from "./DataContext";

const { ccclass, property, executeInEditMode, menu } = cc._decorator;

/** 组件检测数组 */
const COMP_ARRAY_CHECK = [
    //组件名、默认属性
    ['cc.Label', 'string'],
    ['cc.RichText', 'string'],
    ['cc.EditBox', 'string'],
    ['cc.Toggle', 'isChecked'],
    ['cc.ToggleContainer', 'isChecked'],
    ['cc.Slider', 'progress'],
    ['cc.ProgressBar', 'progress'],
    ['cc.PageView', 'getCurrentPageIndex()'],
];

@ccclass
@executeInEditMode
@menu('mvvm/DataBinding')
export default class DataBinding extends cc.Component {

    @property({
        tooltip: '绑定组件的名字',
        readonly: true,
    })
    private componentName: string = "";

    @property({
        tooltip: '组件上需要监听的属性',
        readonly: true,
    })
    private componentProperty: string = "";

    @property({
        tooltip: '启用全局数据',
    })
    private global = false;

    @property({
        tooltip: '全局数据',
        visible() {
            return this.global;
        },
    })
    private globalContext = "";

    @property({
        tooltip: '关联数据',
        readonly: true,
        visible() {
            return !this.global;
        },
    })
    private relevancyContext = "";

    @property({
        tooltip: '绑定路径',
    })
    private watchPath: string = "";

    onRestore() {
        this.checkEditorComponent();
    }

    @property({
        type: cc.Enum(BindingMode),
        tooltip: '绑定模式:\n TwoWay: 双向绑定;\n OneWay: 单向绑定;\n OneTime: 一次绑定;\n OneWayToSource: 当目标属性更改时更新源属性。',
    })
    private bindingModel: BindingMode = BindingMode.OneWay;

    protected onLoad() {
        if (!this.checkEditorComponent()) return;
        if (CC_EDITOR) return;

        contextBind(this.getPath(), this.onDataChange, this);

        switch (this.bindingModel) {
            case BindingMode.TwoWay:
                this.toSourceComponent();
                break;
            case BindingMode.OneWay:
                break;
            case BindingMode.OneTime:
                break;
            case BindingMode.OneWayToSource:
                this.toSourceComponent();
                contextUnbind(this.getPath(), this.onDataChange, this);
                break;
        }
    }

    protected onDestroy(): void {
        contextUnbind(this.getPath(), this.onDataChange, this);
    }

    protected start() { }

    // update (dt) {}

    private getPath() {
        return this.global ? `${this.globalContext}.${this.watchPath}` : `${this.relevancyContext}.${this.watchPath}`;
    }

    private toSourceComponent() {
        let path = this.global ? `${this.globalContext}.${this.watchPath}` : `${this.relevancyContext}.${this.watchPath}`;
        switch (this.componentName) {
            case 'cc.EditBox':
                let editBox = this.node.getComponent(cc.EditBox);
                editBox.node.on('text-changed', (editBox: cc.EditBox) => {
                    contextSetValue(path, editBox.string);
                }, this);
                break;
            case 'cc.Toggle':
                let toggle = this.node.getComponent(cc.Toggle);
                toggle.node.on('toggle', (toggle: cc.Toggle) => {
                    contextSetValue(path, toggle.isChecked);
                }, this);
                break;
            case 'cc.ToggleContainer':
                let toggleContainer = this.node.getComponent(cc.ToggleContainer);
                toggleContainer.node.on('toggle', (toggle: cc.Toggle) => {
                    contextSetValue(path, toggle.isChecked);
                }, this);
                break;
            case 'cc.Slider':
                let slider = this.node.getComponent(cc.Slider);
                slider.node.on('slide', (slider: cc.Slider) => {
                    contextSetValue(path, slider.progress);
                }, this);
                break;
            case 'cc.PageView':
                let pageView = this.node.getComponent(cc.PageView);
                pageView.node.on('page-turning', (pageView: cc.PageView) => {
                    contextSetValue(path, pageView.getCurrentPageIndex());
                }, this);
                break;
        }
    }

    private getContext(node: cc.Node, maxLevel: number = 10): DataContext {
        let check = node;
        while (check && maxLevel > 0) {
            let context: DataContext = check.getComponent(DataContext);
            if (context) {
                return context;
            }
            check = check.parent;
            maxLevel--;
        }
        return null;
    }

    private _context: DataContext;
    private checkEditorComponent() {
        let context = this.getContext(this.node);
        if (context) {
            this._context = context;
            this.relevancyContext = context.globalContext;
        }

        let checkArray = COMP_ARRAY_CHECK;
        for (const item of checkArray) {
            if (this.node.getComponent(item[0])) {
                this.componentName = item[0];
                this.componentProperty = item[1];
                return true;
            }
        }
        return false;
    }

    /** 获取组件值 */
    private getComponentValue(): any {
        switch (this.componentName) {
            case 'cc.PageView':
                return this.node.getComponent(cc.PageView).getCurrentPageIndex();
            case 'cc.ToggleContainer':
                return "";
            default:
                return this.node.getComponent(this.componentName)[this.componentProperty];
        }
    }

    /** 设置组件值 */
    private setComponentValue(value: any) {
        switch (this.componentName) {
            case 'cc.PageView':
                this.node.getComponent(cc.PageView).setCurrentPageIndex(value);
                break;
            case 'cc.ToggleContainer':
                break;
            default:
                this.node.getComponent(this.componentName)[this.componentProperty] = value;
                break;
        }
    }

    private onDataChange(n: any, o: any, pathArray: string[]) {
        let path = pathArray.join('.');
        if (path === this.watchPath) {
            this.setComponentValue(n);
        }

        if (this.bindingModel === BindingMode.OneTime) {
            contextUnbind(this.getPath(), this.onDataChange, this);
        }
    }
}
