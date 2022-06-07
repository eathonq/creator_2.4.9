import { i18n } from './LanguageData';
const { ccclass, property, executeInEditMode, menu } = cc._decorator;

/**
 * Predefined variables
 * Name = LocalizedSprite
 * DateTime = Sat Apr 30 2022 17:24:34 GMT+0800 (中国标准时间)
 * Author = vangagh
 * FileBasename = LocalizedSprite.ts
 * FileBasenameNoExtension = LocalizedSprite
 * URL = db://assets/core/i18n/LocalizedSprite.ts
 * ManualUrl = https://docs.cocos.com/creator/3.4/manual/zh/
 *
 */

/**
 * [i18n-LocalizedSprite]
 * i18n 本地化图片(支持Sprite)
 */
@ccclass
@executeInEditMode
@menu('i18n/LocalizedSprite')
export class LocalizedSprite extends cc.Component {

    @property({
        tooltip: '绑定组件的名字',
        readonly: true,
    })
    private componentName: string = "";

    @property({
        tooltip: '组件上需要监听的属性',
        readonly: true,
    })
    private componentProperty: string = "";

    @property({
        tooltip: '绑定路径',
        visible() {
            return this.isWatchPath;
        }
    })
    private watchPath: string = "";

    @property({
        tooltip: '绑定路径',
        readonly: true,
        visible() {
            return !this.isWatchPath;
        }
    })
    private spriteFrameSet: string = "SpriteFrameSet";

    isWatchPath: boolean = true;

    languageSpriteHandler: (sprite: cc.Sprite, language: string) => void;

    onRestore() {
        this.checkEditorComponent();
    }

    protected onLoad() {
        this.checkEditorComponent();
        i18n.register(this);
        this.resetValue();
    }

    protected start(): void {}

    protected onDestroy() {
        i18n.unregister(this);
    }

    private checkEditorComponent() {
        if (CC_EDITOR) {
            let com = this.node.getComponent(cc.Sprite);
            if (com) {
                this.componentName = "Sprite";
                this.componentProperty = "spriteFrame";
            }
        }
    }

    resetValue() {
        let sprite = this.node.getComponent(cc.Sprite);
        if (!sprite || !sprite.isValid) return;

        // 使用路径加载图片
        if (this.isWatchPath) {
            i18n.getSpriteFrame(this.watchPath).then(spriteFrame => {
                if (spriteFrame) {
                    sprite.spriteFrame = spriteFrame;
                }
            });
        }
        // 使用其它方式加载图片
        else {
            if (this.languageSpriteHandler) {
                this.languageSpriteHandler(sprite, i18n.language);
            }
        }
    }
}