/**
 * CREATOR_2.4.9
 * DateTime = Sun May 01 2022 13:11:17 GMT+0800 (中国标准时间)
 * Author = eathon
 * github = https://github.com/eathonq/creator_2.4.9.git
 * email = vangagh@live.cn
 */

import ViewBase, { ViewEvent, ViewState, ViewType } from "./ViewBase";

const { ccclass, property, executeInEditMode, menu } = cc._decorator;

/** 视图数据 */
class ViewData {
    constructor(viewBase: ViewBase, isCreate: boolean, doClose?: Function) {
        this.viewBase = viewBase;
        this.isCreate = isCreate;

        if (doClose) {
            this.viewBase['_doClose'] = doClose;
        }
    }

    get viewName() {
        return this.viewBase.viewName;
    }

    /** 视图基础数据 */
    private viewBase: ViewBase = null;

    /** 新创建标识 */
    private isCreate: boolean = false;

    /**
     * 显示视图
     * @param data 数据
     */
    show(data?: any) {
        this.viewBase.node.active = true;
        this.viewBase.node.emit(ViewEvent, ViewState.Show, data);
    }

    /**
     * 隐藏视图
     */
    hide() {
        this.viewBase.node.emit(ViewEvent, ViewState.Hide);
        this.viewBase.node.active = false;
    }

    /**
     * 关闭视图
     */
    close() {
        this.viewBase.node.emit(ViewEvent, ViewState.Close);
        this.viewBase.node.active = false;
        if (this.isCreate) {
            this.viewBase.node.destroy();
        }
        this.viewBase = null;
    }

    /**
     * 数据通知
     * @param data 数据
     */
    data(data?: any) {
        this.viewBase.node.emit(ViewEvent, ViewState.Data, data);
    }
}

class DialogList {
    private dialogList: ViewData[] = [];

    getViewData(name: string): ViewData {
        return this.dialogList.find(v => v.viewName === name);
    }

    push(viewData: ViewData, data?: any) {
        if (!viewData) return;

        viewData.show(data);
        this.dialogList.push(viewData);
    }

    pop(view: ViewData) {
        if (!view) return;

        view.close();
        this.dialogList.splice(this.dialogList.indexOf(view), 1);
    }
}

class TooltipList {
    private tooltipList: ViewData[] = [];

    getViewData(name: string): ViewData {
        return this.tooltipList.find(v => v.viewName === name);
    }

    push(viewData: ViewData, data?: any) {
        if (!viewData) return;

        viewData.show(data);
        this.tooltipList.push(viewData);
    }

    pop(view: ViewData) {
        if (!view) return;

        view.close();
        this.tooltipList.splice(this.tooltipList.indexOf(view), 1);
    }
}

/** 视图栈(先进后出) */
class ViewStack {

    private viewList: ViewData[] = [];

    getViewData(name: string): ViewData {
        return this.viewList.find(v => v.viewName === name);
    }

    /**
     * 添加到栈顶
     * @param viewData 视图信息
     * @param data 数据
     */
    push(viewData: ViewData, data?: any): void {
        if (!viewData) return;

        // 关闭当前视图
        if (this.viewList.length > 0) {
            let current = this.viewList[this.viewList.length - 1];
            current.hide();
        }

        // 添加到栈顶并显示
        viewData.show(data);
        this.viewList.push(viewData);
    }

    /**
     * 弹出栈顶
     * @param name 视图名称
     */
    pop(name?: string) {
        // 后退当前一个视图
        if (!name) {
            if (this.viewList.length >= 2) {
                let viewData = this.viewList[this.viewList.length - 2];
                viewData.show();
            }

            // 最后一个视图不需要关闭
            if (this.viewList.length > 1) {
                let closeView = this.viewList.pop();
                closeView.close();
            }
        }
        // 视图以及后面的所有视图都退出
        else {
            let index = this.viewList.findIndex(v => v.viewName === name);
            if (index >= 0) {
                if (index - 1 >= 0) {
                    let viewData = this.viewList[index - 1];
                    viewData.show();
                }

                // 最后一个视图不需要关闭
                while (this.viewList.length > index && this.viewList.length > 1) {
                    let closeView = this.viewList.pop();
                    closeView.close();
                }
            }
        }
    }

