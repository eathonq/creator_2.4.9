// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { BindingMode } from "./DataContext";

const {ccclass, property, executeInEditMode, menu} = cc._decorator;

@ccclass
@executeInEditMode
@menu('mvvm/DataToggleContainer')
export default class DataToggleContainer extends cc.Component {

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

    // onLoad () {}

    start () {

    }

    // update (dt) {}

    checkEditorComponent() {
        if(this.node.getComponent(cc.ToggleContainer)) {
            this.componentName = 'cc.ToggleContainer';
            this.componentProperty = 'isChecked';
            return true;
        }
        return false;
    }
}
