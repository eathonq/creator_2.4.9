// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { MessageBox, MessageBoxButtons } from "../../core/common/MessageBox";
import ViewManager from "../../core/common/ViewManager";
import { Transitions } from "../../resources/transitions/transitions";

const { ccclass, property } = cc._decorator;

@ccclass
export default class HomeData extends cc.Component {

    @property(cc.Camera)
    private fromCamera: cc.Camera = null;

    @property(cc.Node)
    private fromNode: cc.Node = null;

    @property(cc.Camera)
    private toCamera: cc.Camera = null;

    @property(cc.Node)
    private toNode: cc.Node = null;

    @property(Transitions)
    private transitions: Transitions = null;

    @property(cc.Node)
    private content: cc.Node = null;

    @property(cc.RichText)
    private richText: cc.RichText = null;

    // LIFE-CYCLE CALLBACKS:

    protected onLoad() {
        //this.richText.string = this.richTextString();
        //this.resetLabelSize();
    }

    start() {
        this.richText.string = this.richTextString();
        this.resetLabelSize();
    }

    private richTextString() {
        return '<color=#745539>Newbie Support</color><br/><color=#d8612c>1. How to get stars?</color><br/>Getting \'Star Fragments\' from the \'Hero\' adventure.<br/><color=#d8612c>2. What are the uses of stars?</color><br/>Upgrade the level of different coin people, improve the attributes of coin people; adjust the star level of coin people to achieve more effective income.<br/><color=#d8612c>3. How to get equipment?</color><br/>Through \'adventure\' , \'shop\' acquisition, \'workshop\' manufacturing three major ways t…elete Data\' , enter your email address that can be contacted, click\' Submit\' , check the prompt, and click\' Confirm\' . Delete your game account. <br/><color=#d8612c>2. Can I play the game again after the game account is deleted? </color><br/>The deleted game account cannot play the game; if you want to play again, you need to use a new account. <br/><color=#d8612c>3. Can I apply for recovery after the game account is deleted? </color><br/>Once a game account is deleted, it cannot be recovered.';
    }

    // update (dt) {}

    onTransitionEvent(event: cc.Event.EventCustom, customEventData: string) {
        this.transitions.loadNode(this.fromCamera, this.fromNode, this.toCamera, this.toNode);
    }

    private _tooltipCount = 0;
    onClickTooltipEvent(event: cc.Event.EventTouch, customEventData: string) {
        ViewManager.instance.showTooltip("TooltipDemo", { content: "Hello World" + this._tooltipCount++, resolve: () => { } });
    }

    onClickMessageBoxEvent(event: cc.Event.EventTouch, customEventData: string) {
        MessageBox.Show("Hello World", "Box", MessageBoxButtons.YesNo);
    }

    private resetLabelSize() {
        let labels = this.content.getComponentsInChildren(cc.Label);
        for (let label of labels) {
            label.fontSize = label.fontSize * 2;
            label.lineHeight = label.lineHeight * 2;
            // if (label.overflow == 2 || label.overflow == 3) {
            //     let tmpSzie = label.node.getContentSize();
            //     label.node.setContentSize(cc.size(tmpSzie.width * 2, tmpSzie.height * 2));
            // }
            label.node.scaleX = label.node.scaleX * 0.5;
            label.node.scaleY = label.node.scaleY * 0.5;
        }
    }
}
