import React, {MouseEventHandler, useEffect, useState, useRef} from 'react';

export class AnimTime{
    paused: boolean;
    animTime: number;
    frameTime: number;
    realTime: number;
    nFrames: number;
    
    pauseStart: number;
    pauseTime: number;
    constructor(){
        this.paused = false;
        this.animTime = 0;
        this.frameTime = 0;
        this.realTime = 0;

        this.nFrames = 0;

        this.pauseStart = Date.now();
        this.pauseTime = 0;
    }
    frame(time:number){
        if(!this.paused){
            const newAnimTime = time - this.pauseTime
            this.frameTime = newAnimTime - this.animTime 
            this.animTime = newAnimTime;
        }
        this.realTime = time;
    }
    pause(){
        this.paused = !this.paused;
        if(this.paused){
            this.pauseStart = Date.now();
        }else{
            this.pauseTime += Date.now() - this.pauseStart;
        }
    }
}