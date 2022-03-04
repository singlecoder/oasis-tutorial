import { Script } from "oasis-engine";

export class MyRotationComponent extends Script {
  /**
   * 主更新，逐帧调用。
   * @param deltaTime - 帧间隔时间
   */
  onUpdate(deltaTime: number) {
    let rotY = 0.05 * deltaTime;
    this.entity.transform.rotate(0, rotY, 0);
  }
}