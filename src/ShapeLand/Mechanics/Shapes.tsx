import { Point } from "../../game/geometry";


export class Circle{
    position: Point;
    diameter: number;
    constructor(p:Point, dia:number){
        this.position = p;
        this.diameter = dia;
    }
    draw(cr:CanvasRenderingContext2D){
        
    }
}

export class Rectangle{
    width:number;
    height:number;
    constructor(width:number, height:number){
        this.width = width;
        this.height = height;
    }
    draw(cr:CanvasRenderingContext2D){
        cr.fillRect(0, 0, this.width, this.height);
    }
    outline(cr:CanvasRenderingContext2D){
        cr.strokeRect(0, 0, this.width, this.height);
    }
}

export class TLRectangle extends Rectangle{
    pt:Point;
    constructor(pt:Point, width:number, height:number){
        super(width, height);
        this.pt = pt;
    }
    isPointInside(pt:Point):boolean{
        return (pt.x > this.pt.x && pt.x < this.pt.x+this.width) &&
        (pt.y > this.pt.y && pt.y < this.pt.y+this.height);
    }
    draw(cr:CanvasRenderingContext2D){
        cr.fillRect(this.pt.x, this.pt.y, this.width, this.height);
    }
    outline(cr:CanvasRenderingContext2D){
        cr.strokeRect(this.pt.x, this.pt.y, this.width, this.height);
    }
}

export class CenterPointRectangle extends Rectangle{
    pt:Point;
    hw:number;
    hh:number;
    constructor(pt:Point, width:number, height:number){
        super(width, height);
        this.hw = width/2;
        this.hh = height/2;
        this.pt = new Point(pt.x, pt.y);
    }
    isPointInside(pt:Point):boolean{
        return (pt.x > this.pt.x-this.hw && pt.x < this.pt.x+this.hw) &&
        (pt.y > this.pt.y-this.hh && pt.y < this.pt.y+this.hh);
    }
    draw(cr:CanvasRenderingContext2D){
        cr.fillRect(this.pt.x-this.hw, this.pt.y-this.hh, this.width, this.height);
    }
    outline(cr:CanvasRenderingContext2D){
        cr.strokeRect(this.pt.x-this.hw, this.pt.y-this.hh, this.width, this.height);
    }
}