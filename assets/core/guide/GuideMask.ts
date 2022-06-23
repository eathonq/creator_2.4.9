/**
 * CREATOR_2.4.9
 * DateTime = Thu Jun 23 2022 14:43:23 GMT+0800 (中国标准时间)
 * Author = eathon
 * github = https://github.com/eathonq/creator_2.4.9.git
 * email = vangagh@live.cn
 */

const {ccclass, property} = cc._decorator;

@ccclass
export default class GuideMask extends cc.Component {

    @property(cc.Label)
    label: cc.Label = null;

    @property
    text: string = 'hello';

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start () {

    }

    // update (dt) {}
}
