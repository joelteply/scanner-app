import 'react-app-polyfill/ie9'
import 'react-app-polyfill/stable'
import cssVars from 'css-vars-ponyfill'

import React, {useReducer, useEffect, useCallback, useState, useRef} from "react"
import * as ReactDOM from "react-dom"

import {BrowserRouter as Router, Route, Switch} from "react-router-dom"
import {SiteContext, createEmptyState, siteStateReducer, stateToUrl} from "./data/SiteContext"
import {BrowserProperties, WebClientInfo} from "react-client-info"

import Scanner from "./pages/Scanner"
import {ApiCapabilityName, FeatureAppearanceConfig, SiteConfig} from "cambrian-base";
import Demo from "./pages/Demo";

const objectFitImages = require('object-fit-images');

export const isFeatureEnabled = (siteData:SiteConfig, name:ApiCapabilityName):boolean => {
    const feature = siteData.features.find(f=>f.name === name);
    return feature ? feature.enabled : false;
};

export const getFeatureAppearance = (siteData:SiteConfig, name:ApiCapabilityName, defaultAppearance:FeatureAppearanceConfig) => {
    let match:FeatureAppearanceConfig | undefined
    if (siteData.appearance.features) {
        match = siteData.appearance.features.find(f=>f.name === name);
    }
    return match ? match : defaultAppearance
};

function App() {
    const initialSiteState = createEmptyState();
    const [siteState, dispatchSiteState] = useReducer(siteStateReducer, initialSiteState);
    const [browserProperties, setBrowserProperties] = useState<BrowserProperties>({});
    // const searchObject = useMemo(()=>{
    //     return objectToLowerCase(qs.parse(window.location.search.substr(1)));
    // }, []);

    //component mounted:
    useEffect(() => {
        cssVars();
        objectFitImages();

        return () => {
            //unmount
        }
    }, []);

    const setCssVars = useCallback(() => {
        if (!browserProperties.browser) return;

        const doc = document.documentElement;

        //without this check, causes WebGL flicker on desktop
        const width = window.innerWidth;
        const height = window.innerHeight;

        doc.style.setProperty("--app-height",  `${height}px`);
        doc.style.setProperty("--inverse-app-height", `${-height}px`);
        doc.style.setProperty("--half-app-height", `${height / 2}px`);
        doc.style.setProperty("--inverse-half-app-height", `${-height / 2}px`);
        doc.style.setProperty("--app-width", `${width}px`);
        doc.style.setProperty("--inverse-app-width", `${-width}px`)

    }, [browserProperties.browser]);

    useEffect(() => {
        dispatchSiteState({ type: "setBrowserProperties", browserProperties: browserProperties });
        setCssVars();
    }, [browserProperties, setCssVars]);

    const updateFromLocation = useCallback((location:any) => {

    }, []);

    const initialize = useCallback(() => {
        setCssVars();
        window.addEventListener("resize", setCssVars);
        window.addEventListener("orientation", setCssVars);
        window.setInterval(()=>{
            setCssVars()
        }, 500);

        updateFromLocation(window.location)

    }, [setCssVars, updateFromLocation]);

    const initializeRef = useRef(initialize);
    useEffect(() => { initializeRef.current = initialize; }, [initialize]);

    useEffect(() => {
        if (initializeRef.current) {
            initializeRef.current()
        }
    }, []);

    useEffect(() => {
        const url = stateToUrl(siteState, true);
        if (url !== window.history.state) {
            window.history.replaceState({}, "", url)
        }
    }, [siteState]);

    return (
        <Router>
            <Route
                render={({ // @ts-ignore
                             location }) => {
                    return (
                        <SiteContext.Provider value={{ state: siteState, dispatch: dispatchSiteState }}>
                            <WebClientInfo onClientStateChanged={setBrowserProperties} />
                            <Switch location={location}>
                                <Route exact path="/" component={Scanner} />
                                <Route exact path="/demo" component={Demo} />
                            </Switch>
                        </SiteContext.Provider>
                    )
                }}
            />
        </Router>
    )

}

ReactDOM.render(
    <App />,
    document.getElementById("root")
);