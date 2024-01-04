import React, {MouseEventHandler, useEffect, useState, useRef} from 'react';


export const Region = Object.freeze({
    inside: Symbol('inside'),
    left: Symbol('left'),
    left_top: Symbol('top_left'),
    top: Symbol('top'),
    right_top: Symbol('right_top'),
    right: Symbol('right'),
    right_bottom: Symbol('right_bottom'),
    bottom: Symbol('bottom'),
    left_bottom: Symbol('left_bottom')
});

export class Colour{
    r: number;
    g: number;
    b: number;
    a: number;
    static maxValue = 256;
    static maxHue = 360;
    constructor(r:number, g:number, b:number, a?:number){
        this.r = Math.floor(r) % 256;
        this.g = Math.floor(g) % 256;
        this.b = Math.floor(b) % 256;
        this.a = a ? Math.floor(a) % 256 : 255;
    }
    static ratio(rat:number){ // expects number 0 - 1
        return Math.floor(rat*256);
    }
    static hueGradient(minX:number, maxX:number, minY:number, maxY:number){
        const colours = ['rgb(255, 0, 0)', 'rgb(255, 255, 0)', 'rgb(0, 255, 0)', 
        'rgb(0, 255, 255)', 'rgb(0, 0, 255)', 'rgb(255, 0, 255)', 'rgb(255, 0, 0)'];

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if(ctx){
            const gradient = ctx.createLinearGradient(minX, minY, maxX, maxY);
            colours.forEach((colour, i) => {
                const val = i/(colours.length-1);
                gradient.addColorStop(val, colour);
                //console.log(val);
            });
            return gradient;
        }
        return null;
    }
    static fromHue(hue:number):Colour{
        //hue as a value of 0 to 360
        const segment = Math.floor(hue/60);
        const remainder = hue % 60;
        let rgb = [255, 0, 0];
        const rem = (r:number, p:boolean=true) => {
            const tr = p ? (r/60) : 1-(r/60);
            return tr*255;
        }
        switch(segment){
            case 0:
                const g = rem(remainder);
                rgb = [255, g, 0];
                break;
            case 1:
                const r = rem(remainder, false);
                rgb = [r, 255, 0];
                break;
            case 2:
                const b = rem(remainder);
                rgb = [0, 255, b];
                break;
            case 3:
                const g1 = rem(remainder, false);
                rgb = [0, g1, 255];
                break;
            case 4:
                const r1 = rem(remainder);
                rgb = [r1, 0, 255];
                break;
            case 5:
                const b1 = rem(remainder, false);
                rgb = [255, 0, b1];
                break;
            default:
                break;
        }
        const colour = new Colour(rgb[0], rgb[1], rgb[2]);
        return colour;
    }
    //alpha value between 0 and 1
    static singleBlend(originalValue:number, newValue:number, alpha:number=1){
        return Math.floor(newValue*alpha + (1-alpha)*originalValue);
    }
    colString(col:number){
        let str = col.toString(16);
        if(str.length === 1) str = '0'+str;
        return str;
    }
    toString(){
        return '#'+this.colString(this.r)+this.colString(this.g)+this.colString(this.b)+this.colString(this.a);
    }
    addAll(v:number){
        this.addRed(v);
        this.addGreen(v);
        this.addBlue(v);
    }
    blend(c:Colour):void{
        const alphaRatio = c.a/255;
        this.r = Colour.singleBlend(this.r, c.r, alphaRatio);
        this.g = Colour.singleBlend(this.g, c.g, alphaRatio);
        this.b = Colour.singleBlend(this.b, c.b, alphaRatio);
        this.a = 255;
    }
    newBlend(c:Colour):Colour{
        const alphaRatio = c.a/255;
        return new Colour(
            Colour.singleBlend(this.r, c.r, alphaRatio),
            Colour.singleBlend(this.g, c.g, alphaRatio),
            Colour.singleBlend(this.b, c.b, alphaRatio),
            255);
    }
    
