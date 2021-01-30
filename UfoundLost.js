"use strict";
var UfoundLost;
(function (UfoundLost) {
    var ƒAid = FudgeAid;
    class Detonation extends ƒAid.Node {
        constructor(_position) {
            super("Detonation", ƒ.Matrix4x4.TRANSLATION(_position), Detonation.material, Detonation.mesh);
            this.radius = 2;
        }
    }
    Detonation.mesh = new ƒ.MeshSphere("Detonation", 10, 10);
    Detonation.material = new ƒ.Material("Detonation", ƒ.ShaderUniColor, new ƒ.CoatColored(ƒ.Color.CSS("darkgray")));
    UfoundLost.Detonation = Detonation;
})(UfoundLost || (UfoundLost = {}));
var UfoundLost;
(function (UfoundLost) {
    class Flak extends ƒ.Node {
        constructor() {
            super("FlakGraph");
            let mtrCrosshair = new ƒ.Material("Crosshair", ƒ.ShaderUniColor, new ƒ.CoatColored(ƒ.Color.CSS("White")));
            this.crosshair = new UfoundLost.GameObject("Crosshair", ƒ.Vector3.Y(UfoundLost.ufoSpaceDefinition.height), mtrCrosshair);
            this.crosshair.maxVelocity = 3;
            this.appendChild(this.crosshair);
            this.crosshairTarget = new UfoundLost.GameObject("CrosshairTarget", ƒ.Vector3.Y(UfoundLost.ufoSpaceDefinition.height - 2), mtrCrosshair, new ƒ.Vector2(0.5, 0.5));
            this.appendChild(this.crosshairTarget);
            this.detonations = new ƒ.Node("Detonations");
            this.appendChild(this.detonations);
        }
        update(_timeslice) {
            this.crosshair.setTargetPosition(this.crosshairTarget.mtxLocal.translation);
            this.crosshair.update(_timeslice);
        }
        input(_x, _y, _z) {
            let move = new ƒ.Vector3(_x, _y, _z);
            this.crosshairTarget.mtxLocal.translate(move);
            this.crosshairTarget.restrictPosition(UfoundLost.ufoSpaceDefinition.min, UfoundLost.ufoSpaceDefinition.max);
        }
        shoot() {
            ƒ.Debug.fudge("shoot");
            let detonation = new UfoundLost.Detonation(this.crosshair.mtxLocal.translation);
            this.appendChild(detonation);
        }
    }
    UfoundLost.Flak = Flak;
})(UfoundLost || (UfoundLost = {}));
var UfoundLost;
(function (UfoundLost) {
    var ƒ = FudgeCore;
    class GameObject extends ƒ.Node {
        // public mtxPivotInverse: ƒ.Matrix4x4 | null = null;
        // public mtxComplete: ƒ.Matrix4x4;
        // public mtxCompleteInverse: ƒ.Matrix4x4;
        constructor(_name, _position, _material, _size, _rotation) {
            super(_name);
            this.velocity = ƒ.Vector3.ZERO();
            this.maxVelocity = 1;
            this.addComponent(new ƒ.ComponentTransform(ƒ.Matrix4x4.TRANSLATION(_position)));
            let cmpMesh = new ƒ.ComponentMesh(GameObject.meshSprite);
            this.addComponent(cmpMesh);
            let cmpMaterial = new ƒ.ComponentMaterial(_material);
            // cmpMaterial.pivot.scale(ƒ.Vector2.ONE(1));
            this.addComponent(cmpMaterial);
            if (_rotation)
                this.mtxLocal.rotation = _rotation;
            if (_size)
                cmpMesh.pivot.scale(_size.toVector3(1));
            this.mtxPivot = this.getComponent(ƒ.ComponentMesh).pivot;
        }
        update(_timeslice) {
            let position = this.mtxLocal.translation;
            position.add(ƒ.Vector3.SCALE(this.velocity, _timeslice));
            this.mtxLocal.translation = position;
        }
        setTargetPosition(_position) {
            this.velocity = ƒ.Vector3.DIFFERENCE(_position, this.mtxLocal.translation);
            this.velocity.normalize(this.maxVelocity);
        }
        restrictPosition(_min, _max) {
            let position = this.mtxLocal.translation;
            if (position.isInsideCube(_min, _max))
                return;
            position.x = this.clamp(position.x, _min.x, _max.x);
            position.y = this.clamp(position.y, _min.y, _max.y);
            position.z = this.clamp(position.z, _min.z, _max.z);
            this.mtxLocal.translation = position;
        }
        clamp(_value, _min, _max) {
            return _min < _max ? (Math.min(Math.max(_value, _min), _max)) : (Math.min(Math.max(_value, _max), _min));
        }
    }
    GameObject.meshSprite = new ƒ.MeshSprite();
    UfoundLost.GameObject = GameObject;
})(UfoundLost || (UfoundLost = {}));
var UfoundLost;
(function (UfoundLost) {
    var ƒ = FudgeCore;
    var ƒAid = FudgeAid;
    window.addEventListener("load", start);
    const yCamera = 4;
    UfoundLost.viewport = new ƒ.Viewport();
    UfoundLost.graph = new ƒ.Node("MainGraph");
    UfoundLost.ufoSpaceDefinition = { height: 7, size: new ƒ.Vector3(16, 2, 9), min: new ƒ.Vector3(), max: new ƒ.Vector3() };
    UfoundLost.heliSpaceDefinition = { height: 2, size: new ƒ.Vector3(16, 0.5, 9), min: new ƒ.Vector3(), max: new ƒ.Vector3() };
    let flak;
    const cntFlak = {
        x: new ƒ.Control("FlakX", 0.05),
        z: new ƒ.Control("FlakZ", 0.03),
        y: new ƒ.Control("FlakY", -0.001)
    };
    function start(_event) {
        ƒ.Debug.fudge("UfoundLost starts");
        createViewport();
        createScene();
        setupInteraction();
        ƒ.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, update);
        ƒ.Loop.start();
    }
    function update(_event) {
        ƒ.Debug.fudge("udpate");
        let timeslice = ƒ.Loop.timeFrameGame / 1000;
        flak.update(timeslice);
        UfoundLost.viewport.draw();
    }
    function setupInteraction() {
        let canvas = document.querySelector("canvas");
        if (!canvas)
            return;
        canvas.addEventListener("mousemove", hndMouse);
        canvas.addEventListener("wheel", hndMouse);
        canvas.addEventListener("click", canvas.requestPointerLock);
        canvas.addEventListener("pointerdown", (_event) => flak.shoot());
    }
    function hndMouse(_event) {
        cntFlak.x.setInput(_event.movementX);
        cntFlak.z.setInput(_event.movementY);
        if (_event.type == "wheel")
            cntFlak.y.setInput(_event.deltaY);
        flak.input(cntFlak.x.getOutput(), cntFlak.y.getOutput(), cntFlak.z.getOutput());
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
        flak = new UfoundLost.Flak();
        UfoundLost.graph.appendChild(flak);
        let meshQuad = new ƒ.MeshQuad();
        let mtrWhite = new ƒ.Material("Background", ƒ.ShaderUniColor, new ƒ.CoatColored(ƒ.Color.CSS("white")));
        let background = new ƒAid.Node("Background", ƒ.Matrix4x4.IDENTITY(), mtrWhite, meshQuad);
        background.mtxLocal.translate(new ƒ.Vector3(0, yCamera, -5));
        background.mtxLocal.scale(new ƒ.Vector3(16, 9, 1));
        background.mtxLocal.scale(ƒ.Vector3.ONE(1.6));
        background.getComponent(ƒ.ComponentMaterial).clrPrimary = ƒ.Color.CSS("darkblue");
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
        let meshCube = new ƒ.MeshCube();
        let ufoSpace = new ƒAid.Node("UfoSpace", ƒ.Matrix4x4.TRANSLATION(new ƒ.Vector3(0, UfoundLost.ufoSpaceDefinition.height, 0)), mtrWhite, meshCube);
        let cmpMeshUfoSpace = ufoSpace.getComponent(ƒ.ComponentMesh);
        cmpMeshUfoSpace.pivot.scale(UfoundLost.ufoSpaceDefinition.size);
        ufoSpace.getComponent(ƒ.ComponentMaterial).clrPrimary = ƒ.Color.CSS("red", 0.5);
        UfoundLost.graph.appendChild(ufoSpace);
        let heliSpace = new ƒAid.Node("HeliSpace", ƒ.Matrix4x4.TRANSLATION(new ƒ.Vector3(0, UfoundLost.heliSpaceDefinition.height, 0)), mtrWhite, meshCube);
        let cmpMeshHeliSpace = heliSpace.getComponent(ƒ.ComponentMesh);
        cmpMeshHeliSpace.pivot.scale(UfoundLost.heliSpaceDefinition.size);
        heliSpace.getComponent(ƒ.ComponentMaterial).clrPrimary = ƒ.Color.CSS("grey", 0.5);
        UfoundLost.graph.appendChild(heliSpace);
        UfoundLost.viewport.draw(); // to calculate world transforms
        UfoundLost.ufoSpaceDefinition.min = ƒ.Vector3.TRANSFORMATION(ƒ.Vector3.ONE(-0.5), cmpMeshUfoSpace.mtxWorld);
        UfoundLost.ufoSpaceDefinition.max = ƒ.Vector3.TRANSFORMATION(ƒ.Vector3.ONE(0.5), cmpMeshUfoSpace.mtxWorld);
        UfoundLost.heliSpaceDefinition.min = ƒ.Vector3.TRANSFORMATION(ƒ.Vector3.ONE(-0.5), cmpMeshHeliSpace.mtxWorld);
        UfoundLost.heliSpaceDefinition.max = ƒ.Vector3.TRANSFORMATION(ƒ.Vector3.ONE(0.5), cmpMeshHeliSpace.mtxWorld);
    }
})(UfoundLost || (UfoundLost = {}));
