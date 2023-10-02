import { Point } from "./shapes";


type Area2D = {
    width:number;
    height:number;
}

export class ViewArea{
    pos:Point;
    width:number; // of view area
    height:number;
    areaWidth: number; //of virtual area
    areaHeight: number; //
    minAreaWidth: number;
    minAreaHeight: number;
    constructor(w:number, h:number){
        this.pos = new Point(0, 0);
        this.width = w;
        this.height = h;
        this.areaWidth = w;
        this.areaHeight = h;
        this.minAreaWidth = 1;
        this.minAreaHeight = 1;
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
        if(centerAt0){
            const daw = (this.areaWidth)/4;
            const dah = (this.areaHeight)/4;
            this.pos.x -= daw;
            this.pos.y -= dah;
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
        cr.scale(this.width/this.areaWidth, this.height/this.areaHeight);
        cr.translate(-this.pos.x, -this.pos.y);
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
        return sp;
    }
    isInsideView(p:Point):boolean{
        return (p.x > this.pos.x && p.x < this.pos.x + this.areaWidth)
        && (p.y > this.pos.y && p.y < this.pos.y + this.areaHeight);
    }
    areaToCanvasCoord(ap:Point){

    }
    clearViewArea(cr:CanvasRenderingContext2D):void{
        this.setTransformation(cr);
        cr.clearRect(this.pos.x, this.pos.y, this.areaWidth, this.areaHeight);
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

}