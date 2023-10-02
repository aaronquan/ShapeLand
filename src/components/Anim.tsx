import React, {MouseEventHandler, useEffect, useState, useRef} from 'react';
import {Canvas, MouseState, defaultMouseStateCreator} from './Canvas';
import {Colour, Point, VirtRect, VirtCircle} from '../game/shapes';
import {PhysicsSim, SandSim, WaterSandSim} from '../game/phys'
import {AnimTime} from '../game/time';

class Player2D{
    pos: Point;
    movex: number; movey:number;
    size: number;
    hs: number; //halfsize;
    rect: VirtRect;
    constructor(){
        this.pos = new Point(0, 0);
        this.movex = 0;
        this.movey = 0;
        this.size = 6;
        this.hs = this.size/2;
        this.rect = new VirtRect(this.pos.x-this.hs, this.pos.y-this.hs, this.size, this.size);
    }
    setPoint(p:Point){
        this.pos = p;
        this.rect = new VirtRect(this.pos.x-this.hs, this.pos.y-this.hs, this.size, this.size);
    }
    setMoveX(n:number){
        this.movex = n;
    }
    setMoveY(n:number){
        this.movey = n;
    }
    update(){
        this.pos.add(new Point(this.movex, this.movey));
        this.rect = new VirtRect(this.pos.x-this.hs, this.pos.y-this.hs, this.size, this.size);
    }
    draw(cr:CanvasRenderingContext2D){
        this.rect.draw(cr);
    }
}

class AdjustRect{
    rect:VirtRect;
    lt:VirtCircle; lb:VirtCircle;
    rt:VirtCircle; rb:VirtCircle;
    ltClicked:boolean; lbClicked:boolean;
    rtClicked:boolean; rbClicked:boolean;
    drag:boolean;
    constructor(r:VirtRect){
        this.rect = r;
        this.lt = new VirtCircle(r.left, r.top, 3);
        this.lb = new VirtCircle(r.left, r.bottom, 3);
        this.rt = new VirtCircle(r.right, r.top, 3);
        this.rb = new VirtCircle(r.right, r.bottom, 3);
        this.ltClicked = false; this.lbClicked = false;
        this.rtClicked = false; this.rbClicked = false;
        this.drag = false;
        //this.handleMouseUp();
    }
    handleMouseDown(p:Point){
        console.log(p);
        if(this.lt.hitPoint(p)){
            this.ltClicked = true;
        }else if(this.lb.hitPoint(p)){
            this.lbClicked = true;
        }else if(this.rt.hitPoint(p)){
            this.rtClicked = true;
        }else if(this.rb.hitPoint(p)){
            this.rbClicked = true;
        }
        else if(this.rect.hitPoint(p)){
            this.drag = true;
        }
    }
    handleMouseUp(){
        this.drag = false;
        this.ltClicked = false; this.lbClicked = false;
        this.rtClicked = false; this.rbClicked = false;
    }

    update(mm:Point){
        let dx = mm.x; let dy = mm.y;
        //console.log(mm);
        if(this.ltClicked){
            //if(this.rect.width !== 0 && this.rect.width + dx <= 0){
            //    dx = this.rect.width;
            //}
            //if(this.rect.height !== 0 && this.rect.height + dy <= 0){
            //    dy = this.rect.height;
            //}
            this.rect.left += dx;
            this.rect.top += dy;
            this.rect.width -= dx;
            this.rect.height -= dy;
            this.lt.moveN(dx, dy);
            this.lb.moveN(dx, 0);
            this.rt.moveN(0, dy);
        }
        if(this.lbClicked){
            this.rect.left += dx;
            this.rect.bottom += dy;
            this.rect.width -= dx;
            this.rect.height += dy;
            this.lb.moveN(dx, dy);
            this.lt.moveN(dx, 0);
            this.rb.moveN(0, dy);
        }
        if(this.drag){
            this.rect.move(mm);
            this.lt.move(mm);
            this.lb.move(mm);
            this.rt.move(mm);
            this.rb.move(mm);
        }
    }
    draw(cr:CanvasRenderingContext2D){
        this.rect.draw(cr);
        this.lt.fill(cr);
        this.lb.fill(cr);
        this.rb.fill(cr);
        this.rt.fill(cr);
    }

}

class Walls{
    walls: Array<VirtRect>;
    constructor(){
        this.walls = [];
    }
    add(wall: VirtRect){
        this.walls.push(wall);
    }
    hitTestRect(rect:VirtRect){
        const hits:Array<number> = [];
        this.walls.forEach((wall, index) => {
            if(rect.hitRect(wall)){
                hits.push(index);
            }
        });
        return hits;
    }
    hitTestFrame(){

    }
    draw(cr:CanvasRenderingContext2D){
        this.walls.forEach((wall) => {
            wall.fill(cr);
        });
    }
}

