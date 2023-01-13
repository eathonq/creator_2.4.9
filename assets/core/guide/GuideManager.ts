/**
 * CREATOR_2.4.9
 * DateTime = Tue Jun 21 2022 17:17:58 GMT+0800 (中国标准时间)
 * Author = eathon
 * github = https://github.com/eathonq/creator_2.4.9.git
 * email = vangagh@live.cn
 */

import { config } from "../common/Configuration";
import GuideCommand from "./GuideCommand";

const GUIDE_MANAGER_DEBUG = true;

/** 引导步骤 */
type GuideStep = {
    /** 步骤名称 */
    name: string;
    /** 命令数据 */
    command: any;

    /** 上个步骤 */
    preStep?: GuideStep;
    /** 下个步骤 */
    nextStep?: GuideStep;
}

/** 引导任务 */
type GuideTask = {
    /** 任务名称 */
    name: string;
    /** 任务排序 */
    sort: number;
    /** 任务步骤 */
    steps: GuideStep[];
}

/**
 * 引导管理器
 */
export default class GuideManager {
    //#region instance
    private static _instance: GuideManager = null;
    static get instance() {
        if (this._instance == null) {
            this._instance = new GuideManager();
        }
        return this._instance;
    }
    //#endregion

    private _tasks: GuideTask[] = [];

    /**
     * 添加引导任务
     * @param task 引导任务 
     */
    addTask(task: GuideTask) {
        this._tasks.push(task);
    }

    /**
     * 移除引导任务
     * @param taskName 任务名称 
     */
    removeTask(taskName: string) {
        for (let i = 0; i < this._tasks.length; i++) {
            if (this._tasks[i].name == taskName) {
                this._tasks.splice(i, 1);
                break;
            }
        }
    }

    /** 连接任务步骤 */
    private linkStep() {
        for (let i = 0; i < this._tasks.length; i++) {
            let task = this._tasks[i];
            for (let j = 0; j < task.steps.length; j++) {
                let step = task.steps[j];
                if (j > 0) {
                    step.preStep = task.steps[j - 1];
                }
                else {
                    if (i > 0) {
                        // 连接上一个任务的最后一个步骤
                        step.preStep = this._tasks[i - 1].steps[this._tasks[i - 1].steps.length - 1];
                    }
                }

                if (j < task.steps.length - 1) {
                    step.nextStep = task.steps[j + 1];
                }
                else {
                    if (i < this._tasks.length - 1) {
                        // 连接下一个任务的第一个步骤
                        step.nextStep = this._tasks[i + 1].steps[0];
                    }
                }
            }
        }
    }

    /** 任务排序 */
    private sortTask() {
        this._tasks.sort((a, b) => a.sort - b.sort);
    }

    /** 重置引导进度 */
    resetProgress() {
        config.removeItem("guide_progress");
        this._currentStep = null;
    }

    private _currentStep: GuideStep;
    /**
     * 设置引导进度
     * @param taskName 任务名称 
     * @param stepName 步骤名称
     * @returns 
     */
    private setProgress(taskName: string, stepName: string) {
        this._currentStep = null;

        let task = this._tasks.find(task => task.name == taskName);
        if (task == null) {
            return;
        }
        let step = task.steps.find(step => step.name == stepName);
        if (step == null) {
            return;
        }
        this._currentStep = step;
    }

    /** 保存进度 */
    private saveProgress() {
        if (!this._currentStep) return;

        let task = this._tasks.find(task => task.steps.find(step => step == this._currentStep));
        config.setItem("guide_progress", JSON.stringify({ taskName: task.name, stepName: this._currentStep.name }));
    }

    /** 读取进度 */
    private loadProgress() {
        let data = config.getItem("guide_progress", { taskName: "", stepName: "" });
        this.setProgress(data.taskName, data.stepName);
    }

    /** 
     * 开始引导
     * @param onStepCallback 引导步骤回调
     */
    async start(onStepCallback?: (step: GuideStep) => void) {
        this.sortTask();
        this.linkStep();
        this.loadProgress();

        if (!this._currentStep) {
            this._currentStep = this._tasks[0].steps[0];
        }

        while (this._currentStep) {
            if (GUIDE_MANAGER_DEBUG) console.log("开始引导步骤: " + this._currentStep.name);
            let step = this._currentStep;
            this.saveProgress();
            await GuideCommand.doCommand(step.command);
            onStepCallback?.(step);
            this._currentStep = step.nextStep;
        }

        if (GUIDE_MANAGER_DEBUG) console.log("引导结束");
    }
}