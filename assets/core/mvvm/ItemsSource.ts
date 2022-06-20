/**
 * CREATOR_2.4.9
 * DateTime = Mon Jun 20 2022 14:07:32 GMT+0800 (中国标准时间)
 * Author = eathon
 * github = https://github.com/eathonq/creator_2.4.9.git
 * email = vangagh@live.cn
 */

import DataContext from "./DataContext";
import ItemTemplate from "./ItemTemplate";

const { ccclass, property, executeInEditMode, menu } = cc._decorator;

let getNodePath = (node: cc.Node) => {
    let nodePath = [];
    let check = node;
    while (check) {
        nodePath.splice(0, 0, check.name);
        check = check.parent;
    }
    return nodePath.join('/');
}

/** UI 数据集合绑定组件 */
@ccclass
@executeInEditMode
@menu('mvvm/ItemsSource')
export default class ItemsSource extends DataContext {

    @property
    private _global = false;
    @property({
        tooltip: '使用全局上下文',
    })
    get global() {
        return this._global;
    }
    private set global(value: boolean) {
        this._global = value;
        this.checkEditorComponent();
    }

    @property({
        tooltip: '关联上下文',
        readonly: true,
        visible() {
            return !this.global;
        },
        displayName: 'Data Context',
    })
    private relevancyContext = "";

    @property
    private _binding = "";
    @property({
        tooltip: '绑定路径',
    })
    get binding() {
        return this._binding;
    }
    set binding(value: string) {
        this._binding = value;
        this.checkEditorComponent();
    }

    onRestore() {
        this.checkEditorComponent();
    }

    protected onLoad() {
        if (!this.checkEditorComponent()) return;
        if (CC_EDITOR) return;

        DataContext.bind(this._path, this.onDataChange, this);
    }

    protected start() { }

    // update (dt) {}

    private findDataContext(node: cc.Node, maxLevel: number = 9): DataContext {
        // 从父节点开始查找
        let check = node.parent;
        while (check && maxLevel > 0) {
            let context: DataContext = check.getComponent(DataContext);
            if (context) {
                return context;
            }
            check = check.parent;
            maxLevel--;
        }

        cc.warn(`path:${getNodePath(node)} `,`组件 ItemsSource `, '找不到 DataContext');
        return null;
    }

    /** 绑定路径 */
    private _path = '';
    /** 绑定属性 */
    private _property = '';
    private checkEditorComponent() {
        if (this.global) {
            this._path = this._binding;
        }
        else {
            let context = this.findDataContext(this.node);
            if (!context) {
                return false;
            }
            this.relevancyContext = context.tag;
            this._path = `${this.relevancyContext}.${this._binding}`;
        }
        this._property = this._path.split('.').slice(1).join('.');

        this.tag = this._path;
        return true;
    }

    private onDataChange(newVal: any, oldVal: any, pathArray: string[]) {
        if (CC_EDITOR) return;

        if (Object.prototype.toString.call(newVal) !== '[object Array]') {
            return;
        }

        let path = pathArray.join('.');
        if (path !== this._property) {
            return;
        }

        if (!this._template) {
            return;
        }

        let content = this._content;
        // 清空内容
        let child = content.children;
        for (let i = child.length - 1; i >= 0; i--) {
            let item = child[i];
            this._pool.put(item);
        }
        // 添加新内容
        for (let i = 0; i < newVal.length; i++) {
            let item = this._pool.get();
            if (!item) {
                item = cc.instantiate(this._template);
            }
            let itemTemplate = item.getComponent(ItemTemplate);
            itemTemplate.setIndex(i);
            item.active = true;
            content.addChild(item);
        }
    }

    private _content:cc.Node = null;
    private _template: cc.Node = null;
    private _pool = null;
    setTemplate(template: cc.Node) {
        if (CC_EDITOR) return;
        if (this._template) return;

        let itemTemplate = template.getComponent(ItemTemplate);
        if (!itemTemplate) {
            cc.warn(`${template.name} must be a ItemTemplate`);
            return;
        }

        if(!this._pool){
            this._pool = new cc.NodePool(`${this.tag}`);
        }

        this._template = template;
        this._template.active = false;
        this._content = template.parent;
        this._pool.put(template);
    }
}