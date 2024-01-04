import { MouseState, defaultMouseStateCreator } from "../components/Canvas";
import { Point, Vector2D } from "../game/geometry";
import { ViewArea } from "../game/view";

import { Enemy, BasicCircleEnemy, EnemyHolder, EnemyHit } from "./Enemy/Enemy";
import { SLPlayer } from "./Player/Player";
import { Teammate } from "./Player/Teammate";
import { 
    Velocity2D, 
    CollisionReturn, Entity, 
} from "./Mechanics/Base";
import {Projectile, ProjectileCollection, ProjectileClientUpdate} from "./Mechanics/Projectiles";
import { CanvasButton } from "../canvas/controls";
import { DrawTextInput } from "../canvas/text";
import { ShapeLandDebugger } from "./Debugger";
import { RotateTurret, SnapTurret } from "./Enemy/Turret";

import { CanvasScreen } from "../components/Canvas";

//to update with projectiles etc
export type ShapeLandClientUpdate = {
    player: {
        name:string;
        position:number[];
    }
    projectiles: ProjectileClientUpdate[];
}

export class ShapeLandGame implements CanvasScreen{
    name: string;
    player:SLPlayer;
    teammates:Teammate[]; // change to Teammate class

    viewArea: ViewArea;
    mouseState: MouseState;
    keyState: boolean; // to change

    controls: Controls;

    playerMouseVector:Vector2D;
    projectiles:ProjectileCollection;

    teammateProjectiles:ProjectileCollection;
    turretProjectiles:ProjectileCollection

    //enemy: Entity[];
    enemyHolder: EnemyHolder;

