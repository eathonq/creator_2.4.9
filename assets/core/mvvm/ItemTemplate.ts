import DataContext from "./DataContext";
import ItemsSource from "./ItemsSource";

const { ccclass, property, executeInEditMode, menu } = cc._decorator;

/** UI 数据集合模板绑定组件 */
@ccclass
@executeInEditMode
@menu('mvvm/ItemTemplate')
export default class ItemTemplate extends DataContext {

    @property({
        tooltip: '关联数据\n (请搭ItemsSource使用)',
        readonly: true,
        visible() {
            return !this.global;
        },
        displayName: 'Data Context',
    })
    private relevancyContext = "";

    @property
    private _binding: string = "";
    @property({
        tooltip: '绑定路径',
        readonly: true,
    })
    get binding() {
        return this._binding;
    }
    private set binding(value: string) {
        this._binding = value;
    }

    onRestore() {
        this.checkEditorComponent();
    }

    protected onLoad() {
        if (!this.checkEditorComponent()) return;
        if (CC_EDITOR) return;
    }

    protected start() { }

    // update (dt) {}

    private findDataContext(node: cc.Node, maxLevel: number = 9): ItemsSource {
        let check = node;
        while (check && maxLevel > 0) {
            let context: ItemsSource = check.getComponent(ItemsSource);
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
        let context = this.findDataContext(this.node.parent);
        if (!context) {
            return false;
        }
        this.relevancyContext = context.tag;
        this.binding = this._index;
        this._path = `${this.relevancyContext}.${this.binding}`;
        this._property = this._path.split('.').slice(1).join('.');

        this.tag = this._path;

        context.setTemplate(this.node);

        return true;
    }

    private _index = '#';
    /**
     * 设置位置索引
     * @param index 
     */
    setIndex(index: number) {
        this._index = `${index}`;
    }
}
