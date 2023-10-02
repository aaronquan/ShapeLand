import { Point, Vector2D } from "../../game/shapes";
import { CenterPointRectangle, TLRectangle } from "./Shapes";


export class Line{
    p1:Point;
    p2:Point;
    constructor(p1:Point, p2:Point){
        this.p1 = p1;
        this.p2 = p2;
    }
    draw(cr:CanvasRenderingContext2D){
        cr.beginPath();
        cr.moveTo(this.p1.x, this.p1.y);
        cr.lineTo(this.p2.x, this.p2.y);
        cr.stroke();
    }
}

export class BasicTree{
    position:Point;
    branchRecursions:number;
    branchSize:number;
    branchLenMulti: number;
    rad:number;
    lines:Line[] | undefined;
    constructor(pt: Point, recursions:number, bs:number, blm:number, rad:number){
        this.position = pt;
        this.branchRecursions = recursions;
        this.branchSize = bs;
        this.branchLenMulti = blm;
        this.rad = rad;

        this.lines = undefined;
    }
    getLines():Line[]{
        const dx = Math.sin(this.rad);
        const dy = Math.cos(this.rad);
        const nvec = new Vector2D(dx, dy);
        nvec.multi(this.branchSize);
        type bVec = {
            left:Vector2D[]; 
            right:Vector2D[]; 
            cvec:Vector2D;
        }
        const branchVectors:bVec = Array.from(Array(this.branchRecursions)).reduce(
            (val:bVec) => {
                val.cvec.multi(this.branchLenMulti);
                const left = val.cvec.copy();
                left.x = -left.x;
                return {
                    cvec: val.cvec,
                    left: val.left.concat(left),
                    right: val.right.concat(val.cvec.copy())
                }
            },
        {left: [], right: [], cvec: nvec});
        const p1 = new Point(this.position.x, this.position.y);
        const p2 = new Point(this.position.x, this.position.y+this.branchSize)
        const lines:Line[] = [new Line(p1, p2)];
        const points = [new Point(this.position.x, this.position.y+this.branchSize)];
        for(let i=0; i<this.branchRecursions; ++i){
            const newPoints = [];
            while(points.length > 0){
                const pt:Point = points.pop() as Point;
                const bLeft = branchVectors.left[i];
                const endLeft = pt.copy();
                endLeft.addVector(bLeft);
                newPoints.push(endLeft);
                lines.push(new Line(pt, endLeft));

                const bRight = branchVectors.right[i];
                const endRight = pt.copy();
                endRight.addVector(bRight);
                newPoints.push(endRight);

                lines.push(new Line(pt, endRight));
            }
            points.push(...newPoints);
        }
        this.lines = lines;
        return lines;
    }
    draw(cr:CanvasRenderingContext2D){
        if(!this.lines) this.getLines();
        if(this.lines){
            this.lines.forEach((line) => {
                line.draw(cr);
            })
        }
    }
}

export class RandomLinePath{
    detail:number;
    p1:Point;
    p2:Point;
    displacement:number;
    constructor(p1:Point, p2:Point, disp:number, detail:number){
        this.p1 = p1;
        this.p2 = p2;
        this.displacement = disp;
        this.detail = detail;
    }
    generateLines():Line[]{
        const rec = this.recStep(this.p1.x, this.p1.y, this.p2.x, this.p2.y, this.displacement, []);
        return rec;
    }
    recStep(x1:number,y1:number,x2:number,y2:number, disp:number, lines:Line[]):Line[]{
        if(disp < this.detail){
            const nLines = [...lines];
            nLines.push(new Line(new Point(x1, y1), new Point(x2, y2)));
            return nLines;
        }else{
            let midX = (x1+x2)/2;
            let midY = (y1+y2)/2;
            midX = midX + (Math.random()-0.5) * disp;
            midY = midY + (Math.random()-0.5) * disp;
            return this.recStep(x1,y1,midX,midY,disp/2.0, lines).concat(this.recStep(x2,y2,midX,midY,disp/2.0, lines));
        }
    }
    draw(cr:CanvasRenderingContext2D){

    }
}