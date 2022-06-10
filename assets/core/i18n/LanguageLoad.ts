import { lang } from "../../resources/i18n/language";

class LanguageLoad {
    //#region instance
    private static _instance: LanguageLoad;
    static get instance(): LanguageLoad {
        if (!this._instance) {
            this._instance = new LanguageLoad();
        }
        return this._instance;
    }
    //#endregion

    directory = "i18n";

    /**
     * 获取语言数据
     * @param language 语言 
     * @returns 语言数据
     */
    loadRecords(language: string): { [key: string]: string } {
        let data: { [key: string]: string } = {};
        let records = lang.records(language);
        if (records) {
            for (let i = 0; i < records.length; i++) {
                let record = records[i];
                data[record[1]] = record[2];
            }
        }

        return data;
    }

    /**
     * 获取语言数据
     * @param language 语言 
     * @returns 异步语言数据
     */
    async loadJsonRecords(language: string): Promise<{ [key: string]: string }> {
        let languagePath = `${this.directory}/${language}`;
        return new Promise<{ [key: string]: string }>((resolve, reject) => {
            cc.resources.load(languagePath, (err: any, res: cc.JsonAsset) => {
                if (err) {
                    reject(err);
                }
                let data: { [key: string]: string } = {};
                if (res.json.hasOwnProperty('RECORDS')) {
                    let records = res.json['RECORDS'];
                    for (let i = 0; i < records.length; i++) {
                        let record = records[i];
                        data[record[1]] = record[2];
                    }
                }
                resolve(data);
            });
        });
    }
}

/** 多语言数据加载 */
export let languageLoad = LanguageLoad.instance;