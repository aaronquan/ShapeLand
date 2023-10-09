import { MouseEvent } from "react";
import { CanvasScreen } from "../../components/Canvas";
import { Point } from "../../game/shapes";

import { SnakeMenu } from "./Menu";
import { AnimTime } from "../../game/time";


enum SnakeScreenState{
    Menu, Game, Options
}

export class MainScreen{
    screens: CanvasScreen[];
    constructor(){
        this.screens = [];
    }
}

export class SnakeMain extends MainScreen implements CanvasScreen{
    menu: SnakeMenu;
    screenState: SnakeScreenState;
    constructor(width:number, height:number){
        super();
        this.menu = new SnakeMenu();
        this.screenState = SnakeScreenState.Menu;
        this.screens.push(this.menu);
    }
    updateAnimTime(time:AnimTime){
        const secs = time.frameTime/1000;
        if(this.screenState === SnakeScreenState.Menu) this.menu.update(secs);
    }
    resize(winX:number, winY:number){
        if(this.menu.resize) this.menu.resize(winX, winY);
    }
    mouseMove(e: React.MouseEvent<HTMLCanvasElement>, pos: Point): void {
        this.screens[this.screenState].mouseMove(e, pos);
    }
    mouseDown(e: React.MouseEvent<HTMLCanvasElement>, pos: Point): void {
        //throw new Error("Method not implemented.");
    }
    mouseUp(e: React.MouseEvent<HTMLCanvasElement>, pos: Point): void {
        //throw new Error("Method not implemented.");
    }
    keyDown(e: KeyboardEvent, key: string): void {
       //throw new Error("Method not implemented.");
    }
    keyUp(e: KeyboardEvent, key: string): void {
        //throw new Error("Method not implemented.");
    }
    draw(cr: CanvasRenderingContext2D): void {
        this.menu.draw(cr);
    }
}