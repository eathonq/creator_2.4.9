/**
 * CREATOR_2.4.9
 * DateTime = Sun May 01 2022 13:11:17 GMT+0800 (中国标准时间)
 * Author = eathon
 * github = https://github.com/eathonq/creator_2.4.9.git
 * email = vangagh@live.cn
 */

import { config } from "./Configuration";

const {ccclass, property,executeInEditMode,menu} = cc._decorator;

const AUDIO_CONFIG = "AUDIO_CONFIG";
/** 本地音频保存结构 */
interface AudioConfig {
    switchSound: boolean,
    switchMusic: boolean,
    volumeSound: number,
    volumeMusic: number,
}

class SoundAudioSource{
    path: string;
    isPause: boolean = false;
    audioSource: cc.AudioSource;
    clip: cc.AudioClip;
}

/** 音频管理器 */
@ccclass
@executeInEditMode
@menu('common/AudioManager')
export default class AudioManager extends cc.Component {
    //#region instance
    private static _instance: AudioManager = null;
    static get instance() {
        if (this._instance == null) {
            let scene = cc.director.getScene();
            if (!scene) return null;
            this._instance = scene.getComponentInChildren(AudioManager);
            if (this._instance == null) {
                console.log("AudioManager is not found in scene");
                let newNode = new cc.Node("AudioManager");
                scene.addChild(newNode);
                this._instance = newNode.addComponent(AudioManager);
            }
            cc.game.addPersistRootNode(this._instance.node);
        }
        return this._instance;
    }
    //#endregion

    @property({
        type: cc.AudioClip,
        tooltip: "默认背景音乐文件"
    })
    private musicClip: cc.AudioClip = null;

    @property({
        tooltip: "启动播放背景音乐"
    })
    private playOnLoad: boolean = true;

    /** 背景音乐的AudioSource */
    private _musicAudioSource: cc.AudioSource;
    /** 一次性音效AudioSource */
    private _oneShotAudioSource: cc.AudioSource;
    /** 音效AudioSource表 */
    private _soundAudioSourceMap: Map<string, SoundAudioSource>;
    /** 缓存音频文件 */
    private _audioClipDict: { [name: string]: cc.AudioClip };

    /** 背景音乐声音（0.0 ~ 1.0） */
    private _volumeMusic = 1;
    /** 背景音乐开关 */
    private _switchMusic: boolean;

    /** 音效声音（0.0 ~ 1.0） */
    private _volumeSound = 1;
    /** 音效开关 */
    private _switchSound: boolean;

    // private readonly soundPathSecurityCount = 22; //同时播放的音效种类数量

    protected onLoad() {
        if (CC_EDITOR) return;

        this._soundAudioSourceMap = new Map<string, SoundAudioSource>();
        this._audioClipDict = {};

        // 从配置中读取音频配置
        let audioSetting = this.loadAudioConfig();
        this._volumeSound = audioSetting.volumeSound;
        this._volumeMusic = audioSetting.volumeMusic;
        this._switchSound = audioSetting.switchSound;
        this._switchMusic = audioSetting.switchMusic;

        // 初始化背景音乐音频组件
        this._musicAudioSource = this.node.addComponent(cc.AudioSource);

        // 初始化短音频音频组件
        this._oneShotAudioSource = this.node.addComponent(cc.AudioSource);

        // 设置配置背景音乐
        if (this.musicClip) {
            this._musicAudioSource.clip = this.musicClip;
            this._musicAudioSource.loop = true;
            this._musicAudioSource.volume = this._volumeMusic;
            
            if (this.playOnLoad) {
                this._musicAudioSource.play();
            }
            else {
                this._musicAudioSource.stop();
            }
        }
    }

    protected start(): void {}

    /**
     * 播放背景音乐
     * @param music 背景音乐
     * @param loop 是否循环
     * @returns 
     */
    async playMusic(music: cc.AudioClip | string, loop: boolean = true): Promise<void> {
        if (!music) return;
        if (typeof music == "string") {
            music = await this.getOrCreateAudioClip(music);
            if (!music) return;
        }

        this._musicAudioSource.clip = music;
        this._musicAudioSource.loop = loop;
        this._musicAudioSource.volume = this._volumeMusic;
        if (this._switchMusic) {
            this._musicAudioSource.play();
        }
        else {
            this._musicAudioSource.stop();
        }
    }

