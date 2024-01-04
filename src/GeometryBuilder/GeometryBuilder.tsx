import { MouseEvent } from "react";
import { CanvasScreen, MouseState } from "../components/Canvas";
import { Colour, Point, Vector2D, VirtCircle, VirtLine, VirtLineSegment, VirtPolygon } from "../game/geometry";
import { ViewArea } from "../game/view";
import { AnimTime } from "../game/time";
import { InputChanges } from "../components/Anim";
import { AdjustLine, BaseLine, BaseTriangle, IsoscelesTrapezium, ResizeCircle, 
    ResizeRectangle, ResizeTriangle, TLRectangle } from "../canvas/shapes";
import { DragShape, HoverShape, InteractableControl } from "../canvas/controls";
import { KeyState } from "../hooks/Keys";
import { DrawTextInput } from "../canvas/text";

export class GeometryBuilder implements CanvasScreen{
    width:number;
    height:number;
    viewArea: ViewArea;

    viewMousePoint: Point;

    testShape: HoverShape;
    ts2: IsoscelesTrapezium;
    shapeColour: string;

    controls:GeometryBuilderControls;
    //hoverShapeColour: string;
    circleAdjuster: ResizeCircle;
    rectAdjuster: ResizeRectangle;


    triangleColour: string;
    triangle: ResizeTriangle;
    adjLine: AdjustLine;

    virtLine: VirtLine;
    lineFromVirt: BaseLine | null;

    gradientInput: DrawTextInput;
    interceptInput: DrawTextInput;

    polygon: VirtPolygon;

    windowInteractives: InteractableControl[];
    interactives: InteractableControl[];

    constructor(width:number, height:number){
        this.width = width;
        this.height = height;
        this.viewArea = new ViewArea(width, height, true);
        this.viewArea.initArea(20, true);

        this.viewMousePoint = new Point();

        const sq = new TLRectangle(new Point(100, 100), 50, 50);
        this.testShape = new HoverShape(sq);
        this.shapeColour = 'green';
        this.testShape.setHoverInFunction((pt) => {
            this.shapeColour = 'red';
            console.log('in');
        });
        this.testShape.setHoverOutFunction((pt) => {
            this.shapeColour = 'green';
        });
        this.ts2 = new IsoscelesTrapezium(40, 20, 40, new Point(300, 100));

        this.controls = new GeometryBuilderControls(new Point(200, 200), 50);
        this.circleAdjuster = new ResizeCircle(new Point(50, 50), 10, 3);
        this.rectAdjuster = new ResizeRectangle(new Point(400,400), 100, 100);

        this.triangle = new ResizeTriangle(new Point(-1, 2), new Point(3, 5), new Point(-1, 0), 0.05);
        this.triangleColour = 'white';
        this.adjLine = new AdjustLine(new Point(5, 3), new Point(-5, -2), 0.05, 0.05);
        this.virtLine = VirtLine.from2Points(this.adjLine.p1, this.adjLine.p2);
        //console.log(this.viewArea.getViewRect());
        const rectPoints = this.virtLine.intersectRectPoints(this.viewArea.getViewRect());
        //console.log(rectPoints);
        this.lineFromVirt = rectPoints.length === 2 ? new BaseLine(rectPoints[0], rectPoints[1], 0.05) : null;

        this.gradientInput = new DrawTextInput(new Point(200, 200), 100);
        this.interceptInput = new DrawTextInput(new Point(200, 230), 100);
        this.gradientInput.onChange = (s:string, c:string) => {
            if((c.length === 1 && isNaN(Number(c))) || c === ' '){
                this.gradientInput.text = s.slice(0, s.length - 1);
            }
        }
        
        this.polygon = new VirtPolygon();
        this.polygon.addPoints([
            new Point(0.5, 1), new Point(-0.5, -1), new Point(4, -2),
            new Point(3, 0), new Point(4, 1)
        
        ]);

        this.windowInteractives = [this.gradientInput, this.interceptInput];
        this.interactives = [this.adjLine, this.triangle];
    }
    update(animTime:AnimTime, inputChanges:InputChanges, mouseState:MouseState, keyState:KeyState){
        const secs = animTime.frameTime;
        //this.viewMousePoint = this.viewArea.canvasToAreaCoord(mouseState.position);
        //console.log(this.viewArea.areaToCanvasCoord(this.viewMousePoint)); // 
        this.controls.mouseMove(mouseState.position);
        if(mouseState.leftDown && keyState.keys.has('Control') && !this.controls.isInside(mouseState.position)){
            const translateView = this.viewArea.scalePoint(inputChanges.mouseMovement);
            this.viewArea.translate(new Point(-translateView.x, -translateView.y));
        }
        this.virtLine = VirtLine.from2Points(this.adjLine.p1, this.adjLine.p2);
        const rectPoints = this.virtLine.intersectRectPoints(this.viewArea.getViewRect());
        this.lineFromVirt = rectPoints.length === 2 ? new BaseLine(rectPoints[0], rectPoints[1], 0.05) : null;
    }
    resize(winX: number, winY: number): void {
        this.width = winX;
        this.height = winY;
        this.viewArea.width = winX;
        this.viewArea.height = winY;
        this.viewArea.initArea(20, true);
    }
    mouseMove(e: MouseEvent<HTMLCanvasElement>, pos: Point): void {
        this.viewMousePoint = this.viewArea.canvasToAreaCoord(pos);

        this.testShape.mouseMove(pos);
        this.circleAdjuster.mouseMove(pos);
        this.rectAdjuster.mouseMove(pos);
        this.windowInteractives.forEach(int => int.mouseMove(pos));
        this.interactives.forEach(int => int.mouseMove(this.viewMousePoint));
        if(this.triangle.isInside(this.viewMousePoint)){
            this.triangleColour = 'red';
        }else{
            this.triangleColour = 'white';
        }
        if(this.virtLine.sign(this.viewMousePoint)){
            this.shapeColour = 'green'; 
        }else{
            this.shapeColour = 'red';
        }
    }
    mouseDown(e: MouseEvent<HTMLCanvasElement>, pos: Point): void {
        this.controls.mouseDown(pos);
        this.circleAdjuster.mouseDown(pos);
        this.rectAdjuster.mouseDown(pos);

        this.windowInteractives.forEach(int => int.mouseDown(pos));
        this.interactives.forEach(int => int.mouseDown(this.viewMousePoint));

        console.log(this.polygon.hitPoint(this.viewMousePoint));
    }
    mouseUp(e: MouseEvent<HTMLCanvasElement>, pos: Point): void {
        this.controls.mouseUp(pos);
        this.circleAdjuster.mouseUp(pos);
        this.rectAdjuster.mouseUp(pos);

        this.windowInteractives.forEach(int => int.mouseUp(pos));
        this.interactives.forEach(int => int.mouseUp(this.viewMousePoint));
    }
    keyDown(e: KeyboardEvent, key: string): void {
        this.windowInteractives.forEach(int => {
            if(int.keyDown) int.keyDown(e);
        })
    }
    keyUp(e: KeyboardEvent, key: string): void {
        //throw new Error("Method not implemented.");
    }
    
