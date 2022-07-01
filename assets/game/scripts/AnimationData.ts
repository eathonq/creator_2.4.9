// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import Characters, { Direction } from "../models/Characters";

const { ccclass, property } = cc._decorator;

@ccclass
export default class AnimationData extends cc.Component {

    @property(cc.Node)
    hero: cc.Node = null;

    // onLoad () {}

    protected start() {
        // let characters = this.hero.getComponent(Characters);
        // if (characters) {
        //     characters.play(Direction.Left);
        // }
        Characters.createWithNode(this.hero, "images/characters/曹操.png");

        this.initControl();
    }

    // update (dt) {}

    private initControl(){
        // 初始化键盘控制
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
    }

    private onKeyDown(event: cc.Event.EventKeyboard) {
        let characters = this.hero.getComponent(Characters);
        if (characters) {
            switch (event.keyCode) {
                case cc.macro.KEY.down:
                    characters.play(Direction.Down);
                    break;
                case cc.macro.KEY.left:
                    characters.play(Direction.Left);
                    break;
                case cc.macro.KEY.right:
                    characters.play(Direction.Right);
                    break;
                case cc.macro.KEY.up:
                    characters.play(Direction.Up);
                    break;
            }
        }
    }
}
