namespace UfoundLost {
  export class Helicopter extends GameObject {
    private static material: ƒ.Material = new ƒ.Material("Detonation", ƒ.ShaderUniColor, new ƒ.CoatColored(ƒ.Color.CSS("yellow", 0.5)));

    constructor(_name: string, _position: ƒ.Vector3) {
      super(_name, _position, Helicopter.material);
    }
  }
}