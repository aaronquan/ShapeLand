import { Point, VirtRect } from "../game/geometry";
import { CanvasButton, InteractableControl } from "./controls"


//not needed use array of interactable controls instead?

//is needed for optimisation for array of evenly spaced buttons

export class ButtonContainer implements InteractableControl{
    buttons: CanvasButton[];
    arrangeVertical: boolean; //
    buttonWidth: number;
    buttonHeight: number;

    constructor(){
        this.buttons = [];
        this.arrangeVertical = true;
        this.buttonWidth = 50;
        this.buttonHeight = 50;
    }
    addButton(button:CanvasButton){
        this.buttons.push(button);
    }
    setPoint(pt: Point): void {
        //throw new Error("Method not implemented.");
    }
    isInside(pt: Point): boolean {
        //throw new Error("Method not implemented.");
        return false;
    }
    mouseMove(pt: Point): void {
        //throw new Error("Method not implemented.");
        this.buttons.forEach((button) => {
            button.mouseMove(pt);
        });
    }
    mouseDown(pt: Point): void {
        throw new Error("Method not implemented.");
    }
    mouseUp(pt: Point): void {
        throw new Error("Method not implemented.");
    }
    getRectSpace?(): VirtRect {
        throw new Error("Method not implemented.");
    }
    draw(cr: CanvasRenderingContext2D):void{
        this.buttons.forEach(button => button.draw(cr));
    }
}