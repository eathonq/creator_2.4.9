/**
 * CREATOR_2.4.9
 * DateTime = Wed Jun 22 2022 09:37:32 GMT+0800 (中国标准时间)
 * Author = eathon
 * github = https://github.com/eathonq/creator_2.4.9.git
 * email = vangagh@live.cn
 */

import Locator from "../common/Locator";
import ViewManager from "../common/ViewManager";

/** 引导类型 */
export enum GuideType {
    /** 点击引导 */
    Click = 0,
    /** 提示引导 */
    Tooltip = 1,
    /** 滑动引导 */
    Slide = 3,
}

/**
 * 引导命令
 */
export default class GuideCommand {
    static async doCommand(command: any) {
        switch (command.type) {
            case GuideType.Click:
                await GuideCommand.doClick(command);
                break;
            case GuideType.Tooltip:
                await GuideCommand.doTooltip(command);
                break;
            case GuideType.Slide:
                await GuideCommand.doSlide(command);
                break;
        }
    }

    static async doClick(command: { type: GuideType, data: string }) {
        return new Promise<void>(async (resolve, reject) => {
            let root = cc.director.getScene();
            let node = await Locator.locateNode(root, command.data);
            if (node) {
                node.once(cc.Node.EventType.TOUCH_END, () => {
                    resolve();
                });
            }
        });
    }

    static async doTooltip(command: { type: GuideType, tooltip:string, data: string, time: number }) {
        return new Promise<void>(async (resolve, reject) => {
            ViewManager.instance.showTooltip(command.tooltip, { content: command.data, resolve });
            if (command.time) {
                setTimeout(() => {
                    ViewManager.instance.closeTooltip(command.tooltip);
                }, command.time);
            }
        });
    }

    static async doSlide(command: any) {
    }
}