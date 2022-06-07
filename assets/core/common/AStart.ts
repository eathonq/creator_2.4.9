
//#region Graph
class SimpleGraph {
    edges: any[][];
    constructor() {
        this.edges = [];
    }
    neighbors(id: { x: number; y: number; }) {
        return this.edges[id.x][id.y] || [];
    }
}

class SquareGrid {
    private width: number;
    private height: number;
    private walls: boolean[][];
    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
        this.walls = [];
    }

    private inBounds(id: { x: number; y: number; }) {
        return id.x >= 0 && id.x < this.width && id.y >= 0 && id.y < this.height;
    }

    private passable(id: { x: number; y: number; }) {
        return !this.walls[id.x][id.y];
    }

    neighbors(id: { x: number; y: number; }) {
        const { x, y } = id;
        const results = [{ x: x + 1, y: y }, { x: x, y: y - 1 }, { x: x - 1, y: y }, { x: x, y: y + 1 }];
        if ((x + y) % 2 == 0) {
            results.reverse();
        }
        return results.filter(id => this.inBounds(id) && this.passable(id));
    }
}

class GridWithWeights extends SquareGrid {
    private weights: number[][];
    constructor(width: number, height: number) {
        super(width, height);
        this.weights = [];
    }

    cost(from: { x: number; y: number; }, to: { x: number; y: number; }) {
        return this.weights[to.x][to.y] || 1;
    }
}
//#endregion

//#region Queue
class Queue {
    private elements: any[];
    constructor() {
        this.elements = [];
    }

    empty() {
        return this.elements.length == 0;
    }

    put(item: { x: number; y: number; }) {
        this.elements.push(item);
    }

    get() {
        return this.elements.shift();
    }
}

class PriorityQueue {
    private elements: any[];
    constructor() {
        this.elements = [];
    }

    empty() {
        return this.elements.length == 0;
    }

    put(item: { x: number; y: number; }, priority: number) {
        let added = false;
        for (let i = 0; i < this.elements.length; i++) {
            if (this.elements[i].priority > priority) {
                this.elements.splice(i, 0, item);
                added = true;
                break;
            }
        }
        if (!added) {
            this.elements.push(item);
        }
    }

    get() {
        return this.elements.shift();
    }
}

//#endregion

//#region Algorithms

/** 寻路算法 */
class Algorithms {
    /**
     * 广度优先搜索
     * @param graph 图 
     * @param start 起点
     * @param goal 终点
     * @returns 路径(二维路径数组)
     */
    breadth_first_search(graph: SquareGrid, start: { x: number; y: number; }, goal: { x: number; y: number; }) {
        let frontier = new Queue();
        frontier.put(start);
        let came_from: any[][] = [];
        came_from[start.x][start.y] = start;

        while (!frontier.empty()) {
            let current = frontier.get();

            if (current == goal)
                break;

            for (let next of graph.neighbors(current)) {
                if (!came_from[next.x][next.y]) {
                    frontier.put(next);
                    came_from[next.x][next.y] = current;
                }
            }

            return came_from;
        }
    }

    /**
     * dijkstra 算法
     * @param graph 图
     * @param start 起点
     * @param goal 终点
     * @returns 路径(二维路径数组)
     */
    dijkstra_search(graph: GridWithWeights, start: { x: number; y: number; }, goal: { x: number; y: number; }) {
        let frontier = new PriorityQueue();
        frontier.put(start, 0);
        let came_from: any[][] = [];
        came_from[start.x][start.y] = start;
        let cost_so_far: number[][] = [];
        cost_so_far[start.x][start.y] = 0;

        while (!frontier.empty()) {
            let current = frontier.get();

            if (current == goal)
                break;

            for (let next of graph.neighbors(current)) {
                let new_cost = cost_so_far[current.x][current.y] + graph.cost(current, next);
                if (!cost_so_far[next.x][next.y] || new_cost < cost_so_far[next.x][next.y]) {
                    cost_so_far[next.x][next.y] = new_cost;
                    let priority = new_cost;
                    frontier.put(next, priority);
                    came_from[next.x][next.y] = current;
                }
            }
        }

        return came_from;
    }

    /**
     * 重建路径
     * @param came_from 路径(二维路径数组)
     * @param start 起点
     * @param goal 终点
     * @returns 路径
     */
    reconstruct_path(came_from: any[][], start: { x: number; y: number; }, goal: { x: number; y: number; }) {
        let current = goal;
        let path = [];
        while (current != start) {
            path.push(current);
            current = came_from[current.x][current.y];
        }
        path.push(start);
        path.reverse();
        return path;
    }

    /**
     * heuristic 函数
     * @param a 点a
     * @param b 点b
     * @returns heuristic 值
     */
    heuristic(a: { x: number; y: number; }, b: { x: number; y: number; }) {
        // 曼哈顿距离
        return (Math.abs(a.x - b.x) + Math.abs(a.y - b.y)) * this.distance_multiplier;

        // 对角距离
        // let dx = Math.abs(a.x - b.x);
        // let dy = Math.abs(a.y - b.y);
        // return (dx + dy) * this.distance_multiplier * 1.41421;

        // 欧几里得距离
        // let dx = Math.abs(a.x - b.x);
        // let dy = Math.abs(a.y - b.y);
        // return (Math.sqrt(dx*dx + dy*dy))*this.distance_multiplier;
    }

    /**
     * 两个相邻点之间移动的代价
     */
    distance_multiplier = 1;

    /**
     * A*算法
     * @param graph 图 
     * @param start 起点
     * @param goal 终点
     * @returns 路径(二维路径数组)
     */
    a_star_search(graph: GridWithWeights, start: { x: number; y: number; }, goal: { x: number; y: number; }) {
        let frontier = new PriorityQueue();
        frontier.put(start, 0);
        let came_from: any[][] = [];
        came_from[start.x][start.y] = start;
        let cost_so_far: number[][] = [];
        cost_so_far[start.x][start.y] = 0;

        while (!frontier.empty()) {
            let current = frontier.get();

            if (current == goal)
                break;

            for (let next of graph.neighbors(current)) {
                let new_cost = cost_so_far[current.x][current.y] + graph.cost(current, next);
                if (!cost_so_far[next.x][next.y] || new_cost < cost_so_far[next.x][next.y]) {
                    cost_so_far[next.x][next.y] = new_cost;
                    let priority = new_cost + this.heuristic(goal, next);
                    frontier.put(next, priority);
                    came_from[next.x][next.y] = current;
                }
            }
        }

        return came_from;
    }
}
//#endregion