    addRed(v:number){
        this.r += v;
        if(this.r > 255){
            this.r = 255;
        }else if(this.r < 0){
            this.r = 0;
        }else{
            this.r = Math.floor(this.r);
        }
    }
    addGreen(v:number){
        this.g += v;
        if(this.g > 255){
            this.g = 255;
        }else if(this.g < 0){
            this.g = 0;
        }else{
            this.g = Math.floor(this.g);
        }
    }
    addBlue(v:number){
        this.b += v;
        if(this.b > 255){
            this.b = 255;
        }else if(this.b < 0){
            this.b = 0;
        }else{
            this.b = Math.floor(this.b);
        }
    }
    addLumin(n:number){
        const v = 255*n;
        this.addRed(v);
        this.addGreen(v);
        this.addBlue(v);
    }
    intensity():number{
        return (this.r+this.g+this.b)/3;
    }
    getHue():number{
        const r = this.r/255; const g = this.g/255; const b = this.b/255;
        const maxV = Math.max(r, g, b);
        const minV = Math.min(r, g, b);
        if (minV == maxV) {
            return 0;
        }
        let hue = 0;
        if(maxV === r){
            hue = (g - b) / (maxV - minV);
        }else if(maxV === g){
            hue = 2 + (b - r) / (maxV - minV);
        }else{
            hue = 4 + (r - g) / (maxV - minV);
        }
        hue = hue * 60;
        if (hue < 0) hue = hue + 360;
        return Math.round(hue);
    }
    copy():Colour{
        return new Colour(this.r, this.g, this.b, this.a);
    }
}

export class Point{
    x: number;
    y: number;
    constructor(x?:number, y?:number){
        this.x = x ? x : 0;
        this.y = y ? y : 0;
    }
    set(p:Point){
        this.x = p.x;
        this.y = p.y;
    }
    add(p:Point){
        this.x += p.x;
        this.y += p.y;
    }
    addVector(v:Vector2D){
        this.x += v.x;
        this.y += v.y;
    }
    sub(p:Point){
        this.x -= p.x;
        this.y -= p.y;
    }
    negPoint(){
        return new Point(-this.x, -this.y);
    }
    moveN(x:number, y:number){
        this.x += x;
        this.y += y;
    }
    floor(){
        this.x = Math.floor(this.x);
        this.y = Math.floor(this.y);
    }
    diff(p:Point){
        return new Point(this.x - p.x, this.y - p.y);
    }
    diffVector(p:Point):Vector2D{
        return new Vector2D(this.x - p.x, this.y - p.y);
    }
    distance2(p:Point){
        const dx = this.x - p.x; const dy = this.y - p.y;
        return dx*dx + dy*dy;
    }
    multiplyPoint(x:number, y?:number){
        if(y !== undefined){
            return new Point(this.x*x, this.y*y);
        }
        return new Point(this.x*x, this.y*x);
    }
    dividePoint(x:number, y?:number){
        if(y !== undefined){
            return new Point(this.x/x, this.y/y);
        }
        if(x !== 0){
            return new Point(this.x/x, this.y/x);
        }
        return new Point(0, 0);
    }
    arr(){
        return [this.x, this.y];
    }
    copy(){
        return new Point(this.x, this.y);
    }
    toString():string{
        return 'x: '+this.x.toFixed(2)+', y: '+this.y.toFixed(2);
    }
    static fromArr(arr:number[]):Point{
        if(arr.length >= 2){
            return new Point(arr[0], arr[1]);
        }
        return new Point();
    }
    static random(xr:number, yr:number):Point{
        const x = Math.floor(Math.random()*xr);
        const y = Math.floor(Math.random()*yr)
        return new Point(x, y);
    }
    static randomRange(lowX:number, rangeX:number, lowY: number, rangeY: number):Point{
        const xr = Math.random()*rangeX;
        const yr = Math.random()*rangeY;
        return new Point(xr+lowX, yr+lowY);
    }
    closest(pts:Point[]):Point{
        if(pts.length === 0){
            return new Point();
        }
        const sVec = this.diffVector(pts[0]);
        let minDist = sVec.distFast();
        let index = 0;
        for(let i = 1; i < pts.length; i++){
            const vec = this.diffVector(pts[i]);
            const dist = vec.distFast();
            if(dist < minDist){
                minDist = dist;
                index = i;
            }
        }
        return pts[index];
    }
}

