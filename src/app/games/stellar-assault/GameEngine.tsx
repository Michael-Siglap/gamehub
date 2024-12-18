import { AssetLoader } from "./AssetLoader";
import { GameAssets } from "./types";

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private assets!: GameAssets;
  private player!: Player;
  private enemies: Enemy[] = [];
  private bullets: Bullet[] = [];
  private particles: Particle[] = [];
  private powerups: Powerup[] = [];
  private meteors: Meteor[] = [];
  private score: number = 0;
  private isGameOver: boolean = false;
  private animationId: number | null = null;
  private lastEnemySpawn: number = 0;
  private lastPowerupSpawn: number = 0;
  private lastMeteorSpawn: number = 0;
  private difficulty: number = 1;
  private background!: Background;

  public onScoreUpdate: ((score: number) => void) | null = null;
  public onGameOver: (() => void) | null = null;

  constructor(canvas: HTMLCanvasElement, difficulty: number) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    this.difficulty = difficulty;
    this.initialize();
  }

  private async initialize() {
    try {
      this.assets = await AssetLoader.getInstance().loadAssets();
      this.player = new Player(
        this.canvas.width / 2,
        this.canvas.height - 100,
        this.assets.player
      );
      this.background = new Background(
        this.canvas.width,
        this.canvas.height,
        this.assets.background
      );
      this.resizeCanvas(this.canvas.width, this.canvas.height);
      this.setupEventListeners();
      this.start();
    } catch (error) {
      console.error("Failed to load game assets:", error);
    }
  }

  private setupEventListeners() {
    window.addEventListener("keydown", this.handleKeyDown.bind(this));
    window.addEventListener("keyup", this.handleKeyUp.bind(this));
  }

  private handleKeyDown(e: KeyboardEvent) {
    switch (e.code) {
      case "ArrowLeft":
        this.player.moveTo(this.player.x - 50);
        break;
      case "ArrowRight":
        this.player.moveTo(this.player.x + 50);
        break;
      case "Space":
        this.fireBullet();
        break;
    }
  }

  private handleKeyUp(e: KeyboardEvent) {
    if (e.code === "ArrowLeft" || e.code === "ArrowRight") {
      //this.player.stopMoving(); No need to stop, smooth movement handles this
    }
  }

  private fireBullet() {
    const bullet = new Bullet(
      this.player.x + this.player.width / 2,
      this.player.y,
      -10,
      this.assets.lasers.blue
    );
    this.bullets.push(bullet);
  }

  private spawnEnemy() {
    const x = Math.random() * (this.canvas.width - 60);
    const enemyType = Math.random() < 0.5 ? "basic" : "advanced";
    const enemyAsset =
      enemyType === "basic"
        ? this.assets.enemies.blue
        : this.assets.enemies.red;
    const enemy = new Enemy(x, -50, enemyAsset, enemyType, this.difficulty);
    this.enemies.push(enemy);
  }

  private spawnPowerup() {
    const x = Math.random() * (this.canvas.width - 32);
    const powerupType = Math.random() < 0.5 ? "shield" : "bolt";
    const powerupAsset = this.assets.powerups[powerupType];
    const powerup = new Powerup(x, -32, powerupAsset, powerupType);
    this.powerups.push(powerup);
  }

  private spawnMeteor() {
    const x = Math.random() * this.canvas.width;
    const meteorAsset =
      this.assets.meteors[
        Math.floor(Math.random() * this.assets.meteors.length)
      ];
    const meteor = new Meteor(x, -50, meteorAsset, this.difficulty);
    this.meteors.push(meteor);
  }

  private update() {
    this.background.update();
    this.player.update();
    this.updateBullets();
    this.updateEnemies();
    this.updateParticles();
    this.updatePowerups();
    this.updateMeteors();
    this.checkCollisions();

    if (Date.now() - this.lastEnemySpawn > 2000 / this.difficulty) {
      this.spawnEnemy();
      this.lastEnemySpawn = Date.now();
    }

    if (Date.now() - this.lastPowerupSpawn > 15000 / this.difficulty) {
      this.spawnPowerup();
      this.lastPowerupSpawn = Date.now();
    }

    if (Date.now() - this.lastMeteorSpawn > 3000 / this.difficulty) {
      this.spawnMeteor();
      this.lastMeteorSpawn = Date.now();
    }
  }

  private updateBullets() {
    this.bullets = this.bullets.filter((bullet) => bullet.isActive());
    this.bullets.forEach((bullet) => bullet.update());
  }

  private updateEnemies() {
    this.enemies = this.enemies.filter((enemy) => enemy.isActive());
    this.enemies.forEach((enemy) => enemy.update(this.difficulty));
  }

  private updateParticles() {
    this.particles = this.particles.filter((particle) => particle.isActive());
    this.particles.forEach((particle) => particle.update());
  }

  private updatePowerups() {
    this.powerups = this.powerups.filter((powerup) => powerup.isActive());
    this.powerups.forEach((powerup) => powerup.update());
  }

  private updateMeteors() {
    this.meteors = this.meteors.filter((meteor) => meteor.isActive());
    this.meteors.forEach((meteor) => meteor.update(this.difficulty));
  }

  private checkCollisions() {
    for (const enemy of this.enemies) {
      for (const bullet of this.bullets) {
        if (this.checkCollision(enemy, bullet)) {
          enemy.hit();
          bullet.deactivate();
          this.score += enemy.getPoints();
          this.createExplosion(
            enemy.x + enemy.width / 2,
            enemy.y + enemy.height / 2
          );
          if (this.onScoreUpdate) this.onScoreUpdate(this.score);
        }
      }

      if (this.checkCollision(enemy, this.player)) {
        if (this.player.hasShield()) {
          this.player.deactivateShield();
          enemy.hit();
          this.createExplosion(
            enemy.x + enemy.width / 2,
            enemy.y + enemy.height / 2
          );
        } else {
          this.player.takeDamage();
          if (this.player.getHealth() <= 0) {
            this.gameOver();
          }
        }
      }
    }

    for (const meteor of this.meteors) {
      if (this.checkCollision(meteor, this.player)) {
        if (this.player.hasShield()) {
          this.player.deactivateShield();
          meteor.hit();
        } else {
          this.player.takeDamage();
          if (this.player.getHealth() <= 0) {
            this.gameOver();
          }
        }
      }

      for (const bullet of this.bullets) {
        if (this.checkCollision(meteor, bullet)) {
          meteor.hit();
          bullet.deactivate();
          this.score += 5;
          this.createExplosion(
            meteor.x + meteor.width / 2,
            meteor.y + meteor.height / 2
          );
          if (this.onScoreUpdate) this.onScoreUpdate(this.score);
        }
      }
    }

    for (const powerup of this.powerups) {
      if (this.checkCollision(powerup, this.player)) {
        powerup.activate(this.player);
        this.powerups = this.powerups.filter((p) => p !== powerup);
      }
    }
  }

  private checkCollision(
    obj1: { x: number; y: number; width: number; height: number },
    obj2: { x: number; y: number; width: number; height: number }
  ) {
    return (
      obj1.x < obj2.x + obj2.width &&
      obj1.x + obj1.width > obj2.x &&
      obj1.y < obj2.y + obj2.height &&
      obj1.y + obj1.height > obj2.y
    );
  }

  private createExplosion(x: number, y: number) {
    for (let i = 0; i < 20; i++) {
      const particle = new ExplosionParticle(x, y);
      this.particles.push(particle);
    }
  }

  private gameOver() {
    this.isGameOver = true;
    if (this.onGameOver) this.onGameOver();
    this.stop();
  }

  private draw() {
    if (!this.ctx || !this.background || !this.player) return;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.background.draw(this.ctx);
    this.player.draw(this.ctx);
    this.enemies.forEach((enemy) => enemy.draw(this.ctx));
    this.bullets.forEach((bullet) => bullet.draw(this.ctx));
    this.particles.forEach((particle) => particle.draw(this.ctx));
    this.powerups.forEach((powerup) => powerup.draw(this.ctx));
    this.meteors.forEach((meteor) => meteor.draw(this.ctx));
  }

  public start() {
    const gameLoop = () => {
      this.update();
      this.draw();
      this.animationId = requestAnimationFrame(gameLoop);
    };
    gameLoop();
  }

  public stop() {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
    }
  }

  public restart() {
    this.enemies = [];
    this.bullets = [];
    this.particles = [];
    this.powerups = [];
    this.meteors = [];
    this.score = 0;
    this.isGameOver = false;
    this.player = new Player(
      this.canvas.width / 2,
      this.canvas.height - 100,
      this.assets.player
    );
    this.start();
  }

  public setDifficulty(difficulty: number) {
    this.difficulty = difficulty;
  }

  public resizeCanvas(width: number, height: number) {
    this.canvas.width = width;
    this.canvas.height = height;
    // Update game objects positions if necessary
    if (this.player) {
      this.player.x = (width - this.player.width) / 2;
      this.player.y = height - this.player.height - 20;
      this.player.moveTo(this.player.x); //Added to update targetX on resize
    }
    // Update background only if assets are loaded
    if (this.areAssetsLoaded()) {
      this.background = new Background(width, height, this.assets.background);
    }
  }

  private areAssetsLoaded(): boolean {
    return this.assets !== undefined && this.assets.background !== undefined;
  }
}

