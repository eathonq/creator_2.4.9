// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { MessageBox, MessageBoxButtons } from "../../core/common/MessageBox";
import ViewManager from "../../core/common/ViewManager";
import { Transitions } from "../../resources/transitions/transitions";

const { ccclass, property } = cc._decorator;

@ccclass
export default class HomeData extends cc.Component {

    @property(cc.Camera)
    fromCamera: cc.Camera = null;

    @property(cc.Node)
    fromNode: cc.Node = null;

    @property(cc.Camera)
    toCamera: cc.Camera = null;

    @property(cc.Node)
    toNode: cc.Node = null;

    @property(Transitions)
    transitions: Transitions = null;

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start() { }

    // update (dt) {}

    onTransitionEvent(event: cc.Event.EventCustom, customEventData: string) {
        this.transitions.loadNode(this.fromCamera, this.fromNode, this.toCamera, this.toNode);
    }

    private _tooltipCount = 0;
    onClickTooltipEvent(event: cc.Event.EventTouch, customEventData: string) {
        ViewManager.instance.showTooltip("TooltipDemo", { content: "Hello World" + this._tooltipCount++, resolve: () => { } });
    }

    onClickMessageBoxEvent(event: cc.Event.EventTouch, customEventData: string) {
        MessageBox.Show("Hello World", "Box", MessageBoxButtons.YesNo);
    }
}