    /** 
     * 弹出直到某个视图
     * @param name 视图名称
     * @param data 数据
     */
    popTo(name: string, data?: any): boolean {
        if (!name) return false;

        let index = this.viewList.findIndex(v => v.viewName === name);
        if (index >= 0) {

            // 最后一个视图不需要关闭
            if (this.viewList.length == 1) return true;

            let viewData = this.viewList[index];
            viewData.show(data);

            while (this.viewList.length > index + 1) {
                let closeView = this.viewList.pop();
                closeView.close();
            }
            return true;
        }

        return false;
    }

    /**
     * 移除某个视图
     * @param name 视图名称
     */
    remove(name: string) {
        if (this.viewList.length == 1) return;

        let index = this.viewList.findIndex(v => v.viewName === name);
        if (index >= 0) {
            if (index = this.viewList.length - 1) return this.pop();

            let closeViews = this.viewList.splice(index, 1);
            closeViews[0].close();
        }
    }
}

/** 视图管理 */
@ccclass
@executeInEditMode
@menu('common/ViewManager')
export default class ViewManager extends cc.Component {
    //#region instance
    private static _instance: ViewManager = null;
    static get instance(): ViewManager {
        if (this._instance == null) {
            let scene = cc.director.getScene();
            if (!scene) return null;
            this._instance = scene.getComponentInChildren(ViewManager);
            if (this._instance == null) {
                console.log("ViewManager is not found in scene");
                let newNode = new cc.Node("ViewManager");
                scene.addChild(newNode);
                this._instance = newNode.addComponent(ViewManager);
            }
            cc.game.addPersistRootNode(this._instance.node);
        }
        return this._instance;
    }
    //#endregion

    //#region 编辑字段
    @property({
        type: cc.Node,
        tooltip: "视图内容节点"
    })
    private viewContent: cc.Node = null;

    @property({
        tooltip: "默认视图",
        readonly: false
    })
    private defaultView: string = "";

    @property({
        tooltip: "默认视图",
        readonly: false
    })
    private defaultDialog: string = "";

    @property({
        tooltip: "默认视图",
        readonly: false
    })
    private defaultTooltip: string = "";

    @property({
        type: [cc.Prefab]
    })
    private _viewPrefabList: cc.Prefab[] = [];
    @property({
        type: [cc.Prefab],
        tooltip: "视图预制体列表"
    })
    get viewPrefabList(): cc.Prefab[] {
        return this._viewPrefabList;
    }
    set viewPrefabList(value: cc.Prefab[]) {
        this._viewPrefabList = value;
        this.checkEditorDefaultName();
    }
    //#endregion

    private viewTemplateMap: Map<string, { viewBase: ViewBase, node: cc.Prefab | cc.Node }> =
        new Map<string, { viewBase: ViewBase, node: cc.Prefab | cc.Node }>();

    private viewStack: ViewStack = new ViewStack();
    private dialogList: DialogList = new DialogList();
    private tooltipList: TooltipList = new TooltipList();

    // onRestore() {}

    protected onLoad() {
        if (CC_EDITOR) return;

        // 预制体添加到模板表
        for (let viewPrefab of this.viewPrefabList) {
            let viewBase: ViewBase = viewPrefab.data.getComponent(ViewBase);
            if (viewBase) {
                this.viewTemplateMap.set(viewBase.viewName, { viewBase, node: viewPrefab });
            }
        }
        // 默认添加ViewContent子节点中为ViewBase的视图
        if (this.viewContent) {
            for (let node of this.viewContent.children) {
                this.setViewBaseNode(node);
            }
        }
    }

    protected start(): void {
        if (this.defaultView != "") {
            this.show(this.defaultView);
        }
    }

