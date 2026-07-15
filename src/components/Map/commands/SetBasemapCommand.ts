import Basemap from '@arcgis/core/Basemap';
import EsriMap from '@arcgis/core/Map';

import { MapCommand } from '@/lib/arcgis/typings/commandtypes';

export class SetBasemapCommand implements MapCommand {
  constructor() { }

  async executeOnMap(map: EsriMap): Promise<void> {
    map.basemap = 'gray' as unknown as Basemap;
  }
}
