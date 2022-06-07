// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    //#region 绑定组件
    @property(cc.Node)
    private mapLayer: cc.Node = null;

    @property(cc.Node)
    private numberLayer: cc.Node = null;

    @property(cc.Node)
    private startEndLayer: cc.Node = null;

    @property([cc.Node])
    private templates: cc.Node[] = [];
    //#endregion

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    protected start () {
        this.initMap();
        this.initNumber();
        this.initStartEnd();
    }

    private initMap() {
        let row = 20;
        let col = 20;
        for (let i = 0; i < row; i++) {
            for (let j = 0; j < col; j++) {
                let node = cc.instantiate(this.templates[0]);
                this.mapLayer.addChild(node);
            }
        }
    }

    private initNumber() {
        //throw new Error("Method not implemented.");
        let start = { x: 0, y: 0 };
        let end = { x: 20, y: 20 };
    }

    private initStartEnd() {
        //throw new Error("Method not implemented.");
    }

    // update (dt) {}
}
