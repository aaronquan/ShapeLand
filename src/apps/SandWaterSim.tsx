import React, {MouseEventHandler, useLayoutEffect, useEffect, useState, useRef} from 'react';
import { SandSim } from '../game/phys';
import { useWindowSize } from '../hooks/Window';
import { CanvasApp, MouseState } from '../components/Canvas';
import { useKeys } from '../hooks/Keys';
import { InputChanges } from '../components/Anim';
import { AnimTime } from '../game/time';
import { IntegerRange } from '../math/Ranges';

type SameWaterSimTypes = {

}
export function SandWaterSim(){
    const desktopWindow = useWindowSize();
    const paddingX = 10; const paddingY = 40;
    const sim = useRef(new SandSim(300,250));
    const [adjWindow, setAdjWindow] = useState({
        width: desktopWindow.width-paddingX, height:desktopWindow.height-paddingY
    });
    const keys = useKeys(handleKeyDown, handleKeyUp);
    const rawMouseState = useRef<MouseState>(new MouseState());
    const xRange = useRef(new IntegerRange(0, sim.current.width));
    useEffect(() => {
        //sim.current.setGrid(50, 0, 2);
        //sim.current.setGrid(100, 0, 3);
        sim.current.setGridArea(70, 300, 20, 1);
        sim.current.setGridArea(95, 20, 21, 1);
        sim.current.setGridArea(95, 15, 1, 5);
        sim.current.setGridArea(115, 15, 1, 5);
    }, []);
    useEffect(() => {
        const nWidth = desktopWindow.width-paddingX;
        const nHeight = desktopWindow.height-paddingY;
        setAdjWindow({width: nWidth, height: nHeight});
        //sim.current.resize(nWidth, nHeight);
    }, [desktopWindow]);
    function handleMouseMove(e:React.MouseEvent<HTMLCanvasElement>){
        //main.current.mouseMove(e, rawMouseState.current.position);
    }
    function handleLeftMouseDown(e:React.MouseEvent<HTMLCanvasElement>){
        //main.current.mouseDown(e, rawMouseState.current.position);
    }
    function handleLeftMouseUp(e:React.MouseEvent<HTMLCanvasElement>){
        //main.current.mouseUp(e, rawMouseState.current.position);
    }
    function handleKeyDown(e:KeyboardEvent){
        //console.log(sim.current.grid);
        //main.current.keyDown(e, e.key);
        if(e.key === 'q'){
            sim.current.toggleView();
        }
    }
    function handleKeyUp(e:KeyboardEvent){
        //main.current.keyUp(e, e.key);
    }
    function animationStep(cr:CanvasRenderingContext2D, time:number, 
        inputChanges:InputChanges, animTime:AnimTime):void{
            sim.current.setGrid(50, 0, 2);
            sim.current.setGrid(100, 0, 3);
            const rands = xRange.current.getNUniqueRandom(10);
            console.log(rands);
            rands.forEach((r) => {
                sim.current.setGrid(r, 0, 3);
            })
            cr.clearRect(0, 0, desktopWindow.width, desktopWindow.height);
            //cr.fillStyle = 'white';
            //cr.fillRect(0, 0, desktopWindow.width, desktopWindow.height);
            sim.current.tick();
            sim.current.draw(cr);
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