const { ccclass, property, executeInEditMode, menu } = cc._decorator;

/** 滚动视图列表加载类型枚举 */
export enum ScrollListViewEvent {
    /** 刷新加载 */
    REFRESH,
    /** 加载更多 */
    MORE,
    // /** 上一个数据 */
    // PREVIOUS,
    // /** 下一个数据 */
    // NEXT,
}

/** 滚动视图列表项信息 */
class ScrollListViewInfo {
    item: cc.Node;

    /** 单位位置索引(从0开始) */
    unitIndex: number;
    ptx: number;
    pty: number;
    size: cc.Size;
    anchorX: number;
    anchorY: number;
}

@ccclass("ScrollListViewTemplateData")
export class ScrollListViewTemplateData {
    @property({
        tooltip: "模版类型",
    })
    type: string = "";
    @property({
        type: cc.Node,
        tooltip: "模版类型",
    })
    template: cc.Node = null;
}

/** 滚动视图列表项加载管理 */
class ScrollListViewItemManager {
    private _isTemplate = false;
    private itemPoolMap: Map<string, cc.NodePool>;
    private itemTemplateMap: Map<string, cc.Node>;
    private itemTemplateNameTypeMap: Map<string, string>;
    private itemDataList: any[] = [];

    constructor(initWithTemplate: boolean,
        onLoadEvent: (type: ScrollListViewEvent, index: number) => any[],
        onLoadItem: (index: number) => cc.Node,
        onUnloadItem: (item: cc.Node, index: number) => void = null,
        onUpdateItem: (item: cc.Node, data: any, index: number) => void) {

        this._isTemplate = initWithTemplate;
        this._onLoadEvent = onLoadEvent;
        this._onLoadItem = onLoadItem;
        this._onUnloadItem = onUnloadItem;
        this._onUpdateItem = onUpdateItem;
        this.itemPoolMap = new Map<string, cc.NodePool>();
        this.itemTemplateMap = new Map<string, cc.Node>();
        this.itemTemplateNameTypeMap = new Map<string, string>();
        this.itemDataList = [];
    }

    dispose() {
        this.itemPoolMap.forEach((pool, type) => {
            pool.clear();
        });
        this.itemPoolMap.clear();
        this.itemTemplateMap.clear();
        this.itemTemplateNameTypeMap.clear();
        this.itemDataList.length = 0;
    }

    private _onLoadEvent: (type: ScrollListViewEvent, index: number) => any[];
    private _onLoadItem: (index: number) => cc.Node;
    private _onUnloadItem: (item: cc.Node, index: number) => void = null;
    private _onUpdateItem: (item: cc.Node, data: any, index: number) => void;

    getItemType(item: cc.Node): string {
        return this.itemTemplateNameTypeMap.get(item.name);
    }

    resetData() {
        this.itemDataList.length = 0;
    }

    refresh() {
        this._onLoadEvent(ScrollListViewEvent.REFRESH, 0);
    }

    setTemplate(templates: ScrollListViewTemplateData[]): void {
        this.itemTemplateMap = new Map<string, cc.Node>();
        this.itemPoolMap = new Map<string, cc.NodePool>();
        for (let i = 0; i < templates.length; i++) {
            let item = templates[i];

            let type: string = item.type;
            this.itemTemplateMap.set(type, item.template);
            this.itemTemplateNameTypeMap.set(item.template.name, type);

            let pool = new cc.NodePool('myTemplate_' + type);
            this.itemPoolMap.set(type, pool);
        }
    }

    loadMore(lastIndex: number): cc.Node[] {
        let items = this._onLoadEvent(ScrollListViewEvent.MORE, lastIndex);
        // 添加数据
        if (this._isTemplate) {
            let index = lastIndex + 1;
            let nodeList: cc.Node[] = [];
            for (let i = 0; i < items.length; i++) {
                let itemData = items[i];
                if (!itemData) continue;
                let type: string = String(itemData.type);
                if (type && this.itemTemplateMap.has(type)) {
                    this.itemDataList.push(itemData);
                    let node = this.loadItem(index + i);
                    nodeList.push(node);
                }
            }
            return nodeList;
        }
        else {
            return items;
        }
    }

