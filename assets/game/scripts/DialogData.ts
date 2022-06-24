// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { MessageBoxButtons, DialogResult } from "../../core/common/MessageBox";
import ViewBase, { ViewEvent, ViewState } from "../../core/common/ViewBase";

const { ccclass, property } = cc._decorator;

@ccclass
export default class DialogData extends cc.Component {

    @property(cc.Label)
    title: cc.Label = null;

    @property(cc.Label)
    content: cc.Label = null;

    @property(cc.Node)
    ok: cc.Node = null;

    @property(cc.Node)
    cancel: cc.Node = null;

    private _data: { title: string, content: string, buttons: MessageBoxButtons, resolve: Function } = null;

    protected onLoad() {
        this.node.on(ViewEvent, (type: ViewState, data: any) => {
            if (type == ViewState.Show && data != null) {
                this._data = data;
            }
        }, this);
    }

    protected start() {
        if (!this._data) this._data = { title: "", content: "", buttons: MessageBoxButtons.None, resolve: null };

        if (this._data.title == undefined) this._data.title = "";
        if (this._data.content == undefined) this._data.content = "";
        if (this._data.buttons == undefined) this._data.buttons = MessageBoxButtons.None;
        if (this._data.resolve == undefined) this._data.resolve = (result: DialogResult) => { };

        this.title.string = this._data.title;
        this.content.string = this._data.content;
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
        this._data?.resolve(DialogResult.OK);
        this.node.getComponent(ViewBase).onCloseEvent(null, null);
    }

    onCancelEvent(event: cc.Event.EventTouch, customEventData: string) {
        this._data?.resolve(DialogResult.Cancel);
        this.node.getComponent(ViewBase).onCloseEvent(null, null);
    }

    onCloseEvent(event: cc.Event.EventTouch, customEventData: string) {
        this._data?.resolve(DialogResult.None);
        this.node.getComponent(ViewBase).onCloseEvent(null, null);
    }
}