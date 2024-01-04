import { getServerQueryRequest, postServerQueryRequest } from "../../hooks/APICall";
import { SnakeServer, SnakeServerInfo } from "../Screens/ServerFinder";
import { AutoSnake } from "./AutoSnake";


export type SnakeSendPlayerData = SnakeUpdateData & {
    //position: number[];
    //rotation: number;
    playerName: string;
    disconnected?: boolean;
}

//data to send to server
export type SnakeUpdateData = {
    position: number[];
    rotation: number;
    bodyHistory: SnakeBodyData[];
    size?: number;
}

export type SnakeBodyData = {
    position: number[];
    rotation: number;
}

//this data is recieved here from the server
export type ReceiveUpdateSnakeData = {
    lastUpdated: number;
    snakePlayerData: SnakeSendPlayerData[],
    serverInfo: SnakeServerInfo,
    success: boolean;
}

export class SnakeGameUpdater{
    lastUpdated:number;
    onReceiveData: (data:ReceiveUpdateSnakeData) => void;
    constructor(){
        this.lastUpdated = Date.now();
        this.onReceiveData = () => {};
    }
    receiveServerData(data: ReceiveUpdateSnakeData){
        this.onReceiveData(data);
        //if(data.lastUpdated > this.lastUpdated) this.onReceiveData(data);
    }
    requestServer(server: SnakeServer, snake: AutoSnake, playerName: string){
        const playerData = snake.getUpdateData();
        //console.log(playerData);
        postServerQueryRequest(['updateGetSnakeLandServer'], '/updateGetSnakeLandServer', 
        {serverName: server.name, playerName: playerName, 
            playerData: playerData}, null,
        (data:ReceiveUpdateSnakeData) => {
            //console.log(data);
            if(data.success){
                this.receiveServerData(data);
                this.lastUpdated = Date.now();
            }
        });
    }
}
