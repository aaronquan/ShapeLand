import { Point, Vector2D} from "../../game/geometry";
import { Velocity2D } from "../Mechanics/Base";
import { Entity } from "../Mechanics/Base";
import { Rotation } from "../../game/geometry";

export class SLPlayer extends Entity{
    //position: Point;
    //velocity: Velocity2D;
    rotation: Rotation;
    //looking: Point;
    playerMouseVector: Vector2D;
    turnSpeed: number;
    size:number;
    constructor(){
        super();
        //this.position = new Point();
        //this.velocity = new Velocity2D();
        this.size = 0.5;
        this.rotation = new Rotation();
        this.playerMouseVector = new Vector2D();
        this.turnSpeed = 0.15;
    }
    
    update(secs:number){
        super.update(secs);
        const pmvRot = this.playerMouseVector.toRotation();
        const diffDir = this.rotation.diffDirection(pmvRot);
        const rotVal = diffDir.difference < this.turnSpeed ? diffDir.difference : this.turnSpeed;
        if(diffDir.clockwise){
            this.rotation.add(rotVal);
        }else{
            this.rotation.sub(rotVal);
        }
    }
    setVelocityX(x:number){
        this.velocity.vx = x;
    }
    setVelocityY(y:number){
        this.velocity.vy = y;
    }
    debugDraw(cr:CanvasRenderingContext2D):void{
        cr.strokeStyle = 'green';
        cr.lineWidth = 0.1;
        cr.beginPath();
        cr.moveTo(this.position.x, this.position.y);
        const dir = this.playerMouseVector.copy();
        dir.multi(0.5);
        cr.lineTo(this.position.x+dir.x, this.position.y+dir.y);
        cr.stroke();

        cr.strokeStyle = 'blue';
        //const rot = new Rotation(this.rotation);
        const rotVec = this.rotation.toVector();
        cr.beginPath();
        cr.moveTo(this.position.x, this.position.y);
        cr.lineTo(this.position.x+rotVec.x, this.position.y+rotVec.y);
        cr.stroke();
    }
    draw(cr:CanvasRenderingContext2D):void{
        cr.fillStyle = 'red';
        cr.beginPath();
        cr.arc(this.position.x, this.position.y, this.size, 0, 2 * Math.PI);
        cr.fill();
    }
}