export class Vector2D{
    x:number;
    y:number;
    constructor(x?:number, y?:number){
        this.x = x ? x : 0;
        this.y = y ? y : 0;
    }
    add(vec:Vector2D){
        this.x += vec.x;
        this.y += vec.y;
    }
    div(d:number){
        if(d !== 0){
            this.x /= d; 
            this.y /= d;
        }
    }
    mag(){
        return Math.sqrt(this.distFast());
    }
    distFast(){
        return this.x*this.x + this.y*this.y;
    }
    norm(){
        this.div(this.mag());
    }
    copy(){
        return new Vector2D(this.x, this.y);
    }
    multi(m: number){
        this.x *= m;
        this.y *= m;
    }
    rotate(rad:number){
        const co = Math.cos(rad);
        const si = Math.sin(rad);
        const vx = this.x; const vy = this.y;
        this.x = vx * co - vy * si;
        this.y = vx * si + vy * co;
    }
    //0 is (1, 0) vector, facing right
    static fromAngle(rad:number):Vector2D{
        //const y = Math.cos(rad);
        //const x = Math.sin(rad);
        const x = Math.cos(rad);
        const y = Math.sin(rad);
        return new Vector2D(x, y);
    }
    toRotation():Rotation{
        if(this.y !== 0){
            const rot = this.y < 0 ? Math.atan(-this.x/this.y)+Math.PI+Math.PI/2 : Math.atan(-this.x/this.y)+Math.PI/2;
            return new Rotation(rot);
        }
        return new Rotation();
    }
    arr(){
        return [this.x, this.y];
    }
}

//value between 0 and 2*PI
//0 starts facing right
export class Rotation{
    static twoPi = 2*Math.PI;
    rot:number;
    constructor(rot?:number){

        this.rot = rot === undefined ? 0 : rot % Rotation.twoPi;
        if(this.rot < 0) this.rot += Rotation.twoPi;
    }
    set(r:number){
        this.rot = r % Rotation.twoPi;
        if(this.rot < 0) this.rot += Rotation.twoPi;
    }
    add(r:number){
        if(r < 0){
            this.sub(-r);
        }else{
            this.rot += r;
            if(this.rot > Rotation.twoPi){
                this.rot -= Rotation.twoPi;
            }
        }
    }
    sub(r:number){
        if(r < 0){
            this.add(-r)
        }else{
            this.rot -= r;
            if(this.rot < 0){
                this.rot += Rotation.twoPi;
            }
        }
    }
    diff(rot:Rotation){
        const rots = this.rot > rot.rot ? [rot.rot, this.rot] : [this.rot, rot.rot];
        const d1 = rots[1] - rots[0];
        const d2 = Rotation.twoPi - rots[1] + rots[0];
        return Math.min(d1, d2);
    }
    //true clockwise, false anti-clockwise
    closer(rot:Rotation):boolean{
        if(this.rot > rot.rot){
            const rots = [rot.rot, this.rot];
            const d1 = rots[1] - rots[0]; // anticlockwise
            const d2 = Rotation.twoPi - rots[1] + rots[0];
            return (d1 > d2);
        }else{
            const rots = [this.rot, rot.rot];
            const d1 = rots[1] - rots[0]; //clockwise
            const d2 = Rotation.twoPi - rots[1] + rots[0]; 
            return (d1 < d2);
        }
    }
    ////true clockwise, false anti-clockwise
    diffDirection(rot:Rotation):{difference: number; clockwise: boolean;}{
        const ret = {difference: 0, clockwise: true};
        if(this.rot > rot.rot){
            const rots = [rot.rot, this.rot];
            const d1 = rots[1] - rots[0]; // anticlockwise
            const d2 = Rotation.twoPi - rots[1] + rots[0];
            if(d1 > d2){
                ret.difference = d2;
                ret.clockwise = true;
            }else{
                ret.difference = d1;
                ret.clockwise = false;
            }
        }else{
            const rots = [this.rot, rot.rot];
            const d1 = rots[1] - rots[0]; //clockwise
            const d2 = Rotation.twoPi - rots[1] + rots[0]; 
            if(d1 < d2){
                ret.difference = d1;
                ret.clockwise = true;
            }else{
                ret.difference = d2;
                ret.clockwise = false;
            }
        }
        return ret;
    }
    static fromVector(vec:Vector2D):Rotation{
        if(vec.y !== 0){
            const rot = vec.y < 0 ? Math.atan(-vec.x/vec.y)+Math.PI+Math.PI/2 : Math.atan(-vec.x/vec.y)+Math.PI/2;
            return new Rotation(rot);
        }
        return new Rotation();
    }
    toVector():Vector2D{
        return Vector2D.fromAngle(this.rot);
    }
}

