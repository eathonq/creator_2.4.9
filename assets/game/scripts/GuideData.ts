// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import GuideManager from "../../core/guide/GuideManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GuideData extends cc.Component {

    @property(cc.Node)
    content: cc.Node = null;

    @property(cc.Node)
    templateNode: cc.Node = null;

    @property(cc.Button)
    btnA: cc.Button = null;

    @property(cc.Button)
    btnB: cc.Button = null;

    @property(cc.Button)
    btnC: cc.Button = null;

    // onLoad () {}

    protected start() {
        this.btnA.node.on("click", this.onClickA, this);
        this.btnB.node.on("click", this.onClickB, this);
        this.btnC.node.on("click", this.onClickC, this);

        this.btnC.node.active = false;
    }

    // update (dt) {}

    onClickStart() {
        GuideManager.instance.run();
    }

    onClickReset() {
        GuideManager.instance.resetProgress();
    }

    onClickA() {
        console.log("onClickA");
    }

    onClickB() {
        console.log("onClickB");

        cc.tween(this.btnB.node)
            .delay(2)
            .call(() => {
                this.btnC.node.active = true;
            })
            .start();
    }

    onClickC() {
        console.log("onClickC");

        cc.tween(this.btnC.node)
            .delay(2)
            .call(() => {
                this.createRandomButton("Button D");
            })
            .start();
    }

    private createRandomButton(name: string) {
        let node = cc.instantiate(this.templateNode);
        node.active = true;
        node.name = name;
        let label = node.children[0].children[0].getComponent(cc.Label);
        label.string = name;

        // 设置随机位置
        node.x = Math.random() * this.content.width - this.content.width / 2;
        node.y = Math.random() * this.content.height - this.content.height / 2;

        this.content.addChild(node);

        let self = this;
        node.on(cc.Node.EventType.TOUCH_END, () => {
            console.log(`点击了${node.name}`);
            cc.tween(node)
                .delay(2)
                .call(() => {
                    if (name == "Button D") {
                        self.createRandomButton("Button E");
                    }
                    node.destroy();
                })
                .start();
        });
    }
}
