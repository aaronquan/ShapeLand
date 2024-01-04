import React, {MouseEventHandler, useEffect, useState, useRef} from 'react';
import { useMouseState, CanvasApp, defaultMouseStateCreator, MouseState } from '../components/Canvas';
import { useAnim, InputChanges } from '../components/Anim';

import { BasicTree, Line, RandomLinePath } from '../ShapeLand/Mechanics/TreeGraphics';
import { CanvasSlider, CanvasButton } from '../canvas/controls';
import { Point } from '../game/geometry';
import { CenterPointRectangle } from '../canvas/shapes';

export function TreeApp() : JSX.Element{
    const width = 800; const height = 600;
    const tree = useRef<BasicTree>(new BasicTree(new Point(250, 50), 10, 50, 0.9, 0.5));
    const treeSlider = useRef<CanvasSlider>(new CanvasSlider(
        new CenterPointRectangle(new Point(300, 500), 30, 40),
        100, new Point(300, 500)
    ));
    const treeSlider2 = useRef<CanvasSlider>(new CanvasSlider(
        new CenterPointRectangle(new Point(300, 450), 30, 40),
        100, new Point(300, 450)
    ));
    const treeSlider3 = useRef<CanvasSlider>(new CanvasSlider(
        new CenterPointRectangle(new Point(300, 400), 30, 40),
        100, new Point(300, 400)
    ));
    const button = useRef<CanvasButton>(new CanvasButton(new Point(300, 350), 30,30));
    const treeValue = useRef<Number>(0);

    const rb = useRef<RandomLinePath>(new RandomLinePath(
        new Point(50, 50), new Point(200, 200), 60, 6
        ));
    const lines = useRef<Line[]>([]);

    const rawMouseState = useRef<MouseState>(new MouseState());

    useEffect(() => {
        button.current.setFunction(() => console.log('click'));
        button.current.text = 'Click me';
        lines.current = rb.current.generateLines();
    }, [])
    function animationStep(cr:CanvasRenderingContext2D, time:number, inputChanges?:InputChanges):void{
        cr.clearRect(0, 0, width, height);
        let change = false;
        if(tree.current.rad !== treeSlider.current.slideValue){
            tree.current.rad = treeSlider.current.slideValue;
            change = true;
        }
        if(tree.current.branchLenMulti !== treeSlider2.current.slideValue){
            tree.current.branchLenMulti = treeSlider2.current.slideValue;
            change = true;
        }
        const rec = Math.floor(treeSlider3.current.slideValue*10);
        if(tree.current.branchRecursions !== rec){
            tree.current.branchRecursions = rec;
            change = true;
        }
        if(change){
            tree.current.getLines();
        }
        tree.current.draw(cr);
        treeSlider.current.draw(cr);
        treeSlider2.current.draw(cr);
        treeSlider3.current.draw(cr);
        button.current.draw(cr);
        lines.current.forEach(l => l.draw(cr));

    }

    function handleMouseMove(e:React.MouseEvent<HTMLCanvasElement>){
        treeSlider.current.mouseMove(rawMouseState.current.position);
        treeSlider2.current.mouseMove(rawMouseState.current.position);
        treeSlider3.current.mouseMove(rawMouseState.current.position);
    }
    function handleLeftMouseDown(e:React.MouseEvent<HTMLCanvasElement>){
        treeSlider.current.mouseDown(rawMouseState.current.position);
        treeSlider2.current.mouseDown(rawMouseState.current.position);
        treeSlider3.current.mouseDown(rawMouseState.current.position);
        button.current.mouseDown(rawMouseState.current.position);
    }
    function handleLeftMouseUp(e:React.MouseEvent<HTMLCanvasElement>){
        treeSlider.current.mouseUp(rawMouseState.current.position);
        treeSlider2.current.mouseUp(rawMouseState.current.position);
        treeSlider3.current.mouseUp(rawMouseState.current.position);
        button.current.mouseUp(rawMouseState.current.position);
    }

    return(
        <CanvasApp width={width} height={height} animationStep={animationStep} 
            mouseState={rawMouseState.current}
            onMouseMove={handleMouseMove} onLeftMouseDown={handleLeftMouseDown}
            onLeftMouseUp={handleLeftMouseUp}/>
    );
}