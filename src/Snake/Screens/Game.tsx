import { MouseEvent } from "react";
import { CanvasScreen, MouseState } from "../../components/Canvas";
import { Point } from "../../game/geometry";
import { ViewArea } from "../../game/view";
import { AutoSnake, CircleVisionAutoSnake, SMouse } from "../Player/AutoSnake";
import { CanvasButton } from "../../canvas/controls";
import { SnakeServer, SnakeServerInfo } from "./ServerFinder";
import { getServerQueryRequest, postServerQueryRequest } from "../../hooks/APICall";
import { DrawText } from "../../canvas/text";
import { ReceiveUpdateSnakeData, SnakeGameUpdater, SnakeSendPlayerData } from "../Player/Updater";

export class OfflineSnakeGame implements CanvasScreen{
        snake: CircleVisionAutoSnake;
        view: ViewArea;
        
        exit: CanvasButton;

        greyMouses: SMouse[];
        hasFullVision: boolean;
        //visionRadius: 
    constructor(){
        this.snake = new CircleVisionAutoSnake();
        this.snake.moveSpeed = 1.5;
        this.snake.setSize(0.5);
        this.snake.addMaxBody(300);
        this.view = new ViewArea(0, 0);
        this.exit = new CanvasButton(new Point(50, 50), 100, 50, 'Exit');
        this.greyMouses = [];
        this.greyMouses.push(new SMouse('grey', 1));
        //this.greyMouses.push(new SMouse('grey', 1));
        this.hasFullVision = true;
    }
    setExitGameFunction(f:()=>void){
        this.exit.setFunction(f);
    }
    initGame(){
        this.snake.setRandomPosition(this.view.pos.x, this.view.pos.y, this.view.width, this.view.height);
    }
    mouseMove(e: MouseEvent<HTMLCanvasElement>, pos: Point): void {
        //throw new Error("Method not implemented.");
        this.exit.mouseMove(pos);
    }
    mouseDown(e: MouseEvent<HTMLCanvasElement>, pos: Point): void {
        //throw new Error("Method not implemented.");
        this.exit.mouseDown(pos);
    }
    mouseUp(e: MouseEvent<HTMLCanvasElement>, pos: Point): void {
        //throw new Error("Method not implemented.");
        this.exit.mouseUp(pos);
    }
    keyDown(e: KeyboardEvent, key: string): void {
        //throw new Error("Method not implemented.");
    }
    keyUp(e: KeyboardEvent, key: string): void {
        if(key === 'v'){
            this.hasFullVision = !this.hasFullVision;
        }
    }
    resize(winX:number, winY:number){
        this.view.setView(winX, winY);
        this.view.initArea(30);
    }
    update(rawMouseState:MouseState, frameTime:number){
        this.view.centerOn(this.snake.position);
        const secs = frameTime/1000;
        const gamePoint = this.view.canvasToAreaCoord(rawMouseState.position);
        this.snake.adjustRotation(gamePoint);
        this.snake.update(secs);
        //console.log(this.view.pos);
    }
    drawDebug(cr:CanvasRenderingContext2D):void{
        cr.fillText('Full Vision: '+this.hasFullVision, 10, 10);
    }
    draw(cr:CanvasRenderingContext2D):void{
        //cr.clearRect(0, 0, 500, 500);
        this.view.clearViewArea(cr);
        this.view.drawGrid(cr);
        this.drawDebug(cr);

        this.view.setTransformation(cr);
        //this.exit.draw(cr);
        this.snake.draw(cr);
        if(this.hasFullVision){
            this.greyMouses.forEach((mouse) => {
                mouse.draw(cr);
            });
        }else{
            this.greyMouses.forEach((mouse) => {
                if(this.snake.canSee(mouse.hitBox)){
                    mouse.draw(cr);
                }
            });
        }

        //test masking
        /*
        const mask = document.createElement('canvas');
        mask.width = this.view.width;
        mask.height = this.view.height;
        const maskCtx = mask.getContext('2d');
        if(maskCtx){
            maskCtx.fillStyle = '#000044aa';
            //this.view.fillView(maskCtx);
            maskCtx.fillRect(0, 0, mask.width, mask.height);
            maskCtx.globalCompositeOperation = 'xor';
            this.view.setTransformation(maskCtx);
            this.snake.drawVision(maskCtx);
            maskCtx.fill();
            cr.resetTransform();
            cr.drawImage(mask, 0, 0);
        }*/

        cr.resetTransform();
        this.exit.draw(cr);
    }

}
export class OnlineSnakeGame implements CanvasScreen{
    snake: CircleVisionAutoSnake;
    view: ViewArea;
    exit: CanvasButton;
    testServerButton: CanvasButton;

    playerName: string;

    otherSnakes: Map<string, AutoSnake>;
    server: SnakeServer | null;

    updater: SnakeGameUpdater;

