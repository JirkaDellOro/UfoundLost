namespace UfoundLost {
  import ƒ = FudgeCore;
  import ƒAid = FudgeAid;

  window.addEventListener("load", start);


  export let viewport: ƒ.Viewport = new ƒ.Viewport();
  export let graph: ƒ.Node = new ƒ.Node("MainGraph");
  let yCamera: number = 4;
  let ufoSpaceDefinition = {height: 7, size: new ƒ.Vector3(16, 2, 9)};
  let heliSpaceDefinition = {height: 2, size: new ƒ.Vector3(16, 0.5, 9)};

  function start(_event: Event): void {
    ƒ.Debug.fudge("UfoundLost starts");

    createViewport();
    createScene();

    ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, update);
    ƒ.Loop.start();
  }

  function update(_event: Event): void {
    ƒ.Debug.fudge("udpate");
    viewport.draw();
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
    let cmpMesh: ƒ.ComponentMesh = ufoSpace.getComponent(ƒ.ComponentMesh);
    cmpMesh.pivot.scale(ufoSpaceDefinition.size);
    ufoSpace.getComponent(ƒ.ComponentMaterial).clrPrimary = ƒ.Color.CSS("red", 0.5);
    graph.appendChild(ufoSpace);

    let heliSpace: ƒ.Node = new ƒAid.Node("HeliSpace", ƒ.Matrix4x4.TRANSLATION(new ƒ.Vector3(0, heliSpaceDefinition.height, 0)), mtrWhite, meshCube);
    cmpMesh = heliSpace.getComponent(ƒ.ComponentMesh);
    cmpMesh.pivot.scale(heliSpaceDefinition.size);
    heliSpace.getComponent(ƒ.ComponentMaterial).clrPrimary = ƒ.Color.CSS("grey", 0.5);
    graph.appendChild(heliSpace);
  }
}