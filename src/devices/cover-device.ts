import { DeviceTypes } from 'matterbridge';
import { HomeAssistantDevice } from './home-assistant-device.js';
import { HomeAssistantClient } from '../home-assistant/home-assistant-client.js';
import { Entity } from '../home-assistant/entity/entity.js';
import { IdentifyAspect } from './aspects/identify-aspect.js';
import { CoverControlAspect } from './aspects/cover-control-aspect.js';

export class CoverDevice extends HomeAssistantDevice {
  constructor(homeAssistantClient: HomeAssistantClient, entity: Entity) {
    super(entity, DeviceTypes.WINDOW_COVERING);

    this.addAspect(new IdentifyAspect(this.matter, entity));
    this.addAspect(
      new CoverControlAspect(homeAssistantClient, this.matter, entity, {
        getValue: (entity) => entity.attributes.current_position,
        goToLiftPercentage: {
          service: 'cover.set_cover_position',
          data: (position) => ({ position }),
        },
      }),
    );
  }
}
