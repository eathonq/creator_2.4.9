import { GuideType } from "../../core/guide/GuideCommand";
import GuideManager from "../../core/guide/GuideManager";

let Task_01 = {
    name: "Task_01",
    sort: 0,
    steps: [
        {
            name: "Step_ClickA_Tooltip",
            command: { type: GuideType.Tooltip, tooltip:"TooltipDemo", data: "请点击 Button A", time: 5 * 1000 },
        },
        {
            name: "Step_ClickA",
            command: { type: GuideType.Click, data: "Content > GuideDemo > Button A" },
        },
        {
            name: "Step_ClickB",
            command: { type: GuideType.Click, data: "Content > GuideDemo > Button B" },
        },
        {
            name: "Step_ClickC",
            command: { type: GuideType.Click, data: "Content > GuideDemo > Button C" },
        },
        {
            name: "Step_ClickD",
            command: { type: GuideType.Click, data: "Content > GuideDemo > Button D" },
        },
        {
            name: "Step_ClickE",
            command: { type: GuideType.Click, data: "Content > GuideDemo > Button E" },
        }
    ]
}

GuideManager.instance.addTask(Task_01);