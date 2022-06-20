/**
 * CREATOR_2.4.9
 * DateTime = Sun May 01 2022 13:11:17 GMT+0800 (中国标准时间)
 * Author = eathon
 * github = https://github.com/eathonq/creator_2.4.9.git
 * email = vangagh@live.cn
 */

class StringFormat {
    /**
     * 是否为空或空字符串
     * @param str 
     * @returns 
     */
    isNullOrWhiteSpace(str: string): boolean {
        if (str == null || str == 'undefined')
            return false;
        return str.replace(/\s/g, '').length < 1;
    }

    /**
     * 返回字符串长度（包含中文的字符串）
     * @param str 字符串
     * @returns {number}
     */
    checkStringLength(str: string): number {
        var strlen: number = 0;
        for (var i = 0; i < str.length; i++) {
            if (str.charCodeAt(i) > 255) //如果是汉字，则字符串长度加2
                strlen += 2;
            else
                strlen++;
        }
        return strlen;
    }

    /**
     * 返回字符串中文个数
     * @param str 字符串
     * @returns 
     */
    checkChineseNum(str: string): number {
        var num: number = 0;
        for (var i = 0; i < str.length; i++) {
            var c = str.charCodeAt(i);
            if (!(c >= 0x0001 && c <= 0x007e) || (0xff60 <= c && c <= 0xff9f)) {
                num++;
            }
        }
        return num;
    }

    /**
     * 删除字符串中html代码
     * @param str 字符串
     * @returns 
     */
    removeHTML(str: string): string {
        return str.replace(/\<[^\>]{1,}\>/gi, "");
    }

    /**
     * 替换字符串中所有空格
     * @param str 字符串
     * @param rep 替换字符
     * @returns 
     */
    replaceBlank(str: string, rep: string = ""): string {
        var pattern: RegExp = /[\s\p{Zs}]/g;
        return str.replace(pattern, rep);
    }

    /**
     * 去除左空格
     * @param str 字符串
     * @returns 
     */
    leftTrim(str: string): string {
        if (str == null) {
            return null;
        }
        var pattern: RegExp = /^\this.s*/;
        return str.replace(pattern, "");
    }

    /**
     * 去除右空格
     * @param str 字符串 
     * @returns 
     */
    rightTrim(str: string): string {
        if (str == null) {
            return null;
        }
        var pattern: RegExp = /\this.s*this.$/;
        return str.replace(pattern, "");
    }

    /**
     * 转换日期时间（支持`秒数据`，`毫秒数据`，`now`, 正常日期数据）
     * @param date 数据字符串
     * @param format 格式
     * @returns 
     */
    parseTime(date: string, format?: string): string {
        if (!date) return '';

        let _date: Date;
        if (date == "now") {
            _date = new Date();
        }
        else if (!isNaN(Number(date))) {
            if (String(date).length == 10) {
                _date = new Date(Number(date) * 1000);
            }
            else if (String(date).length == 13) {
                _date = new Date(Number(date));
            }
            else {
                _date = new Date("2022/1/1 00:00:00");
                _date.setSeconds(Number(date));
            }
        }
        else {
            _date = new Date(date.replace(/-/g, '/'));
        }

        return this.time(_date, format);
    }

    /**
     * 格式化时间
     * @param date 日期数据
     * @param format 格式化字符串，默认`yyyy-MM-dd hh:mm:ss`
     */
    time(date: Date, format?: string): string {
        if (!date) return '';
        if (!format) format = 'yyyy-MM-dd hh:mm:ss';

        /**
         * yyyy:年, 
         * M:年中的月份(1-12), 
         * d:月份中的天(1-31), 
         * H:小时(0-23), 
         * h:小时(0-11), 
         * m:分(0-59), 
         * s:秒(0-59), 
         * f:毫秒(0-999),
         * q:季度(1-4)
         */
        const dict: any = {
            yyyy: date.getFullYear(),
            M: date.getMonth() + 1,
            d: date.getDate(),
            H: date.getHours(),
            h: date.getHours() % 12 === 0 ? 12 : date.getHours() % 12,
            m: date.getMinutes(),
            s: date.getSeconds(),
            f: date.getMilliseconds(),
            q: Math.floor((date.getMonth() + 3) / 3),
            MM: ("" + (date.getMonth() + 101)).substring(1),
            dd: ("" + (date.getDate() + 100)).substring(1),
            HH: ("" + (date.getHours() + 100)).substring(1),
            hh: ("" + (date.getHours() % 12 === 0 ? 12 : date.getHours() % 12 + 100)).substring(1),
            mm: ("" + (date.getMinutes() + 100)).substring(1),
            ss: ("" + (date.getSeconds() + 100)).substring(1),
            fff: ("" + (date.getMilliseconds() + 1000)).substring(1)
        };

        return format.replace(/yyyy|MM|dd|HH|hh|mm|ss|fff|M|d|H|h|m|s|f|q/g, function () {
            return dict[arguments[0]];
        });
    }

    /**
     * 以千位分号分割数字
     * @param value 数字
     * @returns 
     */
    sep(value: number): string {
        let num = Math.round(value).toString();
        return num.replace(new RegExp('(\\d)(?=(\\d{3})+$)', 'ig'), "$1,");
    }

