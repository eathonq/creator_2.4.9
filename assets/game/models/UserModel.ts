export class User {
    id = 0;
    /** 登录名称 */
    name = "";
    /** 登录密码 */
    password = "";
    /** 昵称 */
    nick_name = "";
    /** 性别{0女|1男} */
    gender = 0;
    /** 个性签名 */
    signature = "";
    /** 用户状态{0正常|1锁定|2删除} */
    state = 0;
    /** 登录次数 */
    login_times = 0;
    last_update = 0;

    isCheck = false;
    progress = 0;
    index = 0;
    //array = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
}