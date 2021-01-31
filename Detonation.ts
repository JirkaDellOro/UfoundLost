///<reference path="GameObject.ts"/>
namespace UfoundLost {
  export class Detonation extends GameObject {
    private static audio: ƒ.Audio = new ƒ.Audio("Audio/Detonation.mp3");
    private static material: ƒ.Material = new ƒ.Material("Detonation", ƒ.ShaderTexture,
      new ƒ.CoatTextured(new ƒ.Color(1, 0.4, 0.2), new ƒ.TextureImage("Images/Smoke.png"))
    );
    private static radius: number = 2;

    constructor(_position: ƒ.Vector3) {
      super("Detonation", _position, Detonation.material, ƒ.Vector2.ONE(Detonation.radius));
      // this.getComponent(ƒ.ComponentMaterial).pivot.scaling = ƒ.Vector2.ONE(10);
      this.velocity = ƒ.Vector3.Y(0.3);
      let cmpAudio: ƒ.ComponentAudio = new ƒ.ComponentAudio(Detonation.audio);
      this.addComponent(cmpAudio);
      cmpAudio.play(true);
    }

    public update(_timeslice: number): boolean {
      super.update(_timeslice);
      let cmpMaterial = this.getComponent(ƒ.ComponentMaterial);
      cmpMaterial.clrPrimary.a -= _timeslice;
      return (cmpMaterial.clrPrimary.a < 0)
    }
  }
}