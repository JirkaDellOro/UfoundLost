namespace UfoundLost {
  import ƒ = FudgeCore;

  export class GameObject extends ƒ.Node {
    private static readonly meshSprite: ƒ.MeshSprite = new ƒ.MeshSprite();
    public velocity: ƒ.Vector3 = ƒ.Vector3.ZERO();
    public maxVelocity: number = 1;
    protected posTarget: ƒ.Vector3 = ƒ.Vector3.ZERO();

    public constructor(_name: string, _position: ƒ.Vector3, _material: ƒ.Material, _size?: ƒ.Vector2, _rotation?: ƒ.Vector3) {
      super(_name);
      this.addComponent(new ƒ.ComponentTransform(ƒ.Matrix4x4.TRANSLATION(_position)));
      let cmpMesh: ƒ.ComponentMesh = new ƒ.ComponentMesh(GameObject.meshSprite);
      this.addComponent(cmpMesh);
      let cmpMaterial: ƒ.ComponentMaterial = new ƒ.ComponentMaterial(_material);
      // cmpMaterial.pivot.scale(ƒ.Vector2.ONE(1));
      this.addComponent(cmpMaterial);

      if (_rotation)
        this.mtxLocal.rotation = _rotation;

      if (_size)
        cmpMesh.pivot.scale(_size.toVector3(1));
    }

    public update(_timeslice: number): void {
      let position: ƒ.Vector3 = this.mtxLocal.translation;
      position.add(ƒ.Vector3.SCALE(this.velocity, _timeslice));
      this.mtxLocal.translation = position;
    }

    public setTargetPosition(_position: ƒ.Vector3): void {
      this.velocity = ƒ.Vector3.DIFFERENCE(_position, this.mtxLocal.translation);
      if (this.velocity.magnitude > this.maxVelocity * 0.01)
        this.velocity.normalize(this.maxVelocity);
      this.posTarget = _position;
    }

    public atTarget(_timeslice: number): boolean {
      return this.mtxLocal.translation.isInsideSphere(this.posTarget, 2 * _timeslice * this.maxVelocity);
    }

    public restrictPosition(_min: ƒ.Vector3, _max: ƒ.Vector3): void {
      let position: ƒ.Vector3 = this.mtxLocal.translation;
      if (position.isInsideCube(_min, _max))
        return;

      position.x = this.clamp(position.x, _min.x, _max.x);
      position.y = this.clamp(position.y, _min.y, _max.y);
      position.z = this.clamp(position.z, _min.z, _max.z);

      this.mtxLocal.translation = position;
    }

    private clamp(_value: number, _min: number, _max: number): number {
      return _min < _max ? (Math.min(Math.max(_value, _min), _max)) : (Math.min(Math.max(_value, _max), _min));
    }


    // public calculateBounce(_posWith: ƒ.Vector3, _radius: number = 1): ƒ.Vector3 {
    //   // make sure inversions exist
    //   this.calculatePivotInverse();
    //   this.calculateCompleteAndInverse();

    //   // transform position and radius to mesh coordinates
    //   let posLocal: ƒ.Vector3 = ƒ.Vector3.TRANSFORMATION(_posWith, this.mtxCompleteInverse, true);
    //   let vctRadiusLocal: ƒ.Vector3 = ƒ.Vector3.TRANSFORMATION(ƒ.Vector3.X(_radius), this.mtxPivotInverse);

    //   // return if behind mesh or further away than radius. Prerequisite: pivot.z of this object hasn't been scaled!!
    //   if (posLocal.z < 0 || posLocal.z > _radius)
    //     return null;

    //   // return if further to the side than 0.5 (the half of the width of the mesh) plus the transformed radius
    //   if (Math.abs(posLocal.x) > 0.5 + vctRadiusLocal.x)
    //     return null;

    //   // bounce in system local to mesh
    //   posLocal.z = _radius * 1.001;

    //   // transform back to world system
    //   posLocal.transform(this.mtxComplete, true);

    //   return posLocal;
    // }

    // private calculatePivotInverse(): void {
    //   if (this.mtxPivotInverse) return;
    //   this.mtxPivotInverse = ƒ.Matrix4x4.INVERSION(this.mtxPivot);
    // }

    // private calculateCompleteAndInverse(): void {
    //   if (this.mtxComplete) return;
    //   this.mtxComplete = ƒ.Matrix4x4.MULTIPLICATION(this.mtxWorld, this.mtxPivot);
    //   this.mtxCompleteInverse = ƒ.Matrix4x4.MULTIPLICATION(this.mtxPivotInverse, this.mtxWorldInverse);
    // }
  }
}