
import { Card } from "react-bootstrap";
import { OpenScreenSide } from "./Interface";


type Applet = {
    name: string;
    render: (props:any) => JSX.Element;
}

type SideAppListProps = {
    onAppClick: (appNumber:number) => void;
    applets: Applet[];
}

export function SideAppList(props:SideAppListProps){
    function handleAppClick(i:number){
        return function(){
            props.onAppClick(i);
        }
    }
    const contents = <>
        {props.applets.map((app, i) => {
            return <AppCard key={i} title={app.name} text={''} onClick={handleAppClick(i)}/>
        })}
    </>
    const button = <span>Apps</span>
    return(
        <>
        <OpenScreenSide contents={contents} openButton={button} 
        openDirection={'top'} left={0} top={0}/>
        </>
    );
}

type AppCardProps = {
    title:string;
    text:string;
    onClick:() => void;
}


export function AppCard(props:AppCardProps){
    return (
    <Card style={{ width: '18rem', cursor: 'pointer' }} onClick={props.onClick}>
        <Card.Body>
        <Card.Title>{props.title}</Card.Title>
        <Card.Text>
            {props.text}
        </Card.Text>
        </Card.Body>
    </Card>
    );
}