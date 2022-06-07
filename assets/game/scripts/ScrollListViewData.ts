// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import ScrollListView, { ScrollListViewEvent } from "../../core/ui/ScrollListView";
import ScrollViewDynamic from "../../core/ui/ScrollViewDynamic";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ScrollListViewData extends cc.Component {

    //#region Vertical
    @property(ScrollListView)
    private listView: ScrollListView = null;

    @property(cc.ScrollView)
    private scrollView: cc.ScrollView = null;

    @property([cc.Node])
    private itemTemplates: cc.Node[] = [];
    //#endregion    

    //#region Horizontal
    @property(cc.ScrollView)
    private hScrollView: cc.ScrollView = null;

    @property([cc.Node])
    private hItemTemplates: cc.Node[] = [];
    //#endregion

    //#region grid
    @property(cc.ScrollView)
    private gScrollView: cc.ScrollView = null;

    @property([cc.Node])
    private gItemTemplates: cc.Node[] = [];
    //#endregion

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start() {
        this.initScrollListView();
        this.initScrollView();

        this.initHScrollView();
        this.initGScrollView();
    }

    private _array: any[] = [];
    initScrollListView(){
        for (let i = 0; i < 500; i++) {
            this._array.push({
                type: i % 2 === 0 ? "a" : "b",
                title: "title " + i,
                content: "content " + i
            });
        }
        this.listView.initWithTemplate(this.onLoadEvent.bind(this), this.onUpdateItem.bind(this));
    }

    onLoadEvent(type: ScrollListViewEvent, index: number) {
        switch (type) {
            case ScrollListViewEvent.MORE:
                //cc.log("scroll load more");
                let retArray = [];
                if (index < 0) index = 0;
                else index++;
                for (let i = 0; i < 10; i++) {
                    retArray.push(this._array[index + i]);
                }
                return retArray;
                break;
            case ScrollListViewEvent.REFRESH:
                //cc.log("scroll load refresh");
                break;
        }

        return null;
    }

    onUpdateItem(item: cc.Node,
        data: { type: number | string, title, content },
        index: number) {

        let title = item.getChildByName("Title").getComponent(cc.Label);
        let content = item.getChildByName("Content").getComponent(cc.Label);
        title.string = data.title;
        content.string = data.content;

        let addButton = item.getChildByName("Add Button").getComponent(cc.Button);
        addButton.node.on(cc.Node.EventType.TOUCH_END, () => {
            // _array 数据需要添加一条数据
            let newData = { type: data.type, title: "title new " + data.type, content: "content new " + data.type };
            this._array.push(newData);
            // 刷新列表
            this.listView.insertItem(index, newData);
        }, this);
        let removeButton = item.getChildByName("Remove Button").getComponent(cc.Button);
        removeButton.node.on(cc.Node.EventType.TOUCH_END, () => {
            //cc.log("remove button click");
            // _array 数据需要删除一条数据
            this._array.splice(index, 1);
            // 刷新列表
            this.listView.removeItem(index);
        }, this);
    }

    initScrollView() {
        let onLoadMore = () => {
            let max = 500;
            let start = this.scrollView.content.children.length;
            for (let i = start; i < start + 10 && i < max; i++) {
                let item = cc.instantiate(this.itemTemplates[i % 2]);
                let title = item.getChildByName("Title").getComponent(cc.Label);
                let content = item.getChildByName("Content").getComponent(cc.Label);
                title.string = "title " + i;
                content.string = "content " + i;
                this.scrollView.content.addChild(item);
            }
        };
        onLoadMore();

        let scrollViewDynamic = this.scrollView.node.getComponent(ScrollViewDynamic);
        scrollViewDynamic.setPreloadMore(50, onLoadMore);
        scrollViewDynamic.refresh();
    }

    initHScrollView(){
        let onLoadMore = ()=>{
            let max = 500;
            let start = this.hScrollView.content.children.length;
            for (let i = start; i < start + 10 && i < max; i++) {
                let item = cc.instantiate(this.hItemTemplates[i % 2]);
                let title = item.getChildByName("Title").getComponent(cc.Label);
                let content = item.getChildByName("Content").getComponent(cc.Label);
                title.string = "title " + i;
                content.string = "content " + i;
                item.y = 0;
                this.hScrollView.content.addChild(item);
            }
        }
        onLoadMore();

        let scrollViewDynamic = this.hScrollView.node.getComponent(ScrollViewDynamic);
        scrollViewDynamic.setPreloadMore(50, onLoadMore);
        scrollViewDynamic.refresh();
    }

    initGScrollView(){
        let onLoadMore = (count = 10)=>{
            let max = 500;
            let start = this.gScrollView.content.children.length;
            for (let i = start; i < start + count && i < max; i++) {
                let item = cc.instantiate(this.gItemTemplates[i % 2]);
                let title = item.getChildByName("Title").getComponent(cc.Label);
                let content = item.getChildByName("Content").getComponent(cc.Label);
                title.string = "title " + i;
                content.string = "content " + i;
                item.y = 0;
                this.gScrollView.content.addChild(item);
            }
        }
        onLoadMore(30);

        let scrollViewDynamic = this.gScrollView.node.getComponent(ScrollViewDynamic);
        scrollViewDynamic.setPreloadMore(100, onLoadMore);
        scrollViewDynamic.refresh();
    }
}
