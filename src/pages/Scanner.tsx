import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react'
import './Scanner.css'

import {CBARContext, CBARFeatureTracking, CBARMode, CBARView, cbInitialize} from "react-home-ar";
import {Button, Icon, InputLabel, MenuItem, Select} from "@material-ui/core";

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
    const [trackingMode, setTrackingMode] = useState(CBARFeatureTracking.None);

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
        context?.startVideoCamera(trackingMode).then(()=>{
            setMode(CBARMode.Video);
        });
    }, [context, trackingMode]);

    const stopCapture = useCallback(() => {
        context?.stopVideoCamera();
        setMode(CBARMode.None);
    }, [context]);

    const [mode, setMode] = useState(CBARMode.None);

    return useMemo(() => (
        <div style={{width:"100vw", height:"100vh"}}>
            <CBARView onContextCreated={ready} />
            <div className={"permissions-overlay"}>
                {mode === CBARMode.Video ?
                    <Button className={"button transparent"} variant="contained" onClick={()=>stopCapture()}>
                        <div className={"button-content"}>
                            <Icon className={"button-icon"}>pause</Icon>
                            <div className={"button-text"}>Pause</div>
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
            <div className={"feature-selector"}>
                <InputLabel id="label">Feature Type</InputLabel>
                <Select labelId="label" id="select" value={trackingMode}
                        onChange={(event)=>setTrackingMode(event.target.value as CBARFeatureTracking)} >
                    <MenuItem value={CBARFeatureTracking.None}>None</MenuItem>
                    <MenuItem value={CBARFeatureTracking.HoughLines}>Hough</MenuItem>
                    <MenuItem value={CBARFeatureTracking.LineSegments}>Line Segments</MenuItem>
                    <MenuItem value={CBARFeatureTracking.OpticalFlow}>Optical Flow</MenuItem>
                </Select>
            </div>
        </div>
    ), [mode, ready, startCapture, stopCapture, trackingMode])
}
