import { TLRectangle, CenterPointRectangle, CanvasShape } from "./shapes";
import { Colour, Point, Vector2D, VirtCircle, VirtRect } from "../game/geometry";
import { CenterBoxText, DrawText } from "./text";

export class CanvasButton implements InteractableControl{
    button:TLRectangle;
    function:() => void;
    text: string;
    buttonText:CenterBoxText;
    size: number;
    active: boolean;
    buttonColour: string;
    hoverColour: string;
    textColour: string;
    hoverTextColour:string;
    fillColour: string; //current colour of the button - either hover or button colour
    fillTextColour:string; //current colour of the text - either hover or button colour

    constructor(pos:Point, width:number, height:number, text?:string, size?:number, 
        colour?:string, hoverColour?:string, textColour?:string){
        this.button = new TLRectangle(pos, width, height);
        this.function = () => {};
        this.active = false;
        this.text = text ? text : '';
        this.size = size ? size : 10;
        this.buttonColour = colour ? colour : 'blue';
        this.hoverColour = hoverColour ? hoverColour : '#2233BB';
        this.fillColour = this.buttonColour;

        this.textColour = textColour ? textColour : 'white';
        this.hoverTextColour = this.textColour;
        this.fillTextColour = this.textColour;
        this.buttonText = new CenterBoxText(this.text, pos, width, height, this.size, );
        //this.size = size ? size : 10;
        //const textPt = new Point(pos.x + (width/2) - )
        //this.drawText = new DrawText(text ? text : '', size);
    }
    setPoint(pt:Point){
        this.button.pt = pt;
        this.buttonText.box.pt = pt;
    }
    setText(text:string){
        this.buttonText.text = text;
        this.text = text;
    }
    setFunction(f:()=>void){
        this.function = f;
    }
    isInside(pt:Point):boolean{
        return this.button.isInside(pt);
    }
    mouseDown(pt:Point){
        this.active = this.button.isInside(pt);
    }
    mouseUp(pt:Point){
        if(this.active){
            this.function();
            this.active = false;
        }
    }
    mouseMove(pt:Point){
        if(this.button.isInside(pt)){
            this.fillColour = this.hoverColour;
            this.fillTextColour = this.hoverTextColour;
        }else{
            this.fillColour = this.buttonColour;
            this.fillTextColour = this.textColour;
        }
    }
    draw(cr:CanvasRenderingContext2D){
        cr.fillStyle = this.fillColour;
        this.button.draw(cr);
        cr.fillStyle = this.fillTextColour;
        this.buttonText.draw(cr);
    }
}

export class ButtonCollection{
    
}

export interface HoverControl{
    setPoint(pt:Point):void;
    isInside(pt:Point):boolean;
    mouseMove(pt:Point):void;
}

export interface InteractableControl{
    setPoint(pt:Point):void;
    isInside(pt:Point):boolean;
    mouseMove(pt:Point):void;
    mouseDown(pt:Point):void;
    mouseUp(pt:Point):void;
    keyDown?(e:KeyboardEvent):void;
    getRectSpace?():VirtRect;
    draw(cr:CanvasRenderingContext2D):void;
}

export class HoverShape implements InteractableControl{
    //position: Point;
    shape:CanvasShape;
    hoverInFunc:(pt:Point)=>void;
    hoverOutFunc:(pt:Point)=>void;
    hovering: boolean;
    constructor(shape:CanvasShape){
        //this.position = pt;
        this.shape = shape;
        this.hoverInFunc = ()=>{};
        this.hoverOutFunc = ()=>{}
        this.hovering = false;
    }
    setHoverInFunction(func:(pt:Point)=>void){
        this.hoverInFunc = func;
    }
    setHoverOutFunction(func:(pt:Point)=>void){
        this.hoverOutFunc = func;
    }
    setPoint(pt: Point): void {
        this.shape.setPoint(pt);
    }
    isInside(pt: Point): boolean {
        return this.shape.isInside(pt);
    }
    mouseMove(pt: Point): void {
        if(!this.hovering && this.shape.isInside(pt)){
            this.hovering = true;
            const shapePt = this.shape.getPoint();
            const relativePoint = new Point(pt.x - shapePt.x, pt.y - shapePt.y);
            this.hoverInFunc(relativePoint);
        }
        if(this.hovering && !this.shape.isInside(pt)){
            this.hovering = false;
            const shapePt = this.shape.getPoint();
            const relativePoint = new Point(pt.x - shapePt.x, pt.y - shapePt.y);
            this.hoverOutFunc(relativePoint);
        }
        //console.log(this.hovering);
    }
    mouseDown(pt: Point): void {
        //throw new Error("Method not implemented.");
    }
    mouseUp(pt: Point): void {
        //throw new Error("Method not implemented.");
    }
    draw(cr:CanvasRenderingContext2D):void{
        this.shape.draw(cr);
    }
}

