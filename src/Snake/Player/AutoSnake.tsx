import { Point, Rotation, Vector2D } from "../../game/shapes";

type SnakeMove = {
    rotation:number;
    position:Point;
    time:number;
}

export class AutoSnake{
    position: Point;
    rotation: Rotation;
    size: number;
    moveSpeed: number;
    rotateSpeed: number;

    moveHistory: SnakeMove[];
    constructor(){
        this.position = new Point();
        this.rotation = new Rotation(0);
        this.size = 20;
        this.moveSpeed = 100;
        this.rotateSpeed = 0.05;
        this.moveHistory = [];
    }

    update(secs:number){
        const moveVec = this.rotation.toVector();
        moveVec.multi(secs*this.moveSpeed);
        this.position.addVector(moveVec);

        this.moveHistory.push({rotation: this.rotation.rot, position: this.position.copy(), time: secs});
        if(this.moveHistory.length > 100){
            this.moveHistory.shift();
        }
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
    debugDraw(cr: CanvasRenderingContext2D): void {
        
    }
    draw(cr: CanvasRenderingContext2D): void {
        //tail
        const segSize = 4;
        let bodyWidth = this.size*0.1;
        for(let i = 0; i<this.moveHistory.length; i=i+segSize){
            
            const move = this.moveHistory[i];
            cr.fillStyle = 'blue';
            cr.resetTransform();
            cr.translate(move.position.x, move.position.y);
            cr.rotate(move.rotation);
            //cr.fillRect(-this.moveSpeed*segSize, -bodyWidth/2, this.moveSpeed*segSize, bodyWidth); //long tails
            cr.fillRect((-this.moveSpeed*segSize)*move.time, -bodyWidth/2, (-this.moveSpeed*segSize)*move.time, bodyWidth);
            cr.resetTransform();
            bodyWidth *= 1.2;
        }
        bodyWidth = this.size*0.08;
        for(let i = segSize/2; i<this.moveHistory.length; i=i+segSize){
            const move = this.moveHistory[i];
            cr.fillStyle = 'blue';
            cr.resetTransform();
            cr.translate(move.position.x, move.position.y);
            cr.rotate(move.rotation);
            cr.fillRect((-this.moveSpeed*segSize)*move.time, -bodyWidth/2, (-this.moveSpeed*segSize)*move.time, bodyWidth);
            cr.resetTransform();
            bodyWidth *= 1.2;
        }
        /*
        this.moveHistory.forEach((move:SnakeMove) => {
            cr.fillStyle = 'blue';
            cr.resetTransform();
            cr.translate(move.position.x, move.position.y);
            cr.rotate(move.rotation);
            cr.fillRect(-this.size/2, -this.size/2, this.size, this.size);
            cr.resetTransform();
        });
        */

        //draw head
        cr.fillStyle = 'red';
        cr.beginPath();
        cr.arc(this.position.x, this.position.y, this.size, 0, 2 * Math.PI);
        cr.fill();

    }
}