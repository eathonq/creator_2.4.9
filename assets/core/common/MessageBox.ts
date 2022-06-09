/**
 * 消息框按钮
 */
export const enum MessageBoxButtons {
    /* 消息框包含“确定”按钮。 */
    ButtonsOK = 0,
    /* 消息框包含“确定”和“取消”按钮。 */
    ButtonsOKCancel = 1,
    /* 消息框无按钮。 */
    ButtonsNone = 2,
}

/**
 * 消息框结果
 */
export const enum MessageResult {
    /** 取消 */
    ResultCancel = 0,
    /** 确定 */
    ResultOK = 1,
}

/**
 * 消息框数据
 */
export class MessageBox {
    public title: string = "";
    public message: string;
    public callback: Function;
    public target: any;
    public buttons: MessageBoxButtons = MessageBoxButtons.ButtonsOK;
    public constructor(title: string, message: string, callback: Function, target: any, buttons: MessageBoxButtons) {
        this.title = title;
        this.message = message;
        this.callback = callback;
        this.target = target;
        this.buttons = buttons;
    }

    doCallback(result: MessageResult) {
        if (this.callback) {
            if (this.target) {
                this.callback.call(this.target, result);
            } else {
                this.callback(result);
            }
        }
    }
}

/**
 * 消息框数据
 * @param message 消息框消息
 * @param callback 消息框回调
 * @param target 消息框回调对象
 * @param other 消息框其他参数
 * @returns 消息框数据
 */
export let message = (message: string, callback?:Function, target?:any, other?: {title:string,buttons:MessageBoxButtons}) => {
    let tile = other ? other.title : "";
    let buttons = other ? other.buttons : MessageBoxButtons.ButtonsOK;
    let dialog = new MessageBox(tile, message, callback, target, buttons);
    return dialog;
}