class Player {
  public x: number;
  public y: number;
  public width: number = 64;
  public height: number = 64;
  private speed: number = 5;
  private velocity: number = 0;
  private image: HTMLImageElement;
  private damageImages: HTMLImageElement[];
  private shieldActive: boolean = false;
  private shieldImage: HTMLImageElement | null = null;
  private health: number = 3;
  private imageLoaded: boolean = false;
  private targetX: number;

  constructor(x: number, y: number, playerAssets: GameAssets["player"]) {
    this.x = x;
    this.y = y;
    this.image = new Image();
    this.image.onload = () => {
      this.imageLoaded = true;
    };
    this.image.src = playerAssets.blue.src;
    this.damageImages = playerAssets.damage.map((img) => {
      const damageImg = new Image();
      damageImg.onload = () => {
        // We don't need to do anything here, but this ensures the image is loaded
      };
      damageImg.src = img.src;
      return damageImg;
    });
    this.targetX = x;
  }

  public activateShield(shieldImage: HTMLImageElement) {
    this.shieldActive = true;
    this.shieldImage = shieldImage;
    setTimeout(() => {
      this.deactivateShield();
    }, 10000); // Shield lasts for 10 seconds
  }

  public deactivateShield() {
    this.shieldActive = false;
    this.shieldImage = null;
  }

