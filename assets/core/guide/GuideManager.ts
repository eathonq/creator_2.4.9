/**
 * CREATOR_2.4.9
 * DateTime = Tue Jun 21 2022 17:17:58 GMT+0800 (中国标准时间)
 * Author = eathon
 * github = https://github.com/eathonq/creator_2.4.9.git
 * email = vangagh@live.cn
 */

const { ccclass, property } = cc._decorator;

@ccclass
export default class GuideManager extends cc.Component {
    //#region instance
    private static _instance: GuideManager = null;
    static get instance() {
        if (this._instance == null) {
            let scene = cc.director.getScene();
            if (!scene) return null;
            this._instance = scene.getComponentInChildren(GuideManager);
            if (this._instance == null) {
                console.log("GuideManager is not found in scene");
                let newNode = new cc.Node("GuideManager");
                scene.addChild(newNode);
                this._instance = newNode.addComponent(GuideManager);
            }
            cc.game.addPersistRootNode(this._instance.node);
        }
        return this._instance;
    }
    //#endregion

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    protected start() { }

    // update (dt) {}

    find(path:string, type?: cc.Component){
        let node = cc.find(path);
    }
}