    private checkEditorDefaultName(): void {
        this.defaultView = "";
        this.defaultDialog = "";
        this.defaultTooltip = "";
        if (this.viewPrefabList.length == 0) return;

        for (let viewPrefab of this.viewPrefabList) {
            if (viewPrefab == null) continue;
            let viewBase: ViewBase = viewPrefab.data.getComponent(ViewBase);
            if (viewBase && viewBase.isDefault) {
                if (viewBase.viewType == ViewType.View) {
                    this.defaultView = viewBase.viewName;
                }
                else if (viewBase.viewType == ViewType.Dialog) {
                    this.defaultDialog = viewBase.viewName;
                }
                else if (viewBase.viewType == ViewType.Tooltip) {
                    this.defaultTooltip = viewBase.viewName;
                }
            }
        }
    }

    private getDefaultName(viewType: ViewType): string {
        // for (let data of this.viewTemplateMap.values()) {
        //     if (data.viewBase.viewType === viewType && data.viewBase.isDefault) {
        //         return data.viewBase.viewName;
        //     }
        // }
        let viewName = "";
        this.viewTemplateMap.forEach((value, key) => {
            if (value.viewBase.viewType === viewType && value.viewBase.isDefault) {
                viewName = value.viewBase.viewName;
                return;
            }
        });

        return viewName;
    }

    private createViewData(name: string): ViewData {
        if (!name) return null;

        let viewTemplate = this.viewTemplateMap.get(name);
        if (!viewTemplate) return null;

        let viewData: ViewData = null;
        if (viewTemplate.node instanceof cc.Prefab) {
            let newViewNode = cc.instantiate(viewTemplate.node);
            let newViewBase = newViewNode.getComponent(ViewBase);
            this.viewContent.addChild(newViewNode);
            viewData = new ViewData(newViewBase, true, this.close.bind(this));
        }
        else {
            viewData = new ViewData(viewTemplate.viewBase, false, this.close.bind(this));
        }

        return viewData;
    }

    /**
     * 更新视图在父类数组中的位置
     * Unknown < View < Dialog < Tooltip
     * 需要更精细的排序设计，可以通过在ViewBase中设计sortIndex来扩展实现
     */
    private updateContentSiblingIndex(): void {
        let viewBaseArray: ViewBase[] = [];
        let childCount = this.viewContent.children.length;
        // 先设置 Unknown 节点的排序索引
        let siblingIndex = 0;
        for (let i = 0; i < childCount; i++) {
            let child = this.viewContent.children[i];
            let viewBase = child.getComponent(ViewBase);
            if (viewBase) {
                viewBaseArray.push(viewBase);
            }
            else {
                child.setSiblingIndex(siblingIndex);
                siblingIndex++;
            }
        }
        // View < Dialog < Tooltip 排序
        viewBaseArray.sort((a, b) => {
            return a.viewType - b.viewType;
        });
        // 更新节点顺序
        for (let i = 0; i < viewBaseArray.length; i++) {
            let viewBase = viewBaseArray[i];
            if (viewBase.node.parent) {
                viewBase.node.setSiblingIndex(i + siblingIndex);
            }
        }
    }

    /**
     * 获取视图类型
     * @param name 视图名称
     * @returns 视图类型
     */
    getViewType(name: string): ViewType | null {
        let viewData = this.viewTemplateMap.get(name);
        if (viewData) {
            return viewData.viewBase.viewType;
        }
        return null;
    }

    /**
     * 获取所有视图名称
     * @returns 所有视图名称
     */
    getAllViewNames(): string[] {
        let names: string[] = [];
        // for (const key of this.viewTemplateMap.keys()) {
        //     names.push(key);
        // }
        this.viewTemplateMap.forEach((value, key) => {
            names.push(key);
        });

        return names;
    }

    /**
     * 注册视图
     * @param viewBaseNode 视图节点(节点需要挂载ViewBase组件)
     */
    setViewBaseNode(viewBaseNode: cc.Node): void {
        let viewBase: ViewBase = viewBaseNode.getComponent(ViewBase);
        if (viewBase) {
            viewBase.node.active = false;
            this.viewTemplateMap.set(viewBase.viewName, { viewBase, node: viewBaseNode });
        }
    }

