/**
 * CREATOR_2.4.9
 * DateTime = Tue May 03 2022 11:51:04 GMT+0800 (中国标准时间)
 * Author = eathon
 * github = https://github.com/eathonq/creator_2.4.9.git
 * email = vangagh@live.cn
 */

import { i18n } from "./LanguageData";
const { ccclass, property, executeInEditMode, menu } = cc._decorator;

/** 组件检测数组 */
const COMP_ARRAY_CHECK = [
    //组件名、默认属性
    ['cc.Label', 'string'],
    ['cc.RichText', 'string'],
    ['cc.EditBox', 'string'],
];

/**
 * [i18n-LocalizedLabel]
 * i18n 本地化文本(支持Label,RichText,EditBox)
 */
@ccclass
@executeInEditMode
@menu('i18n/LocalizedLabel')
export class LocalizedLabel extends cc.Component {

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
        tooltip: '绑定路径'
    })
    private watchPath: string = "";

    onRestore() {
        this.checkEditorComponent();
    }

    protected onLoad() {
        this.checkEditorComponent();
        i18n.register(this)
        this.resetValue();
    }

    protected start(): void {}

    protected onDestroy() {
        i18n.unregister(this);
    }

    private checkEditorComponent() {
        if (CC_EDITOR) {
            let checkArray = COMP_ARRAY_CHECK;
            for (const item of checkArray) {
                if (this.node.getComponent(item[0])) {
                    this.componentName = item[0];
                    this.componentProperty = item[1];
                    break;
                }
            }
        }
    }

    /** 通过watchPath初始化值 */
    resetValue() {
        this.setComponentValue(i18n.getString(this.watchPath));
    }

    /** 获取组件值 */
    private getComponentValue(): string {
        return this.node.getComponent(this.componentName)[this.componentProperty];
    }

    /** 设置组件值 */
    private setComponentValue(value: string) {
        this.node.getComponent(this.componentName)[this.componentProperty] = value;
    }

}