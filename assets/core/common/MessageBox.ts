import ViewManager from "./ViewManager";

/** 消息框按钮 */
export const enum MessageBoxButtons {
    /* 消息框无按钮。 */
    None = 0,
    /* 消息框包含“确定”按钮。 */
    OK = 1,
    /* 消息框包含“确定”和“取消”按钮。 */
    OKCancel = 2,

    AbortRetryIgnore,
    YesNo,
    YesNoCancel,
}

/** 消息框结果 */
export const enum DialogResult {
    /** Nothing */
    None = 0,
    /** 确定 */
    OK = 1,
    /** 取消 */
    Cancel = 2,
    /** 中止 */
    Abort = 3,
    /** 重试 */
    Retry = 4,
    /** 忽略 */
    Ignore = 5,

    Yes = 6,
    No = 7,
}

/** 消息框 */
export class MessageBox {
    /**
     * 显示消息框
     * @param message 消息内容 
     * @param title 标题
     * @param buttons 按钮类型
     * @returns 
     */
    static async Show(message: string, title?: string, buttons: MessageBoxButtons = MessageBoxButtons.OK) {
        return new Promise<DialogResult>((resolve, reject) => {
            let data = { title: title, message: message, buttons: buttons, callback: resolve };
            ViewManager.instance.showDialog(null, data);
        });
    }

    /**
     * 显示消息框
     * @param dialogName 弹窗名称 
     * @param data 消息内容
     * @returns 
     */
    static async ShowDialog(dialogName: string, data: any) {
        return new Promise<DialogResult>((resolve, reject) => {
            data.callback = resolve;
            ViewManager.instance.showDialog(dialogName, data);
        });
    }
}