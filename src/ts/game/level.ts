import { Point } from "../common";
import { Entity } from "../entity/entity";
import { Seed } from "../entity/seed";
import { Camera, FocusCamera } from "./camera";
import { Game } from "./game";
import { Tile, Tiles } from "./tiles";

// Contains everything in one level, including the tiles and the entities.
export class Level {
    game: Game;
    entities: Entity[] = [];

    camera: Camera = new Camera();

    tiles: Tiles = new Tiles(0, 0);

    start: Point = { x: 0, y: 0 };

    constructor(game: Game) {
        this.game = game;
    }

    initFromImage(image: HTMLImageElement) {
        this.entities = [];
        this.tiles = new Tiles(image.width, image.height);

        // Draw the image to a canvas to get the pixels.
        const canvas = document.createElement('canvas');
        canvas.width = image.width;
        canvas.height = image.height;
        const context = canvas.getContext('2d')!;
        context.drawImage(image, 0, 0, image.width, image.height);

        let startTile: Point | undefined = { x: 0, y: 0}

        // Read the pixels. White is empty, black is wall, and the red square is the starting position.
        const imageData = context.getImageData(0, 0, image.width, image.height);
        for (let y = 0; y < image.height; y++) {
            for (let x = 0; x < image.width; x++) {
                const color = pixelToColorString(imageData, x, y);
                if (color === 'ffffff') {
                    this.tiles.setTile({ x, y }, Tile.Empty);
                }
                else if (color === '000000') {
                    this.tiles.setTile({ x, y }, Tile.Wall);
                }
                else if (color === 'ff0000') {
                    startTile = {x, y};
                }
                else {
                    console.log(`Unknown color: ${color} at ${x}, ${y}.`);
                }
            }
        }

        if (startTile) {
            this.start = this.tiles.getTileCoord(startTile, { x: 0.5, y: 1 });
        }

        // Make player
        {
            const seed = new Seed(this);
            seed.midX = this.start.x;
            seed.maxY = this.start.y;
            this.entities.push(seed);

            const fc = new FocusCamera();
            fc.target = () => ({x: seed.midX, y: seed.minY});

            this.camera = fc;
        }
    }

    update(dt: number) {
        for (const entity of this.entities) {
            entity.update(dt);
        }
        this.camera.update(dt);
    }

    render(context: CanvasRenderingContext2D) {
        this.camera.applyTransform(context);

        this.renderSky(context);

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