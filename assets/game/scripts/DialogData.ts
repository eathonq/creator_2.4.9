// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { MessageBox, MessageResult } from "../../core/common/MessageBox";
import { ViewBase, ViewEvent, ViewState } from "../../core/common/ViewBase";

const { ccclass, property } = cc._decorator;

@ccclass
export default class DialogData extends cc.Component {

    @property(cc.Mask)
    mask: cc.Mask = null;

    @property(cc.Label)
    title: cc.Label = null;

    @property(cc.Label)
    message: cc.Label = null;

    private _data: MessageBox = null;

    // LIFE-CYCLE CALLBACKS:
    onLoad () {
        this.node.on(ViewEvent, (type: ViewState, data: MessageBox) => {
            if(data!= null){
                this._data = data;
            }
        }, this);
    }

    start() {
        if(this._data){
            if(!this._data.title){
                this.title.string = '消息';
            }
            else{
                this.title.string = this._data.title;
            }
            this.message.string = this._data.message;
        }
    }

    protected onEnable(): void {
        if (!this.mask) {
            cc.error("mask is null");
            return;
        }
        this.mask.node.on(cc.Node.EventType.TOUCH_START, this.stopPropagation, this);
        this.mask.node.on(cc.Node.EventType.TOUCH_END, this.stopPropagation, this);
    }

    protected onDisable(): void {
        if (!this.mask) {
            cc.error("mask is null");
            return;
        }
        this.mask.node.off(cc.Node.EventType.TOUCH_START, this.stopPropagation, this);
        this.mask.node.off(cc.Node.EventType.TOUCH_END, this.stopPropagation, this);
    }

    private stopPropagation(event: cc.Event.EventTouch): void {
        event.stopPropagation();
    }

    onOKEvent(event: cc.Event.EventTouch, customEventData: string) {
        this._data?.doCallback(MessageResult.ResultOK);
        this.node.getComponent(ViewBase).onClickCloseEvent(null, null);
    }

    onCancelEvent(event: cc.Event.EventTouch, customEventData: string) {
        this._data?.doCallback(MessageResult.ResultCancel);
        this.node.getComponent(ViewBase).onClickCloseEvent(null, null);
    }
}
