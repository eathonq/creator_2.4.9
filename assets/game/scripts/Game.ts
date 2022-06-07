// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import ViewManager from "../../core/common/ViewManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    @property({
        type: cc.Node,
        tooltip: "导航内容节点"
    })
    private guideContent: cc.Node = null;

    start() {
        ViewManager.instance.showView("DrawCallDemo"); //HomeView I18nDemo

        this.initGuide();
    }

    private initGuide(): void {
        if (!this.guideContent) {
            console.log("guideContent is null");
            return;
        }

        this.guideContent.active = true;
        this.guideContent.removeAllChildren();
        // 初始化导航
        let views = ViewManager.instance.getAllViewNames();
        for (let i = 0; i < views.length; i++) {
            let node = new cc.Node(`view_${i}`);
            let label = node.addComponent(cc.Label);
            label.fontSize = 20;
            label.lineHeight = 20;
            label.cacheMode = cc.Label.CacheMode.BITMAP;
            label.string = views[i];
            node.on(cc.Node.EventType.TOUCH_END, () => {
                ViewManager.instance.show(views[i]);
            }, this);
            this.guideContent.addChild(node);
        }

        // 初始化返回导航
        let backNode = new cc.Node("back");
        let backLabel = backNode.addComponent(cc.Label);
        backLabel.fontSize = 20;
        backLabel.lineHeight = 20;
        backLabel.cacheMode = cc.Label.CacheMode.BITMAP;
        backLabel.string = "返回";
        backNode.on(cc.Node.EventType.TOUCH_END, () => {
            ViewManager.instance.backView();
        }, this);
        this.guideContent.addChild(backNode);
    }
}