enum ShapeTypes {
    Rect, Circle, Triangle, Polygon
}

export class VirtLine{
    gradient: number;
    intercept: number;
    constructor(gradient: number, intercept: number){
        this.gradient = gradient;
        this.intercept = intercept;
    }
    getY(x:number){
        return x*this.gradient+this.intercept;
    }
    getX(y:number){
        return (y-this.intercept)/this.gradient;
    }
    //true is positive
    sign(pt:Point){
        return pt.x*this.gradient+this.intercept-pt.y > 0;
    }
    intersectRectPoints(rect:VirtRect){
        const leftY = this.getY(rect.left);
        const rightY = this.getY(rect.right);
        const points = [];
        if(rect.isInsideY(leftY)){
            points.push(new Point(rect.left, leftY));
        }
        if(rect.isInsideY(rightY)){
            points.push(new Point(rect.right, rightY));
        }
        const topX = this.getX(rect.top);
        const bottomX = this.getX(rect.bottom);
        if(rect.isInsideX(topX)){
            points.push(new Point(topX, rect.top));
        }
        if(rect.isInsideX(bottomX)){
            points.push(new Point(bottomX, rect.bottom));
        }
        return points;
    }
    static from2Points(p1: Point, p2: Point){
        const gradient = VirtLineSegment.getGradient(p1, p2);
        const intercept = p1.y - gradient*p1.x;
        return new VirtLine(gradient, intercept);
    }
}

export class VirtLineSegment{
    p1: Point;
    p2: Point;
    constructor(p1: Point, p2: Point){
        this.p1 = p1;
        this.p2 = p2;
    }
    static fromLineAndRect(vl:VirtLine, vr:VirtRect){

    }
    static getGradient(p1: Point, p2: Point){
        return (p2.y-p1.y)/(p2.x-p1.x);
    }
}

export interface VirtShape{
    type: ShapeTypes;
    move:(mo:Point)=>void;
    draw:(cr:CanvasRenderingContext2D, col?:Colour)=>void;
    hitPoint:(pt:Point)=>boolean;
    hitRect:(rect:VirtRect)=>boolean;
    hitShape:(shape:VirtShape)=>boolean;
}

export class VirtTriangle implements VirtShape{
    type: ShapeTypes = ShapeTypes.Triangle
    p1: Point; p2: Point; p3: Point;
    area: number | null;
    constructor(p1: Point, p2: Point, p3: Point ){
        this.p1 = p1;
        this.p2 = p2;
        this.p3 = p3;
        this.area = null;
    }
    move(mo:Point):void{
        
    }
    hitRect(rect: VirtRect):boolean{
        return false;
    };
    hitShape(shape: VirtShape):boolean{
        return false;
    };
    getArea(): number{
        const area = Math.abs( (this.p2.x-this.p1.x)*(this.p3.y-this.p1.y) 
        - (this.p3.x-this.p1.x)*(this.p2.y-this.p1.y));
        this.area = area;
        return area;
    }
    static getTriangleArea(p1: Point, p2: Point, p3: Point):number{
        return Math.abs( (p2.x-p1.x)*(p3.y-p1.y) 
        - (p3.x-p1.x)*(p2.y-p1.y));
    }
    hitPoint(pt:Point, error:number=0.01):boolean{
        const area1 = VirtTriangle.getTriangleArea(this.p1, this.p2, pt);
        const area2 = VirtTriangle.getTriangleArea(this.p2, this.p3, pt);
        const area3 = VirtTriangle.getTriangleArea(this.p1, this.p3, pt);
        const areaOrig = this.area === null ? this.getArea() : this.area;
        if(Math.abs(area1 + area2 + area3 - areaOrig) < error){
            return true;
        }
        return false;
    }
    draw(cr: CanvasRenderingContext2D, col?: Colour | undefined):void{

    }
}

