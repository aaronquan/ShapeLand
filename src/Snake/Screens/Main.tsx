import { MouseEvent } from "react";
import { CanvasScreen, CanvasScreenManager, MouseState } from "../../components/Canvas";
import { Point } from "../../game/geometry";

import { SnakeMenu } from "./Menu";
import { AnimTime } from "../../game/time";
import { OfflineSnakeGame, OnlineSnakeGame } from "./Game";
import { SnakeServer, SnakeServerFinder } from "./ServerFinder";


export enum SnakeScreenState{
    Menu, ServerFinder, OfflineGame, Game, Options
}
/*
export class MainScreen{
    screens: CanvasScreen[];
    currentScreen: number | null;
    renderChangeScreen: boolean;
    width:number;
    height:number;
    constructor(width:number, height:number){
        this.screens = [];
        this.currentScreen = null;
        this.renderChangeScreen = false;
        this.width = width;
        this.height = height;
    }
    changeScreen(screenId: number): void {
        this.currentScreen = screenId;
    }
    addScreen(screen:CanvasScreen){
        this.screens.push(screen);
        if(this.currentScreen === null) this.currentScreen = 0;
    }
    draw(cr: CanvasRenderingContext2D): void {
        if(this.renderChangeScreen){
            this.renderChangeScreen = false;
            cr.clearRect(0, 0, this.width, this.height);
        }
        if(this.currentScreen !== null) this.screens[this.currentScreen].draw(cr);
    }
}*/

class ScreenTransition{

}

export class SnakeMain extends CanvasScreenManager implements CanvasScreen{

    playerName: string;
    overwriteName: boolean;

    menu: SnakeMenu;
    serverFinder: SnakeServerFinder;
    offlineGame: OfflineSnakeGame;
    game: OnlineSnakeGame;
    constructor(width:number, height:number, player?:string){
        super(width, height);
        this.playerName = player ? player : 'default';
        this.overwriteName = false;
        this.menu = new SnakeMenu(this.playerName);
        this.serverFinder = new SnakeServerFinder();
        this.offlineGame = new OfflineSnakeGame();
        this.game = new OnlineSnakeGame();
        this.currentScreen = SnakeScreenState.Menu;

        this.menu.setJoinGameFunction(() => {
            this.currentScreen = SnakeScreenState.OfflineGame;
            this.renderChangeScreen = true;
        });

        this.offlineGame.setExitGameFunction(this.generateScreenChangeFunction(SnakeScreenState.Menu));

        this.menu.setServerFinderButtonFunction(
            this.generateScreenChangeFunction(SnakeScreenState.ServerFinder)
        );
        this.menu.setNameFunction = (newName:string) => {
            this.playerName = newName;
            this.menu.playerName = newName;
            this.game.playerName = newName;
            this.overwriteName = true;
        };

        this.serverFinder.setBackButtonFunction(this.generateScreenChangeFunction(SnakeScreenState.Menu));
        this.serverFinder.onJoinServer = (server: SnakeServer) => {
            this.game.setServer(server);
            this.changeScreen(SnakeScreenState.Game);
        };

        this.game.setExitGameFunction(this.generateScreenChangeFunction(SnakeScreenState.Menu));

        this.screens = [
            this.menu, this.serverFinder,
            this.offlineGame, this.game
        ];
    }
    setPlayerName(playerName:string){
        if(!this.overwriteName){
            this.playerName = playerName;
            this.menu.playerName = playerName;
            this.game.playerName = playerName;
        }
    }
    autoDisconnectServer(){
        if(this.game.server){
            this.game.disconnectServer();
        }
    }
    updateAnimTime(time:AnimTime){
        const secs = time.frameTime/1000;
        if(this.currentScreen === SnakeScreenState.Menu) this.menu.update(secs);
    }
    update(mouse:MouseState, frameTime:number){
        if(this.currentScreen === SnakeScreenState.OfflineGame){
            this.offlineGame.update(mouse, frameTime);
        }else if(this.currentScreen === SnakeScreenState.Game){
            this.game.update(mouse, frameTime);
        }
    }
}