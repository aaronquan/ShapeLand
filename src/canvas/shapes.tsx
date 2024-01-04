import { Point, Vector2D, VirtCircle, VirtLine, VirtRect, VirtTriangle } from "../game/geometry";
import { DragShape, InteractableControl } from "./controls";

export interface CanvasShape{
    getPoint():Point;
    setPoint(pt:Point):void;
    movePoint(diff:Vector2D):void;
    isInside(pt:Point):boolean;
    intersectsShape(shape:CanvasShape):boolean;
    draw(cr:CanvasRenderingContext2D):void;
}

class BasicShape implements CanvasShape{
    position: Point;
    constructor(pt?:Point){
        this.position = pt ? pt : new Point();
    }
    getPoint(): Point {
        return this.position;
    }
    setPoint(pt: Point): void {
        this.position = pt;
    }
    movePoint(diff: Vector2D): void {
        this.position.addVector(diff);
    }
    isInside(pt: Point): boolean {
        //to override
        return false;
    }
    intersectsShape(shape:CanvasShape):boolean{
        return false;
    }
    draw(cr: CanvasRenderingContext2D): void {
        //to override
    }
}

export class ShapeCollection implements CanvasShape{
    basePoint:Point;
    shapes:CanvasShape[];
    constructor(pt?:Point){
        this.basePoint = pt ? pt : new Point();
        this.shapes = [];
    }
    getPoint():Point{
        return this.basePoint;
    }
    setPoint(pt:Point):void{
        this.basePoint = pt;
    }
    movePoint(diff:Vector2D):void{
        this.basePoint.addVector(diff);
    }
    isInside(pt:Point):boolean{
        for(let i=0; i<this.shapes.length; i++){
            if(this.shapes[i].isInside(pt)){
                return true;
            }
        }
        return false;
    }
    intersectsShape(shape:CanvasShape):boolean{
        return false;
    }
    draw(cr:CanvasRenderingContext2D):void{
        cr.translate(this.basePoint.x, this.basePoint.y);
        this.shapes.forEach((shape) => {
            shape.draw(cr);
        });
    }
}

export class BaseRectangle implements CanvasShape{
    width:number;
    height:number;
    constructor(width:number, height:number){
        this.width = width;
        this.height = height;
    }
    getPoint():Point{
        return new Point();
    }
    setPoint(pt:Point):void{

    }
    movePoint(diff:Vector2D):void{

    }
    isInside(pt:Point):boolean{
        return (pt.x > 0 && pt.x < this.width 
            && pt.y > 0 && pt.y < this.height);
    }
    intersectsShape(shape:CanvasShape):boolean{
        return false;
    }
    draw(cr:CanvasRenderingContext2D){
        cr.fillRect(0, 0, this.width, this.height);
    }
    outline(cr:CanvasRenderingContext2D){
        cr.strokeRect(0, 0, this.width, this.height);
    }
}

export class TLRectangle extends BaseRectangle{
    pt:Point;
    constructor(pt:Point, width:number, height:number){
        super(width, height);
        this.pt = pt;
    }
    getPoint():Point{
        return this.pt;
    }
    setPoint(pt:Point):void{
        this.pt = pt;
    }
    movePoint(diff:Vector2D){
        this.pt.addVector(diff);
    }
    isInside(pt:Point):boolean{
        return (pt.x > this.pt.x && pt.x < this.pt.x+this.width) &&
        (pt.y > this.pt.y && pt.y < this.pt.y+this.height);
    }
    intersectsShape(shape:CanvasShape):boolean{
        return false;
    }
    draw(cr:CanvasRenderingContext2D){
        cr.fillRect(this.pt.x, this.pt.y, this.width, this.height);
    }
    outline(cr:CanvasRenderingContext2D){
        cr.strokeRect(this.pt.x, this.pt.y, this.width, this.height);
    }
}

