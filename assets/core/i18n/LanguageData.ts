/**
 * CREATOR_2.4.9
 * DateTime = Tue May 03 2022 11:51:04 GMT+0800 (中国标准时间)
 * Author = eathon
 * github = https://github.com/eathonq/creator_2.4.9.git
 * email = vangagh@live.cn
 */

import { config } from "../common/Configuration";
import { format } from "../common/StringFormat";
import { languageLoad } from "./LanguageLoad";
import { LocalizedLabel } from "./LocalizedLabel";
import { LocalizedSprite } from "./LocalizedSprite";

const LOCAL_LANGUAGE_KEY = 'language';  // 本地语言 key
const PARAMETER_MARK = '#';             // 参数开始标记
const PARAMETER_SPLIT = '$';            // 参数分隔符
const DEFAULT_LANGUAGE = 'zh';          // 默认语言

/** i18n显示模式 */
export enum I18nMode {
    /** 解析数据 */
    DATA = 0,
    /** 路径数据 */
    PATH = 1,
    /** 模板数据 */
    TEMPLATE = 2
}

/** 语言数据管理 */
class LanguageData {
    //#region instance
    private static _instance: LanguageData;
    static get instance(): LanguageData {
        if (!this._instance) {
            this._instance = new LanguageData();
        }
        this._instance.init();
        return this._instance;
    }
    //#endregion

    private _i18nMode: I18nMode = I18nMode.DATA;
    /** i18n显示模式 */
    get i18nMode(): I18nMode {
        return this._i18nMode;
    }

    private _language: string = "";
    /** 当前语言 */
    get language(): string {
        return this._language;
    }

    private languageData: { [key: string]: string } = {};   // 语言数据
    private localizedLabelArray: LocalizedLabel[] = [];  // LocalizedLabel 列表
    private localizedSpriteArray: LocalizedSprite[] = [];    // spriteArray 列表

    /** 根据本地语言标识初始化 */
    private init():void {
        let localLanguage = DEFAULT_LANGUAGE;
        if (!CC_EDITOR) {
            localLanguage = config.getItem(LOCAL_LANGUAGE_KEY, DEFAULT_LANGUAGE);
        }
        this.setLanguage(localLanguage);
    }

    /**
     * 设置显示模式
     * @param mode 显示模式
     */
    setMode(mode: I18nMode):void {
        if (this._i18nMode === mode) return;
        this._i18nMode = mode;
        this.reloadLabel();
    }

    /**
     * 设置语言
     * @param language 语言
     */
    setLanguage(language: string): void {
        if (this._language == language && this._i18nMode == I18nMode.DATA) return;

        this._i18nMode = I18nMode.DATA;
        if (this._language != language) {
            this._language = language;
            if (!CC_EDITOR) {
                config.setItem(LOCAL_LANGUAGE_KEY, language);
            }
            this.languageData = languageLoad.loadRecords(language);
        }

        this.reloadLabel();
        this.reloadSpriteFrame();
    }

    /**
     * 获取多语言文本
     * eg: title_1#10$20$30
     * @param watchPath 文本路径 #参数开始标记, $参数分隔符
     * @returns 多语言文本
     */
    getString(watchPath: string): string {
        if (watchPath.trim() === '') return;

        switch (this._i18nMode) {
            case I18nMode.PATH:
                return watchPath;
            case I18nMode.TEMPLATE:
                let arr = watchPath.split(PARAMETER_MARK);
                return this.languageData[arr[0]];
            case I18nMode.DATA:
                break;
            default:
                break;
        }

        if (watchPath.indexOf(PARAMETER_MARK) < 0) {
            return this.languageData[watchPath];
        }
        else {
            let arr = watchPath.split(PARAMETER_MARK);
            return format(this.languageData[arr[0]], arr[1].split(PARAMETER_SPLIT));
        }
    }

    /**
     * 获取多语言图片
     * @param watchPath 图片路径 
     * @returns 异步图片
     */
     async getSpriteFrame(watchPath: string): Promise<cc.SpriteFrame> {
        if (watchPath.trim() === '') return null;
        if (CC_EDITOR) return null;

        return new Promise<cc.SpriteFrame>((resolve, reject) => {
            cc.resources.load(`${languageLoad.directory}/${this._language}/${watchPath}`, cc.SpriteFrame, (err: any, spriteFrame: cc.SpriteFrame) => {
                if (err) {
                    resolve(null);
                } else {
                    resolve(spriteFrame);
                }
            });
        });
    }

    /**
     * 注册通知
     * @param localizedItem  LocalizedLabel 或者 LocalizedSprite 
     */
    register(localizedItem: LocalizedLabel | LocalizedSprite) {
        if (localizedItem instanceof LocalizedLabel) {
            this.localizedLabelArray.push(localizedItem);
        }
        else if (localizedItem instanceof LocalizedSprite) {
            this.localizedSpriteArray.push(localizedItem);
        }
    }

    /**
     * 注销通知
     * @param localizedItem LocalizedLabel 或者 LocalizedSprite
     */
    unregister(localizedItem: LocalizedLabel | LocalizedSprite) {
        if (localizedItem instanceof LocalizedLabel) {
            let index = this.localizedLabelArray.indexOf(localizedItem);
            if (index != -1) {
                this.localizedLabelArray.splice(index, 1);
            }
        }
        else if (localizedItem instanceof LocalizedSprite) {
            let index = this.localizedSpriteArray.indexOf(localizedItem);
            if (index != -1) {
                this.localizedSpriteArray.splice(index, 1);
            }
        }
    }

    private reloadLabel() {
        for (const label of this.localizedLabelArray) {
            label.resetValue();
        }
    }

    private reloadSpriteFrame() {
        for (const sprite of this.localizedSpriteArray) {
            sprite.resetValue();
        }
    }

}

/** i18n */
export const i18n = LanguageData.instance;