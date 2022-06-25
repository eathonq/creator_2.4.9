// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { Algorithms, GridWithWeights, SquareGrid } from "../../core/common/AStart";

const { ccclass, property } = cc._decorator;

class Position {
    x: number;
    y: number;
    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
}
let p = (x: number, y: number) => { return new Position(x, y) };

@ccclass
export default class AStartPathData extends cc.Component {

    //#region 绑定组件
    @property(cc.Node)
    private mapLayer: cc.Node = null;

    @property(cc.Node)
    private pathLayer: cc.Node = null;

    @property(cc.Node)
    private numberLayer: cc.Node = null;

    @property(cc.Node)
    private startEndLayer: cc.Node = null;

    @property([cc.Node])
    private templates: cc.Node[] = [];

    @property(cc.Node)
    private startNode: cc.Node = null;

    @property(cc.Node)
    private endNode: cc.Node = null;

    @property(cc.Node)
    private wallNode: cc.Node = null;

    @property(cc.Node)
    private weightNode: cc.Node = null;
    //#endregion

    private tiles: cc.Node[][] = [];

    // LIFE-CYCLE CALLBACKS:
    // onLoad () {}

    protected start() {
        this.initMap();
        this.initWalls();
        this.initWeights();
        this.initOptions();
        setTimeout(() => {
            this.initStartAndEnd();
            this.updateSearch();
        }, 1);
    }

    //#region 绘制路径相关
    private initMap() {
        let row_max = 20;
        let col_max = 20;
        this.tiles = [];
        for (let row = 0; row < row_max; row++) {
            for (let col = 0; col < col_max; col++) {
                let node = cc.instantiate(this.templates[0]);
                node.on(cc.Node.EventType.TOUCH_END, () => {
                    //console.log(`${col},${row}`);
                    this.setOptions({ x: col, y: row });
                }, this);
                this.mapLayer.addChild(node);
                if (!this.tiles[col])
                    this.tiles[col] = [];
                this.tiles[col][row] = node;
            }
        }
    }

    private resetMap() {
        for (let row = 0; row < this.tiles.length; row++) {
            for (let col = 0; col < this.tiles[row].length; col++) {
                let tile = this.tiles[row][col];
                tile.color = cc.Color.WHITE;
            }
        }
    }

    private _walls = [];
    private initWalls() {
        let walls = [];
        let p = (x: number, y: number) => { return { x: x, y: y } };
        walls.push(p(3, 10), p(4, 10), p(5, 10), p(6, 10), p(7, 10), p(8, 10), p(9, 10), p(10, 10), p(11, 10), p(12, 10), p(13, 10), p(14, 10), p(15, 10));
        walls.push(p(15, 9), p(15, 8), p(15, 7), p(15, 6), p(15, 5), p(15, 4), p(15, 3));

        this.resetWall(...walls);

        this._walls = walls;
    }

    private _weights = [];
    private _w = 2;
    private initWeights() {
        let weights = [];
        let p2 = (x: number, y: number, w: number) => { return { x: x, y: y, weight: w } };
        weights.push(p2(7, 16, this._w), p2(8, 16, this._w));
        weights.push(p2(7, 7, this._w), p2(6, 7, this._w), p2(5, 7, this._w), p2(4, 7, this._w), p2(3, 7, this._w));
        weights.push(p2(7, 6, this._w), p2(7, 5, this._w), p2(7, 4, this._w), p2(7, 3, this._w));

        this.resetWeight(...weights);

        this._weights = weights;
    }

    private _start = p(0, 0);
    private _end = p(0, 0);
    private initStartAndEnd() {
        this._start = p(0, 0);
        this._end = p(19, 19);

        this.resetStartNode(this._start);
        this.resetEndNode(this._end);
    }

    private initOptions() {
        this._options = [];
        this._options.push(this.startNode);
        this._options.push(this.endNode);
        this._options.push(this.wallNode);
        this._options.push(this.weightNode);

        this.startNode.on(cc.Node.EventType.TOUCH_END, () => {
            this.animationOptions(0);
        }, this);

        this.endNode.on(cc.Node.EventType.TOUCH_END, () => {
            this.animationOptions(1);
        }, this);

        this.wallNode.on(cc.Node.EventType.TOUCH_END, () => {
            this.animationOptions(2);
        }, this);

        this.weightNode.on(cc.Node.EventType.TOUCH_END, () => {
            this.animationOptions(3);
        }, this);
    }

    private _options: cc.Node[] = [];
    private _currentOption: number = -1;
    private animationOptions(index: number) {
        this._options.forEach((option) => {
            option.stopAllActions();
            option.scale = 1;
        });

        if (this._currentOption == index) {
            this._currentOption = -1;
            return;
        }
        this._currentOption = index;

        let option = this._options[index];
        cc.tween(option)
            .sequence(cc.scaleTo(0.5, 1.2), cc.scaleTo(0.5, 1))
            .repeatForever()
            .start();
    }

    private setOptions(pos: { x: number, y: number }) {
        if (this._currentOption == -1) return;

        switch (this._currentOption) {
            case 0:
                this.resetStartNode(pos);
                break;
            case 1:
                this.resetEndNode(pos);
                break;
            case 2:
                this.resetWall(pos);
                break;
            case 3:
                this.resetWeight(pos);
                break;
        }

        this.updateSearch();
    }

    private _startNode = null;
    private resetStartNode(pos: { x: number, y: number }) {
        if (!this._startNode) {
            this._startNode = cc.instantiate(this.templates[3]);
            this.startEndLayer.addChild(this._startNode);
        }
        this._startNode.position = this.tiles[pos.x][pos.y].position;
        this._start = pos;
    }