    /**
     * 注册视图
     * @param name 视图名称
     * @param node 视图节点
     * @param type 视图类型
     */
    setViewNode(name: string, node: cc.Node, type: ViewType = ViewType.View): void {
        let viewBase = node.getComponent(ViewBase);
        if (!viewBase) {
            viewBase = node.addComponent(ViewBase);
        }
        viewBase.viewName = name;
        viewBase.viewType = type;

        this.viewTemplateMap.set(name, { viewBase: viewBase, node: node });
    }

    /**
     * 显示视图
     * @param name 视图名称
     * @param data 数据
     */
    show(name: string, data?: any): void {
        let viewType = this.getViewType(name);
        if (viewType == null) return;
        switch (viewType) {
            case ViewType.View:
                this.showView(name, data);
                break;
            case ViewType.Dialog:
                this.showDialog(name, data);
                break;
            case ViewType.Tooltip:
                this.showTooltip(name, data);
                break;
            default:
                break;
        }
    }

    /**
     * 关闭视图
     * @param name 视图名称
     * @returns 
     */
    close(name: string): void {
        let viewType = this.getViewType(name);
        if (viewType == null) return;
        switch (viewType) {
            case ViewType.View:
                this.backView(name);
                break;
            case ViewType.Dialog:
                this.closeDialog(name);
                break;
            case ViewType.Tooltip:
                this.closeTooltip(name);
                break;
            default:
                break;
        }
    }

    /**
     * 显示视图
     * @param name 视图名称(不填显示默认视图) 
     * @param data 数据
     */
    showView(name?: string, data?: any): void {
        if (!name) name = this.getDefaultName(ViewType.View);
        if (!name) return;

        if (this.viewStack.popTo(name, data)) {
            return;
        }
        else {
            let viewData = this.createViewData(name);
            if (!viewData) return;
            this.viewStack.push(viewData, data);

            this.updateContentSiblingIndex();
        }
    }

    /**
     * 视图后退（返回）
     */
    backView(name?: string): void {
        this.viewStack.pop(name);
    }

    /**
     * 关闭视图
     * @param name 视图名称 
     */
    closeView(name: string): void {
        this.viewStack.remove(name);
    }

    /**
     * 显示对话框
     * @param name 对话框名称
     * @param data 数据
     */
    showDialog(name?: string, data?: any): void {
        if (!name) name = this.getDefaultName(ViewType.Dialog);
        if (!name) return;

        // 如果已经存在，则不再创建
        let viewData = this.dialogList.getViewData(name);
        if (viewData) return;

        viewData = this.createViewData(name);
        if (!viewData) return;

        this.dialogList.push(viewData, data);

        this.updateContentSiblingIndex();
    }

    /**
     * 关闭对话框
     * @param name 对话框名称 
     */
    closeDialog(name?: string): void {
        if (!name) name = this.getDefaultName(ViewType.Dialog);
        if (!name) return;

        let viewData = this.dialogList.getViewData(name);
        if (viewData) {
            this.dialogList.pop(viewData);
        }
    }

    /**
     * 显示提示框
     * @param name 提示框名称 
     * @param data 数据
     */
    showTooltip(name?: string, data?: any): void {
        if (!name) name = this.getDefaultName(ViewType.Tooltip);
        if (!name) return;

        // 重复提示框，重新设置数据
        let viewData = this.tooltipList.getViewData(name);
        if (viewData) {
            viewData.data(data);
            return;
        }

        viewData = this.createViewData(name);
        if (!viewData) return;

        this.tooltipList.push(viewData, data);

        this.updateContentSiblingIndex();
    }

    /**
     * 关闭提示框
     * @param name 提示框名称 
     */
    closeTooltip(name?: string): void {
        if (!name) name = this.getDefaultName(ViewType.Tooltip);
        if (!name) return;

        let viewData = this.tooltipList.getViewData(name);
        if (viewData) {
            this.tooltipList.pop(viewData);
        }
    }
}