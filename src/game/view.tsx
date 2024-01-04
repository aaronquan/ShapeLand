import { Point, VirtRect } from "./geometry";


type Area2D = {
    width:number;
    height:number;
}

export enum RectangleRegion {
    Inside, Left, TopLeft, Top, TopRight, Right, BottomRight, Bottom, BottomLeft
}

export function rectangleRegionToString(r:RectangleRegion){
    switch(r){
        case RectangleRegion.Inside:
            return 'Inside';
        case RectangleRegion.Left:
            return 'Left';
        case RectangleRegion.TopLeft:
            return 'Top Left';
        case RectangleRegion.Top:
            return 'Top';
        case RectangleRegion.TopRight:
            return 'Top Right';
        case RectangleRegion.Right:
            return 'Right';
        case RectangleRegion.BottomRight:
            return 'Bottom Right';
        case RectangleRegion.Bottom:
            return 'Bottom';
        case RectangleRegion.BottomLeft:
            return 'Bottom Left';
        default:
            return 'Not a region';
    }
}

export class WrappingView{
    width:number;
    height:number;
    constructor(w:number, h:number){
        this.width = w;
        this.height = h;
    }
    wrapPoint(pt:Point){
        let x = pt.x % this.width; let y = pt.y % this.height;
        if(x < 0) x += this.width;
        if(y < 0) y += this.height;
        return new Point(x, y);
    }
    wrappingPoints(pt:Point):Point[]{
        return [
            pt, 
            new Point(pt.x, pt.y-this.height), 
            new Point(pt.x, pt.y+this.height),
            new Point(pt.x-this.width, pt.y),
            new Point(pt.x+this.width, pt.y),
            new Point(pt.x-this.width, pt.y-this.height), 
            new Point(pt.x+this.width, pt.y-this.height), 
            new Point(pt.x-this.width, pt.y+this.height), 
            new Point(pt.x+this.width, pt.y+this.height), 
        ];
    }
    pointRegion(pt:Point):RectangleRegion{
        if(pt.x < 0){
            if(pt.y < 0){
                return RectangleRegion.TopLeft;
            }else if(pt.y <= this.height){
                return RectangleRegion.Left;
            }else{
                return RectangleRegion.BottomLeft;
            }
        }else if(pt.x > this.width){
            if(pt.y < 0){
                return RectangleRegion.TopRight;
            }else if(pt.y <= this.height){
                return RectangleRegion.Right;
            }else{
                return RectangleRegion.BottomRight;
            }
        }
        if(pt.y < 0){
            return RectangleRegion.Top;
        }else if(pt.y > this.height){
            return RectangleRegion.Bottom;
        }
        return RectangleRegion.Inside;
    }
}

