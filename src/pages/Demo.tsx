import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react'
import './Demo.css'

import {CBARContext, CBARFeatureTracking, CBARMode, CBARView} from "react-home-ar";
import {Button, Icon, InputLabel, MenuItem, Select} from "@material-ui/core";

export default function Demo() {
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
                <InputLabel id="label">Feature Type</InputLabel>
                <Select labelId="label" id="select" value={trackingMode}
                        onChange={(event)=>setTrackingMode(event.target.value as CBARFeatureTracking)} >
                    <MenuItem value={CBARFeatureTracking.None}>None</MenuItem>
                    <MenuItem value={CBARFeatureTracking.Documents}>Documents</MenuItem>
                    <MenuItem value={CBARFeatureTracking.Card}>Card</MenuItem>
                    <MenuItem value={CBARFeatureTracking.InteriorSpace}>Interior Space</MenuItem>
                </Select>
            </div>
        </div>
    ), [mode, ready, startCapture, stopCapture, trackingMode])
}
