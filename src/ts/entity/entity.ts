import { Dir, Dirs, FacingDir, Point } from "../common";
import { Level } from "../game/level";
import { Tile } from "../game/tiles";

export class Entity {
    level: Level;

    x = 0;
    y = 0;
    w = 0;
    h = 0;
    dx = 0;
    dy = 0;
    gravity = 0;
    animCount = 0;
    facingDir = FacingDir.Right;

    debugColor: string | undefined = '#ff00ff'



    constructor(level: Level) {
        this.level = level;
    }

    update(dt: number) {
        this.animCount += dt;
    }

    render(context: CanvasRenderingContext2D) {
        if (this.debugColor) {
            context.fillStyle = this.debugColor;
            context.fillRect(this.x, this.y, this.w, this.h);
        }
    }

    isTouchingTile(tile: Tile, { dir = undefined, offset = undefined } : { dir?: Dir, offset?: Point } = {}): boolean {
        const corners = Dirs.cornersInDirection(dir);
        for (const corner of corners) {
            const x = this.x + corner.x * this.w + (offset?.x ?? 0);
            const y = this.y + corner.y * this.h + (offset?.y ?? 0);
            if (this.level.tiles.getTileAtCoord({x, y}) === tile) {
                return true;
            }
        }
        return false
    }

    isTouchingEntity(other: Entity): boolean {
        return this.maxX > other.minX && this.minX < other.maxX && this.maxY > other.minY && this.minY < other.maxY;
    }

    //#region Getters and setter for min / mid / max.
    get minX() {
        return this.x;
    }
    get minY() {
        return this.y;
    }
    get maxX() {
        return this.x + this.w;
    }
    get maxY() {
        return this.y + this.h;
    }
    get midX() {
        return this.x + this.w / 2;
    }
    get midY() {
        return this.y + this.h / 2;
    }
    set minX(val: number) {
        this.x = val;
    }
    set minY(val: number) {
        this.y = val;
    }
    set maxX(val: number) {
        this.x = val - this.w;
    }
    set maxY(val: number) {
        this.y = val - this.h;
    }
    set midX(val: number) {
        this.x = val - this.w / 2;
    }
    set midY(val: number) {
        this.y = val - this.h / 2;
    }
    //#endregion
}