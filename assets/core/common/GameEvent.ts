/**
 * CREATOR_2.4.9
 * DateTime = Sun May 01 2022 13:11:17 GMT+0800 (中国标准时间)
 * Author = eathon
 * github = https://github.com/eathonq/creator_2.4.9.git
 * email = vangagh@live.cn
 */

interface IEventData {
    callback: Function;
    target: any;
    once: boolean;
}

interface IEventMap {
    [type: string]: IEventData[];
}

const _events = new WeakMap();

/** 游戏事件 */
class GameEvent {
    constructor() {
        _events.set(this, {})
    }

    /**
     * 注册事件
     * @param type 事件类型 
     * @param callback 事件回调
     * @param target 事件目标
     * @param once 是否只执行一次
     */
    public static on(type: string, callback: Function, target?: any, once = false) {
        let events: IEventMap = _events.get(this)

        if (!events) {
            events = {}
            _events.set(this, events)
        }

        if (!events[type]) {
            events[type] = [];
        }

        events[type].push({ callback: callback, target: target, once: once })
    }

    /**
     * 注册事件
     * @param type 事件类型
     * @param callback 事件回调
     * @param target 事件目标
     */
    public static once(type: string, callback: Function, target?: any) {
        this.on(type, callback, target, true);
    }

    /**
     * 移除事件
     * @param type 事件类型
     * @param callback 事件回调
     * @param target 事件目标
     */
    public static off(type: string, callback: Function, target?: any) {
        const events: IEventMap = _events.get(this)

        if (events) {
            const listeners = events[type]

            if (listeners && listeners.length > 0) {
                for (let i = listeners.length; i--; i > 0) {
                    if (listeners[i].callback === callback && (!target || target === listeners[i].target)) {
                        listeners.splice(i, 1);
                        break;
                    }
                }
            }
        }
    }

    /**
     * 触发事件
     * @param type 事件类型
     * @param args 事件参数
     */
    public static emit(type: string, ...args: any) {
        const events: IEventMap = _events.get(this)

        if (events) {
            const listeners = events[type];

            if (listeners && listeners.length > 0) {
                for (let i = listeners.length; i--; i > 0) {
                    const event = listeners[i];
                    event.callback.apply(event.target, args);
                    if (event.once) {
                        listeners.splice(i, 1);
                    }
                }
            }

        }
    }
}


/** 游戏事件 */
export const gameEvent = GameEvent;