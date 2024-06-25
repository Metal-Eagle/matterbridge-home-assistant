import { MatterAspect } from './matter-aspect.js';
import { Entity } from '../../home-assistant/entity/entity.js';
import { HomeAssistantClient } from '../../home-assistant/home-assistant-client.js';
import { WindowCoveringCluster, MatterbridgeDevice } from 'matterbridge';
import { MatterbridgeDeviceCommands } from '../../util/matterbrigde-device-commands.js';


export interface CoverControlAspectConfig {
  getValue: (entity: Entity) => number | undefined;
  goToLiftPercentage: {
    service: string;
    data: (value: number) => object;
  };
}

export class CoverControlAspect extends MatterAspect<Entity> {
  private get windowCoveringCluster() {
    return this.device.getClusterServer(WindowCoveringCluster);
  }

  constructor(
    private readonly homeAssistantClient: HomeAssistantClient,
    private readonly device: MatterbridgeDevice,
    entity: Entity,
    private readonly config: CoverControlAspectConfig,
  ) {
    super(entity.entity_id);
    this.log.setLogName('CoverControlAspect');
    this.log.debug(`Entity ${entity.entity_id} supports level control`);

    device.createDefaultWindowCoveringClusterServer();
    device.addCommandHandler('goToLiftPercentage', this.goToLiftPercentage.bind(this));
  }

  private goToLiftPercentage: MatterbridgeDeviceCommands['goToLiftPercentage'] = async ({
    request: { position },
  }: {
    request: { position: number };
  }) => {
    this.log.debug(`FROM MATTER: ${this.entityId} changed value to ${position}`);
    this.windowCoveringCluster!.setTargetPositionLiftPercent100thsAttribute(position);

    const [domain, service] = this.config.goToLiftPercentage.service.split('.');
    await this.homeAssistantClient.callService(domain, service, this.config.goToLiftPercentage.data(position), {
      entity_id: this.entityId,
    });
  };

  async update(state: Entity): Promise<void> {
    const windowControlClusterServer = this.windowCoveringCluster!;

    const position = this.config.getValue(state);
    if (
      position != null &&
      windowControlClusterServer.getCurrentPositionLiftPercent100thsAttribute() / 100 !== position
    ) {
      this.log.debug(`FROM HA: ${this.entityId} changed value to ${position}`);
      windowControlClusterServer.setCurrentPositionLiftPercent100thsAttribute(position * 100);
    }
  }
}