  public hasShield(): boolean {
    return this.shieldActive;
  }

  public moveTo(x: number) {
    this.targetX = Math.max(0, Math.min(x, 800 - this.width));
  }

  public update() {
    // Smooth movement towards target position
    const dx = this.targetX - this.x;
    if (Math.abs(dx) > this.speed) {
      this.x += Math.sign(dx) * this.speed;
    } else {
      this.x = this.targetX;
    }
    this.x = Math.max(0, Math.min(this.x, 800 - this.width));
  }

  public draw(ctx: CanvasRenderingContext2D) {
    if (!this.imageLoaded) return;

    let currentImage: HTMLImageElement;
    if (this.health >= 3) {
      currentImage = this.image;
    } else {
      const damageIndex = 2 - this.health;
      currentImage = this.damageImages[damageIndex] || this.image;
    }

    if (currentImage.complete && currentImage.naturalHeight !== 0) {
      ctx.drawImage(currentImage, this.x, this.y, this.width, this.height);
    }

    if (
      this.shieldActive &&
      this.shieldImage &&
      this.shieldImage.complete &&
      this.shieldImage.naturalHeight !== 0
    ) {
      ctx.globalAlpha = 0.5;
      ctx.drawImage(
        this.shieldImage,
        this.x - 10,
        this.y - 10,
        this.width + 20,
        this.height + 20
      );
      ctx.globalAlpha = 1;
    }
  }

  public takeDamage() {
    this.health--;
  }

  public getHealth(): number {
    return this.health;
  }
}

class Enemy {
  public x: number;
  public y: number;
  public width: number = 64;
  public height: number = 64;
  private speed: number;
  private health: number;
  private image: HTMLImageElement;
  private type: "basic" | "advanced";
  private baseSpeed: number;

  constructor(
    x: number,
    y: number,
    image: HTMLImageElement,
    type: "basic" | "advanced",
    difficulty: number
  ) {
    this.x = x;
    this.y = y;
    this.image = image;
    this.type = type;
    this.baseSpeed = type === "basic" ? 1 : 1.5;
    this.speed = this.baseSpeed * difficulty;
    this.health = type === "basic" ? 1 : 2;
  }

  public update(difficulty: number) {
    this.speed = this.baseSpeed * difficulty;
    this.y += this.speed;
  }

  public draw(ctx: CanvasRenderingContext2D) {
    ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
  }

  public hit() {
    this.health--;
  }

  public isActive() {
    return this.health > 0 && this.y < 600;
  }

  public getPoints() {
    return this.type === "basic" ? 10 : 20;
  }
}

