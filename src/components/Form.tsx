import React, {useState, useRef, useEffect, useMemo} from 'react';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';

type TextInputProps = {
    onBlur: (e:any) => void,
    limit?: number;
}

export function TextInput(props:TextInputProps){
    const [input, setInput] = useState('');
    function handleChange(e:any){
        if(!(props.limit && e.target.value.length > props.limit)){
            setInput(e.target.value);
        }
    }
    return(
        <Form.Control type='input' value={input} onChange={handleChange} onBlur={props.onBlur}/>
    );
}