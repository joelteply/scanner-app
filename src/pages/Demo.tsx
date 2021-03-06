import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react'
import './Demo.css'

import {
    CBARCameraFacing,
    CBARContext,
    CBARDebug,
    CBARFeatureTracking,
    CBARMode,
    CBARView,
    cbInitialize
} from "react-home-ar";
import {Button, Icon, InputLabel, MenuItem, Select} from "@material-ui/core";

export default function Demo() {
    const _isMounted = useRef(false);
    const [context, setContext] = useState<CBARContext>();
    const [trackingMode, setTrackingMode] = useState(CBARFeatureTracking.None);
    const [facingMode, setFacingMode] = useState(CBARCameraFacing.Default);

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
        context?.startVideoCamera(trackingMode, facingMode).then(()=>{
            setMode(CBARMode.Video);
        });
    }, [context, facingMode, trackingMode]);

    const stopCapture = useCallback(() => {
        context?.captureImage();
        context?.stopVideoCamera();
        setMode(CBARMode.None);
    }, [context]);

    const [mode, setMode] = useState(CBARMode.None);

    useEffect(()=>{
        if (process.env.REACT_APP_CB_GET_UPLOAD_URLS_URL && process.env.REACT_APP_CB_UPLOADS_URL && process.env.REACT_APP_CB_SEGMENT_URL) {
            const baseInit = {
                hostingUrl: process.env.REACT_APP_CB_UPLOADS_URL,
                signingUrl: process.env.REACT_APP_CB_GET_UPLOAD_URLS_URL,
                processingUrl: process.env.REACT_APP_CB_SEGMENT_URL,
                placeholderPath:"assets/img/blue-tile.png",
                debug:CBARDebug.OpticalFlow | CBARDebug.TrackedLines
            }

            if (trackingMode === CBARFeatureTracking.Face) {
                cbInitialize({
                    ...baseInit,
                    classifierPath:"assets/haarcascade_eye.xml",
                    classifierMaxRegions:2,
                    classifierMinSize:[0.07, 0.07],
                    classifierMaxSize:[0.25, 0.25],
                    classifierUpdateFrequency:1500,
                })
            } else if (trackingMode === CBARFeatureTracking.Classifier) {
                cbInitialize({
                    ...baseInit,
                    classifierPath:"assets/cascade_lbp.xml",
                    classifierMaxRegions:100,
                    classifierMinSize:[0.4, 0.25],
                    classifierMaxSize:[0.9, 0.5],
                    classifierUpdateFrequency:500,
                })
            } else {
                cbInitialize(baseInit);
            }
        } else {
            throw new Error('REACT_APP_CB_GET_UPLOAD_URLS_URL, REACT_APP_CB_UPLOADS_URL, and REACT_APP_CB_SEGMENT_URL must be defined')
        }
    }, [trackingMode])

    return useMemo(() => (
        <div style={{width:"100vw", height:"100vh"}}>
            <CBARView onContextCreated={ready} />

            <div className={"feature-selector"}>
                <div>
                    <InputLabel id="label">Camera Facing</InputLabel>
                    <Select labelId="label" id="select" value={facingMode}
                            onChange={(event)=>setFacingMode(event.target.value as CBARCameraFacing)} >
                        <MenuItem value={CBARCameraFacing.Default}>Default</MenuItem>
                        <MenuItem value={CBARCameraFacing.User}>Front</MenuItem>
                        <MenuItem value={CBARCameraFacing.Environment}>Back</MenuItem>
                    </Select>
                </div>
                <div>
                    <InputLabel id="label">Feature Type</InputLabel>
                    <Select labelId="label" id="select" value={trackingMode}
                            onChange={(event)=>setTrackingMode(event.target.value as CBARFeatureTracking)} >
                        <MenuItem value={CBARFeatureTracking.None}>None</MenuItem>
                        <MenuItem value={CBARFeatureTracking.World}>World</MenuItem>
                        <MenuItem value={CBARFeatureTracking.Face}>Face</MenuItem>
                        <MenuItem value={CBARFeatureTracking.Card}>Card</MenuItem>
                        <MenuItem value={CBARFeatureTracking.Page}>Page</MenuItem>
                    </Select>
                </div>
            </div>

            <div className={"buttons-overlay"}>
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
                            <div className={"button-text"}>Start</div>
                        </div>
                    </Button>
                }
            </div>
        </div>
    ), [facingMode, mode, ready, startCapture, stopCapture, trackingMode])
}
