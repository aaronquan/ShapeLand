import { Point} from "../../game/shapes";
import { Velocity2D } from "../Mechanics/Base";
import { Entity } from "../Mechanics/Base";

export class SLPlayer extends Entity{
    //position: Point;
    //velocity: Velocity2D;
    size:number;
    constructor(){
        super();
        //this.position = new Point();
        //this.velocity = new Velocity2D();
        this.size = 0.5;
    }
    /*
    updatePosition(time?:number):void{
        this.position.add(this.velocity.asPoint());
    }*/
    setVelocityX(x:number){
        this.velocity.vx = x;
    }
    setVelocityY(y:number){
        this.velocity.vy = y;
    }
    draw(cr:CanvasRenderingContext2D):void{
        cr.fillStyle = 'red';
        cr.beginPath();
        cr.arc(this.position.x, this.position.y, this.size, 0, 2 * Math.PI);
        cr.fill();
    }
}