    /**
     * 转换音乐按钮开关
     * @param isSwitch 
     * @returns 
     */
    switchMusic(isSwitch?: boolean): boolean {
        if (isSwitch == null || isSwitch == undefined) {
            this._switchMusic = !this._switchMusic;
        }
        else {
            if (this._switchMusic == isSwitch) return this._switchMusic;
            this._switchMusic = isSwitch;
        }

        if (this._musicAudioSource.clip == null) {
            console.log("未设置背景音乐");
            this._switchMusic = false;
            return false;
        }

        if (this._switchMusic) {
            if (!this._musicAudioSource.isPlaying)
                this._musicAudioSource.play();
        }
        else {
            if (this._musicAudioSource.isPlaying)
                this._musicAudioSource.stop();
        }
        this.saveAudioConfig();

        return this._switchMusic;
    }

    /**
     * 获取音乐开关状态
     * @returns 
     */
    getSwitchMusic() {
        return this._switchMusic;
    }

    /**
     * 暂停背景音乐
     */
    pauseMusic() {
        this._musicAudioSource.pause();
    }

    /**
     * 恢复当前被暂停音乐音乐
     */
    resumeMusic() {
        this._musicAudioSource.play();
    }

    /**
     * 停止背景音乐
     */
    stopMusic() {
        this._musicAudioSource.stop();
    }

    /**
     * 设置背景音乐音量
     * @param volume （0.0 ~ 1.0）
     */
    setMusicVolume(volume: number) {
        this._volumeMusic = volume;
        this._musicAudioSource.volume = volume;
        this.saveAudioConfig();
    }

    getMusicVolume(): number {
        return this._volumeMusic;
    }

    /**
     * 当前背景音乐是否增在播放
     */
    isMusicPlaying(): boolean {
        return this._musicAudioSource.isPlaying;
    }

    /** 播放一次性音频 */
    async playOneShotSound(path: string): Promise<void> {
        if (this._switchSound) {
            let audioClip = await this.getOrCreateAudioClip(path);
            if (audioClip) {
                //this._oneShotAudioSource.playOneShot(audioClip, this._volumeSound);
                //cc.audioEngine.playEffect(audioClip, false);
                this._oneShotAudioSource.play();
            }
        }
    }

    /**
     * 播放音效
     * @param path 地址
     * @param loop 是否循环
     * @returns 
     */
    async playSound(path: string, loop: boolean = false): Promise<void> {
        if (this._switchSound == false) {
            return;
        }

        let soundAudioSource = this.getOrCreateSoundAudioSource(path);
        if (!soundAudioSource) return;

        if(!soundAudioSource.clip){
            soundAudioSource.clip = await this.getOrCreateAudioClip(path);
            soundAudioSource.audioSource.clip = soundAudioSource.clip;
        }

        soundAudioSource.audioSource.loop = loop;
        soundAudioSource.audioSource.volume = this._volumeSound;
        soundAudioSource.audioSource.play();
        
        // 播放结束后回收
        // soundAudioSource.audioSource.node.once(AudioSource.EventType.ENDED, () => {
        // });
    }
    /**
     * 转换音效开关(仅关闭正在播放的音效)
     * @param isSwitch 
     * @returns 
     */
    switchSound(isSwitch?: boolean): boolean {
        if (isSwitch == null || isSwitch == undefined) {
            this._switchSound = !this._switchSound;
        }
        else {
            if (this._switchSound == isSwitch) return this._switchSound;
            this._switchSound = isSwitch;
        }

        if (!this._switchSound) {
            // for (const item of this._soundAudioSourceMap.values()) {
            //     if (item.audioSource.playing) item.audioSource.stop();
            // }
            this._soundAudioSourceMap.forEach(item => {
                if (item.audioSource.isPlaying) item.audioSource.stop();
            });
        }
        this.saveAudioConfig();
        return this._switchSound;
    }

    /**
     * 转换音效开关
     * @returns 
     */
    getSwitchSound(): boolean {
        return this._switchSound;
    }

