import React, {createRef, useCallback, useEffect, useMemo, useRef, useState} from 'react'
import './Scanner.css'

import {
    CBARContext,
    CBARView,
    cbInitialize
} from "react-home-ar";
import {Fab, Icon} from "@material-ui/core";

if (process.env.REACT_APP_CB_GET_UPLOAD_URLS_URL && process.env.REACT_APP_CB_UPLOADS_URL && process.env.REACT_APP_CB_SEGMENT_URL) {
    cbInitialize({
        hostingUrl: process.env.REACT_APP_CB_UPLOADS_URL,
        signingUrl: process.env.REACT_APP_CB_GET_UPLOAD_URLS_URL,
        processingUrl: process.env.REACT_APP_CB_SEGMENT_URL,
        placeholderPath:"assets/img/blue-tile.png"
    })
} else {
    throw new Error('REACT_APP_CB_GET_UPLOAD_URLS_URL, REACT_APP_CB_UPLOADS_URL, and REACT_APP_CB_SEGMENT_URL must be defined')
}

export default function Scanner() {
    const _isMounted = useRef(false);
    const [context, setContext] = useState<CBARContext>();
    const permissionsBox = createRef<HTMLDivElement>();

    useEffect(() => {
        _isMounted.current = true;

        return () => {
            _isMounted.current = false
        }
    }, []);

    const ready = useCallback((context:CBARContext) => {
        setContext(context);
    }, []);

    const startCapture = useCallback(() => {
        if (context) {
            if (permissionsBox.current) {
                permissionsBox.current.hidden = true;
            }
            context.startVideoCamera();
        }
    }, [context, permissionsBox]);

    return useMemo(() => (
        <div style={{width:"100vw", height:"100vh"}}>
            <CBARView onContextCreated={ready} />
            <div ref={permissionsBox} className={"permissions-overlay"}>
                <Fab onClick={startCapture} title={"Start Camera"}>
                    <Icon>camera</Icon>
                </Fab>
            </div>
        </div>
    ), [permissionsBox, ready, startCapture])
}