    connectStatus: DrawText;
    constructor(){
        this.snake = new CircleVisionAutoSnake();
        this.snake.moveSpeed = 5;
        this.snake.setSize(1);
        //this.snake.setSize = 100;
        this.view = new ViewArea(0, 0);
        this.exit = new CanvasButton(new Point(50, 50), 100, 50, 'Exit');
        this.testServerButton = new CanvasButton(new Point(50, 120), 100, 50, 'Test Server');
        this.testServerButton.setFunction(() => {
            if(this.server) this.updater.requestServer(this.server, this.snake, this.playerName);
        });
        this.playerName = '';

        this.otherSnakes = new Map<string, AutoSnake>();

        this.server = null;

        this.updater = new SnakeGameUpdater();
        this.updater.onReceiveData = (data: ReceiveUpdateSnakeData) => {
            data.snakePlayerData.forEach((playerData:SnakeSendPlayerData) => {
                if(playerData.disconnected){
                    this.otherSnakes.delete(playerData.playerName);
                }else{
                    if(this.otherSnakes.has(playerData.playerName)){
                        const snake = this.otherSnakes.get(playerData.playerName);
                        if(snake){
                            this.generateOtherSnake(snake, playerData);
                        }
                    }else{
                        console.log('added Snake');
                        const newSnake = AutoSnake.fromSendPlayerData(playerData);
                        this.otherSnakes.set(playerData.playerName, newSnake);
                    }
                }
            });
        }

        this.connectStatus = new DrawText('Not Connected', new Point(80, 50));
    }
    generateOtherSnake(snake:AutoSnake, playerData:SnakeSendPlayerData){
        snake.setPosition(new Point(playerData.position[0], playerData.position[1]));
        snake.rotation.set(playerData.rotation);
        //return snake;
    }
    connectToServer(){
        if(this.server){
            const req = postServerQueryRequest(['connectSnakeLandServer'], '/connectSnakeLandServer', 
            {serverName: this.server.name, playerName: this.playerName},
            null, 
            (data) => {
                console.log('connecting to server');
                console.log(data);
                //this.generateServerButtons(serverList);
            });
        }
    }
    disconnectServer(){
        if(this.server){
            const req = postServerQueryRequest(['disconnectSnakeLandServer'], '/disconnectSnakeLandServer', 
            {serverName: this.server.name, playerName: this.playerName},
            null, 
            (data) => {
                console.log('disconnected from server');
                console.log(data);
                //this.generateServerButtons(serverList);
            });
        }
    }
    onChangeScreen(){
        //console.log('runing');
        this.connectToServer();
    };
    
    setServer(server: SnakeServer){
        this.server = server;
    }
    setExitGameFunction(f:()=>void){
        this.exit.setFunction(() => {
            this.disconnectServer();
            f();
        });
    }
    resize(winX: number, winY: number): void {
        this.view.setView(winX, winY);
        this.view.initArea(30);
    }
    mouseMove(e: MouseEvent<HTMLCanvasElement>, pos: Point): void {
        this.exit.mouseMove(pos);
        this.testServerButton.mouseMove(pos);
    }
    mouseDown(e: MouseEvent<HTMLCanvasElement>, pos: Point): void {
        this.exit.mouseDown(pos);
        this.testServerButton.mouseDown(pos);
    }
    mouseUp(e: MouseEvent<HTMLCanvasElement>, pos: Point): void {
        this.exit.mouseUp(pos);
        this.testServerButton.mouseUp(pos);
    }
    keyDown(e: KeyboardEvent, key: string): void {

       if(key === 'p'){
            if(this.snake.moveSpeed === 0){
                this.snake.moveSpeed = 5;
            }else{
                this.snake.moveSpeed = 0;
            }
       }    
    }
    keyUp(e: KeyboardEvent, key: string): void {
    }
    update(rawMouseState:MouseState, frameTime:number){
        this.view.centerOn(this.snake.position);
        const secs = frameTime/1000;
        const gamePoint = this.view.canvasToAreaCoord(rawMouseState.position);
        this.snake.adjustRotation(gamePoint);
        this.snake.update(secs);

        //get next 
        //todo only if server returned before next update
        if(this.server && this.playerName != ''){    
            this.updater.requestServer(this.server, this.snake, this.playerName);
        }
    }
    draw(cr: CanvasRenderingContext2D): void {
        this.view.clearViewArea(cr);
        this.view.drawGrid(cr);

        this.view.setTransformation(cr);
        this.snake.draw(cr);

        for(const snake of this.otherSnakes.values()){
            snake.draw(cr);
            //console.log(snake.position);
        }

        cr.resetTransform();
        this.exit.draw(cr);
        this.testServerButton.draw(cr);

        cr.fillStyle = 'white';
        cr.font = '12px';
        cr.fillText('Playing as: '+this.playerName, 10, 10);
        if(this.server) cr.fillText('Connected To: '+this.server.name, 10, 25);

        cr.fillText(this.snake.position.toString(), 10, 40)
    }

}