// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { ViewEvent, ViewState } from "../../core/common/ViewBase";
import ViewManager from "../../core/common/ViewManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class DrawCallDemo extends cc.Component {

    @property(cc.Slider)
    private slider: cc.Slider = null;

    @property(cc.Label)
    private countLabel: cc.Label = null;

    @property(cc.Node)
    private showNode: cc.Node = null;

    @property(cc.Node)
    private templateANode: cc.Node = null;

    @property(cc.Node)
    private templateBNode: cc.Node = null;

    @property(cc.Node)
    private templateCNode: cc.Node = null;

    protected onLoad(): void {
        this.node.on(ViewEvent, this.onViewEvent, this);
    }

    private onViewEvent(state: ViewState, data?: any) {
        cc.log("onViewEvent", state.toString());
    }

    protected onEnable(): void {
        console.log("onEnable");
    }

    protected onDisable(): void {
        console.log("onDisable");
    }

    onDestroy() {
        console.log("onDestroy");
    }

    // onLoad () {}
    start() {
        this.initSlider();
    }

    // update (dt) {}

    private _count = 1;
    private initSlider() {
        if (!this.slider) return;
        this.slider.node.on("slide", () => {
            this._count = this.slider.progress * 999 + 1;
            this._count = Math.round(this._count);
            this.countLabel.string = this._count.toString();
        });
        this.slider.progress = 0;
    }

    onClickAddWithDefault(event: cc.Event.EventTouch, customEventData: string) {
        //cc.log("onClickAddDefault", customEventData);
        if (!this.showNode) return;

        let children = this.showNode.children;
        for (let i = 0; i < children.length; i++) {
            children[i].destroy();
        }
        this.showNode.removeAllChildren();

        // 添加节点
        for (let i = 0; i < this._count; i++) {
            let node = cc.instantiate(this.templateANode);
            // 设置随机位置
            node.x = Math.random() * this.showNode.width;
            node.y = Math.random() * this.showNode.height;
            this.showNode.addChild(node);
        }
    }

    onClickAddWithNode(event: cc.Event.EventTouch, customEventData: string) {
        //cc.log("onClickAddDefault", customEventData);
        if (!this.showNode) return;

        let children = this.showNode.children;
        for (let i = 0; i < children.length; i++) {
            children[i].destroy();
        }
        this.showNode.removeAllChildren();

        // 添加节点
        // 添加节点
        for (let i = 0; i < this._count; i++) {
            let node = cc.instantiate(this.templateBNode);
            // 设置随机位置
            node.x = Math.random() * this.showNode.width;
            node.y = Math.random() * this.showNode.height;
            this.showNode.addChild(node);
        }
    }

    onClickAddWithGroup(event: cc.Event.EventTouch, customEventData: string) {
        //cc.log("onClickAddDefault", customEventData);
        if (!this.showNode) return;

        let children = this.showNode.children;
        for (let i = 0; i < children.length; i++) {
            children[i].destroy();
        }
        this.showNode.removeAllChildren();

        // 添加节点
        // 添加节点
        for (let i = 0; i < this._count; i++) {
            let node = cc.instantiate(this.templateCNode);
            // 设置随机位置
            node.x = Math.random() * this.showNode.width;
            node.y = Math.random() * this.showNode.height;
            this.showNode.addChild(node);
        }
    }
}
