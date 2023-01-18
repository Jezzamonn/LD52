import { Point } from "../../common";
import { PHYSICS_SCALE, rng, TILE_SIZE, TILE_SIZE_PX } from "../../constants";
import { Aseprite, images } from "../../lib/aseprite";
import { Images } from "../../lib/images";
import { BaseLayer, BaseTile } from "./base-layer";
import { ObjectLayer, ObjectTile } from "./object-layer";

// All the types of tiles as far as how they interact with the game physics.
export enum PhysicTile {
    Empty = 0,
    Wall = 1,
    OneWayPlatform = 2,
}

export interface TileSource<T extends number> {
    getTile(p: Point): T;
    getTileAtCoord(p: Point): T;
}

/**
 * 2D array of tiles.
 */
export class Tiles implements TileSource<PhysicTile> {

    baseLayer: BaseLayer;
    objectLayer: ObjectLayer;

    constructor(w: number, h: number) {
        this.baseLayer = new BaseLayer(w, h);
        this.objectLayer = new ObjectLayer(w, h);
    }

    update(dt: number) {
        this.baseLayer.update(dt);
        this.objectLayer.update(dt);
    }

    render(context: CanvasRenderingContext2D) {
        this.baseLayer.render(context);
        this.objectLayer.render(context);
    }

    explodeAtCoord(p: Point) {
        this.objectLayer.setTileAtCoord(p, ObjectTile.Empty);
        this.baseLayer.explodeAtCoord(p);
    }

    fixInvalidTiles() {
        // Replace all invalid things with empty.
        let startX = Math.min(this.baseLayer.x, this.objectLayer.x);
        let startY = Math.min(this.baseLayer.y, this.objectLayer.y);
        let endX = Math.max(this.baseLayer.x + this.baseLayer.w - 1, this.objectLayer.x + this.objectLayer.w - 1);
        let endY = Math.max(this.baseLayer.y + this.baseLayer.h - 1, this.objectLayer.y + this.objectLayer.h - 1);

        for (let y = startY; y <= endY; y++) {
            for (let x = startX; x <= endX; x++) {
                const p = { x, y };
                if (!this.isValidTile(p)) {
                    this.objectLayer.setTile(p, ObjectTile.Empty);
                }
            }
        }
    }

    /**
     * Glows and Plants can't exist without dirt under them.
     * Plant tops can't exist without a plant under them.
     * Plant bases also can't exist without a plant top above them.
     */
    isValidTile(p: Point): boolean {
        const objectTile = this.objectLayer.getTile(p);

        const needDirt = new Set([
            ObjectTile.Glow,
            ObjectTile.PlantBase,
            ObjectTile.DeadPlant,
        ]);

        if (needDirt.has(objectTile) && !this.hasDirtUnderneath(p)) {
            return false;
        }

        if (objectTile == ObjectTile.PlantBase) {
            const objectTile = this.objectLayer.getTile({ x: p.x, y: p.y - 1 });
            if (objectTile != ObjectTile.PlantTop) {
                return false;
            }
        }
        if (objectTile == ObjectTile.PlantTop) {
            const objectTile = this.objectLayer.getTile({ x: p.x, y: p.y + 1 });
            if (objectTile != ObjectTile.PlantBase) {
                return false;
            }
        }

        return true;
    }

    hasDirtUnderneath(p: Point): boolean {
        const baseTile = this.baseLayer.getTile({ x: p.x, y: p.y + 1 });
        return baseTile == BaseTile.Dirt;
    }

    advanceDay() {
        this.objectLayer.advanceDay();
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

    getTile(p: Point): PhysicTile {
        const baseTile = this.baseLayer.getTile(p);
        if (baseTile == BaseTile.Dirt) {
            return PhysicTile.Wall;
        }

        const objectTile = this.objectLayer.getTile(p);
        if (objectTile == ObjectTile.PlantTop) {
            return PhysicTile.OneWayPlatform;
        }

        return PhysicTile.Empty;
    }

    getTileAtCoord(p: Point): PhysicTile {
        return this.getTile({
            x: Math.floor(p.x / TILE_SIZE),
            y: Math.floor(p.y / TILE_SIZE),
        });
    }

}
