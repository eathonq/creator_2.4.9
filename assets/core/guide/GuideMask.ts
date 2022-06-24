/**
 * CREATOR_2.4.9
 * DateTime = Thu Jun 23 2022 14:43:23 GMT+0800 (中国标准时间)
 * Author = eathon
 * github = https://github.com/eathonq/creator_2.4.9.git
 * email = vangagh@live.cn
 */

const { ccclass, property, menu } = cc._decorator;

@ccclass
@menu("guide/GuideMask")
export default class GuideMask extends cc.Mask {

    @property(cc.Node)
    private target: cc.Node = null;

    // onLoad () {}

    private get graphics(): cc.Graphics {
        return this['_graphics'];
    }

    protected start() {
        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchCancel, this);

        this.graphicsNode(this.target);
    }

    private graphicsNode(node: cc.Node) {
        if(CC_EDITOR) return;

        let grp = this.graphics;
        let nodePos = node.convertToWorldSpaceAR(cc.Vec2.ZERO);
        let nodeSize = node.getContentSize();
        let rect = cc.rect(nodePos.x, nodePos.y, nodeSize.width, nodeSize.height);
        grp.clear();
        grp.fillRect(rect.x - 960/2, rect.y-640/2, rect.width, rect.height);
    }

    onTouchCancel(touch: cc.Event.EventTouch) {
        console.log("onTouchCancel");
    }

    onTouchEnd(touch: cc.Event.EventTouch) {
        console.log("onTouchEnd");
    }

    onTouchStart(touch: cc.Event.EventTouch) {
        console.log("onTouchStart");
    }

    // update (dt) {}
}
