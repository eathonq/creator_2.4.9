/** 用户数据 */
export class User {
    /**
     * 用户数据
     * @param {string} name 
     * @param {string} password 
     * @param {string} nick_name 
     * @param {number} gender 
     * @param {string} signature 
     * @param {number} state 用户状态{0正常|1锁定|2删除}
     * @param {number} login_times 
     * @param {Date} last_update 
     */
    constructor(name: string, password: string, nick_name: string, gender: number, signature: string, state: number, login_times: number, last_update: number) {
        this.id = 0;
        /** 登录名称 */
        this.name = name;
        /** 登录密码 */
        this.password = password;
        /** 昵称 */
        this.nick_name = nick_name;
        /** 性别{0女|1男} */
        this.gender = gender;
        /** 个性签名 */
        this.signature = signature;
        /** 用户状态{0正常|1锁定|2删除} */
        this.state = state;
        /** 登录次数 */
        this.login_times = login_times;
        /** 最后登录时间 */
        this.last_update = last_update;
    }

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
}

/** 用户状态 */
export class UserState {
    /**
     * 用户状态
     * @param {number} user_id 
     * @param {string} name 
     * @param {string} classification 
     * @param {number} icon 
     * @param {string} talk 
     * @param {number} public_ 
     */
    constructor(user_id: any, name: any, classification: any, icon: any, talk: any, public_: any) {
        this.id = 0;
        this.user_id = user_id;
        this.name = name;
        /** 状态分类 */
        this.classification = classification;
        this.icon = icon;
        /** 话题 */
        this.talk = talk;
        /** 是否公开{0不公开|1公开} */
        this.public = public_;
    }

    id = 0;
    user_id = 0;
    name = "";
    classification = "";
    icon = 0;
    talk = "";
    public = 0;
}

/** 平台用户 */
export class UserPlatform {
    id = 0;
    user_id = 0;
    platform = "";
    login_data = "";
    data = "";
    last_update = 0;

    /**
     * 平台用户
     * @param {number} user_id 
     * @param {string} platform 
     * @param {string} login_data 
     * @param {string} data 
     * @param {Date} last_update 
     */
    constructor(user_id: any, platform: any, login_data: any, data: any, last_update: any) {
        this.id = 0;
        this.user_id = user_id;
        /** 平台名称 */
        this.platform = platform;
        /** 平台登录数据 */
        this.login_data = login_data;
        /** 平台数据 */
        this.data = data;
        this.last_update = last_update;
    }
}

/** 游客用户 */
export class UserGuest {
    /**
     * 游客用户
     * @param {number} user_id 
     * @param {string} login_data 
     * @param {string} data 
     * @param {Date} last_update 
     */
    constructor(user_id: any, login_data: any, data: any, last_update: any) {
        this.id = 0;
        this.user_id = user_id;
        /** 游客登录数据 */
        this.login_data = login_data;
        /** 游客数据 */
        this.data = data;
        this.last_update = last_update;
    }

    id = 0;
    user_id = 0;
    login_data = "";
    data = "";
    last_update = 0;
}

/** 用户游戏数据 */
export class UserGame {
    /**
     * 
     * @param {number} user_id 
     * @param {number} game_id 
     * @param {string} data 
     * @param {Date} last_update
     */
    constructor(user_id: any, game_id: any, data: any, last_update: any) {
        this.id = 0;
        this.user_id = user_id;
        this.game_id = game_id;
        /** 游戏数据 */
        this.data = data;
        this.last_update = last_update;
    }

    id = 0;
    user_id = 0;
    game_id = 0;
    data = "";
    last_update = 0;
}

/** 游戏数据 */
export class Game {
    /**
     * 游戏数据
     * @param {string} name 
     * @param {number} icon 
     * @param {number} state
     * @param {string} version 
     */
    constructor(name: any, icon: any, state: any, version: any) {
        this.id = 0;
        this.name = name;
        this.icon = icon;
        /** 游戏状态{0运行|1维护|2停服} */
        this.state = state;
        this.version = version;
    }

    id = 0;
    name = "";
    icon = 0;
    state = 0;
    version = "";
}

/** 游戏新闻（公告） */
export class GameNews {
    /**
     * 
     * @param {number} game_id 
     * @param {string} title 
     * @param {string} content 
     * @param {number} state 
     * @param {number} icon 
     * @param {number} background
     * @param {Date} last_update
     */
    constructor(game_id: any, title: any, content: any, state: any, icon: any, background: any, last_update: any) {
        this.id = 0;
        this.game_id = game_id;
        /** 标题 */
        this.title = title;
        /** 内容 */
        this.content = content;
        /** 新闻状态（0new|1hot|2expired） */
        this.state = state;
        this.icon = icon;
        this.background = background;
        this.last_update = last_update;
    }

    id = 0;
    game_id = 0;
    title = "";
    content = "";
    state = 0;
    icon = 0;
    background = 0;
    last_update = 0;
}