namespace UfoundLost {
  import ƒAid = FudgeAid;

  export class HeliPack extends GameObject {
    private static mesh: ƒ.MeshCube = new ƒ.MeshCube("HeliPack");
    private static material: ƒ.Material = new ƒ.Material("Helipack", ƒ.ShaderUniColor, new ƒ.CoatColored(ƒ.Color.CSS("aqua", 0.5)));

    constructor(_position: ƒ.Vector3, _size: ƒ.Vector3) {
      super("HeliPack", _position, HeliPack.material);
      this.getComponent(ƒ.ComponentMesh).pivot.scale(ƒ.Vector3.ZERO()); // remove the sprite for now, maybe useful later

      let catcher: ƒAid.Node = new ƒAid.Node("Catcher", ƒ.Matrix4x4.IDENTITY(), HeliPack.material, HeliPack.mesh);
      catcher.getComponent(ƒ.ComponentMesh).pivot.scale(_size);
      this.appendChild(catcher);

      this.appendChild( new Helicopter("Helicopter", new ƒ.Vector3(-_size.x/2, 0.2, -_size.z/2)));
      this.appendChild( new Helicopter("Helicopter", new ƒ.Vector3(_size.x/2, 0.2, -_size.z/2)));
      this.appendChild( new Helicopter("Helicopter", new ƒ.Vector3(-_size.x/2, 0.2, _size.z/2 +0.1)));
      this.appendChild( new Helicopter("Helicopter", new ƒ.Vector3(_size.x/2, 0.2, _size.z/2 +0.1)));
    }

    public input(_x: number, _z: number): void {
      let move: ƒ.Vector3 = new ƒ.Vector3(_x, 0, _z);
      this.mtxLocal.translate(move);
      this.restrictPosition(heliSpaceDefinition.min, heliSpaceDefinition.max);
    }
  }
}