    updates: ShapeLandUpdates; // sender and reciever
    updateTime: number;
    //for debugging
    debugger:ShapeLandDebugger;
    //sent:number;
    //recieved:number;
    testTurret: SnapTurret;
    testTurret2: RotateTurret;
    constructor(){
        this.name = '';
        this.player = new SLPlayer();
        this.teammates = [];

        this.viewArea = new ViewArea(0, 0);
        this.mouseState = defaultMouseStateCreator();
        this.keyState = true;

        this.controls = new Controls();

        this.playerMouseVector = new Vector2D(); // player to point vector //normalised

        this.projectiles = new ProjectileCollection();
        this.teammateProjectiles = new ProjectileCollection();

        this.turretProjectiles = new ProjectileCollection();

        this.enemyHolder = new EnemyHolder();

        this.updates = new ShapeLandUpdates(); // sender and reciever
        this.updateTime = Date.now();

        this.debugger = new ShapeLandDebugger();

        this.testTurret = new SnapTurret();
        this.testTurret2 = new RotateTurret(new Point(3, 3));
        this.testTurret2.range = 3;
        //this.sent = 0;

        //this.player.mousePoint 
    }
    initialise(screenX: number, screenY: number, initData:any){
        this.viewArea.setView(screenX, screenY);
        this.viewArea.initArea(15, true);
        const en = new BasicCircleEnemy();
        en.setPosition(5,5);
        this.enemyHolder.push(en);

        if('user' in initData){
            this.name = initData.user;
        }
        if('player' in initData.game){
            this.player.position = new Point(initData.game.player.position[0], initData.game.player.position[1]);
        }
    }
    initOfflineGame(screenX: number, screenY: number){
        this.viewArea.setView(screenX, screenY);
        this.viewArea.initArea(15, true);
    }
    collisions(){
        this.projectiles.collideEnemy(this.enemyHolder);
    }
    mouseDown(e:React.MouseEvent<HTMLCanvasElement>, position:Point){
        const gamePoint = this.viewArea.canvasToAreaCoord(position);

        const pv = this.playerMouseVector.copy();
        pv.multi(0.5);
        const np = new Projectile();
        const v = this.playerMouseVector.copy();
        v.multi(0.2);
        np.position = this.player.position.copy();
        np.position.addVector(pv);
        np.setVelocity(v.x, v.y);
        this.projectiles.push(np);
        this.updates.addProjectiles(np, this.name);
        //console.log(this.updates);
    }
    mouseUp(e:React.MouseEvent<HTMLCanvasElement>, position:Point){
        const gamePoint = this.viewArea.canvasToAreaCoord(position);
    }
    mouseMove(e:React.MouseEvent<HTMLCanvasElement>, position:Point){
        const gamePoint = this.viewArea.canvasToAreaCoord(position);
        const playerMouseVector:Vector2D = gamePoint.diffVector(this.player.position);
        playerMouseVector.norm();
        this.playerMouseVector = playerMouseVector;
        this.player.playerMouseVector = playerMouseVector;
        //console.log(playerMouseVector);
    }
    keyDown(e:KeyboardEvent, key:string){
        if(this.controls.scheme === MovementControlScheme.keyboard){
            switch(key){
                case 'w':
                    this.player.setVelocityY(-1);
                    break;
                case 'a':
                    this.player.setVelocityX(-1);
                    break;
                case 's':
                    this.player.setVelocityY(1);
                    break;
                case 'd':
                    this.player.setVelocityX(1);
                    break;
            }
        }
    }
    keyUp(e:KeyboardEvent, key:string){
        if(this.controls.scheme === MovementControlScheme.keyboard){
            switch(key){
                case 'w':
                    this.player.setVelocityY(0);
                    break;
                case 'a':
                    this.player.setVelocityX(0);
                    break;
                case 's':
                    this.player.setVelocityY(0);
                    break;
                case 'd':
                    this.player.setVelocityX(0);
                    break;
            }
        }
    }
    update(rawMouseState:MouseState, frameTime:number){
        const frameSecs = frameTime/1000;
        this.mouseState = rawMouseState;
        this.player.update(frameSecs);
        this.viewArea.centerOn(this.player.position);

        this.projectiles.update(this.viewArea, frameSecs);
        this.teammateProjectiles.update(this.viewArea, frameSecs);
        
        this.turretProjectiles.update(this.viewArea, frameSecs);


        //const slPos = this.viewArea.canvasToAreaCoord(this.mouseState.position);
        //this.testTurret.pointTo(slPos);

        this.testTurret.detectPlayer(this.player);
        this.testTurret.detectPlayer(this.player);
        const ret = this.testTurret.update(frameSecs);
        if(ret){
            const proj = new Projectile(ret.position, ret.velocity);
            this.turretProjectiles.push(proj);
        }

        this.testTurret2.detectPlayer(this.player);
        const ret2 = this.testTurret.update(frameSecs);
        this.debugger.rot = this.testTurret.rotation.rot;

        //atm run enemy updates/logic in server
        //this.enemyHolder.update(frameSecs);

        this.collisions();
    }
    devDraw(cr:CanvasRenderingContext2D){
        cr.font = '10px Arial';
        cr.fillStyle = 'white';
        //cr.fillText('Hello World', 2, 10);
        const scaledPosition = this.viewArea.canvasToAreaCoord(this.mouseState.position);
        cr.fillText(scaledPosition.toString(), 1, 10);

        cr.fillText(this.player.position.toString(), 1, 20);
    }
    draw(cr:CanvasRenderingContext2D):void{
        this.viewArea.setTransformation(cr);
        cr.clearRect(this.viewArea.pos.x, this.viewArea.pos.y, this.viewArea.width, this.viewArea.height);
        
        cr.fillRect(2,2,1,1); // test rectangle in area

        this.player.draw(cr);
        this.player.debugDraw(cr);

        this.teammates.forEach((pl) => pl.draw(cr));

        this.testTurret.draw(cr);
        this.testTurret2.draw(cr);

        this.projectiles.draw(cr);
        this.teammateProjectiles.draw(cr);
        this.turretProjectiles.draw(cr);

        this.enemyHolder.draw(cr);


        this.viewArea.drawGrid(cr);

        cr.resetTransform();
        this.devDraw(cr);
        this.debugger.draw(cr);
    }
    sendUpdates() : ShapeLandClientUpdate{
        //console.log(this.player.position);
        const updates = this.updates.obj();
        //verify update went through before deleting on return
        //this.debugger.sentProjectiles += updates.projectiles.length;
        return {
            player: {name: this.name, position: this.player.position.arr()},
            projectiles: updates.projectiles
        }
    }
    serverUpdate(update:any, times:any){
        if('players' in update){
            //update pl type
            this.teammates = [];
            update.players.forEach((pl:any) => {
                const tm = new Teammate(pl.name);
                tm.position = new Point(pl.position[0], pl.position[1]);
                this.teammates.push(tm);
            });
        }
        if('enemies' in update){
            //this.enemyHolder.update()
            this.enemyHolder.update(update.enemies);
            //console.log(update.enemies);
        }
        if('projectiles' in update){
            if(update.projectiles.length > 0){

                const projs = this.updates.recieveProjectiles(update.projectiles);
                this.debugger.recievedProjectiles += projs.length;
                console.log(projs);
                projs.forEach(proj => this.teammateProjectiles.push(Projectile.fromObj(proj)));
                /*
                console.log(update.projectiles);
                update.projectiles.forEach((proj:ProjectileClientUpdate) => {
                    this.teammateProjectiles.push(Projectile.fromObj(proj));
                });
                this.debugger.recievedProjectiles += update.projectiles.length;
                */
            }
        }
        if('disconnects' in update){

        }
        if('added' in update){
            if('projectiles' in update.added){
                if(update.added.projectiles.length > 0){
                    this.debugger.sentProjectiles += update.added.projectiles.length;
                    update.added.projectiles.forEach((p:ProjectileClientUpdate) => {
                        this.updates.removeProjectile(p);
                        //this.updates.projectiles.some((proj) => )
                    });
                    //this.updates.clearUpdates();
                }
            }
        }
        this.updateTime = times.outgoing;
    }
}

