import DataContext from "./DataContext";
import ItemTemplate from "./ItemTemplate";

const { ccclass, property, executeInEditMode, menu } = cc._decorator;

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
        let check = node;
        while (check && maxLevel > 0) {
            let context: DataContext = check.getComponent(DataContext);
            if (context) {
                return context;
            }
            check = check.parent;
            maxLevel--;
        }
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
            let context = this.findDataContext(this.node.parent);
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

        let content = this._template.parent;
        // 清理旧数据
        for (let i = 0; i < content.children.length; i++) {
            let item = content.children[i];
            if (item !== this._template) {
                item.destroy();
            }
        }
        this._template.active = false;

        // 添加新数据
       
        for (let i = 0; i < newVal.length; i++) {
            let item = cc.instantiate(this._template);
            let itemTemplate = item.getComponent(ItemTemplate);
            itemTemplate.setIndex(i);
            item.active = true;
            item.parent = content;
        }
    }

    private _template: cc.Node = null;
    setTemplate(template: cc.Node) {
        let itemTemplate = template.getComponent(ItemTemplate);
        if (!itemTemplate){
            cc.warn(`${template.name} must be a ItemTemplate`);
            return;
        }

        this._template = template;
    }
}