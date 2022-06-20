/**
 * CREATOR_2.4.9
 * DateTime = Sun May 01 2022 13:11:17 GMT+0800 (中国标准时间)
 * Author = eathon
 * github = https://github.com/eathonq/creator_2.4.9.git
 * email = vangagh@live.cn
 */

export const CONFIG_ROOT_KEY = "config_root";

/** 存储接口 */
export interface IStorage {
    /**
     * 获取配置
     * @param key 配置键 
     * @param def 默认值
     * @returns 配置值
     */
    getItem(key: string, def?: any): any;
    /**
     * 设置配置
     * @param key 配置键 
     * @param data 配置值
     */
    setItem(key: string, data: any): void;
    /** 移除配置 */
    removeItem(key: string): void;
    /**
     * 配置键判断
     * @param key 配置键 
     * @returns 是否存在
     */
    hasItem(key: string): boolean;
    /** 所有配置键 */
    keys(): string[];
    /** 清空配置 */
    clear(): void;
}

/** 本地存储 */
class LocalStorage implements IStorage {
    getItem(key: string, def = null): any {
        let value = cc.sys.localStorage.getItem(key);
        if (!value) {
            if (def)
                return def;
            else
                return "";
        }
        if (!def) {
            return value;
        }
        switch (typeof def) {
            case "number":
                return parseFloat(value);
            case "boolean":
                return value === "true";
            case "string":
                return value;
            default:
                return JSON.parse(value);
        }
    }

    setItem(key: string, data: any): void {
        cc.sys.localStorage.setItem(key, String(data));
    }

    removeItem(key: string): void {
        cc.sys.localStorage.removeItem(key);
    }

    hasItem(key: string): boolean {
        return cc.sys.localStorage.getItem(key) !== null;
    }

    keys(): string[] {
        let keyArray: string[] = [];
        for (let i = 0; i < cc.sys.localStorage.length; i++) {
            keyArray.push(cc.sys.localStorage.key(i));
        }
        return keyArray;
    }

    clear(): void {
        cc.sys.localStorage.clear();
    }
}

/** 平台存储 */
class PlatformStorage implements IStorage {
    //#region instance
    private static _instance: PlatformStorage = null;
    static get instance(): PlatformStorage {
        if (!this._instance) {
            this._instance = new PlatformStorage();
            //this._instance.init();
        }
        return this._instance;
    }
    //#endregion

    private _storage: IStorage = new LocalStorage();

    init(storage: IStorage): void {
        this._storage = storage;
    }

    getItem(key: string, def = null): any {
        return this._storage.getItem(key, def);
    }
    setItem(key: string, data: any): void {
        this._storage.setItem(key, data);
    }
    removeItem(key: string): void {
        this._storage.removeItem(key);
    }
    hasItem(key: string): boolean {
        return this._storage.hasItem(key);
    }
    keys(): string[] {
        return this._storage.keys();
    }
    clear(): void {
        this._storage.clear();
    }
}

/** 本地配置管理 */
class Configuration implements IStorage {
    //#region instance
    private static _instance: Configuration = null;
    static get instance(): Configuration {
        if (!this._instance) {
            this._instance = new Configuration();
        }
        this._instance.init();
        return this._instance;
    }
    //#endregion

    private _jsonData = {};
    private _markSave: boolean = false;
    private _configStorage: IStorage = storage;

    private _isInit = false;
    private init() {
        if (this._isInit) return;
        this._isInit = true;

        if (CC_EDITOR) return;

        const jsonItem = this._configStorage.getItem(CONFIG_ROOT_KEY);
        if (jsonItem) {
            this._jsonData = JSON.parse(jsonItem);
        }
        setInterval(this.scheduleSave.bind(this), 500);
    }

    /** 定时保存 */
    private scheduleSave() {
        if (!this._markSave) {
            return;
        }
        this._markSave = false;

        const data = JSON.stringify(this._jsonData);

        this._configStorage.setItem(CONFIG_ROOT_KEY, data);
    }

    getItem(key: string, def?: any): any {
        let value = this._jsonData[key];
        if (!value) {
            if (def)
                return def;
            else
                return "";
        }
        if (!def) {
            return value;
        }
        switch (typeof def) {
            case "number":
                return parseFloat(value);
            case "boolean":
                return value === "true";
            case "string":
                return value;
            default:
                return JSON.parse(value);
        }
    }

    setItem(key: string, value: string) {
        this._jsonData[key] = value;
        this._markSave = true;
    }

    removeItem(key: string): void {
        delete this._jsonData[key];
        this._markSave = true;
    }

    hasItem(key: string): boolean {
        return this._jsonData[key] != undefined;
    }

    keys(): string[] {
        let keyArray = [];
        for (let key in this._jsonData) {
            keyArray.push(key);
        }
        return keyArray;
    }

    clear(): void {
        this._jsonData = {};
        this._markSave = true;
    }

}

/** 平台存储 */
export const storage = PlatformStorage.instance;

/** 配置文件存储 */
export const config = Configuration.instance;