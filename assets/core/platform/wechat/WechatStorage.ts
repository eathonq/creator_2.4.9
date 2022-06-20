import { IStorage, storage } from '../../common/Configuration';
/**
 * CREATOR_2.4.9
 * DateTime = Tue Mar 29 2022 10:45:50 GMT+0800 (中国标准时间)
 * Author = eathon
 * github = https://github.com/eathonq/creator_2.4.9.git
 * email = vangagh@live.cn
 * WechatStorageUrl = https://developers.weixin.qq.com/miniprogram/dev/api/storage/wx.setStorageSync.html
 */

/** 检测微信游戏平台 */
let checkWechatGame = ():boolean => { return cc.sys.WECHAT_GAME == cc.sys.platform};

/** 微信存储 */
class WechatStorage implements IStorage {

    getItem(key: string, def = null): any {
        if (checkWechatGame()) {
            let value = wx.getStorageSync(key);
            //console.log(`-->wx get--${key} ,data-- ${data}`);
            if (!value) {
                if (def)
                    return def;
                else
                    return "";
            }
            return value;
        }

        return "";
    }

    setItem(key: string, data: any) {
        if (checkWechatGame()) {
            wx.setStorage({
                key: key, data: data, success(res) {
                    //console.log(`-->wx set--${key} ,data-- ${data}`);
                }
            })
        }
    }

    removeItem(key: string) {
        if (checkWechatGame()) {
            wx.removeStorage({
                key: key,
                success(res) {
                    //console.log(`-->wx remove--${key}`); 
                }
            });
        }
    }

    hasItem(key: string) {
        if (checkWechatGame()) {
            return wx.getStorage({ key: key, }) != undefined;
        }
        return false;
    }

    keys(): string[] {
        if (checkWechatGame()) {
            const res = wx.getStorageInfoSync();
            return res.keys;
        }
        return [];
    }

    clear(): void {
        if (checkWechatGame()) {
            wx.clearStorage();
        }
    }

    currentSize(): number {
        if (checkWechatGame()) {
            const res = wx.getStorageInfoSync();
            return res.currentSize;
        }
        return 0;
    }

    limitSize(): number {
        if (checkWechatGame()) {
            const res = wx.getStorageInfoSync();
            return res.limitSize;
        }
        return 0;
    }
}

// 注册平台存储
if (checkWechatGame()){
    storage.init(new WechatStorage());
}
