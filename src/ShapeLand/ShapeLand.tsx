import { MouseState, defaultMouseStateCreator } from "../components/Canvas";
import { Point, Vector2D } from "../game/shapes";
import { ViewArea } from "../game/view";

import { Enemy, BasicCircleEnemy, EnemyHolder } from "./Enemy/Enemy";
import { SLPlayer } from "./Player/Player";
import { Teammate } from "./Player/Teammate";
import { 
    Velocity2D, 
    CollisionReturn, Entity, 
} from "./Mechanics/Base";
import {Projectile, ProjectileCollection, ProjectileClientUpdate} from "./Mechanics/Projectiles";
import { CanvasButton } from "../canvas/controls";
import { DrawTextInput } from "../canvas/text";

//to update with projectiles etc
export type ShapeLandClientUpdate = {
    player: {
        name:string;
        position:number[];
    }
    projectiles: ProjectileClientUpdate[];
}

export class ShapeLandGame{
    name: string;
    player:SLPlayer;
    teammates:Teammate[]; // change to Teammate class

    viewArea: ViewArea;
    mouseState: MouseState;
    keyState: boolean; // to change

    controls: Controls;

    pointVector:Vector2D;
    projectiles:ProjectileCollection;
    //enemy: Entity[];
    enemyHolder: EnemyHolder;

    updates: ShapeLandUpdates;

    constructor(){
        this.name = '';
        this.player = new SLPlayer();
        this.teammates = [];

        this.viewArea = new ViewArea(0, 0);
        this.mouseState = defaultMouseStateCreator();
        this.keyState = true;

        this.controls = new Controls();

        this.pointVector = new Vector2D();
        this.projectiles = new ProjectileCollection();

        this.enemyHolder = new EnemyHolder();

        this.updates = new ShapeLandUpdates();
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
    collisions(){
        this.projectiles.collideEnemy(this.enemyHolder);
    }
    handleMouseDown(position:Point){
        const gamePoint = this.viewArea.canvasToAreaCoord(position);

        const pv = this.pointVector.copy();
        pv.multi(0.5);
        const np = new Projectile();
        const v = this.pointVector.copy();
        v.multi(0.2);
        np.position = this.player.position.copy();
        np.position.addVector(pv);
        np.setVelocity(v.x, v.y);
        this.projectiles.push(np);
        this.updates.addProjectiles(np);
        //console.log(this.projectiles);
    }
    handleMouseUp(position:Point){
        const gamePoint = this.viewArea.canvasToAreaCoord(position);
    }
    handleMouseMove(position:Point){
        const gamePoint = this.viewArea.canvasToAreaCoord(position);
        const playerMouseVector:Vector2D = gamePoint.diffVector(this.player.position);
        playerMouseVector.norm();
        this.pointVector = playerMouseVector;
        //console.log(playerMouseVector);
    }
    handleKeyDown(key:string){
        if(this.controls.scheme === MovementControlScheme.keyboard){
            switch(key){
                case 'w':
                    this.player.setVelocityY(-0.1);
                    break;
                case 'a':
                    this.player.setVelocityX(-0.1);
                    break;
                case 's':
                    this.player.setVelocityY(0.1);
                    break;
                case 'd':
                    this.player.setVelocityX(0.1);
                    break;
            }
        }
    }
    handleKeyUp(key:string){
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
        this.enemyHolder.update(frameSecs);

        this.collisions();
    }
    devDraw(cr:CanvasRenderingContext2D){
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

        this.teammates.forEach((pl) => pl.draw(cr));

        cr.strokeStyle = 'green';
        cr.lineWidth = 0.1;
        cr.beginPath();
        cr.moveTo(this.player.position.x, this.player.position.y);
        const dir = this.pointVector.copy();
        dir.multi(0.5);
        cr.lineTo(this.player.position.x+dir.x, this.player.position.y+dir.y);
        cr.stroke();

        this.projectiles.draw(cr);

        this.enemyHolder.draw(cr);

        this.viewArea.drawGrid(cr);
        this.devDraw(cr);
    }
    sendUpdates() : ShapeLandClientUpdate{
        //console.log(this.player.position);
        const updates = this.updates.obj(this.name);
        this.updates.clearUpdates();
        return {
            player: {name: this.name, position: this.player.position.arr()},
            projectiles: updates.projectiles
        }
    }
    serverUpdate(update:any){
        if('players' in update){
            //update pl type
            this.teammates = [];
            update.players.forEach((pl:any) => {
                const tm = new Teammate(pl.name);
                tm.position = new Point(pl.position[0], pl.position[1]);
                this.teammates.push(tm);
                //const slp = new SLPlayer();
                //slp.position = new Point(pl.position[0], pl.position[1]);
                //return slp;
            });
            //console.log(update.players);
            //this.teammates = teammates;
        }
        if('disconnects' in update){

        }
    }
}

class ShapeLandUpdates{
    projectiles: Projectile[];
    constructor(){
        this.projectiles = [];
    }
    addProjectiles(p:Projectile){
        this.projectiles.push(p);
    }
    clearUpdates(){
        this.projectiles = [];
    }
    obj(user:string){
        return {
            projectiles: this.projectiles.map((proj) => proj.clientUpdateObj(user))
        };
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


export class SLEntry{
    connectButton:CanvasButton;
    width: number;
    height: number;
    textBox: DrawTextInput;

    rot:number;
    constructor(width:number, height:number){
        this.connectButton = new CanvasButton(new Point(width/2, height/2), 80, 40) 
        this.connectButton.setText('Not Connected');
        this.connectButton.buttonColour = 'blue';
        this.width = width;
        this.height = height;
        this.textBox = new DrawTextInput(new Point(width/2 - 100, height/2 - 30), 100, 20);

        this.rot = 0;
    }
    onServerConnect(func:() => void){
        this.connectButton.buttonColour = 'blue';
        this.connectButton.setText('Join Game');
        this.connectButton.function = func;
    }
    serverDisconnect(){
        this.connectButton.setText('Not Connected');
        this.connectButton.buttonColour = 'red';
        this.connectButton.function = () => {};
    }
    mouseMove(pos:Point){
        this.connectButton.mouseMove(pos);
    }
    mouseDown(pos:Point){
        this.connectButton.mouseDown(pos);
        this.textBox.handleMouseDown(pos);
    }
    mouseUp(pos:Point){
        this.connectButton.mouseUp(pos);
        this.textBox.handleMouseUp(pos);
    }
    keyDown(e:KeyboardEvent){
        this.textBox.handleKeyDown(e);
    }
    draw(cr:CanvasRenderingContext2D):void{
        cr.clearRect(0, 0, this.width, this.height);
        cr.fillStyle = 'white';
        cr.fillText('still connecting', this.width-100, 10);
        this.connectButton.draw(cr);
        this.textBox.draw(cr);

        const v = new Vector2D(200, 400);
        const rv = v.copy();
        rv.rotate(this.rot);
        this.rot+=0.01;

        cr.strokeStyle = 'white';
        cr.beginPath();
        cr.moveTo(100, 100);
        cr.lineTo(100+v.x, 100+v.y);
        cr.moveTo(100, 100);
        cr.lineTo(100+rv.x, 100+rv.y);
        cr.stroke();
    }
}