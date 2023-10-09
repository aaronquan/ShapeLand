

export class ShapeLandDebugger{
    sentProjectiles: number;
    recievedProjectiles: number;
    rot: number;
    constructor(){
        this.sentProjectiles = 0;
        this.recievedProjectiles = 0;
        this.rot = 0;
    }

    draw(cr:CanvasRenderingContext2D):void{
        cr.font = '10px Arial';
        cr.fillStyle = 'white';
        cr.fillText('Sent Projs: '+this.sentProjectiles, 10, 80);
        cr.fillText('Recieved Projs: '+this.recievedProjectiles, 10, 95);

        cr.fillText('Test rotation: '+this.rot, 10, 108);
    }
}