import GeoJSONLayer from '@arcgis/core/layers/GeoJSONLayer';
import EsriMap from '@arcgis/core/Map';
import SimpleRenderer from '@arcgis/core/renderers/SimpleRenderer';
import SimpleMarkerSymbol from '@arcgis/core/symbols/SimpleMarkerSymbol';

import {
  MapCommand,
  ViewCommand,
} from '@/lib/arcgis/typings/commandtypes';

import { SewageMapLayerManagerActor } from '../layermanagement/types';

// We configure a simple renderer with visual variables
// to dynamically size the glowing aura based on the delay length
const upgradePointRenderer = new SimpleRenderer({
  symbol: new SimpleMarkerSymbol({
    style: 'circle',
    color: [255, 140, 0, 0.4], // Semi-transparent bright orange glow
    outline: {
      color: [255, 165, 0, 0.8],
      width: 2,
    },
  }),
  visualVariables: [
    {
      type: "size",
      field: "Delay_length", // Must match the field in GeoJSON exactly
      stops: [
        { value: 0, size: "10px" },
        { value: 1, size: "20px" },
        { value: 2, size: "30px" },
        { value: 3, size: "40px" },
        { value: 4, size: "50px" },
        { value: 5, size: "60px" }
      ]
    }
  ] as any // visualVariables type definition requires coercion in some ArcGIS setups
});

export class AddWindrushUpgradesCommand implements MapCommand {
  private layer: __esri.GeoJSONLayer;

  constructor(private layerManagerActor: SewageMapLayerManagerActor) {
    this.layer = new GeoJSONLayer({
      url: `${import.meta.env.BASE_URL}data/windrush_upgrades.geojson`,
      copyright: 'Windrush Upgrades Highlight',
      renderer: upgradePointRenderer,
      id: 'windrush-upgrades-halo-layer',
      title: 'Windrush Delay Halo',
      popupEnabled: false, // Disabled so it doesn't block the native Thames Water popup
      outFields: ['*'],
    });
  }

  async executeOnMap(map: EsriMap): Promise<ViewCommand | void> {
    // Add it underneath other layers if possible, but standard map.add puts it on top
    // For halos, being on top with transparency looks like a nice glowing beacon
    map.add(this.layer, 0); // index 0 ensures it's underneath the native pins!
    
    this.layerManagerActor.send({
      type: 'LAYER.ADD',
      params: {
        layerConfig: {
          layerType: 'layer',
          layerId: this.layer.id,
          layerName: this.layer.title ?? this.layer.id,
          parentId: 'upgrades',
          layerData: null,
        },
        visible: 'inherit',
      },
    });
  }
}