    private _endNode = null;
    private resetEndNode(pos: { x: number, y: number }) {
        if (!this._endNode) {
            this._endNode = cc.instantiate(this.templates[4]);
            this.startEndLayer.addChild(this._endNode);
        }
        this._endNode.position = this.tiles[pos.x][pos.y].position;
        this._end = pos;
    }

    private resetWall(...potions: { x: number, y: number }[]) {
        if (potions.length == 0) return;
        if (potions.length == 1) {
            let pos = potions[0];
            if (this.tiles[pos.x][pos.y].color.equals(this.wallNode.color)) {
                this.tiles[pos.x][pos.y].color = cc.Color.WHITE;

                // 从中移除_walls
                for (const iterator of this._walls) {
                    if (iterator.x == pos.x && iterator.y == pos.y) {
                        this._walls.splice(this._walls.indexOf(iterator), 1);
                        break;
                    }
                }
            }
            else {
                this.tiles[pos.x][pos.y].color = this.wallNode.color;

                // 加入_walls
                this._walls.push(pos);
            }

            this.updateSearch();
        }
        else {
            potions.forEach((pos) => {
                this.tiles[pos.x][pos.y].color = this.wallNode.color;
            });
        }
    }

    private resetWeight(...potions: { x: number, y: number }[]) {
        if (potions.length == 0) return;
        if (potions.length == 1) {
            let pos = potions[0];
            if (this.tiles[pos.x][pos.y].color.equals(this.weightNode.color)) {
                this.tiles[pos.x][pos.y].color = cc.Color.WHITE;

                // 从中移除_weights
                for (const iterator of this._weights) {
                    if (iterator.x == pos.x && iterator.y == pos.y) {
                        this._weights.splice(this._weights.indexOf(iterator), 1);
                        break;
                    }
                }
            }
            else {
                this.tiles[pos.x][pos.y].color = this.weightNode.color;

                // 加入_weights
                //let p2 = (x: number, y: number, w: number) => { return { x: x, y: y, weight: w } };
                this._weights.push({x: pos.x, y: pos.y, weight: this._w});
            }

            this.updateSearch();
        }
        else {
            potions.forEach((pos) => {
                this.tiles[pos.x][pos.y].color = this.weightNode.color;
            });
        }
    }

    private setPathLayer(path: Position[]) {
        this.pathLayer.removeAllChildren();

        for (let i = 0; i < path.length; i++) {
            let tile = this.tiles[path[i].x][path[i].y];
            let node = cc.instantiate(this.templates[1]);
            this.pathLayer.addChild(node);
            node.setPosition(tile.getPosition());
            node.color = cc.Color.GRAY;
            node.opacity = 200;
        }
    }

    private setNumberLayer(pathMap: {}, start: Position) {
        this.numberLayer.removeAllChildren();

        let tmpNumberMap = {};
        let array: any[] = [];
        array.push({ x: start.x, y: start.y, level: 0 });
        while (array.length > 0) {
            let current = array.shift();
            for (const _key in pathMap) {
                let next = pathMap[_key];
                if (next.x == current.x && next.y == current.y) {
                    let arr = _key.split("_");
                    array.push({ x: Number(arr[0]), y: Number(arr[1]), level: current.level + 1 });

                    if (!tmpNumberMap[`${next.x}_${next.y}`]) {
                        let node = cc.instantiate(this.templates[2]);
                        this.numberLayer.addChild(node);
                        node.setPosition(this.tiles[next.x][next.y].getPosition());
                        node.getComponent(cc.Label).string = `${current.level + 1}`;
                        tmpNumberMap[`${next.x}_${next.y}`] = true;
                    }
                }
            }
        }
        tmpNumberMap = {};
    }
    //#endregion

    private breadthFirstSearch(width: number, height: number, walls: Position[], start: Position, end: Position) {
        let graph = new SquareGrid(width, height, walls);
        let pathMap = Algorithms.breadth_first_search(graph, start, end);
        let path = Algorithms.reconstruct_path(pathMap, start, end);

        this.setNumberLayer(pathMap, start);
        this.setPathLayer(path);
    }

    private dijkstraSearch(width: number, height: number, walls: any[], weights: any[], start: Position, end: Position) {
        let graph = new GridWithWeights(width, height, walls, weights);
        let pathMap = Algorithms.dijkstra_search(graph, start, end);
        let path = Algorithms.reconstruct_path(pathMap, start, end);

        this.setNumberLayer(pathMap, start);
        this.setPathLayer(path);
    }

    private a_star_search(width: number, height: number, walls: any[], weights: any[], start: Position, end: Position) {
        let graph = new GridWithWeights(width, height, walls, weights);
        let pathMap = Algorithms.a_star_search(graph, start, end);
        let path = Algorithms.reconstruct_path(pathMap, start, end);

        this.setNumberLayer(pathMap, start);
        this.setPathLayer(path);
    }

    private updateSearch() {
        let walls = this._walls;
        let weights = this._weights;
        let start = this._start;
        let end = this._end;
        switch (this._currentType) {
            case 0:
                this.breadthFirstSearch(20, 20, walls, start, end);
                break;
            case 1:
                this.dijkstraSearch(20, 20, walls, weights, start, end);
                break;
            case 2:
                this.a_star_search(20, 20, walls, weights, start, end);
                break;
        }
    }

    private _currentType: number = 0;
    onToggleEvent(toggle: cc.Toggle) {
        let name = toggle.node.name;
        this._currentType = Number(name);
        this.updateSearch();
    }

    // update (dt) {}
}