export class DragShape extends HoverShape{
    //shape:CanvasShape;
    dragFunction:(diff:Vector2D, pt:Point)=>void;
    selected: boolean;
    lastPoint:Point;
    constructor(sh:CanvasShape){
        super(sh);
        this.dragFunction = () => {};
        this.selected = false;
        this.lastPoint = this.shape.getPoint();
    }
    movePoint(vec: Vector2D): void {
        this.shape.movePoint(vec);
    }
    isInside(pt: Point): boolean {
        return this.shape.isInside(pt);
    }
    mouseMove(pt: Point): void {
        super.mouseMove(pt);
        if(this.selected){
            const diff = pt.diffVector(this.lastPoint);
            this.movePoint(diff);
            this.dragFunction(diff, pt);
        }
        this.lastPoint = pt;
    }
    mouseDown(pt: Point): void {
        this.selected = this.isInside(pt);
    }
    mouseUp(pt: Point): void {
        this.selected = false;
    }
}

export class ButtonShape extends HoverShape{
    buttonFunction:(pt:Point)=>void;
    outsideClickFunction:()=>void;
    constructor(sh:CanvasShape){
        super(sh);
        this.buttonFunction = ()=>{
        };
        this.outsideClickFunction = ()=>{
        };
    }
    mouseDown(pt: Point): void {
        if(this.hovering){
            const shapePt = this.shape.getPoint();
            const relativePoint = new Point(pt.x - shapePt.x, pt.y - shapePt.y);
            this.buttonFunction(relativePoint);
        }else{
            this.outsideClickFunction();
        }
    }
    mouseUp(pt: Point): void {
        //
    }
}

export class DragObject implements InteractableControl{
    position:Point;
    dragFunction:(diff:Vector2D, pt:Point)=>void;
    objects: InteractableControl[];
    hovered: boolean;
    selected:boolean;
    lastMousePoint: Point;
    constructor(pos:Point){
        this.position = pos;
        this.objects = [];
        this.hovered = false;
        this.selected = false;
        this.lastMousePoint = new Point();
        this.dragFunction = () => {};
    }
    setPoint(pt:Point){
        this.objects.forEach((obj) => obj.setPoint(pt));
    }
    movePoint(diff:Vector2D){

    }
    addObject(ic:InteractableControl){
        this.objects.push(ic);
    }
    isInside(pt: Point): boolean {
        //let isIn = false;
        for(let i=0; i<this.objects.length; ++i){
            if(this.objects[i].isInside(pt)){
                return true;
            }
        }
        return false;
    }
    mouseDown(pt:Point):void{
        this.selected = this.isInside(pt);
    }
    mouseMove(pt:Point):void{
        this.hovered = this.isInside(pt);
        if(this.selected){
            const diff = pt.diffVector(this.lastMousePoint);
            //console.log(diff)
            this.setPoint(pt);
            this.dragFunction(diff, pt);
        }
        this.lastMousePoint = pt;
    }
    mouseUp(pt:Point):void{
        this.selected = false;
    }
    draw(cr:CanvasRenderingContext2D){
        this.objects.forEach((object)=>object.draw(cr));
    }
}