    loadItem(index: number): cc.Node {
        //console.log("loadItem index:" + index);

        if (this._isTemplate) {
            let itemData = this.itemDataList[index];
            if (!itemData) return null;

            let type = String(itemData.type);
            let newItem = this.itemPoolMap.get(type).get();
            if (!newItem) {
                newItem = cc.instantiate(this.itemTemplateMap.get(type));
            }
            newItem.active = true;

            if (this._onUpdateItem) {
                this._onUpdateItem(newItem, itemData, index);
            }

            return newItem;
        }
        else {
            if (this._onLoadItem)
                return this._onLoadItem(index);
        }
    }

    unloadItem(index: number, item: cc.Node): void {
        //console.log("unloadItem index:" + index);

        if (this._isTemplate) {
            let type: string = this.itemTemplateNameTypeMap.get(item.name);
            if (type) {
                this.itemPoolMap.get(type).put(item);
            }
        }
        else {
            if (this._onUnloadItem)
                this._onUnloadItem(item, index);
            else {
                item.removeFromParent();
            }
        }
    }

    updateItem(index: number, currentItem: cc.Node, newItem: cc.Node | any): cc.Node {
        if (newItem instanceof cc.Node) {
            newItem.setPosition(currentItem.position);
            newItem.parent = currentItem.parent;
            if (this._onUnloadItem)
                this._onUnloadItem(currentItem, index);
            else
                currentItem.removeFromParent();
            return newItem;
        }
        else {
            // 仅更新数据
            if (!currentItem) {
                this.itemDataList[index] = newItem;
                return null;
            }

            if (!newItem) {
                newItem = this.itemDataList[index];
                if (!newItem) return null;
            }
            else {
                this.itemDataList[index] = newItem;
            }

            // 模版变换
            let newType: string = String(newItem.type);
            if (newType != this.getItemType(currentItem)) {
                let newItem = this.loadItem(index);
                newItem.setPosition(currentItem.position);
                newItem.parent = currentItem.parent;
                this.unloadItem(index, currentItem);
                return newItem;
            }

            // 更新
            if (this._onUpdateItem)
                this._onUpdateItem(currentItem, newItem, index);

            return currentItem;
        }
    }

    updateItemData(index: number, data: any): void {
        this.itemDataList[index] = data;
    }

    insertItem(index: number, newItem: cc.Node | { type: number | string }): cc.Node {
        if (newItem instanceof cc.Node) {
            return newItem;
        }
        else {
            let type: string = String(newItem.type);
            if (type && this.itemTemplateMap.has(type)) {
                this.itemDataList.splice(index, 0, newItem);
                let node = this.loadItem(index);
                return node;
            }
        }
    }

    removeItem(index: number, item: cc.Node): void {
        this.unloadItem(index, item);
        this.itemDataList.splice(index, 1);
    }
}

/** 滚动视图列表管理 */
@ccclass
@executeInEditMode
@menu('ui/ScrollListView')
export default class ScrollListView extends cc.Component {

