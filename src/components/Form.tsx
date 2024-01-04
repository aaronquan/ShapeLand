import React, {useState, useRef, useEffect, useMemo} from 'react';
import { Button } from 'react-bootstrap';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';

type TextInputProps = {
    onChange?: (text:string) => void,
    onBlur?: (text:string) => void,
    limit?: number,
    disabled?:boolean,
    text?: string
}

export function TextInput(props:TextInputProps){
    const [input, setInput] = useState(props.text ? props.text : '');
    useEffect(() => {
        if(props.text !== undefined){
            setInput(props.text);
        }
    }, [props.text]);
    function handleChange(e:any){
        if(!(props.limit && e.target.value.length > props.limit)){
            setInput(e.target.value);
        }
        if(props.onChange) props.onChange(e.target.value);
    }
    function handleBlur(e:any){
        if(props.onBlur) props.onBlur(input);
    }
    return(
        <Form.Control type='input' value={input} disabled={props.disabled} onChange={handleChange} onBlur={handleBlur}/>
    );
}

type NumberInputProps = {
    value?:number,
    onChange?: (n:number) => void,
    onBlur?: (n:number) => void,
    hasIncrementButtons?: boolean,
}

export function NumberInput(props:NumberInputProps){
    const [number, setNumber] = useState(props.value ? props.value : 1);
    function handleChange(e:any){
        if(!isNaN(e.nativeEvent.data)){
            setNumber(e.target.value);
            if(props.onChange) props.onChange(e.target.value);
        }
    }
    function handleBlur(e:any){
        if(props.onBlur) props.onBlur(number);
    }
    function handleIncrement(){
        const newNumber = number+1;
        setNumber(newNumber);
        if(props.onBlur) props.onBlur(newNumber);
    }
    function handleDecrement(){
        const newNumber = number-1;
        setNumber(newNumber);
        if(props.onBlur) props.onBlur(newNumber);
    }
    return(
        <>
        <Form.Control type='input' value={number} onChange={handleChange} onBlur={handleBlur}/>
        {props.hasIncrementButtons && <>
        <Button onClick={handleIncrement}>+</Button>
        <Button onClick={handleDecrement}>-</Button>
        </>}
        </>
    );
}

