import { Point, Vector2D} from "../../game/shapes";
import { ViewArea } from "../../game/view";
import { EnemyHolder } from "../Enemy/Enemy";
import { Projectile } from "./Projectiles";

export class Entity{
    position: Point;
    velocity: Velocity2D;
    constructor(){
        this.position = new Point();
        this.velocity = new Velocity2D();
    }
    setPosition(x:number, y:number){
        this.position.x = x;
        this.position.y = y;
    }
    collision(proj:Projectile):CollisionReturn{
        return {isCollision: false};
    }
    draw(cr:CanvasRenderingContext2D){

    }
    update(secs:number){
        //if(time !== undefined){
        const movement = new Vector2D(this.velocity.vx, this.velocity.vy);
        movement.multi(secs);
        this.position.addVector(movement);
        //}
        //else{
        //    this.position.add(this.velocity.asPoint());
        //}
        this.velocity.update(secs);
    }
    
}

export type CollisionReturn = {
    isCollision:boolean;
    collisionVector?:Vector2D;
    collisionPoint?:Point;
}

const stoppingVelocity = 0.001;

export class Velocity2D{
    vx:number;
    vy:number;
    ax:number; //acceleration
    ay:number;
    friction:number;
    constructor(){
        this.vx = 0;
        this.vy = 0;
        this.ax = 0;
        this.ay = 0;
        this.friction = 0;
    }
    update(time:number):void{
        if(time !== undefined){
            const upd = time/1000;
            this.setVelocity(this.vx+(this.ax*upd), this.vy+(this.ay*upd));
            if(this.friction > 0){
                this.ax = -this.vx*this.friction*upd;
                this.ay = -this.vy*this.friction*upd;
            }
        }else{
            this.setVelocity(this.vx+this.ax, this.vy+this.ay);
            if(this.friction > 0){
                this.ax = -this.vx*this.friction;
                this.ay = -this.vy*this.friction;
            }
        }
    }
    asPoint():Point{
        return new Point(this.vx, this.vy);
    }
    setVelocity(x:number, y:number){
        this.vx = x;
        this.vy = y;
        if(this.vx*this.vx+this.vy*this.vy < stoppingVelocity){
            this.vx = 0; this.vy = 0;
        }
    }
    setVelocityVector(v:Vector2D){
        this.setVelocity(v.x, v.y);
    }
    arr(){
        return [this.vx, this.vy];
    }
}
