"use strict";
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
        atTarget(_timeslice) {
            return this.mtxLocal.translation.isInsideSphere(this.posTarget, 2 * _timeslice * this.maxVelocity);
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
    class Villager extends UfoundLost.GameObject {
        constructor(_name, _ufo) {
            super(_name, Villager.getStartPosition(_ufo), Villager.mtrMale, ƒ.Vector2.ONE(0.5));
            this.sex = true; // Male by default
            this.rotation = Math.random() * 4 - 2;
            this.falling = false;
            this.ufo = _ufo;
            let cmpAudio = new ƒ.ComponentAudio(ƒ.Random.default.getElement(Villager.audioScreamsMale));
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
        static getStartPosition(_ufo) {
            let position = _ufo.mtxLocal.translation;
            position.y = 0.5;
            position.z += 0.01;
            return position;
        }
        static create(_ufo) {
            let villager = new Villager("Villager", _ufo);
            return villager;
        }
        static updateAll(_timeslice) {
            for (let villager of Villager.all.getChildren())
                villager.update(_timeslice);
        }
        update(_timeslice) {
            super.update(_timeslice);
            this.getComponent(ƒ.ComponentMesh).pivot.rotateZ(this.rotation, true);
            if (!this.falling)
                return;
            let heliCatch = UfoundLost.heliPack.catch(this);
            if (heliCatch == UfoundLost.HELI.NONE && this.mtxLocal.translation.y > 0)
                return;
            if (heliCatch != UfoundLost.HELI.CAUGHT) {
                UfoundLost.Splat.create(this.mtxLocal.translation, this instanceof UfoundLost.Alien);
                this instanceof UfoundLost.Alien ? UfoundLost.gameState.aDead++ : UfoundLost.gameState.vDead++;
            }
            else {
                ƒ.Debug.log("Villager saved!");
                this instanceof UfoundLost.Alien ? UfoundLost.gameState.aSaved++ : UfoundLost.gameState.vSaved++;
            }
            Villager.all.removeChild(this);
            if (this.ufo)
                this.ufo.loseVillager();
        }
        setTargetPosition(_position) {
            super.setTargetPosition(_position);
            this.falling = false;
        }
        capture() {
            ƒ.Debug.log("Villager captured");
            Villager.all.removeChild(this);
            UfoundLost.gameState.vKidnapped++;
        }
        fall() {
            this.velocity = ƒ.Vector3.Y(-1);
            this.falling = true;
        }
        loseUfo() {
            this.ufo = null;
            this.fall();
        }
    }
    Villager.all = new ƒ.Node("Villagers");
    Villager.audioScreamsMale = [
        new ƒ.Audio("Audio/ScreamMale0.mp3"), new ƒ.Audio("Audio/ScreamMale1.mp3"), new ƒ.Audio("Audio/ScreamMale2.mp3"), new ƒ.Audio("Audio/ScreamMale3.mp3"), new ƒ.Audio("Audio/ScreamMale4.mp3"), new ƒ.Audio("Audio/ScreamMale5.mp3")
    ];
    Villager.audioScreamsFemale = [
        new ƒ.Audio("Audio/ScreamFemale0.mp3"), new ƒ.Audio("Audio/ScreamFemale1.mp3"), new ƒ.Audio("Audio/ScreamFemale2.mp3"), new ƒ.Audio("Audio/ScreamFemale3.mp3"), new ƒ.Audio("Audio/ScreamFemale4.mp3")
    ];
    Villager.mtrMale = new ƒ.Material("VillagerMale", ƒ.ShaderTexture, new ƒ.CoatTextured(ƒ.Color.CSS("white"), new ƒ.TextureImage("Images/VillagerMale0.png")));
    Villager.mtrFemale = new ƒ.Material("VillagerMale", ƒ.ShaderTexture, new ƒ.CoatTextured(ƒ.Color.CSS("white"), new ƒ.TextureImage("Images/VillagerFemale0.png")));
    UfoundLost.Villager = Villager;
})(UfoundLost || (UfoundLost = {}));
///<reference path="GameObject.ts"/>
///<reference path="Villager.ts"/>
var UfoundLost;
///<reference path="GameObject.ts"/>
///<reference path="Villager.ts"/>
(function (UfoundLost) {
    class Alien extends UfoundLost.Villager {
        constructor(_name, _ufo) {
            super(_name, _ufo);
            let cmpAudio = this.getComponent(ƒ.ComponentAudio);
            cmpAudio.setAudio(Alien.audio);
            this.getComponent(ƒ.ComponentMaterial).material = Alien.material;
            this.mtxLocal.translation = _ufo.mtxLocal.translation;
            this.fall();
        }
    }
    Alien.audio = new ƒ.Audio("Audio/WilhelmScream.mp3");
    Alien.material = new ƒ.Material("Alien", ƒ.ShaderTexture, new ƒ.CoatTextured(ƒ.Color.CSS("white"), new ƒ.TextureImage("Images/Alien.png")));
    UfoundLost.Alien = Alien;
})(UfoundLost || (UfoundLost = {}));
///<reference path="GameObject.ts"/>
var UfoundLost;
///<reference path="GameObject.ts"/>
(function (UfoundLost) {
    class Detonation extends UfoundLost.GameObject {
        constructor(_position) {
            super("Detonation", _position, Detonation.material, ƒ.Vector2.ONE(Detonation.radius));
            this.getComponent(ƒ.ComponentMaterial).sortForAlpha = true;
            this.velocity = ƒ.Vector3.Y(0.3);
            let cmpAudio = new ƒ.ComponentAudio(Detonation.audio);
            this.addComponent(cmpAudio);
            cmpAudio.play(true);
            UfoundLost.Ufo.checkAllForHit(_position, Detonation.radius);
        }
        update(_timeslice) {
            super.update(_timeslice);
            let cmpMaterial = this.getComponent(ƒ.ComponentMaterial);
            cmpMaterial.clrPrimary.a -= _timeslice;
            return (cmpMaterial.clrPrimary.a < 0);
        }
    }
    Detonation.audio = new ƒ.Audio("Audio/Detonation.mp3");
    Detonation.material = new ƒ.Material("Detonation", ƒ.ShaderTexture, new ƒ.CoatTextured(new ƒ.Color(1, 0.4, 0.2), new ƒ.TextureImage("Images/Smoke.png")));
    Detonation.radius = 2;
    UfoundLost.Detonation = Detonation;
})(UfoundLost || (UfoundLost = {}));
var UfoundLost;
(function (UfoundLost) {
    var ƒAid = FudgeAid;
    class Flak extends ƒ.Node {
        // private static audioShot: ƒ.Audio = new ƒ.Audio("Audio/Shot.mp3");
        constructor() {
            super("FlakGraph");
            let mtrCrosshair = new ƒ.Material("Crosshair", ƒ.ShaderTexture, new ƒ.CoatTextured(ƒ.Color.CSS("White"), new ƒ.TextureImage("Images/Crosshair.png")));
            this.crosshair = new UfoundLost.GameObject("Crosshair", ƒ.Vector3.Y(UfoundLost.ufoSpaceDefinition.height), mtrCrosshair, ƒ.Vector2.ONE(0.5));
            this.crosshair.maxVelocity = 3;
            this.appendChild(this.crosshair);
            this.crosshairTarget = new UfoundLost.GameObject("CrosshairTarget", ƒ.Vector3.Y(UfoundLost.ufoSpaceDefinition.height), mtrCrosshair, ƒ.Vector2.ONE(0.3));
            this.appendChild(this.crosshairTarget);
            this.detonations = new ƒ.Node("Detonations");
            this.appendChild(this.detonations);
            this.cannon = this.createCannon();
            this.appendChild(this.cannon);
            this.input(0.01, 0, 0);
            // this.addComponent(new ƒ.ComponentAudio(Flak.audioShot));
        }
        update(_timeslice) {
            this.crosshair.setTargetPosition(this.crosshairTarget.mtxLocal.translation);
            this.crosshair.update(_timeslice);
            let bearing = Reflect.get(this.cannon, "bearingLocal");
            bearing.lookAt(this.crosshair.mtxLocal.translation);
            let pivot = Reflect.get(this.cannon, "barrelPivot");
            if (pivot.translation.z < 0.2)
                pivot.translateZ((0.2 - pivot.translation.z) / 5);
            for (let detonation of this.detonations.getChildren()) {
                if (detonation.update(_timeslice))
                    this.detonations.removeChild(detonation);
            }
        }
        input(_x, _y, _z) {
            let move = new ƒ.Vector3(_x, _y, _z);
            this.crosshairTarget.mtxLocal.translate(move);
            this.crosshairTarget.restrictPosition(UfoundLost.ufoSpaceDefinition.min, UfoundLost.ufoSpaceDefinition.max);
            this.crosshair.restrictPosition(UfoundLost.ufoSpaceDefinition.min, UfoundLost.ufoSpaceDefinition.max);
        }
        shoot() {
            // ƒ.Debug.fudge("shoot");
            let detonation = new UfoundLost.Detonation(this.crosshair.mtxLocal.translation);
            this.detonations.appendChild(detonation);
            let pivot = Reflect.get(this.cannon, "barrelPivot");
            pivot.translation = ƒ.Vector3.Z(0.0);
            // this.getComponent(ƒ.ComponentAudio).play(true);
        }
        createCannon() {
            let cannon = new ƒAid.Node("Cannon", ƒ.Matrix4x4.TRANSLATION(ƒ.Vector3.Z(5)));
            let mtrCannon = new ƒ.Material("Cannon", ƒ.ShaderFlat, new ƒ.CoatColored(ƒ.Color.CSS("lightgrey")));
            let meshCannon = new ƒ.MeshCube();
            let barrel = new ƒAid.Node("Barrel", ƒ.Matrix4x4.IDENTITY(), mtrCannon, meshCannon);
            let pivot = barrel.getComponent(ƒ.ComponentMesh).pivot;
            pivot.rotateZ(45);
            pivot.scale(new ƒ.Vector3(0.05, 0.05, 0.3));
            pivot.translateZ(0.2);
            cannon.appendChild(new ƒAid.Node("Pod1", ƒ.Matrix4x4.SCALING(new ƒ.Vector3(0.2, 0.02, 0.02)), mtrCannon, meshCannon));
            cannon.appendChild(new ƒAid.Node("Pod2", ƒ.Matrix4x4.SCALING(new ƒ.Vector3(0.02, 0.02, 0.2)), mtrCannon, meshCannon));
            let bearing = new ƒAid.Node("Bearing", ƒ.Matrix4x4.TRANSLATION(ƒ.Vector3.Y(0.2)), mtrCannon, new ƒ.MeshSphere("Bearing", 6, 6));
            bearing.getComponent(ƒ.ComponentMesh).pivot.scale(new ƒ.Vector3(0.1, 0.1, 0.3));
            cannon.appendChild(bearing);
            bearing.appendChild(barrel);
            Reflect.set(cannon, "barrelPivot", pivot);
            Reflect.set(cannon, "bearingLocal", cannon.getChildrenByName("Bearing")[0].mtxLocal);
            return cannon;
        }
    }
    UfoundLost.Flak = Flak;
})(UfoundLost || (UfoundLost = {}));
var UfoundLost;
(function (UfoundLost) {
    var ƒAid = FudgeAid;
    let HELI;
    (function (HELI) {
        HELI[HELI["NONE"] = 0] = "NONE";
        HELI[HELI["CAUGHT"] = 1] = "CAUGHT";
        HELI[HELI["SPLAT"] = 2] = "SPLAT";
    })(HELI = UfoundLost.HELI || (UfoundLost.HELI = {}));
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
            this.catcher = new ƒAid.Node("Catcher", ƒ.Matrix4x4.IDENTITY(), HeliPack.mtrCatcherBox, HeliPack.mesh);
            let cmpMeshCatcher = this.catcher.getComponent(ƒ.ComponentMesh);
            cmpMeshCatcher.pivot.translateY(-0.22);
            cmpMeshCatcher.pivot.scale(_size);
            cmpMeshCatcher.pivot.scaleY(0.3);
            // cmpMeshCatcher.activate(false);
            this.appendChild(this.catcher);
            this.calculateBox();
        }
        input(_x, _z) {
            let move = new ƒ.Vector3(_x, 0, _z);
            this.mtxLocal.translate(move);
            this.restrictPosition(UfoundLost.heliSpaceDefinition.min, UfoundLost.heliSpaceDefinition.max);
            this.calculateBox();
        }
        catch(_character) {
            let position = _character.mtxWorld.translation;
            for (let iHeli = 0; iHeli < 4; iHeli++) {
                if (position.isInsideSphere(this.getChild(iHeli).mtxWorld.translation, 0.5))
                    return HELI.SPLAT;
            }
            if (position.isInsideCube(this.minBox, this.maxBox))
                return HELI.CAUGHT;
            return HELI.NONE;
        }
        calculateBox() {
            let cmpMeshCatcher = this.catcher.getComponent(ƒ.ComponentMesh);
            this.minBox = ƒ.Vector3.TRANSFORMATION(ƒ.Vector3.ONE(-0.5), cmpMeshCatcher.mtxWorld);
            this.maxBox = ƒ.Vector3.TRANSFORMATION(ƒ.Vector3.ONE(0.5), cmpMeshCatcher.mtxWorld);
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
            let cmpAudio = new ƒ.ComponentAudio(Helicopter.audio, true, true);
            cmpAudio.volume = 0.05;
            this.addComponent(cmpAudio);
        }
    }
    Helicopter.audio = new ƒ.Audio("Audio/Helicopter0.mp3");
    // private static material: ƒ.Material = new ƒ.Material("Helicopter", ƒ.ShaderUniColor, new ƒ.CoatColored(ƒ.Color.CSS("yellow", 0.5)));
    Helicopter.material = new ƒ.Material("Helicopter", ƒ.ShaderTexture, new ƒ.CoatTextured(ƒ.Color.CSS("white"), new ƒ.TextureImage("Images/Helicopter.png")));
    UfoundLost.Helicopter = Helicopter;
})(UfoundLost || (UfoundLost = {}));
var UfoundLost;
(function (UfoundLost) {
    var ƒui = FudgeUserInterface;
    class GameState extends ƒ.Mutable {
        constructor() {
            super(...arguments);
            this.vKidnapped = 0;
            this.vDead = 0;
            this.vSaved = 0;
            this.aDead = 0;
            this.aSaved = 0;
        }
        reduceMutator(_mutator) { }
    }
    UfoundLost.GameState = GameState;
    UfoundLost.gameState = new GameState();
    class Hud {
        static start() {
            let domHud = document.querySelector("div#Hud");
            Hud.controller = new ƒui.Controller(UfoundLost.gameState, domHud);
            Hud.controller.updateUserInterface();
        }
    }
    UfoundLost.Hud = Hud;
})(UfoundLost || (UfoundLost = {}));
var UfoundLost;
(function (UfoundLost) {
    var ƒ = FudgeCore;
    var ƒAid = FudgeAid;
    const yCamera = 4;
    UfoundLost.viewport = new ƒ.Viewport();
    UfoundLost.graph = new ƒ.Node("MainGraph");
    UfoundLost.ufoSpaceDefinition = { height: 7, size: new ƒ.Vector3(16, 2, 9), min: new ƒ.Vector3(), max: new ƒ.Vector3() };
    UfoundLost.heliSpaceDefinition = { height: 1, size: new ƒ.Vector3(16, 0.5, 9), min: new ƒ.Vector3(), max: new ƒ.Vector3() };
    UfoundLost.heliPackDefinition = { height: UfoundLost.heliSpaceDefinition.height, size: new ƒ.Vector3(2, 0.5, 2), min: new ƒ.Vector3(), max: new ƒ.Vector3() };
    const cntFlak = { x: new ƒ.Control("FlakX", 0.05), z: new ƒ.Control("FlakZ", 0.03), y: new ƒ.Control("FlakY", -0.001) };
    const cntHeliPack = { x: new ƒ.Control("HeliPackX", 0.1), z: new ƒ.Control("HeliPackZ", 0.1), delay: 500 };
    let flak;
    window.addEventListener("load", waitForInteraction);
    let canvas;
    function waitForInteraction(_event) {
        canvas = document.querySelector("canvas");
        let div = document.querySelector("div#Title");
        div.addEventListener("click", () => {
            div.style.display = "none";
            start();
        });
    }
    async function start() {
        ƒ.Debug.log("UfoundLost starts");
        let listener = new ƒ.ComponentAudioListener();
        ƒ.AudioManager.default.listenTo(UfoundLost.graph);
        ƒ.AudioManager.default.listenWith(listener);
        UfoundLost.graph.addComponent(listener);
        let cmpAudio = new ƒ.ComponentAudio(new ƒ.Audio("Audio/Atmo.mp3"), true, true);
        UfoundLost.graph.addComponent(cmpAudio);
        let description = document.querySelector("div#Description");
        description.style.display = "block";
        canvas.addEventListener("click", canvas.requestPointerLock);
        await new Promise((_resolve) => { canvas.addEventListener("click", _resolve); });
        description.style.display = "none";
        let divHud = document.querySelector("div#Hud");
        divHud.style.display = "block";
        setupInteraction();
        createViewport();
        createScene();
        createArmada(10);
        UfoundLost.graph.appendChild(UfoundLost.Ufo.all);
        flak = new UfoundLost.Flak();
        UfoundLost.graph.appendChild(flak);
        UfoundLost.graph.appendChild(UfoundLost.Villager.all);
        UfoundLost.Hud.start();
        ƒ.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, update);
        ƒ.Loop.start();
    }
    function update(_event) {
        let timeslice = ƒ.Loop.timeFrameGame / 1000;
        flak.update(timeslice);
        controlHeliPack(timeslice);
        UfoundLost.Ufo.updateAll(timeslice);
        UfoundLost.Villager.updateAll(timeslice);
        UfoundLost.viewport.draw();
    }
    function setupInteraction() {
        canvas.addEventListener("mousemove", hndMouse);
        canvas.addEventListener("wheel", hndMouse);
        canvas.addEventListener("pointerdown", (_event) => flak.shoot());
        cntHeliPack.x.setDelay(cntHeliPack.delay);
        cntHeliPack.z.setDelay(cntHeliPack.delay);
    }
    function controlHeliPack(_timeslice) {
        cntHeliPack.z.setInput(ƒ.Keyboard.mapToValue(1, 0, [ƒ.KEYBOARD_CODE.S, ƒ.KEYBOARD_CODE.ARROW_DOWN])
            + ƒ.Keyboard.mapToValue(-1, 0, [ƒ.KEYBOARD_CODE.W, ƒ.KEYBOARD_CODE.ARROW_UP]));
        cntHeliPack.x.setInput(ƒ.Keyboard.mapToValue(-1, 0, [ƒ.KEYBOARD_CODE.A, ƒ.KEYBOARD_CODE.ARROW_LEFT])
            + ƒ.Keyboard.mapToValue(1, 0, [ƒ.KEYBOARD_CODE.D, ƒ.KEYBOARD_CODE.ARROW_RIGHT]));
        UfoundLost.heliPack.input(cntHeliPack.x.getOutput(), cntHeliPack.z.getOutput());
    }
    function hndMouse(_event) {
        cntFlak.x.setInput(_event.movementX);
        cntFlak.z.setInput(_event.movementY);
        cntFlak.y.setInput((_event.type == "wheel") ? _event.deltaY : 0);
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
        for (let i = 0; i < _nUfos; i++) {
            new UfoundLost.Ufo();
        }
    }
    function createScene() {
        let origin = new ƒAid.NodeCoordinateSystem("Origin");
        // graph.appendChild(origin);
        ƒAid.addStandardLightComponents(UfoundLost.graph);
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
        UfoundLost.heliPack = new UfoundLost.HeliPack(ƒ.Vector3.Y(UfoundLost.heliPackDefinition.height), UfoundLost.heliPackDefinition.size);
        UfoundLost.graph.appendChild(UfoundLost.heliPack);
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
        let cmpMeshHeliPack = UfoundLost.heliPack.getChildrenByName("Catcher")[0].getComponent(ƒ.ComponentMesh);
        UfoundLost.heliPackDefinition.min = ƒ.Vector3.TRANSFORMATION(ƒ.Vector3.ONE(-0.5), cmpMeshHeliPack.mtxWorld);
        UfoundLost.heliPackDefinition.max = ƒ.Vector3.TRANSFORMATION(ƒ.Vector3.ONE(0.5), cmpMeshHeliPack.mtxWorld);
        cmpMeshUfoSpace.activate(false);
        cmpMeshHeliSpace.activate(false);
    }
})(UfoundLost || (UfoundLost = {}));
var UfoundLost;
(function (UfoundLost) {
    class Splat extends UfoundLost.GameObject {
        constructor(_name, _position) {
            super(_name, _position, Splat.material, ƒ.Vector2.ONE(0.5));
            this.hndTimer = (_event) => {
                if (_event.lastCall) {
                    UfoundLost.graph.removeChild(this);
                }
                let ratio = _event.count / Splat.frames;
                let cmpMaterial = this.getComponent(ƒ.ComponentMaterial);
                cmpMaterial.clrPrimary.a = ratio;
            };
            let cmpAudio = new ƒ.ComponentAudio(ƒ.Random.default.getElement(Splat.audio), false, true);
            cmpAudio.volume = 1;
            this.addComponent(cmpAudio);
            ƒ.Time.game.setTimer(Splat.timeFrame, Splat.frames, this.hndTimer);
            UfoundLost.graph.appendChild(this);
        }
        static create(_position, _alien = false) {
            let splat = new Splat("Splat", _position);
            splat.getComponent(ƒ.ComponentMaterial).clrPrimary = ƒ.Color.CSS(_alien ? "lime" : "red");
        }
    }
    Splat.frames = 20;
    Splat.timeFrame = 30;
    Splat.audio = [
        new ƒ.Audio("Audio/Splat0.mp3"), new ƒ.Audio("Audio/Splat1.mp3"), new ƒ.Audio("Audio/Splat2.mp3")
    ];
    Splat.material = new ƒ.Material("Splat", ƒ.ShaderTexture, new ƒ.CoatTextured(ƒ.Color.CSS("white"), new ƒ.TextureImage("Images/Splat.png")));
    UfoundLost.Splat = Splat;
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
        JOB[JOB["HIT"] = 5] = "HIT";
        JOB[JOB["STRUGGLE"] = 6] = "STRUGGLE";
        JOB[JOB["EXPLODE"] = 7] = "EXPLODE";
    })(JOB || (JOB = {}));
    class Ufo extends UfoundLost.GameObject {
        constructor() {
            super("Ufo", Ufo.getStartPosition(), Ufo.material, ƒ.Vector2.ONE(0.5));
            this.timeForNextJob = 0;
            this.damage = 0;
            this.timeToWiggle = 0;
            this.tractor = this.createTractorBeam();
            this.addComponent(new ƒ.ComponentAudio());
            this.addComponent(new ƒ.ComponentAudio(Ufo.audioHit)); // for hit sound
            Ufo.all.appendChild(this);
            this.roam();
        }
        static updateAll(_timeslice) {
            for (let ufo of Ufo.all.getChildren())
                ufo.update(_timeslice);
        }
        static checkAllForHit(_position, _radius) {
            for (let ufo of Ufo.all.getChildren())
                if (ufo.mtxLocal.translation.isInsideSphere(_position, _radius))
                    ufo.hit(1 - ƒ.Vector3.DIFFERENCE(ufo.mtxLocal.translation, _position).magnitude / _radius);
        }
        hit(_power) {
            // ƒ.Debug.warn(_power);
            let cmpAudio = this.getComponents(ƒ.ComponentAudio)[1];
            cmpAudio.volume = _power;
            cmpAudio.play(true);
            if (this.villager)
                this.villager.fall();
            this.damage += _power;
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
        loseVillager() {
            this.villager = null;
            this.job = JOB.HIT;
        }
        update(_timeslice) {
            super.update(_timeslice);
            let position = this.mtxLocal.translation;
            let atTarget = this.atTarget(_timeslice);
            // let jobPrevious: JOB = this.job;
            let cmpAudio = this.getComponent(ƒ.ComponentAudio);
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
                        cmpAudio.setAudio(Ufo.audioPrepare);
                        cmpAudio.volume = 0.1;
                        cmpAudio.play(true);
                        break;
                    }
                    this.roam();
                    break;
                case JOB.PREPARE:
                    if (!atTarget)
                        break; // keep preparing
                    this.job = JOB.TRACTOR;
                    this.velocity = ƒ.Vector3.ZERO();
                    this.activateTractor(true);
                    this.timeForNextJob = ƒ.Time.game.get() + 1000 * ƒ.Random.default.getRange(10, 15);
                    cmpAudio.volume = 0.5;
                    cmpAudio.setAudio(Ufo.audioTractor);
                    cmpAudio.play(true);
                    this.villager = UfoundLost.Villager.create(this);
                    break;
                case JOB.TRACTOR:
                    this.tractor.getComponent(ƒ.ComponentMaterial).pivot.translateY(0.02);
                    // if (ƒ.Time.game.get() < this.timeForNextJob) break; // keep sucking
                    if (!this.villager.atTarget(_timeslice))
                        break; // keep sucking
                    this.villager.capture();
                    this.villager = null;
                    this.roam();
                    break;
                case JOB.HIT:
                    if (this.wiggle())
                        break; // keep wiggeling
                    this.roam();
                    break;
                case JOB.STRUGGLE:
                    this.activateTractor(ƒ.Random.default.getBoolean());
                    if (this.wiggle())
                        break; // keep wiggeling
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
                    new UfoundLost.Alien("Alien", this);
                    break;
            }
            // if (jobPrevious != this.job)
            // ƒ.Debug.fudge(JOB[this.job]);
        }
        activateTractor(_on) {
            this.tractor.getComponent(ƒ.ComponentMesh).activate(_on);
        }
        roam() {
            this.activateTractor(false);
            this.maxVelocity = Ufo.maxVelocity;
            this.findTargetPosition();
            this.job = JOB.ROAM;
            let cmpAudio = this.getComponent(ƒ.ComponentAudio);
            cmpAudio.volume = 1;
            cmpAudio.setAudio(ƒ.Random.default.getElement(Ufo.audioMoves));
            cmpAudio.play(true);
        }
        wiggle() {
            let wiggle = (this.timeToWiggle - ƒ.Time.game.get()) / Ufo.maxTimeToWiggle;
            let angle = 0;
            if (wiggle < 0) {
                this.mtxLocal.rotation = ƒ.Vector3.ZERO();
                return false;
            }
            angle = wiggle * 60 * Math.sin(wiggle * 10 * Math.PI);
            this.mtxLocal.mutate({ rotation: { z: angle } });
            return true;
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
    Ufo.all = new ƒ.Node("Ufos");
    Ufo.audioMoves = [
        new ƒ.Audio("Audio/UfoMove0.mp3"), new ƒ.Audio("Audio/UfoMove1.mp3"), new ƒ.Audio("Audio/UfoMove2.mp3")
    ];
    Ufo.audioPrepare = new ƒ.Audio("Audio/Ufo0.mp3");
    Ufo.audioTractor = new ƒ.Audio("Audio/Beam0.mp3");
    Ufo.audioHit = new ƒ.Audio("Audio/UfoHit.mp3");
    // private static material: ƒ.Material = new ƒ.Material("Ufo", ƒ.ShaderUniColor, new ƒ.CoatColored(ƒ.Color.CSS("black", 0.5)));
    // private static mtrTractor: ƒ.Material = new ƒ.Material("Ufo", ƒ.ShaderUniColor, new ƒ.CoatColored(ƒ.Color.CSS("pink", 0.5)));
    Ufo.material = new ƒ.Material("Ufo", ƒ.ShaderTexture, new ƒ.CoatTextured(ƒ.Color.CSS("white"), new ƒ.TextureImage("Images/Ufo.png")));
    Ufo.mtrTractor = new ƒ.Material("Ufo", ƒ.ShaderTexture, new ƒ.CoatTextured(ƒ.Color.CSS("white", 0.4), new ƒ.TextureImage("Images/TractorBeam.png")));
    Ufo.maxTimeToWiggle = 2000; //milliseconds
    Ufo.maxVelocity = 5;
    UfoundLost.Ufo = Ufo;
})(UfoundLost || (UfoundLost = {}));
//# sourceMappingURL=UfoundLost.js.map