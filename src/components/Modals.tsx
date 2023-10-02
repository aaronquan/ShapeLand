import React, {useEffect, useState, useRef, ComponentElement} from 'react';
import Modal from 'react-bootstrap/Modal';

type TemplateModalProps = {
    show: boolean;
    closeButton?: boolean;
    onClose?: () => void;
    title?: JSX.Element | string;
    body?: JSX.Element | string;
    footer?: JSX.Element | string
    modalClass?: string;
}

export function TemplateModal(props:TemplateModalProps){
    const closeButton = props.closeButton ? props.closeButton : true;
    function handleClose(){
        if(props.onClose) props.onClose();
    }
    return(
        <Modal dialogClassName={props.modalClass} show={props.show} onHide={handleClose}>
        <Modal.Header closeButton={closeButton}>
            {props.title && <Modal.Title>{props.title}</Modal.Title>}
        </Modal.Header>

        {props.body && <Modal.Body>
            {props.body}
        </Modal.Body>}

        {props.footer && <Modal.Footer>
            {props.footer}
        </Modal.Footer>}
        </Modal>
    )
}