import { MouseEvent } from "react";
import { CanvasScreen } from "../../components/Canvas";
import { Point } from "../../game/geometry";
import { postServerQueryRequest, getServerQueryRequest } from "../../hooks/APICall";
import { CanvasButton, InteractableControl } from "../../canvas/controls";
import { TLRectangle } from "../../canvas/shapes";
import { DrawTextInput } from "../../canvas/text";

export class SnakeServerFinder implements CanvasScreen{
    backButton: CanvasButton;
    refreshButton: CanvasButton;
    createServerModalOpenButton: CanvasButton;

    //servers: SnakeServer[];
    screenWidth:number;
    screenHeight:number;

    //modal stuff (could put in another class) / create modal class
    showCreateServerModal: boolean;
    createServerModalArea: TLRectangle;
    createServerControls: InteractableControl[];

    testCreateServerButton: CanvasButton;
    testDeleteServerButton: CanvasButton;
    serverNameInput: DrawTextInput;

    servers: SnakeServer[];
    selectedServer: SnakeServer | null;

    controls: InteractableControl[];

    serverListHeight: number;
    padding: number;

    onJoinServer: (serverName:SnakeServer) => void;
    constructor(){
        this.padding = 50;
        this.backButton = new CanvasButton(new Point(10, 10), 50, 30, 'Back', undefined, 'red');
        this.refreshButton = new CanvasButton(new Point(80, 80), 50, 30, 'Refresh');
        this.refreshButton.setFunction(() => {
            this.findServers();
        });

        this.createServerModalOpenButton = new CanvasButton(new Point(150, 80), 50, 30, 'Create Server');
        this.createServerModalOpenButton.setFunction(() => {
            this.showCreateServerModal = true;
        });
        this.createServerModalArea = new TLRectangle(new Point(200, 200), 300, 300);

        this.serverNameInput = new DrawTextInput(new Point(300, 250), 100);

        this.testCreateServerButton = new CanvasButton(new Point(220, 250), 50, 30, 'Create Server');
        this.testCreateServerButton.setFunction(() => {
            this.createServer();
        });
        this.testDeleteServerButton = new CanvasButton(new Point(220, 330), 50, 30, 'Delete Server');
        this.testDeleteServerButton.setFunction(() => {
            this.deleteServer();
        });
        this.showCreateServerModal = false;

        this.screenWidth = 0;
        this.screenHeight = 0;

        this.servers = [];
        this.selectedServer = null;

        this.serverListHeight = 140;
        
        this.controls = [this.backButton, this.refreshButton, this.createServerModalOpenButton];
        this.createServerControls = [this.testCreateServerButton, this.testDeleteServerButton, this.serverNameInput];

        this.onJoinServer = () => {};
    }
    async findServers(){
        const req = await getServerQueryRequest(['getSnakeServers'], '/getSnakeLandServers', {},
        (data) => { 
            const serverList = data.servers;
            this.generateServers(serverList);
        });
    }

    async createServer(){
        const req = await postServerQueryRequest(['startSnakeLandServer'], '/startSnakeLandServer', {serverName: this.serverNameInput.text},
            null, 
            (data) => {
                const serverList = data.servers;
                this.generateServers(serverList);
            }
        );
    }

    async deleteServer(){
        const req = await postServerQueryRequest(['closeSnakeLandServer'], '/closeSnakeLandServer', {serverName: this.serverNameInput.text},
        null, 
        (data) => {
            const serverList = data.servers;
            this.generateServers(serverList);
        });
    }
    generateServers(serverList:any){
        this.servers = [];
        const serverButtonHeight = 50;
        serverList.forEach((serverInfo:SnakeServerInfo, i:number) => {
            const y = serverButtonHeight*i+this.serverListHeight;
            const newButton = new CanvasButton(new Point(100, y), 100, serverButtonHeight, serverInfo.name, 14, 'orange');
            const newServer = new SnakeServer(newButton, serverInfo);
            newButton.setFunction(() => {
                this.onJoinServer(newServer);
                //connect to server
            })
            this.servers.push(newServer);
        });
    }
    setBackButtonFunction(f:()=>void){
        this.backButton.setFunction(f);
    }
    onChangeScreen(){
        this.findServers();
    }
    resize(winX: number, winY: number): void {
        this.screenWidth = winX;
        this.screenHeight = winY;
    }
    mouseMove(e: MouseEvent<HTMLCanvasElement>, pos: Point): void {
        if(this.showCreateServerModal){
            this.createServerControls.forEach(control => control.mouseMove(pos));
        }else{
            this.controls.forEach((control) => {
                control.mouseMove(pos);
            });
            this.servers.forEach((server) => {
                server.button.mouseMove(pos);
            });
        }
    }
    mouseDown(e: MouseEvent<HTMLCanvasElement>, pos: Point): void {
        if(this.showCreateServerModal){
            if(!this.createServerModalArea.isInside(pos)){
                this.showCreateServerModal = false;
            }else{
                this.createServerControls.forEach(control => control.mouseDown(pos));
            }
        }else{
            this.controls.forEach((control) => {
                control.mouseDown(pos);
            });
            this.servers.forEach((server) => {
                server.button.mouseDown(pos);
            });
        }
    }
    mouseUp(e: MouseEvent<HTMLCanvasElement>, pos: Point): void {
        if(this.showCreateServerModal){
            this.createServerControls.forEach(control => control.mouseUp(pos));
        }else{
            this.controls.forEach((control) => {
                control.mouseUp(pos);
            });
            this.servers.forEach((server) => {
                server.button.mouseUp(pos);
            });
        }
    }
    keyDown(e: KeyboardEvent, key: string): void {
        this.createServerControls.forEach((control) => {
            if(control.keyDown) control.keyDown(e);
        })
    }
    keyUp(e: KeyboardEvent, key: string): void {
        //throw new Error("Method not implemented.");
    }
    draw(cr: CanvasRenderingContext2D): void {
        cr.fillStyle = 'grey';
        const dp = this.padding+this.padding;
        cr.fillRect(this.padding, this.padding, this.screenWidth-dp, this.screenHeight-dp);

        this.controls.forEach((control) => {
            control.draw(cr);
        });
        cr.fillText('Servers', this.screenWidth/2, 80);
        
        this.servers.forEach((server) => server.draw(cr));

        if(this.showCreateServerModal){
            cr.fillStyle = 'black';
            this.createServerModalArea.draw(cr);
            this.createServerControls.forEach(control => control.draw(cr));
        }
    }
}

//match type with server
export type SnakeServerInfo = {
    name: string;
    details: SnakeServerDetails;
}

type SnakeServerDetails = {
    players: string[];
    startTime: number;
    owner: string;
}

export class SnakeServer {
    button: CanvasButton;
    name:string;
    startTime: number;
    constructor(button: CanvasButton, snakeServerInfo:SnakeServerInfo){
        this.button = button;
        this.name = snakeServerInfo.name;
        this.startTime = snakeServerInfo.details.startTime;
    }
    draw(cr: CanvasRenderingContext2D): void {
        this.button.draw(cr);
    }
}