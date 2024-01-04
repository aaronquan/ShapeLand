import { 
    CanvasButton, ColourPicker, InteractableControl, 
    SimpleBelt 
} from "../../canvas/controls";
import { DrawTextInput } from "../../canvas/text";
import { CanvasScreen } from "../../components/Canvas";
import { Colour, Point } from "../../game/geometry";
import { WrappingView, rectangleRegionToString } from "../../game/view";
import { ALogCurve, AutoSnake, SMouse } from "../Player/AutoSnake";

import { SnakeScreenState } from "./Main";


export class SnakeMenu implements CanvasScreen{
    playerName: string;
    setNameFunction: (newName:string) => void;

    wrapView: WrappingView;

    width: number;
    height:number
    //start: CanvasButton;
    serverFinderButton: CanvasButton;
    offlineStartButton: CanvasButton;

    playerInputText: DrawTextInput;

    snake: AutoSnake;

    //curve: ALogCurve;

    mouse: Point;
    initial: boolean; // first loading in

    greyMouses: SMouse[];
    redMouses: SMouse[];

    colourPicker:ColourPicker;
    colourPicker2:ColourPicker;

    testBelt: SimpleBelt;
    controls: InteractableControl[];
    constructor(playerName:string){
        this.playerName = playerName;
        this.setNameFunction = () => {};

        this.wrapView = new WrappingView(0, 0);

        //this.start = new CanvasButton(new Point(), 50, 50, 'Start');
        this.serverFinderButton = new CanvasButton(new Point(), 50, 50, 'Server Finder');
        this.offlineStartButton = new CanvasButton(new Point(), 50, 50, 'Start');

        this.playerInputText = new DrawTextInput(new Point(), 100);
        this.playerInputText.onBlur = (text:string) => {
            this.playerName = text;
            this.setNameFunction(text);
        };

        this.width = 0; this.height = 0
        this.snake = new AutoSnake();
        this.snake.position = new Point(300, 300);

        //this.curve = new ALogCurve(100, 500);

        this.mouse = new Point();
        this.greyMouses = [];
        this.greyMouses.push(new SMouse());
        this.greyMouses.push(new SMouse());
        this.redMouses = [];
        this.redMouses.push(new SMouse('red'));
        this.redMouses.push(new SMouse('red'));
        this.initial = true;

        this.colourPicker = new ColourPicker(new Point(), 20, 20, 200, 150, 30);
        this.colourPicker.onChooseColour = (col:Colour) => {
            this.snake.bodyColour = col.toString();
        }
        this.colourPicker2 = new ColourPicker(new Point(), 20, 20, 200, 150, 30);
        this.colourPicker2.onChooseColour = (col:Colour) => {
            this.snake.headColour = col.toString();
        }
        this.colourPicker2.setColour(new Colour(0, 255, 0));

        this.testBelt = new SimpleBelt(new Point(100, 100), 40, 40, 3, 15);

        this.controls = [
            this.testBelt,
            this.offlineStartButton,
            this.serverFinderButton,
            this.playerInputText
        ];
    }
    setJoinGameFunction(f:()=>void){
        this.offlineStartButton.setFunction(f);
    }
    setServerFinderButtonFunction(f:()=>void){
        this.serverFinderButton.setFunction(f);
    }
    resize(winX:number, winY:number){

        this.width = winX;
        this.height = winY;
        this.wrapView = new WrappingView(winX, winY);
        const midPt = new Point(winX/2, winY/2);
        this.offlineStartButton.setPoint(midPt);
        this.serverFinderButton.setPoint(new Point (midPt.x, midPt.y+60));
        this.colourPicker.setPoint(new Point(midPt.x, midPt.y-30));
        this.colourPicker2.setPoint(new Point(midPt.x + 30, midPt.y-30));

        this.playerInputText.setPoint(new Point(midPt.x, midPt.y-70));

        if(this.initial){
            if(this.width > 0 && this.height > 0){
                this.greyMouses.forEach((mouse) => {
                    mouse.randomPosition(this.width, this.height);
                });
                this.redMouses.forEach((mouse) => {
                    mouse.randomPosition(this.width, this.height);
                });
                this.initial = false;
            }
        }
    }
    update(secs:number){
        const possiblePositions = this.wrapView.wrappingPoints(this.mouse);
        const closest = this.snake.position.closest(possiblePositions);
        this.snake.adjustRotation(closest);
        this.snake.update(secs);
        const newPos = this.wrapView.wrapPoint(this.snake.position);
        this.snake.setPosition(newPos);

        this.greyMouses.forEach((mouse) => {
            if(this.snake.hitCircle(mouse.hitBox)){
                this.snake.addMaxBody(5);
                mouse.randomPosition(this.width, this.height);
            }
        });
        this.redMouses.forEach((mouse) => {
            if(this.snake.hitCircle(mouse.hitBox)){
                this.snake.addSize(1);
                mouse.randomPosition(this.width, this.height);
            }
        });
    }
    mouseMove(e: React.MouseEvent<HTMLCanvasElement>, pos: Point): void {
        this.mouse = pos;
        this.colourPicker.mouseMove(pos);
        this.colourPicker2.mouseMove(pos);
        
        this.controls.forEach(control => control.mouseMove(pos));

        //if(this.snake.pointCollision(pos)) console.log('collision with snake');
    }
    mouseDown(e: React.MouseEvent<HTMLCanvasElement>, pos: Point): void {
        if(!this.colourPicker2.open){
            this.colourPicker.mouseDown(pos);
        }
        if(!this.colourPicker.open){
            this.colourPicker2.mouseDown(pos);
        }
        if(!(this.colourPicker2.open || this.colourPicker.open)){
            this.controls.forEach(control => control.mouseDown(pos));
        }
        if(this.snake.pointCollision(pos)) console.log('collision with snake');

    }
    mouseUp(e: React.MouseEvent<HTMLCanvasElement>, pos: Point): void {
        this.colourPicker.mouseUp(pos);
        this.colourPicker2.mouseUp(pos);
        //this.offlineStartButton.mouseUp(pos);
        this.controls.forEach(control => control.mouseUp(pos));
    }
    keyDown(e: KeyboardEvent, key: string): void {
        this.controls.forEach(control => {
            if(control.keyDown) control.keyDown(e)
        });
    }
    keyUp(e: KeyboardEvent, key: string): void {
        if(key === 'q'){
            this.snake.addMaxBody(200);
        }else if(key === 'w'){
            this.snake.addMaxBody(-200);
        }else if(key === 'e'){
            this.snake.addSize(1);
        }else if(key === 'r'){
            this.snake.addSize(-1);
        }else if(key === 't'){
            this.snake.changeBodyType(true);
        }
        if(key === 'g'){
            console.log(this.snake.tailPolygon);
        }
        if(key === 'p'){
            if(this.snake.moveSpeed === 0){
                this.snake.moveSpeed = 150;
            }else{
                this.snake.moveSpeed = 0;
            }
       }  
    }
    draw(cr: CanvasRenderingContext2D): void {
        cr.clearRect(0, 0, this.width, this.height);
        this.offlineStartButton.draw(cr);
        this.serverFinderButton.draw(cr);
        this.snake.draw(cr);
        this.greyMouses.forEach((mouse) => {
            mouse.draw(cr);
        });
        this.redMouses.forEach((mouse) => {
            mouse.draw(cr);
        });

        this.controls.forEach(control => control.draw(cr));
        this.colourPicker.draw(cr);
        this.colourPicker2.draw(cr);

        cr.fillStyle = 'white';
        cr.font = '12px';
        cr.fillText('Playing as: '+this.playerName, 10, 10);
    }
}