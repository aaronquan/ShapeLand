import axios, { AxiosResponse, GenericAbortSignal } from "axios";

import { useQuery, QueryClient, QueryClientProvider } from '@tanstack/react-query';

const serverUrl = process.env.REACT_APP_SERVER_URL; // requires _SERVER_URL in .env

const defFun:(res:AxiosResponse<any, any>) => void = (res:AxiosResponse<any, any>) => {};

//offline - 0, online - 1, server_error - 2
export const serverStatusStrings = ['offline', 'online', 'server_error'];

/*
type ServerStatus = {
    offline: symbol;
    online: symbol;
    server_error: symbol;
    waiting: symbol;
}*/

export const serverStatuses = {
    offline: Symbol('offline'),
    online: Symbol('online'),
    server_error: Symbol('server_error'),
    waiting: Symbol('waiting')
}
export enum ServerStatus {
    Offline, Online, ServerError, Waiting
}

export function getServerRequest(url:string, params?:any, 
    callback:(res:AxiosResponse<any, any>, status?:number) => void=defFun, 
    errorCallback:(res:AxiosResponse<any, any>, status?:number) => void=defFun, 
    offlineCallback:(error:any, status?:number) => void=() => {}){
    /*axios({
        method: 'GET',
        url: serverUrl+url,
        params: params,
        //signal: controller ? controller.signal : null
    })*/
    axiosGetServer(url, params).then(response => {
        if(typeof response.data !== 'object'){
            errorCallback(response, 2);
        }else{
            callback(response, 1);
        }
    }).catch((error) => {
        offlineCallback(error, 0);
    });
}

export function postServerRequest(url:string, data?:any, 
    callback:(res:AxiosResponse<any, any>, status?:number) => void=defFun, 
    errorCallback:(res:AxiosResponse<any, any>, status?:number) => void=defFun, 
    offlineCallback:(error:any, status?:number) => void=() => {}){
    axios({
        method: 'POST',
        url: serverUrl+url,
        data: data,
        //signal: controller ? controller. : null
    }).then(response => {
        if(typeof response.data !== 'object'){
            if(errorCallback) errorCallback(response, 2);
        }else{
            if(callback) callback(response, 1);
        }
    }).catch(error => {
        offlineCallback(error, 0);
    });
}

export const queryClient = new QueryClient();

export function axiosGetServer(url:string, params?:any){
    return axios({url: serverUrl+url, method: 'GET', params: params});
}

export function axiosPostServer(url:string, data?:any, params?:any){
    return axios({url: serverUrl+url, method: 'POST', data: data, params: params, 
    headers: {'Content-Type': 'application/json'}});
}