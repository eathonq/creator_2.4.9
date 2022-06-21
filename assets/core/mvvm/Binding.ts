/**
 * CREATOR_2.4.9
 * DateTime = Mon Jun 20 2022 14:07:32 GMT+0800 (中国标准时间)
 * Author = eathon
 * github = https://github.com/eathonq/creator_2.4.9.git
 * email = vangagh@live.cn
 */

import Locator from "../common/Locator";
import DataContext from "./DataContext";

const { ccclass, property, executeInEditMode, menu } = cc._decorator;

/** 组件检测数组 */
const COMP_ARRAY_CHECK = [
    //组件名、默认属性
    ['cc.Label', 'string'],
    ['cc.EditBox', 'string'],
    ['cc.Toggle', 'isChecked'],
    ['cc.Slider', 'progress'],
    ['cc.ProgressBar', 'progress'],
    ['cc.Sprite', 'spriteFrame'],   // cc.ProgressBar 组件包含 cc.Sprite 组件，所有需要放在 cc.ProgressBar 组件后面
    ['cc.RichText', 'string'],
    ['cc.PageView', 'getCurrentPageIndex()'],
];

/** 绑定模式 */
enum BindingMode {
    /** 双向绑定，导致对源属性或目标属性的更改自动更新另一个。 */
    TwoWay = 0,
    /** 单向绑定，当绑定源改变时更新绑定目标属性。 */
    OneWay = 1,
    /** 一次绑定，在应用程序启动或数据上下文更改时更新绑定目标。 */
    OneTime = 2,
    /** 当目标属性更改时更新源属性。 */
    OneWayToSource = 3,
}

/** UI 数据绑定组件 */
@ccclass
@executeInEditMode
@menu('mvvm/Binding')
export default class Binding extends cc.Component {

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

    @property
    private _global = false;
    @property({
        tooltip: '使用全局上下文',
    })
    get global() {
        return this._global;
    }
    private set global(value: boolean) {
        this._global = value;
        this.checkEditorComponent();
    }

    @property({
        tooltip: '关联上下文',
        readonly: true,
        visible() {
            return !this.global;
        },
        displayName: 'Data Context',
    })
    private relevancyContext = "";

    @property
    private _binding = "";
    @property({
        tooltip: '绑定路径',
    })
    get binding() {
        return this._binding;
    }
    set binding(value: string) {
        this._binding = value;
        this.checkEditorComponent();
    }

    @property({
        type: cc.Enum(BindingMode),
        tooltip: '绑定模式:\n TwoWay: 双向绑定;\n OneWay: 单向绑定;\n OneTime: 一次绑定;\n OneWayToSource: 当目标属性更改时更新源属性。',
    })
    private model: BindingMode = BindingMode.OneWay;

    onRestore() {
        this.checkEditorComponent();
    }

    protected onLoad() {
        if (!this.checkEditorComponent()) return;
        if (CC_EDITOR) return;

        DataContext.bind(this._path, this.onDataChange, this);

        this.setComponentValue(DataContext.getValue(this._path));

        switch (this.model) {
            case BindingMode.TwoWay:
                this.toSourceComponent();
                break;
            case BindingMode.OneWay:
                break;
            case BindingMode.OneTime:
                break;
            case BindingMode.OneWayToSource:
                this.toSourceComponent();
                DataContext.unbind(this._path, this.onDataChange, this);
                break;
        }
    }

    protected onDestroy(): void {
        DataContext.unbind(this._path, this.onDataChange, this);
    }

    protected start() { }

    // update (dt) {}

    private toSourceComponent() {
        switch (this.componentName) {
            case 'cc.EditBox':
                let editBox = this.node.getComponent(cc.EditBox);
                editBox.node.on('text-changed', (editBox: cc.EditBox) => {
                    DataContext.setValue(this._path, editBox.string);
                }, this);
                break;
            case 'cc.Toggle':
                let toggle = this.node.getComponent(cc.Toggle);
                toggle.node.on('toggle', (toggle: cc.Toggle) => {
                    DataContext.setValue(this._path, toggle.isChecked);
                }, this);
                break;
            case 'cc.Slider':
                let slider = this.node.getComponent(cc.Slider);
                slider.node.on('slide', (slider: cc.Slider) => {
                    DataContext.setValue(this._path, slider.progress);
                }, this);
                break;
            case 'cc.PageView':
                let pageView = this.node.getComponent(cc.PageView);
                pageView.node.on('page-turning', (pageView: cc.PageView) => {
                    DataContext.setValue(this._path, pageView.getCurrentPageIndex());
                }, this);
                break;
        }
    }

    private findDataContext(node: cc.Node, maxLevel: number = 9): DataContext {
        let check = node;
        while (check && maxLevel > 0) {
            let context: DataContext = check.getComponent(DataContext);
            if (context) {
                return context;
            }
            check = check.parent;
            maxLevel--;
        }

        cc.warn(`path:${Locator.getNodeFullPath(node)} `, `组件 Binding `, '找不到 DataContext');
        return null;
    }

    /** 绑定路径 */
    private _path = '';
    /** 绑定属性 */
    private _property = '';
    private checkEditorComponent() {
        if (this.global) {
            this._path = this._binding;
        }
        else {
            let context = this.findDataContext(this.node);
            if (!context) {
                return false;
            }
            this.relevancyContext = context.tag;
            this._path = this._binding.length > 0 ? `${this.relevancyContext}.${this._binding}` : this.relevancyContext;
        }
        this._property = this._path.split('.').slice(1).join('.');

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
        if (value === undefined || value === null) return;

        switch (this.componentName) {
            case 'cc.PageView':
                this.node.getComponent(cc.PageView).setCurrentPageIndex(value);
                break;
            case 'cc.Sprite':
                cc.resources.load(value, cc.SpriteFrame, (err: any, spriteFrame: cc.SpriteFrame) => {
                    if (err) {
                        cc.warn(`path:${Locator.getNodeFullPath(this.node)} `, `组件 Binding `, '找不到 SpriteFrame');
                        return;
                    }
                    this.node.getComponent(cc.Sprite).spriteFrame = spriteFrame;
                });
                break;
            default:
                this.node.getComponent(this.componentName)[this.componentProperty] = value;
                break;
        }

        // 如果是一次绑定，则解绑
        if (this.model === BindingMode.OneTime) {
            DataContext.unbind(this._path, this.onDataChange, this);
        }
    }

    private onDataChange(newVal: any, oldVal: any, pathArray: string[]) {
        let path = pathArray.join('.');
        if (path === this._property) {
            this.setComponentValue(newVal);
        }
    }
}
