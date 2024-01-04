import React, {MouseEventHandler, useEffect, useState, useRef} from 'react';
import {Point, VirtRect,Colour, Region} from './geometry';

interface MoveObject{
    vx: number;
    vy: number;
    update: (time:number) => void; // in milis
}

class MoveRect extends VirtRect {
    vx: number; //units per sec;
    vy: number; //units per sec;
    constructor(x:number, y:number, wid:number, hei:number){
        super(x, y, wid, hei);
        this.vx=0;
        this.vy=0;
    }
    setVx(x:number){
        this.vx = x;
    }
    setVy(y:number){
        this.vy = y;
    }
    getUpdateBound(time:number){
        const t = time/1000;
        const mx = this.vx * t;
        const my = this.vy * t;
        const left = this.vx < 0 ? this.left+mx : this.left;
        const top = this.vy < 0 ? this.top+my : this.top;
        const absVx = Math.abs(mx); const absVy = Math.abs(my);
        return new VirtRect(left, top, this.width+absVx, this.height+absVy);
    }
    update(time:number){
        const t = time/1000;
        const mx = this.vx * t;
        const my = this.vy * t;
        this.moveN(mx, my);
    }
}

export class PhysicsSim{
    //Virt
    base:VirtRect;
    walls: Array<VirtRect>;
    bouncer:MoveRect;
    rest:boolean;
    constructor(){
        this.base = new VirtRect(100, 450, 300, 20);
        this.base.setColour(new Colour(0, 255, 0));
        this.bouncer = new MoveRect(135, 40, 10, 10);
        this.bouncer.setColour(new Colour(200, 100, 0));
        this.bouncer.vx = -100;
        this.bouncer.vy = -40;
        this.rest = false;

        this.walls = [];
        this.walls.push(this.base);
        const vr = new VirtRect(100, 200, 50, 20);
        vr.setColour(new Colour(0, 255, 0));
        this.walls.push(new VirtRect(200, 200, 50, 20));
        this.walls.push(new VirtRect(50, 50, 50, 400));
        this.walls.push(new VirtRect(400, 50, 50, 400));
    }
    update(time:number){
        //time /= 5;
        this.bouncer.update(time);
        const bound = this.bouncer.getUpdateBound(time);
        const t = time/1000;
        this.walls.forEach((wall) => {
            if(wall.hitRect(bound)){
                const cbouncer = new Point(this.bouncer.cx, this.bouncer.cy);
                const sy = wall.pointRegion(cbouncer);
                console.log(sy.toString());
                //not proper sim - doesn't update verticals precicely 
                //need to do predict on wall collision (mid-frame)
                if(sy === Region.top || sy === Region.left_top || sy === Region.right_top){
                    if(Math.abs(this.bouncer.vy) > 30){
                        //rebound
                        const dist = wall.top - this.bouncer.bottom;
                        this.bouncer.moveN(0, dist);
                        this.bouncer.vy = (-this.bouncer.vy);
                    }else{
                        //stop bounce
                        const dist = wall.top - this.bouncer.bottom;
                        this.bouncer.moveN(0, dist);
                        this.bouncer.vy = 0;
                        this.bouncer.vx = 0;
                        this.rest = true;
                    }
                }
                else if(sy === Region.bottom || sy === Region.left_bottom || sy === Region.right_bottom){
                    this.bouncer.vy = -this.bouncer.vy;
                    const dist = wall.bottom - this.bouncer.top;
                    this.bouncer.moveN(0, dist);
                }else if(sy === Region.left){
                    this.bouncer.vx = -this.bouncer.vx;
                    const dist = wall.left - this.bouncer.right;
                    this.bouncer.moveN(dist, 0);
                }
                else if(sy === Region.right){
                    this.bouncer.vx = -this.bouncer.vx;
                    const dist = wall.right - this.bouncer.left;
                    this.bouncer.moveN(dist, 0);
                }
            }else{
                if(!this.rest) this.bouncer.vy += t*200; 
            }
        });
    }
    draw(cr:CanvasRenderingContext2D){
        this.walls.forEach((wall) => {
            wall.fill(cr);
        });
        //this.base.fill(cr);
        //this.bouncer.draw();
        const bound = this.bouncer.getUpdateBound(50);
        bound.setColour(new Colour(255, 180, 180));
        bound.fill(cr);
        this.bouncer.fill(cr);
    }
}

