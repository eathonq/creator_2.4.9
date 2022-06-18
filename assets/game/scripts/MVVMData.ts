// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { DataContext } from "../../core/mvvm/DataContext";
import { observable } from "../../core/mvvm/Observable";
import { User } from "../models/UserModel";

const { ccclass, property } = cc._decorator;

@ccclass
export default class MVVMData extends DataContext {

    @observable
    private label: string = "123";

    @observable
    private check: boolean;

    @observable
    private user: User;

    start() {
        this.user = new User;
        this.user.name = "old name";
        this.user.isCheck = true;

        this.label = "old name";
        this.check = true;
    }

    // update (dt) {}

    onClickEvent(event: cc.Event, customEventData: string) {
        this.user.isCheck = !this.user.isCheck;
        this.user.name += "1";
        this.user.progress += 0.1;
        this.user.index += 1;

        this.label += "1";
        this.check = !this.check;

        if (this.label.length > 10) {
            this.label = "";
        }
        if (this.user.name.length > 10) {
            this.user.name = "";
        }
        if (this.user.progress > 1) {
            this.user.progress = 0;
        }
        if (this.user.index > 2) {
            this.user.index = 0;
        }
    }

}