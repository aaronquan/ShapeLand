import React, {useEffect, useState, useRef} from 'react';

type OpenScreenSideProps = {
    contents: JSX.Element | string;
    openButton: JSX.Element | string;
    top?:number;
    right?:number;
    bottom?:number;
    left?:number;
    openDirection:string;
    openStart?:boolean;
    isOpen?:boolean;
    onToggle?:(isOpen:boolean) => void;
};


export function OpenScreenSide(props:OpenScreenSideProps){
    const [loadRef, setLoadRef] = useState(false);
    const [isOpen, setIsOpen] = useState(props.isOpen ? props.isOpen : false);
    const [contentStyle, setContentStyle] = useState({});
    //const divRef = useRef<HTMLDivElement>(null);
    const contentsRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if(contentsRef.current){
            setLoadRef(true);
        }
    }, [contentsRef, props.contents]);
    useEffect(() => {
        //console.log(getStyle());
        setContentStyle(getStyle());
    }, [props.contents, isOpen]);
    useEffect(() => {
        if(props.isOpen !== undefined) setIsOpen(props.isOpen);
    }, [props.isOpen])
    function toggleScreen(){
        const newOpen = !isOpen;
        if(props.onToggle) props.onToggle(newOpen);
        setIsOpen(newOpen);
    }
    function getStyle(){
        if(!contentsRef.current) return {};
        const base:React.CSSProperties = {position: 'absolute', color: 'black', background: 'white'};
        if(props.left !== undefined) base.left = props.left;
        if(props.bottom !== undefined) base.bottom = props.bottom;
        if(props.right !== undefined) base.right = props.right;
        if(props.top !== undefined) base.top = props.top;
        switch(props.openDirection){
            case 'left':
                base.left = !isOpen ? -contentsRef.current.clientWidth : 0;
                break;
            case 'bottom':
                base.bottom = !isOpen ? -contentsRef.current.clientHeight : 0;
                break;
            case 'right':
                base.right = !isOpen ? -contentsRef.current.clientWidth : 0;
                break;
            case 'top':
                base.top = !isOpen ? -contentsRef.current.clientHeight : 0;
                break;
            default:
                break;
        }
        base.color = 'black';
        base.background = 'white';
        base.borderRadius = '4px';
        return base;
    }
    return(
        <div /*ref={divRef}*/ style={contentStyle}>
            <div ref={contentsRef}>
                {props.contents}
            </div>
            <div style={{cursor: 'pointer'}} onClick={toggleScreen}>
                {props.openButton}
            </div>
        </div>
    );
}