import React, {MouseEventHandler, useEffect, useState, useRef} from 'react';

import { Point } from './shapes';

class Object{
    point: Point;
    constructor(){
        this.point = new Point(0, 0);
    }
}