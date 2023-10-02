import { Entity } from "../Mechanics/Base";


//use class of other players
export class Teammate extends Entity{
    name:string;
    size:number;
    //action: null;
    constructor(name:string){
        super();
        this.name = name;
        this.size = 0.5;
    }
    serverUpdate(){

    }
    draw(cr:CanvasRenderingContext2D):void{
        cr.fillStyle = 'blue';
        cr.beginPath();
        cr.arc(this.position.x, this.position.y, this.size, 0, 2 * Math.PI);
        cr.fill();

        cr.font = '0.2px Arial';
        cr.fillText(this.name, this.position.x-0.2, this.position.y-this.size-0.1)
    }
}