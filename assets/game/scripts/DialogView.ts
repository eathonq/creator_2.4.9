// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import ViewManager from "../../core/common/ViewManager";

const {ccclass, property} = cc._decorator;

@ccclass
export default class DialogView extends cc.Component {

    @property(cc.Label)
    label: cc.Label = null;

    @property
    text: string = 'hello';

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start () {
        console.log("start");
    }

    // update (dt) {}

    onClickCloseEvent(event: cc.Event.EventTouch, customEventData: string) {
        console.log("onClickCloseEvent", customEventData);
        ViewManager.instance.closeDialog();
    }
}
