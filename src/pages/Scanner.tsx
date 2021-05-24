import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react'
import './Scanner.css'

import {
    CBARContext,
    CBARView,
    cbInitialize
} from "react-home-ar";

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
    const [, setContext] = useState<CBARContext>();

    useEffect(() => {
        _isMounted.current = true;

        return () => {
            _isMounted.current = false
        }
    }, []);

    const ready = useCallback((context:CBARContext) => {
        context.startVideoCamera();

        setContext(context);
    }, []);

    return useMemo(() => (
        <div style={{width:"100vw", height:"100vh"}}>
            <CBARView onContextCreated={ready} />
        </div>
    ), [ready])
}
