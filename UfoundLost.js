"use strict";
var UfoundLost;
(function (UfoundLost) {
    var ƒ = FudgeCore;
    var ƒAid = FudgeAid;
    window.addEventListener("load", start);
    UfoundLost.viewport = new ƒ.Viewport();
    UfoundLost.graph = new ƒ.Node("MainGraph");
    let yCamera = 4;
    function start(_event) {
        ƒ.Debug.fudge("UfoundLost starts");
        createViewport();
        createScene();
        ƒ.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, update);
        ƒ.Loop.start();
    }
    function update(_event) {
        ƒ.Debug.fudge("udpate");
        UfoundLost.viewport.draw();
    }
    function createViewport() {
        let canvas = document.querySelector("canvas");
        if (!canvas)
            return;
        let cmpCamera = new ƒ.ComponentCamera();
        cmpCamera.pivot.translate(new ƒ.Vector3(0, yCamera, 18));
        cmpCamera.pivot.rotateY(180);
        cmpCamera.backgroundColor = ƒ.Color.CSS("black");
        UfoundLost.viewport.initialize("Viewport", UfoundLost.graph, cmpCamera, canvas);
    }
    function createScene() {
        let origin = new ƒAid.NodeCoordinateSystem("Origin");
        UfoundLost.graph.appendChild(origin);
        let meshQuad = new ƒ.MeshQuad();
        let mtrWhite = new ƒ.Material("Background", ƒ.ShaderUniColor, new ƒ.CoatColored(ƒ.Color.CSS("white")));
        let background = new ƒAid.Node("Background", ƒ.Matrix4x4.IDENTITY(), mtrWhite, meshQuad);
        background.mtxLocal.translate(new ƒ.Vector3(0, yCamera, -5));
        background.mtxLocal.scale(new ƒ.Vector3(16, 9, 1));
        background.mtxLocal.scale(ƒ.Vector3.ONE(1.6));
        // background.mtxLocal.lookAt(viewport.camera.pivot.translation);
        UfoundLost.graph.appendChild(background);
        for (let x = -8; x <= 8; x++) {
            for (let z = -4; z <= 4; z++) {
                let floor = new ƒAid.Node("Floor", ƒ.Matrix4x4.TRANSLATION(new ƒ.Vector3(x, 0, z)), mtrWhite, meshQuad);
                let cmpMesh = floor.getComponent(ƒ.ComponentMesh);
                cmpMesh.pivot.rotateX(-90);
                cmpMesh.pivot.scale(ƒ.Vector3.ONE(0.9));
                floor.getComponent(ƒ.ComponentMaterial).clrPrimary = ƒ.Color.CSS("darkgreen");
                UfoundLost.graph.appendChild(floor);
            }
        }
    }
})(UfoundLost || (UfoundLost = {}));
