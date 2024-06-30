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
    const serer = WindowCoveringCluster.with('Lift');
    return this.device.getClusterServer(serer)!;
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
    request: { liftPercent100thsValue },
  }: {
    request: { liftPercent100thsValue: number };
  }) => {
    this.log.debug(`FROM MATTER: ${this.entityId} changed value to ${liftPercent100thsValue}`);

    const [domain, service] = this.config.goToLiftPercentage.service.split('.');
    await this.homeAssistantClient.callService(
      domain,
      service,
      this.config.goToLiftPercentage.data(liftPercent100thsValue),
      {
        entity_id: this.entityId,
      },
    );
  };

  async update(state: Entity): Promise<void> {
    const windowControlClusterServer = this.windowCoveringCluster!;

    const position = this.config.getValue(state);
    if (windowControlClusterServer === undefined) throw new Error('Window covering cluster server is not defined');
    if (windowControlClusterServer.getNumberOfActuationsLiftAttribute === undefined)
      throw new Error('Number of actuations lift attribute is not defined');

    const matterState = windowControlClusterServer?.getNumberOfActuationsLiftAttribute();

    if (position != null && !state && matterState !== position) {
      this.log.debug(`FROM HA: ${this.entityId} changed value to ${position}`);
      windowControlClusterServer.setNumberOfActuationsLiftAttribute(state);
    }
  }
}
