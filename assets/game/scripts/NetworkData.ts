// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { http } from "../../core/common/Network";

const { ccclass, property } = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    @property(cc.EditBox)
    getUrl: cc.EditBox = null;

    @property(cc.EditBox)
    postUrl: cc.EditBox = null;

    @property(cc.EditBox)
    postData: cc.EditBox = null;

    @property(cc.Label)
    logLabel: cc.Label = null;

    // onLoad () {}
    start() {
        this.getUrl.string = "http://localhost:3001/login/jack/1234";
        this.postUrl.string = "http://localhost:8080/post";
    }
    // update (dt) {}

    onGetEvent(event: cc.Event, customEventData: string) {
        //console.log(customEventData);
        http.get(this.getUrl.string, (response: string) => {
            this.logLabel.string += response + "\n";
        }, (readyState: number, status: number) => {
            console.log(readyState, status);
        });
    }

    onPostEvent(event: cc.Event, customEventData: string) {
        console.log(customEventData);
    }
}
