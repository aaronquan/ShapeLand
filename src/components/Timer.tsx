import React, {ReactNode, useEffect, useState} from 'react';

type PropsWithChildren<P> = P & { children?: ReactNode };

type ChildrenOnly = {children: ReactNode};

type RenderedComponent<P> = P & {
    numRenders:number
}

type TimeRenderer = {
    period: number;
    component: (n?:number) => ReactNode;
}

export function TimeRenderer(props:PropsWithChildren<TimeRenderer>){
    const [numRenders, setNumRenders] = useState(0);
    useEffect(() => {
        setTimeout(() => {
            setNumRenders(numRenders+1);
        }, props.period);
    }, [numRenders]);
    //console.log('x');
    return(
        <>{props.component(numRenders)}</>
    );
}