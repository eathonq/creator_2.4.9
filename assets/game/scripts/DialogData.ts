// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { MessageBoxButtons, DialogResult } from "../../core/common/MessageBox";
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

    @property(cc.Node)
    ok: cc.Node = null;

    @property(cc.Node)
    cancel: cc.Node = null;

    private _data: any = null;

    // LIFE-CYCLE CALLBACKS:
    onLoad() {
        this.node.on(ViewEvent, (type: ViewState, data: any) => {
            if (data != null) {
                this._data = data;
            }
        }, this);
    }

    start() {
        if (this._data || !this._data.title || !this._data.message) {
            if (this._data.title) this.title.string = this._data.title;
            if (this._data.message) this.message.string = this._data.message;
            switch (this._data.buttons) {
                case MessageBoxButtons.None:
                    this.ok.active = false;
                    this.cancel.active = false;
                    break;
                case MessageBoxButtons.OK:
                    this.ok.active = true;
                    this.cancel.active = false;
                    break;
                case MessageBoxButtons.OKCancel:
                    this.ok.active = true;
                    this.cancel.active = true;
                    break;
            }
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
        this._data?.callback(DialogResult.OK);
        this.node.getComponent(ViewBase).onClickCloseEvent(null, null);
    }

    onCancelEvent(event: cc.Event.EventTouch, customEventData: string) {
        this._data?.callback(DialogResult.Cancel);
        this.node.getComponent(ViewBase).onClickCloseEvent(null, null);
    }

    onCloseEvent(event: cc.Event.EventTouch, customEventData: string) {
        this._data?.callback(DialogResult.None);
        this.node.getComponent(ViewBase).onClickCloseEvent(null, null);
    }
}
