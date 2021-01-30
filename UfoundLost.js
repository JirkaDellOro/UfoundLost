"use strict";
var UfoundLost;
(function (UfoundLost) {
    var ƒAid = FudgeAid;
    class Detonation extends ƒAid.Node {
        constructor(_position) {
            super("Detonation", ƒ.Matrix4x4.TRANSLATION(_position), Detonation.material, Detonation.mesh);
            this.getComponent(ƒ.ComponentMesh).pivot.scaling = ƒ.Vector3.ONE(Detonation.radius);
            // this.getComponent(ƒ.ComponentMaterial).pivot.scaling = ƒ.Vector2.ONE(10);
        }
        update(_timeslice) {
            let cmpMaterial = this.getComponent(ƒ.ComponentMaterial);
            cmpMaterial.clrPrimary.a -= _timeslice;
            return (cmpMaterial.clrPrimary.a < 0);
        }
    }
    Detonation.mesh = new ƒ.MeshSphere("Detonation", 10, 10);
    Detonation.material = new ƒ.Material("Detonation", ƒ.ShaderUniColor, new ƒ.CoatColored(ƒ.Color.CSS("gray")));
    // private static material: ƒ.Material = new ƒ.Material("Detonation", ƒ.ShaderTexture,
    //   new ƒ.CoatTextured(ƒ.Color.CSS("white"), new ƒ.TextureImage("Images/Smoke.png"))
    // );
    Detonation.radius = 2;
    UfoundLost.Detonation = Detonation;
})(UfoundLost || (UfoundLost = {}));
var UfoundLost;
(function (UfoundLost) {
    class Flak extends ƒ.Node {
        constructor() {
            super("FlakGraph");
            let mtrCrosshair = new ƒ.Material("Crosshair", ƒ.ShaderTexture, new ƒ.CoatTextured(ƒ.Color.CSS("White"), new ƒ.TextureImage("Images/Crosshair.png")));
            this.crosshair = new UfoundLost.GameObject("Crosshair", ƒ.Vector3.Y(UfoundLost.ufoSpaceDefinition.height), mtrCrosshair, ƒ.Vector2.ONE(0.5));
            this.crosshair.maxVelocity = 3;
            this.appendChild(this.crosshair);
            this.crosshairTarget = new UfoundLost.GameObject("CrosshairTarget", ƒ.Vector3.Y(UfoundLost.ufoSpaceDefinition.height - 2), mtrCrosshair, ƒ.Vector2.ONE(0.3));
            this.appendChild(this.crosshairTarget);
            this.detonations = new ƒ.Node("Detonations");
            this.appendChild(this.detonations);
        }
        update(_timeslice) {
            this.crosshair.setTargetPosition(this.crosshairTarget.mtxLocal.translation);
            this.crosshair.update(_timeslice);
            for (let detonation of this.detonations.getChildren()) {
                if (detonation.update(_timeslice))
                    this.detonations.removeChild(detonation);
            }
        }
        input(_x, _y, _z) {
            let move = new ƒ.Vector3(_x, _y, _z);
            this.crosshairTarget.mtxLocal.translate(move);
            this.crosshairTarget.restrictPosition(UfoundLost.ufoSpaceDefinition.min, UfoundLost.ufoSpaceDefinition.max);
        }
        shoot() {
            ƒ.Debug.fudge("shoot");
            let detonation = new UfoundLost.Detonation(this.crosshair.mtxLocal.translation);
            this.detonations.appendChild(detonation);
        }
    }
    UfoundLost.Flak = Flak;
})(UfoundLost || (UfoundLost = {}));
var UfoundLost;
(function (UfoundLost) {
    var ƒ = FudgeCore;
    class GameObject extends ƒ.Node {
        constructor(_name, _position, _material, _size, _rotation) {
            super(_name);
            this.velocity = ƒ.Vector3.ZERO();
            this.maxVelocity = 1;
            this.posTarget = ƒ.Vector3.ZERO();
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
        }
        update(_timeslice) {
            let position = this.mtxLocal.translation;
            position.add(ƒ.Vector3.SCALE(this.velocity, _timeslice));
            this.mtxLocal.translation = position;
        }
        setTargetPosition(_position) {
            this.velocity = ƒ.Vector3.DIFFERENCE(_position, this.mtxLocal.translation);
            if (this.velocity.magnitude > this.maxVelocity * 0.01)
                this.velocity.normalize(this.maxVelocity);
            this.posTarget = _position;
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
    var ƒAid = FudgeAid;
    class HeliPack extends UfoundLost.GameObject {
        constructor(_position, _size) {
            super("HeliPack", _position, HeliPack.mtrCatcherBox);
            this.getComponent(ƒ.ComponentMesh).pivot.scale(ƒ.Vector3.ZERO()); // remove the sprite for now, maybe useful later
            this.appendChild(new UfoundLost.Helicopter("Helicopter", new ƒ.Vector3(-_size.x / 2, 0.2, -_size.z / 2)));
            this.appendChild(new UfoundLost.Helicopter("Helicopter", new ƒ.Vector3(_size.x / 2, 0.2, -_size.z / 2)));
            this.appendChild(new UfoundLost.Helicopter("Helicopter", new ƒ.Vector3(-_size.x / 2, 0.2, _size.z / 2 + 0.1)));
            this.appendChild(new UfoundLost.Helicopter("Helicopter", new ƒ.Vector3(_size.x / 2, 0.2, _size.z / 2 + 0.1)));
            this.getChildren()[1].getComponent(ƒ.ComponentMesh).pivot.rotateY(180);
            this.getChildren()[3].getComponent(ƒ.ComponentMesh).pivot.rotateY(180);
            let net = new UfoundLost.GameObject("Net", ƒ.Vector3.Y(-0.1), HeliPack.mtrNet, new ƒ.Vector2(_size.x, _size.z), ƒ.Vector3.X(-90));
            net.getComponent(ƒ.ComponentMaterial).pivot.scale(ƒ.Vector2.ONE(2));
            this.appendChild(net);
            let catcher = new ƒAid.Node("Catcher", ƒ.Matrix4x4.IDENTITY(), HeliPack.mtrCatcherBox, HeliPack.mesh);
            let cmpMeshCatcher = catcher.getComponent(ƒ.ComponentMesh);
            cmpMeshCatcher.pivot.translateY(-0.1);
            cmpMeshCatcher.pivot.scale(_size);
            cmpMeshCatcher.pivot.scaleY(0.5);
            // cmpMeshCatcher.activate(false);
            this.appendChild(catcher);
        }
        input(_x, _z) {
            let move = new ƒ.Vector3(_x, 0, _z);
            this.mtxLocal.translate(move);
            this.restrictPosition(UfoundLost.heliSpaceDefinition.min, UfoundLost.heliSpaceDefinition.max);
        }
    }
    HeliPack.mesh = new ƒ.MeshCube("HeliPack");
    HeliPack.mtrCatcherBox = new ƒ.Material("Helipack", ƒ.ShaderUniColor, new ƒ.CoatColored(ƒ.Color.CSS("Black", 0.5)));
    HeliPack.mtrNet = new ƒ.Material("Net", ƒ.ShaderTexture, new ƒ.CoatTextured(ƒ.Color.CSS("white", 0.5), new ƒ.TextureImage("Images/Net.png")));
    UfoundLost.HeliPack = HeliPack;
})(UfoundLost || (UfoundLost = {}));
var UfoundLost;
(function (UfoundLost) {
    class Helicopter extends UfoundLost.GameObject {
        constructor(_name, _position) {
            super(_name, _position, Helicopter.material, ƒ.Vector2.ONE(0.5));
        }
    }
    // private static material: ƒ.Material = new ƒ.Material("Helicopter", ƒ.ShaderUniColor, new ƒ.CoatColored(ƒ.Color.CSS("yellow", 0.5)));
    Helicopter.material = new ƒ.Material("Helicopter", ƒ.ShaderTexture, new ƒ.CoatTextured(ƒ.Color.CSS("white"), new ƒ.TextureImage("Images/Helicopter.png")));
    UfoundLost.Helicopter = Helicopter;
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
    UfoundLost.heliSpaceDefinition = { height: 1, size: new ƒ.Vector3(16, 0.5, 9), min: new ƒ.Vector3(), max: new ƒ.Vector3() };
    UfoundLost.heliPackDefinition = { height: UfoundLost.heliSpaceDefinition.height, size: new ƒ.Vector3(2, 0.5, 2), min: new ƒ.Vector3(), max: new ƒ.Vector3() };
    const cntFlak = { x: new ƒ.Control("FlakX", 0.05), z: new ƒ.Control("FlakZ", 0.03), y: new ƒ.Control("FlakY", -0.001) };
    const cntHeliPack = { x: new ƒ.Control("HeliPackX", 0.1), z: new ƒ.Control("HeliPackZ", 0.1), delay: 500 };
    let flak;
    let heliPack;
    let ufos;
    function start(_event) {
        ƒ.Debug.fudge("UfoundLost starts");
        createViewport();
        createScene();
        createArmada(10);
        flak = new UfoundLost.Flak();
        UfoundLost.graph.appendChild(flak);
        setupInteraction();
        ƒ.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, update);
        ƒ.Loop.start();
    }
    function update(_event) {
        // ƒ.Debug.fudge("udpate");
        let timeslice = ƒ.Loop.timeFrameGame / 1000;
        flak.update(timeslice);
        controlHeliPack(timeslice);
        for (let ufo of ufos.getChildren()) {
            ufo.update(timeslice);
        }
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
        cntHeliPack.x.setDelay(cntHeliPack.delay);
        cntHeliPack.z.setDelay(cntHeliPack.delay);
    }
    function controlHeliPack(_timeslice) {
        cntHeliPack.z.setInput(ƒ.Keyboard.mapToValue(1, 0, [ƒ.KEYBOARD_CODE.S, ƒ.KEYBOARD_CODE.ARROW_DOWN])
            + ƒ.Keyboard.mapToValue(-1, 0, [ƒ.KEYBOARD_CODE.W, ƒ.KEYBOARD_CODE.ARROW_UP]));
        cntHeliPack.x.setInput(ƒ.Keyboard.mapToValue(-1, 0, [ƒ.KEYBOARD_CODE.A, ƒ.KEYBOARD_CODE.ARROW_LEFT])
            + ƒ.Keyboard.mapToValue(1, 0, [ƒ.KEYBOARD_CODE.D, ƒ.KEYBOARD_CODE.ARROW_RIGHT]));
        heliPack.input(cntHeliPack.x.getOutput(), cntHeliPack.z.getOutput());
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
    function createArmada(_nUfos) {
        ufos = new ƒ.Node("Ufos");
        UfoundLost.graph.appendChild(ufos);
        for (let i = 0; i < _nUfos; i++) {
            let ufo = new UfoundLost.Ufo();
            ufos.appendChild(ufo);
        }
    }
    function createScene() {
        let origin = new ƒAid.NodeCoordinateSystem("Origin");
        // graph.appendChild(origin);
        let meshQuad = new ƒ.MeshQuad();
        let mtrWhite = new ƒ.Material("Background", ƒ.ShaderUniColor, new ƒ.CoatColored(ƒ.Color.CSS("white")));
        let mtrBackground = new ƒ.Material("Background", ƒ.ShaderTexture, new ƒ.CoatTextured(ƒ.Color.CSS("white"), new ƒ.TextureImage("Images/Background.png")));
        let background = new ƒAid.Node("Background", ƒ.Matrix4x4.IDENTITY(), mtrBackground, meshQuad);
        background.mtxLocal.translate(new ƒ.Vector3(0, yCamera, -6));
        background.mtxLocal.scale(new ƒ.Vector3(16, 9, 1));
        background.mtxLocal.scale(ƒ.Vector3.ONE(1.7));
        // background.getComponent(ƒ.ComponentMaterial).clrPrimary = ƒ.Color.CSS("darkblue");
        // background.mtxLocal.lookAt(viewport.camera.pivot.translation);
        UfoundLost.graph.appendChild(background);
        // for (let x: number = -8; x <= 8; x++) {
        //   for (let z: number = -4; z <= 4; z++) {
        //     let floor: ƒ.Node = new ƒAid.Node("Floor", ƒ.Matrix4x4.TRANSLATION(new ƒ.Vector3(x, 0, z)), mtrWhite, meshQuad);
        //     let cmpMesh: ƒ.ComponentMesh = floor.getComponent(ƒ.ComponentMesh);
        //     cmpMesh.pivot.rotateX(-90);
        //     cmpMesh.pivot.scale(ƒ.Vector3.ONE(0.9));
        //     floor.getComponent(ƒ.ComponentMaterial).clrPrimary = ƒ.Color.CSS("darkgreen");
        //     graph.appendChild(floor);
        //   }
        // }
        heliPack = new UfoundLost.HeliPack(ƒ.Vector3.Y(UfoundLost.heliPackDefinition.height), UfoundLost.heliPackDefinition.size);
        UfoundLost.graph.appendChild(heliPack);
        let meshCube = new ƒ.MeshCube();
        let ufoSpace = new ƒAid.Node("UfoSpace", ƒ.Matrix4x4.TRANSLATION(new ƒ.Vector3(0, UfoundLost.ufoSpaceDefinition.height, 0)), mtrWhite, meshCube);
        let cmpMeshUfoSpace = ufoSpace.getComponent(ƒ.ComponentMesh);
        cmpMeshUfoSpace.pivot.scale(UfoundLost.ufoSpaceDefinition.size);
        ufoSpace.getComponent(ƒ.ComponentMaterial).clrPrimary = ƒ.Color.CSS("red", 0.5);
        cmpMeshUfoSpace.activate(false);
        UfoundLost.graph.appendChild(ufoSpace);
        let heliSpace = new ƒAid.Node("HeliSpace", ƒ.Matrix4x4.TRANSLATION(new ƒ.Vector3(0, UfoundLost.heliSpaceDefinition.height, 0)), mtrWhite, meshCube);
        let cmpMeshHeliSpace = heliSpace.getComponent(ƒ.ComponentMesh);
        cmpMeshHeliSpace.pivot.scale(UfoundLost.heliSpaceDefinition.size);
        heliSpace.getComponent(ƒ.ComponentMaterial).clrPrimary = ƒ.Color.CSS("grey", 0.5);
        cmpMeshHeliSpace.activate(false);
        UfoundLost.graph.appendChild(heliSpace);
        UfoundLost.viewport.draw(); // to calculate world transforms
        UfoundLost.ufoSpaceDefinition.min = ƒ.Vector3.TRANSFORMATION(ƒ.Vector3.ONE(-0.5), cmpMeshUfoSpace.mtxWorld);
        UfoundLost.ufoSpaceDefinition.max = ƒ.Vector3.TRANSFORMATION(ƒ.Vector3.ONE(0.5), cmpMeshUfoSpace.mtxWorld);
        UfoundLost.heliSpaceDefinition.min = ƒ.Vector3.TRANSFORMATION(ƒ.Vector3.ONE(-0.5), cmpMeshHeliSpace.mtxWorld);
        UfoundLost.heliSpaceDefinition.max = ƒ.Vector3.TRANSFORMATION(ƒ.Vector3.ONE(0.5), cmpMeshHeliSpace.mtxWorld);
        let cmpMeshHeliPack = heliPack.getChildrenByName("Catcher")[0].getComponent(ƒ.ComponentMesh);
        UfoundLost.heliPackDefinition.min = ƒ.Vector3.TRANSFORMATION(ƒ.Vector3.ONE(-0.5), cmpMeshHeliPack.mtxWorld);
        UfoundLost.heliPackDefinition.max = ƒ.Vector3.TRANSFORMATION(ƒ.Vector3.ONE(0.5), cmpMeshHeliPack.mtxWorld);
    }
})(UfoundLost || (UfoundLost = {}));
var UfoundLost;
(function (UfoundLost) {
    // import ƒAid = FudgeAid;
    let JOB;
    (function (JOB) {
        JOB[JOB["ROAM"] = 0] = "ROAM";
        JOB[JOB["LURK"] = 1] = "LURK";
        JOB[JOB["PREPARE"] = 2] = "PREPARE";
        JOB[JOB["TRACTOR"] = 3] = "TRACTOR";
        JOB[JOB["EVADE"] = 4] = "EVADE";
        JOB[JOB["EXPLODE"] = 5] = "EXPLODE";
    })(JOB || (JOB = {}));
    class Ufo extends UfoundLost.GameObject {
        constructor() {
            super("Ufo", Ufo.getStartPosition(), Ufo.material, ƒ.Vector2.ONE(0.5));
            this.timeForNextJob = 0;
            this.tractor = this.createTractorBeam();
            this.job = JOB.ROAM;
            this.maxVelocity = 5;
            this.findTargetPosition();
        }
        update(_timeslice) {
            super.update(_timeslice);
            let position = this.mtxLocal.translation;
            let atTarget = this.mtxLocal.translation.isInsideSphere(this.posTarget, 2 * _timeslice * this.maxVelocity);
            let jobPrevious = this.job;
            switch (this.job) {
                case JOB.ROAM:
                    if (!atTarget)
                        break; // keep roamin
                    this.job = JOB.LURK;
                    this.velocity = ƒ.Vector3.ZERO();
                    this.timeForNextJob = ƒ.Time.game.get() + 1000 * ƒ.Random.default.getRange(1, 3);
                    break;
                case JOB.LURK:
                    if (ƒ.Time.game.get() < this.timeForNextJob)
                        break; // keep lurking
                    if (Math.random() < 0.2) {
                        this.maxVelocity = 1;
                        this.setTargetPosition(new ƒ.Vector3(position.x, UfoundLost.ufoSpaceDefinition.min.y, position.z));
                        this.job = JOB.PREPARE;
                        break;
                    }
                    this.findTargetPosition();
                    this.job = JOB.ROAM;
                    break;
                case JOB.PREPARE:
                    if (!atTarget)
                        break; // keep preparing
                    this.job = JOB.TRACTOR;
                    this.velocity = ƒ.Vector3.ZERO();
                    this.tractor.getComponent(ƒ.ComponentMesh).activate(true);
                    this.timeForNextJob = ƒ.Time.game.get() + 1000 * ƒ.Random.default.getRange(10, 15);
                    break;
                case JOB.TRACTOR:
                    if (ƒ.Time.game.get() < this.timeForNextJob)
                        break; // keep sucking
                    this.tractor.getComponent(ƒ.ComponentMesh).activate(false);
                    this.maxVelocity = 5;
                    this.findTargetPosition();
                    this.job = JOB.ROAM;
                    break;
            }
            if (jobPrevious != this.job)
                ƒ.Debug.fudge(JOB[this.job]);
        }
        createTractorBeam() {
            this.tractor = new UfoundLost.GameObject("TractorBeam", ƒ.Vector3.ZERO(), Ufo.mtrTractor);
            let cmpMesh = this.tractor.getComponent(ƒ.ComponentMesh);
            cmpMesh.pivot.translateY(-0.5);
            // this.tractor.mtxLocal.translateY(-0.5);
            this.tractor.mtxLocal.scaleX(0.5);
            this.tractor.mtxLocal.scaleY(UfoundLost.ufoSpaceDefinition.min.y);
            cmpMesh.activate(false);
            let cmpMaterial = this.tractor.getComponent(ƒ.ComponentMaterial);
            cmpMaterial.pivot.scaleY(5);
            this.appendChild(this.tractor);
            return this.tractor;
        }
        static getStartPosition() {
            let position = ƒ.Random.default.getVector3(UfoundLost.ufoSpaceDefinition.min, UfoundLost.ufoSpaceDefinition.max);
            return position;
        }
        findTargetPosition() {
            this.setTargetPosition(ƒ.Random.default.getVector3(UfoundLost.ufoSpaceDefinition.min, UfoundLost.ufoSpaceDefinition.max));
        }
    }
    // private static material: ƒ.Material = new ƒ.Material("Ufo", ƒ.ShaderUniColor, new ƒ.CoatColored(ƒ.Color.CSS("black", 0.5)));
    // private static mtrTractor: ƒ.Material = new ƒ.Material("Ufo", ƒ.ShaderUniColor, new ƒ.CoatColored(ƒ.Color.CSS("pink", 0.5)));
    Ufo.material = new ƒ.Material("Ufo", ƒ.ShaderTexture, new ƒ.CoatTextured(ƒ.Color.CSS("white"), new ƒ.TextureImage("Images/Ufo.png")));
    Ufo.mtrTractor = new ƒ.Material("Ufo", ƒ.ShaderTexture, new ƒ.CoatTextured(ƒ.Color.CSS("white", 0.4), new ƒ.TextureImage("Images/TractorBeam.png")));
    UfoundLost.Ufo = Ufo;
})(UfoundLost || (UfoundLost = {}));
