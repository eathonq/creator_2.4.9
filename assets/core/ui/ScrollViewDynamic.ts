/**
 * CREATOR_2.4.9
 * DateTime = Sun May 01 2022 13:11:17 GMT+0800 (中国标准时间)
 * Author = eathon
 * github = https://github.com/eathonq/creator_2.4.9.git
 * email = vangagh@live.cn
 */

const { ccclass, property, executeInEditMode, menu } = cc._decorator;

/**
 * 滚动视图，可以动态设置子节点opacity
 */
@ccclass
@executeInEditMode
@menu('ui/ScrollViewDynamic')
export default class ScrollViewDynamic extends cc.Component {

    //#region  组件属性
    @property({
        type: cc.ScrollView,
        readonly: true,
        tooltip: '滚动视图'
    })
    private scrollView: cc.ScrollView = null;

    @property({
        type: cc.Node,
        readonly: true,
        tooltip: '滚动视图可视区域'
    })
    private view: cc.Node = null;

    @property({
        type: cc.Node,
        readonly: true,
        tooltip: '滚动视图内容'
    })
    private content: cc.Node = null;

    @property({
        type: cc.Enum(cc.Scrollbar.Direction),
        readonly: true,
        tooltip: '滚动视图方向',
    })
    public direction: cc.Scrollbar.Direction = cc.Scrollbar.Direction.VERTICAL;

    @property({
        type: cc.Integer, min: 1, step: 1,
        tooltip: '滚动检测单元\n最佳为内容项高度\n(值越小检测频率越高)',
    })
    scrollUnit = 50;

    @property({
        type: cc.Integer, min: 0, step: 1,
        tooltip: '扩展可视区域范围(提前变化)',
    })
    previewUnit = 0;
    //#endregion

    protected onLoad() {
        this.checkEditorComponents();
    }

    protected start() {
        this.initScrollView();
    }

    private checkEditorComponents() {
        if (!this.scrollView) {
            this.scrollView = this.node.getComponent(cc.ScrollView);
            if (!this.scrollView) {
                cc.error('ScrollViewDynamic: scrollView is null');
                return false;
            }
        }

        if (!this.view) {
            this.view = this.scrollView.node.getChildByName('view');
            if (!this.view) {
                cc.error('ScrollViewContent: view is null');
                return false;
            }
        }

        if (!this.content) {
            this.content = this.scrollView.content;
            if (!this.content) {
                cc.error('ScrollViewContent: content is null');
                return false;
            }
        }

        this.direction = this.scrollView.vertical ? cc.Scrollbar.Direction.VERTICAL : cc.Scrollbar.Direction.HORIZONTAL;

        return true;
    }

    private initScrollView() {
        if (this.direction == cc.Scrollbar.Direction.VERTICAL) {
            this.scrollView.node.on('scrolling', this.onScrollingWithVertical, this);
        }
        else {
            this.scrollView.node.on('scrolling', this.onScrollingWithHorizontal, this);
        }
    }

    private _offsetYUnit = 0;
    private onScrollingWithVertical(scrollView: cc.ScrollView) {
        let offsetYUnit = Math.floor(scrollView.getScrollOffset().y / this.scrollUnit);

        // 单元滚动通知
        if (offsetYUnit != this._offsetYUnit) {
            if (offsetYUnit < 0) return;
            if (offsetYUnit > scrollView.content.height / this.scrollUnit) return;

            this._offsetYUnit = offsetYUnit;
            let viewTop = scrollView.getScrollOffset().y - this.previewUnit;
            let viewBottom = viewTop + scrollView.node.height + this.previewUnit * 2;
            // 设置不在可视区域opacity为0
            this.updateVerticalContentView(viewTop, viewBottom);

            // 判断是否加载更多
            if (scrollView.getScrollOffset().y >= (scrollView.content.height - scrollView.node.height - this._preloadUnit)) {
                // 加载更多
                this.onPreloadMore();
            }
        }
    }

    private updateVerticalContentView(viewTop: number, viewBottom: number) {
        let child: cc.Node = null;
        let childTop = 0;
        let childBottom = 0;
        for (let i = 0; i < this.content.children.length; i++) {
            child = this.content.children[i];
            childTop = -child.y - child.height * child.anchorY;
            childBottom = childTop + child.height;
            if (childTop < viewBottom && childBottom > viewTop) {
                child.opacity = 255;
            }
            else {
                child.opacity = 0;
            }
        }
    }

