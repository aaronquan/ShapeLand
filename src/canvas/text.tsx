import { TLRectangle } from "../ShapeLand/Mechanics/Shapes";
import { InteractableControl } from "./controls";
import { Point, VirtRect } from "../game/geometry";
import { IntegerRange } from "../math/Ranges";


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

export class CenterBoxText extends BaseText{
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


//todo add highlighting text
export class DrawTextInput implements InteractableControl{
    box:TLRectangle;
    text: string;

    font: string;
    size: number; // in px

    selected: boolean;
    textOn: boolean;
    textPoint: number;
    charLim: number;

    backgroundColour: string;
    textColour: string;

    isHighlighting: boolean;
    startingHighlightPoint: number;
    highlightedRange: IntegerRange;
    highlightedTextColour: string;
    highlightedBackgroundColour: string;
    highlightedText: string;

    padding:number;

    onChange:(text:string, key:string) => void;
    onBlur:(text:string) => void;
    constructor(tl:Point, width:number, size?:number, font?:string, cLim?: number){
        this.size = size ? size : 20;
        this.text = '';
        this.font = font ? font : 'Arial'
        this.selected = false;
        this.textOn = false;
        this.textPoint = 0;

        this.isHighlighting = false;
        this.startingHighlightPoint = 0;
        this.highlightedRange = new IntegerRange();

        this.highlightedText = '';

        this.padding = 2;
        //const metrics = cr.measureText(this.text);
        this.box = new TLRectangle(tl, width, this.size);

        this.charLim = cLim ? cLim : 20;
        this.onChange = () => {};
        this.onBlur = () => {};

        this.backgroundColour = 'white';
        this.textColour = 'black';

        this.highlightedTextColour = 'white';
        this.highlightedBackgroundColour = 'blue';
    }
    setPoint(pt: Point): void {
        this.box.pt = pt;
    }
    isInside(pt: Point): boolean {
        //throw new Error("Method not implemented.");
        return this.box.isPointInside(pt);
    }
    getRectSpace?(): VirtRect {
        throw new Error("Method not implemented.");
    }
    textXPosition(x:number):number | null{
        if(x < this.box.pt.x) return 0;
        if(x > this.box.pt.x+this.box.width) return this.text.length;
        //most optimal, binary search
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        if(context){
            let cx = this.box.pt.x+this.padding;
            for(let i=0; i < this.text.length; i++){
                context.font = this.getFontString();
                const measure = context.measureText(this.text[i]);
                if(x < cx + measure.width){
                    const letterOffset = x - cx;
                    if(letterOffset > measure.width/2){
                        //right of current letter
                        return i+1;
                    }else{
                        //left of letter
                        return i;
                    }
                }
                cx += measure.width;
            }
            return this.text.length;
        }
        return null;
    }
    mouseMove(pt: Point): void {
        if(this.isHighlighting){
            const textPosition = this.textXPosition(pt.x);
            if(textPosition !== null){
                if(textPosition > this.startingHighlightPoint){
                    this.highlightedRange.setMax(textPosition);
                    this.highlightedRange.setMin(this.startingHighlightPoint);
                }else{
                    this.highlightedRange.setMax(this.startingHighlightPoint);
                    this.highlightedRange.setMin(textPosition);
                }
                this.highlightedText = this.highlightedRange.getStringSlice(this.text);
                this.textPoint = textPosition;
            }
        }
    }
    mouseDown(pt:Point){
        this.highlightedRange = new IntegerRange();
        if(this.box.isPointInside(pt)){
            this.selected = true;
            this.isHighlighting = true;
            const textPosition = this.textXPosition(pt.x);
            if(textPosition !== null){
                this.startingHighlightPoint = textPosition;
            }
        }else{
            //this.selected = false;
        }
        //console.log(this.selected);
    }
    mouseUp(pt:Point){
        if(this.box.isPointInside(pt)){
            this.selected = true;
            if(this.text.length > 0){
                const newPosition = this.textXPosition(pt.x);
                if(newPosition !== null) this.textPoint = newPosition;
            }
            //this.isHighlighting = false;
        }else{
            if(!this.isHighlighting){
                if(this.selected) this.onBlur(this.text);
                this.selected = false;
            }
        }
        this.isHighlighting = false;
        //console.log(this.selected);
    }
    keyDown(e:KeyboardEvent){
        if(this.selected){
            //console.log(e.key);
            if(e.ctrlKey){
                if(e.key === 'c'){
                    if(this.highlightedText){
                        navigator.clipboard.writeText(this.highlightedText);
                    }
                }else if(e.key === 'v'){
                    navigator.clipboard.readText().then((text:string) => {
                        this.removeHighlightedText();
                        if(this.text.length + text.length < this.charLim){
                            this.text = this.text.slice(0, this.textPoint) + text + this.text.slice(this.textPoint, this.text.length);
                            this.textPoint += text.length;
                        }
                    });
                }
            }else{
                if(e.key === 'Delete'){
                    if(this.text.length > this.textPoint){
                        if(!this.removeHighlightedText()){
                            this.text = this.text.slice(0, this.textPoint) + this.text.slice(this.textPoint+1, this.text.length);
                        }
                    }
                }
                else if(e.key === 'Backspace'){
                    if(!this.removeHighlightedText()){
                        this.text = this.text.slice(0, this.textPoint-1) + this.text.slice(this.textPoint, this.text.length);
                        this.textPoint--;
                        if(this.textPoint < 0){
                            this.textPoint = 0;
                        }
                    }
                }else if(e.key === 'ArrowLeft'){
                    this.textPoint--;
                    if(this.textPoint < 0){
                        this.textPoint = 0;
                    }
                    this.unhighlightText();
                }else if(e.key === 'ArrowRight'){
                    this.textPoint++;
                    if(this.textPoint > this.text.length){
                        this.textPoint = this.text.length;
                    }
                    this.unhighlightText();
                }else if(e.key.length === 1 && this.text.length < this.charLim){
                    this.removeHighlightedText();
                    this.text = this.text.slice(0, this.textPoint) + e.key + this.text.slice(this.textPoint, this.text.length);
                    this.textPoint++;
                }
            }

            this.onChange(this.text, e.key);
        }
    }
    unhighlightText(){
        this.highlightedRange = new IntegerRange();
            this.highlightedText = '';
            this.isHighlighting = false;
    }
    removeHighlightedText(){
        if(this.highlightedRange.range > 0){
            this.text = this.text.slice(0, this.highlightedRange.min) + this.text.slice(this.highlightedRange.max, this.text.length);
            this.textPoint = this.highlightedRange.min;
            if(this.textPoint < 0){
                this.textPoint = 0;
            }
            this.unhighlightText();
            return true;
        }
        return false;
    }
    getTextBoxStartPoint(){
        return new Point(this.box.pt.x+this.padding, this.box.pt.y+this.padding);
    }
    getFontString(){
        return this.size.toString()+'px '+this.font;
    }
    draw(cr:CanvasRenderingContext2D){
        cr.font = this.size.toString()+'px '+this.font;
        const measure = cr.measureText('A');
        const height = measure.fontBoundingBoxAscent + measure.fontBoundingBoxDescent;
        this.box.height = height+this.padding+this.padding;
        cr.fillStyle = this.backgroundColour;
        this.box.draw(cr);
        //const measure = cr.measureText(this.text);
        cr.fillStyle = this.textColour;
        const y = this.box.pt.y+this.size+this.padding;
        if(this.highlightedRange.range > 0){
            let x = this.box.pt.x+this.padding;
            const beforeHighlightText = this.text.slice(0, this.highlightedRange.min);
            if(beforeHighlightText.length > 0){
                const beforeMeasure = cr.measureText(beforeHighlightText);
                cr.fillText(this.text, x, y);
                x += beforeMeasure.width;
            }
            //const highlightedText = this.text.slice(this.highlightedRange.min, this.highlightedRange.max);
            const highlightMeasure = cr.measureText(this.highlightedText);
            //draw background highlight
            cr.fillStyle = this.highlightedBackgroundColour;
            cr.fillRect(x, this.box.pt.y, highlightMeasure.width, this.box.height);
            
            cr.fillStyle = this.highlightedTextColour;
            cr.fillText(this.highlightedText, x, y);
            x += highlightMeasure.width;

            const afterHighlightText = this.text.slice(this.highlightedRange.max);
            if(afterHighlightText.length > 0){
                cr.fillStyle = this.textColour;
                cr.fillText(afterHighlightText, x, y);
            }

        }else{
            //draw regular text
            cr.fillText(this.text, this.box.pt.x+this.padding, y);
        }
        //draw highlight outside of box
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
        //if(highlightedRange)
    }
}