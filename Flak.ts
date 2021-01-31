namespace UfoundLost {
  import ƒAid = FudgeAid;

  export class Flak extends ƒ.Node {
    private crosshair: GameObject;
    private crosshairTarget: GameObject;
    private detonations: ƒ.Node;
    private cannon: ƒ.Node;

    // private static audioShot: ƒ.Audio = new ƒ.Audio("Audio/Shot.mp3");

    public constructor() {
      super("FlakGraph");
      let mtrCrosshair: ƒ.Material = new ƒ.Material("Crosshair", ƒ.ShaderTexture,
        new ƒ.CoatTextured(ƒ.Color.CSS("White"), new ƒ.TextureImage("Images/Crosshair.png"))
      );
      this.crosshair = new GameObject("Crosshair", ƒ.Vector3.Y(ufoSpaceDefinition.height), mtrCrosshair, ƒ.Vector2.ONE(0.5));
      this.crosshair.maxVelocity = 3;
      this.appendChild(this.crosshair);

      this.crosshairTarget = new GameObject("CrosshairTarget", ƒ.Vector3.Y(ufoSpaceDefinition.height), mtrCrosshair, ƒ.Vector2.ONE(0.3));
      this.appendChild(this.crosshairTarget);

      this.detonations = new ƒ.Node("Detonations");
      this.appendChild(this.detonations);
      this.cannon = this.createCannon();
      this.appendChild(this.cannon);

      this.input(0.01, 0, 0);
      // this.addComponent(new ƒ.ComponentAudio(Flak.audioShot));
    }

    public update(_timeslice: number): void {
      this.crosshair.setTargetPosition(this.crosshairTarget.mtxLocal.translation);
      this.crosshair.update(_timeslice);

      let bearing: ƒ.Matrix4x4 = Reflect.get(this.cannon, "bearingLocal");
      bearing.lookAt(this.crosshair.mtxLocal.translation);
      let pivot: ƒ.Matrix4x4 = Reflect.get(this.cannon, "barrelPivot");
      if (pivot.translation.z < 0.2)
        pivot.translateZ((0.2 - pivot.translation.z) / 5);

      for (let detonation of this.detonations.getChildren() as Detonation[]) {
        if (detonation.update(_timeslice))
          this.detonations.removeChild(detonation);
      }
    }

    public input(_x: number, _y: number, _z: number): void {
      let move: ƒ.Vector3 = new ƒ.Vector3(_x, _y, _z);
      this.crosshairTarget.mtxLocal.translate(move);
      this.crosshairTarget.restrictPosition(ufoSpaceDefinition.min, ufoSpaceDefinition.max);
      this.crosshair.restrictPosition(ufoSpaceDefinition.min, ufoSpaceDefinition.max);
    }

    public shoot(): void {
      // ƒ.Debug.fudge("shoot");
      let detonation: Detonation = new Detonation(this.crosshair.mtxLocal.translation);
      this.detonations.appendChild(detonation);

      let pivot: ƒ.Matrix4x4 = Reflect.get(this.cannon, "barrelPivot");
      pivot.translation = ƒ.Vector3.Z(0.0);

      // this.getComponent(ƒ.ComponentAudio).play(true);
    }

    private createCannon(): ƒ.Node {
      let cannon: ƒAid.Node = new ƒAid.Node("Cannon", ƒ.Matrix4x4.TRANSLATION(ƒ.Vector3.Z(5)));
      let mtrCannon: ƒ.Material = new ƒ.Material("Cannon", ƒ.ShaderFlat, new ƒ.CoatColored(ƒ.Color.CSS("lightgrey")));
      let meshCannon: ƒ.MeshCube = new ƒ.MeshCube();

      let barrel: ƒAid.Node = new ƒAid.Node("Barrel", ƒ.Matrix4x4.IDENTITY(), mtrCannon, meshCannon);
      let pivot: ƒ.Matrix4x4 = barrel.getComponent(ƒ.ComponentMesh).pivot;
      pivot.rotateZ(45);
      pivot.scale(new ƒ.Vector3(0.05, 0.05, 0.3));
      pivot.translateZ(0.2);


      cannon.appendChild(new ƒAid.Node("Pod1", ƒ.Matrix4x4.SCALING(new ƒ.Vector3(0.2, 0.02, 0.02)), mtrCannon, meshCannon));
      cannon.appendChild(new ƒAid.Node("Pod2", ƒ.Matrix4x4.SCALING(new ƒ.Vector3(0.02, 0.02, 0.2)), mtrCannon, meshCannon));
      let bearing: ƒ.Node = new ƒAid.Node("Bearing", ƒ.Matrix4x4.TRANSLATION(ƒ.Vector3.Y(0.2)), mtrCannon,
        new ƒ.MeshSphere("Bearing", 6, 6)
      );
      bearing.getComponent(ƒ.ComponentMesh).pivot.scale(new ƒ.Vector3(0.1, 0.1, 0.3));
      cannon.appendChild(bearing)
      bearing.appendChild(barrel);

      Reflect.set(cannon, "barrelPivot", pivot);
      Reflect.set(cannon, "bearingLocal", cannon.getChildrenByName("Bearing")[0].mtxLocal);
      return cannon;
    }
  }
}
