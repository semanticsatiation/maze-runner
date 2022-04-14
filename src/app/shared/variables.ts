export const defaultNode = {
    f: 999999999, 
    g: 999999999, 
    h: 999999999,
    parent: undefined, 
    seen: false, 
    final: false,
    closed: false,
    wall: false,
    // weight cost is 20
    weight: false
};

export const basicDirections = [[1, 0],[0, 1],[-1, 0],[0, -1]];
export const diagonals = [[1, 1], [-1, -1], [1, -1], [-1, 1]];

// a* algorithm: f(n) = g(n) + h(n)
export const ASTAR = "A*";

// Dijkstra’s algorithm: f(n) = g(n)
export const DIJ = "Dijkstra";

// Greedy Best First Search's algorithm: f(n) = h(n)
export const GBFS = "Greedy Best First Search";

// uses Queue
export const BFS = "Breadth First Search";

// uses Stack
export const DFS = "Depth First Search";