    private _counts = [1000, 1000000, 1000000000, 1000000000000];
    private _units = ['', 'K', 'M', 'B', 'T'];

    /**
     * 将数字缩短显示为K,M,B,T单位
     * @param value 数字
     * @param fixNum 小数点后保留位数
     * @returns 
     */
    kmbt(value: number, fixNum: number = 2): string {
        // //10^4=万, 10^8=亿,10^12=兆,10^16=京，
        // let counts = [1000, 1000000, 1000000000, 1000000000000];
        // let units = ['', 'K', 'M', 'B', 'T'];

        // switch (lang) {
        //     case 'zh':
        //         //10^4=万, 10^8=亿,10^12=兆,10^16=京，
        //         let counts = [10000, 100000000, 1000000000000, 10000000000000000];
        //         let units = ['', '万', '亿', '兆', '京'];
        //         break;
        //     default:
        //         break;
        // }
        return this.compressUnit(value, this._counts, this._units, fixNum);
    }

    /**
     * 设置压缩任意单位
     * @param counts 压缩单位数组
     * @param units 压缩单位文字数组
     */
    setKmbt(counts: number[], units: string[]): void {
        this._counts = counts;
        this._units = units;
    }

    /**
     * 压缩任意单位的数字，后缀加上单位文字
     * @param value 数字
     * @param counts 压缩单位数组
     * @param units 压缩单位文字数组
     * @param fixNum 小数点后保留位数
     * @returns 
     */
    compressUnit(value: number, counts: number[], units: string[], fixNum: number = 2): string {
        let res: string;
        let index: number;
        for (index = 0; index < counts.length; index++) {
            const e = counts[index];
            if (value < e) {
                if (index > 0) {
                    res = (value / counts[index - 1]).toFixed(fixNum);
                } else {
                    res = value.toFixed(0);
                }
                break;
            }

        }
        return res + units[index];
    }

    //#region format
    /**
     * 格式化字符串
     * @param str 字符串
     * @param args 参数
     * @returns 
     */
    format(str: string, ...args: any[]): string {
        let i = -1;
        let params = [];
        if (args[0].constructor === Array) {
            params = args[0];
        }
        else {
            params = args;
        }
        /**
         * 替换字符串
         * @param exp 表达式
         * @param p0 前后补齐（默认向前补齐，-向后补齐）
         * @param p1 补齐字符+补齐位数（补齐字符不设置按空格补齐，还支持`0`补齐）
         * @param p2 小数补齐位数(.2补齐两位小数，.3补齐三位小数)
         * @param p3 指定当前数字进制 (默认10进制，可选#2、#8、#16)
         * @param p4 转换格式 (`%`、`s`、`c`、`f`、`p`、`x`、`o`、`d`、`i`、`t`、`k`)
         * @returns 
         */
        function callback(exp, p0, p1, p2, p3, p4) {
            if (exp == '%%') return '%';
            if (params[++i] === undefined) return undefined;
            exp = p2 ? parseInt(p2.substr(1)) : undefined;
            let base = p3 ? parseInt(p3.substr(1)) : undefined;
            let val;
            switch (p4) {
                case 's': val = params[i]; break;
                case 'c': val = typeof (params[i]) == 'number' ? String.fromCharCode(parseInt(params[i], 10)) : params[i][0]; break;
                case 'f': val = parseFloat(params[i]).toFixed(exp); break;
                case 'p': return (parseFloat(params[i]) * 100).toFixed(exp ? exp : 0) + '%';
                case 'x': val = parseInt(params[i]).toString(base ? base : 16); break;
                case 'o': val = parseInt(params[i]).toString(base ? base : 8); break;
                case 'i':
                case 'd': val = parseFloat(parseInt(params[i], base ? base : 10).toPrecision(exp)).toFixed(0); break;
                case 't': {
                    let tf = "yyyy-MM-dd hh:mm:ss";
                    switch (p1) {
                        case '1':
                            tf = "yyyy-MM-dd";
                            break;
                        case '2':
                            tf = "HH:mm:ss";
                            break;
                        case '3':
                            tf = "HH:mm:ss.fff";
                            break;
                }
                    return stringFormat.parseTime(String(params[i]),tf);
                }
                case 'k': return stringFormat.kmbt(params[i],p2 ? parseInt(p2.substr(1)) : 0);
            }
            val = typeof (val) == 'object' ? JSON.stringify(val) : val.toString(base);
            let sz = parseInt(p1); /* padding size */
            let ch = p1 && p1[0] == '0' ? '0' : ' '; /* is null? */
            while (val.length < sz) val = p0 !== undefined ? val + ch : ch + val; /* is minus? */
            return val;
        }
        let regex = /%(-)?(0?[0-9]+)?([.][0-9]+)?([#][0-9]+)?([%scfpxoditk])/g;
        return str.replace(regex, callback);
    }
    //#endregion
}

/** 字符串格式化 */
export let stringFormat = new StringFormat();
/** 字符串格式化 */
export let format = stringFormat.format;