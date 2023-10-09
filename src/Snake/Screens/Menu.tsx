import { CanvasButton } from "../../canvas/controls";
import { CanvasScreen } from "../../components/Canvas";
import { Point } from "../../game/shapes";
import { AutoSnake } from "../Player/AutoSnake";


export class SnakeMenu implements CanvasScreen{
    width: number;
    height:number
    start: CanvasButton;
    offlineStart: CanvasButton;
    snake: AutoSnake;

    mouse: Point;
    constructor(){
        this.start = new CanvasButton(new Point(), 50, 50, 'Start');
        this.offlineStart = new CanvasButton(new Point(), 50, 50, 'Start');
        this.width = 0; this.height = 0
        this.snake = new AutoSnake();

        this.mouse = new Point();
    }
    resize(winX:number, winY:number){
        this.width = winX;
        this.height = winY;
        this.start.setPoint(new Point(winX/2, winY/2));
    }
    update(secs:number){
        this.snake.adjustRotation(this.mouse);
        this.snake.update(secs);
    }
    mouseMove(e: React.MouseEvent<HTMLCanvasElement>, pos: Point): void {
        //throw new Error("Method not implemented.");
        this.mouse = pos;
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
        cr.clearRect(0, 0, this.width, this.height);
        this.start.draw(cr);
        this.snake.draw(cr);
    }
}