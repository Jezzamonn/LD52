import { Point } from "../common";
import { rng, TILE_SIZE, TILE_SIZE_PX } from "../constants";
import { Entity } from "./entity/entity";
import { Seed, SeedType } from "./entity/seed";
import { Sprite } from "./entity/sprite";
import { Images } from "../lib/images";
import { Camera, FocusCamera } from "./camera";
import { Game } from "./game";
import { LevelInfo } from "./levels";
import { Tiles } from "./tile/tiles";
import { Background } from "./background";
import { BaseTile } from "./tile/base-layer";
import { ObjectTile } from "./tile/object-layer";

// Contains everything in one level, including the tiles and the entities.
export class Level {
    game: Game;
    entities: Entity[] = [];
    image: HTMLImageElement | undefined;
    levelInfo: LevelInfo
    remainingSeeds: SeedType[] = [];

    camera: FocusCamera = new FocusCamera();
    background: Background;

    tiles: Tiles = new Tiles(0, 0);

    start: Point = { x: 0, y: 0 };

    won = false;

    constructor(game: Game, levelInfo: LevelInfo) {
        this.game = game;
        this.levelInfo = levelInfo;
    }

    initFromImage() {
        const image = Images.images[this.levelInfo.name].image!;
        this.image = image;
        this.entities = [];
        this.tiles = new Tiles(image.width, image.height);

        this.background = new Background(this, {
            x: TILE_SIZE_PX * image.width / 2,
            y: TILE_SIZE_PX * image.height / 2,
        });

        // Draw the image to a canvas to get the pixels.
        const canvas = document.createElement('canvas');
        canvas.width = image.width;
        canvas.height = image.height;
        const context = canvas.getContext('2d')!;
        context.drawImage(image, 0, 0, image.width, image.height);

        // Read the pixels. White is empty, black is wall, and the red square is the starting position.
        const imageData = context.getImageData(0, 0, image.width, image.height);
        for (let y = 0; y < image.height; y++) {
            for (let x = 0; x < image.width; x++) {

                const basePos = this.tiles.getTileCoord({x, y}, { x: 0.5, y: 1 })

                const color = pixelToColorString(imageData, x, y);
                if (color === 'ffffff') {
                    // Don't need to do anything for empty tiles as they're the default.
                }
                else if (color === '000000') {
                    this.tiles.baseLayer.setTile({ x, y }, BaseTile.Dirt);
                }
                else if (color === 'aaaaaa') {
                    this.tiles.baseLayer.setTile({ x, y }, BaseTile.Cave);
                }
                else if (color === 'ffff00') {
                    this.tiles.objectLayer.setTile({ x, y }, ObjectTile.Glow);
                    this.tiles.baseLayer.setTile({ x, y }, BaseTile.Unknown);

                    // const glow = new Sprite(this, 'glow');
                    // glow.midX = basePos.x;
                    // glow.maxY = basePos.y;
                    // this.entities.push(glow);
                }
                else if (color === 'ff0000') {
                    this.start = basePos;
                    this.tiles.baseLayer.setTile({ x, y }, BaseTile.Unknown);
                }
                else {
                    console.log(`Unknown color: ${color} at ${x}, ${y}.`);
                }
            }
        }
        this.tiles.baseLayer.fillInUnknownTiles();

        this.remainingSeeds = this.levelInfo.seeds.slice();

        this.camera.target = () => ({x: this.start.x, y: this.start.y});
    }

    advanceDay() {
        // Update the tiles in the level.
        this.tiles.advanceDay();

        for (const entity of this.entities) {
            if (entity instanceof Seed && entity.planting == true) {
                entity.grow();
            }
        }

        // If we grew a flower, we win! Yay.
        for (const entity of this.entities) {
            if (entity instanceof Sprite && entity.name == 'flower') {
                this.won = true;
            }
        }
    }

    spawnPlayer(seedType: SeedType) {
        const seed = new Seed(this, seedType);
        seed.midX = this.start.x;
        seed.maxY = this.start.y;
        this.entities.push(seed);

        // Remove this seed as an option.
        this.remainingSeeds.splice(this.remainingSeeds.indexOf(seedType), 1);

        this.camera.target = () => seed.cameraFocus();
    }

    update(dt: number) {
        for (const entity of this.entities) {
            entity.update(dt);
        }

        for (let i = this.entities.length - 1; i >= 0; i--) {
            if (this.entities[i].done) {
                this.entities.splice(i, 1);
            }
        }

        this.background.update(dt);
        this.tiles.update(dt);
        this.camera.update(dt);
    }

    render(context: CanvasRenderingContext2D) {
        this.camera.applyTransform(context);

        this.renderSky(context);

        this.background.render(context);

        this.tiles.render(context);

        for (const entity of this.entities) {
            entity.render(context);
        }
    }

    renderSky(context: CanvasRenderingContext2D) {
        // Clear transform
        context.save();
        context.resetTransform();
        context.fillStyle = '#b3b9d1';
        context.fillRect(0, 0, context.canvas.width, context.canvas.height);
        context.restore();
    }
}

function pixelToColorString(imageData: ImageData, x: number, y: number) {
    const i = (y * imageData.width + x) * 4;
    const r = imageData.data[i];
    const g = imageData.data[i + 1];
    const b = imageData.data[i + 2];
    return r.toString(16).padStart(2, '0') + g.toString(16).padStart(2, '0') + b.toString(16).padStart(2, '0');
}