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

    @property(cc.Label)
    title: cc.Label = null;

    @property(cc.Label)
    message: cc.Label = null;

    @property(cc.Node)
    ok: cc.Node = null;

    @property(cc.Node)
    cancel: cc.Node = null;

    private _data: any = null;

    protected onLoad() {
        this.node.on(ViewEvent, (type: ViewState, data: any) => {
            if (type == ViewState.Show && data != null) {
                this._data = data;
            }
        }, this);
    }

    protected start() {
        if (!this._data) this._data = {};

        if (this._data.title == undefined) this._data.title = "";
        if (this._data.message == undefined) this._data.message = "";
        if (this._data.buttons == undefined) this._data.buttons = MessageBoxButtons.None;
        if (this._data.callback == undefined) this._data.callback = () => { };

        this.title.string = this._data.title;
        this.message.string = this._data.message;
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

    onOKEvent(event: cc.Event.EventTouch, customEventData: string) {
        this._data?.callback(DialogResult.OK);
        this.node.getComponent(ViewBase).onCloseEvent(null, null);
    }

    onCancelEvent(event: cc.Event.EventTouch, customEventData: string) {
        this._data?.callback(DialogResult.Cancel);
        this.node.getComponent(ViewBase).onCloseEvent(null, null);
    }

    onCloseEvent(event: cc.Event.EventTouch, customEventData: string) {
        this._data?.callback(DialogResult.None);
        this.node.getComponent(ViewBase).onCloseEvent(null, null);
    }
}