class Sand{
    pos: Point;
    constructor(){
        this.pos = new Point(0, 0);
    }
    setPoint(p:Point){
        this.pos = p;
    }
    update(){
        this.pos.y += 1;
    }
    draw(cr:CanvasRenderingContext2D){
        cr.fillRect(this.pos.x, this.pos.y, 1, 1);
    }
}
class Bouncer{

}




//input changes since last update
export type InputChanges = {
    mouseMovement: Point;
    mouseScroll: number;
}

type RawInputs = {
    mouseState:MouseState;
    changes:InputChanges;
};

export function useAnim(cr:CanvasRenderingContext2D | null,
    animationStep?:(cr:CanvasRenderingContext2D, time:number, 
        inputChanges:InputChanges, animTime:AnimTime) => void, rawMouseState?:MouseState){
    const init = useRef(false);
    const animTime = useRef(new AnimTime());
    const mouseState = useRef<MouseState>(defaultMouseStateCreator());
    function step(time:number){
        animTime.current.frame(time);
        if(cr){
            if(animationStep){
                let inputChanges = {mouseMovement: new Point(), mouseScroll: 0};
                if(rawMouseState){
                    const movement = rawMouseState.position.diff(mouseState.current.position);
                    const scrolls = mouseState.current.scroll - rawMouseState.scroll;
                    inputChanges = {
                        mouseMovement: movement,
                        mouseScroll: scrolls
                    }
                    mouseState.current.matchState(rawMouseState);
                    //mouseState.current.scroll = rawMouseState.scroll;
                }
                animationStep(cr, time, inputChanges, animTime.current);
            }
        }
        if(init.current) window.requestAnimationFrame(step);
    }
    useEffect(() => {
        if(!init.current && cr){
            init.current = true;
            window.requestAnimationFrame(step);
        }
        return () => {
            console.log('unload animation?');
            init.current = false;
        }
    }, [cr]);
    return {animTime: animTime.current, /*frameMouseState: mouseState.current*/};
}

//use use anim with canvas

export function Anim(props:AnimProps){
    const renderer = useRef<CanvasRenderingContext2D | null>(null);
    const times = useAnim(renderer.current, props.animationStep);
    function onInit(cr:CanvasRenderingContext2D){
        renderer.current = cr;
    }
    return(
        <Canvas onInit={onInit} width={props.width} height={props.height}/>
    );
}

type AnimProps = {
    width:number;
    height:number;
    animationStep:(cr:CanvasRenderingContext2D, time?:number) => void;
    
}
/*
export function Anim(props:AnimProps){
    const renderer = useRef<CanvasRenderingContext2D | null>(null);
    const animTime = useRef(new AnimTime());
    useEffect(() => {
        if(renderer.current){
            props.animationStep(renderer.current, );
        }
    }, []);
    function onInit(cr:CanvasRenderingContext2D){
        renderer.current = cr;
    }
    return(
        <Canvas onInit={onInit} width={props.width} height={props.height}/>
    );
}*/

