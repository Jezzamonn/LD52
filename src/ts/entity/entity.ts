import { Dir, Dirs, FacingDir, Point } from "../common";
import { FPS, PHYSICS_SCALE } from "../constants";
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
    // Copying some constants from Dogs++. Will they work here? idk.
    gravity = 0.13 * PHYSICS_SCALE * FPS * FPS;
    xDampAmt = (1 / 8) * PHYSICS_SCALE * FPS * FPS;
    animCount = 0;
    facingDir = FacingDir.Right;
    canCollide = true;

    debugColor: string | undefined = '#ff00ff'

    constructor(level: Level) {
        this.level = level;
    }

    update(dt: number) {
        this.animCount += dt;

        this.applyGravity(dt);
        this.dampX(dt);

        this.move(dt);
    }

    // Physics stuff
    applyGravity(dt: number) {
        this.dy += this.gravity * dt;
    }

    dampX(dt: number) {
        const damp = this.xDampAmt * dt;
        if (this.dx > damp) {
            this.dx -= damp;
        } else if (this.dx < -damp) {
            this.dx += damp;
        } else {
            this.dx = 0;
        }
    }

    move(dt: number) {
        this.moveX(dt);
        this.moveY(dt);
    }

    moveX(dt: number) {
        this.x += this.dx * dt;

        if (!this.canCollide) {
            return;
        }

        if (this.dx < 0) {
            if (this.isTouchingTile(Tile.Wall, { dir: Dir.Left })) {
                this.onLeftCollision();
            }
        } else if (this.dx > 0) {
            if (this.isTouchingTile(Tile.Wall, { dir: Dir.Right })) {
                this.onRightCollision();
            }
        }
    }

    moveY(dt: number) {
        this.y += this.dy * dt;

        if (!this.canCollide) {
            return;
        }

        if (this.dy < 0) {
            if (this.isTouchingTile(Tile.Wall, { dir: Dir.Up })) {
                this.onUpCollision();
            }
        } else if (this.dy > 0) {
            if (this.isTouchingTile(Tile.Wall, { dir: Dir.Down })) {
                this.onDownCollision();
            }
        }
    }

    onLeftCollision() {
        const resetPos = this.level.tiles.getTileCoordFromCoord({ x: this.minX, y: 0 }, { x: 1, y: 0});

        this.minX = resetPos.x + 1;
        this.dx = 0;
    }

    onRightCollision() {
        const resetPos = this.level.tiles.getTileCoordFromCoord({ x: this.maxX, y: 0 }, { x: 0, y: 0});

        this.maxX = resetPos.x - 1;
        this.dx = 0;
    }

    onUpCollision() {
        const resetPos = this.level.tiles.getTileCoordFromCoord({ x: 0, y: this.minY }, { x: 0, y: 1});

        this.minY = resetPos.y + 1;
        this.dy = 0;
    }

    onDownCollision() {
        const resetPos = this.level.tiles.getTileCoordFromCoord({ x: 0, y: this.maxY }, { x: 0, y: 0});

        this.maxY = resetPos.y - 1;
        this.dy = 0;
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

    isOnGround(): boolean {
        return this.isTouchingTile(Tile.Wall, { dir: Dir.Down, offset: { x: 0, y: 1 } });
    }

    isTouchingEntity(other: Entity): boolean {
        return this.maxX > other.minX && this.minX < other.maxX && this.maxY > other.minY && this.minY < other.maxY;
    }

    render(context: CanvasRenderingContext2D) {
        if (this.debugColor) {
            context.fillStyle = this.debugColor;
            context.fillRect(this.x, this.y, this.w, this.h);
            console.log(`Rendering entity at ${this.x}, ${this.y} with size ${this.w}, ${this.h}`);
        }
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