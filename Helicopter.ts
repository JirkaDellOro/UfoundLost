namespace UfoundLost {
  export class Helicopter extends GameObject {
    // private static material: ƒ.Material = new ƒ.Material("Helicopter", ƒ.ShaderUniColor, new ƒ.CoatColored(ƒ.Color.CSS("yellow", 0.5)));
    private static material: ƒ.Material = new ƒ.Material("Helicopter", ƒ.ShaderTexture,
      new ƒ.CoatTextured(ƒ.Color.CSS("white"), new ƒ.TextureImage("Images/Helicopter.png"))
    );

    constructor(_name: string, _position: ƒ.Vector3) {
      super(_name, _position, Helicopter.material, ƒ.Vector2.ONE(0.5));
    }
  }
}