// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import ScrollViewDynamic from "../../core/ui/ScrollViewDynamic";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ScrollListViewData extends cc.Component {

    @property(cc.ScrollView)
    private scrollView: cc.ScrollView = null;

    @property(cc.ScrollView)
    private hScrollView: cc.ScrollView = null;

    @property(cc.ScrollView)
    private gScrollView: cc.ScrollView = null;

    @property(cc.Node)
    private templatesNode: cc.Node = null;

    @property(cc.EditBox)
    private gotoEditBox: cc.EditBox = null;

    private templates: cc.Node[] = [];

    // onLoad () {}

    protected start() {
        this.initTemplate();

        this.initScrollView();
        this.initHScrollView();
        this.initGScrollView();

        this.updateType(0);
    }

    private* infiniteLoadMore() {
        let max = 50;
        let start = this.scrollView.content.children.length;
        for (let i = start; i < start + 10 && i < max; i++) {
            let item = cc.instantiate(this.templates[i % 2]);
            let title = item.getChildByName("Title").getComponent(cc.Label);
            let content = item.getChildByName("Content").getComponent(cc.Label);
            title.string = "title " + i;
            content.string = "content " + i;
            this.scrollView.content.addChild(item);
            yield;
        }
    }

    private iterator = null;
    update(dt: number) {
        // 帧加载方案
        if (this.iterator) {
            let iterator = this.iterator;
            if (iterator.next().done) {
                this.iterator = null;
            }
        }
    }

    private initTemplate() {
        this.templates.push(...this.templatesNode.children);
    }

    private initScrollView() {
        // 普通加载方案
        // let onLoadMore = () => {
        //     let max = 500;
        //     let start = this.scrollView.content.children.length;
        //     for (let i = start; i < start + 10 && i < max; i++) {
        //         let item = cc.instantiate(this.templates[i % 2]);
        //         let title = item.getChildByName("Title").getComponent(cc.Label);
        //         let content = item.getChildByName("Content").getComponent(cc.Label);
        //         title.string = "title " + i;
        //         content.string = "content " + i;
        //         this.scrollView.content.addChild(item);
        //     }
        // };
        // onLoadMore();

        // 帧加载方案
        this.iterator = this.infiniteLoadMore();
        let scrollViewDynamic = this.scrollView.node.getComponent(ScrollViewDynamic);
        scrollViewDynamic.setPreloadMore(50, ()=>{
            this.iterator = this.infiniteLoadMore();
        });
        scrollViewDynamic.refresh();
    }

    private initHScrollView(){
        let onLoadMore = ()=>{
            let max = 500;
            let start = this.hScrollView.content.children.length;
            for (let i = start; i < start + 10 && i < max; i++) {
                let item = cc.instantiate(this.templates[i % 2 + 2]);
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

    private initGScrollView(){
        let onLoadMore = (count = 10)=>{
            let max = 500;
            let start = this.gScrollView.content.children.length;
            for (let i = start; i < start + count && i < max; i++) {
                let item = cc.instantiate(this.templates[i % 2 + 4]);
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

    private _type = -1;
    private updateType(type: number) {
        if (this._type === type) {
            return;
        }

        this._type = type;
        switch (type) {
            case 0:
                this.scrollView.node.active = true;
                this.hScrollView.node.active = false;
                this.gScrollView.node.active = false;
                break;
            case 1:
                this.hScrollView.node.active = true;
                this.scrollView.node.active = false;
                this.gScrollView.node.active = false;
                break;
            case 2:
                this.gScrollView.node.active = true;
                this.scrollView.node.active = false;
                this.hScrollView.node.active = false;
                break;
        }
    }

    onToggleEvent(toggle: cc.Toggle) {
        switch (toggle.name) {
            case "0<Toggle>":
                this.updateType(0);
                break;
            case "1<Toggle>":
                this.updateType(1);
                break;
            case "2<Toggle>":
                this.updateType(2);
                break;
        }
    }

    onGotoEvent(event: Event, customEventData: string) {
        let index = parseInt(this.gotoEditBox.string);
        if (isNaN(index)) {
            index = 0;
        }
        switch (this._type) {
            case 0:
                this.scrollView.node.getComponent(ScrollViewDynamic).scrollTo(index);
                break;
            case 1:
                this.hScrollView.node.getComponent(ScrollViewDynamic).scrollTo(index);
                break;
            case 2:
                this.gScrollView.node.getComponent(ScrollViewDynamic).scrollTo(index);
                break;
        }
    }
}
