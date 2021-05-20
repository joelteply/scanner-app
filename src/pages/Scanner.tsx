import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react'
import './Scanner.css'

import {
    CBARContext, CBAREvent,
    CBARView,
    cbInitialize
} from "react-home-ar";

import orientationImage from "../data/orientation6.jpg";

if (process.env.REACT_APP_CB_GET_UPLOAD_URLS_URL && process.env.REACT_APP_CB_UPLOADS_URL && process.env.REACT_APP_CB_SEGMENT_URL) {
    cbInitialize({
        hostingUrl: process.env.REACT_APP_CB_UPLOADS_URL,
        signingUrl: process.env.REACT_APP_CB_GET_UPLOAD_URLS_URL,
        processingUrl: process.env.REACT_APP_CB_SEGMENT_URL,
        orientationImage:orientationImage,
        opencvJsLocation:"assets/opencv.js",
        placeholderPath:"assets/img/blue-tile.png"
    })
} else {
    throw new Error('REACT_APP_CB_GET_UPLOAD_URLS_URL, REACT_APP_CB_UPLOADS_URL, and REACT_APP_CB_SEGMENT_URL must be defined')
}

export default function Scanner() {
    const _isMounted = useRef(false);
    const [context, setContext] = useState<CBARContext>();

    useEffect(() => {
        _isMounted.current = true;

        return () => {
            _isMounted.current = false
        }
    }, []);

    const handleVisualizerEvent = useCallback((event:CBAREvent) => {

    }, []);

    const ready = useCallback((context:CBARContext) => {
        context.startVideoCamera();
        setContext(context);
    }, []);

    useEffect(() => {
        if (context) {
            context.setHandler(handleVisualizerEvent)
        }
    }, [context, handleVisualizerEvent]);

    return useMemo(() => (
        <div>
            <CBARView onContextCreated={ready} />
        </div>
    ), [ready])
}
