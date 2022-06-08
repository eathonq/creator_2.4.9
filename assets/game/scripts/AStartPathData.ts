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
    //#endregion

    private tiles: cc.Node[][] = [];

    // LIFE-CYCLE CALLBACKS:
    // onLoad () {}

    start() {
        this.initMap();
        setTimeout(() => {
            this.onSearch(0);
        }, 1);
    }

    private initMap() {
        let row_max = 20;
        let col_max = 20;
        this.tiles = [];
        for (let row = 0; row < row_max; row++) {
            for (let col = 0; col < col_max; col++) {
                let node = cc.instantiate(this.templates[0]);
                node.on(cc.Node.EventType.TOUCH_START, () => {
                    console.log(`${col},${row}`);
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

    private initWalls(walls: { x: number, y: number }[]) {
        for (let i = 0; i < walls.length; i++) {
            let wall = walls[i];
            let tile = this.tiles[wall.x][wall.y];
            tile.color = cc.Color.GRAY;
        }
    }

    private initWeights(weights: { x: number, y: number }[]) {
        for (let i = 0; i < weights.length; i++) {
            let weight = weights[i];
            let tile = this.tiles[weight.x][weight.y];
            tile.color = cc.Color.GREEN;
        }
    }

    private setStartEndLayer(start: { x: number, y: number }, end: { x: number, y: number }) {
        this.startEndLayer.removeAllChildren();

        let tileStart = this.tiles[start.x][start.y];
        let tileEnd = this.tiles[end.x][end.y];

        let node = cc.instantiate(this.templates[3]);
        node.on(cc.Node.EventType.TOUCH_START, () => {
            console.log(`${start.x},${start.y}`);
        }, this);
        this.startEndLayer.addChild(node);
        node.setPosition(tileStart.getPosition());

        node = cc.instantiate(this.templates[4]);
        node.on(cc.Node.EventType.TOUCH_START, () => {
            console.log(`${end.x},${end.y}`);
        }
            , this);
        this.startEndLayer.addChild(node);
        node.setPosition(tileEnd.getPosition());
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

        let array: any[] = [];
        array.push({ x: start.x, y: start.y, level: 0 });
        let pre = `${start.x}_${start.y}`;
        while (array.length > 0) {
            let current = array.shift();
            for (const _key in pathMap) {
                let next = pathMap[_key];
                if (next.x == current.x && next.y == current.y) {
                    let arr = _key.split("_");
                    array.push({ x: Number(arr[0]), y: Number(arr[1]), level: current.level + 1 });

                    let node = cc.instantiate(this.templates[2]);
                    this.numberLayer.addChild(node);
                    node.setPosition(this.tiles[next.x][next.y].getPosition());
                    node.getComponent(cc.Label).string = `${current.level + 1}`;
                }
            }
        }
    }

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

    private onSearch(type: number) {
        let walls = [];
        let p = (x: number, y: number) => { return { x: x, y: y } };
        walls.push(p(3, 10), p(4, 10), p(5, 10), p(6, 10), p(7, 10), p(8, 10), p(9, 10), p(10, 10), p(11, 10), p(12, 10), p(13, 10), p(14, 10), p(15, 10));
        walls.push(p(15, 9), p(15, 8), p(15, 7), p(15, 6), p(15, 5), p(15, 4), p(15, 3));

        let weights = [];
        let p2 = (x: number, y: number, w: number) => { return { x: x, y: y, weight: w } };
        weights.push(p2(7, 16, 2), p2(8, 16, 2));

        let start = p(2, 3);
        let end = p(19, 19);

        this.resetMap();
        this.initWalls(walls);
        this.initWeights(weights);
        this.setStartEndLayer(start, end);

        switch (type) {
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

    onToggleEvent(toggle: cc.Toggle) {
        let name = toggle.node.name;
        switch (name) {
            case "1":
                this.onSearch(0);
                break;
            case "2":
                this.onSearch(1);
                break;
            case "3":
                this.onSearch(2);
        }
    }

    // update (dt) {}
}
