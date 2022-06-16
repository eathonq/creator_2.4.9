// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { context } from "../../core/mvvm/DataContext";
import { User } from "../models/UserModel";

const { ccclass, property } = cc._decorator;

@ccclass
export default class MVVMData extends cc.Component {

    // LIFE-CYCLE CALLBACKS:

    protected onLoad() { }

    @context("USER")
    private user: User;

    start() {
        this.user = new User;
        this.user.name = "old name";
        this.user.isCheck = true;

        this.user.toggles[0] = false;
    }

    // update (dt) {}

    private _callback(n: any, o: any, path: string): void {
        console.log(`${path} -> old: ${o} new: ${n}`);
    }

    onClickEvent(event: cc.Event, customEventData: string) {
        //this.user.name = "new name";
        // if(this.label){
        //     this.label.string = "new name";
        // }

        this.user.isCheck = !this.user.isCheck;
        this.user.name += "1";
        this.user.progress += 0.1;
        this.user.index += 1;
    }
}