export class CanvasSlider implements InteractableControl{
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
    setPoint(pt:Point):void{
        this.position = pt;
        this.slider.pt = pt;
    }
    isInside(pt:Point):boolean{
        return this.slider.isInside(pt);
    }
    mouseDown(pt:Point){
        this.active = this.slider.isInside(pt);
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

export class ColourPicker implements InteractableControl{
    selectColour: Colour;
    //colour:string;
    open:boolean;
    colourButtonRect: TLRectangle;
    colourButton: ButtonShape;
    colourButtonOutlineColour: string;

    colourSpaceRect: TLRectangle;
    colourSpace: ButtonShape;
    colourSpaceIndicator: VirtCircle;
    colourSpacePosition: Point;
    spaceWidth:number;
    spaceHeight:number;

    hueStrip: CanvasHueStrip;


    basePosition: Point;
    onChooseColour: (c:Colour)=>void;

    colourMouseDown: boolean;
    constructor(pt:Point, buttonWidth:number=20, buttonHeight:number=20, 
        width:number=200, pickerHeight:number=100, hueHeight:number=30){
        this.selectColour = new Colour(255,0,0);
        this.basePosition = pt;
        this.open = false;
        //this.colour = '#FF0000';
        this.colourButtonRect = new TLRectangle(pt, buttonWidth, buttonHeight);
        this.colourButton = new ButtonShape(this.colourButtonRect);
        this.colourButton.buttonFunction = () => {
            this.open = !this.open;
        };
        this.colourButton.outsideClickFunction = () => {
            //this.open = false;
        };
        this.colourButtonOutlineColour = 'grey';
        this.spaceWidth = width;
        this.spaceHeight = pickerHeight;
        this.colourSpaceRect = new TLRectangle(new Point(pt.x, pt.y-this.spaceHeight), this.spaceWidth, this.spaceHeight);
        this.colourSpace = new ButtonShape(this.colourSpaceRect);
        this.colourSpace.buttonFunction = (pt:Point) => {
            this.colourSpacePoint(pt);
        }
        this.colourSpace.outsideClickFunction = () => {

        }
        this.colourSpaceIndicator = new VirtCircle(this.colourSpaceRect.pt.x, this.colourSpaceRect.pt.y, 4);
        this.colourSpacePosition = new Point(0, 0);
        this.onChooseColour = () => {};

        this.hueStrip = new CanvasHueStrip(new Point(pt.x, pt.y-(this.spaceHeight+hueHeight)), this.spaceWidth, hueHeight);
        this.hueStrip.onSelectHue = (col:Colour) => {
            const x = this.colourSpacePosition.x/this.spaceWidth;
            const y = this.colourSpacePosition.y/this.spaceHeight;
            const ratX = Colour.ratio(x);
            const ratY = Colour.ratio(y);
            const colour = this.calculateColour(col, ratX, ratY);
            this.onSelectColour(colour);
        }
        this.colourMouseDown = false;
    }
    onSelectColour(colour:Colour){
        this.onChooseColour(colour);
        this.selectColour = colour;
        if(colour.intensity() > Colour.maxValue/2){
            this.colourButtonOutlineColour = 'black';
        }else{
            this.colourButtonOutlineColour = 'white';
        }
    }
    colourSpacePoint(pt:Point){
        const x = pt.x/this.spaceWidth;
        const y = pt.y/this.spaceHeight;
        const ratX = Colour.ratio(x);
        const ratY = Colour.ratio(y);
        const colour = this.calculateColour(this.hueStrip.colour.copy(), ratX, ratY);
        this.onSelectColour(colour);

        const newCSIPos = this.colourSpaceRect.pt.copy();
        newCSIPos.add(pt);
        this.colourSpacePosition = pt;
        this.colourSpaceIndicator.pos = newCSIPos;
    }
    calculateColour(col:Colour, ratX:number, ratY:number):Colour{
        let colour = col;
        if(ratX !== 0 && ratY !== 0){
            colour = colour.newBlend(new Colour(255, 255, 255, ratX));
            colour.blend(new Colour(0, 0, 0, ratY));
        }
        return colour;
    }
    setColour(colour:Colour){
        const hue = this.hueStrip.setHue(colour);
        const x = this.colourSpacePosition.x/this.spaceWidth;
        const y = this.colourSpacePosition.y/this.spaceHeight;
        const ratX = Colour.ratio(x);
        const ratY = Colour.ratio(y);
        const col = this.calculateColour(this.hueStrip.colour, ratX, ratY);
        this.onSelectColour(col);
    }
    setPoint(pt: Point): void {
        this.basePosition = pt;
        this.colourButton.setPoint(pt);
        this.hueStrip.setPoint(new Point(pt.x, pt.y+this.colourButtonRect.height));
        this.colourSpace.setPoint(new Point(pt.x, pt.y+this.hueStrip.getHeight()+this.colourButtonRect.height));
        this.colourSpaceIndicator.pos = new Point(pt.x, pt.y+this.hueStrip.getHeight()+this.colourButtonRect.height);
    }
    isInside(pt: Point): boolean {
        if(this.open){
            return this.colourButtonRect.isInside(pt) || 
            this.hueStrip.isInside(pt) || this.colourSpaceRect.isInside(pt);
        }
        return this.colourButtonRect.isInside(pt);
    }
    getRelativePoint(pt:Point):Point{
        const newPt = pt.copy();
        newPt.sub(this.colourSpaceRect.getPoint());
        return newPt;
    }
    mouseMove(pt: Point): void {
        if(this.colourMouseDown && this.colourSpace.isInside(pt)){
            const rel = this.getRelativePoint(pt);
            this.colourSpacePoint(rel);
        }
        this.colourButton.mouseMove(pt);
        if(this.open){
            this.colourSpace.mouseMove(pt);
            this.hueStrip.mouseMove(pt);
        }
    }
    mouseDown(pt: Point): void {
        if(this.open){
            const inSpace = this.colourSpaceRect.isInside(pt);
            if(inSpace){
                this.colourMouseDown = true;
            }
            if(!inSpace && !this.hueStrip.isInside(pt)){
                this.open = false;
            }
            this.colourSpace.mouseDown(pt);
            this.hueStrip.mouseDown(pt);
        }else{
            this.colourButton.mouseDown(pt);
        }
    }
    mouseUp(pt: Point): void {
        this.colourMouseDown = false;
        this.colourButton.mouseUp(pt);
        if(this.open){
            this.colourSpace.mouseUp(pt);
            this.hueStrip.mouseUp(pt);
        }
    }
    draw(cr:CanvasRenderingContext2D):void{
        const colour = this.selectColour.toString();
        cr.fillStyle = colour;
        //console.log(this.selectColour.toString());
        this.colourButton.draw(cr);
        if(this.open){
            const pt = this.colourSpace.shape.getPoint();
            cr.fillStyle = this.hueStrip.colour.toString();
            this.colourSpace.draw(cr);
            const gradient2 = cr.createLinearGradient(pt.x, pt.y, pt.x+this.spaceWidth, pt.y);
            gradient2.addColorStop(0, '#FFFFFF00');
            gradient2.addColorStop(1, '#FFFFFFFF');
            cr.fillStyle = gradient2;
            this.colourSpace.draw(cr);
            const gradient = cr.createLinearGradient(pt.x, pt.y, pt.x, pt.y+this.spaceHeight);
            //const gradient = cr.createLinearGradient(pt.x, pt.y, pt.x+this.spaceWidth, pt.y);
            gradient.addColorStop(0, '#00000000');
            gradient.addColorStop(1, '#000000FF');
            cr.fillStyle = gradient;
            this.colourSpace.draw(cr);

            //const hueGradient = Colour.hueGradient();
            //if(this.hueGradient){
                //cr.fillStyle = this.hueGradient;
                //this.hueSpace.draw(cr);
            //}
            this.hueStrip.draw(cr);

            cr.fillStyle = colour;
            this.colourSpaceIndicator.fill(cr);
            cr.strokeStyle = this.colourButtonOutlineColour;
            this.colourSpaceIndicator.draw(cr);
        }
        cr.lineWidth = 2;
        cr.strokeStyle = this.colourButtonOutlineColour;
        this.colourButtonRect.outline(cr);
    }
}


export class CanvasHueStrip implements InteractableControl{
    rect: TLRectangle;
    hueStrip: ButtonShape;
    hueGradient: CanvasGradient | null;
    colour: Colour;
    indicator: TLRectangle;
    indicatorValue: number; // ratio of hue
    showIndicator:boolean;
    onSelectHue:(c:Colour)=>void;

    indicatorWidth: number;
    indicatorExtraHeight: number;
    hueMouseDown: boolean
    constructor(pt:Point, width:number, height:number){
        this.indicatorWidth = 2;
        this.indicatorExtraHeight = 1;
        this.rect = new TLRectangle(pt, width, height);
        this.hueStrip = new ButtonShape(this.rect);
        this.hueGradient = Colour.hueGradient(pt.x, pt.x+width, pt.y, pt.y);
        this.hueStrip.buttonFunction = (pt) => {
            this.selectHue(pt);
        }
        this.colour = new Colour(255, 0, 0);
        this.onSelectHue = () => {};
        this.indicator = new TLRectangle(new Point(pt.x-this.indicatorWidth, pt.y-this.indicatorExtraHeight), 
        this.indicatorWidth*2, height+this.indicatorExtraHeight*2);
        this.indicatorValue = 0;
        this.showIndicator = true;

        this.hueMouseDown = false;
    }
    setHue(colour:Colour):number{
        const hue = colour.getHue();
        const hueRatio = hue/Colour.maxHue;
        const xVal = hueRatio*this.rect.width;
        this.indicator.pt.x = this.rect.pt.x + xVal - 2; // -indicatorWidth
        this.indicatorValue = hueRatio;
        this.colour = Colour.fromHue(hue);
        return hue;
    }
    getHeight():number{
        return this.rect.height;
    }
    setPoint(pt: Point): void {
        this.rect.pt = pt;
        this.indicator.pt = new Point(pt.x + (this.indicatorValue*this.rect.width) - 2, pt.y);
        this.hueStrip.setPoint(pt);
        this.hueGradient = Colour.hueGradient(pt.x, pt.x+this.rect.width, pt.y, pt.y);
    }
    getRelativePoint(pt:Point):Point{
        const newPt = pt.copy();
        newPt.sub(this.rect.getPoint());
        return newPt;
    }
    selectHue(pt: Point){
        let hue; let x;
        if(pt.x > this.rect.width){
            hue = Colour.maxHue;
            x = this.rect.width;
        }else if(pt.x < 0){
            hue = 0;
            x = 0;
        }else{
            hue = (pt.x/this.rect.width)*Colour.maxHue;
            x = pt.x;
        }
        const col = Colour.fromHue(hue);
        this.indicator.pt = new Point(this.rect.pt.x+x-this.indicatorWidth, this.rect.pt.y-this.indicatorExtraHeight);
        this.colour = col;
        this.onSelectHue(col);
    }
    isInside(pt: Point): boolean {
        return this.rect.isInside(pt);
    }
    mouseMove(pt: Point): void {
        if(this.hueMouseDown){
            const rel = this.getRelativePoint(pt);
            this.selectHue(rel);
        }
        this.hueStrip.mouseMove(pt);
    }
    mouseDown(pt: Point): void {
        if(this.isInside(pt)){
            this.hueMouseDown = true;
        }
        this.hueStrip.mouseDown(pt);
    }
    mouseUp(pt: Point): void {
        this.hueMouseDown = false;
        this.hueStrip.mouseUp(pt);
    }
    getRectSpace?(): VirtRect {
        throw new Error("Method not implemented.");
    }
    draw(cr:CanvasRenderingContext2D):void{
        if(this.hueGradient){
            cr.fillStyle = this.hueGradient;
            this.hueStrip.draw(cr);
        }
        if(this.showIndicator){
            cr.strokeStyle = 'black';
            this.indicator.outline(cr);
        }
    }
}

export class SimpleBelt implements InteractableControl{
    position: Point
    beltBackgroundColour: string;
    rect: TLRectangle;
    beltButton: ButtonShape;
    slotWidth: number;
    slotHeight: number;
    nslots: number;
    slotRects: ButtonShape[];
    beltItems: any[];
    padding: number;
    selectItem: (itemNo:number) => void;
    isNumbered: boolean;
    constructor(pt:Point, slotWidth:number, slotHeight:number, slots:number=3, padding:number=2){
        this.position = pt;
        this.beltBackgroundColour = 'black';
        this.rect = new TLRectangle(pt, slotWidth*slots+padding*(slots+1), slotHeight+padding+padding);
        this.beltButton = new ButtonShape(this.rect);
        this.beltButton.buttonFunction = (relPt) => {
            if(relPt.y > padding && relPt.y < slotHeight+padding){
                const x = Math.floor(relPt.x / (slotWidth + padding));
                const xOffset = relPt.x % (slotWidth + padding);
                if(xOffset > padding && x < slots){
                    //console.log(x);
                    this.selectItem(x);
                }
            }
        }
        this.slotWidth = slotWidth;
        this.slotHeight = slotHeight;
        this.padding = padding;
        this.nslots = slots;
        this.slotRects = [];
        this.beltItems = [];
        const slotPoint = new Point(pt.x+padding, pt.y+padding);
        for(let i = 0; i < slots; i++){
            const slotRect = new TLRectangle(slotPoint.copy(), slotWidth, slotHeight);
            slotPoint.add(new Point(slotWidth+padding, 0));
            this.slotRects.push(new ButtonShape(slotRect));
            this.beltItems.push(null);
        }
        this.selectItem = () => {};
        this.isNumbered = true;
    }
    setNumSlots(n:number){
        this.slotRects = [];
        const slotPoint = new Point(this.position.x+this.padding, this.position.y+this.padding);
        for(let i = 0; i < this.nslots; i++){
            const slotRect = new TLRectangle(slotPoint.copy(), this.slotWidth, this.slotHeight);
            slotPoint.add(new Point(this.slotWidth+this.padding, 0));
            this.slotRects.push(new ButtonShape(slotRect));
            if(i >= this.beltItems.length) this.beltItems.push(null);
        }
    }
    setPoint(pt: Point): void {
        this.position = pt;
        this.rect.pt = pt;
        this.initSlots(this.beltItems);
    }
    initSlots(items:any[]):void{
        this.slotRects = [];
        this.beltItems = items ? items : Array.from({length: this.nslots}, () => null);
        const slotPoint = new Point(this.position.x+this.padding, this.position.y+this.padding);
        for(let i = 0; i < this.nslots; i++){
            const slotRect = new TLRectangle(slotPoint.copy(), this.slotWidth, this.slotHeight);
            slotPoint.add(new Point(this.slotWidth+this.padding, 0));
            this.slotRects.push(new ButtonShape(slotRect));
        }
    }
    isInside(pt: Point): boolean {
        return this.rect.isInside(pt);
    }
    mouseMove(pt: Point): void {
        if(this.rect.isInside(pt)){
            this.beltBackgroundColour = 'red';
        }else{
            this.beltBackgroundColour = 'black';
        }
        this.beltButton.mouseMove(pt);
    }
    mouseDown(pt: Point): void {
        this.beltButton.mouseDown(pt);
    }
    mouseUp(pt: Point): void {
        this.beltButton.mouseUp(pt);
    }
    getRectSpace?(): VirtRect {
        throw new Error("Method not implemented.");
    }
    draw(cr:CanvasRenderingContext2D):void{
        cr.fillStyle = this.beltBackgroundColour;
        this.rect.draw(cr);
        cr.fillStyle = 'grey';
        this.slotRects.forEach((slot, i) => {
            slot.draw(cr);
            if(this.beltItems[i] !== null && this.beltItems[i].draw){
                this.beltItems[i].draw(cr);
            }
        });

        //draw numbers
        if(this.isNumbered){
            this.slotRects.forEach((slot, i) => {
                const pt = slot.shape.getPoint();
                cr.fillStyle = 'white';
                cr.fillText((i+1).toString(), pt.x, pt.y);
            });
        }
    }
}