export class VirtRect implements VirtShape{
    type: ShapeTypes = ShapeTypes.Rect;
    left: number;top:number;
    right:number;bottom:number;
    width: number;
    height: number;
    cx: number; cy:number; //center points
    colour: string | undefined;
    constructor(x:number, y:number, wid:number, hei:number, pts?:boolean){
        this.left = x; this.top = y;
        this.right = x+wid; this.bottom = y+hei;
        this.width = wid; this.height = hei;

        this.cx = this.left + (wid / 2);
        this.cy = this.top + (hei / 2);
        //this.colour = undefined;
    }
    setColour(col:Colour){
        this.colour = col.toString();
    }
    move(mo:Point){
        this.left += mo.x;
        this.right += mo.x;
        this.top += mo.y;
        this.bottom += mo.y;
        this.cx += mo.x;
        this.cy += mo.y;
    }
    moveN(x:number, y:number){
        this.left += x;
        this.right += x;
        this.top += y;
        this.bottom += y;
        this.cx += x;
        this.cy += y;
    }
    draw(cr:CanvasRenderingContext2D, col?:Colour){
        if(col){
            cr.fillStyle = col.toString();
        }
        cr.strokeRect(this.left, this.top, this.width, this.height);  
    }
    hitPoint(pt:Point){
        return pt.x > this.left && pt.x < this.right
        && pt.y > this.top && pt.y < this.bottom;
    }
    hitShape(shape:VirtShape):boolean{
        if(shape instanceof VirtRect){
            return this.hitRect(shape);
        }
        else if(shape instanceof VirtCircle){
            //return this.hitCircle(shape);
        }
        return false;
    }
    pointRegion(pt:Point){
        if(pt.x < this.left){
            if(pt.y < this.top){
                return Region.left_top;
            }else if(pt.y > this.bottom){
                return Region.left_bottom;
            }
            return Region.left;
        }else if(pt.x > this.right){
            if(pt.y < this.top){
                return Region.right_top;
            }else if(pt.y > this.bottom){
                return Region.right_bottom;
            }
            return Region.right;
        }
        if(pt.y < this.top){
            return Region.top;
        }else if(pt.y > this.bottom){
            return Region.bottom;
        }
        return Region.inside;
    }
    isInsideY(y:number){
        return y < this.bottom && y > this.top;
    }
    isInsideX(x:number){
        return x < this.right && x > this.left;
    }
    hitRect(vr:VirtRect):boolean{
        return !(this.left > vr.right ||
            this.right < vr.left ||
            this.top > vr.bottom ||
            this.bottom < vr.top);
    } 
    fill(cr:CanvasRenderingContext2D){
        if(this.colour){
            cr.fillStyle = this.colour;
        }
        cr.fillRect(this.left, this.top, this.width, this.height);
        //console.log(this.top);
    }
    static fromSides(left:number, top:number, right:number, bottom:number):VirtRect{
        const width = right - left;
        const height = bottom - top;
        return new VirtRect(left, top, width, height);
    }
}

