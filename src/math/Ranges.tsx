

export class IntegerRange{
    min:number;
    max:number;
    range:number;
    constructor(min:number=0, max:number=0){
        if(max < min) throw Error('Max greater than min in integer range');
        this.min = min;
        this.max = max;
        this.range = max - min;
    }
    setMin(min:number){
        this.min = min;
        this.range = this.max - this.min;
    }
    setMax(max:number){
        this.max = max;
        this.range = this.max - this.min;
    }
    getStringSlice(s:string):string{
        return s.slice(this.min, this.max);
    }
    testValid(){
        if(this.max < this.min) throw Error('Max greater than min in integer range');
    }
    getRandom():number{
        const rand = Math.random();
        return Math.floor(rand*(this.range+1))+this.min;
    }
    getNumberLine():number[]{
        const line = Array.from(Array(this.range).keys()).map((n) => n+this.min);
        return line;
    }
    getNUniqueRandom(n:number):number[]{
        const numbers = this.getNumberLine();
        const rands = [];
        for(let i = 0; i < n; ++i){
            const ind = Math.floor(Math.random()*numbers.length);
            rands.push(numbers[ind]);
            numbers.splice(ind, 1);
        }
        return rands;
    }
}