    //#region 组件属性
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
        tooltip: '滚动检测单元(值越小检测频率越高)',
    })
    scrollUnit = 50;

    @property({
        type: cc.Integer, min: 1, step: 1,
        tooltip: '预加载滚动检测单元数量(值越大提前判断越早)',
    })
    preloadScrollUnitCount: number = 1;

    @property({
        min: 0,
        visible: function () { return this.direction === cc.Scrollbar.Direction.HORIZONTAL; }
    })
    paddingLeft: number = 0;
    @property({
        min: 0,
        visible: function () { return this.direction === cc.Scrollbar.Direction.HORIZONTAL; }
    })
    paddingRight: number = 0;

    @property({
        min: 0,
        tooltip: "相邻子节点之间水平间距",
        visible: function () { return this.direction === cc.Scrollbar.Direction.HORIZONTAL; }
    })
    spacingX: number = 0;

    @property({
        min: 0,
        visible: function () { return this.direction === cc.Scrollbar.Direction.VERTICAL; }
    })
    paddingTop: number = 0;
    @property({
        min: 0,
        visible: function () { return this.direction === cc.Scrollbar.Direction.VERTICAL; }
    })
    paddingBottom: number = 0;

    @property({
        min: 0,
        tooltip: "相邻子节点之间垂直间距",
        visible: function () { return this.direction === cc.Scrollbar.Direction.VERTICAL; }
    })
    spacingY: number = 0;

    @property({
        type: [ScrollListViewTemplateData],
        tooltip: '模版数据',
    })
    itemTemplates: ScrollListViewTemplateData[] = [];
    //#endregion

    /** 内容项信息保存列表 */
    private itemInfoList: ScrollListViewInfo[] = [];
    /** 项加载管理 */
    private itemLoadManager: ScrollListViewItemManager = null;

    onRestore(): void {
        this.checkEditorComponents();
    }

    protected onLoad(): void {
        //super.onLoad();
        this.checkEditorComponents();
    }

    protected start(): void {
    }

    protected onDestroy(): void {
        this.itemLoadManager?.dispose();
    }

    private checkEditorComponents(): void {
        if (!this.scrollView) {
            this.scrollView = this.node.getComponent(cc.ScrollView);
            if (!this.scrollView) {
                cc.error('ScrollViewContent: scrollView is null');
            }
        }

        if (!this.view) {
            this.view = this.scrollView.node.getChildByName('view');
            if (!this.view) {
                cc.error('ScrollViewContent: view is null');
            }

            this.view.setContentSize(this.scrollView.node.getContentSize());
        }

        if (!this.content) {
            this.content = this.view.getChildByName('content');
            if (!this.content) {
                cc.error('ScrollViewContent: content is null');
            }

            this.content.setContentSize(this.view.getContentSize());
        }

        if (this.itemTemplates.length == 0 && this.content.childrenCount > 0) {
            for (let i = 0; i < this.content.childrenCount; i++) {
                let templateData = new ScrollListViewTemplateData();
                templateData.template = this.content.children[i];
                templateData.type = this.content.children[i].name;
                this.itemTemplates.push(templateData);
            }
        }

        this.direction = this.scrollView.vertical ? cc.Scrollbar.Direction.VERTICAL : cc.Scrollbar.Direction.HORIZONTAL;
    }

    /** 
     * 初始化
     @param onLoadEvent 加载事件回调（index 当前事件项位置索引，-1表示无内容项）
     @param onLoadItem 加载项通知回调
     @param onUnloadItem 卸载项通知(可选,默认为移除节点)回调
     */
    init(onLoadEvent: (type: ScrollListViewEvent, index: number) => any[],
        onLoadItem: (index: number) => cc.Node,
        onUnloadItem?: (item: cc.Node, index: number) => void
    ): void {

        let noticeItem = new ScrollListViewItemManager(false, onLoadEvent, onLoadItem, onUnloadItem, null);
        this.itemLoadManager = noticeItem;

        this.initBase();
    }

    /** 
     * 初始化(使用模版数据回调)
     @param onLoadEvent 加载事件回调（index 当前事件项位置索引，-1表示无内容项）
     @param onUpdateItem 更新节点通知回调
     @param templates 模版数据(可选,默认使用编辑器上面的模版数据)回调
     */
    initWithTemplate(onLoadEvent: (type: ScrollListViewEvent, index: number) => { type: number | string }[],
        onUpdateItem: (item: cc.Node, data: { type: number | string }, index: number) => void,
        templates?: ScrollListViewTemplateData[]
    ): void {

        let noticeItem = new ScrollListViewItemManager(true, onLoadEvent, null, null, onUpdateItem);
        this.itemLoadManager = noticeItem;
        if (templates) {
            //noticeItem.setTemplate(templates);
            this.itemTemplates = templates;
        }
        noticeItem.setTemplate(this.itemTemplates);

        this.initBase();
    }

    /** 重置滚动视图列表 */
    resetItems() {
        this.itemInfoList = [];
        //this.content.removeAllChildren(); // 这个方法为清理内容
        let children = this.content.children;
        for (let i = 0; i < children.length; i++) {
            children[i].destroy();
        }
        this.itemLoadManager.resetData();

        // 默认触发加载
        this.loadMoreDataWithAsync();
    }

    /**
     * 数据更新
     @param index 内容节点索引
     @param item 内容节点数据
     */
    updateItem(index: number, item: cc.Node | { type: number | string }): void {
        if (index < 0 || index >= this.itemInfoList.length) {
            console.log(`ScrollViewContent: updateItem index out of range ${index}`);
            return;
        }

        let info = this.itemInfoList[index];
        if (!info) return;
        if (!info.item) return;

        // 节点有可能被修改，这里需要重置
        info.item = this.itemLoadManager.updateItem(index, info.item, item);
    }

    /**
     * 从指定位置插入项
     * @param index 插入位置
     * @param item 插入项
     * @returns 
     */
    insertItem(index: number, item: cc.Node | any) {
        if (index < 0 || index >= this.itemInfoList.length) {
            console.log(`ScrollViewContent: updateItem index out of range ${index}`);
            return;
        }

        let newItem = this.itemLoadManager.insertItem(index, item);
        if (!newItem) return;

        this.insertContentNewItem(index, newItem);
    }

    /**
     * 删除指定位置的项
     * @param index 删除位置
     * @returns 
     */
    removeItem(index: number) {
        if (index < 0 || index >= this.itemInfoList.length) {
            console.log(`ScrollViewContent: updateItem index out of range ${index}`);
            return;
        }

        let info = this.itemInfoList[index];
        if (!info) return;
        if (!info.item) return;

        this.itemLoadManager.removeItem(index, info.item);
        this.removeContentItem(index);
    }

    private _viewUnit: number = 0;
    private initBase() {
        // 初始化数据
        this.content.removeAllChildren();

        // 禁用layout
        let layout = this.content.getComponent(cc.Layout);
        if (layout) {
            layout.enabled = false;
        }

        this.direction = this.scrollView.vertical ? cc.Scrollbar.Direction.VERTICAL : cc.Scrollbar.Direction.HORIZONTAL;

        // 方法注册
        if (this.direction == cc.Scrollbar.Direction.VERTICAL) {
            this.scrollView.node.on('scroll-to-top', this.onScrollToRefresh, this);
            this.scrollView.node.on('scroll-to-bottom', this.onScrollToLoadMore, this);
            this.scrollView.node.on('scrolling', this.onScrollingWithVertical, this);
            this._viewUnit = Math.ceil(this.scrollView.node.height / this.scrollUnit);
        }
        else {
            this.scrollView.node.on('scroll-to-left', this.onScrollToRefresh, this);
            this.scrollView.node.on('scroll-to-right', this.onScrollToLoadMore, this);
            this.scrollView.node.on('scrolling', this.onScrollingWithHorizontal, this);
            this._viewUnit = Math.ceil(this.scrollView.node.width / this.scrollUnit);
        }

        // 初始化完成，加载更多数据
        this.loadMoreDataWithAsync();
    }

    private onScrollToRefresh(scrollView: cc.ScrollView) {
        this.itemLoadManager.refresh();
    }

    private onScrollToLoadMore(scrollView: cc.ScrollView) {
        // console.log('ScrollListView onScrollToLoadMore');

        // 这里修改为 onScrolling 判断加载
        // this.itemLoadManager.onLoad(ScrollListViewLoad.MORE, this.itemInfoList.length - 1);
    }

    private _offsetYUnit = 0;
    private onScrollingWithVertical(scrollView: cc.ScrollView) {
        let offsetYUnit = Math.floor(scrollView.getScrollOffset().y / this.scrollUnit);

        // 单元滚动通知
        if (offsetYUnit != this._offsetYUnit) {
            if (offsetYUnit < 0) return;
            if (offsetYUnit > scrollView.content.height / this.scrollUnit) return;

            this._offsetYUnit = offsetYUnit;
            this.refreshScrollItem();

            // 判断是否加载更多
            let checkLoadUnit = Math.floor(this.content.height / this.scrollUnit) - this.preloadScrollUnitCount - this._viewUnit;
            if (offsetYUnit >= checkLoadUnit) {
                // 判断是否有更多数据
                this.loadMoreDataWithAsync();
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
            this.refreshScrollItem();

            // 判断是否加载更多
            let checkLoadUnit = Math.floor(this.content.width / this.scrollUnit) - this.preloadScrollUnitCount - this._viewUnit;
            if (offsetXUnit >= checkLoadUnit) {
                // 判断是否有更多数据
                this.loadMoreDataWithAsync();
            }
        }
    }

    private _isRefreshScrollItem = false;
    /** 刷新滚动节点(保持渲染节点数量) */
    private async refreshScrollItem(): Promise<void> {

        if (this._isRefreshScrollItem) return;
        this._isRefreshScrollItem = true;

        let unitViewEnd = 0;
        let unitViewBegin = 0;
        if (this.direction == cc.Scrollbar.Direction.VERTICAL) {
            // 可视范围 0 ~ viewUnit
            unitViewEnd = this._offsetYUnit + this._viewUnit + this.preloadScrollUnitCount;
            unitViewBegin = this._offsetYUnit - this.preloadScrollUnitCount;
        }
        else {
            // 可视范围 0 ~ viewUnit
            unitViewEnd = this._offsetXUnit + this._viewUnit + this.preloadScrollUnitCount;
            unitViewBegin = this._offsetXUnit - this.preloadScrollUnitCount;
        }

        for (let i = 0; i < this.itemInfoList.length; i++) {
            let itemInfo = this.itemInfoList[i];
            if (itemInfo.unitIndex >= unitViewBegin && itemInfo.unitIndex <= unitViewEnd) {
                // 判断是否已经加载
                if (!itemInfo.item) {
                    itemInfo.item = this.itemLoadManager.loadItem(i);
                    itemInfo.item.setPosition(itemInfo.ptx, itemInfo.pty);
                    this.content.addChild(itemInfo.item);
                }
            }
            else {
                // 释放内容项
                if (itemInfo.item) {
                    this.itemLoadManager.unloadItem(i, itemInfo.item);
                    itemInfo.item = null;
                }
            }
        }

        this._isRefreshScrollItem = false;
    }

    private isLoading = false;
    /** 加载更多数据 */
    private async loadMoreDataWithAsync(): Promise<void> {
        if (this.isLoading) return;
        this.isLoading = true;

        let lastIndex = this.itemInfoList.length - 1;
        let items = this.itemLoadManager.loadMore(lastIndex);
        if (items && items.length > 0) {
            for (let i = 0; i < items.length; i++) {
                this.pushContentNewItem(items[i]);
            }
        }

        this.isLoading = false;
    }

    /** 创建内容项信息(更新容器大小) */
    private pushContentNewItem(item: cc.Node): void {
        // 计算位置,并重新调整内容大小
        let lastInfo = this.itemInfoList[this.itemInfoList.length - 1];
        let unitIndex = 0;
        if (this.direction == cc.Scrollbar.Direction.VERTICAL) {
            if (lastInfo) {
                let ptY = -lastInfo.pty + lastInfo.size.height * lastInfo.anchorY + item.height * item.anchorY + this.spacingY;
                let maxY = ptY + item.height * (1 - item.anchorY) + this.paddingBottom;
                if (maxY != this.content.height) {
                    this.content.height = maxY;
                }

                item.position = cc.v3(0, - ptY);
            }
            else {
                item.position = cc.v3(0, -item.height * item.anchorY - this.paddingTop);
            }

            unitIndex = Math.floor((-item.position.y - item.height * item.anchorY) / this.scrollUnit);
        }
        else {
            if (lastInfo) {
                let ptX = lastInfo.ptx + lastInfo.size.width * lastInfo.anchorX + item.width * item.anchorX + this.spacingX;
                let maxX = ptX + item.width * (1 - item.anchorX) + this.paddingRight;
                if (maxX != this.content.width) {
                    this.content.width = maxX;
                }

                item.position = cc.v3(ptX, 0);
            }
            else {
                item.position = cc.v3(item.width * item.anchorX + this.paddingLeft, 0);
            }

            unitIndex = Math.floor((item.position.x - item.width * item.anchorX) / this.scrollUnit);
        }

        // 创建内容项信息
        let itemInfo = new ScrollListViewInfo();
        itemInfo.unitIndex = unitIndex;
        itemInfo.item = item;
        itemInfo.ptx = item.position.x;
        itemInfo.pty = item.position.y;
        itemInfo.size = item.getContentSize();
        itemInfo.anchorX = item.anchorX;
        itemInfo.anchorY = item.anchorY;
        this.itemInfoList.push(itemInfo);

        this.content.addChild(item);
    }

    /** 插入内容项(更新容器大小) */
    private insertContentNewItem(index: number, item: cc.Node): void {
        if (index < 0 || index > this.itemInfoList.length) return;
        // 计算位置,并重新调整内容大小
        let insertInfo = index > 0 ? this.itemInfoList[index - 1] : null;
        let unitIndex = 0;
        if (this.direction == cc.Scrollbar.Direction.VERTICAL) {
            if (insertInfo) {
                let ptY = -insertInfo.pty + insertInfo.size.height * insertInfo.anchorY + item.height * item.anchorY + this.spacingY;
                item.position = cc.v3(0, - ptY);
            }
            else {
                item.position = cc.v3(0, -item.height * item.anchorY - this.paddingTop);
            }

            unitIndex = (-item.position.y - item.height * item.anchorY) / this.scrollUnit;
        }
        else {
            if (insertInfo) {
                let ptX = insertInfo.ptx + insertInfo.size.width * insertInfo.anchorX + item.width * item.anchorX + this.spacingX;
                item.position = cc.v3(ptX, 0);
            }
            else {
                item.position = cc.v3(item.width * item.anchorX + this.paddingLeft, 0);
            }

            unitIndex = (item.position.x - item.width * item.anchorX) / this.scrollUnit;
        }

        // 创建内容项信息
        let itemInfo = new ScrollListViewInfo();
        itemInfo.unitIndex = unitIndex;
        itemInfo.item = item;
        itemInfo.ptx = item.position.x;
        itemInfo.pty = item.position.y;
        itemInfo.size = item.getContentSize();
        itemInfo.anchorX = item.anchorX;
        itemInfo.anchorY = item.anchorY;
        this.itemInfoList.splice(index, 0, itemInfo);

        this.content.addChild(item);

        // 重新调整其它内容项位置
        this.offsetBeginItem(index);

        // 重新调整容器大小
        if (this.direction == cc.Scrollbar.Direction.VERTICAL) {
            let lastInfo = this.itemInfoList[this.itemInfoList.length - 1];
            let maxY = -lastInfo.pty + lastInfo.size.height * (1 - lastInfo.anchorY) + this.paddingBottom;
            if (maxY != this.content.height) {
                this.content.height = maxY;
            }
        }
        else {
            let lastInfo = this.itemInfoList[this.itemInfoList.length - 1];
            let maxX = lastInfo.ptx + lastInfo.size.width * (1 - lastInfo.anchorX) + this.paddingRight;
            if (maxX != this.content.width) {
                this.content.width = maxX;
            }
        }
    }

    /** 删除内容项(更新容器大小) */
    private removeContentItem(index: number): void {
        // 重新调整其它内容项位置
        this.offsetBeginItem(index, false);

        this.itemInfoList.splice(index, 1);

        // 重新调整容器大小
        if (this.direction == cc.Scrollbar.Direction.VERTICAL) {
            let lastInfo = this.itemInfoList[this.itemInfoList.length - 1];
            let maxY = -lastInfo.pty + lastInfo.size.height * (1 - lastInfo.anchorY) + this.paddingBottom;
            if (maxY != this.content.height) {
                this.content.height = maxY;
            }
        }
        else {
            let lastInfo = this.itemInfoList[this.itemInfoList.length - 1];
            let maxX = lastInfo.ptx + lastInfo.size.width * (1 - lastInfo.anchorX) + this.paddingRight;
            if (maxX != this.content.width) {
                this.content.width = maxX;
            }
        }
    }

    /** 重新调整后续节点位置 */
    private offsetBeginItem(index: number, isAdd = true): void {
        let tagItem = this.itemInfoList[index].item;
        // 重新调整后续节点位置
        for (let i = index + 1; i < this.itemInfoList.length; i++) {
            let info = this.itemInfoList[i];
            if (!info) continue;

            if (this.direction == cc.Scrollbar.Direction.VERTICAL) {
                let offset = tagItem.height + this.spacingY;
                if (!isAdd)
                    offset = -offset;
                info.pty -= offset;
                info.unitIndex = (-info.pty - info.size.height * info.anchorY) / this.scrollUnit;
                if (info.item) {
                    info.item.y -= offset;
                }
            }
            else {
                let offset = tagItem.width + this.spacingX;
                if (!isAdd)
                    offset = -offset;
                info.ptx += offset;
                info.unitIndex = (info.ptx - info.size.width * info.anchorX) / this.scrollUnit;
                if (info.item) {
                    info.item.x += offset;
                }
            }
        }
    }
}