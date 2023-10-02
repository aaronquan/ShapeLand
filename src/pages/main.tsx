/** @jsxImportSource @emotion/react */
import React, {useState, useRef, useEffect, useMemo} from 'react';
import { css, jsx } from '@emotion/react';
import update from 'immutability-helper';
import { useQuery, QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { ServerStatus, queryClient } from '../scripts/apiCall';

import { Cookies, useCookies } from 'react-cookie';

import {Canvas, CanvasApp, MousePosition, MouseState, defaultMouseStateCreator, useMouseState} from '../components/Canvas';
import {Anim, InputChanges, useAnim} from '../components/Anim';

import { VirtCircle, Colour, Point } from '../game/shapes';
import { 
    useServerRequest, 
    useServerGetQueryRequest, 
    useServerPostQueryRequest, 
    getServerQueryRequest,
    postServerQueryRequest
} from '../hooks/APICall'; 

import { useTimedEvent } from '../hooks/Events';

import styles from '../css/styles';

import { TemplateModal } from '../components/Modals';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Styles from '../css/styles';
import { TimeRenderer } from '../components/Timer';
import { Server } from 'http';
import { render } from '@testing-library/react';
import { useKeys } from '../hooks/Keys';

import { OpenScreenSide } from '../components/Interface';
import { AppCard } from '../components/MainPageInterface';
import { TextInput } from '../components/Form';

import ShapeLandApp, { ShapeLandAppTypes } from '../apps/ShapeLand';
import { TimerTestPage, TimerQueryRequestTest } from '../apps/Tests';
import { AnimTime } from '../game/time';
import { ViewArea } from '../game/view';
import { GridArea } from '../game/grid';
import { TreeApp } from '../apps/Trees';

type ServerPing = {
    total: number;
    in: number;
    out: number;
}

type ServerAnalytics = {
    ping: ServerPing;
    status: number;
}

type ServerAnalyticsProps = ServerAnalytics & {
    onRefreshServer: ()=>void;
}

type PageAnalytics = {
    autoRefresh: boolean;
    connect: boolean;
    server: ServerAnalytics;
}

type PageUsers = {
    userId: number | null;
    userCount: number;
}

type baseProps = {

}

type C1Props = {

}

type C2Props = {

}

const applets = [
{name: 'ShapeLand', render: (props:ShapeLandAppTypes) => <ShapeLandApp {...props}/>},
{name: 'Trees', render: () => <TreeApp/>},
{name: 'Test', render: (props?:C1Props) => <C1 {...props}/>},
{name: 'Test2', render: (props?:C2Props) => <C2 {...props}/>},
{name: 'TimerTest', render: () => <TimerTestPage/>},
{name: 'TimerTest2', render: () => <TimerQueryRequestTest/>}
];

const serverStatus = [
    {colour: 'red'},
    {colour: 'green'},
    {colour: 'yellow'},
    {colour: 'grey'}
];

/*
type TextInputProps = {
    onBlur: (e:any) => void
}

function TextInput(props:TextInputProps){
    const [input, setInput] = useState('');
    function handleChange(e:any){
        console.log(e);
        setInput(e.target.value);
    }
    return(
        <Form.Control type='input' value={input} onChange={handleChange} onBlur={props.onBlur}/>
    );
}*/

export type User = {
    type:string;
    id:number;
    name:string|undefined; 
    active: boolean;
    expires: number;
}

//const queryClient = new QueryClient();

function MainPage(){
    //console.log('mainRender');
    const [userCookie, setUserCookie] = useCookies(['user']);
    const [pageState, setPageState] = useState(0);
    const [guests, setGuests] = useState<any[] | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [pageAnalytics, setPageAnalytics] = useState<PageAnalytics>({
        autoRefresh: true,
        connect: true,
        server: {
            ping: {total: 0, in: 0, out: 0}, status: 0
        }
    });
    //const serverConnect = useServerPostQueryRequest(['connect'], '/connect', userCookie.user, null, Infinity);
    const connected = useRef(false);
    const serverUserBody = {user: user};
    //const eventCount = useTimedEvent({time: 1000, function: handleRefreshServer, paused: !pageAnalytics.connect, variables: serverUserBody});
    const initialConnect = useRef(false);
    //console.log(user);
    /*useEffect(() => {
        
        if(serverConnect.status === 1 && !user){
            console.log(serverConnect.data);
            setUser(serverConnect.data.user);
            if(!guests){
                setGuests(serverConnect.data.guests);
            }
            if(!pageAnalytics.server.status) handleReq(serverConnect.data.serverTimes, 1);
        }else if(serverConnect.status === 3){
            console.log('not connected');
        }
        return () => {
            //testDisconnect();
        }
    }, [serverConnect]);*/

    useEffect(() => {
        if(!initialConnect.current) handleRefreshServer({user: user});
        initialConnect.current = true;
    }, []);

    useEffect(() => {
        window.addEventListener('unload', disconnectGuest);
        return () => {
            window.removeEventListener('unload', disconnectGuest);
        };
    }, [serverUserBody]);
    /*
    useEffect(() => {
        if(!pageAnalytics.connect){
            disconnectGuest();
            connected.current = false;
        }
    }, [pageAnalytics.connect]);
    */
    function disconnectGuest() {
        if (document.visibilityState === 'hidden') {
            console.log('hidden');
            const blob = new Blob([JSON.stringify(serverUserBody)], {type: 'application/json'});
            navigator.sendBeacon('http://localhost:3001/disconnect', blob);
        }
    }
    async function handleRefreshServer(variables:any){
        //console.log(variables);
        if(pageAnalytics.connect){
            let refUser = user;
            const check = await postServerQueryRequest(['check'], '/check', variables, null, /*callbacks here*/);
            //console.log(check);
            if(check.error){
                console.log('error on refresh');
                setPageAnalytics(update(pageAnalytics, {
                    server: {status: {$set: 0}}
                }));
                refUser = null;
                setUser(null);
            }else{
                if(check.server_status === ServerStatus.Online){
                    handleReq(check.data.serverTimes, 1);
                    setGuests(check.data.guests);
                    if(check.data.user){
                        setUser(check.data.user);
                        refUser = check.data.user;
                    }
                    //console.log(check.data);
                    connected.current = true;
                }
            }
            //console.log('calling check again - should be here');
            setTimeout(() => handleRefreshServer({user: refUser}), 1000);
        }
    }
    function refreshAnalytics(){
        handleRefreshServer(serverUserBody);
    }
    function handleReq(serverTimes: any, code?:number){
        //console.log(code);
        code = code ? code : 1;
        const now = Date.now();
        const fullPing = now - serverTimes.incoming;
        const out = now - serverTimes.outgoing;
        setPageAnalytics(update(pageAnalytics, {
            server: {
                $set: {
                    ping: {total: fullPing, in: serverTimes.ping_in, out: out}, 
                    status: code
                }
            }
        }));
    }   
    
    function handleAppClick(i:number){
        //return function(){
        setPageState(i);
        //}
    }
    /*
    function handleAutoRefresh(){
        setPageAnalytics(update(pageAnalytics, {
            autoRefresh: {$set: !pageAnalytics.autoRefresh}
        }));
    }
    
    function handleConnToggle(){
        if(pageAnalytics.connect){
            disconnectGuest();
        }else{
            handleRefreshServer({user: null});
        }
        setPageAnalytics(update(pageAnalytics, {
            connect: {$set: !pageAnalytics.connect}
        }));
    }*/
    async function handleInputName(e:any){
        if(user){
            const newUser:User = {...user};
            newUser.name = e.target.value;
            setUser(newUser);
            const rename = await postServerQueryRequest(['renameuser'], '/renameuser', {user: newUser});
            if(!rename.error){
                console.log(rename.query);
            }
        }

    }

    const [showRename, setShowRename] = useState(false);
    function handleShowRename(){
        setShowRename(true);
    }
    function handleCloseRename(){
        setShowRename(false);
    }
    return <>
        <div style={{position: 'absolute', top:0}}>
            <Button onClick={handleShowRename}>Rename</Button>
        </div>
        <TemplateModal show={showRename} onClose={handleCloseRename} title={'Rename'}
        body={<TextInput onBlur={handleInputName} limit={10}/>}/>

        <AnalyticsTab serverAnalytics={{...pageAnalytics.server, onRefreshServer: refreshAnalytics}} user={user} guests={guests}
        onInputName={handleInputName} />
        <SideAppList onAppClick={handleAppClick}/>
        <Button onClick={refreshAnalytics}>Test</Button>
        {/*<Button onClick={handleAutoRefresh} variant={pageAnalytics.autoRefresh ? 'danger' : 'primary'}>
            {pageAnalytics.autoRefresh ? 'Turn Auto Refresh Off' : 'Turn Auto Refresh On'}
        </Button>*/}
        {/*<Button onClick={handleConnToggle} variant={pageAnalytics.connect ? 'danger' : 'primary'}>
            {pageAnalytics.connect ? 'Disconnect' : 'Connect'}
        </Button>*/}
        {applets[pageState].render({user: user})}
    </>
}

type SideAppListProps = {
    onAppClick: (appNumber:number) => void;
}

function SideAppList(props:SideAppListProps){
    const [listOpen, setListOpen] = useState(false);
    function handleAppClick(i:number){
        return function(){
            props.onAppClick(i);
            setListOpen(false);
        }
    }
    const contents = <>
        {applets.map((app, i) => {
            return <AppCard key={i} title={app.name} text={''} onClick={handleAppClick(i)}/>
        })}
    </>
    const button = <span>Apps</span>;
    function handleToggleList(isOpen:boolean){
        setListOpen(isOpen);
    }
    return(
        <>
        <OpenScreenSide contents={contents} openButton={button} isOpen={listOpen}
        onToggle={handleToggleList}
        openDirection={'top'} left={0} top={0}/>
        </>
    );
}

type AnalyticsProps = {
    serverAnalytics: ServerAnalyticsProps;
    user: User | null;
    guests: any[] | null;
    onInputName: (e:any) => void;
}

function AnalyticsTab(props:AnalyticsProps){
    const [isOpen, setIsOpen] = useState(false);
    //const divRef = useRef<HTMLDivElement>(null);
    //const contentsRef = useRef<HTMLDivElement>(null);
    /*
    useEffect(() => {
        if(divRef.current){
            console.log(divRef.current.clientHeight);
            //divRef.current.clientHeight;
        }
    }, [divRef]);*/
    function toggleAnalytics(){
        setIsOpen(!isOpen)
    }
    //const top = isOpen ? (contentsRef.current ? -contentsRef.current.clientHeight : 0) : 0;
    const user = props.user;
    const guests = props.guests;
    const fs = 12;
    const contents = <>
        <div style={{fontSize: fs}}>
            <div>{user && (user.name ? user.name : user.type+user.id)}</div>
            <div>
                Guests Here:
                {guests && guests.map((guest:any, i:number) => {
                    return <div key={i}>{guest.name ? guest.name : 'guest'+guest.id}</div>;
                })}
            </div>
        <RenderServerAnalytics {...props.serverAnalytics}/>
        </div>
    </>
    return(
        <>
        {/*
        <div ref={divRef} style={{
            position: 'absolute', top: top, right: 0, 
            fontSize: 12, color: 'black', background: 'white',
            borderRadius: '4px'
        }}>
            <div ref={contentsRef}>
                {contents}
            </div>
            <div style={{cursor: 'pointer', borderTop: '1px solid black'}} onClick={toggleAnalytics}>Open</div>
        </div>
        */}
        <OpenScreenSide contents={contents} 
        openButton={<div style={{fontSize: fs}}>Open</div>} openDirection={'top'} top={0} right={0}/>
        </>
    );
}

function RenderServerAnalytics(props:ServerAnalyticsProps){
    return (
        <Styles.Flex>
            <div>
            Server Status  
            <Styles.Dot onClick={props.onRefreshServer} radius={12} colour={serverStatus[props.status].colour}/>
            </div>
            <div>
                <span>Ping:</span><span>{props.ping.total}</span>
            </div>
            <div>
                <span>In:</span><span>{props.ping.in}</span>
            </div>
            <div>
                <span>Out:</span><span>{props.ping.out}</span>
            </div>
        <div/>
        </Styles.Flex>
    );
}

class Boxes{
    boxes: boolean[];
    sel: number;
    constructor(){
       this.boxes = [true, false, false, false, false];
       this.sel = 0;
    }
    changeBox(i:number){
        this.boxes[this.sel] = false;
        this.sel = i;
        this.boxes[i] = true;
    }
    draw(cr:CanvasRenderingContext2D){
        cr.fillStyle = 'red';
        for(let j=0; j < 5; j++){
            if(this.boxes[j]) cr.fillRect(j*50, 0, 50, 50);
        }
    }
}

type Pos2DType = {
    x:number;
    y:number;
}

class DrawGrid{
    grid: number[][];
    elements: Pos2DType[];
    squareSize: number;
    x: number; y: number;
    colour:Colour;
    constructor(){
        this.grid = [];
        this.squareSize = 1;
        this.elements = [];
        this.x = 0; this.y = 0;
        this.colour = new Colour(0,0,0);
    }

    draw(cr:CanvasRenderingContext2D){
        //cr.fillStyle = this.colour.toString();
        cr.fillStyle = '#FF55FF';
        this.elements.forEach((ele) => {
            cr.fillRect(this.x+(ele.x*this.squareSize), this.y+(ele.y*this.squareSize), this.squareSize, this.squareSize);
        });
    }

    drawCell(cr:CanvasRenderingContext2D, pt:Point){
        cr.fillRect(this.x+(pt.x*this.squareSize), this.y+(pt.y*this.squareSize), this.squareSize, this.squareSize);
    }
}
type GridElement = {
    position: number[];
}

class SandSimClient{
    sand:number[][];
    walls:number[][];
    squareSize: number;
    x: number; y: number;

    mouseCell: Point | undefined;
    mouseLeftDownCell: Point | undefined;
    selectedArea:GridArea | undefined;
    dragArea:GridArea | undefined;

    wallAdds: number[][];
    wallRemoves: number[][];
    width: number;
    height: number;
    constructor(){
        this.squareSize = 1;
        this.sand = [];
        this.walls = [];
        this.x = 0; this.y = 0;

        this.mouseCell = undefined;
        this.mouseLeftDownCell = undefined;

        this.selectedArea = undefined;
        this.dragArea = undefined;

        //updates
        this.wallAdds = [];
        this.wallRemoves = [];

        this.width = 0;
        this.height = 0;
    }
    init(data:any){
        this.width = data.width;
        this.height = data.height;
    }
    drawCell(cr:CanvasRenderingContext2D, x:number, y:number){
        cr.fillRect(this.x+(x*this.squareSize), this.y+(y*this.squareSize), this.squareSize, this.squareSize);
    }
    drawArea(cr:CanvasRenderingContext2D, ga:GridArea){
        const ranges = ga.getRange();
        const dx = ranges.x[1] - ranges.x[0];
        const dy = ranges.y[1] - ranges.y[0];
        cr.fillRect(this.x+(ranges.x[0]*this.squareSize), this.y+(ranges.y[0]*this.squareSize), this.squareSize*dx, this.squareSize*dy);
    }
    draw(cr:CanvasRenderingContext2D){
        cr.fillStyle = '#FF55FF';
        this.sand.forEach((ele) => {
            this.drawCell(cr, ele[0], ele[1]);
            //cr.fillRect(this.x+(ele[0]*this.squareSize), this.y+(ele[1]*this.squareSize), this.squareSize, this.squareSize);
        });
        if(this.mouseCell){
            cr.fillStyle = 'red';
            this.drawCell(cr, this.mouseCell.x, this.mouseCell.y);
            //cr.fillRect(this.x+(this.mouseCell.x*this.squareSize), this.y+(this.mouseCell.y*this.squareSize), this.squareSize, this.squareSize);
        }

        cr.fillStyle = 'black';
        this.walls.forEach((wall) => {
            this.drawCell(cr, wall[0], wall[1]);
        });

        cr.fillStyle = '#33DD3366';
        if(this.dragArea){
            /*
            this.dragArea.getCells().forEach((cell) => {
                this.drawCell(cr, cell.x, cell.y);
            });*/
            this.drawArea(cr, this.dragArea);
        }

        cr.strokeStyle = '#DDDDDD';
        cr.lineWidth = 0.5;
        cr.strokeRect(this.x, this.y, this.width, this.height);
    }
    updateData(data:any){
        if(data.objects){
            this.sand = data.objects.sand;
            this.walls = data.objects.walls;
        }
    }
    mouseDown(pt:Point){
        this.dragArea = new GridArea();
        this.dragArea.setP1(pt);
        this.dragArea.setP2(pt);
        this.mouseLeftDownCell = pt;
    }
    dragTo(pt:Point){
        if(this.dragArea) this.dragArea.setP2(pt);
    }
    mouseUp(pt:Point){
        this.selectedArea = new GridArea();
        if(this.dragArea){ 
            this.selectedArea.copy(this.dragArea);
            const points = this.dragArea.getCells();
            this.wallAdds = this.wallAdds.concat(points.map((pt) => pt.arr()));
        }
        this.mouseLeftDownCell = undefined;
        this.dragArea = undefined;
    }
    addWall(pt:Point){
        this.wallAdds.push([pt.x, pt.y]);
    }

    getInputUpdates(){
        return {
            wallAdds: [...this.wallAdds],
            wallRemoves: this.wallRemoves,
            clear: [],
        }
    }
    clearInputUpdates(){
        this.wallAdds = [];
        this.wallRemoves = [];
    }
}

function C1(){
    //console.log('render c1');
    const width = 800; const height = 500;
    const renderer = useRef<CanvasRenderingContext2D | null>(null);

    //const {mouseState:rawMouseState, handleMouseMove, 
    //    handleLeftMouseDown, handleLeftMouseUp, handleWheel} = useMouseState();
    //const {animTime} = useAnim(renderer.current, animationStep, rawMouseState);
    const {mouseState:mouseState, handleMouseMove, 
        handleLeftMouseDown, handleLeftMouseUp, handleWheel} = useMouseState();
    const rawMouseState = useRef<MouseState>(new MouseState());
    const grid = useRef<DrawGrid>(new DrawGrid());
    const simClient = useRef<SandSimClient>(new SandSimClient());

    const {keys} = useKeys(handleKeyDown);

    const viewArea = useRef<ViewArea>(new ViewArea(width, height));
    const connectServer = useRef(true);

    const tickPeriod = 32;
    const tickTime = useRef(0);
    const lastTime = useRef(Date.now());
    const [updateTime, setUpdateTime] = useState(0);
    

    const mouseDownPoint = useRef(null);

    const preLevels = 10;
    const areaLevel = useRef(preLevels);
    const levels = useRef<Area2D[]>([]);

    const serverConnect = useServerGetQueryRequest(['sandsimconnect'], '/sandsimconnect', {}, Infinity);
    const connected = useRef(false);
    useEffect(() => {
        if(serverConnect.status === 1 && !connected.current){
            const data = serverConnect.data;
            viewArea.current.initArea(data.width);
            levels.current = viewArea.current.areaLevels(30, 1.2, preLevels);
            connected.current = true;
            //console.log(serverConnect);
        }else if(serverConnect.status === 0) {
            //console.log('area');
            //viewArea.current.initArea(20);
            //levels.current = viewArea.current.areaLevels(30, 1.2, preLevels);
        }
    }, [serverConnect]);

    function cb(data:any){
        //console.log(data);
        simClient.current.updateData(data);
    }

    async function animationStep(cr:CanvasRenderingContext2D, time:number, inputChanges?:InputChanges, animTime?:AnimTime){
        //console.log(animTime);
        if(animTime) tickTime.current += animTime.frameTime;
        if(tickTime.current > tickPeriod){
            if(connectServer.current){
                const updates = simClient.current.getInputUpdates();
                //const nextFrame = await getServerQueryRequest(['ot5'], '/sandsim');
                const now = Date.now();
                const nextFrame = postServerQueryRequest(['ot5'], '/sandsim', {updates: updates}, null, 
                cb);

                simClient.current.clearInputUpdates();
            }
            tickTime.current = tickTime.current % tickPeriod;
        }
        if(inputChanges){
            if(rawMouseState.current.leftDown){
                const currentCell = simClient.current.mouseCell;
                if(keys.has('Control')){
                    const translate = viewArea.current.scalePoint(inputChanges.mouseMovement.negPoint());
                    viewArea.current.translate(translate);
                }
                else if(currentCell){
                    simClient.current.dragTo(currentCell);

                }
            }
            if(inputChanges.mouseScroll !== 0){
                areaLevel.current -= inputChanges.mouseScroll;
                if(areaLevel.current >= levels.current.length){
                    areaLevel.current = levels.current.length - 1;
                }else if(areaLevel.current < 0){
                    areaLevel.current = 0;
                }
                if(levels.current.length > 0){  
                    const level = levels.current[areaLevel.current];
                    viewArea.current.setArea(level.width, level.height);
                }
            }
        }
        viewArea.current.clearViewArea(cr);
        viewArea.current.drawGrid(cr);
        viewArea.current.setTransformation(cr);
        simClient.current.draw(cr);

    }
    function handleInit(cr:CanvasRenderingContext2D){
        viewArea.current.initArea(100);
        //viewArea.current.
        renderer.current = cr;
    }
    function handleReset(){
        const s = getServerQueryRequest([], '/resetsim');
    }
    function leftMouseDownInput(e: React.MouseEvent<HTMLCanvasElement>){
        //rawMouseState
        const areaPoint:Point = viewArea.current.canvasToAreaCoord(rawMouseState.current.position);
        areaPoint.floor();
        if(e.shiftKey){
            simClient.current.mouseDown(areaPoint);
            //simClient.current.addWall(areaPoint);
        }
        //cell.current = areaPoint;
        handleLeftMouseDown(e);
    }
    function leftMouseUpInput(e: React.MouseEvent<HTMLCanvasElement>){
        const areaPoint:Point = viewArea.current.canvasToAreaCoord(rawMouseState.current.position);
        areaPoint.floor();
        simClient.current.mouseUp(areaPoint);
        if(e.shiftKey){
            //simClient.current.dragArea();
            //simClient.current.addWall();
        }
        handleLeftMouseUp(e);
    }
    function mouseMoveInput(e: React.MouseEvent<HTMLCanvasElement>, canvas:HTMLCanvasElement){
        const areaPoint:Point = viewArea.current.canvasToAreaCoord(rawMouseState.current.position);
        areaPoint.floor();
        //cell.current = areaPoint;
        simClient.current.mouseCell = areaPoint;

        handleMouseMove(e, canvas);
    }
    function handleKeyDown(e:KeyboardEvent){
        //console.log(e.key);
        switch(e.key){
            case 'Shift':
                break;
        }
    }
    return <>
    <span style={{fontSize: 15}}>App1</span>
    <Button onClick={handleReset}>Reset</Button><span>Update Time: {updateTime}</span>
    {/*<Canvas onInit={handleInit} width={width} height={height} onMouseMove={mouseMoveInput} onWheel={handleWheel}
    onLeftMouseDown={leftMouseDownInput} onLeftMouseUp={handleLeftMouseUp}/>*/}
    <CanvasApp width={width} height={height} onMouseMove={mouseMoveInput} onWheel={handleWheel}
    onLeftMouseDown={leftMouseDownInput} onLeftMouseUp={leftMouseUpInput} animationStep={animationStep} mouseState={rawMouseState.current}/>
    {/*<Anim animationStep={animationStep} width={width} height={height}/>*/}
    </>
}

class TriangleGrid{
    rows:number;
    width:number;
    height:number;
    constructor(r:number, wid:number){
        this.rows = r;
        this.width = wid;
        this.height =  Math.sqrt(3) / 2 * wid;
    }

    draw(cr:CanvasRenderingContext2D){
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col <= this.rows; col++) {
                // Calculate the x and y coordinates of the top vertex of each triangle
                const xShift = row % 2 ? this.width / 2 : 0;
                const x = col * this.width + (100 + xShift);
                const y = row * this.height;

                // Draw an equilateral triangle
                cr.beginPath();
                cr.moveTo(x, y);
                if(row % 2 === 0){
                    cr.lineTo(x + this.width, y);
                    cr.lineTo(x + this.width / 2, y + this.height);
                }else{
                    cr.lineTo(x - this.width / 2, y + this.height);
                    cr.lineTo(x + this.width / 2, y + this.height);
                }
                cr.closePath();

                // Fill the triangle with a color
                cr.strokeStyle = 'white';
                cr.stroke();
            }
        }
    }
}
class TriangleGrid2{
    w:number;
    h:number;
    triW:number;
    sq3:number;
    lw:number; //line width for drawing
    constructor(w:number, h:number, tw:number, lw:number=1){
        this.w = w;
        this.h = h;
        this.triW = tw;
        this.sq3 = Math.sqrt(3);
        this.lw = lw;
    }
    draw(cr:CanvasRenderingContext2D){
        cr.strokeStyle = 'white';
        cr.lineWidth = this.lw;
        let x = 0;
        const nx = this.h / this.sq3;
        //lines left to right from top
        while(x <= this.w){
            cr.beginPath(); 
            cr.moveTo(x, 0);
            cr.lineTo(nx+x, this.h);
            cr.closePath();
            cr.stroke();
            x += this.triW;
        }
        //lines right to left from top
        x = this.triW;
        while(-nx+x < this.w){
            cr.beginPath();
            cr.moveTo(x, 0);
            cr.lineTo(-nx+x, this.h);
            cr.closePath();
            cr.stroke();
            x += this.triW;
        }
        let y = 0;
        while(y <= this.h){
            cr.beginPath(); 
            cr.moveTo(0, y);
            cr.lineTo(this.w, y); 
            cr.closePath();
            cr.stroke();
            y += (this.sq3 / 2) * this.triW;
        }
        y = this.sq3 * this.triW;
        while(y < this.h){
            cr.beginPath(); 
            cr.moveTo(0, y);
            const nx = (this.h - y) / this.sq3;
            cr.lineTo(nx, this.h); 
            cr.closePath();
            cr.stroke();
            y += this.sq3 * this.triW;
        }
    }
}