export class CenterPointRectangle extends BaseRectangle{
    pt:Point;
    hw:number;
    hh:number;
    constructor(pt:Point, width:number, height:number){
        super(width, height);
        this.hw = width/2;
        this.hh = height/2;
        this.pt = new Point(pt.x, pt.y);
    }
    getPoint():Point{
        return this.pt;
    }
    setPoint(pt:Point):void{
        this.pt = pt;
    }
    movePoint(diff:Vector2D){
        this.pt.addVector(diff);
    }
    isInside(pt:Point):boolean{
        return (pt.x > this.pt.x-this.hw && pt.x < this.pt.x+this.hw) &&
        (pt.y > this.pt.y-this.hh && pt.y < this.pt.y+this.hh);
    }
    intersectsShape(shape:CanvasShape):boolean{
        return false;
    }
    draw(cr:CanvasRenderingContext2D){
        cr.fillRect(this.pt.x-this.hw, this.pt.y-this.hh, this.width, this.height);
    }
    outline(cr:CanvasRenderingContext2D){
        cr.strokeRect(this.pt.x-this.hw, this.pt.y-this.hh, this.width, this.height);
    }
}

export class IsoscelesTrapezium extends BasicShape{
    baseWidth:number;
    extendWidth:number;
    halfHeight:number;
    constructor(baseWidth:number, extendWidth:number, halfHeight:number, pt?:Point){
        super(pt);
        this.baseWidth = baseWidth;
        this.extendWidth = extendWidth;
        this.halfHeight = halfHeight;
    }
    draw(cr:CanvasRenderingContext2D):void{
        cr.translate(this.position.x, this.position.y);
        cr.beginPath();
        cr.moveTo(-this.halfHeight, this.baseWidth);
        cr.lineTo(this.halfHeight, this.extendWidth);
        cr.lineTo(this.halfHeight, -this.extendWidth);
        cr.lineTo(-this.halfHeight, -this.baseWidth);
        cr.closePath();
        cr.fill();
    }
}

export class BaseCircle extends BasicShape{
    radius: number;
    diameter: number;
    constructor(center: Point, radius:number){
        super(center);
        this.radius = radius;
        this.diameter = radius*2;
    }
    setRadius(radius:number){
        if(radius > 0){
            this.radius = radius;
            this.diameter = radius*2;
        }
    }
    isInside(pt:Point):boolean{
        const dx = pt.x - this.position.x;
        const dy = pt.y - this.position.y;
        const xcal = (dx * dx) / (this.diameter * this.diameter);
	    const ycal = (dy * dy) / (this.diameter * this.diameter);
        return xcal + ycal <= 1;
    }
    draw(cr:CanvasRenderingContext2D){
        cr.beginPath();
        cr.arc(this.position.x, this.position.y, this.radius, 0, 2 * Math.PI);
        cr.fill();
    }
} 

export class ResizeRectangle extends TLRectangle implements InteractableControl{
    dragRect: DragShape;
    //topLeftPoint:Point;
    topLeftAdjuster: DragShape;
    topRightPoint: Point;
    topRightAdjuster: DragShape;
    bottomLeftPoint: Point;
    bottomLeftAdjuster: DragShape;
    bottomRightPoint: Point;
    bottomRightAdjuster: DragShape;

