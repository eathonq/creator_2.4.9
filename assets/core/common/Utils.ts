/**
 * CREATOR_2.4.9
 * DateTime = Fri Jul 29 2022 15:16:25 GMT+0800 (中国标准时间)
 * Author = eathon
 * github = https://github.com/eathonq/creator_2.4.9.git
 * email = vangagh@live.cn
 */

/** 实用工具 */
export class Utils {
    //#region instance
    private static _instance: Utils;
    public static get instance(): Utils {
        if (!Utils._instance) {
            Utils._instance = new Utils();
        }
        return Utils._instance;
    }
    //#endregion

    /**
     * 获取异步图片
     * @param path 图片路径 
     * @returns SpriteFrame
     */
    async getSpriteFrame(path: string): Promise<cc.SpriteFrame> {
        if (path.trim() === '') return null;
        if (CC_EDITOR) return null;
        return new Promise<cc.SpriteFrame>((resolve, reject) => {
            cc.resources.load(path, cc.SpriteFrame, (err: any, spriteFrame: cc.SpriteFrame) => {
                if (err) {
                    resolve(null);
                } else {
                    resolve(spriteFrame);
                }
            });
        });
    }

    /**
     * 回调获取图片
     * @param path 图片路径
     * @param callback 回调函数
     * @returns void
     */
    getSpriteFrameWithCallback(path: string, callback: (spriteFrame: cc.SpriteFrame) => void): void {
        if (path.trim() === '') return callback(null);
        if (CC_EDITOR) return callback(null);
        cc.resources.load(path, cc.SpriteFrame, (err: any, spriteFrame: cc.SpriteFrame) => {
            if (err) {
                callback(null);
            } else {
                callback(spriteFrame);
            }
        });
    }

    /**
     * 设置精灵图片
     * @param sprite 精灵 
     * @param path 图片路径
     * @returns void
     */
    setSprite(sprite: cc.Sprite, path: string): void {
        if (path.trim() === '') return;
        if (CC_EDITOR) return;
        cc.resources.load(path, cc.SpriteFrame, (err: any, spriteFrame: cc.SpriteFrame) => {
            if (err) {
                sprite.spriteFrame = null;
            } else {
                sprite.spriteFrame = spriteFrame;
            }
        });
    }
}