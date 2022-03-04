import { Entity, Script } from "oasis-engine";

export class MyRevolutionComponent extends Script {
  speed: number = 0.001;

  constructor(entity: Entity) {
      super(entity);
  }
  /**
   * 主更新，逐帧调用。
   * @param deltaTime - 帧间隔时间
   */
  onUpdate(deltaTime: number) {
    const entity = this.entity;
    const t = this.engine.time.timeSinceStartup * this.speed;

    const r = entity.transform.position.length();
    const x = Math.cos(t) * r;
    const z = Math.sin(t) * r;
    entity.transform.setPosition(x, 0, z);
  }
}
