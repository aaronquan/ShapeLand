import React, {useEffect, useState, useRef} from 'react';

import update from 'immutability-helper';


export function useKeys(onKeyDown?:(e:KeyboardEvent) => void, onKeyUp?:(e:KeyboardEvent) => void){
    const timeStart = useRef(Date.now());
    const keysDown = useRef(new Set<string>());
    const keysTime = useRef(new Map<string, number>());
    function handleKeyDown(event:KeyboardEvent){
        //console.log(`Key: ${event.key} with keycode ${event.code} has been pressed`);
        keysDown.current.add(event.key);
        const now = Date.now();
        const diff:number = (now - timeStart.current);
        keysTime.current.set(event.key, diff);
        if(onKeyDown) onKeyDown(event);
    }
    function handleKeyUp(event:KeyboardEvent){
        //console.log(`Key: ${event.key} with keycode ${event.code} has been released`);
        keysDown.current.delete(event.key);
        keysTime.current.delete(event.key);

        if(onKeyUp) onKeyUp(event);
    }
    function handleFocus(){
        keysDown.current.clear();
        keysTime.current.clear();
    }
    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('keyup', handleKeyUp);
        window.addEventListener("focus", handleFocus);
        window.addEventListener("blur", handleFocus);
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            document.removeEventListener("keyup", handleKeyUp);
            window.removeEventListener("focus", handleFocus);
            window.removeEventListener("blur", handleFocus);
        };
    }, [onKeyDown]);

    
    return {keys: keysDown.current, ktime: keysTime.current};
}
