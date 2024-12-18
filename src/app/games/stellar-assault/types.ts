export interface SpriteSheet {
  image: HTMLImageElement;
  frames: {
    [key: string]: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
  };
}

export interface GameAssets {
  player: {
    blue: HTMLImageElement;
    green: HTMLImageElement;
    orange: HTMLImageElement;
    damage: HTMLImageElement[];
  };
  enemies: {
    black: HTMLImageElement;
    blue: HTMLImageElement;
    green: HTMLImageElement;
    red: HTMLImageElement;
  };
  lasers: {
    blue: HTMLImageElement;
    green: HTMLImageElement;
    red: HTMLImageElement;
  };
  powerups: {
    pill: HTMLImageElement;
    bolt: HTMLImageElement;
    shield: HTMLImageElement;
  };
  effects: {
    shield: HTMLImageElement;
  };
  meteors: HTMLImageElement[];
  background: HTMLImageElement;
}
