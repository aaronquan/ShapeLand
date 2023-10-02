import { TLRectangle, CenterPointRectangle } from "../ShapeLand/Mechanics/Shapes";
import { Point } from "../game/shapes";
import { CenterBoxText, DrawText } from "./text";

export class CanvasButton{
    button:TLRectangle;
    function:() => void;
    text: string;
    buttonText:CenterBoxText;
    size: number;
    //drawText: DrawText;
    active: boolean;
    buttonColour: string;
    hoverColour: string;
    textColour: string;
    fillColour: string;

    constructor(pos:Point, width:number, height:number, text?:string, size?:number){
        this.button = new TLRectangle(pos, width, height);
        this.function = () => {};
        this.active = false;
        this.text = text ? text : '';
        this.size = size ? size : 10;
        this.buttonColour = 'blue';
        this.hoverColour = '#2233BB';
        this.fillColour = this.buttonColour;
        this.textColour = 'white';
        this.buttonText = new CenterBoxText(this.text, pos, width, height, this.size, );
        //this.size = size ? size : 10;
        //const textPt = new Point(pos.x + (width/2) - )
        //this.drawText = new DrawText(text ? text : '', size);
    }
    setText(text:string){
        this.buttonText.text = text;
        this.text = text;
    }
    setFunction(f:()=>void){
        this.function = f;
    }
    mouseDown(pt:Point){
        this.active = this.button.isPointInside(pt);
    }
    mouseUp(pt:Point){
        if(this.active){
            this.function();
            this.active = false;
        }
    }
    mouseMove(pt:Point){
        if(this.button.isPointInside(pt)){
            this.fillColour = this.hoverColour;
        }else{
            this.fillColour = this.buttonColour;
        }
    }
    draw(cr:CanvasRenderingContext2D){
        cr.fillStyle = this.fillColour;
        this.button.draw(cr);
        //cr.fillStyle = this.textColour;
        //const measure = cr.measureText(this.text);
        //const textX = this.button.pt.x+(this.button.width/2)-(measure.width/2);
        //const textY = this.button.pt.y+(this.button.height/2)+(this.size/2);
        //cr.fillText(this.text, textX, textY);
        this.buttonText.draw(cr);
    }
}

export class CanvasSlider{
    position:Point;
    width:number;
    slider: CenterPointRectangle;
    slideValue: number;

    active: boolean;
    constructor(rect:CenterPointRectangle, width:number, pos:Point){
        this.position = pos;
        this.slider = rect;
        this.width = width ? width : 1;
        this.slideValue = 0;
        this.active = false;
    }
    mouseDown(pt:Point){
        this.active = this.slider.isPointInside(pt);
    }
    mouseMove(pt:Point){
        if(this.active){
            const p = new Point(pt.x, this.position.y);
            if(pt.x < this.position.x){
                p.x = this.position.x;
            }else if(pt.x > this.position.x + this.width){
                p.x = this.position.x + this.width;
            }
            this.slider.pt = p;
            this.slideValue = (p.x - this.position.x)/this.width;
        }
    }
    mouseUp(pt:Point){
        this.active = false;
    }
    draw(cr:CanvasRenderingContext2D){
        cr.beginPath();
        cr.moveTo(this.position.x, this.position.y);
        cr.lineTo(this.position.x+this.width, this.position.y);
        cr.stroke();
        this.slider.draw(cr);
    }
}
