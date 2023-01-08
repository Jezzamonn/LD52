import { Point } from "../common";
import { PHYSICS_SCALE, rng, TILE_SIZE, TILE_SIZE_PX } from "../constants";
import { Aseprite, images } from "../lib/aseprite";
import { Images } from "../lib/images";

export enum Tile {
    Empty = 0,
    Wall = 1,
    Plant = 2,
    PlantTop = 3,
    DeadPlant = 4,
    Glow = 5,
}

/**
 * 2D array of tiles.
 */
export class Tiles {
    tiles: Tile[][] = [];

    w = 0;
    h = 0;
    // Index of the top left corner of this level. Can move when the level grows.
    x = 0;
    y = 0;

    image: HTMLImageElement | undefined;

    constructor(w: number, h: number) {
        this.w = w + 2;
        this.h = h + 2;
        this.x = 1;
        this.y = 1;

        // Fill with mostly empty, a floor and some walls.
        for (let y = 0; y < this.h; y++) {
            this.tiles[y] = [];
            for (let x = 0; x < this.w; x++) {
                this.tiles[y][x] = y == (this.h - 1) ? Tile.Wall : Tile.Empty;
            }
            this.tiles[y][0] = Tile.Wall;
            this.tiles[y][this.w - 1] = Tile.Wall;
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
                    this.drawQuarterTile(
                        context,
                        {
                            tilePos,
                            subTilePos,
                            renderPos
                        }
                    );
                }
            }
        } else if (tile == Tile.Plant) {
            this.drawTile(
                context,
                {
                    tilePos: { x: 1, y: 2 },
                    renderPos
                }
            );
        } else if (tile == Tile.PlantTop) {
            this.drawTile(
                context,
                {
                    tilePos: { x: 1, y: 1 },
                    renderPos
                }
            );
        } else if (tile == Tile.DeadPlant) {
            this.drawTile(
                context,
                {
                    tilePos: { x: 2, y: 2 },
                    renderPos
                }
            );
        } else if (tile == Tile.Glow) {
            // this.drawTile(
            //     context,
            //     {
            //         tilePos: { x: Math.floor(2 * rng()), y: Math.floor(4 * rng()) },
            //         renderPos,
            //     }
            // );
        }
        // TODO maybe: little grass spikes? idk
    }

    advanceDay() {
        for (let y = 0; y < this.h; y++) {
            for (let x = 0; x < this.w; x++) {
                this.tiles[y][x] = this.getNextDayTile(this.tiles[y][x]);
            }
        }
    }

    getNextDayTile(tile: Tile): Tile {
        switch (tile) {
            case Tile.Plant:
                return Tile.DeadPlant;
            case Tile.PlantTop:
                return Tile.Empty;
            case Tile.DeadPlant:
                return Tile.Empty;
            default:
                return tile;
        }
    }

    drawTile(
        context: CanvasRenderingContext2D,
        {
            tilePos,
            renderPos,
        }: { tilePos: Point; renderPos: Point }
    ) {
        // Image must be loaded when this is called.
        context.drawImage(
            this.image!,
            tilePos.x * TILE_SIZE_PX,
            tilePos.y * TILE_SIZE_PX,
            TILE_SIZE_PX,
            TILE_SIZE_PX,
            renderPos.x,
            renderPos.y,
            // +1 is a kludge to avoid gaps between tiles.
            TILE_SIZE + 1,
            TILE_SIZE + 1,
        );
    }

    drawQuarterTile(
        context: CanvasRenderingContext2D,
        {
            tilePos,
            subTilePos,
            renderPos,
        }: { tilePos: Point; subTilePos: Point; renderPos: Point }
    ) {
        // Image must be loaded when this is called.
        const halfTileSizePx = TILE_SIZE_PX / 2;
        const halfTileSize = TILE_SIZE / 2;
        context.drawImage(
            this.image!,
            tilePos.x * TILE_SIZE_PX + subTilePos.x * halfTileSizePx,
            tilePos.y * TILE_SIZE_PX + subTilePos.y * halfTileSizePx,
            halfTileSizePx,
            halfTileSizePx,
            renderPos.x + subTilePos.x * halfTileSize,
            renderPos.y + subTilePos.y * halfTileSize,
            // +1 is a kludge to avoid gaps between tiles.
            halfTileSize + 1,
            halfTileSize + 1
        );
    }

    setTile(p: Point, tile: Tile) {
        // If out of bounds, extend the board!
        let y = p.y;
        while (y + this.y < 1) {
            this.tiles.unshift(this.tiles[0].slice())
            this.y++;
            this.h++;
        }
        while (y + this.y >= this.h - 1) {
            this.tiles.push(this.tiles[this.h - 1].slice())
            this.h++;
        }

        let x = p.x;
        while (x + this.x < 1) {
            for (let y = 0; y < this.h; y++) {
                this.tiles[y].unshift(this.tiles[y][0]);
            }
            this.x++;
            this.w++;
        }
        while (x + this.x >= this.w - 1) {
            for (let y = 0; y < this.h; y++) {
                this.tiles[y].push(this.tiles[y][this.w - 1]);
            }
            this.w++;
        }

        this.tiles[p.y + this.y][p.x + this.x] = tile;
    }

    setTileAtCoord(p: Point, tile: Tile) {
        this.setTile({
            x: Math.floor(p.x / TILE_SIZE),
            y: Math.floor(p.y / TILE_SIZE),
        }, tile);
    }

    getTile(p: Point): Tile {
        let x = Math.min(Math.max(p.x + this.x, 0), this.w - 1);
        let y = Math.min(Math.max(p.y + this.y, 0), this.h - 1);
        return this.tiles[y][x];
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
