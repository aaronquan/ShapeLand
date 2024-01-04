import { IsoscelesTrapezium } from "../../canvas/shapes";
import { Point, Rotation, Vector2D, VirtCircle, VirtPolygon, VirtShape } from "../../game/geometry";
import { SnakeSendPlayerData, SnakeUpdateData } from "./Updater";

type SnakeMove = {
    rotation:number;
    position:Point;
    distanceFromLast: number;
    time:number;
    
}

export class AutoSnake{
    position: Point;
    rotation: Rotation;
    size: number;
    moveSpeed: number;
    rotateSpeed: number;

    maxBodyLength: number;
    currentBodyLength: number;

    moveHistory: SnakeMove[];

    segmentDistance: number;
    //moveRemainder: number; // amount to move before recording next update
    //moveHistoryV2: SnakeMove[]; 

    bodyType: number;
    bodyColour:string;

    headColour:string;

    headHitbox: VirtCircle;

    tailPolygon: VirtPolygon[];
    constructor(){
        this.position = new Point();
        this.rotation = new Rotation(0);
        this.size = 5;
        this.moveSpeed = 150;
        this.rotateSpeed = 0.04;
        this.maxBodyLength = 20;
        this.currentBodyLength = 0;
        this.moveHistory = [];

        this.segmentDistance = 40; // distance for segment
        //this.moveRemainder = 0;
        //this.moveHistoryV2 = [];

        this.bodyType = 1; // 0 - rect, 1 - trap, 2- revtrap, 3 - smooth
        this.bodyColour = 'red';
        this.headColour = 'green';

        this.headHitbox = new VirtCircle(this.position.x, this.position.y, this.size);
        this.tailPolygon = [];
    }
    changeBodyType(incSmooth:boolean=false){
        if(!incSmooth){
            if(this.bodyType === 2){
                this.bodyType = 0;
            }else{
                this.bodyType += 1;
            }
        }else{
            if(this.bodyType === 3){
                this.bodyType = 0;
            }else{
                this.bodyType += 1;
            }
        }
    }
    setRandomPosition(x:number, y:number, width: number, height:number){
        const randomPoint = Point.randomRange(x, width, y, height);
        this.position = randomPoint;
    }
    addSize(si:number){
        this.size += si;
        this.headHitbox.diameter += si;
        this.moveSpeed = 6*this.size+120;
        //this.
    }
    setSize(si:number){
        this.size = si;
        this.headHitbox.diameter = si;
        //this.moveSpeed = 6*this.size+120;
    }
    addMaxBody(si:number){
        this.maxBodyLength += si;
        this.trimBody();
        //if(si < 0){
            //this.moveHistory = this.moveHistory.slice(0, this.moveHistory.length+si);
        //}
    }
    trimBody(){
        while(this.moveHistory.length > 1 && this.currentBodyLength > this.maxBodyLength){
            const last = this.moveHistory.pop();
            //console.log(last);
            //console.log(this.currentBodyLength);
            /*
            if(last){
                if(this.currentBodyLength - last.distanceFromLast < this.maxBodyLength){
                    const makeUpDistance = this.maxBodyLength - (this.currentBodyLength - last.distanceFromLast);
                    const lastMove = this.moveHistory.slice(-1)[0];
                    const lastVec = last.position.diffVector(lastMove.position);
                    lastVec.norm(); lastVec.multi(makeUpDistance);
                    const position = lastMove.position.copy();
                    position.addVector(lastVec);
                    this.moveHistory.push({
                        rotation: last.rotation,
                        position: position,
                        distanceFromLast: makeUpDistance,
                        time: 0
                    });
                    this.currentBodyLength = this.maxBodyLength
                }else{
                    this.currentBodyLength -= last.distanceFromLast;
                    //console.log('loop again');
                }
            }*/
            if(last){
                this.currentBodyLength -= this.moveSpeed;
            }
        }
    }
    setPosition(pt:Point){
        this.position = pt;
        this.headHitbox.pos = pt;
    }
    update(secs:number){
        const moveVec = this.rotation.toVector();
        moveVec.multi(secs*this.moveSpeed);
        this.position.addVector(moveVec);
        this.headHitbox.pos = this.position;
        if(this.moveSpeed > 0){
            const distance = this.moveHistory.length > 1 
            ? this.moveHistory[0].position.diffVector(this.position).mag() : 0;
            this.moveHistory.unshift({
                rotation: this.rotation.rot, 
                position: this.position.copy(), 
                distanceFromLast: distance,
                time: secs});
            this.currentBodyLength += this.moveSpeed;
            //console.log(this.moveHistory);
            //console.log(this.currentBodyLength);
            this.trimBody();
            this.tailPolygon = this.generateTailPolygon();
        }
        //console.log(this.currentBodyLength);
        //const distance = moveVec.mag();
        /*
        this.moveHistoryV2.unshift({
            rotation: this.rotation.rot,
            position: this.position.copy(),
            time: secs
        });
        */
        /*
        const remaining = distance+this.moveRemainder;
        const nMoves = Math.floor((remaining)/this.segmentDistance);
        this.moveRemainder %= this.segmentDistance;
        const moveHistoryVec = moveVec.copy();
        moveHistoryVec.norm(); moveHistoryVec.multi(distance)
        for(let i = nMoves-1; i > 0; --i){
            const moveVec = moveHistoryVec.copy();
            moveVec.multi(i);
            const savePosition = this.position.copy();
            this.moveHistoryV2.push({position: this.position.copy(), rotation: this.rotation.rot});
            
        }   */

        //remove history
        //if(this.moveHistory.length > this.maxBodyLength){
            //this.moveHistory.pop();
        //}
    }
    hitCircle(circ:VirtCircle){
        return this.headHitbox.hitCircle(circ);
    }
    adjustRotation(mouse:Point){
        const playerMouseVector:Vector2D = mouse.diffVector(this.position);
        const rot = playerMouseVector.toRotation();
        const diffDir = this.rotation.diffDirection(rot);
        const rotVal = diffDir.difference < this.rotateSpeed ? diffDir.difference : this.rotateSpeed;
        if(diffDir.clockwise){
            this.rotation.add(rotVal);
        }else{
            this.rotation.sub(rotVal);
        }
    }
    bodyWidths(x:number){
        if(x < 0.1){
            return Math.min((Math.pow((-x*6)+3, 2)/13)*this.size, this.size);
        }
        else if(x < 0.5){
            return (Math.log(10+x*400)*4.5/30)*this.size;
        }else if(x < 0.8){
            return (Math.log(300-(x*300))*4/30)*this.size;
        }else{
            const y1 = (Math.log(300-(0.8*300))*3/30)*this.size;
            return Math.min(Math.max(-y1*10*(x-1), 1), this.size);
        }
    }
    getSegSize(){
        if(this.maxBodyLength < 20){
            return 1;
        }else if(this.maxBodyLength < 40){
            return 2;
        }else if(this.maxBodyLength < 60){
            return 3;
        }else if(this.maxBodyLength < 100){
            return 4;
        }else if(this.maxBodyLength < 150){
            return 5;
        }
        return 6;
    }
    //for sending to server
    getUpdateData():SnakeUpdateData{
        const bodyData = this.moveHistory.map((history) => {
            const position = history.position.arr();
            return {position: position, rotation: history.rotation}
        });

        return {
            position: this.position.arr(),
            rotation: this.rotation.rot,
            bodyHistory: bodyData
        }
    }
    drawOldTail(cr: CanvasRenderingContext2D){
        const transformation = cr.getTransform();
        const segSize = 4;
        let bodyWidth = this.size*0.1;
        for(let i = 0; i<this.moveHistory.length; i=i+segSize){
            const move = this.moveHistory[i];
            cr.fillStyle = 'blue';
            cr.setTransform(transformation);
            cr.translate(move.position.x, move.position.y);
            cr.rotate(move.rotation);
            //cr.fillRect(-this.moveSpeed*segSize, -bodyWidth/2, this.moveSpeed*segSize, bodyWidth); //long tails
            cr.fillRect((-this.moveSpeed*segSize)*move.time, -bodyWidth/2, (-this.moveSpeed*segSize)*move.time, bodyWidth);
            cr.setTransform(transformation);
            bodyWidth *= 1.2;
        }
        bodyWidth = this.size*0.08;
        for(let i = segSize/2; i<this.moveHistory.length; i=i+segSize){
            const move = this.moveHistory[i];
            cr.fillStyle = 'blue';
            cr.setTransform(transformation);
            cr.translate(move.position.x, move.position.y);
            cr.rotate(move.rotation);
            cr.fillRect((-this.moveSpeed*segSize)*move.time, -bodyWidth/2, (-this.moveSpeed*segSize)*move.time, bodyWidth);
            cr.setTransform(transformation);
            bodyWidth *= 1.2;
        }
    }
    //using movehistory
    //segment has 
    getTailSegments(){
        const segments: SnakeMove[] = [];
        let currentDistance = 0;
        if(this.moveHistory.length >= 2){
            const lastPosition = this.moveHistory[0].position;
            for(let i = 1; i < this.moveHistory.length; ++i){
                const vec = this.moveHistory[1].position.diffVector(lastPosition);
                vec.norm(); vec.multi(this.segmentDistance);
                //let moveDistance = this.moveHistory[1].distanceFromLast;
                currentDistance += this.moveHistory[1].distanceFromLast
                while(currentDistance > this.segmentDistance){
                    segments.push()
                    currentDistance -= this.segmentDistance;
                } 
            }
        }
        return segments;
    }
    pointCollision(pt:Point):boolean{
        for(const poly of this.tailPolygon){
            if(poly.hitPoint(pt)){
                return true;
            }
        }
        return false;
    }
    //using segments
    //drawTailV2(cr: CanvasRenderingContext2D): void{
        //const segments = this.getTailSegments
    //}
    generateTailPolygon():VirtPolygon[]{
        const segSize = this.getSegSize();
        let x = 0;
        const ratInc = segSize/this.moveHistory.length;
        let frontMoves:Point[] = [this.position];
        let backMoves:Point[] = [];
        const moves:Point[][] = [];
        let lastMove = {rotation: this.rotation.rot, position: this.position};
        let i = 0
        const maxMovement = this.moveSpeed*segSize;
        //console.log(maxMovement);
        for(let i = 0; i<this.moveHistory.length; i=i+segSize){
            const move = this.moveHistory[i];
            const movementVec = move.position.diffVector(lastMove.position);
            if(movementVec.distFast() > maxMovement){
                
                const allMoves = frontMoves.concat(backMoves);
                moves.push(allMoves);
                backMoves = [];
                frontMoves = [];
                //brokenup
                //console.log('broken');
            }
            const width = this.bodyWidths(x);
            const rotVec = Vector2D.fromAngle(move.rotation+(Math.PI/2));
            rotVec.multi(width);

            frontMoves.push(new Point(move.position.x+rotVec.x, move.position.y+rotVec.y));
            backMoves.unshift(new Point(move.position.x-rotVec.x, move.position.y-rotVec.y));

            x = x + ratInc;
            lastMove = this.moveHistory[i];
        }
        //adds last movehistory
        if(i != this.moveHistory.length - 1){
            const move = this.moveHistory[this.moveHistory.length - 1];
            const movementVec = move.position.diffVector(lastMove.position);
            if(!(movementVec.distFast() > maxMovement)){
                frontMoves.push(new Point(move.position.x, move.position.y));
            }
        }
        const allMoves = frontMoves.concat(backMoves);
        moves.push(allMoves);
        const polygons:VirtPolygon[] = moves.map((polyPoints) => {
            const polygon = new VirtPolygon();
            polygon.addPoints(polyPoints);
            return polygon;
        });
        return polygons;
    }
    drawSmoothSnake(cr: CanvasRenderingContext2D): void{
        /*
        const segSize = this.getSegSize();
        cr.beginPath();
        cr.moveTo(this.position.x, this.position.y);
        //smooth triangles
        let x = 0;
        const ratInc = segSize/this.moveHistory.length;
        let frontMoves:Point[] = [];
        let backMoves:Point[] = [];
        const moves:Point[][] = [];
        let lastMove = {rotation: this.rotation.rot, position: this.position};
        let i = 0
        for(let i = 0; i<this.moveHistory.length; i=i+segSize){
            const move = this.moveHistory[i];
            const movementVec = move.position.diffVector(lastMove.position);
            if(movementVec.distFast() > this.size*segSize*this.size*segSize){
                const allMoves = frontMoves.concat(backMoves);
                moves.push(allMoves);
                backMoves = [];
                frontMoves = [];
            }else{
                const width = this.bodyWidths(x);
                const rotVec = Vector2D.fromAngle(move.rotation+(Math.PI/2));
                rotVec.multi(width);
                frontMoves.push(new Point(move.position.x+rotVec.x, move.position.y+rotVec.y));
                backMoves.unshift(new Point(move.position.x-rotVec.x, move.position.y-rotVec.y));
            }
            x = x + ratInc;
            lastMove = move;
        }
        //adds last movehistory
        if(i != this.moveHistory.length - 1){
            const move = this.moveHistory[this.moveHistory.length - 1];
            frontMoves.push(new Point(move.position.x, move.position.y));
            //backMoves.unshift(new Point(move.position.x, move.position.y));
        }

        const allMoves = frontMoves.concat(backMoves);
        moves.push(allMoves);
        */
       /*
        moves.forEach((pts) => {
            if(pts.length > 0){
                cr.beginPath();
                cr.moveTo(pts[0].x, pts[0].y);
                pts.forEach((pt) => {
                    cr.lineTo(pt.x, pt.y);
                });
                cr.closePath();
                cr.fill();
            }
        });
        */
       this.tailPolygon.forEach(poly => poly.draw(cr));

        //cr.closePath();
        //cr.fill();
    }
    drawTail(cr: CanvasRenderingContext2D){
        const transformation = cr.getTransform();
        cr.fillStyle = this.bodyColour;
        if(this.bodyType === 3){
            this.drawSmoothSnake(cr);
        }else{
            const segSize = this.getSegSize();
            const ratInc = segSize/this.moveHistory.length;
            let x = 0;
            let lastMove = null;
            for(let i = 0; i<this.moveHistory.length; i=i+segSize){
                const move = this.moveHistory[i];
                //const moveR = this.moveHistory[i+segSize/2];
                const width = this.bodyWidths(x);
                const width2 = this.bodyWidths(x-ratInc);
                cr.translate(move.position.x, move.position.y);
                cr.rotate(move.rotation);
                if(this.bodyType === 0){
                    //(this.moveSpeed*segSize)*move.time
                    cr.fillRect(0, -width, (-this.moveSpeed*segSize)*move.time, width*2);
                }else if(this.bodyType === 1){
                    const trapHeight = (this.moveSpeed*segSize)*move.time;
                    const trapez = new IsoscelesTrapezium(width, width2, trapHeight/2, new Point(-trapHeight/2, 0));
                    trapez.draw(cr);
                }else if(this.bodyType === 2){
                    const trapHeight = (this.moveSpeed*segSize)*move.time;
                    const trapez = new IsoscelesTrapezium(width2, width, trapHeight/2, new Point(-trapHeight/2, 0));
                    trapez.draw(cr);
                }
                cr.setTransform(transformation);
                x = x + ratInc;
                lastMove = move;
            }
            if(lastMove){
                const move = this.moveHistory.slice(-1)[0];
                const width = this.bodyWidths(1);
                const width2 = this.bodyWidths(x-ratInc);
                cr.translate(move.position.x, move.position.y);
                cr.rotate(move.rotation);
                if(this.bodyType === 0){
                    //(this.moveSpeed*segSize)*move.time
                    cr.fillRect(0, -width, (-this.moveSpeed*segSize)*move.time, width*2);
                }else if(this.bodyType === 1){
                    const trapHeight = (this.moveSpeed*segSize)*move.time;
                    const trapez = new IsoscelesTrapezium(width, width2, trapHeight/2, new Point(-trapHeight/2, 0));
                    trapez.draw(cr);
                }else if(this.bodyType === 2){
                    const trapHeight = (this.moveSpeed*segSize)*move.time;
                    const trapez = new IsoscelesTrapezium(width2, width, trapHeight/2, new Point(-trapHeight/2, 0));
                    trapez.draw(cr);
                }
                cr.setTransform(transformation);
            }
        }
    }
    draw(cr: CanvasRenderingContext2D): void {
        const transformation = cr.getTransform();
        this.drawTail(cr);

        //draw head
        cr.translate(this.position.x, this.position.y);
        cr.rotate(this.rotation.rot);
        cr.fillStyle = this.headColour;
        cr.beginPath();
        cr.arc(0, 0, this.size, 0, 2 * Math.PI);
        cr.fill();

        const trapez = new IsoscelesTrapezium(this.size*0.8, this.size*0.4, this.size*0.5, new Point(this.size, 0));
        trapez.draw(cr);

        cr.setTransform(transformation);

        //draw head hitbox
        cr.fillStyle = '#FF443355';
        this.headHitbox.fill(cr);

    }
    static fromSendPlayerData(playerData: SnakeSendPlayerData):AutoSnake{
        const snake = new AutoSnake();
        snake.setPosition(new Point(playerData.position[0], playerData.position[1]));
        snake.rotation.set(playerData.rotation);
        snake.moveHistory = playerData.bodyHistory.map(history => {
            const point = Point.fromArr(history.position);
            return {position: point, rotation: history.rotation,
            distanceFromLast: 0, time: 0};
        });
        return snake;
    }
}

