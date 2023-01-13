/**
 * CREATOR_2.4.9
 * DateTime = Fri Jul 29 2022 15:16:25 GMT+0800 (中国标准时间)
 * Author = eathon
 * github = https://github.com/eathonq/creator_2.4.9.git
 * email = vangagh@live.cn
 */

/** 实用工具 */
export class Utils {
    /**
     * 获取图片
     * @param path 图片路径（不包含后缀，相对路径从resources子目录算起）
     * @returns Promise<cc.SpriteFrame>
     */
    static async getSpriteFrame(path: string): Promise<cc.SpriteFrame> {
        if (path.trim() === '') return null;

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
     * 设置精灵图片
     * @param node 精灵节点或者精灵组件 
     * @param path 图片路径（不包含后缀，相对路径从resources子目录算起）
     */
    static setSprite(node: cc.Node | cc.Sprite, path: string): void {
        if (path.trim() === '') return;

        this.getSpriteFrame(path).then((spriteFrame: cc.SpriteFrame) => {
            if (!spriteFrame) return;

            if (node instanceof cc.Node) {
                let sprite = node.getComponent(cc.Sprite);
                if (!sprite) {
                    sprite = node.addComponent(cc.Sprite);
                }
                sprite.spriteFrame = spriteFrame;
            }
            else {
                node.spriteFrame = spriteFrame;
            }
        });
    }
}