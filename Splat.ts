namespace UfoundLost {
  export class Splat extends GameObject {
    private static frames: number = 20;
    private static timeFrame: number = 30;
    private static audio: ƒ.Audio[] = [
      new ƒ.Audio("Audio/Splat0.mp3"), new ƒ.Audio("Audio/Splat1.mp3"), new ƒ.Audio("Audio/Splat2.mp3")
    ];
    private static material: ƒ.Material = new ƒ.Material("Splat", ƒ.ShaderTexture,
      new ƒ.CoatTextured(ƒ.Color.CSS("white"), new ƒ.TextureImage("Images/Splat.png"))
    );

    private constructor(_name: string, _position: ƒ.Vector3) {
      super(_name, _position, Splat.material, ƒ.Vector2.ONE(0.5));
      let cmpAudio: ƒ.ComponentAudio = new ƒ.ComponentAudio(ƒ.Random.default.getElement(Splat.audio), false, true);
      cmpAudio.volume = 1;
      this.addComponent(cmpAudio);

      ƒ.Time.game.setTimer(Splat.timeFrame, Splat.frames, this.hndTimer);
      graph.appendChild(this);
    }

    public static create(_position: ƒ.Vector3, _alien: boolean = false) {
      let splat: Splat = new Splat("Splat", _position);
      splat.getComponent(ƒ.ComponentMaterial).clrPrimary = ƒ.Color.CSS(_alien ? "lime" : "red");
    }

    private hndTimer = (_event: ƒ.EventTimer): void => {
      if (_event.lastCall) {
        graph.removeChild(this);
      }
      let ratio: number = _event.count / Splat.frames;
      let cmpMaterial: ƒ.ComponentMaterial = this.getComponent(ƒ.ComponentMaterial);
      cmpMaterial.clrPrimary.a = ratio;
    }
  }
}