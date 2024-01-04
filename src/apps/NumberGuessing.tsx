import React, {useState, useRef, useEffect, useMemo} from 'react';
import { NumberInput, TextInput } from "../components/Form";
import { IntegerRange } from "../math/Ranges";
import { Button } from 'react-bootstrap';
import update from 'immutability-helper';


type NumberGuessRecord = {
    digits: number;
    isCorrect: boolean;
}

export function NumberGuessing(){
    const [time, setTime] = useState(2000)
    const [guess, setGuess] = useState('');
    const [guessDisabled, setGuessDisabled] = useState(true);

    const [showNumber, setShowNumber] = useState(false);
    const [numberToGuess, setNumberToGuess] = useState<string>('');
    const [nDigits, setNDigits] = useState(6);

    const [stats, setStats] = useState<NumberGuessRecord[]>([]);

    const [startTime, setStartTime] = useState(Date.now());
    const range = new IntegerRange(0, 9);
    //const 
    //range.getRandom();
    function handleChangeGuess(guess:string){
        setGuess(guess);
    }
    function generateRandomNDigitsNumber(digits:number):string{
        let out = '';
        for(let i = 0; i < digits; i++){
            const digit = range.getRandom();
            out += digit.toString();
        }
        return out;
    }
    function startGuess(){
        const g = generateRandomNDigitsNumber(nDigits);
        setNumberToGuess(g);
        setShowNumber(true);
        setGuessDisabled(true);
        setStartTime(Date.now());
        setTimeout(() => {
            setShowNumber(false);
            setGuessDisabled(false);
        }, time);
    }
    function handleChangeNumber(newNumber:number){
        setNDigits(newNumber);
    }
    function handleGuessNumber(){
        const isCorrect = guess === numberToGuess;
        setStats(update(stats, {
            $push: [{digits: numberToGuess?.length, isCorrect: isCorrect}]
        }))
        setShowNumber(true);
        setGuessDisabled(true);
        setGuess('');
    }
    return <>
        <div style={{width: '100px'}}>
        Numbers: <NumberInput value={nDigits} hasIncrementButtons onBlur={handleChangeNumber}/>

        </div>
        <Button onClick={startGuess}>Start</Button>
        <div>
        {showNumber && numberToGuess}
        <VisualTimer time={time} start={startTime} show={showNumber}/>
        </div>
        <div style={{width: '100px'}}>
        Guess: <TextInput text={guess} onChange={handleChangeGuess} disabled={guessDisabled}/>
        <Button onClick={handleGuessNumber} disabled={guessDisabled}>Guess</Button>
        </div>
        <div>
            {stats.map((stat) => {
                return <div>
                    <span style={{color: stat.isCorrect ? 'green' : 'red'}}>{stat.isCorrect ? 'Correct' : 'Incorrect'}</span>
                    <span> Digits: {stat.digits}</span>
                </div>
            })}
        </div>
    </>
}

type VisualTimerProps = {
    start?: number; // start time
    time: number; //in miliseconds
    onFinish?: () => void;
    width?: number,
    show: boolean
}
function VisualTimer(props:VisualTimerProps){
    //const [startTime, setStartTime] = setState()
    const [currentWidth, setCurrentWidth] = useState(0);
    const timer = useRef<NodeJS.Timer | null>(null);
    const width = props.width ? props.width : 100;
    useEffect(() => {
        if(props.start){
            const startTime = props.start;
            timer.current = setInterval(() => {
                const t = Date.now();
                const elapsed = t - startTime;
                if(elapsed < props.time){
                    setCurrentWidth((width*elapsed)/props.time);
                }else{
                    setCurrentWidth(width);
                    if(timer.current) clearInterval(timer.current);
                }
            }, 16);
        }
        return () => {
            if(timer.current) clearInterval(timer.current);
            console.log('unload visual timer');
        }
    }, [props.start]);
    return <>
    {props.show &&
    <div style={{backgroundColor: 'white', width: width.toString()+'px', height: '5px'}}>
        <div style={{backgroundColor: 'blue', width: currentWidth.toString()+'px', height: '5px'}}></div>

    </div>
    }
    </>
}