export class CircleVisionAutoSnake extends AutoSnake{
    visionRange: number;
    visionArea: VirtCircle;
    constructor(){
        super();
        this.visionRange = 5;
        this.visionArea = new VirtCircle(this.position.x, this.position.y, this.visionRange);
    }
    update(secs:number){
        super.update(secs);
        this.visionArea.pos = this.position;
    }
    canSee(virtualShape:VirtShape):boolean{
        return this.visionArea.hitShape(virtualShape);
    }
    draw(cr: CanvasRenderingContext2D){
        super.draw(cr);
        cr.lineWidth = 0.1;
        //this.visionArea.draw(cr);
    }
    drawVision(cr: CanvasRenderingContext2D):void{
        cr.fillStyle = '#ffffffaa';
        this.visionArea.fill(cr);
    }
}

export class Food{
    position:Point;
    size:number;
    constructor(pt?:Point, size:number=5){
        this.position = pt ? pt : new Point();
        this.size = size;
    }
    randomPosition(width: number, height:number):Point{
        const newPoint = Point.random(width, height);
        this.position = newPoint;
        return newPoint;
    }
}
export class SMouse extends Food{
    hitBox: VirtCircle;
    colour: string;
    constructor(colour?:string, size:number=5, pt?:Point){
        super(pt, size);
        this.hitBox = new VirtCircle(this.position.x, this.position.y, this.size);
        this.colour = colour ? colour : 'grey';
    }
    randomPosition(width: number, height:number):Point{
        const newPoint = super.randomPosition(width, height);
        this.hitBox.pos = newPoint;
        return newPoint;
    }
    draw(cr: CanvasRenderingContext2D): void {
        const transformation = cr.getTransform();
        cr.translate(this.position.x, this.position.y);
        cr.fillStyle = this.colour;
        cr.beginPath();
        cr.arc(0, 0, this.size, 0, 2 * Math.PI);
        cr.fill();
        cr.setTransform(transformation);
    }
}

