// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { gameEvent } from "../../core/common/GameEvent";

const { ccclass, property } = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    protected start(): void {
        this.customTest();
    }

    // update (dt) {}

    private customTest(): void {
        // gameEvent.on("test_event", this.testEvent, this);
        // gameEvent.emit("test_event", "emit test_event");
        // gameEvent.off("test_event", this.testEvent, this);
        // gameEvent.once("test_event", this.testEvent, this);
        // gameEvent.emit("test_event", "emit test_event");
        // gameEvent.emit("test_event", "emit test_event");
    }

    private testEvent(data: any): void {
        console.log("test_event", data);
    }
}