export class VirtCircle implements VirtShape{
    type: ShapeTypes = ShapeTypes.Circle;
    pos: Point;
    diameter: number;
    radius:number;
    colour: string | undefined;
    constructor(x:number, y:number, radius:number){
        this.pos = new Point(x, y);
        this.diameter = radius*2;
        this.radius = radius;
    }
    setColour(col:Colour){
        this.colour = col.toString();
    }
    move(m:Point){
        this.pos.add(m);
    }
    moveN(x:number, y:number){
        this.pos.moveN(x,y);
    }
    place(p:Point){
        this.pos = p;
    }
    hitShape(shape:VirtShape):boolean{
        if(shape instanceof VirtRect){
            return this.hitRect(shape);
        }
        else if(shape instanceof VirtCircle){
            return this.hitCircle(shape);
        }
        return false;
    }
    hitPoint(p:Point){
        const dx = p.x - this.pos.x;
        const dy = p.y - this.pos.y;
        const xcal = (dx * dx) / (this.diameter * this.diameter);
	    const ycal = (dy * dy) / (this.diameter * this.diameter);
        return xcal + ycal <= 1;
    }
    hitCircle(circ:VirtCircle):boolean{
        const distVec = this.pos.diffVector(circ.pos);
        const fullRadius = this.radius+circ.radius;
        return distVec.distFast() < fullRadius*fullRadius;
    }
    hitRect(rect:VirtRect):boolean{
        //circle inside rect or rect inside circle
        if(rect.hitPoint(this.pos)){
            return true;
        }else if(this.hitPoint(new Point(rect.left, rect.top))){
            return true;
        }else if(this.hitPoint(new Point(rect.left, rect.bottom))){
            return true;
        }else if(this.hitPoint(new Point(rect.right, rect.top))){
            return true;
        }else if(this.hitPoint(new Point(rect.right, rect.bottom))){
            return true;
        }
        else{
            const topPt = new Point(this.pos.x, this.pos.y-this.radius);
            if(rect.hitPoint(topPt)){
                return true;
            }
            const leftPt = new Point(this.pos.x-this.radius, this.pos.y);
            if(rect.hitPoint(leftPt)){
                return true;
            }
            const bottomPt = new Point(this.pos.x, this.pos.y+this.radius);
            if(rect.hitPoint(bottomPt)){
                return true;
            }
            const rightPt = new Point(this.pos.x+this.radius, this.pos.y);
            if(rect.hitPoint(rightPt)){
                return true;
            }
        }
        return false;
    }
    draw(cr:CanvasRenderingContext2D){
        if(this.colour){
            cr.strokeStyle = this.colour.toString();
        }
        cr.beginPath();
        cr.arc(this.pos.x, this.pos.y, this.radius, 0, 2 * Math.PI);
        cr.stroke();
    }
    fill(cr:CanvasRenderingContext2D){
        if(this.colour){
            cr.fillStyle = this.colour.toString();
        }
        cr.beginPath();
        cr.arc(this.pos.x, this.pos.y, this.radius, 0, 2 * Math.PI);
        cr.fill();
    }
}

export class VirtPolygon implements VirtShape {
    type: ShapeTypes;
    points: Point[];
    constructor(){
        this.type = ShapeTypes.Polygon;
        this.points = [];
    }
    addPoint(p:Point){
        this.points.push(p);
    }
    addPoints(p:Point[]){
        this.points.push(...p);
    }
    move(mo: Point):void{

    };
    hitPoint(pt: Point):boolean{
        let collision = false;
        let next = 0;
        for (let current=0; current<this.points.length; current++) {
            next = current+1;
            if (next == this.points.length) next = 0;

            const p1 = this.points[current];
            const p2 = this.points[next];
            if(((p1.y >= pt.y && p2.y < pt.y) || (p1.y < pt.y && p2.y >= pt.y)) &&
                (pt.x < (p2.x-p1.x)*(pt.y-p1.y) / (p2.y-p1.y)+p1.x)) {
                    collision = !collision;
            }
        }
        return collision;
    };
    hitRect(rect: VirtRect):boolean{
        return false;
    };
    hitShape(shape: VirtShape):boolean{
        return false;
    };
    boundingRect():VirtRect | undefined{
        if(this.points.length > 0){
            let left = this.points[0].x;
            let right = this.points[0].x;
            let top = this.points[0].y;
            let bottom = this.points[0].y;
            for(let i = 1; i<this.points.length; i++){
                if(this.points[i].x < left){
                    left = this.points[i].x;
                }else if(this.points[i].x > right) right = this.points[i].x;
                if(this.points[i].y < top){
                    top = this.points[i].y;
                }else if(this.points[i].y > bottom){
                    bottom = this.points[i].y;
                }
            }
            const rect = VirtRect.fromSides(left, top, right, bottom);
            return rect;
        }
        return new VirtRect(0, 0, 0, 0);
    }
    draw(cr: CanvasRenderingContext2D, col?: Colour | undefined):void{
        if(col) cr.strokeStyle = col.toString();
        if(this.points.length > 0){
            cr.beginPath();
            cr.moveTo(this.points[0].x, this.points[0].y);
            for(let i = 1; i<this.points.length; i++){
                cr.lineTo(this.points[i].x, this.points[i].y);
            }
            cr.closePath();
            cr.stroke();
        }
    };
    fill(cr: CanvasRenderingContext2D, col?: Colour | undefined):void{
        if(col) cr.fillStyle = col.toString();
        if(this.points.length > 0){
            cr.beginPath();
            cr.moveTo(this.points[0].x, this.points[0].y);
            for(let i = 1; i<this.points.length; i++){
                cr.lineTo(this.points[i].x, this.points[i].y);
            }
            cr.closePath();
            cr.fill();
        }
    }

}