import { CenterPointRectangle, TLRectangle } from "../ShapeLand/Mechanics/Shapes";
import { CanvasButton } from "./controls";
import { Point } from "../game/shapes";


const globalTextInputAttributes = {
    textCursorOn: false
};

setInterval(() => {
    globalTextInputAttributes.textCursorOn = !globalTextInputAttributes.textCursorOn;
}, 600);

class BaseText{
    text:string;
    font: string;
    size: number; //in px
    colour: string;
    constructor(text:string, size?:number, font?:string, colour?:string){
        this.text = text;
        this.font = font ? font : 'Arial'
        this.size = size ? size : 12;
        this.colour = colour ? colour : 'white';
    }
}

export class DrawText extends BaseText{
    textPoint: Point;
    //colour: string;
    constructor(text:string, bl:Point, size?:number, font?:string, colour?:string){
        super(text, size, font, colour);
        this.textPoint = bl; 
        this.colour = colour ? colour : 'white';
    }
    draw(cr:CanvasRenderingContext2D):void{
        cr.font = this.size.toString()+'px '+this.font;
        //console.log(cr.measureText(this.text));
        cr.fillStyle = this.colour;
        cr.fillText(this.text, this.textPoint.x, this.textPoint.y);
    }
}

export class CenterBoxText  extends BaseText{
    box:TLRectangle;
    //text: string;
    constructor(text:string, pt:Point, width:number, height:number, size?:number, font?:string, colour?:string){
        super(text, size, font, colour);
        this.box = new TLRectangle(pt, width, height);
    }
    draw(cr:CanvasRenderingContext2D):void{
        cr.font = this.size.toString()+'px '+this.font;
        cr.fillStyle = this.colour;
        const measure = cr.measureText(this.text);

        const height = measure.fontBoundingBoxAscent + measure.fontBoundingBoxDescent;

        const textX = this.box.pt.x+(this.box.width/2)-(measure.width/2);
        const textY = this.box.pt.y+(this.box.height/2)+(height/4);
        cr.fillText(this.text, textX, textY);
    }
}

//export class TextRect

export class DrawTextInput{
    box:TLRectangle;
    text: string;

    font: string;
    size: number; // in px

    selected: boolean;
    textOn: boolean;
    textPoint: number;
    charLim: number;

    padding:number;
    constructor(tl:Point, width:number, size?:number, font?:string, cLim?: number){
        this.size = size ? size : 12;
        this.text = '';
        this.font = font ? font : 'Arial'
        this.selected = false;
        this.textOn = false;
        this.textPoint = 0;

        this.padding = 2;
        //const metrics = cr.measureText(this.text);
        this.box = new TLRectangle(tl, width, this.size);

        this.charLim = cLim ? cLim : 20;
    }
    handleMouseDown(pt:Point){
        if(this.box.isPointInside(pt)){
            this.selected = true;
            if(this.text.length > 0){
                const canvas = document.createElement("canvas");
                const context = canvas.getContext("2d");
                if(context){
                    context.font = this.getFontString();
                    const measure = context.measureText(this.text);
                    if(pt.x > measure.width+this.box.pt.x){
                        this.textPoint = this.text.length;
                    }else{
                        const charXVals = [this.box.pt.x];
                        let i;
                        for(i=1; i < this.text.length; i++){
                            const measure = context.measureText(this.text.slice(0, i));
                            const x = measure.width+this.box.pt.x;
                            charXVals.push(x);
                            if(pt.x < x){
                                break;
                            }
                        }
                        //to do midpoint
                        const d1 = charXVals[i] - pt.x;
                        const d2 = pt.x - charXVals[i-1];
                        this.textPoint = d1 < d2 ? i : i-1;
                    }
                }
            }
        }else{
            this.selected = false;
        }
        //console.log(this.selected);
    }
    handleMouseUp(pt:Point){
        if(this.box.isPointInside(pt)){
            this.selected = true;
        }else{
            this.selected = false;
        }
        //console.log(this.selected);
    }
    handleKeyDown(e:KeyboardEvent){
        if(this.selected){
            //console.log(e.key);
            if(e.key === 'Backspace'){
                this.text = this.text.slice(0, this.textPoint-1) + this.text.slice(this.textPoint, this.text.length);
                this.textPoint--;
                if(this.textPoint < 0){
                    this.textPoint = 0;
                }
            }else if(e.key === 'ArrowLeft'){
                this.textPoint--;
                if(this.textPoint < 0){
                    this.textPoint = 0;
                }
            }else if(e.key === 'ArrowRight'){
                this.textPoint++;
                if(this.textPoint > this.text.length){
                    this.textPoint = this.text.length;
                }
            }else if(e.key.length === 1 && this.text.length < this.charLim){
                this.text = this.text.slice(0, this.textPoint) + e.key + this.text.slice(this.textPoint, this.text.length);
                //this.text += e.key;
                this.textPoint++;
            }
            //console.log(this.text);
            //this.text.
            //console.log(this.textPoint);
        }
    }
    getFontString(){
        return this.size.toString()+'px '+this.font;
    }
    draw(cr:CanvasRenderingContext2D){
        cr.font = this.size.toString()+'px '+this.font;
        const measure = cr.measureText('A');
        const height = measure.fontBoundingBoxAscent + measure.fontBoundingBoxDescent;
        this.box.height = height+this.padding+this.padding;
        cr.fillStyle = 'white';
        this.box.draw(cr);
        //const measure = cr.measureText(this.text);
        cr.fillStyle = 'black';
        cr.fillText(this.text, this.box.pt.x+this.padding, this.box.pt.y+this.size+this.padding);
        if(this.selected){
            if(globalTextInputAttributes.textCursorOn){
                const measure = cr.measureText(this.text.slice(0, this.textPoint));
                cr.strokeStyle = '#333333';
                const lineX = measure.width + this.box.pt.x+1+this.padding;
                cr.beginPath();
                cr.moveTo(lineX, this.box.pt.y+this.padding);
                cr.lineTo(lineX, this.box.pt.y+height+this.padding);
                cr.stroke();
            }

            cr.lineWidth = 2;
            cr.strokeStyle = '#2233BB';
            this.box.outline(cr);
        }
    }
}