import { Point, Vector2D } from "../../game/shapes";
import { Velocity2D } from "./Base";
import { ViewArea } from "../../game/view";
import { EnemyHolder } from "../Enemy/Enemy";

export type ProjectileClientUpdate = {
    position: number[];
    velocity: number[];
    size:number;
    type:string;
    time:number;
    owner:string;
}

export class Projectile{
    position: Point;
    velocity: Velocity2D;
    size:number;
    pierce:boolean;
    constructor(){
        this.position = new Point();
        this.velocity = new Velocity2D();
        this.size = 0.1;
        this.pierce = false;
    }
    setVelocity(x:number, y:number){
        this.velocity.vx = x;
        this.velocity.vy = y;
    }
    //to test
    updatePosition(secs:number):void{
        //if(secs !== undefined){
        const movement = new Vector2D(this.velocity.vx, this.velocity.vy);
        movement.multi(secs);
        this.position.addVector(movement);
        //}
        /*
        else{
            this.position.add(this.velocity.asPoint());
        }*/
    }
    draw(cr:CanvasRenderingContext2D):void{
        cr.fillStyle = 'blue';
        cr.beginPath();
        cr.arc(this.position.x, this.position.y, this.size, 0, 2 * Math.PI);
        cr.fill();
    }

    clientUpdateObj(user:string):ProjectileClientUpdate{
        return {
            position: this.position.arr(),
            velocity: this.velocity.arr(),
            size: this.size,
            type: 'normal',
            time: Date.now(),
            owner: user
        }
    }
}

export class ProjectileCollection{
    projectiles: Projectile[];
    constructor(){
        this.projectiles = [];
    }
    push(p:Projectile){
        this.projectiles.push(p);
    }
    update(viewArea:ViewArea, frameTime:number){
        const remProj:number[] = [];
        this.projectiles.forEach((proj, i) => {
            proj.updatePosition(frameTime);
            if(!viewArea.isInsideView(proj.position)){
                remProj.unshift(i);
            }
        });
        this.removeProjs(remProj);
    }
    collideEnemy(cObjs:EnemyHolder){
        //const collisions = [];
        const projs:number[] = [];
        this.projectiles.forEach((proj, i) => {
            cObjs.enemies.forEach((en) => {
                const coll = en.collision(proj);
                if(coll.isCollision){
                    projs.unshift(i);
                    console.log(coll);
                }
            });
        });
        this.removeProjs(projs);
    }
    //requires reverse sorted numbers
    removeProjs(remProj:number[]){
        remProj.forEach((i) => {
            this.projectiles.splice(i, 1);
        });
    }
    draw(cr:CanvasRenderingContext2D){
        this.projectiles.forEach((proj) => {
            proj.draw(cr);
        });
    }
}