import ScrollListView from "./ScrollListView";

const { ccclass, property, executeInEditMode, menu } = cc._decorator;

@ccclass
@executeInEditMode
@menu('ui/ScrollViewDirection')
export default class ScrollViewDirection extends cc.Component {

    private _type: cc.Scrollbar.Direction = cc.Scrollbar.Direction.VERTICAL;
    @property({
        tooltip: '滚动视图方向',
        type: cc.Enum(cc.Scrollbar.Direction)
    })
    get type(): cc.Scrollbar.Direction {
        return this._type;
    }
    set type(value: cc.Scrollbar.Direction) {
        this._type = value;
        this.autoAdjustDirection();
    }

    @property({
        type: cc.ScrollView,
        readonly: true,
        tooltip: '滚动视图'
    })
    private scrollView: cc.ScrollView = null;

    @property({
        type: cc.Scrollbar,
        readonly: true,
        tooltip: '滚动视图滚动条'
    })
    private scrollbar: cc.Scrollbar = null;

    @property({
        type: cc.Node,
        readonly: true,
        tooltip: '滚动视图滚动节点'
    })
    private bar: cc.Node = null;

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

    private _scrollbarActive = true;
    @property({
        tooltip: '滚动视图滚动节点是否启用',
    })
    get scrollbarActive(): boolean {
        return this._scrollbarActive;
    }
    set scrollbarActive(value: boolean) {
        this._scrollbarActive = value;
        this.scrollbar.node.active = value;
    }

    onRestore(): void {
        this.checkEditorComponents();
    }

    protected onLoad(): void {
        this.checkEditorComponents();
    }

    protected start(): void { }

    private checkEditorComponents(): void {
        if (!this.scrollView) {
            this.scrollView = this.node.getComponent(cc.ScrollView);
            if (!this.scrollView) {
                cc.error('ScrollViewContent: scrollView is null');
            }
        }

        if (!this.scrollbar) {
            this.scrollbar = this.scrollView.getComponentInChildren(cc.Scrollbar);
            if (!this.scrollbar) {
                cc.error('ScrollViewContent: scrollBar is null');
            }
        }

        if (!this.bar) {
            this.bar = this.scrollbar.node.getChildByName('bar');
            if (!this.bar) {
                cc.error('ScrollViewContent: bar is null');
            }
        }

        if (!this.view) {
            this.view = this.scrollView.node.getChildByName('view');
            if (!this.view) {
                cc.error('ScrollViewContent: view is null');
            }
        }

        if (!this.content) {
            this.content = this.view.getChildByName('content');
            if (!this.content) {
                cc.error('ScrollViewContent: content is null');
            }
        }
    }

    private autoAdjustDirection() {
        this.view.setContentSize(this.scrollView.node.getContentSize());
        this.content.setContentSize(this.view.getContentSize());

        if (this.type == cc.Scrollbar.Direction.VERTICAL) {
            this.scrollView.horizontal = false;
            this.scrollView.horizontalScrollBar = null;
            this.scrollView.vertical = true;
            this.scrollView.verticalScrollBar = this.scrollbar;

            this.scrollbar.direction = cc.Scrollbar.Direction.VERTICAL;
            if (this.scrollbar.node.height < this.scrollbar.node.width) {
                let scrollbarWidth = this.scrollbar.node.height;
                this.scrollbar.node.setContentSize(scrollbarWidth, this.scrollView.node.height);
            }

            let widget = this.scrollbar.getComponent(cc.Widget);
            widget.enabled = false;

            this.scrollbar.node.setAnchorPoint(1, 0.5);
            this.scrollbar.node.setPosition(
                this.scrollView.node.width * this.scrollView.node.anchorX,
                0);

            if (this.bar.height < this.bar.width)
                this.bar.setContentSize(this.bar.height, this.bar.width);
            this.bar.setAnchorPoint(1, 0);
            this.bar.setPosition(-(this.scrollbar.node.width - this.bar.width) / 2, 0);

            this.content.setAnchorPoint(0.5, 1);
            this.content.setPosition(0, this.content.height * this.view.anchorY);

        }
        else {
            this.scrollView.vertical = false;
            this.scrollView.verticalScrollBar = null;
            this.scrollView.horizontal = true;
            this.scrollView.horizontalScrollBar = this.scrollbar;

            this.scrollbar.direction = cc.Scrollbar.Direction.HORIZONTAL;
            if (this.scrollbar.node.height > this.scrollbar.node.width) {
                let scrollbarHeight = this.scrollbar.node.width;
                this.scrollbar.node.setContentSize(this.scrollView.node.width, scrollbarHeight);
            }

            let widget = this.scrollbar.getComponent(cc.Widget);
            widget.enabled = false;

            this.scrollbar.node.setAnchorPoint(0.5, 1);
            this.scrollbar.node.setPosition(
                0,
                -this.scrollView.node.height * this.scrollView.node.anchorY + this.scrollbar.node.height * this.scrollbar.node.anchorY);

            if (this.bar.width < this.bar.height)
                this.bar.setContentSize(this.bar.height, this.bar.width);
            this.bar.setContentSize(30, 10);
            this.bar.setAnchorPoint(0, 1);
            this.bar.setPosition(0, -(this.scrollbar.node.height - this.bar.height) / 2);

            this.content.setAnchorPoint(0, 0.5);
            this.content.setPosition(-this.content.width * this.view.anchorX, 0);
        }

        if (this.content.childrenCount > 0) {
            this.autoAdjustItemPosition(this.content, this.content.children);
        }

        this.autoAdjustScrollListDirection();
    }

    private autoAdjustItemPosition(content: cc.Node, items: cc.Node[]) {
        if (this.type == cc.Scrollbar.Direction.VERTICAL) {
            let topY = 0;
            for (let i = 0; i < items.length; i++) {
                let item = items[i];
                let itemY = topY + item.height * (item.anchorY - 1);
                topY = - item.height;
                item.setPosition(0 + (item.anchorX - 0.5) * item.width, itemY);
            }
        }
        else {
            let leftX = 0;
            for (let i = 0; i < items.length; i++) {
                let item = items[i];
                let itemX = leftX + item.width * item.anchorX;
                leftX = item.width;
                item.setPosition(itemX, 0 + (item.anchorY - 0.5) * item.height);
            }
        }
    }

    private autoAdjustScrollListDirection() {
        let listView = this.node.getComponent(ScrollListView);
        if (listView) {
            listView.direction = this.type;
        }
    }
}
