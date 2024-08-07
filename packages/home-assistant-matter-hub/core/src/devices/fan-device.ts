import { DeviceTypes } from '@project-chip/matter.js/device';

import { IdentifyAspect, LevelControlAspect, OnOffAspect } from '@/aspects/index.js';
import { DeviceBase, DeviceBaseConfig } from '@/devices/device-base.js';
import { ifNotNull } from '@/devices/utils/if-not-null.js';
import { HomeAssistantClient } from '@/home-assistant-client/index.js';
import { HomeAssistantMatterEntity } from '@/models/index.js';

export class FanDevice extends DeviceBase {
  constructor(client: HomeAssistantClient, entity: HomeAssistantMatterEntity, config: DeviceBaseConfig) {
    super(entity, DeviceTypes.DIMMABLE_PLUGIN_UNIT, config);

    this.addAspect(new IdentifyAspect(this.matter, entity));
    this.addAspect(new OnOffAspect(client, this.matter, entity));
    this.addAspect(
      new LevelControlAspect(client, this.matter, entity, {
        getValue: (entity) => ifNotNull<number>(entity.attributes.percentage, (p) => (p / 100) * 254),
        getMinValue: () => 0,
        getMaxValue: () => 254,
        moveToLevel: {
          service: 'fan.set_percentage',
          data: (value) => ({ percentage: (value / 254) * 100 }),
        },
      }),
    );
  }
}
