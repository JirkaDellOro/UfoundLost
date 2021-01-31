namespace UfoundLost {
  export class Villager extends GameObject {
    public static all: ƒ.Node = new ƒ.Node("Villagers");

    private static audioScreamsMale: ƒ.Audio[] = [
      new ƒ.Audio("Audio/ScreamMale0.mp3"), new ƒ.Audio("Audio/ScreamMale1.mp3"), new ƒ.Audio("Audio/ScreamMale2.mp3"), new ƒ.Audio("Audio/ScreamMale3.mp3"), new ƒ.Audio("Audio/ScreamMale4.mp3"), new ƒ.Audio("Audio/ScreamMale5.mp3")
    ];
    private static audioScreamsFemale: ƒ.Audio[] = [
      new ƒ.Audio("Audio/ScreamFemale0.mp3"), new ƒ.Audio("Audio/ScreamFemale1.mp3"), new ƒ.Audio("Audio/ScreamFemale2.mp3"), new ƒ.Audio("Audio/ScreamFemale3.mp3"), new ƒ.Audio("Audio/ScreamFemale4.mp3")
    ];

    private static mtrMale: ƒ.Material = new ƒ.Material("VillagerMale", ƒ.ShaderTexture,
      new ƒ.CoatTextured(ƒ.Color.CSS("white"), new ƒ.TextureImage("Images/VillagerMale0.png"))
    );
    private static mtrFemale: ƒ.Material = new ƒ.Material("VillagerMale", ƒ.ShaderTexture,
      new ƒ.CoatTextured(ƒ.Color.CSS("white"), new ƒ.TextureImage("Images/VillagerFemale0.png"))
    );

    private sex: boolean = true; // Male by default
    private rotation: number = Math.random() * 4 - 2;
    private falling: boolean = false;
    private ufo: Ufo;

    constructor(_name: string, _ufo: Ufo) {
      super(_name, Villager.getStartPosition(_ufo), Villager.mtrMale, ƒ.Vector2.ONE(0.5));
      this.ufo = _ufo;

      let cmpAudio: ƒ.ComponentAudio = new ƒ.ComponentAudio(ƒ.Random.default.getElement(Villager.audioScreamsMale));
      this.sex = (Math.random() < 0.4);
      if (!this.sex) {
        cmpAudio.setAudio(ƒ.Random.default.getElement(Villager.audioScreamsFemale));
        this.getComponent(ƒ.ComponentMaterial).material = Villager.mtrFemale;
      }
      cmpAudio.volume = 0.5;
      this.addComponent(cmpAudio);
      // cmpAudio.play(true);

      this.maxVelocity = 0.4;
      this.setTargetPosition(_ufo.mtxLocal.translation);

      this.getComponent(ƒ.ComponentMesh).pivot.translateY(0.2);

      ƒ.Time.game.setTimer(1000, 1, () => this.getComponent(ƒ.ComponentAudio).play(true));

      Villager.all.appendChild(this);
    }

    private static getStartPosition(_ufo: Ufo): ƒ.Vector3 {
      let position: ƒ.Vector3 = _ufo.mtxLocal.translation;
      position.y = 0.5;
      position.z += 0.01
      return position;
    }

    public static create(_ufo: Ufo): Villager {
      let villager: Villager = new Villager("Villager", _ufo);
      return villager;
    }

    public static updateAll(_timeslice: number): void {
      for (let villager of Villager.all.getChildren() as Villager[])
        villager.update(_timeslice);
    }

    public update(_timeslice: number): void {
      super.update(_timeslice);
      this.getComponent(ƒ.ComponentMesh).pivot.rotateZ(this.rotation, true);

      if (!this.falling) return;

      let heliCatch: HELI = heliPack.catch(this);
      if (heliCatch == HELI.NONE && this.mtxLocal.translation.y > 0) return;

      if (heliCatch != HELI.CAUGHT)
        Splat.create(this.mtxLocal.translation);
      else
        ƒ.Debug.log("Villager saved!");
        
      Villager.all.removeChild(this);
      if (this.ufo)
        this.ufo.loseVillager();
    }

    public setTargetPosition(_position: ƒ.Vector3): void {
      super.setTargetPosition(_position);
      this.falling = false;
    }

    public capture(): void {
      ƒ.Debug.log("Villager captured");
      Villager.all.removeChild(this);
    }

    public fall(): void {
      this.velocity = ƒ.Vector3.Y(-1);
      this.falling = true;
    }

    public loseUfo(): void {
      this.ufo = null;
      this.fall();
    }
  }
}