    //flipAction:boolean; // flag when rectangle movement flips
    constructor(pt:Point, width:number, height:number){
        super(pt, width, height);
        this.topRightPoint = new Point(pt.x+width, pt.y);
        this.bottomLeftPoint = new Point(pt.x, pt.y+height);
        this.bottomRightPoint = new Point(pt.x+width, pt.y+height);
        this.dragRect = new DragShape(this);
        this.dragRect.dragFunction = (diff) => {
            this.topRightPoint.addVector(diff);
            this.bottomLeftPoint.addVector(diff);
            this.bottomRightPoint.addVector(diff);
        }
        this.topLeftAdjuster = new DragShape(new BaseCircle(this.pt, 4));
        this.topLeftAdjuster.dragFunction = (diff, pt) => {
            this.width -= diff.x;
            this.height -= diff.y;
            this.bottomLeftPoint.x += diff.x;
            this.topRightPoint.y += diff.y;
            if(this.width < 0){
                this.topLeftAdjuster.selected = false;
                this.width = -this.width;
                this.topRightAdjuster.selected = true;
                this.topRightAdjuster.lastPoint = this.pt.copy();
                this.swapPoints(this.pt, this.topRightPoint);
                this.swapPoints(this.bottomLeftPoint, this.bottomRightPoint);
            }
            if(this.height < 0){
                this.topLeftAdjuster.selected = false;
                this.height= -this.height;
                this.bottomLeftAdjuster.selected = true;
                this.bottomLeftAdjuster.lastPoint = this.pt.copy();
                this.swapPoints(this.pt, this.bottomLeftPoint);
                this.swapPoints(this.topRightPoint, this.bottomRightPoint);
            }

        }
        this.topRightAdjuster = new DragShape(new BaseCircle(this.topRightPoint, 4));
        this.topRightAdjuster.dragFunction = (diff) => {
            this.width += diff.x;
            this.height -= diff.y;
            this.pt.y += diff.y;
            this.bottomRightPoint.x += diff.x;
            if(this.width < 0){
                this.topRightAdjuster.selected = false;
                this.width = -this.width;
                this.topLeftAdjuster.selected = true;
                this.topLeftAdjuster.lastPoint = this.topRightPoint.copy();
                this.swapPoints(this.pt, this.topRightPoint);
                this.swapPoints(this.bottomLeftPoint, this.bottomRightPoint);
            }
            if(this.height < 0){
                this.topRightAdjuster.selected = false;
                this.height = -this.height;
                this.bottomRightAdjuster.selected = true;
                this.bottomRightAdjuster.lastPoint = this.topRightPoint.copy();
                this.swapPoints(this.pt, this.bottomLeftPoint);
                this.swapPoints(this.topRightPoint, this.bottomRightPoint);
            }
        }
        this.bottomLeftAdjuster = new DragShape(new BaseCircle(this.bottomLeftPoint, 4));
        this.bottomLeftAdjuster.dragFunction = (diff) => {
            this.width -= diff.x;
            this.height += diff.y;
            this.pt.x += diff.x;
            this.bottomRightPoint.y += diff.y;
            if(this.width < 0){
                this.bottomLeftAdjuster.selected = false;
                this.width = -this.width;
                this.bottomRightAdjuster.selected = true;
                this.bottomRightAdjuster.lastPoint = this.bottomLeftPoint.copy();
                this.swapPoints(this.pt, this.topRightPoint);
                this.swapPoints(this.bottomLeftPoint, this.bottomRightPoint);
            }
            if(this.height < 0){
                this.bottomLeftAdjuster.selected = false;
                this.height= -this.height;
                this.topLeftAdjuster.selected = true;

                this.topLeftAdjuster.lastPoint = this.bottomLeftPoint.copy();
                this.swapPoints(this.pt, this.bottomLeftPoint);
                this.swapPoints(this.topRightPoint, this.bottomRightPoint);
            }
        }
        this.bottomRightAdjuster = new DragShape(new BaseCircle(this.bottomRightPoint, 4));
        this.bottomRightAdjuster.dragFunction = (diff) => {
            this.width += diff.x;
            this.height += diff.y;
            this.topRightPoint.x += diff.x;
            this.bottomLeftPoint.y += diff.y;
            if(this.width < 0){
                this.bottomRightAdjuster.selected = false;
                this.width = -this.width;
                this.bottomLeftAdjuster.selected = true;
                this.bottomLeftAdjuster.lastPoint = this.bottomRightPoint.copy();
                this.swapPoints(this.pt, this.topRightPoint);
                this.swapPoints(this.bottomLeftPoint, this.bottomRightPoint);
            }
            if(this.height < 0){
                this.bottomRightAdjuster.selected = false;
                this.height= -this.height;
                this.topRightAdjuster.selected = true;
                this.topRightAdjuster.lastPoint = this.bottomRightPoint.copy();
                this.swapPoints(this.pt, this.bottomLeftPoint);
                this.swapPoints(this.topRightPoint, this.bottomRightPoint);
            }
        }
        //this.flipAction = false;
    }
    swapPoints(p1:Point, p2:Point){
        const tmp = p1.copy();
        p1.set(p2);
        p2.set(tmp);
    }
    mouseMove(pt: Point): void {
        this.topLeftAdjuster.mouseMove(pt);
        if(this.topLeftAdjuster.selected) return;
        this.topRightAdjuster.mouseMove(pt);
        if(this.topRightAdjuster.selected) return;
        this.bottomLeftAdjuster.mouseMove(pt);
        if(this.bottomLeftAdjuster.selected) return;
        this.bottomRightAdjuster.mouseMove(pt);
        if(this.bottomRightAdjuster.selected) return;
        this.dragRect.mouseMove(pt);
    }
    mouseDown(pt: Point): void {
        this.dragRect.mouseDown(pt);
        this.topLeftAdjuster.mouseDown(pt);
        this.topRightAdjuster.mouseDown(pt);
        this.bottomLeftAdjuster.mouseDown(pt);
        this.bottomRightAdjuster.mouseDown(pt);
    }
    mouseUp(pt: Point): void {
        this.dragRect.mouseUp(pt);
        this.topLeftAdjuster.mouseUp(pt);
        this.topRightAdjuster.mouseUp(pt);
        this.bottomLeftAdjuster.mouseUp(pt);
        this.bottomRightAdjuster.mouseUp(pt);
    }
    getRectSpace?(): VirtRect {
        throw new Error("Method not implemented.");
    }
    draw(cr:CanvasRenderingContext2D):void{
        cr.fillStyle = 'green';
        super.draw(cr);
        cr.fillStyle = 'red';
        this.topLeftAdjuster.draw(cr);
        this.bottomLeftAdjuster.draw(cr);
        this.topRightAdjuster.draw(cr);
        this.bottomRightAdjuster.draw(cr);

        cr.fillStyle = 'white';
        cr.fillText('tl', this.pt.x, this.pt.y);
        cr.fillText('bl', this.bottomLeftPoint.x, this.bottomLeftPoint.y);
        cr.fillText('tr', this.topRightPoint.x, this.topRightPoint.y);
        cr.fillText('br', this.bottomRightPoint.x, this.bottomRightPoint.y);
    }
}

