// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { i18n, I18nMode } from "../../core/i18n/LanguageData";
const { ccclass, property, executeInEditMode } = cc._decorator;

enum LanguageType {
    CHINESE = 0,
    ENGLISH ,
    PATH,
    TEMPLATE
}

@ccclass
@executeInEditMode
export default class I18nData extends cc.Component {

    // @property({
    //     type: cc.Enum(LanguageType),
    //     tooltip: "默认显示类型"
    // })
    // displayType: LanguageType = LanguageType.CHINESE;

    private _displayType: LanguageType = LanguageType.CHINESE;
    @property({
        type: cc.Enum(LanguageType),
        tooltip: "默认显示类型"
    })
    get displayType(): LanguageType {
        return this._displayType;
    }
    set displayType(value: LanguageType) {
        // this._displayType = value;
        this.changeLanguage(value);
    }

    // start() {}
    // update (dt) {}

    private changeLanguage(type: LanguageType): void {
        if (this._displayType == type)
            return;

        this._displayType = type;
        switch (type) {
            case LanguageType.CHINESE:
                i18n.setLanguage("zh");
                break;
            case LanguageType.ENGLISH:
                i18n.setLanguage("en");
                break;
            case LanguageType.PATH:
                i18n.setMode(I18nMode.PATH);
                break;
            case LanguageType.TEMPLATE:
                i18n.setMode(I18nMode.TEMPLATE);
                break;
        }
    }

    onLanguageChangeEvent(event: Event, customEventData: string): void {
        switch (customEventData) {
            case "zh":
                this.changeLanguage(LanguageType.CHINESE);
                break;
            case "en":
                this.changeLanguage(LanguageType.ENGLISH);
                break;
            case "path":
                this.changeLanguage(LanguageType.PATH);
                break;
            case "template":
                this.changeLanguage(LanguageType.TEMPLATE);
                break;
            default:
                break;
        }
    }
}