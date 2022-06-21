// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import ViewManager from "../../core/common/ViewManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ViewGideData extends cc.Component {

    @property({
        type: cc.Node,
        tooltip: "导航内容节点"
    })
    private guideContent: cc.Node = null;

    start() {
        this.initGuide();
    }

    private initGuide(): void {
        let names = ViewManager.instance.getAllViewNames();
        // 添加导航
        if (this.guideContent) {
            this.guideContent.active = true;
            let item = this.guideContent.children[0];

            for (let name of names) {
                let newItem = cc.instantiate(item);
                newItem.active = true;
                newItem.getComponent(cc.Label).string = name;
                newItem.on(cc.Node.EventType.TOUCH_START, () => {
                    ViewManager.instance.show(name);
                });
                this.guideContent.addChild(newItem);
            }

            // 返回按钮
            let backItem = cc.instantiate(item);
            backItem.active = true;
            backItem.getComponent(cc.Label).string = "返回";
            backItem.on(cc.Node.EventType.TOUCH_START, () => {
                ViewManager.instance.backView();
            });
            this.guideContent.addChild(backItem);

            item.destroy();
        }
    }
}