class Position2D{
    x:number;
    y:number;
    constructor(x?:number, y?:number){
        this.x = x ? x : 0;
        this.y = y ? y : 0;
    }
    add(pos:Position2D){
        this.x = this.x + pos.x;
        this.y = this.y + pos.y;
    }
}

type Area2D = {
    width:number;
    height:number;
}

function C2(){
    const renderer = useRef<CanvasRenderingContext2D | null>(null);
    const width = 800; const height = 500;
    const viewArea = useRef(new ViewArea(width, height));
    //viewArea.current.setArea(5, 5);
    //const triangles = useRef<TriangleGrid>(new TriangleGrid(10,20));
    const triangles = useRef<TriangleGrid2>(new TriangleGrid2(width, height, 15));
    const keys = useKeys(handleKeyDown);
    //const mouseState = useRef<MouseState>({position: new Point(0, 0), leftDown: false});
    const [areaMouse, setAreaMouse] = useState<Point>(new Point());
    const {mouseState:mouseState, handleMouseMove, 
        handleLeftMouseDown, handleLeftMouseUp, handleWheel} = useMouseState();
    const rawMouseState = useRef<MouseState>(new MouseState());

    const preLevels = 5;
    const areaLevel = useRef(preLevels);
    const levels = useRef<Area2D[]>([]);

    //console.log('render c2');
    useEffect(() => {
        viewArea.current.initArea(5);
        levels.current = viewArea.current.areaLevels(20, 1.2, preLevels);
        //triangles.current = new TriangleGrid2(width, height, 15);
        drawMain();
    }, [renderer]);

    function drawMain(){
        if(renderer.current){
            renderer.current.setTransform(1, 0, 0, 1, 0, 0);
            renderer.current.clearRect(0, 0, width, height);
            //triangles.current.draw(renderer.current);
        }
        renderRectangle();
    }
    function animationStep(cr:CanvasRenderingContext2D, time:number, inputChanges?:InputChanges){

        //mouse drag camera and mouse wheel zooming
        //console.log(inputChanges);
        //const rawMouseState:MouseState = rawMouseState.current;
        if(inputChanges){
            if(rawMouseState.current.leftDown){
                const translate = viewArea.current.scalePoint(inputChanges.mouseMovement);
                viewArea.current.translate(translate);
            }
            if(inputChanges.mouseScroll !== 0){
                //console.log(inputChanges.mouseScroll);
                areaLevel.current -= inputChanges.mouseScroll;
                if(areaLevel.current >= levels.current.length){
                    areaLevel.current = levels.current.length - 1;
                }else if(areaLevel.current < 0){
                    areaLevel.current = 0;
                }
                const level = levels.current[areaLevel.current];
                //console.log(areaLevel.current);
                viewArea.current.setArea(level.width, level.height);
            }
        }
        if(renderer.current){
            drawMain();
            renderer.current.fillStyle = 'white';
            if(inputChanges){
                renderer.current.fillText(inputChanges.mouseMovement.toString(), 300, 10);
            }
            renderer.current.fillText(rawMouseState.current.positionString(), 10, 10);
            const areaCoords = viewArea.current.canvasToAreaCoord(rawMouseState.current.position);
            renderer.current.fillText(areaCoords.toString(), 120, 10);
        }
        //frameMouseState.current.position = rawMouseState.position;
    }
    function renderRectangle(){
        //viewArea.current.setArea(5, 5);
        if(renderer.current){
            renderer.current.setTransform(1, 0, 0, 1, 0, 0);
            renderer.current.clearRect(0, 0, width, height);
            viewArea.current.setTransformation(renderer.current);
            renderer.current.fillStyle = 'black';
            renderer.current.fillRect(1, 1.5, 2, 2);
            viewArea.current.drawGrid(renderer.current);
            //console.log(viewArea.translate);
            //console.log(viewArea.)
        }
    }
    function handleInit(cr:CanvasRenderingContext2D){
        renderer.current = cr;
    }
    function handleKeyDown(e:KeyboardEvent){
        console.log(e.key);
        switch(e.key){
            case 'z':
                //viewArea.current.addArea(2);
                if(areaLevel.current + 1 < levels.current.length) areaLevel.current += 1;
                break;
            case 'x':
                //viewArea.current.addArea(-2);xxxzz
                if(areaLevel.current - 1 >= 0) areaLevel.current -= 1;
                break;
        }
        const level = levels.current[areaLevel.current];
        console.log(areaLevel.current);
        viewArea.current.setArea(level.width, level.height);
        renderRectangle();
    }
    function handleRefresh(){
        if(renderer.current){
            renderer.current.clearRect(0, 0, width, height);
            triangles.current.draw(renderer.current);
        }
    }
    return <>{<CanvasApp onInit={handleInit} onMouseMove={handleMouseMove}
    onLeftMouseDown={handleLeftMouseDown} onLeftMouseUp={handleLeftMouseUp}
    onWheel={handleWheel} mouseState={rawMouseState.current} animationStep={animationStep}
    width={width} height={height}/>}
    {<div>Point: {areaMouse.x.toFixed(2)}, {areaMouse.y.toFixed(2)}</div>}
    {/*<Button onClick={handleRefresh}>Refresh</Button>*/}
    </>
}

export default MainPage;