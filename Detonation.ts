namespace UfoundLost {
  import ƒAid = FudgeAid;
  export class Detonation extends ƒAid.Node {
    private static mesh: ƒ.MeshSphere = new ƒ.MeshSphere("Detonation", 10, 10);
    private static material: ƒ.Material = new ƒ.Material("Detonation", ƒ.ShaderUniColor, new ƒ.CoatColored(ƒ.Color.CSS("gray")));
    // private static material: ƒ.Material = new ƒ.Material("Detonation", ƒ.ShaderTexture,
    //   new ƒ.CoatTextured(ƒ.Color.CSS("white"), new ƒ.TextureImage("Images/Smoke.png"))
    // );
    private static radius: number = 2;

    constructor(_position: ƒ.Vector3) {
      super("Detonation", ƒ.Matrix4x4.TRANSLATION(_position), Detonation.material, Detonation.mesh);
      this.getComponent(ƒ.ComponentMesh).pivot.scaling = ƒ.Vector3.ONE(Detonation.radius);
      // this.getComponent(ƒ.ComponentMaterial).pivot.scaling = ƒ.Vector2.ONE(10);
    }

    public update(_timeslice: number): boolean {
      let cmpMaterial = this.getComponent(ƒ.ComponentMaterial);
      cmpMaterial.clrPrimary.a -= _timeslice;
      return (cmpMaterial.clrPrimary.a < 0)
    }
  }
}