export function useFunAnim(cr:CanvasRenderingContext2D | null, 
    keys?:Set<string>, ktime?:Map<string, number>, ms?:MouseState){
    const lastMousePosition = useRef<Point | null>(null);
    const animTime = useRef(new AnimTime());
    const phys = useRef(new PhysicsSim());
    //const sandSim = useRef(new SandSim(200, 200));
    const sim = useRef(new WaterSandSim(200, 200));

    //const circ = useRef<VirtCircle>(new VirtCircle(200, 200, 50));
    const player = useRef(new Player2D());
    const walls = useRef(new Walls());
    //const virtRect = 
    const adjRect = useRef(new AdjustRect(new VirtRect(10, 10, 10, 10)));
    const hitColour = new Colour(100, 0, 0);
    const wallColour = new Colour(200, 200, 0);

    const tickPeriod = 30;
    const tickTime = useRef(0);
    function step(time:number){
        animTime.current.frame(time);
        //console.log(animTime.current);
        if(!animTime.current.paused){
            const p = player.current;
            p.update();
            phys.current.update(animTime.current.frameTime);
            tickTime.current += animTime.current.frameTime;

            const hitWalls = new Set(walls.current.hitTestRect(adjRect.current.rect));
            walls.current.walls.forEach((wall, n) => {
                if(hitWalls.has(n)) wall.setColour(hitColour);
                else wall.setColour(wallColour);
            });

            if(tickTime.current > tickPeriod){
                //sandSim.current.setSand(180, 1, 3);
                //sandSim.current.setSand(80, 50);
                sim.current.setGrid(82, 0, 2);
                sim.current.setGrid(83, 0, 2);
                sim.current.setGrid(45, 0, 3);
                sim.current.setGrid(100, 0, 3);
                sim.current.setGrid(101, 0, 3);
                //sandSim.current.setSand(125, 20, 4);
                sim.current.tick();
                //sandSim.current.tick();
                tickTime.current -= tickPeriod;
            }
            /*for(const id in hitWalls){
                console.log(Number(id));
                const num = Number(id);
                const wall = walls.current.walls[num];
                if(wall) wall.setColour(hitColour);
            }*/
            if(cr){
                cr.clearRect(0, 0, 500, 500);
                cr.fillStyle = "white";
                cr.fillRect(0, 0, 500, 500);
                
                cr.fillStyle = "grey";
                /*
                const col = new Colour(circ.current.pos.x*(255/500), 
                (circ.current.pos.x+circ.current.pos.y)*(255/1000), circ.current.pos.y*(255/500), 255);
                cr.fillStyle = col.toString();

                circ.current.fill(cr);
                circ.current.place(new Point(250+170*Math.sin(time/400), 250+170*Math.cos(time/400)));
                */
                p.draw(cr);
                adjRect.current.draw(cr);
                walls.current.draw(cr);
                phys.current.draw(cr);
                sim.current.draw(cr);
            }
            if(lastMousePosition.current){
                if(ms){
                    const diff = ms.position.diff(lastMousePosition.current)
                    adjRect.current.update(diff);
                    lastMousePosition.current = ms.position;
                }
            }else{
                if(ms){
                    lastMousePosition.current = ms.position;
                }
            }
            if(keys?.has('d')){
                if(keys?.has('a')){
                    const dt = ktime?.get('d');
                    const at = ktime?.get('a');
                    if(dt && at){
                        if(dt > at){
                            p.setMoveX(1);
                        }else{
                            p.setMoveX(-1);
                        }
                    }
                }
                else{
                    p.setMoveX(1);
                }
            }
            else if(keys?.has('a')){
                p.setMoveX(-1);
            }else{
                p.setMoveX(0);
            }
            if(keys?.has('s')){
                if(keys?.has('w')){
                    const st = ktime?.get('s');
                    const wt = ktime?.get('w');
                    if(st && wt){
                        if(st > wt){
                            p.setMoveY(1);
                        }else{
                            p.setMoveY(-1);
                        }
                    }
                }
                else{
                    p.setMoveY(1);
                }
            }else if(keys?.has('w')){
                p.setMoveY(-1);
            }else{
                p.setMoveY(0);
            }
        }
        
        window.requestAnimationFrame(step);
    }
    useEffect(() => {
        if(cr){
            const vr = new VirtRect(100, 100, 20, 50);
            const vr2 = new VirtRect(100, 200, 20, 50);
            const floor = new VirtRect(100, 460, 300, 20);
            walls.current.add(vr);
            vr.setColour(wallColour);
            walls.current.add(vr2);
            vr2.setColour(wallColour);
            walls.current.add(floor);
            floor.setColour(wallColour);
            //sim walls
            sim.current.setGridArea(50, 50, 80, 1);
            sim.current.setGridArea(100, 130, 50, 1);
            sim.current.setGridArea(40, 120, 15, 1);
            sim.current.setGridArea(40, 115, 1, 5);
            window.requestAnimationFrame(step);
        }
    }, [cr]);
    function handleMouseDown(e:React.MouseEvent<HTMLCanvasElement>){
        //console.log(e);
        //console.log(ms);
        if(ms){
            //console.log(adjRect.current.handleMouseDown(ms.position));
            adjRect.current.handleMouseDown(ms.position);
            const cell = sim.current.mouseGrid(ms.position);
            console.log(cell);
            if(cell) console.log(sim.current.grid[cell.y][cell.x]);
        }
    }
    function handleMouseUp(e:React.MouseEvent<HTMLCanvasElement>){
        adjRect.current.handleMouseUp();
    }
    function handleKeyDown(e:KeyboardEvent){
        if(e.key === 'p'){
            animTime.current.pause();
        }
        if(e.key === 'f'){
            //sim.current.findWaterBodies();
            console.log(sim.current.lrMovementGrid);
            const g = sim.current.lrMovementGrid;
            for(let j=0; j < g.length; ++j){
                for(let i=0; i < g[j].length; i++){
                    if(g[j][i] === 1){
                        console.log(i+' '+j);
                    }
                }
            }

        }
        if(e.key === 'c'){
            sim.current.toggleView();
            if(cr) sim.current.draw(cr);
        }
        if(e.key === 'd'){
            console.log(sim.current.deepGrid);
        }
    }
    return {animTime: animTime.current, handleMouseDown: handleMouseDown,
    handleMouseUp: handleMouseUp, handleKeyDown: handleKeyDown};
}

type MouseStateInputs = {

}

type MouseStateOut = {

};

function useMouseState(msi:MouseStateInputs){

    function handleKeyDown(){

    }
    return {

    }
}