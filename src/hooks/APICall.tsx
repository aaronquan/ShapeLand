import React, {useEffect, useState, useRef, SetStateAction} from 'react';
import axios, { AxiosResponse } from 'axios';
import { getServerRequest, postServerRequest, axiosGetServer, axiosPostServer, 
    serverStatusStrings, ServerStatus, serverStatuses } from '../scripts/apiCall';

import { useQuery, QueryClient, QueryClientProvider, QueryKey, UseQueryResult } from '@tanstack/react-query';

const serverUrl = process.env.REACT_APP_SERVER_URL; // requires _SERVER_URL in .env
//offline - 0, online - 1, server_error - 2, loading - 3



type requestQuery = {
    time: number;
}

export const queryClient = new QueryClient();

type QueryRequestOutput = {
    data: any;
    status:number;
    server_status?:ServerStatus;
    query: UseQueryResult
}

type ServerPing = {
    total: number;
    in: number;
    out: number;
}

type ServerAnalytics = {
    ping: ServerPing;
    status: number;
}

type ServerAnalyticsProps = ServerAnalytics & {
    onRefreshServer: ()=>void;
}

export function useServerAnalytics(key:QueryKey, url:string, params?:any, staleTime?:number){
    params = {analytics: true, ...params}; 
    const res = useServerGetQueryRequest(key, url, params, staleTime);
    const newPageAnalytics = {
        status: {$set: res.status}
    }
    if(res.status === 1){
        const now = Date.now();
        const fullPing = now - res.data.serverTimes.incoming;
        const out = now - res.data.serverTimes.outgoing;

    }
    /*
    setPageAnalytics(update(pageAnalytics, {
        server: {
            $set: {ping: fullPing, in: res.data.serverTimes.ping_in, out: out}
        },
        status: res.data.
    }));*/
    function handleReq(serverTimes: any, code:number){

    }
}

export function useServerGetQueryRequest(key:QueryKey, url:string, params?:any, staleTime?:number, 
    callback?:(data:any) => void, errorCallback?:(error:any) => void){
    params = {time: Date.now(), ...params}; 
    const query = useQuery({
        queryKey: key, 
        queryFn: () => axiosGetServer(url, params),
        staleTime: staleTime
    });
    const resState = useRef<QueryRequestOutput>({data: query.data, status: 0, query: query});
    if(query.isError){
        resState.current.status = 0;
    }else if(query.isSuccess){
        if(typeof query.data === 'object'){
            resState.current = {status: 1, data: query.data.data, query: query};
            //if(!query.isStale && callback) callback(query.data.data);
        }else{
            resState.current.status = 2;
            //if(errorCallback) errorCallback(query);
        }
    }else if(query.isLoading){
        resState.current.status = 3;
    }
    /*if(setServerState){
        setServerState(reqState.current.status);
    }*/
    return resState.current;
}

export function useServerPostQueryRequest(key:QueryKey, url:string, data?:any, params?:any, staleTime?:number, 
    callback?:(data:any) => void, errorCallback?:(error:any) => void){
    params = {time: Date.now(), ...params}; 
    const query = useQuery({
        queryKey: key, 
        queryFn: () => axiosPostServer(url, data, params),
        staleTime: staleTime,
        retry: true
    });
    const resState = useRef<QueryRequestOutput>({data: query.data, status: 0, query: query});
    if(query.isLoadingError){
        console.log('loading error');
    }
    if(query.isError){
        resState.current.status = 0;
        console.log('post error');
    }else if(query.isSuccess){
        if(typeof query.data === 'object'){
            resState.current = {status: 1, data: query.data.data, query: query};
            //if(!query.isStale && callback) callback(query.data.data);
        }else{
            resState.current.status = 2;
            //if(errorCallback) errorCallback(query);
        }
    }else if(query.isLoading){
        console.log('is loading');
        resState.current.status = 3;
    }
    /*if(setServerState){
        setServerState(reqState.current.status);
    }*/
    return resState.current;
}

const defaultServerRequestOutput = ():ServerRequestOutput => {
    return {
        data: {},
        status: 3,
        server_status: ServerStatus.Waiting,
        query: undefined,
        error: null
    }
}

type ServerRequestOutput = {
    //todo add smart symbol strings
    data: any;
    status:number;
    server_status?:ServerStatus;
    query?: AxiosResponse<any, any>;
    error: any;
};


export async function getServerQueryRequest(key:QueryKey, url:string, params?:any, 
    callback?:(data:any) => void, errorCallback?:(data:any) => void,
    offlineCallback?:(data:any) => void) : Promise<ServerRequestOutput>{
    const output = defaultServerRequestOutput();
    try{
        const query = await queryClient.fetchQuery({
            queryKey: key, 
            queryFn: () => axiosGetServer(url, params)
        });
        
        if(typeof query.data !== 'object'){
            if(errorCallback) errorCallback(query);
            output.server_status = ServerStatus.ServerError;
        }else{
            if(callback) callback(query.data);
            output.data = query.data;
            output.server_status = ServerStatus.Online;
        }
        output.query = query;
    } catch(error){
        if(offlineCallback) offlineCallback(error);
        output.error = error;
        output.server_status = ServerStatus.Offline;
    }
    return output;
}

export async function postServerQueryRequest(key:QueryKey, url:string, data?:any, params?:any, 
    callback?:(data:any) => void, errorCallback?:(data:any) => void,
    offlineCallback?:(data:any) => void): Promise<ServerRequestOutput>{
    const output = defaultServerRequestOutput();
    try{
        if(!url.startsWith('/')){
            url = '/'+url;
        }
        const query = await queryClient.fetchQuery({
            queryKey: key, 
            queryFn: () => axiosPostServer(url, data, params)
        });
        if(typeof query !== 'object'){
            if(errorCallback) errorCallback(query);
            output.server_status = ServerStatus.ServerError;
        }else{
            if(callback) callback(query.data);
            output.data = query.data;
            output.server_status = ServerStatus.Online;

        }
    } catch(error){
        if(offlineCallback) offlineCallback(error);
        output.error = error;
        output.server_status = ServerStatus.Offline;
    }
    return output;
}

//using axios (call function in useEffect)
export function useServerRequest(handleReq:any){

    function getSR(url:string, params?:any, 
        callback?:(res:AxiosResponse<any, any>) => void,
        errorCallback?:(res:AxiosResponse<any, any>) => void,
        offlineCallback?:(error:any, status?:number) => void){
        const cb = (res:AxiosResponse<any, any>, b?:number) => {
            if(b) handleReq(res.data.serverTimes, b);
            if(callback) callback(res);
        }
        const ecb = (res:AxiosResponse<any, any>, b?:number) => {
            if(b) handleReq(res.data.serverTimes,b);
            if(errorCallback) errorCallback(res);
        }
        const ocb = (error:any, b?:number) => {
            if(b) handleReq(null, b);
            if(offlineCallback) offlineCallback(error);
        }
        params = {time: Date.now(), ...params};
        getServerRequest(url, params, cb, ecb, ocb);
    }
    function postSR(url:string, data?:any, ){
        postServerRequest(url, data, );
    }
    return {getServerRequest:getSR, postServerRequest:postSR};
}