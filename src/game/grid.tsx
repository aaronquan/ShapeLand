import { Point } from "./geometry";

export class GridArea{
    x1: number; x2: number;
    y1: number; y2: number;
    constructor(){
        this.x1 = 0;
        this.x2 = 0;
        this.y1 = 0;
        this.y2 = 0;
    }
    setP1(p:Point){
        this.x1 = p.x;
        this.y1 = p.y;
    }
    setP2(p:Point){
        this.x2 = p.x;
        this.y2 = p.y;
    }
    clearGrid(){
        this.x1 = 0;
        this.x2 = 0;
        this.y1 = 0;
        this.y2 = 0;
    }
    xRange(){
        const xs = this.x1 >= this.x2 ? [this.x2, this.x1+1] : [this.x1, this.x2+1];
        return xs;
    }
    yRange(){
        const ys = this.y1 >= this.y2 ? [this.y2, this.y1+1] : [this.y1, this.y2+1];
        return ys;
    }
    getCells():Point[]{
        const points:Point[] = [];
        const xs = this.xRange();
        const ys = this.yRange();
        for(let i=xs[0]; i < xs[1]; i++){
            for(let j=ys[0]; j < ys[1]; j++){
                points.push(new Point(i, j));
            }
        }
        return points;
    }
    getRange(){
        return {x: this.xRange(), y: this.yRange()};
    }
    copyTo(ga:GridArea){
        ga.x1 = this.x1;
        ga.x2 = this.x2;
        ga.y1 = this.y1;
        ga.y2 = this.y2;
    }
    copy(ga:GridArea){
        this.x1 = ga.x1;
        this.x2 = ga.x2;
        this.y1 = ga.y1;
        this.y2 = ga.y2;
    }
}