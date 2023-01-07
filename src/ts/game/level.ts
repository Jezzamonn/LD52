import { Point } from "../common";
import { Entity } from "../entity/entity";
import { Tile, Tiles } from "./tiles";

// Contains everything in one level, including the tiles and the entities.
export class Level {
    entities: Entity[] = [];

    tiles: Tiles = new Tiles(0, 0);

    start: Point = { x: 0, y: 0 };

    constructor() {}

    initFromImage(image: HTMLImageElement) {
        this.entities = [];
        this.tiles = new Tiles(image.width, image.height);

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
                const color = pixelToColorString(imageData, x, y);
                if (color === 'ffffff') {
                    this.tiles.setTile({ x, y }, Tile.Empty);
                }
                else if (color === '000000') {
                    this.tiles.setTile({ x, y }, Tile.Wall);
                }
                else if (color === 'ff0000') {
                    this.start = { x, y };
                }
                else {
                    console.log(`Unknown color: ${color} at ${x}, ${y}.`);
                }
            }
        }
    }

    update(dt: number) {
        for (const entity of this.entities) {
            entity.update(dt);
        }
    }

    render(context: CanvasRenderingContext2D) {
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