import styled from '@emotion/styled';
import { css } from '@emotion/react';

type FlexBoxProps = {
    flexDirection?: string
    alignItems?: string,
    justifyContent?: string;
}

type FlexItemProps = {
    grow: string;
    shrink: string;
    basis: string;
}

/*
${(props:FlexBoxProps) => 
        `flex-direction:`+(props.flexDirection ? props.flexDirection : 'row')+`;
        justify-content`+(props.justifyContent ? props.justifyContent : 'center')+`
        align-items:`+(props.alignItems ? props.alignItems : 'center')+`;`
    }
*/

export const Flex = styled.div`
    display: flex;
    flex-direction: ${(props:FlexBoxProps) =>props.flexDirection ? props.flexDirection : 'row'};
    justify-content: ${(props:FlexBoxProps) => props.justifyContent ? props.justifyContent : 'center'};
    align-items: ${(props:FlexBoxProps) => props.alignItems ? props.alignItems : 'center'};
`;

//console.log(Flex);
/*
export const HoriFlex = css`
    ${Flex};
    flex-direction: row;
`;

export const HoriFlexAlign = css`
    ${HoriFlex};
    align-items: center;
`;*/

type DotProps = {
    radius: number
    colour: string
}

export const Dot = styled.div`
    height: ${(props:DotProps) => props.radius}px;
    width: ${(props:DotProps) => props.radius}px;
    background-color: ${(props:DotProps) => props.colour};
    border-radius: 50%;
    display: inline-block;
`;

const Styles = {
    Flex:Flex,
    //HoriFlex:HoriFlex,
    Dot:Dot
}

export default Styles;