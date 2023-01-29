import { Point } from "../../common";
import { PHYSICS_SCALE, TILE_SIZE } from "../../constants";
import { Aseprite } from "../../lib/aseprite";
import { TileLayer } from "./tile-layer";

export enum ObjectTile {
    Empty = 0,
    PlantBase = 1,
    PlantTop = 2,
    DeadPlant = 3,
    Glow = 4,
    Vine = 5,
    VineTop = 6,
}

// Position of the tile in the tileset.
const tilePositions = {
    [ObjectTile.PlantBase]: { x: 7, y: 2 },
    [ObjectTile.PlantTop]: { x: 7, y: 1 },
    [ObjectTile.DeadPlant]: { x: 8, y: 2 },
    [ObjectTile.Vine]: { x: 6, y: 2 },
    [ObjectTile.VineTop]: { x: 6, y: 1 },
}

function getNextDayTile(tile: ObjectTile): ObjectTile {
    const oneDayTiles = new Set([
        ObjectTile.PlantTop,
        ObjectTile.DeadPlant,
        ObjectTile.Vine,
        ObjectTile.VineTop,
    ]);
    if (oneDayTiles.has(tile)) {
        return ObjectTile.Empty;
    }

    if (tile == ObjectTile.PlantBase) {
        return ObjectTile.DeadPlant;
    }

    return tile;
}

export class ObjectLayer extends TileLayer<ObjectTile> {

    advanceDay() {
        for (let y = 0; y < this.h; y++) {
            for (let x = 0; x < this.w; x++) {
                this.tiles[y][x] = getNextDayTile(this.tiles[y][x]);
            }
        }
    }

    renderTile(context: CanvasRenderingContext2D, pos: Point): void {
        const tile = this.getTile(pos);
        const renderPos = {x: pos.x * TILE_SIZE, y: pos.y * TILE_SIZE }

        // Special case: Glow
        if (tile == ObjectTile.Glow) {
            Aseprite.drawAnimation({
                context,
                image: 'glow',
                animationName: 'idle',
                time: this.animCount,
                position: {
                    x: renderPos.x + TILE_SIZE / 2,
                    y: renderPos.y + TILE_SIZE,
                },
                scale: PHYSICS_SCALE,
                anchorRatios: { x: 0.5, y: 1 },
            })
            return;
        }

        const tilePos = tilePositions[tile];
        if (!tilePos) {
            return;
        }

        this.drawTile(context, {tilePos, renderPos});
    }
}
