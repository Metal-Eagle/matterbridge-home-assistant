import { MatterbridgeDevice, WindowCoveringCluster } from 'matterbridge';
import { MatterbridgeDeviceCommands } from '../../util/matterbrigde-device-commands.js';
import { Entity } from '../../home-assistant/entity/entity.js';
import { HomeAssistantClient } from '../../home-assistant/home-assistant-client.js';
import { MatterAspect } from './matter-aspect.js';

export interface OpenCloseAspectConfig {
  isOpen?: (state: Entity) => boolean;
  openCover?: {
    service?: string;
    data?: (value: boolean) => object;
  };
  closeCover?: {
    service?: string;
    data?: (value: boolean) => object;
  };
}

export class OpenCloseAspect extends MatterAspect<Entity> {
  constructor(
    private readonly homeAssistantClient: HomeAssistantClient,
    private readonly device: MatterbridgeDevice,
    entity: Entity,
    private readonly config?: OpenCloseAspect,
  ) {
    super(entity.entity_id);
    this.log.setLogName('openCloseAspect');

    device.createDefaultWindowCoveringClusterServer();
    device.addCommandHandler('upOrOpen', this.openCover.bind(this));
    device.addCommandHandler('downOrClose', this.closeCover.bind(this));
  }

  private get openCloseCluster() {
    return this.device.getClusterServer(WindowCoveringCluster);
  }

  private openCover: MatterbridgeDeviceCommands['upOrOpen'] = async () => {
    this.log.debug(`FROM MATTER: ${this.entityId} changed open close state to OPEN`);
    this.openCloseCluster!.setTargetPositionLiftPercent100thsAttribute(100);
    const [domain, service] = this.config?.openCover?.service?.split('.') ?? ['homeassistant', 'open_cover'];
    await this.homeAssistantClient.callService(domain, service, this.config?.openCover?.data?.(100), {
      entity_id: this.entityId,
    });
  };

  private closeCover: MatterbridgeDeviceCommands['downOrClose'] = async () => {
    this.log.debug(`FROM MATTER: ${this.entityId} changed on close state to CLOSE`);
    this.openCloseCluster!.setTargetPositionLiftPercent100thsAttribute(0);
    const [domain, service] = this.config?.closeCover?.service?.split('.') ?? ['homeassistant', 'close_cover'];
    await this.homeAssistantClient.callService(domain, service, this.config?.closeCover?.data?.(0), {
      entity_id: this.entityId,
    });
  };

  async update(state: Entity): Promise<void> {
    const windowCoveringCluster = this.openCloseCluster!;
    const isOpenFn = this.config?.openCover ?? ((entity: Entity) => entity.state !== 'open');
    const isOpen = isOpenFn(state);
    if (windowCoveringCluster.getCurrentPositionLiftPercent100thsAttribute() !== isOpen) {
      this.log.debug(`FROM HA: ${state.entity_id} changed open-close state to ${state.state}`);
      windowCoveringCluster.setTargetPositionLiftPercent100thsAttribute(100);
    }
  }
}
