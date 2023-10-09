import { Point, Vector2D } from "../../game/shapes";
import { Velocity2D } from "./Base";
import { ViewArea } from "../../game/view";
import { EnemyHolder } from "../Enemy/Enemy";

export type ProjectileClientUpdate = {
    id:number;
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
    colour:string;
    static idCount:number = -1;
    constructor(pt?:Point, vel?:Vector2D){
        this.position = pt ? pt : new Point();
        this.velocity = vel ? new Velocity2D(vel) : new Velocity2D();
        this.size = 0.1;
        this.pierce = false;
        this.colour = 'blue';
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
        cr.fillStyle = this.colour;
        cr.beginPath();
        cr.arc(this.position.x, this.position.y, this.size, 0, 2 * Math.PI);
        cr.fill();
    }

    //only does normal projectiles
    static fromObj(obj:ProjectileClientUpdate):Projectile{
        const p = new Projectile();
        p.velocity.vx = obj.velocity[0];
        p.velocity.vy = obj.velocity[1];
        const timeElapsed = (Date.now() - obj.time)/1000;
        const movement = p.velocity.getMovement(timeElapsed);
        p.position = new Point(obj.position[0]+movement.x, obj.position[1]+movement.y);
        p.colour = 'green';
        p.size = obj.size;
        //console.log(p);
        return p;
    }

    clientUpdateObj(user:string):ProjectileClientUpdate{
        Projectile.idCount++;
        return {
            id: Projectile.idCount,
            position: this.position.arr(),
            velocity: this.velocity.arr(),
            size: this.size,
            type: 'normal',
            time: Date.now(),
            owner: user,
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