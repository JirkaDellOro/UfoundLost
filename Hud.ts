namespace UfoundLost {
  import ƒui = FudgeUserInterface;

  export class GameState extends ƒ.Mutable {
    public vKidnapped: number = 0;
    public vDead: number = 0;
    public vSaved: number = 0;
    public aDead: number = 0;
    public aSaved: number = 0;
    protected reduceMutator(_mutator: ƒ.Mutator): void {/* */ }
  }

  export let gameState: GameState = new GameState();

  export class Hud {
    private static controller: ƒui.Controller;

    public static start(): void {
      let domHud: HTMLDivElement = document.querySelector("div#Hud");
      Hud.controller = new ƒui.Controller(gameState, domHud);
      Hud.controller.updateUserInterface();
    }
  }
}