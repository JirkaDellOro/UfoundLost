///<reference path="GameObject.ts"/>
///<reference path="Villager.ts"/>
namespace UfoundLost {
  export class Alien extends Villager {

    private static audio: ƒ.Audio = new ƒ.Audio("Audio/WilhelmScream.mp3");
    private static material: ƒ.Material = new ƒ.Material("Alien", ƒ.ShaderTexture,
      new ƒ.CoatTextured(ƒ.Color.CSS("white"), new ƒ.TextureImage("Images/Alien.png"))
    );

    constructor(_name: string, _ufo: Ufo) {
      super(_name, _ufo);
      let cmpAudio: ƒ.ComponentAudio = this.getComponent(ƒ.ComponentAudio);
      cmpAudio.setAudio(Alien.audio);
      this.getComponent(ƒ.ComponentMaterial).material = Alien.material;
      this.mtxLocal.translation = _ufo.mtxLocal.translation;
      this.fall();
    }
  }
}