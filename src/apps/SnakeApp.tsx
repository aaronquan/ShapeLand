import React, {MouseEventHandler, useLayoutEffect, useEffect, useState, useRef} from 'react';

import { 
    useMouseState, CanvasApp, 
    defaultMouseStateCreator, MouseState } from '../components/Canvas';
import { useAnim, InputChanges } from '../components/Anim';
import { useKeys } from '../hooks/Keys';
import { SnakeMain } from '../Snake/Screens/Main';
import { AnimTime } from '../game/time';
import { useWindowSize } from '../hooks/Window';

function SnakeApp():JSX.Element{
    const window = useWindowSize();
    const paddingX = 10; const paddingY = 40;
    //const width = window.width-10; const height = window.height-40;
    const [adjWindow, setAdjWindow] = useState({width: window.width-paddingX, height:window.height-paddingY});

    const main = useRef<SnakeMain>(new SnakeMain(adjWindow.width, adjWindow.height));
    const keys = useKeys(handleKeyDown, handleKeyUp);
    const rawMouseState = useRef<MouseState>(new MouseState());
    useEffect(() => {
        const nWidth = window.width-paddingX;
        const nHeight = window.height-paddingY;
        setAdjWindow({width: nWidth, height: nHeight});
        main.current.resize(nWidth, nHeight);
    }, [window]);
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
    function animationStep(cr:CanvasRenderingContext2D, time:number, 
        inputChanges:InputChanges, animTime:AnimTime):void{
            main.current.updateAnimTime(animTime);
            main.current.draw(cr);
    }

    return (
        <>
        <CanvasApp width={adjWindow.width} height={adjWindow.height} animationStep={animationStep} 
            mouseState={rawMouseState.current}
            onMouseMove={handleMouseMove} onLeftMouseDown={handleLeftMouseDown}
            onLeftMouseUp={handleLeftMouseUp}/>
        </>
    )
}


export default SnakeApp;