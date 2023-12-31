import { Entity } from "../Mechanics/Base";
import { Projectile } from "../Mechanics/Projectiles";
import {CollisionReturn} from "../Mechanics/Base";
import { RandomLinePath } from "../Mechanics/TreeGraphics";
import { Point } from "../../game/geometry";
import { Line } from "../Mechanics/TreeGraphics";

export type EnemyHit = {
    id:number;
    enemyId:number;

}

export type ServerEnemyObj = {
    id:number;
    position: number[];

}

export class EnemyHolder{
    enemies: Enemy[];
    enemyMap: Map<number, Enemy>;
    constructor(){
        this.enemies = [];
        this.enemyMap = new Map();
    }
    push(e:Enemy){
        this.enemies.push(e);
    }
    update(eneObjs:ServerEnemyObj[]){
        eneObjs.forEach(obj => {
            if(this.enemyMap.has(obj.id)){
                const enemy = this.enemyMap.get(obj.id);
                if(enemy){
                    enemy.setPosition(obj.position[0], obj.position[1]);
                }
            }else{
                this.enemyMap.set(obj.id, Enemy.fromObj(obj));
            }
        });
        
        //const remEn:number[] = [];

        //delete enemies if low hp
        /*
        this.enemies.forEach((e, i) => {
            e.update(secs);
            if(e.hp < 0){
                remEn.unshift(i);
            }
        });

        remEn.forEach(i => {
            this.enemies.splice(i, 1);
        })*/
    }
    addEnemyObj(obj:ServerEnemyObj){
        this.enemies.push(Enemy.fromObj(obj));
    }
    updateEnemies(eneObjs:ServerEnemyObj[]){
        eneObjs.forEach(obj => {

        })
    }
    draw(cr:CanvasRenderingContext2D):void{
        this.enemies.forEach(e => e.draw(cr));

        Array.from(this.enemyMap.values()).forEach((enemy) => {
            enemy.draw(cr);
        })
    }
}
export class Enemy extends Entity{
    hp:number;
    constructor(){
        super();
        this.hp = 5;
    }
    static fromObj(obj:ServerEnemyObj):Enemy{
        const e = new Enemy();
        e.setPosition(obj.position[0], obj.position[1]);
        return e;
    }
}

export class BasicCircleEnemy extends Enemy{
    size: number;
    maxHp: number;
    crack: RandomLinePath; 
    crackLines: Line[];
    constructor(){
        super();
        this.maxHp = 10;
        this.size = 0.5;
        this.crack = new RandomLinePath(new Point(), new Point(), 4, 0.1);
        this.crackLines = [];
    }
    collision(proj:Projectile):CollisionReturn{
        const dv = proj.position.diffVector(this.position);
        const dist = this.size+proj.size;
        if(dv.distFast() < dist*dist){
            const cv = dv.copy();
            cv.norm();
            
            //test moving enemy
            const mv = cv.copy();
            mv.multi(-0.04);
            this.velocity.setVelocityVector(mv);
            this.velocity.friction = 0.15;

            this.hp--;
            if(this.hp < 0){
                console.log('die');
            }

            //crack drawing
            const p1 = this.position.copy();
            cv.multi(0.25);
            p1.addVector(cv);
            const p2 = this.position.copy();
            this.crack = new RandomLinePath(p1, p2, 0.1, 0.01);
            this.crackLines = this.crack.generateLines();

            return {isCollision: true, collisionVector: cv};
        }
        return {isCollision: false};
    }
    update(time:number){
        super.update(time);
    }
    draw(cr:CanvasRenderingContext2D):void{
        cr.fillStyle = 'white';
        cr.beginPath();
        cr.arc(this.position.x, this.position.y, this.size, 0, 2 * Math.PI);
        cr.fill();

        cr.strokeStyle = 'red';
        cr.lineWidth = 0.03;
        this.crackLines.forEach((line) => line.draw(cr));
    }
}