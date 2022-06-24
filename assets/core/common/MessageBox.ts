/**
 * CREATOR_2.4.9
 * DateTime = Sun May 01 2022 13:11:17 GMT+0800 (中国标准时间)
 * Author = eathon
 * github = https://github.com/eathonq/creator_2.4.9.git
 * email = vangagh@live.cn
 */

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
     * @param content 消息内容 
     * @param title 标题
     * @param buttons 按钮类型
     * @param dialog 指定弹窗类型名称
     * @returns 
     */
    static async Show(content: string, title?: string, buttons?: MessageBoxButtons, dialog?: string) {
        if (buttons == undefined) buttons = MessageBoxButtons.OK;
        return new Promise<DialogResult>((resolve, reject) => {
            let data = { title, content, buttons, resolve };
            ViewManager.instance.showDialog(dialog, data);
        });
    }

    /**
     * 显示Dialog
     * @param dialog 对话框类型名称 
     * @param data 对话框数据
     * @returns 
     */
    static async Dialog(dialog: string, data?: any) {
        if (!data) data = {};
        return new Promise<DialogResult>((resolve, reject) => {
            data.resolve = resolve;
            ViewManager.instance.showDialog(dialog, data);
        });
    }

    /**
     * 关闭消息框
     * @param dialog 对话框类型名称 
     */
    static Close(dialog: string) {
        ViewManager.instance.closeDialog(dialog);
    }
}