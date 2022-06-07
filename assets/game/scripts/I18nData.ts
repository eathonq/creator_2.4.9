// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { i18n, I18nMode } from "../../core/i18n/LanguageData";

const { ccclass, property } = cc._decorator;

@ccclass
export default class I18nData extends cc.Component {

    @property({
        type: cc.Slider,
        tooltip: '滑动条更新内容',
    })
    private updateContentSlider: cc.Slider = null;

    @property({
        type: cc.Node,
        tooltip: '多语言内容模版',
    })
    private languageContentTemp: cc.Node = null;

    @property({
        type: cc.Toggle,
        tooltip: '开关按钮',
    })
    private toggle: cc.Toggle = null;

    @property({
        type: cc.ToggleContainer,
        tooltip: '单选按钮组',
    })
    private toggleContainer: cc.ToggleContainer = null;

    @property({
        type: cc.Node,
        tooltip: '多语言内容显示节点',
    })
    private languageContent: cc.Node = null;

    private _isCheck: boolean = false;
    private _checkIndex: number = 0;

    start() {
        this.initToggle();
        this.initSlider();
    }


    private initToggle(): void {
        if (!this.toggle) {
            console.log("addOneNodeToggle is null");
            return;
        }

        this.toggle.node.on("toggle", (toggle: cc.Toggle) => {
            if (toggle.isChecked) {
                this._isCheck = true;
            } else {
                this._isCheck = false;
            }
        }, this);
    }

    private initSlider(): void {
        if (!this.updateContentSlider) {
            console.log("sliderNode is null");
            return;
        }

        let label = this.updateContentSlider.node.getComponentInChildren(cc.Label);
        if (!label) {
            console.log("label is null");
            return;
        }

        this.updateContentSlider.node.on("slide", (slider: cc.Slider) => {
            let count = Math.round(slider.progress * 99 + 1);
            label.string = count.toString();
            this.updateLanguageContent(count);
        }, this);
    }

    private updateLanguageContent(count: number): void {
        if (!this.languageContentTemp || !this.languageContent) {
            console.log("languageContentNode of languageContent is null");
            return;
        }

        this.languageContentTemp.active = false;

        if (this._isCheck) {
            // 图文分开渲染
            this.languageContent.removeAllChildren();
            this.asyncLabel(count);
            this.asyncSprite(count);
            return;
            if (this._checkIndex == 1) {
                //this.languageContent.removeAllChildren();
                this.languageContent.children.forEach(element => {
                    if(element.getComponent(cc.Label)){
                        element.destroy();
                    }
                });
                for (let i = 0; i < count; i++) {
                    this.languageContentTemp.children.forEach(element => {
                        if (element.getComponent(cc.Label)) {
                            let node = cc.instantiate(element);
                            let pt = element.getPosition().add(cc.v2(i * 10, i * 10));
                            pt = this.languageContentTemp.convertToWorldSpaceAR(pt);
                            pt = this.languageContent.convertToNodeSpaceAR(pt);
                            node.setPosition(pt);
                            this.languageContent.insertChild(node, 0);
                        }
                    });
                }
            } else {
                //this.languageContent.removeAllChildren();
                this.languageContent.children.forEach(element => {
                    if(element.getComponent(cc.Sprite)){
                        element.destroy();
                    }
                });
                for (let i = 0; i < count; i++) {
                    this.languageContentTemp.children.forEach(element => {
                        if (element.getComponent(cc.Sprite)) {
                            let node = cc.instantiate(element);
                            let pt = element.getPosition().add(cc.v2(i * 10, i * 10));
                            pt = this.languageContentTemp.convertToWorldSpaceAR(pt);
                            pt = this.languageContent.convertToNodeSpaceAR(pt);
                            node.setPosition(pt);
                            this.languageContent.insertChild(node, 0);
                        }
                    });
                }
            }


        } else {
            // 图文同时渲染
            this.languageContent.removeAllChildren();
            for (let i = 0; i < count; i++) {
                this.languageContentTemp.children.forEach(element => {
                    let node = cc.instantiate(element);
                    let pt = element.getPosition().add(cc.v2(i * 10, i * 10));
                    pt = this.languageContentTemp.convertToWorldSpaceAR(pt);
                    pt = this.languageContent.convertToNodeSpaceAR(pt);
                    node.setPosition(pt);
                    this.languageContent.insertChild(node, 0);
                });
            }
        }
    }

    private async asyncLabel(count:number): Promise<void> {
        for (let i = 0; i < count; i++) {
            this.languageContentTemp.children.forEach(element => {
                if (element.getComponent(cc.Label)) {
                    let node = cc.instantiate(element);
                    let pt = element.getPosition().add(cc.v2(i * 10, i * 10));
                    pt = this.languageContentTemp.convertToWorldSpaceAR(pt);
                    pt = this.languageContent.convertToNodeSpaceAR(pt);
                    node.setPosition(pt);
                    this.languageContent.insertChild(node, 0);
                }
            });
        }
    }

    private async asyncSprite(count: number): Promise<void> {
        for (let i = 0; i < count; i++) {
            this.languageContentTemp.children.forEach(element => {
                if (element.getComponent(cc.Sprite)) {
                    let node = cc.instantiate(element);
                    let pt = element.getPosition().add(cc.v2(i * 10, i * 10));
                    pt = this.languageContentTemp.convertToWorldSpaceAR(pt);
                    pt = this.languageContent.convertToNodeSpaceAR(pt);
                    node.setPosition(pt);
                    this.languageContent.insertChild(node, 0);
                }
            });
        }
    }

    // update (dt) {}

    onToggleEvent(toggle: cc.Toggle, customEventData: string): void {
        if (toggle.isChecked) {
            this._checkIndex = toggle.node.name == "toggle1" ? 1 : 2;
        }
    }

    onLanguageChange(event: Event, customEventData: string): void {
        switch (customEventData) {
            case "zh":
                i18n.setLanguage("zh");
                break;
            case "en":
                i18n.setLanguage("en");
                break;
            case "path":
                i18n.setMode(I18nMode.PATH);
                break;
            case "template":
                i18n.setMode(I18nMode.TEMPLATE);
                break;
            default:
                break;
        }
    }
}