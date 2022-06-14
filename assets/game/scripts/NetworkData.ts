// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { http, openLocalFile } from "../../core/common/Network";
import { User } from "../models/data";

const { ccclass, property } = cc._decorator;

@ccclass
export default class NetworkData extends cc.Component {

    @property(cc.EditBox)
    getUrl: cc.EditBox = null;

    @property(cc.EditBox)
    postUrl: cc.EditBox = null;

    @property(cc.EditBox)
    postData: cc.EditBox = null;

    @property(cc.EditBox)
    downloadUrl: cc.EditBox = null;

    @property(cc.Sprite)
    downloadSprite: cc.Sprite = null;

    @property(cc.EditBox)
    uploadUrl: cc.EditBox = null;

    @property(cc.Label)
    logLabel: cc.Label = null;

    // onLoad () {}
    start() {
        this.getUrl.string = "http://localhost:3001/login/jack/1234";
        this.postUrl.string = "http://localhost:3001/register/postUserInfo";

        this.uploadUrl.string = "http://localhost:3001/upload/file";
        this.downloadUrl.string = "http://localhost:3001/download/";
    }
    // update (dt) {}

    async onGetEvent(event: cc.Event, customEventData: string) {
        //console.log(customEventData);
        // http.get(this.getUrl.string, (response: string) => {
        //     this.logLabel.string += response + "\n";
        // }, (readyState: number, status: number) => {
        //     console.log(readyState, status);
        // });

        let data = await http.getAsync(this.getUrl.string);
        this.logLabel.string += data.response + "\n";
        let json = JSON.parse(data.response);
        console.log(json);
    }

    onPostEvent(event: cc.Event, customEventData: string) {
        //console.log(customEventData);
        let user = new User("jack", "1234", "king jack", 1, "...", null, null, null);
        http.post(this.postUrl.string, user, (response: string) => {
            this.logLabel.string += response + "\n";
        });
    }

    onDownloadEvent(event: cc.Event, customEventData: string) {
        // 远程图片下载
        cc.assetManager.loadRemote(this.downloadUrl.string, (err, texture: cc.Texture2D) => {
            if (err) {
                console.log(err);
            }
            else {
                this.downloadSprite.spriteFrame = new cc.SpriteFrame(texture);
            }
        });
    }

    onUploadEvent(event: cc.Event, customEventData: string) {
        openLocalFile((file: File) => {
            http.upload(this.uploadUrl.string, file, (response: string) => {
                let json = JSON.parse(response);
                let url = "http://localhost:3001/download/";
                this.downloadUrl.string = url + json.data.file;
                this.logLabel.string += response + "\n";
            });
        });
    }
}