class Bullet {
  public x: number;
  public y: number;
  public width: number = 8;
  public height: number = 20;
  private speed: number;
  private image: HTMLImageElement;

  constructor(x: number, y: number, speed: number, image: HTMLImageElement) {
    this.x = x;
    this.y = y;
    this.speed = speed;
    this.image = image;
  }

  public update() {
    this.y += this.speed;
  }

  public draw(ctx: CanvasRenderingContext2D) {
    ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
  }

  public isActive() {
    return this.y > 0 && this.y < 600;
  }

  public deactivate() {
    this.y = -100;
  }
}

class Powerup {
  public x: number;
  public y: number;
  public width: number = 32;
  public height: number = 32;
  private speed: number = 2;
  private image: HTMLImageElement;
  private type: "shield" | "bolt";

  constructor(
    x: number,
    y: number,
    image: HTMLImageElement,
    type: "shield" | "bolt"
  ) {
    this.x = x;
    this.y = y;
    this.image = image;
    this.type = type;
  }

  public update() {
    this.y += this.speed;
  }

  public draw(ctx: CanvasRenderingContext2D) {
    ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
  }

  public activate(player: Player) {
    if (this.type === "shield") {
      player.activateShield(this.image);
    } else if (this.type === "bolt") {
      // Implement bolt powerup effect (e.g., temporary faster shooting)
    }
  }

  public isActive() {
    return this.y < 600;
  }
}

class Particle {
  protected x: number;
  protected y: number;
  protected size: number;
  protected speedX: number;
  protected speedY: number;
  protected life: number;

  constructor(
    x: number,
    y: number,
    size?: number,
    speedX?: number,
    speedY?: number,
    life?: number
  ) {
    this.x = x;
    this.y = y;
    this.size = size || Math.random() * 3 + 1;
    this.speedX = speedX || Math.random() * 4 - 2;
    this.speedY = speedY || Math.random() * 4 - 2;
    this.life = life || 30;
  }

  public update() {
    this.x += this.speedX;
    this.y += this.speedY;
    this.life--;
  }

  public draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = `rgba(255, 165, 0, ${this.life / 30})`;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }

  public isActive() {
    return this.life > 0;
  }
}

class Meteor {
  public x: number;
  public y: number;
  public width: number;
  public height: number;
  private speed: number;
  private image: HTMLImageElement;
  private health: number;
  private baseSpeed: number;

  constructor(
    x: number,
    y: number,
    image: HTMLImageElement,
    difficulty: number
  ) {
    this.x = x;
    this.y = y;
    this.image = image;
    this.width = image.width;
    this.height = image.height;
    this.baseSpeed = Math.random() * 1 + 0.5;
    this.speed = this.baseSpeed * difficulty;
    this.health = Math.floor(this.width / 20); // Health based on size
  }

  public update(difficulty: number) {
    this.speed = this.baseSpeed * difficulty;
    this.y += this.speed;
  }

  public draw(ctx: CanvasRenderingContext2D) {
    ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
  }

  public hit() {
    this.health--;
  }

  public isActive() {
    return this.health > 0 && this.y < 600;
  }
}

class Background {
  private image: HTMLImageElement;
  private y: number = 0;
  private speed: number = 1;
  private width: number;
  private height: number;

  constructor(width: number, height: number, image: HTMLImageElement) {
    this.width = width;
    this.height = height;
    this.image = image;
  }

  public update() {
    this.y += this.speed;
    if (this.y >= this.height) {
      this.y = 0;
    }
  }

  public draw(ctx: CanvasRenderingContext2D) {
    ctx.drawImage(this.image, 0, this.y, this.width, this.height);
    ctx.drawImage(this.image, 0, this.y - this.height, this.width, this.height);
  }
}

class ExplosionParticle extends Particle {
  private color: string;
  private velocity: { x: number; y: number };
  private gravity: number;
  private opacity: number;

  constructor(x: number, y: number) {
    super(x, y, Math.random() * 3 + 1);
    this.color = `hsl(${Math.random() * 360}, 50%, 50%)`;
    this.velocity = {
      x: Math.random() * 6 - 3,
      y: Math.random() * 6 - 3,
    };
    this.gravity = 0.1;
    this.life = 100;
    this.opacity = 1;
  }

  update() {
    this.velocity.y += this.gravity;
    this.x += this.velocity.x;
    this.y += this.velocity.y;
    this.life--;
    this.opacity = this.life / 100;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.globalAlpha = this.opacity;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.restore();
  }
}
