namespace UfoundLost {
  import ƒAid = FudgeAid;

  export class HeliPack extends GameObject {
    private static mesh: ƒ.MeshCube = new ƒ.MeshCube("HeliPack");
    private static mtrCatcherBox: ƒ.Material = new ƒ.Material("Helipack", ƒ.ShaderUniColor, new ƒ.CoatColored(ƒ.Color.CSS("Black", 0.5)));
    private static mtrNet: ƒ.Material = new ƒ.Material("Net", ƒ.ShaderTexture,
      new ƒ.CoatTextured(ƒ.Color.CSS("white", 0.5), new ƒ.TextureImage("Images/Net.png"))
    );

    constructor(_position: ƒ.Vector3, _size: ƒ.Vector3) {
      super("HeliPack", _position, HeliPack.mtrCatcherBox);
      this.getComponent(ƒ.ComponentMesh).pivot.scale(ƒ.Vector3.ZERO()); // remove the sprite for now, maybe useful later

      
      
      this.appendChild(new Helicopter("Helicopter", new ƒ.Vector3(-_size.x / 2, 0.2, -_size.z / 2)));
      this.appendChild(new Helicopter("Helicopter", new ƒ.Vector3(_size.x / 2, 0.2, -_size.z / 2)));
      this.appendChild(new Helicopter("Helicopter", new ƒ.Vector3(-_size.x / 2, 0.2, _size.z / 2 + 0.1)));
      this.appendChild(new Helicopter("Helicopter", new ƒ.Vector3(_size.x / 2, 0.2, _size.z / 2 + 0.1)));
      this.getChildren()[1].getComponent(ƒ.ComponentMesh).pivot.rotateY(180);
      this.getChildren()[3].getComponent(ƒ.ComponentMesh).pivot.rotateY(180);
      
      let net: GameObject = new GameObject("Net", ƒ.Vector3.Y(-0.1), HeliPack.mtrNet, new ƒ.Vector2(_size.x, _size.z), ƒ.Vector3.X(-90));
      net.getComponent(ƒ.ComponentMaterial).pivot.scale(ƒ.Vector2.ONE(2));
      this.appendChild(net);
      
      let catcher: ƒAid.Node = new ƒAid.Node("Catcher", ƒ.Matrix4x4.IDENTITY(), HeliPack.mtrCatcherBox, HeliPack.mesh);
      let cmpMeshCatcher: ƒ.ComponentMesh = catcher.getComponent(ƒ.ComponentMesh);
      cmpMeshCatcher.pivot.translateY(-0.1);
      cmpMeshCatcher.pivot.scale(_size);
      cmpMeshCatcher.pivot.scaleY(0.5);
      // cmpMeshCatcher.activate(false);
      this.appendChild(catcher);
    }

    public input(_x: number, _z: number): void {
      let move: ƒ.Vector3 = new ƒ.Vector3(_x, 0, _z);
      this.mtxLocal.translate(move);
      this.restrictPosition(heliSpaceDefinition.min, heliSpaceDefinition.max);
    }
  }
}