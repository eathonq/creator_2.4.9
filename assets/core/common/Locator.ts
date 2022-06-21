/**
 * CREATOR_2.4.9
 * DateTime = Tue Jun 21 2022 17:35:56 GMT+0800 (中国标准时间)
 * Author = eathon
 * github = https://github.com/eathonq/creator_2.4.9.git
 * email = vangagh@live.cn
 */

/**
 * 定位器
 */
export default class Locator {
    /**
     * 定位解析
     * @param locator 定位地址
     * @returns {Array} 名称数组
     */
    private static parse(locator: string): Array<{ symbol: string, name: string }> {
        //使用正则表达示分隔名字
        let names = locator.split(/[.,//,>,#]/g);
        let segments = names.map(function (name) {
            let index = locator.indexOf(name);
            let symbol = locator[index - 1] || '>';
            return { symbol: symbol, name: name.trim() };
        });
        return segments;
    }

    static timeout: number;
    private static locating: boolean = false;
    private static startTime: number = 0;
    /**
     * 定位节点
     * @param root 根节点
     * @param locator 定位地址
     * @param cb 回调
     * @returns 
     */
    static locateNode(root: cc.Node, locator: string, cb: Function) {
        if (!this.locating) {
            this.startTime = Date.now();
            this.locating = true;
        }

        let segments = this.parse(locator);
        let child: cc.Node;
        let node = root;

        for (let i = 0; i < segments.length; i++) {
            let item = segments[i];
            switch (item.symbol) {
                case '/':
                    child = node.getChildByName(item.name);
                    break;
                case '.':
                    child = node[item.name];
                    break;
                case '>':
                    child = this.seekNodeByName(node, item.name);
                    break;
                case '#':
                    child = this.seekNodeByTag(node, item.name);
                    break;
            }

            if (!child) {
                node = null;
                break;
            }
            node = child;
        }

        if (node && node.active && cb) {
            this.locating = false;
            cb(null, node);
        } else if (cb) {
            if (Date.now() - this.startTime > this.timeout) {
                cb({ error: 'timeout', locator });
            } else {
                setTimeout(function () {
                    Locator.locateNode(root, locator, cb);
                }, 10);
            }
        }

        return node;
    }

    /**
     * 寻找节点
     * @param root 根节点 
     * @param name 节点名称
     * @returns 
     */
    static seekNodeByName(root: cc.Node, name: string): cc.Node {
        if (root.name == name) {
            return root;
        }

        let children = root.children;
        for (let i = 0; i < children.length; i++) {
            let node = this.seekNodeByName(children[i], name);
            if (node) {
                return node;
            }
        }
    }

    /**
     * 寻找节点
     * @param root 根节点
     * @param tag 节点标签
     * @returns 
     */
    static seekNodeByTag(root: cc.Node, tag: string): cc.Node {
        if (root[tag]) {
            return root;
        }

        let children = root.children;
        for (let i = 0; i < children.length; i++) {
            let node = this.seekNodeByTag(children[i], tag);
            if (node) {
                return node;
            }
        }
    }

    /**
     * 获取节点全路径
     * @param node 
     * @returns 
     */
    static getNodeFullPath(node: cc.Node): string {
        let array = [];
        let temp = node;
        do {
            array.unshift(temp.name);
            temp = temp.parent;
        } while (temp && temp.name !== 'Canvas')
        return array.join('/');
    }
}
