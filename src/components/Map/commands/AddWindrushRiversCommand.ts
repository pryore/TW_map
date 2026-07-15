import GeoJSONLayer from '@arcgis/core/layers/GeoJSONLayer';
import EsriMap from '@arcgis/core/Map';
import SimpleRenderer from '@arcgis/core/renderers/SimpleRenderer';
import SimpleLineSymbol from '@arcgis/core/symbols/SimpleLineSymbol';

import {
  MapCommand,
  ViewCommand,
} from '@/lib/arcgis/typings/commandtypes';

import { SewageMapLayerManagerActor } from '../layermanagement/types';

const customRiverRenderer = new SimpleRenderer({
  symbol: new SimpleLineSymbol({
    color: [59, 130, 246, 1], // `#3b82f6` (light blue)
    width: 2, // crisp width
    cap: "round",
    join: "round"
  }),
});

export class AddWindrushRiversCommand implements MapCommand {
  private layer: __esri.GeoJSONLayer;

  constructor(private layerManagerActor: SewageMapLayerManagerActor) {
    this.layer = new GeoJSONLayer({
      url: `${import.meta.env.BASE_URL}data/windrush_rivers.geojson`,
      copyright: 'Cotswolds Rivers Trust',
      renderer: customRiverRenderer,
      id: 'downstream-discharge-windrush-rivers', // The prefix `downstream-discharge-` ensures it gets clipped by the boundary filter!
      title: 'Windrush Custom Rivers',
      outFields: ['*'],
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
  }
}
