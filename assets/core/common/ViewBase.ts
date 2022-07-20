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
    Show = 0,
    /** 隐藏 */
    Hide = 1,
    /** 关闭 */
    Close = 2,
    /** 数据通知 */
    Data = 3,
}

/**
 * 视图基类
 */
@ccclass
@executeInEditMode
@menu("common/ViewBase")
export default class ViewBase extends cc.Component {

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
        this.doClose = null;
    }

    private checkEditorComponent() {
        if (CC_EDITOR) {
            if (this.viewName == "") {
                this.viewName = this.node.name;
            }
        }
    }

    private doClose: Function = null;
    onCloseEvent(event: cc.Event.EventTouch, customEventData: string) {
        if (!customEventData) {
            this.doClose?.(this.viewName);
            return;
        }

        let dadas = customEventData.split("&");
        if (dadas[0].trim() == "") {
            dadas[0] = this.viewName;
        }
        if (dadas[1] == undefined) {
            dadas[1] = null;
        }
        this.doClose?.(dadas[0], dadas[1]);
    }

    protected doShow: (name: string, data?: any) => void = null;
    onShowEvent(event: cc.Event.EventTouch, customEventData: string) {
        if (!customEventData) {
            return;
        }

        let dadas = customEventData.split("&");
        if (dadas[0].trim() == "") {
            return;
        }
        if (dadas[1] == undefined) {
            dadas[1] = null;
        }
        this.doShow?.(dadas[0], dadas[1]);
    }
}