export class ResizeCircle extends BaseCircle implements InteractableControl{
    rect: TLRectangle;
    dragRect: DragShape;
    topLeftAdjuster: DragShape;
    topLeftPoint:Point;

    bottomRightPoint:Point;

    adjusters: DragShape[];
    constructor(center: Point=new Point(0, 0), radius:number=10, resizeRadius:number=1){
        super(center, radius);
        this.topLeftPoint = new Point(center.x-radius, center.y-radius);
        this.bottomRightPoint = new Point(center.x+radius, center.y+radius);
        this.rect = new TLRectangle(this.topLeftPoint, radius*2, radius*2);
        this.dragRect = new DragShape(this.rect);
        this.dragRect.dragFunction = (diff) => {
            //console.log(diff);
            this.position.addVector(diff);
            this.topLeftPoint.addVector(diff);
            this.bottomRightPoint.addVector(diff);
            //this.dragRect.movePoint(diff);
        } 
        this.topLeftAdjuster = new DragShape(new BaseCircle(this.topLeftPoint, resizeRadius));
        this.topLeftAdjuster.dragFunction = (diff:Vector2D, pt:Point) => {
            //console.log(diff);
            const centerDiff = this.position.diffVector(pt);
            /*
            if(Math.abs(diff.x) > Math.abs(diff.y)){
                this.setRadius(this.radius-diff.x/2);
                this.position.addVector(new Vector2D(diff.x/2, diff.x/2));
            }else{
                this.setRadius(this.radius-diff.y/2);
                this.position.addVector(new Vector2D(diff.y/2, diff.y/2));
            }*/
            if(Math.abs(centerDiff.x) > Math.abs(centerDiff.y)){
                const radDiff = centerDiff.x - this.radius;
                this.setRadius(centerDiff.x/2);
                this.position.addVector(new Vector2D(-radDiff, -radDiff));
            }else{
                const radDiff = centerDiff.y - this.radius;
                this.setRadius(centerDiff.y/2);
                this.position.addVector(new Vector2D(-radDiff, -radDiff));
            }
            const centerPt = new Point(this.bottomRightPoint.x-this.radius, this.bottomRightPoint.y-this.radius)
            this.position = centerPt;
            this.topLeftPoint = new Point(
                this.position.x-this.radius, this.position.y-this.radius
            );
            //this.rect.setPoint(newPt);
            this.rect.width = this.diameter;
            this.rect.height = this.diameter;
            //this.dragRect.shape.
            //this.topLeftAdjuster.setPoint(newPt);
            //his.setRadius(this.radius-maxDiff/2);
            //const shapePt = this.dragRect.shape.getPoint();
            //shapePt.addVector(diff);
            //this.dragRect.setPoint(shapePt);
        }
        this.adjusters = []; // to do
    }
    mouseMove(pt: Point): void {
        this.dragRect.mouseMove(pt);
        this.topLeftAdjuster.mouseMove(pt);
    }
    mouseDown(pt: Point): void {
        this.dragRect.mouseDown(pt);
        this.topLeftAdjuster.mouseDown(pt);
    }
    mouseUp(pt: Point): void {
        this.dragRect.mouseUp(pt);
        this.topLeftAdjuster.mouseUp(pt);
    }
    getRectSpace?(): VirtRect {
        throw new Error("Method not implemented.");
    }
    draw(cr:CanvasRenderingContext2D):void{
        cr.fillStyle = 'red';
        this.dragRect.draw(cr);
        cr.fillStyle = 'green';
        super.draw(cr);
        this.topLeftAdjuster.draw(cr);
    }
}