// sender and reciever of updates to the server
class ShapeLandUpdates{
    projectiles: ProjectileClientUpdate[];
    recievedProjectiles: ProjectileClientUpdate[];

    enemyHits: EnemyHit[];

    constructor(){
        this.projectiles = [];
        this.recievedProjectiles = [];
        this.enemyHits = [];
    }
    addProjectiles(p:Projectile, user:string){
        this.projectiles.push(p.clientUpdateObj(user));
    }
    removeProjectile(p:ProjectileClientUpdate){
        const index = this.findIndex(this.projectiles, p);
        if(index !== -1){
            this.projectiles.splice(index, 1);
        }
    }
    findIndex(projs:ProjectileClientUpdate[], p:ProjectileClientUpdate):number{
        return projs.findIndex((proj) => (p.id === proj.id && p.owner === proj.owner));
    }
    clearUpdates(){
        this.projectiles = [];
    }
    obj(){
        return {
            projectiles: this.projectiles
            //projectiles: this.projectiles.map((proj) => proj.clientUpdateObj(user))
        };
    }

    recieveProjectiles(projs:ProjectileClientUpdate[]):ProjectileClientUpdate[]{
        const recieved:ProjectileClientUpdate[] = [];
        projs.forEach((p) => {
            const index = this.findIndex(this.recievedProjectiles, p);
            if(index === -1){
                this.recievedProjectiles.push(p);
                recieved.push(p);
            }
        });
        return recieved;
    }
}

enum MovementControlScheme{
    keyboard, mouse
}

class Controls{
    up:string; right:string;
    down:string; left:string;

    scheme:MovementControlScheme;
    constructor(){
        this.up = 'w';
        this.right = 'd';
        this.down = 's';
        this.left = 'a';
        this.scheme = MovementControlScheme.keyboard;
    }
    changeScheme(cs:MovementControlScheme){
        this.scheme = cs;
    }
}
