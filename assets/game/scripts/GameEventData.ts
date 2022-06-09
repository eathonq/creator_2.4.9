// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { MessageBox, DialogResult } from "../../core/common/MessageBox";
import EventNode from "./EventNode";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GameEventData extends cc.Component {
    @property(cc.Button)
    private addButton: cc.Button = null;

    @property(cc.Button)
    private removeButton: cc.Button = null;

    @property(cc.Button)
    private emitButton: cc.Button = null;

    @property(cc.Node)
    private templateNode: cc.Node = null;

    @property(cc.Node)
    private showNode: cc.Node = null;

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start() {
        this.initButton();
    }

    // update (dt) {}
    private initButton(): void {
        this.addButton.node.on("click", this.addButtonClick, this);
        this.removeButton.node.on("click", this.removeButtonClick, this);
        this.emitButton.node.on("click", this.emitButtonClick, this);
    }

    private addButtonClick(): void {
        let node = cc.instantiate(this.templateNode);
        this.showNode.addChild(node);

        // 设置随机位置
        node.x = Math.random() * this.showNode.width;
        node.y = Math.random() * this.showNode.height;

        // 设置节点组件
        node.addComponent(EventNode);
    }

    private removeButtonClick(): void {
        // this.showNode.removeAllChildren(false);

        let children = this.showNode.children;
        for (let i = 0; i < children.length; i++) {
            children[i].destroy();
        }
    }

    private async emitButtonClick() {
        //gameEvent.emit("test_event", "emit test_event");
        let result = await MessageBox.Show("消息框消息", "消息框标题");
        if (result == DialogResult.OK) {
            console.log("点击了确定按钮");
        }
        else if (result == DialogResult.Cancel) {
            console.log("点击了取消按钮");
        }
    }
}
