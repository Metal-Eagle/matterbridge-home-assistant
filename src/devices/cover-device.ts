import { DeviceTypes } from 'matterbridge';
import { HomeAssistantDevice } from './home-assistant-device.js';
import { HomeAssistantClient } from '../home-assistant/home-assistant-client.js';
import { Entity } from '../home-assistant/entity/entity.js';

import { OpenCloseAspect } from './aspects/open-close-aspect.js';

export class CoverDevice extends HomeAssistantDevice {
  constructor(homeAssistantClient: HomeAssistantClient, entity: Entity) {
    super(entity, DeviceTypes.WINDOW_COVERING);

    this.addAspect(new OpenCloseAspect(homeAssistantClient, this.matter, entity));
  }
}
