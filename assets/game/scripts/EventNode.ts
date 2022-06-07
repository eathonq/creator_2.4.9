// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { gameEvent } from "../../core/common/GameEvent";

const {ccclass, property} = cc._decorator;

@ccclass
export default class EventNode extends cc.Component {

    @property(cc.Label)
    label: cc.Label = null;

    @property
    text: string = 'hello';

    // LIFE-CYCLE CALLBACKS:

    protected onLoad () {
        gameEvent.on("test_event", this.testEvent, this);
    }

    protected onDestroy () {
        gameEvent.off("test_event", this.testEvent, this);
    }

    protected start () {

    }

    private testEvent(data: string) {
        console.log("test_event", data);
    }

    // update (dt) {}
}
