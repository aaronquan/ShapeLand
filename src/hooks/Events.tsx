import React, {useEffect, useState, useRef} from 'react';

type TimedEventProps = {
    time:number;
    function:(vars:any) => void;
    paused?:boolean;
    variables?:any;
}

type TimerEventState = {
    functionCount: number;
    running: boolean;
}

export function useTimedEvent(props:TimedEventProps){
    const functionCount = useRef(0);

    const timerRef = useRef<number | undefined>(undefined);
    const functionRef = useRef(runFunction)
    useEffect(() => {
        if(props.paused) window.clearTimeout(timerRef.current);
        else {
            console.log('unpaused');
            functionRef.current = runFunction;
            timerRef.current = window.setTimeout(functionRef.current, props.time);
        }
        return () => {
            window.clearTimeout(timerRef.current);
        }
    }, [props.paused]);
    useEffect(() => {
        functionRef.current = runFunction;
    }, [props.function, props.variables]);
    function runFunction(){
        props.function(props.variables);
        functionCount.current++;
        timerRef.current = window.setTimeout(functionRef.current, props.time);
    }
    /*
    const runFunction = () => {
        if(!props.paused){
            console.log(props.variables);
            props.function(props.variables);
            functionCount.current++;
            timerRef.current = window.setTimeout(() => {runFunction()}, props.time);
        }
    }*/
    return functionCount;
}