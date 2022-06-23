// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { ViewEvent, ViewState } from "../../core/common/ViewBase";

const { ccclass, property } = cc._decorator;

@ccclass
export default class TooltipData extends cc.Component {

    @property(cc.Label)
    message: cc.Label = null;

    // LIFE-CYCLE CALLBACKS:

    protected onLoad() {
        this.node.on(ViewEvent, (type: ViewState, data: any) => {
            if (type == ViewState.Show && data != null) {
                this.message.string = data;
            }
        }, this);
    }

    protected start() { }

    // update (dt) {}
}