    /**
     * 设置音效声音大小
     * @param volume 0.0 - 1.0
     */
    setSoundVolume(volume: number) {
        this._volumeSound = volume;
        // 设置音效声音大小
        // for (const item of this._soundAudioSourceMap.values()) {
        //     item.audioSource.volume = volume;
        // }
        this._soundAudioSourceMap.forEach(item => {
            item.audioSource.volume = volume;
        });

        this.saveAudioConfig();
    }

    /**
     * 获取音效大小
     * @returns 0.0 - 1.0
     */
    getSoundVolume(): number {
        return this._volumeSound;
    }

    /**
     * 暂停指定音效
     * @param path 
     */
    pauseSound(path: string) {
        let item = this._soundAudioSourceMap.get(path);
        if(item){
            if (item.audioSource.isPlaying) {
                item.audioSource.pause();
                item.isPause = true;
            }
        }
    }

    /**
     * 暂停正在播放的所有音效
     */
    pauseAllSounds() {
        // for (const item of this._soundAudioSourceMap.values()) {
        //     if (item.audioSource.playing){
        //         item.audioSource.pause();
        //         item.isPause = true;
        //     }
        // }
        this._soundAudioSourceMap.forEach(item => {
                if (item.audioSource.isPlaying){
                item.audioSource.pause();
                item.isPause = true;
            }
        });
    }

    /**
     * 恢复指定音效
     * @param path 
     */
    resumeSound(path: string) {
        let item = this._soundAudioSourceMap.get(path);
        if(item){
            if (item.isPause) {
                item.audioSource.play();
                item.isPause = false;
            }
        }
    }

    /**
     * 恢复正在播放的所有音效
     */
    resumeAllSounds() {
        // for (const item of this._soundAudioSourceMap.values()) {
        //     if (item.isPause){
        //         item.audioSource.play();
        //         item.isPause = false;
        //     }
        // }
        this._soundAudioSourceMap.forEach(item => {
            if (item.isPause){
                item.audioSource.play();
                item.isPause = false;
            }
        });
    }

    /**
     * 停止播放指定音效
     * @param path 
     */
    stopSound(path: string) {
        let item = this._soundAudioSourceMap.get(path);
        if(item){
            item.audioSource.stop();
            item.isPause = false;
        }
    }

    /**
     * 停止播放正在播放的所有音效
     */
    stopAllSound() {
        // for (const item of this._soundAudioSourceMap.values()) {
        //     item.audioSource.stop();
        //     item.isPause = false;
        // }
        this._soundAudioSourceMap.forEach(item => {
            item.audioSource.stop();
            item.isPause = false;
        });
    }

    /**
     * 获取音频文件,获取后会缓存一份
     * @param path 音频文件路径
     * @returns 
     */
    private async getOrCreateAudioClip(path: string): Promise<cc.AudioClip> {
        if (this._audioClipDict[path] == null) {
            this._audioClipDict[path] = await new Promise<cc.AudioClip>((resolve, reject) => {
                cc.resources.load(path, cc.AudioClip, (err, clip:cc.AudioClip) => {
                    if (err) {
                        resolve(null);
                    }
                    else {
                        resolve(clip);
                    }
                });
            });
        }

        return this._audioClipDict[path];
    }

    private getOrCreateSoundAudioSource(path: string): SoundAudioSource {
        if (this._soundAudioSourceMap.has(path)) {
            return this._soundAudioSourceMap.get(path);
        }
        else {
            console.log("新建音效音频组件");
            let audioSource = this.node.addComponent(cc.AudioSource);
            let soundAudioSource = new SoundAudioSource();
            soundAudioSource.path = path;
            soundAudioSource.audioSource = audioSource;
            this._soundAudioSourceMap.set(path, soundAudioSource);
            return soundAudioSource;
        }
    }

    private loadAudioConfig(): AudioConfig {
        let audio: AudioConfig;
        let localAudio = config.getItem(AUDIO_CONFIG);
        if (localAudio == null || localAudio == undefined || localAudio == "") {
            audio = { switchSound: true, switchMusic: true, volumeSound: 1, volumeMusic: 1 };
        }
        else {
            audio = JSON.parse(localAudio);
        }
        return audio;
    }

    private saveAudioConfig() {
        let audio: AudioConfig = { switchSound: this._switchSound, switchMusic: this._switchMusic, volumeSound: this._volumeSound, volumeMusic: this._volumeMusic };
        config.setItem(AUDIO_CONFIG, JSON.stringify(audio));
    }
}