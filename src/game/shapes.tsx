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
    constructor(r:number, g:number, b:number, a?:number){
        this.r = Math.floor(r) % 256;
        this.g = Math.floor(g) % 256;
        this.b = Math.floor(b) % 256;
        this.a = a ? Math.floor(a) % 256 : 255;
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
}

export class Point{
    x: number;
    y: number;
    constructor(x?:number, y?:number){
        this.x = x ? x : 0;
        this.y = y ? y : 0;
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
}

export class Vector2D{
    x:number;
    y:number;
    constructor(x?:number, y?:number){
        this.x = x ? x : 0;
        this.y = y ? y : 0;
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

export class VirtRect{
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
    hitRect(vr:VirtRect){
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
}

export class VirtCircle{
    pos: Point;
    diameter: number;
    colour: string | undefined;
    constructor(x:number, y:number, size:number){
        this.pos = new Point(x, y);
        this.diameter = size;
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
    hitPoint(p:Point){
        const dx = p.x - this.pos.x;
        const dy = p.y - this.pos.y;
        const xcal = (dx * dx) / (this.diameter * this.diameter);
	    const ycal = (dy * dy) / (this.diameter * this.diameter);
        return xcal + ycal <= 1;
    }
    draw(cr:CanvasRenderingContext2D){
        if(this.colour){
            cr.fillStyle = this.colour.toString();
        }
        cr.beginPath();
        cr.arc(this.pos.x, this.pos.y, this.diameter, 0, 2 * Math.PI);
        cr.stroke();
    }
    fill(cr:CanvasRenderingContext2D){
        if(this.colour){
            cr.fillStyle = this.colour.toString();
        }
        cr.beginPath();
        cr.arc(this.pos.x, this.pos.y, this.diameter, 0, 2 * Math.PI);
        cr.fill();
    }
}