export class ViewArea{
    pos:Point;
    width:number; // of view area
    height:number;
    areaWidth: number; //of virtual area
    areaHeight: number; //
    minAreaWidth: number;
    minAreaHeight: number;
    invY: boolean;
    constructor(w:number, h:number, invY:boolean=false){
        this.pos = new Point(0, 0);
        this.width = w;
        this.height = h;
        this.areaWidth = w;
        this.areaHeight = h;
        this.minAreaWidth = 1;
        this.minAreaHeight = 1;
        this.invY = invY;
    }
    getViewRect():VirtRect{
        return new VirtRect(this.pos.x, this.pos.y, this.areaWidth, this.areaHeight);
    }
    translate(t:Point){
        //t.y *= this.height/this.width;
        this.pos.add(t);
    }
    setView(vw:number, vh:number){
        this.width = vw; this.height = vh;
    }
    areaLevels(nlevels:number=5, scale:number=1.1, prelevels:number=0){
        const levels:Area2D[] = [];
        
        let aw = this.areaWidth/scale; let ah = this.areaHeight/scale;
        for(let i=0; i<prelevels; ++i){
            levels.unshift({width: aw, height: ah});
            aw /= scale; ah /= scale;
        }

        aw = this.areaWidth; ah = this.areaHeight;
        levels.push({width: aw, height: ah});
        for(let i=0; i<nlevels; ++i){
            aw *= scale; ah *= scale;
            levels.push({width: aw, height: ah});
        }
        return levels;
    }
    addArea(n:number){
        if(this.areaWidth + n >= this.minAreaWidth && 
            this.areaHeight + n >= this.minAreaHeight){
            this.areaWidth += n;
            this.areaHeight += n;
        }
    }
    initArea(w:number, centerAt0:boolean=false){
        this.areaWidth = w;
        this.areaHeight = w*(this.height/this.width);
        //console.log(this.areaHeight);
        if(centerAt0){
            const daw = (this.areaWidth)/2;
            const dah = (this.areaHeight)/2;
            this.pos.x = -daw;
            this.pos.y = -dah;
        }
    }
    setArea(w:number, h:number, center:boolean=true){
        if(center){
            const daw = (w - this.areaWidth)/2;
            const dah = (h - this.areaHeight)/2;
            this.pos.x -= daw;
            this.pos.y -= dah;
        }
        this.areaWidth = w;
        this.areaHeight = h;
    }
    setTransformation(cr:CanvasRenderingContext2D){
        cr.setTransform(1, 0, 0, 1, 0, 0);
        const scaleY = this.invY ? -this.height/this.areaHeight : this.height/this.areaHeight;
        cr.scale(this.width/this.areaWidth, scaleY);
        const tranY = this.invY ? this.pos.y : -this.pos.y;
        cr.translate(-this.pos.x, tranY);
    }
    scalePoint(p:Point){
        return p.multiplyPoint(this.areaWidth/this.width, this.areaHeight/this.height);
    }
    centerOn(p:Point){
        this.pos.x = p.x - (this.areaWidth)/2;
        this.pos.y = p.y - (this.areaHeight)/2;
    }
    canvasToAreaCoord(cp:Point){
        const sp = new Point((cp.x/this.width) * this.areaWidth, 
        (cp.y/this.height) * this.areaHeight);
        sp.add(this.pos);
        if(this.invY) sp.y = -sp.y;
        return sp;
    }
    isInsideView(p:Point):boolean{
        return (p.x > this.pos.x && p.x < this.pos.x + this.areaWidth)
        && (p.y > this.pos.y && p.y < this.pos.y + this.areaHeight);
    }
    areaToCanvasCoord(ap:Point){
        if(this.isInsideView(ap)){
            const newAp = ap.copy();
            const newPos = this.pos;
            if(this.invY) newPos.y = -newPos.y;
            newAp.sub(newPos);
            //console.log(newAp);
            const x = (this.width/this.areaWidth)*newAp.x;
            const y = (this.height/this.areaHeight)*newAp.y;
            //sp.add(this.pos);
            return new Point(x,y);
        }else{
            return null;
        }
    }
    clearViewArea(cr:CanvasRenderingContext2D):void{
        this.setTransformation(cr);
        cr.clearRect(this.pos.x, this.pos.y, this.areaWidth, this.areaHeight);
    }
    fillView(cr:CanvasRenderingContext2D):void{
        cr.fillRect(this.pos.x, this.pos.y, this.areaWidth, this.areaHeight);
    }
    drawGrid(cr:CanvasRenderingContext2D, gridSpacing:number=1):void{
        cr.setTransform(1, 0, 0, 1, 0, 0);
        cr.strokeStyle = 'white';
        cr.lineWidth = 0.5;
        const xScale = this.width/this.areaWidth;
        const firstX = ((-this.pos.x % gridSpacing) - gridSpacing)*xScale;
        for(let i = firstX; i <= this.width; i+=gridSpacing*xScale){
            cr.beginPath();
            cr.moveTo(i, 0);
            cr.lineTo(i, this.height);
            cr.stroke();
        }
        const yScale = this.height/this.areaHeight;
        const firstY = ((-this.pos.y % gridSpacing) - gridSpacing)*yScale;
        for(let y = firstY; y <=this.height; y += gridSpacing*yScale){
            cr.beginPath();
            cr.moveTo(0, y);
            cr.lineTo(this.width, y);
            cr.stroke();
        }
    }
    drawAxis(cr:CanvasRenderingContext2D, width:number=1.5, colour:string='white'):void{
        cr.strokeStyle = colour;
        cr.lineWidth = width;
        if(0 > this.pos.x && 0 < this.pos.x + this.areaWidth){
            //draw vertical axis
            const x = (-this.pos.x/this.areaWidth)*this.width;
            cr.beginPath();
            cr.moveTo(x, 0);
            cr.lineTo(x, this.height);
            cr.stroke();
        }
        if(0 > this.pos.y && 0 < this.pos.y + this.areaHeight){
            const y = (-this.pos.y/this.areaHeight)*this.height;
            cr.beginPath();
            cr.moveTo(0, y);
            cr.lineTo(this.width, y);
            cr.stroke();
        }
    }
    drawNumbers(cr:CanvasRenderingContext2D):void{

    }
}

export class WrappingViewArea extends ViewArea{
    constructor(w:number, h:number, invY:boolean=false){
        super(w, h, invY);
    }
}