    private _offsetXUnit = 0;
    private onScrollingWithHorizontal(scrollView: cc.ScrollView) {
        let offsetXUnit = Math.floor(-scrollView.getScrollOffset().x / this.scrollUnit);

        // 单元滚动通知
        if (offsetXUnit != this._offsetXUnit) {
            if (offsetXUnit < 0) return;
            if (offsetXUnit > scrollView.content.width / this.scrollUnit) return;

            this._offsetXUnit = offsetXUnit;
            let viewLeft = -scrollView.getScrollOffset().x - this.previewUnit;
            let viewRight = viewLeft + scrollView.node.width + this.previewUnit * 2;
            // 设置不在可视区域opacity为0
            this.updateHorizontalContentView(viewLeft, viewRight);

            // 判断是否加载更多
            if (-scrollView.getScrollOffset().x >= (scrollView.content.width - scrollView.node.width - this._preloadUnit)) {
                // 加载更多
                this.onPreloadMore();
            }
        }
    }

    private updateHorizontalContentView(viewLeft: number, viewRight: number) {
        let child: cc.Node = null;
        let childLeft = 0;
        let childRight = 0;
        for (let i = 0; i < this.content.children.length; i++) {
            child = this.content.children[i];
            childLeft = child.x - child.width * child.anchorX;
            childRight = childLeft + child.width;
            if (childLeft < viewRight && childRight > viewLeft) {
                child.opacity = 255;
            }
            else {
                child.opacity = 0;
            }
        }
    }

    private _firstRefresh = false;
    /** 手动刷新 */
    refresh() {
        if (this.direction == cc.Scrollbar.Direction.VERTICAL) {
            if (!this._firstRefresh) {
                this._firstRefresh = true;
                // 第一次初始化时，通过滚动到顶部位置初始化内容项目位置参数
                this.scrollView.scrollTo(cc.v2(0, 1));
            }
            this.updateVerticalContentView(0, this.scrollView.node.height);
        }
        else {
            if (!this._firstRefresh) {
                this._firstRefresh = true;
                // 第一次初始化时，通过滚动到左边位置初始化内容项目位置参数
                this.scrollView.scrollTo(cc.v2(0, 0));
            }
            this.updateHorizontalContentView(0, this.scrollView.node.width);
        }
    }

    private _scrollToCheckLoadMore = false;
    private _preloadUnit = 0;
    private _onPreloadMore = null;
    private _target = null;
    private onPreloadMore() {
        if (this._onPreloadMore) {
            if (this._target)
                this._onPreloadMore.call(this._target);
            else
                this._onPreloadMore();
        }

        this._scrollToCheckLoadMore = true;
    }

    /**
     * 设置预加载
     * @param preloadUnit 预加载单元范围
     * @param onPreloadMore 预加载回调
     * @param target 预加载回调对象
     */
    setPreloadMore(preloadUnit: number, onPreloadMore: Function, target?: any) {
        this._preloadUnit = preloadUnit;
        this._onPreloadMore = onPreloadMore;
        this._target = target;
    }

    /**
     * 获取指定索引的内容项目
     * @param index 索引
     * @note 0开始，滚动索引超过当前最大索引，将触发多次滚动
     */
    scrollTo(index: number, timeInSecond = .5) {
        let preIndex = index;

        // 索引安全范围检查
        if (index < 0) index = 0;
        if (index >= this.content.children.length) index = this.content.children.length - 1;

        // 计算滚动位置
        let pos: cc.Vec2;
        if (this.direction == cc.Scrollbar.Direction.VERTICAL) {
            let child = this.content.children[index];
            let childTop = -child.position.y - child.height * child.anchorY;
            let layout = this.content.getComponent(cc.Layout);
            if (layout) {
                childTop -= layout.spacingY;
            }
            pos = cc.v2(child.position.x, childTop);
        }
        else {
            let child = this.content.children[index];
            let childLeft = child.position.x - child.width * child.anchorX;
            let layout = this.content.getComponent(cc.Layout);
            if (layout) {
                childLeft -= layout.spacingX;
            }
            pos = cc.v2(childLeft, child.position.y);
        }

        this.scrollView.scrollToOffset(pos, timeInSecond);

        this._scrollToCheckLoadMore = false;
        let self = this;
        cc.tween(this.scrollView.node).delay(timeInSecond + .1).call(() => {
            if (self._scrollToCheckLoadMore) {
                self.scrollTo(preIndex, .2);
            }
        }).start();
    }
}
