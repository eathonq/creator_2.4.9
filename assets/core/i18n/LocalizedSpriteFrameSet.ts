/**
 * CREATOR_2.4.9
 * DateTime = Tue May 03 2022 11:51:04 GMT+0800 (中国标准时间)
 * Author = eathon
 * github = https://github.com/eathonq/creator_2.4.9.git
 * email = vangagh@live.cn
 */

import { LocalizedSprite } from './LocalizedSprite';
const {ccclass, property,executeInEditMode,menu} = cc._decorator;

@ccclass('LocalizedSpriteFrameSetInfo')
class LocalizedSpriteFrameSetInfo {
    @property({
        tooltip: '语言类型'
    })
    language: string = "";
    @property({
        tooltip: '图片资源',
        type: cc.SpriteFrame,
    })
    spriteFrame: cc.SpriteFrame = null;
}

@ccclass
@executeInEditMode
@menu('i18n/LocalizedSpriteFrameSet')
export class LocalizedSpriteFrameSet extends cc.Component {

    @property({
        type: [LocalizedSpriteFrameSetInfo],
        tooltip: '图片资源列表',
    })
    list: LocalizedSpriteFrameSetInfo[] = [];

    protected onLoad() {
        this.checkEditorComponent();
    }

    protected onDestroy() {
        this.checkEditorComponent(true);
    }

    protected start(): void {}

    private checkEditorComponent(isDestroy: boolean = false) {
        let localizedSprite = this.node.getComponent(LocalizedSprite);
        if (localizedSprite) {
            if (isDestroy) {
                localizedSprite.isWatchPath = true;
                localizedSprite.languageSpriteHandler = null;
            }
            else {
                localizedSprite.isWatchPath = false;
                localizedSprite.languageSpriteHandler = this.languageSprite.bind(this);
            }
        }
    }

    private languageSprite(sprite: cc.Sprite, language: string):void {
        let spriteFrame = this.getSpriteFrame(language);
        if (spriteFrame) {
            sprite.spriteFrame = spriteFrame;
        }
    }

    private getSpriteFrame(language: string): cc.SpriteFrame {
        for (const info of this.list) {
            if (info.language === language) {
                return info.spriteFrame;
            }
        }
        return null;
    }
}