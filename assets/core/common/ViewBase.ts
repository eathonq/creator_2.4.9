/**
 * CREATOR_2.4.9
 * DateTime = Sun May 01 2022 13:11:17 GMT+0800 (中国标准时间)
 * Author = eathon
 * github = https://github.com/eathonq/creator_2.4.9.git
 * email = vangagh@live.cn
 */

const { ccclass, property, executeInEditMode, menu } = cc._decorator;

/** 视图类型 */
export enum ViewType {
    /** 全屏视图 */
    View = 0,
    /** 对话框 */
    Dialog = 1,
    /** 提示框 */
    Tooltip = 2,
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
    Show,
    /** 隐藏 */
    Hide,
    /** 关闭 */
    Close,
}

@ccclass
@executeInEditMode
@menu("common/ViewBase")
export class ViewBase extends cc.Component {
    @property({
        tooltip: "视图名称",
    })
    viewName: string = "";
    @property({
        tooltip: "视图类型",
        type: cc.Enum(ViewType),
    })
    viewType: ViewType = ViewType.View;
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

    closeCallback: Function = null;
    onCloseEvent(event: cc.Event.EventTouch, customEventData: string) {
        if (this.closeCallback) {
            this.closeCallback(this.viewName);
        }
    }
}