namespace UfoundLost {
  // import ƒAid = FudgeAid;
  enum JOB {
    ROAM, LURK, PREPARE, TRACTOR, EVADE, EXPLODE
  }

  export class Ufo extends GameObject {
    // private static material: ƒ.Material = new ƒ.Material("Ufo", ƒ.ShaderUniColor, new ƒ.CoatColored(ƒ.Color.CSS("black", 0.5)));
    // private static mtrTractor: ƒ.Material = new ƒ.Material("Ufo", ƒ.ShaderUniColor, new ƒ.CoatColored(ƒ.Color.CSS("pink", 0.5)));
    private static material: ƒ.Material = new ƒ.Material("Ufo", ƒ.ShaderTexture,
      new ƒ.CoatTextured(ƒ.Color.CSS("white"), new ƒ.TextureImage("Images/Ufo.png"))
    );
    private static mtrTractor: ƒ.Material = new ƒ.Material("Ufo", ƒ.ShaderTexture,
      new ƒ.CoatTextured(ƒ.Color.CSS("white", 0.4), new ƒ.TextureImage("Images/TractorBeam.png"))
    );
    private job: JOB;
    private timeForNextJob: number = 0;
    private tractor: GameObject;

    constructor() {
      super("Ufo", Ufo.getStartPosition(), Ufo.material, ƒ.Vector2.ONE(0.5));
      this.tractor = this.createTractorBeam();
      this.job = JOB.ROAM;
      this.maxVelocity = 5;
      this.findTargetPosition();
    }

    public update(_timeslice: number): void {
      super.update(_timeslice);

      let position: ƒ.Vector3 = this.mtxLocal.translation;
      let atTarget: boolean = this.mtxLocal.translation.isInsideSphere(this.posTarget, 2 * _timeslice * this.maxVelocity);
      let jobPrevious: JOB = this.job;
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
            break;
          }
          this.findTargetPosition();
          this.job = JOB.ROAM;
          break;
        case JOB.PREPARE:
          if (!atTarget) break; // keep preparing
          this.job = JOB.TRACTOR;
          this.velocity = ƒ.Vector3.ZERO();
          this.tractor.getComponent(ƒ.ComponentMesh).activate(true);
          this.timeForNextJob = ƒ.Time.game.get() + 1000 * ƒ.Random.default.getRange(10, 15);
          break;
        case JOB.TRACTOR:
          if (ƒ.Time.game.get() < this.timeForNextJob) break; // keep sucking
          this.tractor.getComponent(ƒ.ComponentMesh).activate(false);
          this.maxVelocity = 5;
          this.findTargetPosition();
          this.job = JOB.ROAM;
          break;
      }
      if (jobPrevious != this.job)
        ƒ.Debug.fudge(JOB[this.job]);
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