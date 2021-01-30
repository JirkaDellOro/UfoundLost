namespace UfoundLost {
  export class Flak extends ƒ.Node {
    private crosshair: GameObject;
    private crosshairTarget: GameObject;
    private detonations: ƒ.Node;

    public constructor() {
      super("FlakGraph");
      let mtrCrosshair: ƒ.Material = new ƒ.Material("Crosshair", ƒ.ShaderTexture,
        new ƒ.CoatTextured(ƒ.Color.CSS("White"), new ƒ.TextureImage("Images/Crosshair.png"))
      );
      this.crosshair = new GameObject("Crosshair", ƒ.Vector3.Y(ufoSpaceDefinition.height), mtrCrosshair, ƒ.Vector2.ONE(0.5));
      this.crosshair.maxVelocity = 3;
      this.appendChild(this.crosshair);

      this.crosshairTarget = new GameObject("CrosshairTarget", ƒ.Vector3.Y(ufoSpaceDefinition.height - 2), mtrCrosshair, ƒ.Vector2.ONE(0.3));
      this.appendChild(this.crosshairTarget);

      this.detonations = new ƒ.Node("Detonations");
      this.appendChild(this.detonations);
    }

    public update(_timeslice: number): void {
      this.crosshair.setTargetPosition(this.crosshairTarget.mtxLocal.translation);
      this.crosshair.update(_timeslice);

      for (let detonation of this.detonations.getChildren() as Detonation[]) {
        if (detonation.update(_timeslice))
          this.detonations.removeChild(detonation);
      }
    }

    public input(_x: number, _y: number, _z: number): void {
      let move: ƒ.Vector3 = new ƒ.Vector3(_x, _y, _z);
      this.crosshairTarget.mtxLocal.translate(move);
      this.crosshairTarget.restrictPosition(ufoSpaceDefinition.min, ufoSpaceDefinition.max);
    }

    public shoot(): void {
      ƒ.Debug.fudge("shoot");
      let detonation: Detonation = new Detonation(this.crosshair.mtxLocal.translation);
      this.detonations.appendChild(detonation);
    }
  }
}
