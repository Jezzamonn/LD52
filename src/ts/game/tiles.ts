import { Point } from "../common";
import { PHYSICS_SCALE, TILE_SIZE, TILE_SIZE_PX } from "../constants";
import { Aseprite, images } from "../lib/aseprite";
import { Images } from "../lib/images";

export enum Tile {
    Empty = 0,
    Wall = 1,
}

/**
 * 2D array of tiles.
 */
export class Tiles {

    tiles: Tile[][] = [];

    w = 0;
    h = 0;

    image: HTMLImageElement | undefined;

    constructor(w: number, h: number) {
        this.w = w;
        this.h = h;

        // Fill with empty
        for (let y = 0; y < h; y++) {
            this.tiles[y] = [];
            for (let x = 0; x < w; x++) {
                this.tiles[y][x] = Tile.Empty;
            }
        }
    }

    render(context: CanvasRenderingContext2D) {
        if (!this.image) {
            const imageInfo = Images.images['tiles'];
            if (!imageInfo.loaded) {
                return;
            }
            this.image = imageInfo.image;
        }

        const invMatrix = context.getTransform().inverse();
        const gameMinPoint = invMatrix.transformPoint({x: 0, y: 0});
        const gameMaxPoint = invMatrix.transformPoint({x: context.canvas.width, y: context.canvas.height});

        const minXTile = Math.floor(gameMinPoint.x / TILE_SIZE_PX);
        const minYTile = Math.floor(gameMinPoint.y / TILE_SIZE_PX);
        const maxXTile = Math.floor(gameMaxPoint.x / TILE_SIZE_PX);
        const maxYTile = Math.floor(gameMaxPoint.y / TILE_SIZE_PX);

        for (let y = minYTile; y <= maxYTile; y++) {
            for (let x = minXTile; x <= maxXTile; x++) {
                const tile = this.getTile({x, y});
                if (tile == Tile.Wall) {
                    this.renderTile(context, {x: 0, y: 0}, {x: x * TILE_SIZE_PX, y: y * TILE_SIZE_PX});
                }
            }
        }
    }

    renderTile(context: CanvasRenderingContext2D, spriteSheetPos: Point, pos: Point) {
        // Image must be loaded when this is called.
        context.drawImage(
            this.image!,
            spriteSheetPos.x * TILE_SIZE_PX,
            spriteSheetPos.y * TILE_SIZE_PX,
            TILE_SIZE_PX,
            TILE_SIZE_PX,
            pos.x,
            pos.y,
            // +1 is a kludge to avoid gaps between tiles.
            TILE_SIZE_PX + 1,
            TILE_SIZE_PX + 1);
        // Fallback: Lets start with drawing a rectangle.
        // context.fillStyle = 'black';
        // context.fillRect(pos.x, pos.y, TILE_SIZE, TILE_SIZE);
    }

    setTile(p: Point, tile: Tile) {
        this.tiles[p.y][p.x] = tile;
    }

    getTile(p: Point): Tile {
        if (p.x < 0 || p.x >= this.w || p.y >= this.h) {
            return Tile.Wall;
        }
        if (p.y < 0) {
            return Tile.Empty;
        }
        return this.tiles[p.y][p.x];
    }

    getTileAtCoord(p: Point): Tile {
        return this.getTile({
            x: Math.floor(p.x / TILE_SIZE),
            y: Math.floor(p.y / TILE_SIZE),
        });
    }

    static async preload() {
        await Images.loadImage({name: 'tiles', path: 'sprites/'})
    }
}
