import { StaticEntity } from "../Mechanics/Base";
import { Point, Vector2D, Rotation } from "../../game/shapes";
import { SLPlayer } from "../Player/Player";

export type TurretUpdateReturn = {
    //owner: 
    position: Point;
    velocity: Vector2D;
    projType?: string;
}

class BaseTurret extends StaticEntity{
    static currentId = 0;
    id:number;
    center:Point;

    range:number
    direction: Vector2D;
    rotation: Rotation;

    shootCooldown:number;
    shootTime:number;

    shooterLength:number;
    shooterWidth:number;

    inRange:boolean;

    constructor(pt?:Point){
        super(pt);
        this.id = BaseTurret.currentId;
        BaseTurret.currentId++;

        this.center = new Point(this.position.x+0.5, this.position.y+0.5);
        this.range = 5;
        this.direction = new Vector2D(0, -1);
        this.rotation = new Rotation(0);

        this.shootCooldown = 1;
        this.shootTime = 0;

        this.shooterLength = 0.5;
        this.shooterWidth = 0.14;

        this.inRange = false;
    }
    update(secs:number):TurretUpdateReturn | undefined{
        if(this.inRange && this.shootTime > this.shootCooldown){
            //shoot
            this.shootTime = 0;
            const vec = Vector2D.fromAngle(this.rotation.rot);
            const vCp = vec.copy();
            vCp.multi(0.5);
            const shootPoint = this.center.copy()
            shootPoint.addVector(vCp);
            return {
                position: shootPoint,
                velocity: vec
            }
        }
        this.shootTime += secs;
        return undefined;
    }
    drawRange(cr:CanvasRenderingContext2D):void{
        cr.fillStyle = !this.inRange ? '#22222244' : '#AA222244';
        cr.beginPath();
        cr.arc(this.center.x, this.center.y, this.range, 0, 2 * Math.PI);
        cr.fill();
    }
    draw(cr:CanvasRenderingContext2D):void{
        //draw range
        this.drawRange(cr);

        //base
        cr.fillStyle = 'grey';
        cr.fillRect(this.position.x, this.position.y, 1, 1);
        
        //body
        cr.fillStyle = 'black';
        cr.beginPath();
        cr.arc(this.center.x, this.center.y, 0.4, 0, 2 * Math.PI);
        cr.fill();

        //shooter
        const transform = cr.getTransform()
        cr.translate(this.center.x, this.center.y);
        cr.rotate(this.rotation.rot);
        cr.fillStyle = 'white';
        //cr.fillRect(-this.shooterWidth/2, 0, this.shooterWidth, this.shooterLength); // facing down
        cr.fillRect(0, -this.shooterWidth/2, this.shooterLength, this.shooterWidth);

        //set transform back
        cr.setTransform(transform);
    }
}

//turret with no turn speed
export class SnapTurret extends BaseTurret{

    projectileType: string;

    constructor(pt?:Point){
        super(pt);
        this.projectileType = 'normal';
    }
    pointTo(pt:Point){
        const vec = pt.diffVector(this.center);
        if(vec.y !== 0){
            this.rotation = Rotation.fromVector(vec);
        }
    }
    detectPlayer(player:SLPlayer):void{
        const vec = player.position.diffVector(this.center);
        const dist = (this.range+player.size);
        if(vec.distFast() < dist*dist){
            //console.log('in range');
            this.inRange = true;
            this.pointTo(player.position);
        }else{
            this.inRange = false;
        }
    }
}

export class RotateTurret extends BaseTurret{
    turnSpeed: number;
    playerRot: Rotation;
    constructor(pt?: Point){
        super(pt);
        this.turnSpeed = 0.01;
        this.playerRot = new Rotation();
    }
    drawRange(cr: CanvasRenderingContext2D): void {
        super.drawRange(cr);
        const r1 = new Rotation();
        const r2 = new Rotation();
        
        const c = this.rotation.closer(this.playerRot);
        if(c){
            r1.set(this.rotation.rot);
            r2.set(this.playerRot.rot);
        }else{
            r2.set(this.rotation.rot);
            r1.set(this.playerRot.rot);
        }

        cr.strokeStyle = 'red';
        cr.beginPath();

        cr.arc(this.center.x, this.center.y, 1, r1.rot, r2.rot);
        cr.stroke()
    }
    pointTo(pt:Point){
        const vec = pt.diffVector(this.center);
        if(vec.y !== 0){
            this.playerRot = Rotation.fromVector(vec);
            //this.playerRot = new Rotation(rot);
            const diffDir = this.rotation.diffDirection(this.playerRot);
            const rotVal = diffDir.difference < this.turnSpeed ? diffDir.difference : this.turnSpeed;
            if(diffDir.clockwise){
                this.rotation.add(rotVal);
            }else{
                this.rotation.sub(rotVal);
            }
        }
    }

    detectPlayer(player:SLPlayer):void{
        const vec = player.position.diffVector(this.center);
        const dist = (this.range+player.size);
        if(vec.distFast() < dist*dist){
            //console.log('in range');
            this.inRange = true;
            this.pointTo(player.position);
        }else{
            this.inRange = false;
        }
        //console.log(vec);
    }
}