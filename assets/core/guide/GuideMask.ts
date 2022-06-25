/**
 * CREATOR_2.4.9
 * DateTime = Tue Jun 21 2022 17:17:58 GMT+0800 (中国标准时间)
 * Author = eathon
 * github = https://github.com/eathonq/creator_2.4.9.git
 * email = vangagh@live.cn
 */

const { ccclass, property } = cc._decorator;

/**
 * 引导管理器 Mask
 * @note 请先在画布节点最后面添加GuideMask组件节点
 */
@ccclass
export default class GuideMask extends cc.Component {

    @property(cc.Prefab)
    private guideMask: cc.Prefab = null;

    protected onLoad() {
        GuideMask._instance = this;
    }

    protected start() {
        if (CC_EDITOR) return;

        this.initPrefab();
    }

    // update (dt) {}

    private _guideMask: cc.Node = null;
    private _mask: cc.Mask = null;
    private initPrefab() {
        if (!this.guideMask) return;
        this._guideMask = cc.instantiate(this.guideMask);
        this._mask = this._guideMask.getComponent(cc.Mask);
        this.node.addChild(this._guideMask);

        this._background = this._guideMask.getChildByName('Background');
        this.initBackground();

        this._guideMask.active = false;
        this._guideMask.opacity = 0;
    }

    private _background: cc.Node = null;
    private initBackground() {
        this._background.on(cc.Node.EventType.TOUCH_START, (touch: cc.Event.EventTouch) => {
            if (!this._target) return;

            let touchListener = this._background['_touchListener'];

            // 点击目标节点，放行点击
            let rect = this._target.getBoundingBoxToWorld();
            if (rect.contains(touch.getLocation())) {
                touchListener.setSwallowTouches(false);
            }
            else {
                touchListener.setSwallowTouches(true);
            }
        }, this);
    }

    private _target: cc.Node = null;
    private _tween: cc.Tween = null;
    private highlight(target: cc.Node) {
        if (!target) return;
        this._target = target;

        this._guideMask.active = true;

        let graphics: cc.Graphics = this._mask['_graphics'];
        graphics.clear();

        let rect = this._target.getBoundingBoxToWorld();
        let p = this.node.convertToNodeSpaceAR(cc.v2(rect.x, rect.y));

        graphics.fillRect(p.x, p.y, rect.width, rect.height);

        // 动画效果显示
        if (this._tween) this._tween.stop();
        this._tween = cc.tween(this._guideMask)
            .to(0.2, { opacity: 255 })
            .call(() => {
                this._tween = null;
            })
            .start();
    }
    
    private clear() {
        this._guideMask.active = true;
        this._target = null;

        let graphics: cc.Graphics = this._mask['_graphics'];
        graphics.clear();

        graphics.fillRect(0, 0, 0, 0);

        // 动画效果隐藏
        if (this._tween) this._tween.stop();
        this._tween = cc.tween(this._guideMask)
            .to(0.5, { opacity: 0 })
            .call(() => {
                this._guideMask.active = false;
                this._tween = null;
            })
            .start();
    }

    private static _instance: GuideMask = null;
    /**
     * 凸显目标节点
     * @param target 目标节点 
     * @returns 
     */
    static highlight(target: cc.Node) {
        if (!GuideMask._instance) {
            // cc.log('GuideMask is not initialized, please add GuideMask.prefab to canvas');
            return;
        }

        GuideMask._instance.highlight(target);
    }

    /**
     * 清除目标节点
     * @returns 
     */
    static clear() {
        if (!GuideMask._instance) {
            // cc.log('GuideMask is not initialized, please add GuideMask.prefab to canvas');
            return;
        }

        GuideMask._instance.clear();
    }
}