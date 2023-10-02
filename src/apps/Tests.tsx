import React, {useState, useRef, useEffect, useMemo} from 'react';
import { 
    useServerRequest, 
    useServerGetQueryRequest, 
    useServerPostQueryRequest, 
    getServerQueryRequest,
    postServerQueryRequest
} from '../hooks/APICall'; 
import { TimeRenderer } from '../components/Timer';

export function TimerTestPage(){
    const [period, setPeriod] = useState(2000);
    return (
        <TimeRenderer period={period} component={(n) => <TimerFunctionTest nrenders={n} period={period}/>}/>
    )
}

function TimerFunctionTest(props:{nrenders:any, period: number}){

    const req = useServerGetQueryRequest(['repoData'], '', props.period, undefined);
    console.log(req);
    useEffect(() => {
        req.query.refetch();
    }, [props.nrenders])
    return (
    <div>
        {req.data && JSON.stringify(req.data.serverTimes)}
        <div>
        {req.status} {props.nrenders}
        </div>
        {/*dt ? JSON.stringify(dt) : 'none'*/}
    </div>
    )
}

export function TimerQueryRequestTest(){
    const [period, setPeriod] = useState(2000);
    return (
        <TimeRenderer period={period} component={(n) => <QueryTest nrenders={n} period={period}/>}/>
    )
}

function QueryTest(props:{nrenders:any, period: number}){
    //const req = useServerQueryRequest(['repoData'], '', props.period, undefined);
    //console.log(req);
    useEffect(() => {
        const query = getServerQueryRequest(['repoData'], '', {});
        console.log(query);
    }, [props.nrenders])
    return (
        <div>
            This is a test
        </div>
    );
}