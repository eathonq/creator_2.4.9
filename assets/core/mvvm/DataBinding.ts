// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { BindingMode, contextBind, contextSetValue, contextUnbind } from "./DataContext";

const { ccclass, property, executeInEditMode, menu } = cc._decorator;

/** 组件检测数组 */
const COMP_ARRAY_CHECK = [
    //组件名、默认属性
    ['cc.Label', 'string'],
    ['cc.RichText', 'string'],
    ['cc.EditBox', 'string'],
    ['cc.Toggle', 'isChecked'],
    ['cc.Slider', 'progress'],
    ['cc.ProgressBar', 'progress'],
    ['cc.PageView', 'currentPageIndex'],
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
        type: cc.Enum(BindingMode),
        tooltip: '绑定模式:\n TwoWay: 双向绑定;\n OneWay: 单向绑定;\n OneTime: 一次绑定;\n OneWayToSource: 当目标属性更改时更新源属性。',
    })
    private bindingModel: BindingMode = BindingMode.OneWay;

    @property
    private watchPath: string = "";

    onRestore() {
        this.checkEditorComponent();
    }

    protected onLoad() {
        if (!this.checkEditorComponent()) return;
        if (CC_EDITOR) return;

        contextBind(this.watchPath, this.onDataChange, this);
        if (this.bindingModel === BindingMode.OneWayToSource) {
            contextUnbind(this.watchPath, this.onDataChange, this);
            this.toSourceComponent();
        }
        else if (this.bindingModel === BindingMode.TwoWay) {
            this.toSourceComponent();
        }
    }

    protected onDestroy(): void {
        contextUnbind(this.watchPath, this.onDataChange, this);
    }

    protected start() { }

    // update (dt) {}

    private toSourceComponent() {
        switch (this.componentName) {
            case 'cc.EditBox':
                let editBox = this.node.getComponent(cc.EditBox);
                editBox.node.on('text-changed', (editBox: cc.EditBox) => {
                    contextSetValue(this.watchPath, editBox.string);
                }, this);
                break;
            case 'cc.Toggle':
                let toggle = this.node.getComponent(cc.Toggle);
                toggle.node.on('toggle', (toggle: cc.Toggle) => {
                    contextSetValue(this.watchPath, toggle.isChecked);
                }, this);
                break;
            case 'cc.Slider':
                let slider = this.node.getComponent(cc.Slider);
                slider.node.on('slide', (slider: cc.Slider) => {
                    contextSetValue(this.watchPath, slider.progress);
                }, this);
                break;
            case 'cc.PageView':
                let pageView = this.node.getComponent(cc.PageView);
                pageView.node.on('page-turning', (pageView: cc.PageView) => {
                    contextSetValue(this.watchPath, pageView.getCurrentPageIndex());
                }, this);
                break;
        }
    }

    private checkEditorComponent() {
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
            contextUnbind(this.watchPath, this.onDataChange, this);
        }
    }
}