export class BaseLine {
    p1:Point;
    p2:Point;
    width: number;
    constructor(p1: Point, p2: Point, width: number=1){
        this.p1 = p1;
        this.p2 = p2;
        this.width = width;
    }

    draw(cr:CanvasRenderingContext2D):void{
        cr.beginPath();
        cr.moveTo(this.p1.x, this.p1.y);
        cr.lineTo(this.p2.x, this.p2.y);
        cr.lineWidth = this.width;
        cr.stroke();
    }
}

export class AdjustLine extends BaseLine implements InteractableControl {
    movePoint1: DragShape;
    movePoint2: DragShape;
    constructor(p1: Point, p2: Point, width:number=1, rad:number=1){
        super(p1, p2, width);
        this.movePoint1 = new DragShape(new BaseCircle(p1, rad));
        this.movePoint2 = new DragShape(new BaseCircle(p2, rad));
    }
    setPoint(pt: Point): void {
        this.p1 = pt;
    }
    isInside(pt: Point): boolean {
        throw new Error("Method not implemented.");
    }
    mouseMove(pt: Point): void {
        this.movePoint1.mouseMove(pt);
        if(this.movePoint1.selected) return;
        this.movePoint2.mouseMove(pt);
    }
    mouseDown(pt: Point): void {
        this.movePoint1.mouseDown(pt);
        this.movePoint2.mouseDown(pt);
    }
    mouseUp(pt: Point): void {
        this.movePoint1.mouseUp(pt);
        this.movePoint2.mouseUp(pt);
    }
    keyDown?(e: KeyboardEvent): void {
        throw new Error("Method not implemented.");
    }
    getRectSpace?(): VirtRect {
        throw new Error("Method not implemented.");
    }
    draw(cr:CanvasRenderingContext2D):void{
        super.draw(cr);
        this.movePoint1.draw(cr);
        this.movePoint2.draw(cr);
    }
}

