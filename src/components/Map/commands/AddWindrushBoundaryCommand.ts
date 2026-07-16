import GeoJSONLayer from '@arcgis/core/layers/GeoJSONLayer';
import EsriMap from '@arcgis/core/Map';
import SimpleRenderer from '@arcgis/core/renderers/SimpleRenderer';
import SimpleLineSymbol from '@arcgis/core/symbols/SimpleLineSymbol';
import SimpleFillSymbol from '@arcgis/core/symbols/SimpleFillSymbol';
import FeatureFilter from '@arcgis/core/layers/support/FeatureFilter';
import FeatureEffect from '@arcgis/core/layers/support/FeatureEffect';
import * as geometryEngine from '@arcgis/core/geometry/geometryEngine';

import {
    MapCommand,
    ViewCommand,
} from '@/lib/arcgis/typings/commandtypes';

import { SewageMapLayerManagerActor } from '../layermanagement/types';

const windrushRenderer = new SimpleRenderer({
    symbol: new SimpleFillSymbol({
        color: [0, 0, 255, 0.15], // semi-transparent blue fill
        outline: new SimpleLineSymbol({
            color: [0, 0, 139, 1], // dark blue
            width: 2.5,
        }),
    }),
});

export class AddWindrushBoundaryCommand implements MapCommand {
    private layer: __esri.GeoJSONLayer;

    constructor(private layerManagerActor: SewageMapLayerManagerActor) {
        this.layer = new GeoJSONLayer({
            url: `${import.meta.env.BASE_URL}data/windrush_boundary.geojson`,
            copyright: 'Windrush Catchment',
            renderer: windrushRenderer,
            id: 'windrush-catchment-boundary',
            title: 'Windrush Catchment Boundary',
            outFields: ['*'],
            featureEffect: new FeatureEffect({
                includedEffect: 'drop-shadow(3px, 3px, 5px, #00000055)'
            }),
        });
    }

    async executeOnMap(map: EsriMap): Promise<ViewCommand | void> {
        map.add(this.layer);
        this.layerManagerActor.send({
            type: 'LAYER.ADD',
            params: {
                layerConfig: {
                    layerType: 'layer',
                    layerId: this.layer.id,
                    layerName: this.layer.title ?? this.layer.id,
                    parentId: 'Windrush Catchment',
                    layerData: null,
                },
                visible: 'inherit',
            },
        });

        return {
            executeOnView: async (view: __esri.MapView) => {
                // Wait for the layer to finish loading features to extract its polygon
                await view.whenLayerView(this.layer);

                // Query to get the polygon geometry of the Catchment boundary
                const query = this.layer.createQuery();
                query.outSpatialReference = view.spatialReference;
                query.returnGeometry = true;

                const results = await this.layer.queryFeatures(query);

                if (results.features.length > 0) {
                    const boundaryGeometry = results.features[0].geometry;

                    // Apply this spatial filter to all relevant discharge layers 
                    const targetLayers = view.map.layers.filter(l =>
                        l.id.startsWith('discharge-sources-') ||
                        l.id.startsWith('downstream-impact-') ||
                        l.id.startsWith('downstream-discharge-')
                    );

                    await Promise.all(targetLayers.map(async (l: __esri.Layer) => {
                        // We can only apply spatial filters to layers that support it (FeatureLayer, GeoJSONLayer)
                        if (l.type === 'feature' || l.type === 'geojson') {
                            const targetLayerView = await view.whenLayerView(l as __esri.FeatureLayer | __esri.GeoJSONLayer);
                            const paddedBoundary = geometryEngine.buffer(boundaryGeometry as __esri.Polygon, 2, "kilometers") as __esri.Polygon;
                            const filter = new FeatureFilter({
                                geometry: paddedBoundary,
                                spatialRelationship: "intersects"
                            });

                            // Hide features outside the windrush
                            const featureEffect = new FeatureEffect({
                                filter: filter,
                                excludedEffect: "opacity(0)" // exclude outside
                            });

                            // NOTE: sometimes targetLayerView.featureEffect doesn't immediately reflect or requires TS casts
                            // @ts-ignore
                            targetLayerView.featureEffect = featureEffect;
                            // @ts-ignore
                            targetLayerView.filter = filter;
                        }
                    }));
                }
            }
        };
    }
}
