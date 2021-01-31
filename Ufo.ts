namespace UfoundLost {
  // import ƒAid = FudgeAid;
  enum JOB {
    ROAM, LURK, PREPARE, TRACTOR, EVADE, HIT, STRUGGLE, EXPLODE
  }

  export class Ufo extends GameObject {
    public static all: ƒ.Node = new ƒ.Node("Ufos");

    private static audioMoves: ƒ.Audio[] = [
      new ƒ.Audio("Audio/UfoMove0.mp3"), new ƒ.Audio("Audio/UfoMove1.mp3"), new ƒ.Audio("Audio/UfoMove2.mp3")
    ];
    private static audioPrepare: ƒ.Audio = new ƒ.Audio("Audio/Ufo0.mp3");
    private static audioTractor: ƒ.Audio = new ƒ.Audio("Audio/Beam0.mp3");
    private static audioHit: ƒ.Audio = new ƒ.Audio("Audio/UfoHit.mp3");
    // private static material: ƒ.Material = new ƒ.Material("Ufo", ƒ.ShaderUniColor, new ƒ.CoatColored(ƒ.Color.CSS("black", 0.5)));
    // private static mtrTractor: ƒ.Material = new ƒ.Material("Ufo", ƒ.ShaderUniColor, new ƒ.CoatColored(ƒ.Color.CSS("pink", 0.5)));
    private static material: ƒ.Material = new ƒ.Material("Ufo", ƒ.ShaderTexture,
      new ƒ.CoatTextured(ƒ.Color.CSS("white"), new ƒ.TextureImage("Images/Ufo.png"))
    );
    private static mtrTractor: ƒ.Material = new ƒ.Material("Ufo", ƒ.ShaderTexture,
      new ƒ.CoatTextured(ƒ.Color.CSS("white", 0.4), new ƒ.TextureImage("Images/TractorBeam.png"))
    );
    private static maxTimeToWiggle: number = 2000; //milliseconds
    private static maxVelocity: number = 5;

    private job: JOB;
    private timeForNextJob: number = 0;
    private tractor: GameObject;
    private villager: Villager;
    private damage: number = 0;
    private timeToWiggle: number = 0;

    constructor() {
      super("Ufo", Ufo.getStartPosition(), Ufo.material, ƒ.Vector2.ONE(0.5));
      this.tractor = this.createTractorBeam();

      this.addComponent(new ƒ.ComponentAudio())
      this.addComponent(new ƒ.ComponentAudio(Ufo.audioHit)) // for hit sound
      Ufo.all.appendChild(this);

      this.roam();
    }

    public static updateAll(_timeslice: number): void {
      for (let ufo of Ufo.all.getChildren() as Ufo[])
        ufo.update(_timeslice);
    }

    public static checkAllForHit(_position: ƒ.Vector3, _radius: number): void {
      for (let ufo of Ufo.all.getChildren() as Ufo[])
        if (ufo.mtxLocal.translation.isInsideSphere(_position, _radius))
          ufo.hit(1 - ƒ.Vector3.DIFFERENCE(ufo.mtxLocal.translation, _position).magnitude / _radius);
    }

    public hit(_power: number): void {
      // ƒ.Debug.warn(_power);
      let cmpAudio: ƒ.ComponentAudio = this.getComponents(ƒ.ComponentAudio)[1];
      cmpAudio.volume = _power;
      cmpAudio.play(true);

      if (this.villager)
        this.villager.fall();

      // this.damage += _power;
      if (this.damage > 1) {
        this.job = JOB.EXPLODE;
        return;
      }

      this.timeToWiggle = ƒ.Time.game.get() + Ufo.maxTimeToWiggle * _power;
      if (this.job == JOB.TRACTOR)
        this.job = JOB.STRUGGLE;
      else
        this.job = JOB.HIT;
    }

    public loseVillager(): void {
      this.villager = null;
      this.job = JOB.HIT;
    }

    public update(_timeslice: number): void {
      super.update(_timeslice);

      let position: ƒ.Vector3 = this.mtxLocal.translation;
      let atTarget: boolean = this.atTarget(_timeslice);
      // let jobPrevious: JOB = this.job;
      let cmpAudio: ƒ.ComponentAudio = this.getComponent(ƒ.ComponentAudio);

      switch (this.job) {
        case JOB.ROAM:
          if (!atTarget) break; // keep roamin
          this.job = JOB.LURK;
          this.velocity = ƒ.Vector3.ZERO();
          this.timeForNextJob = ƒ.Time.game.get() + 1000 * ƒ.Random.default.getRange(1, 3);
          break;
        case JOB.LURK:
          if (ƒ.Time.game.get() < this.timeForNextJob) break; // keep lurking
          if (Math.random() < 0.2) {
            this.maxVelocity = 1;
            this.setTargetPosition(new ƒ.Vector3(position.x, ufoSpaceDefinition.min.y, position.z));
            this.job = JOB.PREPARE;
            cmpAudio.setAudio(Ufo.audioPrepare);
            cmpAudio.volume = 0.1;
            cmpAudio.play(true);
            break;
          }
          this.roam();
          break;
        case JOB.PREPARE:
          if (!atTarget) break; // keep preparing
          this.job = JOB.TRACTOR;
          this.velocity = ƒ.Vector3.ZERO();
          this.activateTractor(true);
          this.timeForNextJob = ƒ.Time.game.get() + 1000 * ƒ.Random.default.getRange(10, 15);
          cmpAudio.volume = 0.5;
          cmpAudio.setAudio(Ufo.audioTractor);
          cmpAudio.play(true);
          this.villager = Villager.create(this);
          break;
        case JOB.TRACTOR:
          this.tractor.getComponent(ƒ.ComponentMaterial).pivot.translateY(0.02);
          // if (ƒ.Time.game.get() < this.timeForNextJob) break; // keep sucking
          if (!this.villager.atTarget(_timeslice)) break; // keep sucking
          this.villager.capture();
          this.villager = null;
          this.roam();
          break;
        case JOB.HIT:
          if (this.wiggle()) break; // keep wiggeling
          this.roam();
          break;
        case JOB.STRUGGLE:
          this.activateTractor(ƒ.Random.default.getBoolean());
          if (this.wiggle()) break; // keep wiggeling
          this.activateTractor(this.villager != null);
          if (!this.villager)
            this.roam();
          else {
            this.activateTractor(true);
            this.villager.setTargetPosition(this.mtxLocal.translation);
            this.job = JOB.TRACTOR;
          }
          break;
        case JOB.EXPLODE:
          Ufo.all.removeChild(this);
          if (this.villager)
            this.villager.loseUfo();
          break;
      }
      // if (jobPrevious != this.job)
      // ƒ.Debug.fudge(JOB[this.job]);
    }

    public activateTractor(_on: boolean): void {
      this.tractor.getComponent(ƒ.ComponentMesh).activate(_on);
    }

    private roam(): void {
      this.activateTractor(false);
      this.maxVelocity = Ufo.maxVelocity;
      this.findTargetPosition();
      this.job = JOB.ROAM;

      let cmpAudio: ƒ.ComponentAudio = this.getComponent(ƒ.ComponentAudio);
      cmpAudio.volume = 1;
      cmpAudio.setAudio(ƒ.Random.default.getElement(Ufo.audioMoves));
      cmpAudio.play(true);
    }

    private wiggle(): boolean {
      let wiggle: number = (this.timeToWiggle - ƒ.Time.game.get()) / Ufo.maxTimeToWiggle;
      let angle: number = 0;

      if (wiggle < 0) {
        this.mtxLocal.rotation = ƒ.Vector3.ZERO();
        return false;
      }

      angle = wiggle * 60 * Math.sin(wiggle * 10 * Math.PI);
      this.mtxLocal.mutate({ rotation: { z: angle } });
      return true;
    }

    public createTractorBeam(): GameObject {
      this.tractor = new GameObject("TractorBeam", ƒ.Vector3.ZERO(), Ufo.mtrTractor)

      let cmpMesh: ƒ.ComponentMesh = this.tractor.getComponent(ƒ.ComponentMesh);
      cmpMesh.pivot.translateY(-0.5);
      // this.tractor.mtxLocal.translateY(-0.5);
      this.tractor.mtxLocal.scaleX(0.5);
      this.tractor.mtxLocal.scaleY(ufoSpaceDefinition.min.y);
      cmpMesh.activate(false);

      let cmpMaterial: ƒ.ComponentMaterial = this.tractor.getComponent(ƒ.ComponentMaterial);
      cmpMaterial.pivot.scaleY(5);
      this.appendChild(this.tractor);
      return this.tractor;
    }

    private static getStartPosition(): ƒ.Vector3 {
      let position: ƒ.Vector3 = ƒ.Random.default.getVector3(ufoSpaceDefinition.min, ufoSpaceDefinition.max);
      return position;
    }

    private findTargetPosition(): void {
      this.setTargetPosition(ƒ.Random.default.getVector3(ufoSpaceDefinition.min, ufoSpaceDefinition.max));
    }
  }
}