import { Point, Vector2D} from "../../game/geometry";
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
        cr.fillStyle = 'white';
        cr.beginPath();
        cr.arc(this.position.x, this.position.y, 0.4, 0, 2 * Math.PI);
        cr.fill();
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

export class StaticEntity{
    position: Point;
    constructor(pt?:Point){
        this.position = pt ? pt : new Point();
    }
    collision(proj:Projectile):CollisionReturn{
        return {isCollision: false};
    }
    draw(cr:CanvasRenderingContext2D):void{
        cr.fillStyle = 'grey';
        //cr.beginPath();
        cr.fillRect(this.position.x-0.5, this.position.y-0.5, 1, 1);
        //cr.fill();
    }
}

export type CollisionReturn = {
    isCollision:boolean;
    collisionVector?:Vector2D;
    collisionPoint?:Point;
}

const stoppingVelocity = 0.001;

//have diff class
export class Velocity2D{
    velocity: Vector2D;
    vx:number;
    vy:number;
    ax:number; //acceleration
    ay:number;
    friction:number;
    constructor(vel?:Vector2D){
        this.vx = vel ? vel.x : 0;
        this.vy = vel ? vel.y : 0;
        this.velocity = vel ? vel : new Vector2D();
        this.ax = 0;
        this.ay = 0;
        this.friction = 0;
    }
    update(time:number):void{
        if(time !== undefined){
            const upd = time;
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
    //only implements velocity - not acceleration
    getMovement(time:number){
        return new Vector2D(this.vx*time, this.vy*time);
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
