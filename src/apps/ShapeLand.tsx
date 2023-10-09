import React, {MouseEventHandler, useEffect, useState, useRef} from 'react';

import { 
    useServerRequest, 
    useServerGetQueryRequest, 
    useServerPostQueryRequest, 
    getServerQueryRequest,
    postServerQueryRequest
} from '../hooks/APICall'; 

import { 
    ShapeLandClientUpdate, 
    ShapeLandGame 
} from '../ShapeLand/ShapeLand';
import { SLMain } from '../ShapeLand/Screens/Main';
import { SLEntry } from '../ShapeLand/Screens/Entry';
import { 
    useMouseState, CanvasApp, 
    defaultMouseStateCreator, MouseState } from '../components/Canvas';
import { useAnim, InputChanges } from '../components/Anim';
import { useKeys } from '../hooks/Keys';

import { BasicTree, Line, RandomLinePath} from '../ShapeLand/Mechanics/TreeGraphics';
import { Point } from '../game/shapes';
import { CenterPointRectangle } from '../ShapeLand/Mechanics/Shapes';
import { User } from '../pages/main';
import { CanvasButton } from '../canvas/controls';
import { AnimTime } from '../game/time';

export type ShapeLandAppTypes = {
    user: User | null;
}

type ShapeLandClientUpdateSend = {
    user: User | null;
    updates: ShapeLandClientUpdate;
}

export function ShapeLandApp(props:ShapeLandAppTypes) : JSX.Element{
    const width = 800; const height = 600;
    //const renderer = useRef<CanvasRenderingContext2D | null>(null);
    const main = useRef<SLMain>(new SLMain(width, height));
    const game = useRef<ShapeLandGame>(new ShapeLandGame());
    const keys = useKeys(handleKeyDown, handleKeyUp);
    const rawMouseState = useRef<MouseState>(new MouseState());
    //const shapeLandConnect = useServerPostQueryRequest(['connectShapeLand'], '/connectShapeLand', props.user, null, Infinity);
    const connected = useRef(false);
    //const connectButton = useRef(new CanvasButton(new Point(width/2, height/2), 80, 40));
    const connectedUser = useRef<User | null>(null);
    const startScreen = useRef<SLEntry>(new SLEntry(width, height));

    const serverTick = 32;
    const cTime = useRef(0);
    //console.log(connected);
    useEffect(() => {
        if(connected.current){
            window.addEventListener('unload', disconnectShapeLand);
        }
        return () => {
            if(connected.current){
                //disconnectShapeLand();
                window.removeEventListener('unload', disconnectShapeLand);
            }
        }
    }, [connected.current]);

    useEffect(() => {
        if(props.user && !connected.current) {
            //connectButton.current.text = 'Join Game';
            /*connectButton.current.function = () => {
                connectShapeLand();
            };*/
            //connectShapeLand();
            startScreen.current.onServerConnect(() => {
                connectShapeLand();
            });
            connectedUser.current = props.user;
            //console.log(props.user);
        }else{
            startScreen.current.serverDisconnect();
        }
    }, [props.user]);
    function disconnectShapeLand(){
        console.log('disconnecting from shapeland');
        //if (document.visibilityState === 'hidden') {
        //console.log('hidden');
        const blob = new Blob([JSON.stringify({user: props.user})], {type: 'application/json'});
        navigator.sendBeacon('http://localhost:3001/disconnectShapeLand', blob);
        connected.current = false;
        //postServerQueryRequest(['disconnectShapeLand'], '/disconnectShapeLand', {user: props.user}, null);
    }

    //put this function in SLMain
    async function connectShapeLand(){
        if(!connected.current){
            const connect = await postServerQueryRequest(['connectShapeLand'], '/connectShapeLand', {user: props.user}, null,
            );
            if(connect.server_status === 1){
                console.log(connect.data);
                connected.current = true;

                game.current.initialise(width, height, connect.data);
            }
        }
    }
    function syncGame(data:any){
        //console.log(data);
        game.current.serverUpdate(data.game, data.serverTimes);
    }
    function errorGame(d:any){
        console.log(d);
        //game.current.errorGame();
        connected.current = false; // temporary, have a timeout
    }
    function offlineGame(d:any){
        console.log(d);
        connected.current = false; // temporary, have a timeout
    }
    function animationStep(cr:CanvasRenderingContext2D, time:number, 
        inputChanges:InputChanges, animTime:AnimTime):void{
        //console.log(animTime);
        cTime.current += animTime.frameTime;

        main.current.draw(cr);
        main.current.update(rawMouseState.current, animTime.frameTime);
        if(!connected.current){
            //startScreen.current.draw(cr);
            
        }else{
            //game.current.update(rawMouseState.current, animTime.frameTime);
            //game.current.draw(cr);

            //send updates / receive server updates
            if(cTime.current > serverTick){
                if (document.visibilityState !== 'hidden') {
                    const clientUpdates:ShapeLandClientUpdateSend = {
                        user: connectedUser.current, 
                        updates: {...main.current.game.sendUpdates()}
                    };
                    const send = postServerQueryRequest(['shapeLandServer'], '/shapeLandServer', clientUpdates, null, 
                    syncGame, errorGame, offlineGame);
                }
                cTime.current -= serverTick;
            }
            //console.log(send);
        }
    }
    function handleMouseMove(e:React.MouseEvent<HTMLCanvasElement>){
        main.current.mouseMove(e, rawMouseState.current.position);
    }
    function handleLeftMouseDown(e:React.MouseEvent<HTMLCanvasElement>){
        main.current.mouseDown(e, rawMouseState.current.position);
    }
    function handleLeftMouseUp(e:React.MouseEvent<HTMLCanvasElement>){
        main.current.mouseUp(e, rawMouseState.current.position);
    }
    function handleKeyDown(e:KeyboardEvent){
        main.current.keyDown(e, e.key);
    }
    function handleKeyUp(e:KeyboardEvent){
        main.current.keyUp(e, e.key);

    }
    //use canvas app JSX based on test apps created with interactive elements
    return(
        <>
        {
            <CanvasApp width={width} height={height} animationStep={animationStep} 
            mouseState={rawMouseState.current}
            onMouseMove={handleMouseMove} onLeftMouseDown={handleLeftMouseDown}
            onLeftMouseUp={handleLeftMouseUp}/>
        }
        </>
    );
}

export default ShapeLandApp;