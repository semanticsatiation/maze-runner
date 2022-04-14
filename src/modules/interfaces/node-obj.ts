export interface NodeObj {
    pos: number[],
    f: number, 
    g: number, 
    h: number,
    parent?: NodeObj, 
    seen: boolean, 
    final: boolean,
    closed: boolean,
    wall: boolean,
    weight: boolean
}
export interface MiniNodeObj {
    pos: number[],
  };