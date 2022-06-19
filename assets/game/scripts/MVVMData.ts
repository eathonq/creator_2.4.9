// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import observable from "../../core/mvvm/Observable";
import ViewModelBase from "../../core/mvvm/ViewModelBase";
import { User } from "../models/UserModel";

const { ccclass, property } = cc._decorator;

@ccclass
export default class MVVMData extends ViewModelBase {

    //@observable
    private label: string = "123";

    //@observable
    private check: boolean;

    //@observable
    private user: User;

    @observable
    private users: User[];

    @observable
    private intArray: number[];

    start() {
        this.label = "old name";
        this.check = true;

        this.user = new User;
        this.user.name = "old name";
        this.user.isCheck = true;
        //this.user.array = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

        let user_0 = new User;
        user_0.name = "user_0";
        let user_1 = new User;
        user_1.name = "user_1";
        let user_2 = new User;
        user_2.name = "user_2";
        let user_3 = new User;
        user_3.name = "user_3";
        let user_4 = new User;
        user_4.name = "user_4";
        let user_5 = new User;
        user_5.name = "user_5";
        this.users = [user_0, user_1, user_2, user_3, user_4, user_5];

        this.intArray = [1, 2, 3];
    }

    // update (dt) {}

    onClickEvent(event: cc.Event, customEventData: string) {
        this.user.isCheck = !this.user.isCheck;
        this.user.name += "1";
        this.user.progress += 0.1;
        this.user.index += 1;
        
        this.label += "1";
        this.check = !this.check;

        this.users[0].name += "1";
        this.intArray[0] += 1;

        let newUser = new User;
        newUser.name = "newUser" + this.users.length;
        this.users.push(newUser);
        this.intArray.push(this.intArray.length);

        if (this.label.length > 10) {
            this.label = "1";
        }
        if (this.user.name.length > 10) {
            this.user.name = "1";
        }
        if (this.user.progress > 1) {
            this.user.progress = 0;
        }
        if (this.user.index > 2) {
            this.user.index = 0;
        }

        if(this.users[0].name.length > 10) {
            this.users[0].name = "1";
        }

        if(this.intArray[0] > 10) {
            this.intArray[0] = 0;
        }
    }

}