export class BaseTriangle extends BasicShape {
    p2:Point;
    p3:Point;
    constructor(p1: Point, p2: Point, p3:Point){
        super(p1);
        this.p2 = p2;
        this.p3 = p3;
    }
    movePoint(diff:Vector2D){
        this.position.addVector(diff);
        this.p2.addVector(diff);
        this.p3.addVector(diff);
    }
    sign():number{
        return (this.position.x - this.p3.x) * (this.p2.y - this.p3.y) 
        - (this.p2.x - this.p3.x) * (this.position.y - this.p3.y); 
    }
    isInside(pt: Point): boolean {
        function sign(p1: Point, p2: Point, p3: Point)
        {
            return (p1.x - p3.x) * (p2.y - p3.y) - (p2.x - p3.x) * (p1.y - p3.y);
        }
        //const vl1 = VirtLine.from2Points(this.position, this.p2);
        //const vl2 = VirtLine.from2Points(this.p2, this.p3);
        //const vl3 = VirtLine.from2Points(this.p3, this.position);
        const d1 = sign(pt, this.position, this.p2);
        const d2 = sign(pt, this.p2, this.p3);
        const d3 = sign(pt, this.p3, this.position);
        const has_neg = (d1 < 0) || (d2 < 0) || (d3 < 0);
        const has_pos = (d1 > 0) || (d2 > 0) || (d3 > 0);
        return !(has_neg && has_pos);
    }
    draw(cr:CanvasRenderingContext2D):void{
        cr.beginPath();
        cr.moveTo(this.position.x, this.position.y);
        cr.lineTo(this.p2.x, this.p2.y);
        cr.lineTo(this.p3.x, this.p3.y);
        cr.fill();
    }
}

export class ResizeTriangle extends BaseTriangle implements InteractableControl{
    movePoint1: DragShape;
    movePoint2: DragShape;
    movePoint3: DragShape;
    dragTriangle: DragShape;
    constructor(p1: Point, p2: Point, p3:Point, rad:number=1){
        super(p1, p2, p3);
        this.dragTriangle = new DragShape(this);
        this.movePoint1 = new DragShape(new BaseCircle(p1, rad));
        this.movePoint2 = new DragShape(new BaseCircle(p2, rad));
        this.movePoint3 = new DragShape(new BaseCircle(p3, rad));
    }
    setPoint(pt: Point): void {
        this.position = pt;
    }
    mouseMove(pt: Point): void {
        this.movePoint1.mouseMove(pt);
        if(this.movePoint1.selected) return;
        this.movePoint2.mouseMove(pt);
        if(this.movePoint2.selected) return;
        this.movePoint3.mouseMove(pt);
        if(this.movePoint3.selected) return;
        this.dragTriangle.mouseMove(pt);
    }
    mouseDown(pt: Point): void {
        this.movePoint1.mouseDown(pt);
        this.movePoint2.mouseDown(pt);
        this.movePoint3.mouseDown(pt);
        this.dragTriangle.mouseDown(pt);
    }
    mouseUp(pt: Point): void {
        this.movePoint1.mouseUp(pt);
        this.movePoint2.mouseUp(pt);
        this.movePoint3.mouseUp(pt);
        this.dragTriangle.mouseUp(pt);
    }
    keyDown?(e: KeyboardEvent): void {
        throw new Error("Method not implemented.");
    }
    getRectSpace?(): VirtRect {
        throw new Error("Method not implemented.");
    }
    draw(cr: CanvasRenderingContext2D): void {
        super.draw(cr);
        this.movePoint1.draw(cr);
        this.movePoint2.draw(cr);
        this.movePoint3.draw(cr);
    }

}

export class ResizePolygon{

}