const { ccclass, property, executeInEditMode, menu } = cc._decorator;

/**
 * Predefined variables
 * Name = ViewBase
 * DateTime = Sun May 01 2022 23:56:58 GMT+0800 (中国标准时间)
 * Author = vangagh
 * FileBasename = ViewBase.ts
 * FileBasenameNoExtension = ViewBase
 * URL = db://assets/core/ui/ViewBase.ts
 * ManualUrl = https://docs.cocos.com/creator/3.4/manual/zh/
 *
 */

/** 视图类型 */
export enum ViewType {
    /** 全屏视图 */
    VIEW = 0,
    /** 对话框 */
    DIALOG = 1,
    /** 提示框 */
    TOOLTIP = 2,
}

/** 
 * 视图事件
 * 可以在视图节点`node.onLoad()`中注册
 * `this.node.on(ViewEvent, this.onViewEvent, this);`
 */
export const ViewEvent = "VIEW_EVENT";

/** 视图状态 */
export enum ViewState {
    /** 显示 */
    SHOW,
    /** 隐藏 */
    HIDE,
    /** 关闭 */
    CLOSE,
}

@ccclass
@executeInEditMode
@menu("Common/ViewBase")
export class ViewBase extends cc.Component {
    @property({
        tooltip: "视图名称",
    })
    viewName: string = "";
    @property({
        tooltip: "视图类型",
        type: cc.Enum(ViewType),
    })
    viewType: ViewType = ViewType.VIEW;
    @property({
        tooltip: "是否默认显示",
    })
    isDefault: boolean = false;

    onRestore() {
        this.checkEditorComponent();
    }

    protected onLoad() {
        this.checkEditorComponent();
    }

    protected start() { }

    protected onDestroy(): void {
        this.closeCallback = null;
    }

    private checkEditorComponent() {
        if (CC_EDITOR) {
            if (this.viewName == "") {
                this.viewName = this.node.name;
            }
        }
    }

    closeCallback:Function = null;
    onClickCloseEvent(event: cc.Event.EventTouch, customEventData: string) {
        if (this.closeCallback) {
            this.closeCallback(this.viewName);
        }
    }
}