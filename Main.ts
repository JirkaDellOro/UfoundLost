namespace UfoundLost {
  import ƒ = FudgeCore;
  import ƒAid = FudgeAid;

  window.addEventListener("load", start);


  export const viewport: ƒ.Viewport = new ƒ.Viewport();
  export const graph: ƒ.Node = new ƒ.Node("MainGraph");
  const yCamera: number = 4;
  const ufoSpaceDefinition = { height: 7, size: new ƒ.Vector3(16, 2, 9), min: new ƒ.Vector3(), max: new ƒ.Vector3() };
  const heliSpaceDefinition = { height: 2, size: new ƒ.Vector3(16, 0.5, 9), min: new ƒ.Vector3(), max: new ƒ.Vector3() };

  let crosshair: GameObject;
  let crosshairTarget: GameObject;

  const cntFlak = {
    x: new ƒ.Control("FlakX", 0.05),
    z: new ƒ.Control("FlakZ", 0.05),
    y: new ƒ.Control("FlakY", -0.001)
  };

  function start(_event: Event): void {
    ƒ.Debug.fudge("UfoundLost starts");

    createViewport();
    createFlak();
    createScene();

    setupInteraction();

    ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, update);
    ƒ.Loop.start();
  }

  function update(_event: Event): void {
    ƒ.Debug.fudge("udpate");
    let timeslice = ƒ.Loop.timeFrameGame / 1000;

    crosshair.setTargetPosition(crosshairTarget.mtxLocal.translation);
    crosshair.update(timeslice);

    viewport.draw();
  }

  function setupInteraction(): void {
    let canvas: HTMLCanvasElement | null = document.querySelector("canvas");
    if (!canvas)
      return;

    canvas.addEventListener("mousemove", hndMouse);
    canvas.addEventListener("wheel", hndMouse);
    canvas.addEventListener("click", canvas.requestPointerLock);
    canvas.addEventListener("click", shoot);
  }

  function hndMouse(_event: MouseEvent | WheelEvent): void {
    cntFlak.x.setInput(_event.movementX);
    cntFlak.z.setInput(_event.movementY);
    if (_event.type == "wheel")
      cntFlak.y.setInput((<WheelEvent>_event).deltaY);

    let move: ƒ.Vector3 = new ƒ.Vector3(cntFlak.x.getOutput(), cntFlak.y.getOutput(), cntFlak.z.getOutput());
    crosshairTarget.mtxLocal.translate(move);
    crosshairTarget.restrictPosition(ufoSpaceDefinition.min, ufoSpaceDefinition.max);
  }

  function shoot(_event: MouseEvent): void {
    
  }

  function createViewport(): void {
    let canvas: HTMLCanvasElement | null = document.querySelector("canvas");
    if (!canvas)
      return;

    let cmpCamera: ƒ.ComponentCamera = new ƒ.ComponentCamera();
    cmpCamera.pivot.translate(new ƒ.Vector3(0, yCamera, 18));
    cmpCamera.pivot.rotateY(180);
    cmpCamera.backgroundColor = ƒ.Color.CSS("black");

    viewport.initialize("Viewport", graph, cmpCamera, canvas);
  }

  function createFlak(): void {
    let mtrCrosshair: ƒ.Material = new ƒ.Material("Crosshair", ƒ.ShaderUniColor, new ƒ.CoatColored(ƒ.Color.CSS("White")));
    crosshair = new GameObject("Crosshair", ƒ.Vector3.Y(ufoSpaceDefinition.height), mtrCrosshair);
    graph.appendChild(crosshair);

    crosshairTarget = new GameObject("CrosshairTarget", ƒ.Vector3.Y(ufoSpaceDefinition.height - 2), mtrCrosshair, new ƒ.Vector2(0.5, 0.5));
    graph.appendChild(crosshairTarget);
  }

  function createScene(): void {
    let origin: ƒAid.NodeCoordinateSystem = new ƒAid.NodeCoordinateSystem("Origin");
    graph.appendChild(origin);

    let meshQuad: ƒ.MeshQuad = new ƒ.MeshQuad();
    let mtrWhite: ƒ.Material = new ƒ.Material("Background", ƒ.ShaderUniColor, new ƒ.CoatColored(ƒ.Color.CSS("white")));

    let background: ƒ.Node = new ƒAid.Node("Background", ƒ.Matrix4x4.IDENTITY(), mtrWhite, meshQuad);
    background.mtxLocal.translate(new ƒ.Vector3(0, yCamera, -5));
    background.mtxLocal.scale(new ƒ.Vector3(16, 9, 1));
    background.mtxLocal.scale(ƒ.Vector3.ONE(1.6));
    background.getComponent(ƒ.ComponentMaterial).clrPrimary = ƒ.Color.CSS("darkblue");
    // background.mtxLocal.lookAt(viewport.camera.pivot.translation);
    graph.appendChild(background);

    for (let x: number = -8; x <= 8; x++) {
      for (let z: number = -4; z <= 4; z++) {
        let floor: ƒ.Node = new ƒAid.Node("Floor", ƒ.Matrix4x4.TRANSLATION(new ƒ.Vector3(x, 0, z)), mtrWhite, meshQuad);
        let cmpMesh: ƒ.ComponentMesh = floor.getComponent(ƒ.ComponentMesh);
        cmpMesh.pivot.rotateX(-90);
        cmpMesh.pivot.scale(ƒ.Vector3.ONE(0.9));
        floor.getComponent(ƒ.ComponentMaterial).clrPrimary = ƒ.Color.CSS("darkgreen");
        graph.appendChild(floor);
      }
    }

    let meshCube: ƒ.MeshCube = new ƒ.MeshCube();

    let ufoSpace: ƒ.Node = new ƒAid.Node("UfoSpace", ƒ.Matrix4x4.TRANSLATION(new ƒ.Vector3(0, ufoSpaceDefinition.height, 0)), mtrWhite, meshCube);
    let cmpMeshUfoSpace: ƒ.ComponentMesh = ufoSpace.getComponent(ƒ.ComponentMesh);
    cmpMeshUfoSpace.pivot.scale(ufoSpaceDefinition.size);
    ufoSpace.getComponent(ƒ.ComponentMaterial).clrPrimary = ƒ.Color.CSS("red", 0.5);
    graph.appendChild(ufoSpace);

    let heliSpace: ƒ.Node = new ƒAid.Node("HeliSpace", ƒ.Matrix4x4.TRANSLATION(new ƒ.Vector3(0, heliSpaceDefinition.height, 0)), mtrWhite, meshCube);
    let cmpMeshHeliSpace: ƒ.ComponentMesh = heliSpace.getComponent(ƒ.ComponentMesh);
    cmpMeshHeliSpace.pivot.scale(heliSpaceDefinition.size);
    heliSpace.getComponent(ƒ.ComponentMaterial).clrPrimary = ƒ.Color.CSS("grey", 0.5);
    graph.appendChild(heliSpace);

    viewport.draw(); // to calculate world transforms

    ufoSpaceDefinition.min = ƒ.Vector3.TRANSFORMATION(ƒ.Vector3.ONE(-0.5), cmpMeshUfoSpace.mtxWorld);
    ufoSpaceDefinition.max = ƒ.Vector3.TRANSFORMATION(ƒ.Vector3.ONE(0.5), cmpMeshUfoSpace.mtxWorld);
    heliSpaceDefinition.min = ƒ.Vector3.TRANSFORMATION(ƒ.Vector3.ONE(-0.5), cmpMeshHeliSpace.mtxWorld);
    heliSpaceDefinition.max = ƒ.Vector3.TRANSFORMATION(ƒ.Vector3.ONE(0.5), cmpMeshHeliSpace.mtxWorld);
  }
}