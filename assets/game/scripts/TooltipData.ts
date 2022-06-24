// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import ViewBase, { ViewEvent, ViewState } from "../../core/common/ViewBase";

const { ccclass, property } = cc._decorator;

@ccclass
export default class TooltipData extends cc.Component {

    @property(cc.Label)
    content: cc.Label = null;

    private _data: { content: string, resolve: Function } = null;

    protected onLoad() {
        this.node.on(ViewEvent, (type: ViewState, data: any) => {
            if (type == ViewState.Show && data != null) {
                this._data = data;
            }
        }, this);

        this.node.on(ViewEvent, (type: ViewState, data: any) => {
            if (type == ViewState.Data) {
                this._data = data;
                this.updateData();
            }
        }, this);
    }

    protected start() {
        this.updateData();
    }

    private updateData() {
        if (this._data.content == undefined) this._data.content = "";
        if (this._data.resolve == undefined) this._data.resolve = () => { };

        if (this.content && this._data.content != "") {
            this.content.string = this._data.content;
        }
    }

    // update (dt) {}
}
