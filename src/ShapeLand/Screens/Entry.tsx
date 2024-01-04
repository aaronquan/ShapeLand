import { CanvasButton } from "../../canvas/controls";
import { DrawTextInput } from "../../canvas/text";
import { CanvasScreen } from "../../components/Canvas";
import { Point, Vector2D } from "../../game/geometry";

export class SLEntry implements CanvasScreen{
    connectButton:CanvasButton;
    offlineJoinButton:CanvasButton;
    width: number;
    height: number;
    textBox: DrawTextInput;

    rot:number;
    constructor(width:number, height:number){
        this.connectButton = new CanvasButton(new Point(width/2, height/2), 80, 40) 
        this.connectButton.setText('Not Connected');
        this.connectButton.buttonColour = 'blue';
        this.offlineJoinButton = new CanvasButton(new Point(width/2, height/2 + 50), 80, 40) 
        this.offlineJoinButton.setText('Join Offline');
        this.offlineJoinButton.buttonColour = 'green';

        this.width = width;
        this.height = height;
        this.textBox = new DrawTextInput(new Point(width/2, height/2 - 30), 100, 20);

        this.rot = 0;
    }
    setJoinFunction(func:() => void){
        this.offlineJoinButton.function = func;
    }
    onServerConnect(func:() => void){
        this.connectButton.buttonColour = 'blue';
        this.connectButton.setText('Join Game');
        this.connectButton.function = func;
    }
    serverDisconnect(){
        this.connectButton.setText('Not Connected');
        this.connectButton.buttonColour = 'red';
        this.connectButton.function = () => {};
    }
    mouseMove(e:React.MouseEvent<HTMLCanvasElement>, pos:Point){
        this.connectButton.mouseMove(pos);
        this.offlineJoinButton.mouseMove(pos);
    }
    mouseDown(e:React.MouseEvent<HTMLCanvasElement>, pos:Point){
        this.connectButton.mouseDown(pos);
        this.offlineJoinButton.mouseDown(pos);
        this.textBox.mouseDown(pos);
    }
    mouseUp(e:React.MouseEvent<HTMLCanvasElement>, pos:Point){
        this.connectButton.mouseUp(pos);
        this.offlineJoinButton.mouseUp(pos);
        this.textBox.mouseUp(pos);
    }
    keyDown(e:KeyboardEvent, key:string){
        this.textBox.keyDown(e);
    }
    keyUp(e: KeyboardEvent, key: string): void {
        
    }
    draw(cr:CanvasRenderingContext2D):void{
        cr.clearRect(0, 0, this.width, this.height);
        cr.fillStyle = 'white';
        cr.fillText('still connecting', this.width-100, 10);
        this.connectButton.draw(cr);
        this.offlineJoinButton.draw(cr);
        this.textBox.draw(cr);

        const v = new Vector2D(200, 400);
        const rv = v.copy();
        rv.rotate(this.rot);
        this.rot+=0.01;

        cr.strokeStyle = 'white';
        cr.beginPath();
        cr.moveTo(100, 100);
        cr.lineTo(100+v.x, 100+v.y);
        cr.moveTo(100, 100);
        cr.lineTo(100+rv.x, 100+rv.y);
        cr.stroke();
    }
}