class Range{
    low: number;
    range: number;
    max: number;
    constructor(l:number, r:number=0){
        this.low = l;
        this.range = r;
        this.max = l + this.range;
    }
    incRange(){
        this.range++;
        this.max++;
    }
    inside(n:number){
        return n > this.low && n < this.max;
    }
}

class WaterBody{
    depth: number;
    height: number;
    waterMap: Array<Array<Range>>;
    constructor(){
        //
        this.depth = 0;
        this.height = 0;
        this.waterMap = [];
    }
}

class Water{

}

export class SandSim{
    width: number;
    height: number;
    grid: Array<Array<number>>;
    lrMovementGrid: Array<Array<number>>; // left -, right +, 0 none
    deepGrid: Array<Array<number>>;
    x:number; y:number;
    
    view: number; // normal - 0, movement - 1;
    waterSpeed: number;
    drawSize: number;

    ncols: number;
    sandColours: Array<string>;
    waterColours: Array<string>;
    backgroundColour: string;
    constructor(wid:number, hei:number){
        this.backgroundColour = 'white';
        this.width = wid;
        this.height = hei;
        this.grid = Array(hei); //0 - empty, 1 - wall, 2-sand, 3-water
        for (let i = 0; i < wid; i++)
            this.grid[i] = Array(wid).fill(0);
        this.lrMovementGrid = Array(hei);
        for (let i = 0; i < wid; i++)
            this.lrMovementGrid[i] = Array(wid).fill(0);
        this.deepGrid = Array(hei);
        for (let i = 0; i < wid; i++)
            this.deepGrid[i] = Array(wid).fill(0);
        this.waterSpeed = 2;

        this.view = 0;
        this.x = 40; this.y = 40;
        this.drawSize = 4;

        this.ncols = 50;
        this.sandColours = [];
        this.waterColours = [];
        const stSand = new Colour(254, 240, 40);
        const stWater = new Colour(80, 130, 244);
        for(let i = 0; i < this.ncols; i++){
            this.sandColours.push(stSand.toString());
            stSand.addLumin(-0.01);
            this.waterColours.push(stWater.toString());
            stWater.addLumin(-0.02);
            //console.log(this.sandColours);
        }
    }
    resize(wid:number, hei:number){
        this.width = wid;
        this.height = hei;
    }
    swapGrid(i:number, j:number, x:number, y:number){
        const v = this.grid[j][i];
        this.grid[y][x] = this.grid[j][i];
        this.grid[j][i] = v;
    }
    setGrid(x:number, y:number, v?:number){
        const s = v ? v : 1;
        if(x < this.width && y < this.height){
            this.grid[y][x] = s;
        }
    }
    setGridArea(x:number, y:number, width: number, height: number, v?:number){
        const s = v ? v : 1;
        for(let j=0; j < height; j++){
            for(let i=0; i < width; i++){
                if(x < this.width && y < this.height){
                    this.grid[j+y][i+x] = s;
                }
            }
        }
    }
    tick(){
        //all water 1 above bottom
        for(let j=this.height-2; j >= 0; j--){
            const waterParts = [];
            for(let i=0; i < this.width; i++){
                if(this.grid[j][i] === 2){
                    this.sandSim(i, j);
                }
                if(this.grid[j][i] === 3){
                    //this.waterSim
                    waterParts.push(new Point(i, j));
                }
            }
            this.waterSim(waterParts);
        }
        const deepArr = Array(this.width).fill(0);
        this.grid.forEach((row, j) => {
            row.forEach((cell, i) => {
                this.deepGrid[j][i] = deepArr[i];
                if(cell === 3) deepArr[i] += 1;
                if(cell === 2) deepArr[i] += 3;
                if(cell === 1) deepArr[i] += 40;
            });
        })
        /*
        for(let j=this.height; j < this.height; j++){
            for(let i=0; i < this.width; i++){
                //deepArr.forEach((_, n) => deepArr[n]++);
                //this.deepGrid[j][i] = deepArr[i];
                //if(this.grid[j][i] === 0){
                    deepArr[i] += 1;
                //}
            }
        }*/
        //console.log(deepArr);
    }
    sandFlowLeft(i:number, j:number){
        const hasFlow = i-1 >= 0;
        if(hasFlow){
            const down = this.grid[j+1][i-1];
            if(down === 0){
                this.grid[j+1][i-1] = this.grid[j][i];
                this.grid[j][i] = down;
            }else if(down === 3){
                this.sandInWater(i, j, -1);
            }
        }
        return hasFlow
    }
    sandFlowRight(i:number, j:number){
        const hasFlow = i+1 < this.width;
        if(hasFlow){
            const down = this.grid[j+1][i+1];
            if(down === 0){
                this.grid[j+1][i+1] = this.grid[j][i];
                this.grid[j][i] = down;
            }else if(down === 3){
                if(j-1 >= 0){
                    this.sandInWater(i, j, 1);
                }   
            }
        }
        return hasFlow;
    }
    sandInWater(i:number, j:number, c:number){
        if(j-1 >= 0){
            if(this.grid[j-1][i] === 0){
                this.grid[j+1][i+c] = this.grid[j][i];
                this.grid[j][i] = 0;
                let n = j
                while(n > 0 && this.grid[n][i+c] === 3){
                    n--;
                }
                if(this.grid[n][i+c] === 0){
                    this.grid[n][i+c] = 3;
                }
            }else if(this.grid[j-1][i] === 3){
                this.grid[j+1][i+c] = this.grid[j][i];
                this.grid[j][i] = 3;
            }
        } 
    }
    sandSim(i:number, j:number){
        const down = this.grid[j+1][i];
        //needs water rise - try water bodies
        if(down === 0 || down === 3){
            this.grid[j+1][i] = this.grid[j][i];
            this.grid[j][i] = down;
        }else{
            const c = Math.random();
            if(c < 0.5){
                if(!this.sandFlowLeft(i,j)){
                    this.sandFlowRight(i, j);
                };
            }else{
                if(!this.sandFlowRight(i, j)){
                    this.sandFlowLeft(i, j);
                };
            }
        }
    }
    rightFlowWater(i:number, j:number){
        const val = this.grid[j+1][i];
        if(i+1 < this.width && this.grid[j+1][i+1] === 0){
            this.grid[j+1][i+1] = 3;
            this.grid[j][i] = 0;
            this.lrMovementGrid[j+1][i+1] = 1;
        }else if(i-1 >= 0 && this.grid[j+1][i-1] === 0){
            this.grid[j+1][i-1] = 3;
            this.grid[j][i] = 0;
            this.lrMovementGrid[j+1][i-1] = -1;
        }else if(val === 1 || val === 2 || j+1 === this.height){

        }else if(!this.moveWaterRight(i, j)){
            this.moveWaterLeft(i,j);
        }
        
        /*else if(i+1 < this.width && this.grid[j][i+1] === 0){
            this.grid[j][i+1] = 3;
            this.grid[j][i] = 0;
            this.lrMovementGrid[j][i+1] = 1;
        }else if(i-1 >= 0 && this.grid[j][i-1] === 0){
            this.grid[j][i-1] = 3;
            this.grid[j][i] = 0;
            this.lrMovementGrid[j][i-1] = -1;
        }*/
    }
    leftFlowWater(i:number, j:number){
        const val = this.grid[j+1][i];
        if(i-1 > 0 && this.grid[j+1][i-1] === 0){
            this.grid[j+1][i-1] = 3;
            this.grid[j][i] = 0;
            this.lrMovementGrid[j+1][i-1] = -1;
        }
        else if(i+1 < this.width && this.grid[j+1][i+1] === 0){
            this.grid[j+1][i+1] = 3;
            this.grid[j][i] = 0;
            this.lrMovementGrid[j+1][i+1] = 1;
        }else if(val === 1 || val === 2 || j+1 === this.height){

        }else if(!this.moveWaterLeft(i, j)){
            this.moveWaterRight(i,j);
        }
        /*else if(i-1 >= 0 && this.grid[j][i-1] === 0){
            this.grid[j][i-1] = 3;
            this.grid[j][i] = 0;
            this.lrMovementGrid[j][i-1] = -1;
        }else if(i+1 < this.width && this.grid[j][i+1] === 0){
            this.grid[j][i+1] = 3;
            this.grid[j][i] = 0;
            this.lrMovementGrid[j][i+1] = 1;
        }*/
    }
    moveWaterLeft(i:number, j:number){
        let n = 0;
        let maxEmpty = 0;
        let emp = [];
        while(n+1 <= this.waterSpeed && i-n-1 >= 0 && 
            (this.grid[j][i-n-1] === 0 || this.grid[j][i-n-1] === 3)){
            n++;
            if(this.grid[j][i-n] === 0){
                maxEmpty = n;
                emp.push(n);
            }
        }
        const m = emp[Math.floor(Math.random()*emp.length)];
        //console.log(n);
        if(m > 0){
            const v = this.grid[j][i-m];
            this.grid[j][i-m] = 3;
            this.grid[j][i] = v;
            this.lrMovementGrid[j][i-m] = -1;
            return true;
        }
        /*
        if(maxEmpty > 0){
            const v = this.grid[j][i-maxEmpty];
            this.grid[j][i-maxEmpty] = 3;
            this.grid[j][i] = v;
            this.lrMovementGrid[j][i-maxEmpty] = -1;
            return true;
        }*/
        return false;
    }
    moveWaterRight(i:number, j:number){
        let n = 0;
        let maxEmpty = 0;
        let emp = [];
        while(n+1 <= this.waterSpeed && i+n+1 < this.width && 
            (this.grid[j][i+n+1] === 0 || this.grid[j][i+n+1] === 3)){
            n++;
            if(this.grid[j][i+n] === 0){
                maxEmpty = n;
                emp.push(n);
            }
        }
        const m = emp[Math.floor(Math.random()*emp.length)];
        //console.log(n);
        if(m > 0){
            const v = this.grid[j][i+m];
            this.grid[j][i+m] = 3;
            this.grid[j][i] = v;
            this.lrMovementGrid[j][i+m] = 1;
            return true;
        }
        /*if(maxEmpty > 0){
            const v = this.grid[j][i+maxEmpty];
            this.grid[j][i+maxEmpty] = 3;
            this.grid[j][i] = v;
            this.lrMovementGrid[j][i+maxEmpty] = 1;
            return true;
        }*/
        return false;
    }
    waterSim(waterParts:Array<Point>){
        while(waterParts.length > 0){
            const id = Math.floor(Math.random()*waterParts.length);
            const item = waterParts.splice(id, 1)[0];
            //const item = waterParts.pop();
            //console.log(item);
            if(item){
                const i = item.x; const j = item.y;
                const val = this.grid[j+1][i];
                if(val === 0){
                    this.grid[j+1][i] = this.grid[j][i];
                    this.grid[j][i] = 0;
                    this.lrMovementGrid[j+1][i] = 0;
                }else{
                    //const c = Math.random();
                    if(this.lrMovementGrid[j][i] < 0){
                        this.leftFlowWater(i,j);
                    }
                    else if(this.lrMovementGrid[j][i] > 0){
                        this.rightFlowWater(i,j);
                    }else{
                        const c = Math.random();
                        if(c <= 0.5){
                            this.leftFlowWater(i, j);
                            //console.log('l');
                        }else{
                            this.rightFlowWater(i, j);
                            //console.log('r');
                        }
                    }
                }
            }
        }
    }
    mouseGrid(mouse:Point){
        const mx = mouse.x - this.x; const my = mouse.y - this.y;
        if(mx > 0 && my > 0 && mx < this.drawSize*this.width && my < this.drawSize*this.height){
            return new Point(Math.floor(mx/this.drawSize), Math.floor(my/this.drawSize));
        }
        return null;
    }
    toggleView(){
        if(this.view == 2){
            this.view = 0;
        }else{
            this.view++;
        }
    }
    drawCell(cr:CanvasRenderingContext2D, i:number, j:number){
        const dr = Math.floor(this.deepGrid[j][i]/4);
        if(this.grid[j][i] === 1){
            cr.fillStyle = 'black';
            cr.fillRect(i*this.drawSize+this.x, j*this.drawSize+this.y, this.drawSize, this.drawSize);
        //colours for deep water / sand
        }else if(this.grid[j][i] === 2){
            const col = dr < this.ncols ? this.sandColours[dr] : this.sandColours[this.ncols-1];
            cr.fillStyle = col;
            cr.fillRect(i*this.drawSize+this.x, j*this.drawSize+this.y, this.drawSize, this.drawSize);
        }
        else if(this.grid[j][i] === 3){
            const col = dr < this.ncols ? this.waterColours[dr] : this.waterColours[this.ncols-1];
            cr.fillStyle = col;
            cr.fillRect(i*this.drawSize+this.x, j*this.drawSize+this.y, this.drawSize, this.drawSize);
        }
    }
    draw(cr:CanvasRenderingContext2D){
        cr.fillStyle = this.backgroundColour;
        cr.fillRect(this.x, this.y, this.drawSize*this.width, this.drawSize*this.height);
        cr.strokeStyle = 'black';
        cr.strokeRect(this.x, this.y, this.drawSize*this.width, this.drawSize*this.height);
        if(this.view === 0){
            for(let j=0; j < this.height; ++j){
                for(let i=0; i < this.width; i++){
                    this.drawCell(cr, i, j);
                }
            }
        }else if(this.view === 1){
            for(let j=0; j < this.height; ++j){
                for(let i=0; i < this.width; i++){
                    if(this.lrMovementGrid[j][i] > 0){
                        cr.fillStyle = '#DD3333';
                        cr.fillRect(i*this.drawSize+this.x, j*this.drawSize+this.y, this.drawSize, this.drawSize);
                    }else if(this.lrMovementGrid[j][i] < 0){
                        cr.fillStyle = '#33DD33';
                        cr.fillRect(i*this.drawSize+this.x, j*this.drawSize+this.y, this.drawSize, this.drawSize);
                    }else{
                        this.drawCell(cr, i, j);
                    }
                }
            }
        }else if(this.view === 2){
            const stCol = new Colour(255, 255, 255);
            const cols = [];
            const ncols = 40;
            for(let i = 0; i < ncols; i++){
                cols.push(stCol.toString());
                stCol.addAll(-5);
            }
            for(let j=0; j < this.height; ++j){
                for(let i=0; i < this.width; i++){
                    if(this.grid[j][i] !== 0){
                        const dr = Math.floor(this.deepGrid[j][i]/4);
                        const col = dr < ncols ? cols[dr] : cols[ncols-1];
                        cr.fillStyle = col;
                        cr.fillRect(i*this.drawSize+this.x, j*this.drawSize+this.y, this.drawSize, this.drawSize);
                    }
                }
            }
        }
    }
}

export class WaterSandSim extends SandSim{
    //constructor()

    findWaterBodies(){
        const waterBodies:Array<WaterBody> = [];
        let lastSolidParts = Array(this.width).fill(true);
        for(let j=this.height-1; j >= 0; j--){
            const waterRanges = [];
            let lastWater = false;
            const newSolidParts = [];
            for(let i=0; i < this.width; i++){
                const val = this.grid[j][i];
                if(val === 3){
                    if(lastWater){
                        waterRanges[-1].incRange();
                    }else{
                        waterRanges.push(new Range(i));
                    }
                    lastWater = true;
                    //waterRanges.push(new Point(i, j));
                }else{
                    lastWater = false;
                }
                if(val === 1 || val === 2){
                    newSolidParts.push(true)
                }else{
                    newSolidParts.push(false);
                }
            }
            waterRanges.forEach((range) => {
                //range.inside
            });
            lastSolidParts = newSolidParts;
        }
        console.log(waterBodies);
    }
}