import { GameAssets } from "./types";

export class AssetLoader {
  private static instance: AssetLoader;
  private assets: Partial<GameAssets> = {};
  private loadingPromise: Promise<GameAssets> | null = null;

  private constructor() {}

  static getInstance(): AssetLoader {
    if (!AssetLoader.instance) {
      AssetLoader.instance = new AssetLoader();
    }
    return AssetLoader.instance;
  }

  private loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }

  private async loadMultipleImages(
    srcs: string[]
  ): Promise<HTMLImageElement[]> {
    return Promise.all(srcs.map((src) => this.loadImage(src)));
  }

  async loadAssets(): Promise<GameAssets> {
    if (this.loadingPromise) {
      return this.loadingPromise;
    }

    this.loadingPromise = Promise.all([
      // Player ships
      this.loadImage("/images/space-shooter/player/playerShip1_blue.png"),
      this.loadImage("/images/space-shooter/player/playerShip2_green.png"),
      this.loadImage("/images/space-shooter/player/playerShip3_orange.png"),
      this.loadMultipleImages([
        "/images/space-shooter/damage/playerShip1_damage1.png",
        "/images/space-shooter/damage/playerShip1_damage2.png",
        "/images/space-shooter/damage/playerShip1_damage3.png",
      ]),

      // Enemy ships
      this.loadImage("/images/space-shooter/enemies/enemyBlack1.png"),
      this.loadImage("/images/space-shooter/enemies/enemyBlue2.png"),
      this.loadImage("/images/space-shooter/enemies/enemyGreen3.png"),
      this.loadImage("/images/space-shooter/enemies/enemyRed4.png"),

      // Lasers
      this.loadImage("/images/space-shooter/lasers/laserBlue01.png"),
      this.loadImage("/images/space-shooter/lasers/laserGreen10.png"),
      this.loadImage("/images/space-shooter/lasers/laserRed16.png"),

      // Power-ups
      this.loadImage("/images/space-shooter/powerups/pill_blue.png"),
      this.loadImage("/images/space-shooter/powerups/bolt_gold.png"),
      this.loadImage("/images/space-shooter/powerups/shield_gold.png"),

      // Effects
      this.loadImage("/images/space-shooter/effects/shield1.png"),

      // Meteors
      this.loadMultipleImages([
        "/images/space-shooter/meteors/meteorBrown_big1.png",
        "/images/space-shooter/meteors/meteorBrown_med1.png",
        "/images/space-shooter/meteors/meteorBrown_small1.png",
        "/images/space-shooter/meteors/meteorGrey_big1.png",
        "/images/space-shooter/meteors/meteorGrey_med1.png",
        "/images/space-shooter/meteors/meteorGrey_small1.png",
      ]),

      // Background
      this.loadImage("/images/space-shooter/backgrounds/darkPurple.png"),
    ]).then(
      ([
        playerBlue,
        playerGreen,
        playerOrange,
        playerDamage,
        enemyBlack,
        enemyBlue,
        enemyGreen,
        enemyRed,
        laserBlue,
        laserGreen,
        laserRed,
        pillPowerup,
        boltPowerup,
        shieldPowerup,
        shieldEffect,
        meteors,
        background,
      ]) => {
        const assets: GameAssets = {
          player: {
            blue: playerBlue,
            green: playerGreen,
            orange: playerOrange,
            damage: playerDamage,
          },
          enemies: {
            black: enemyBlack,
            blue: enemyBlue,
            green: enemyGreen,
            red: enemyRed,
          },
          lasers: {
            blue: laserBlue,
            green: laserGreen,
            red: laserRed,
          },
          powerups: {
            pill: pillPowerup,
            bolt: boltPowerup,
            shield: shieldPowerup,
          },
          effects: {
            shield: shieldEffect,
          },
          meteors,
          background,
        };

        this.assets = assets;
        return assets;
      }
    );

    return this.loadingPromise;
  }

  getAssets(): GameAssets {
    if (!this.assets) {
      throw new Error("Assets not loaded");
    }
    return this.assets as GameAssets;
  }
}
