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
            const imageInfo = Images.images["tiles"];
            if (!imageInfo.loaded) {
                return;
            }
            this.image = imageInfo.image;
        }

        const invMatrix = context.getTransform().inverse();
        const gameMinPoint = invMatrix.transformPoint({ x: 0, y: 0 });
        const gameMaxPoint = invMatrix.transformPoint({
            x: context.canvas.width,
            y: context.canvas.height,
        });

        const minXTile = Math.floor(gameMinPoint.x / TILE_SIZE);
        const minYTile = Math.floor(gameMinPoint.y / TILE_SIZE);
        const maxXTile = Math.floor(gameMaxPoint.x / TILE_SIZE);
        const maxYTile = Math.floor(gameMaxPoint.y / TILE_SIZE);

        for (let y = minYTile; y <= maxYTile; y++) {
            for (let x = minXTile; x <= maxXTile; x++) {
                this.renderTile(context, { x, y });
            }
        }
    }

    renderTile(
        context: CanvasRenderingContext2D,
        pos: Point,
    ) {
        const tile = this.getTile(pos);
        const renderPos = {x: pos.x * TILE_SIZE, y: pos.y * TILE_SIZE }

        if (tile == Tile.Wall) {
            // Loop through each corner
            for (const dx of [-1, 1]) {
                const dxTile = this.getTile({ x: pos.x + dx, y: pos.y });
                for (const dy of [-1, 1]) {
                    const subTilePos = { x: dx < 0 ? 0 : 1, y: dy < 0 ? 0 : 1}
                    const dyTile = this.getTile({ x: pos.x, y: pos.y + dy });
                    const dxdyTile = this.getTile({ x: pos.x + dx, y: pos.y + dy });
                    let tilePos: Point;

                    if (dyTile == Tile.Wall) {
                        if (dxTile == Tile.Wall) {
                            if (dxdyTile != Tile.Wall) {
                                // Ending part of the platform.
                                tilePos = { x: 0, y: 2 };
                            } else {
                                tilePos = { x: 0, y: 4 };
                            }
                        } else {
                            tilePos = { x: 0, y: 3 };
                        }
                    } else {
                        if (dxTile == Tile.Wall) {
                            tilePos = { x: 0, y: 1 };
                        } else {
                            tilePos = { x: 0, y: 0 };
                        }
                    }
                    this.drawFromTileSet(
                        context,
                        {
                            tilePos,
                            subTilePos,
                            renderPos
                        }
                    );
                }
            }
        }
    }

    drawFromTileSet(
        context: CanvasRenderingContext2D,
        {
            tilePos,
            subTilePos,
            renderPos,
        }: { tilePos: Point; subTilePos: Point; renderPos: Point }
    ) {
        const halfTileSizePx = TILE_SIZE_PX / 2;
        const halfTileSize = TILE_SIZE / 2;
        // Image must be loaded when this is called.
        context.drawImage(
            this.image!,
            tilePos.x * TILE_SIZE_PX + subTilePos.x * halfTileSizePx,
            tilePos.y * TILE_SIZE_PX + subTilePos.y * halfTileSizePx,
            halfTileSizePx,
            halfTileSizePx,
            // TODO: I'm not sure about these being in the right coordinate space.
            renderPos.x + subTilePos.x * halfTileSize,
            renderPos.y + subTilePos.y * halfTileSize,
            // +1 is a kludge to avoid gaps between tiles.
            halfTileSize + 1,
            halfTileSize + 1
        );
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

    getTileCoord(p: Point, positionInTile: Point): Point {
        return {
            x: p.x * TILE_SIZE + (TILE_SIZE - 1) * positionInTile.x,
            y: p.y * TILE_SIZE + (TILE_SIZE - 1) * positionInTile.y,
        }
    }

    getTileCoordFromCoord(p: Point, positionInTile: Point): Point {
        return this.getTileCoord({x: Math.floor(p.x / TILE_SIZE), y: Math.floor(p.y / TILE_SIZE)}, positionInTile);
    }

    static async preload() {
        await Images.loadImage({ name: "tiles", path: "sprites/" });
    }
}