    draw(cr: CanvasRenderingContext2D): void {
        cr.fillStyle = 'white';
        cr.resetTransform();
        cr.clearRect(0, 0, this.width, this.height);
        this.viewArea.drawGrid(cr, 1);
        this.viewArea.drawAxis(cr);
        
        cr.fillStyle = this.shapeColour;
        this.testShape.draw(cr);

        cr.fillStyle = 'white';
        cr.fillText(this.viewMousePoint.toString(), 10, 10);

        this.controls.draw(cr);

        this.ts2.draw(cr);
        cr.resetTransform();
        this.circleAdjuster.draw(cr);
        this.rectAdjuster.draw(cr);

        this.gradientInput.draw(cr);
        this.interceptInput.draw(cr);

        //draw to view area coords
        this.viewArea.setTransformation(cr);
        cr.fillRect(1,1,1,1);
        cr.strokeStyle = 'orange';
        this.lineFromVirt?.draw(cr)
        cr.fillStyle = this.triangleColour;
        this.triangle.draw(cr);
        cr.strokeStyle = 'white';
        this.adjLine.draw(cr);
        this.polygon.fill(cr);
    }

}

export class GeometryBuilderControls {
    position:Point;
    dragStrip:DragShape;
    body: TLRectangle;
    
    constructor(pos:Point, width:number=40){
        this.position = pos;
        const stripHeight = 10;
        this.dragStrip = new DragShape(new TLRectangle(pos, width, stripHeight));
        this.body = new TLRectangle(new Point(this.position.x, this.position.y+stripHeight), width, 40);

        this.dragStrip.dragFunction = (diff:Vector2D) => {
            this.body.movePoint(diff);
        };
    }
    mouseMove(pos: Point): void {
        this.dragStrip.mouseMove(pos);
    }
    mouseDown(pos: Point): void {
        this.dragStrip.mouseDown(pos);
    }
    mouseUp(pos: Point): void {
        this.dragStrip.mouseUp(pos);
    }
    isInside(pt:Point):boolean{
        return this.dragStrip.isInside(pt) || this.body.isInside(pt);
    }
    draw(cr: CanvasRenderingContext2D): void {
        cr.resetTransform();
        cr.fillStyle = 'red';
        this.dragStrip.draw(cr);
        cr.fillStyle = 'blue';
        this.body.draw(cr);
    }
}