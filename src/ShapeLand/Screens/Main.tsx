import { Point } from "../../game/geometry";
import { SLEntry } from "./Entry";
import { ShapeLandGame } from "../ShapeLand";
import { CanvasScreen, MouseState } from "../../components/Canvas";

enum SLScreenState{
    Menu, Game, Options
}


export class SLMain implements CanvasScreen{
    screenState: SLScreenState; //0 - menu
    entry: SLEntry;
    game: ShapeLandGame;
    connected: boolean;

    width:number;
    height:number;
    screens: CanvasScreen[];
    constructor(screenWidth:number, screenHeight:number){
        this.screenState = SLScreenState.Menu;
        this.entry = new SLEntry(screenWidth, screenHeight);
        this.game = new ShapeLandGame();
        this.connected = false;

        this.width = screenWidth;
        this.height = screenHeight;
        
        this.screens = [this.entry, this.game];

        this.entry.setJoinFunction(() => {
            this.screenState = SLScreenState.Game;
            this.game.initOfflineGame(this.width, this.height);
        });
    }
    init(){

    }
    connect(){
        //this.entry.onServerConnect();
    }
    disconnect(){
        
    }
    update(rawMouseState:MouseState, frameTime:number){
        if(this.screenState === SLScreenState.Game){
            this.game.update(rawMouseState, frameTime);
        }
    }
    mouseMove(e:React.MouseEvent<HTMLCanvasElement>, pos:Point):void{
        this.screens[this.screenState].mouseMove(e, pos);
    }
    mouseDown(e:React.MouseEvent<HTMLCanvasElement>, pos:Point):void{
        this.screens[this.screenState].mouseDown(e, pos);
    }
    mouseUp(e:React.MouseEvent<HTMLCanvasElement>, pos:Point):void{
        this.screens[this.screenState].mouseUp(e, pos);
    }
    keyDown(e:KeyboardEvent, key:string):void{
        this.screens[this.screenState].keyDown(e, key);
    }
    keyUp(e: KeyboardEvent, key: string): void {
        this.screens[this.screenState].keyUp(e, key);
    }
    draw(cr:CanvasRenderingContext2D):void{
        this.screens[this.screenState].draw(cr);
    }
}