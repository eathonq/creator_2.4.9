/** 走动方向 */
export enum Direction {
    /** 空闲的 */
    Idle = 0,
    /** 向下 */
    Down,
    /** 向左 */
    Left,
    /** 向右 */
    Right,
    /** 向上 */
    Up,
}

const { ccclass, property, executeInEditMode, menu } = cc._decorator;

/** 人物 */
@ccclass
@executeInEditMode
@menu('Custom/Characters')
export default class Characters extends cc.Component {

    /**
     * 创建组件节点
     * @param path 资源路径
     * @param view 默认显示索引
     * @param speed 动画速度
     * @returns 
     */
    static async create(path: string, view = 0, speed = 1) {
        let node = new cc.Node();
        let characters = await Characters.createWithNode(node, path, view, speed);
        return characters;
    }

    /**
     * 创建组件节点
     * @param node 组件节点
     * @param path 资源路径
     * @param view 默认显示索引
     * @param speed 动画速度
     * @returns 
     */
    static async createWithNode(node: cc.Node, path: string, view = 0, speed = 1) {
        let characters = node.addComponent(Characters);
        characters.resource = await new Promise<cc.SpriteFrame>((resolve, reject) => {
            cc.loader.loadRes(path, cc.SpriteFrame, (err, spriteFrame: cc.SpriteFrame) => {
                if (err) {
                    cc.warn(err);
                    reject(null);
                } else {
                    resolve(spriteFrame);
                }
            });
        });
        characters.view = view;
        characters.speed = speed;
        characters.initSpriteAnimation(characters.resource);
        return characters;
    }

    @property(cc.SpriteFrame)
    private _resource: cc.SpriteFrame = null;
    @property({
        type: cc.SpriteFrame,
        tooltip: "资源"
    })
    private get resource(): cc.SpriteFrame {
        return this._resource;
    }
    private set resource(value: cc.SpriteFrame) {
        this._resource = value;
        this.checkEditorComponent();
    }

    @property
    private _view = 0;
    @property({
        min: 0,
        step: 1,
        tooltip: "显示索引"
    })
    private get view(): number {
        return this._view;
    }
    private set view(value: number) {
        this._view = value;
        this.checkEditorComponent();
    }

    @property({
        min: 0.1,
        tooltip: "动画速度"
    })
    private speed = 1;

    onRestore() {
        this.checkEditorComponent();
    }

    protected onLoad(): void {
        this.checkEditorComponent();

        if (!CC_EDITOR && this.resource) {
            this.initSpriteAnimation(this.resource);
        }
    }

    protected start() { }

    private _spriteFrameList: cc.SpriteFrame[] = null;
    private checkEditorComponent() {
        if (CC_EDITOR) {
            if (!this.resource) return;
            if (!this._spriteFrameList) {
                this._spriteFrameList = this.getSpriteFrameList(this.resource, 32, 32);
            }

            if (this._view > this._spriteFrameList.length - 1) {
                this.view = this._spriteFrameList.length - 1;
            }
            let sprite = this.node.getComponent(cc.Sprite);
            if (!sprite) {
                sprite = this.node.addComponent(cc.Sprite);
            }
            sprite.spriteFrame = this._spriteFrameList[this._view];
        }
    }

    private initSpriteAnimation(resource: cc.SpriteFrame) {
        let spriteFrameList = this.getSpriteFrameList(this.resource, 32, 32);
        let sprite = this.node.getComponent(cc.Sprite);
        if (!sprite) {
            sprite = this.node.addComponent(cc.Sprite);
        }
        sprite.spriteFrame = spriteFrameList[this._view];

        let runList = spriteFrameList.slice(0, 4);
        let runLeftList = spriteFrameList.slice(4, 8);
        let runRightList = spriteFrameList.slice(8, 12);
        let runBackList = spriteFrameList.slice(12);
        let clipFramesList = [runList, runLeftList, runRightList, runBackList];

        let animation = this.node.addComponent(cc.Animation);
        let speed = this.speed;
        for (let i = 0; i < clipFramesList.length; i++) {
            let clip = cc.AnimationClip.createWithSpriteFrames(clipFramesList[i], clipFramesList[i].length);
            clip.name = "run" + i;
            clip.speed = speed;
            clip.wrapMode = cc.WrapMode.Loop;
            animation.addClip(clip);
        }
    }

    private getSpriteFrameList(resource: cc.SpriteFrame, itemWidth: number, itemHeight: number) {
        let spriteFrameList = [];
        let x = 0;
        let y = 0;
        for (let i = 0; i < resource.getRect().height / itemHeight; i++) {
            for (let j = 0; j < resource.getRect().width / itemWidth; j++) {
                let spriteFrame = this.getSpriteFrame(resource, x, y, itemWidth, itemHeight);
                spriteFrameList.push(spriteFrame);
                x += itemWidth;
            }
            y += itemHeight;
            x = 0;
        }
        return spriteFrameList;
    }

    private getSpriteFrame(resource: cc.SpriteFrame, x: number, y: number, width: number, height: number) {
        let spriteFrame = resource.clone();
        spriteFrame.setRect(new cc.Rect(x, y, width, height));
        return spriteFrame;
    }

    private _direction = Direction.Idle;
    /**
     * 播放动画
     * @param direction 朝向
     */
    play(direction: Direction) {
        if (this._direction == direction) return;
        this._direction = direction;

        let animation = this.node.getComponent(cc.Animation);
        let name = "run";
        switch (direction) {
            case Direction.Down:
                name = "run" + 0;
                break;
            case Direction.Left:
                name = "run" + 1;
                break;
            case Direction.Right:
                name = "run" + 2;
                break;
            case Direction.Up:
                name = "run" + 3;
                break;
        }
        animation.play(name);
    }
}