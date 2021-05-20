import React, {useCallback, useContext, useEffect, useMemo, useRef, useState} from 'react'
import './Scanner.css'

import {
    CBARAssetType,
    CBARContext, CBAREvent,
    CBAREventType,
    CBARFilledTiledAsset,
    CBARIntersection,
    CBARMaterialProperties,
    CBARMouseEvent,
    CBARPaintAsset,
    CBARRugAsset,
    CBARScene,
    CBARSurface,
    CBARSurfaceAsset,
    CBARSurfaceType,
    CBARToolMode,
    CBARView,
    cbInitialize,
    DataFilter,
    DataItem,
    Product,
    ProductBrand,
    ProductCollection,
    ProductColor,
    ProductItem,
    SceneCollection,
    SceneInfo,
    SwatchItem,
    THREE
} from "react-home-ar";

import {SiteContext} from '../data/SiteContext';
import orientationImage from "../data/orientation6.jpg";

import {getScenePaths, getUploadedRoomPaths, SITE_PATH} from "../index";

enum Panel {
    None="",
    Products="products",
    Scenes="scenes",
    ProductInfo="product-info",
    Share="share"
}

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
    const siteContext = useContext(SiteContext)!;
    const dispatch = siteContext.dispatch;
    const _isMounted = useRef(false);

    const [activePanel,setActivePanel] = useState(Panel.None);

    const [rootItem, setRootItem] = useState<SwatchItem>();
    const [dataPath, setDataPath] = useState<string>();

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [filters, ] = useState<DataFilter[]>();
    const [listingItems, setListingItems] = useState<SwatchItem[]>();
    const [selectedRow, setSelectedRow] = useState<SwatchItem>();
    const [selectedColumn, setSelectedColumn] = useState<SwatchItem>();

    const [sceneListingItems, setSceneListingItems] = useState<SwatchItem[]>();
    const [toolMode, setToolMode] = useState(CBARToolMode.None);

    const [context, setContext] = useState<CBARContext>();
    const [currentScene, setCurrentScene] = useState<CBARScene>();
    const [selectedSurface, setSelectedSurface] = useState<CBARSurface>();
    const [hasSeenProducts, setHasSeenProducts] = useState(false);
    const [needsUpload, setNeedsUpload] = useState(false);

    const selectedProduct = useMemo(()=>{
        return selectedColumn instanceof ProductItem ? selectedColumn as ProductItem : undefined;
    }, [selectedColumn]);

    const [selectedAsset, setSelectedAsset] = useState<CBARSurfaceAsset>();

    const [initialRotation, setInitialRotation] = useState<number>(0);
    const [currentRotation, setCurrentRotation] = useState<number>(0);
    useEffect(()=>{setCurrentRotation(initialRotation);}, [initialRotation]);

    const [initialXPos, setInitialXPos] = useState<number>(0);
    const [currentXPos, setCurrentXPos] = useState<number>(0);
    useEffect(()=>{setCurrentXPos(initialXPos);}, [initialXPos]);

    const [initialYPos, setInitialYPos] = useState<number>(0);
    const [currentYPos, setCurrentYPos] = useState<number>(0);
    useEffect(()=>{setCurrentYPos(initialYPos);}, [initialYPos]);

    const brandPath = useMemo(()=>{
        if (siteContext.state.siteData) {
            return SITE_PATH;
        }
    },[siteContext.state.siteData]);

    useEffect(()=>{
        if (siteContext.state.siteData) {
            const brands:ProductBrand[] = [];
            for (const brandJson of siteContext.state.siteData.brands) {
                const brand = new ProductBrand();
                brand.load(brandJson);
                brands.push(brand)
            }

            let rootItem:SwatchItem = brands[0];
            while (rootItem.children.length === 1) {
                if (!(rootItem.children[0] instanceof Product)) {
                    rootItem = rootItem.children[0]
                } else {
                    break;
                }
            }
            setRootItem(rootItem)
        }

    }, [siteContext.state.siteData]);

    useEffect(() => {
        _isMounted.current = true;

        return () => {
            _isMounted.current = false
        }
    }, []);

    const resolveThumbnailPath = useCallback((swatchItem:SwatchItem) : string | undefined => {

        if (!(swatchItem instanceof DataItem)) return;

        if (!swatchItem.thumbnail && swatchItem.children.length) {
            return resolveThumbnailPath(swatchItem.children[0])
        }

        return swatchItem.thumbnail && swatchItem.thumbnail.startsWith("http") ? swatchItem.thumbnail : `${brandPath}/${swatchItem.thumbnail}`;

    }, [brandPath]);

    const assetClicked = useCallback((asset:CBARSurfaceAsset) => {
        setSelectedAsset(asset);
    }, []);

    useEffect(()=>{
        if (selectedAsset && selectedAsset.product) {
            setSelectedRow(selectedAsset.product.parent);
            setSelectedColumn(selectedAsset.product);
        }
    }, [selectedAsset]);

    useEffect(()=>{
        if (selectedAsset) {
            setInitialXPos(selectedAsset.surfacePosition.x);
            setInitialYPos(selectedAsset.surfacePosition.y);
            setInitialRotation(selectedAsset.surfaceRotation);
        }
    },[selectedAsset]);

    const getBaseMaterialProps = (color:ProductItem) => {
        const material:CBARMaterialProperties = {};
        material.properties = {
            roughnessValue: 0.5,
            metalnessValue: 0.07
        };

        material.ppi = color.ppi ? color.ppi : 20;
        material.crop = color.crop;
        material.mirrored = color.mirrored;
        material.mirroredX = color.mirroredX;
        material.mirroredY = color.mirroredY;

        return material;
    }

    const showMaterial = useCallback((color:ProductItem) => {
        if (!context || !selectedSurface) {
            console.log("Show material failed", selectedSurface);
            return;
        }

        const materials:CBARMaterialProperties[] = [];

        if (color.textures && color.textures.length) {
            color.textures.forEach(tex=>{
                const material = getBaseMaterialProps(color);
                if (!material.properties) material.properties = {};
                material.textures = {};

                if (tex.albedoPath) {
                    material.textures.albedo = `${brandPath}/${tex.albedoPath}`;
                }
                if (tex.normalsPath) {
                    material.textures.normals = `${brandPath}/${tex.normalsPath}`;
                }
                if (tex.roughnessPath) {
                    material.textures.roughness = `${brandPath}/${tex.roughnessPath}`;
                }
                if (tex.specularPath) {
                    material.textures.specular = `${brandPath}/${tex.specularPath}`;
                }

                materials.push(material);
            });
        } else if (color.color) {

            const material = getBaseMaterialProps(color);
            if (!material.properties) material.properties = {};
            material.textures = {};

            if (color.color) {
                material.properties.color = color.color;
            }

            materials.push(material);
        } else if (color.metaData) {
            const material = getBaseMaterialProps(color);
            material.textures = {};

            //phase out this data approach:
            if (color.metaData.hasOwnProperty("albedo")) {
                material.textures.albedo = `${brandPath}/${color.metaData.albedo}`;
            }
            if (color.metaData.hasOwnProperty("normals")) {
                material.textures.normals = `${brandPath}/${color.metaData.normals}`;
            }
            if (color.metaData.hasOwnProperty("specular")) {
                material.textures.roughness = `${brandPath}/${color.metaData.specular}`;
            }
            if (color.metaData.hasOwnProperty("mirrored")) {
                material.mirrored = color.metaData.mirrored;
            }
            if (color.metaData.hasOwnProperty("mirroredX")) {
                material.mirroredX = color.metaData.mirroredX;
            }
            if (color.metaData.hasOwnProperty("mirroredY")) {
                material.mirroredY = color.metaData.mirroredY;
            }
            if (color.metaData.hasOwnProperty("crop")) {
                material.crop = color.metaData.crop;
            }

            materials.push(material);
        }

        let elevation = 0.0;
        let currentAsset = selectedSurface.last();

        if (!currentAsset) {
            if (color.assetTypes.indexOf(CBARAssetType.PaintSurface) >= 0) {
                currentAsset = new CBARPaintAsset(context);
            } else if (color.assetTypes.indexOf(CBARAssetType.Rug) >= 0) {
                const rugAsset = currentAsset = new CBARRugAsset(context);
                rugAsset.dimensions = new THREE.Vector2(2,1);
                elevation = 0.005;
            } else {
                currentAsset = new CBARFilledTiledAsset(context);
            }
            console.log(`Created asset of type ${currentAsset.type}, at elevation ${currentAsset.surfaceElevation}m`);
            selectedSurface.add(currentAsset, elevation);
        }

        if (materials.length) {
            setSelectedAsset(currentAsset);
            currentAsset.loadProduct(color, currentAsset.type === CBARAssetType.PaintSurface ? { material:materials[0]} : { materials:materials}).then(()=>{
                setNeedsUpload(true);
            }).catch((error:any) => {
                console.error(error)
            })
        }
    }, [brandPath, context, selectedSurface]);

    const handleVisualizerEvent = useCallback((event:CBAREvent) => {
        if (!currentScene) return;

        if (event.type === CBAREventType.Rotate) {
            setToolMode(CBARToolMode.Rotate);
        } else if (event.type === CBAREventType.Translate) {
            setToolMode(CBARToolMode.Translate)
        }
        else if (event.type === CBAREventType.TouchDown) {
            const intersections = (event as CBARMouseEvent).intersections
            const assetIntersections = intersections.filter(x => x.object instanceof CBARSurfaceAsset);
            const surfaceIntersection = intersections.find(x => x.object instanceof CBARSurface);
            const surface = surfaceIntersection ? surfaceIntersection.object as CBARSurface : undefined;
            const asset = assetIntersections.length > 0 ? assetIntersections.sort((a:CBARIntersection,b:CBARIntersection)=>{
                const assetA = a.object as CBARSurfaceAsset;
                const assetB = b.object as CBARSurfaceAsset;
                if (assetA.type === assetB.type) return 0;
                return assetA.type === CBARAssetType.Rug ? -1 : 1;
            })[0].object as CBARSurfaceAsset : undefined;

            if (surface) {
                setSelectedSurface(surface);
            }

            //console.log("click", event.intersections);

            if (asset) {
                assetClicked(asset);
            }
        } else if (selectedAsset && event.type === CBAREventType.TouchMove) {
            setCurrentRotation(selectedAsset.surfaceRotation);
            setCurrentXPos(selectedAsset.surfacePosition.x);
            setCurrentYPos(selectedAsset.surfacePosition.y);
        }
    }, [assetClicked, currentScene, selectedAsset]);

    useEffect(() => {
        if (context) {
            context.setHandler(handleVisualizerEvent)
        }
    }, [context, handleVisualizerEvent]);

    useEffect(()=>{
        if (selectedColumn && selectedSurface && !selectedSurface.length()) {
            showMaterial(selectedColumn as ProductColor);
        }
    }, [selectedColumn, selectedSurface, showMaterial]);

    useEffect(()=>{
        if (selectedProduct) {
            setHasSeenProducts(true);
        }
    }, [selectedProduct]);

    const swatchSelected = useCallback((swatchItem:SwatchItem) => {
        if (swatchItem.parent && swatchItem.parent.hasColumns) {
            setSelectedColumn(selectedColumn === swatchItem ? undefined : swatchItem);
            showMaterial(swatchItem as ProductColor);
        } else {
            setSelectedRow(swatchItem);
        }

        if (swatchItem instanceof ProductCollection) {
            const collection = swatchItem as ProductCollection;
            dispatch({
                type: "setCollection",
                code: `${collection.code}`
            });
            setListingItems(swatchItem.children);
        } else if (swatchItem instanceof Product) {
            const product = swatchItem as Product;
            dispatch({
                type: "setProduct",
                code: `${product.code}`
            });
            if (product.colors.length) {
                swatchSelected(product.colors[0])
            }
        } else if (swatchItem instanceof ProductColor) {
            const color = swatchItem as ProductColor;
            dispatch({
                type: "setColor",
                code: `${color.code}`
            });
        }

    }, [dispatch, selectedColumn, showMaterial]);

    const resolveSceneThumbnailPath = useCallback((swatchItem:SwatchItem) : string | undefined => {
        if (swatchItem instanceof SceneCollection) {
            const col = swatchItem as SceneCollection;
            if (col.scenes.length) {
                return resolveSceneThumbnailPath(col.scenes[0])
            }
        } else if (swatchItem instanceof SceneInfo) {
            const scene = swatchItem as SceneInfo;
            return getScenePaths(scene.collection.code, scene.code).preview
        }

        return
    }, []);

    useEffect(() => {
        if (rootItem) {
            if (!listingItems) {
                let items = rootItem.children as DataItem[];

                const collection = siteContext.state.selectedCollection ? items.find(item=>item instanceof ProductCollection && item.code === siteContext.state.selectedCollection) as ProductCollection : undefined;
                const product = siteContext.state.selectedProduct ? (collection ? collection.products : items).find(item=>item instanceof Product && item.code === siteContext.state.selectedProduct) as Product : undefined;
                const color = siteContext.state.selectedColor ? (product ? product.colors : items).find(item=>item instanceof ProductColor && item.code === siteContext.state.selectedColor) as ProductColor : undefined;

                let selectedRw:SwatchItem|undefined;
                let selectedCol:SwatchItem|undefined;

                if (color) {
                    selectedCol = color;
                    selectedRw = color.product;
                    items = color.product.collection.products;
                } else if (product) {
                    if (product.hasColumns) {
                        selectedRw = product
                    } else {
                        selectedRw = product.collection;
                        selectedCol = product
                    }

                } else if (collection) {
                    if (collection.hasColumns) {
                        selectedRw = collection
                    } else {
                        selectedRw = collection.brand;
                        selectedCol = collection
                    }
                }

                setListingItems(items);
                setSelectedRow(selectedRw);
                setSelectedColumn(selectedCol);
            }

            if (!sceneListingItems) {
                const brand = (rootItem as DataItem).brand;
                setSceneListingItems(brand.sceneCollections)
            }
        }
    }, [listingItems, rootItem, sceneListingItems, siteContext.state.selectedCollection, siteContext.state.selectedColor, siteContext.state.selectedProduct]);



    useEffect(()=>{
        if (siteContext.state.selectedSampleRoomType && siteContext.state.selectedSampleRoom) {
            setDataPath(getScenePaths(siteContext.state.selectedSampleRoomType, siteContext.state.selectedSampleRoom).data);
        }
    }, [siteContext.state.selectedSampleRoom, siteContext.state.selectedSampleRoomType]);

    useEffect(()=>{
        if (siteContext.state.selectedRoom) {
            setDataPath(getUploadedRoomPaths(siteContext.state.selectedRoom).data);
        }
    }, [siteContext.state.selectedRoom]);

    const [isLoading, setIsLoading] = useState(false);

    useEffect(()=>{
        if (dataPath && context && rootItem && !isLoading) {
            const brand = rootItem as DataItem;
            setIsLoading(true);
            console.log("Loading static scene at path", dataPath)
            context.loadSceneAtPath(dataPath, brand.surfaceTypes).then((scene)=>{
                setCurrentScene(scene);
                setDataPath(undefined);
                console.log("Static Scene Loaded!");
                setIsLoading(false);
            }).catch(error=>{
                console.log("Could not load scene!", error);
                setIsLoading(false);
            });
        }
    }, [context, dataPath, rootItem, isLoading]);

    useEffect(() => {
        if (context && siteContext.state.sceneData && rootItem && !isLoading) {
            const brand = rootItem as DataItem;
            setIsLoading(true);
            dispatch({
                type: "setSceneData",
                sceneData: undefined
            });
            context.loadSceneData(siteContext.state.sceneData, brand.surfaceTypes).then((scene)=>{
                console.log("Dynamic Scene Loaded!");
                setCurrentScene(scene);
                setDataPath(undefined);
                setIsLoading(false);
            }).catch(error=>{
                console.log("Could not load scene!", error)
            });
        }
    }, [context, rootItem, siteContext.state.sceneData, isLoading, dispatch]);

    useEffect(()=>{
        if (currentScene) {
            const floor = currentScene.geometry.surfaces.find(surface=>surface.type === CBARSurfaceType.Floor);
            if (floor) {
                setSelectedSurface(floor);
                console.log("Set selected surface to first floor.")
            }
        }
    }, [currentScene]);

    return useMemo(() => (
        <div className={"panels " + activePanel}>
            <CBARView className={"cbarview" + (currentScene ? " has-scene":"")} onContextCreated={setContext} toolMode={toolMode} />
        </div>
    ), [activePanel, currentScene, toolMode])
}
