// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

@ccclass
export default class DrawCallNode extends cc.Component {

    // LIFE-CYCLE CALLBACKS:

    onLoad () {

    }

    protected onEnable(): void {
        console.log("onEnable");
    }

    protected onDisable(): void {
        console.log("onDisable");
    }

    start () {

    }

    // update (dt) {}

    onClickEvent(event:cc.Event.EventTouch, customEventData:string):void {
        this.node.emit("show");
    }
}
