import { Point } from "../common";
import { PHYSICS_SCALE, TILE_SIZE } from "../constants";
import { Aseprite } from "../lib/aseprite";
import { TileLayer } from "./tile-layer";

export enum ObjectTile {
    Empty = 0,
    PlantBase = 1,
    PlantTop = 2,
    DeadPlant = 3,
    Glow = 4,
}

function getNextDayTile(tile: ObjectTile): ObjectTile {
    switch (tile) {
        case ObjectTile.PlantBase:
            return ObjectTile.DeadPlant;
        case ObjectTile.PlantTop:
            return ObjectTile.Empty;
        case ObjectTile.DeadPlant:
            return ObjectTile.Empty;
        default:
            return tile;
    }
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

        if (tile == ObjectTile.PlantBase) {
            this.drawTile(
                context,
                {
                    tilePos: { x: 1, y: 2 },
                    renderPos
                }
            );
        } else if (tile == ObjectTile.PlantTop) {
            this.drawTile(
                context,
                {
                    tilePos: { x: 1, y: 1 },
                    renderPos
                }
            );
        } else if (tile == ObjectTile.DeadPlant) {
            this.drawTile(
                context,
                {
                    tilePos: { x: 2, y: 2 },
                    renderPos
                }
            );
        } else if (tile == ObjectTile.Glow) {
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
        }
    }
}