export class RedMouse extends Food{
    hitBox: VirtCircle;
    constructor(size:number=5, pt?:Point){
        super(pt, size);
        this.hitBox = new VirtCircle(this.position.x, this.position.y, this.size);
    }
    randomPosition(width: number, height:number):Point{
        const newPoint = super.randomPosition(width, height);
        this.hitBox.pos = newPoint;
        return newPoint;
    }
    draw(cr: CanvasRenderingContext2D):void{
        cr.translate(this.position.x, this.position.y);
        cr.fillStyle = 'red';
        cr.beginPath();
        cr.arc(0, 0, this.size, 0, 2 * Math.PI);
        cr.fill();
        cr.resetTransform();
    }
}

export class ALogCurve{
    sx:number;
    ex:number;
    constructor(sx:number, ex:number){
        this.sx = sx;
        this.ex = ex;
    }
    draw(cr:CanvasRenderingContext2D):void{
        const samplePoints = 20;
        const diff = (this.ex - this.sx) / samplePoints;
        cr.strokeStyle = 'red';
        cr.beginPath();
        let x = this.sx;
        cr.moveTo(x, Math.log(x)*50);
        for(let i = 1; i < samplePoints; ++i){
            const y = Math.log(x)*50;
            cr.lineTo(x, y);
            x = x + diff;
        }
        cr.stroke();
    }
}