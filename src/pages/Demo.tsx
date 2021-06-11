import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react'
import './Demo.css'

import {CBARContext, CBARFeatureTracking, CBARCameraFacing, CBARMode, CBARView} from "react-home-ar";
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
                        <MenuItem value={CBARFeatureTracking.Classifier}>Classifier</MenuItem>
                        <MenuItem value={CBARFeatureTracking.Face}>Face</MenuItem>
                    </Select>
                </div>
            </div>
        </div>
    ), [facingMode, mode, ready, startCapture, stopCapture, trackingMode])
}
