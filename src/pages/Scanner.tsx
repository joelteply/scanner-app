import React, {useCallback, useEffect, useMemo, useState} from 'react'
import './Scanner.css'

import {CBARContext, CBARFeatureTracking, CBARMode, CBARView, cbInitialize} from "react-home-ar";
import {Button, Icon} from "@material-ui/core";

export default function Scanner() {
    const [context, setContext] = useState<CBARContext>();
    const [mode, setMode] = useState(CBARMode.None);

    const ready = useCallback((context:CBARContext) => {
        setContext(context);
    }, []);

    const startCapture = useCallback(() => {
        context?.startVideoCamera(CBARFeatureTracking.Card).then(()=>{
            setMode(CBARMode.Video);
        });
    }, [context]);

    const stopCapture = useCallback(() => {
        context?.stopVideoCamera();
        setMode(CBARMode.None);
    }, [context]);

    useEffect(()=>{
        if (process.env.REACT_APP_CB_GET_UPLOAD_URLS_URL && process.env.REACT_APP_CB_UPLOADS_URL && process.env.REACT_APP_CB_SEGMENT_URL) {
            cbInitialize({
                hostingUrl: process.env.REACT_APP_CB_UPLOADS_URL,
                signingUrl: process.env.REACT_APP_CB_GET_UPLOAD_URLS_URL,
                processingUrl: process.env.REACT_APP_CB_SEGMENT_URL,
            })
        } else {
            throw new Error('REACT_APP_CB_GET_UPLOAD_URLS_URL, REACT_APP_CB_UPLOADS_URL, and REACT_APP_CB_SEGMENT_URL must be defined')
        }
    }, [])

    return useMemo(() => (
        <div className={"container"}>
            <CBARView className={"visualizer"} onContextCreated={ready} />

            <div className={"capture-overlay"}>
                <div className={"hole"} />
            </div>

            <div className={"permissions-overlay"}>
                {mode === CBARMode.Video ?
                    <Button className={"button"} variant="contained" onClick={()=>stopCapture()}>
                        <div className={"button-content"}>
                            <Icon className={"button-icon"}>camera</Icon>
                            <div className={"button-text"}>Capture</div>
                        </div>
                    </Button>
                    :
                    <Button className={"button"} variant="contained" onClick={()=>startCapture()}>
                        <div className={"button-content"}>
                            <Icon className={"button-icon"}>photo_camera</Icon>
                            <div className={"button-text"}>Start Capture</div>
                        </div>
                    </Button>
                }
            </div>
        </div>
    ), [mode, ready, startCapture, stopCapture])
}
