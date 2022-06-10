import { i18n_en } from "./en/en";
import { i18n_zh } from "./zh/zh";

/** 语言包 */
export let lang = {
    records(name: string): any {
        switch (name) {
            case "zh":
            case "zh_CN":
                return i18n_zh.records;
            case "en":
                return i18n_en.records;
            default:
                return null;
        }
    }
}