import { FacingDir } from "../common";
import { FPS, physFromPx, PHYSICS_SCALE, TILE_SIZE } from "../constants";
import { Level } from "../game/level";
import { Tile } from "../game/tiles";
import { Aseprite } from "../lib/aseprite";
import { NullKeys } from "../lib/keys";
import { lerp } from "../lib/util";
import { Entity } from "./entity";
import { Sprite } from "./sprite";

const LEFT_KEYS = ['a', 'ArrowLeft'];
const RIGHT_KEYS = ['d', 'ArrowRight'];
const JUMP_KEYS = ['w', 'ArrowUp'];
const PLANT_KEYS = ['s', 'ArrowDown'];

export enum SeedType {
    Vine,
    Dirt,
    Bomb,
    Flower,
}

export class Seeds {
    static nextSeed(s: SeedType): SeedType {
        if (s == SeedType.Flower) {
            return SeedType.Vine;
        }
        return s + 1;
    }
}

export class Seed extends Entity {

    runSpeed = 1.5 * PHYSICS_SCALE * FPS;
    jumpSpeed = 3 * PHYSICS_SCALE * FPS;

    planting = false;
    planted = false;
    plantX = 0;

    controlledByPlayer = true;

    type = SeedType.Vine;

    constructor(level: Level) {
        super(level);
        this.w = physFromPx(10);
        this.h = physFromPx(12);

        this.gravity = 0.13 * PHYSICS_SCALE * FPS * FPS
    }

    render(context: CanvasRenderingContext2D) {
        let animName = 'stand';
        let loop = true;

        if (this.planting) {
            animName = 'plant';
            loop = false;
        } else if (!this.isStanding()) {
            animName = 'jump';
            if (this.dy < -0.7 * this.jumpSpeed) {
                animName += '-up-up';
            }
            else if (this.dy < -0.3 * this.jumpSpeed) {
                animName += '-up';
            }
            else if (this.dy > 0.7 * this.jumpSpeed) {
                animName += '-down-down';
            }
            else if (this.dy > 0.3 * this.jumpSpeed) {
                animName += '-down';
            }
            else {
                animName += '-mid';
            }
        } else if (Math.abs(this.dx) > 0.01) {
            animName = 'run';
        }

        let filter = '';
        switch (this.type) {
            case SeedType.Vine:
                break;
            case SeedType.Dirt:
                filter = 'hue-rotate(-100deg) saturate(0.3)';
                break;
            case SeedType.Bomb:
                filter = 'hue-rotate(-30deg) saturate(1.5)';
                break;
            case SeedType.Flower:
                filter = 'hue-rotate(180deg) saturate(1.1)';
                break;
        }

        Aseprite.drawAnimation({
            context,
            image: 'seed',
            animationName: animName,
            time: this.animCount,
            position: {x: this.midX, y: this.maxY},
            scale: PHYSICS_SCALE,
            anchorRatios: {x: 0.5, y: 1},
            filter: filter,
            flippedX: this.facingDir == FacingDir.Left,
            loop,
        });
    }

    jump() {
        this.dy = -this.jumpSpeed;
    }

    // TODO: Some easing?
    moveLeft(dt: number) {
        this.dx = -this.runSpeed;
        this.facingDir = FacingDir.Left;
    }

    moveRight(dt: number) {
        this.dx = this.runSpeed;
        this.facingDir = FacingDir.Right;
    }

    update(dt: number) {
        this.animCount += dt;

        let keys = this.controlledByPlayer ? this.level.game.keys : new NullKeys();

        if (this.planting) {
            const updateAmt = 1 - Math.exp(-5 * dt);
            this.midX = lerp(this.midX, this.plantX, updateAmt);

            if (this.animCount > Aseprite.images['seed'].animations['plant'].length / 1000) {
                this.planted = true;

                if (this.controlledByPlayer) {
                    this.level.endDay();
                }
            }
            return;
        }

        if (this.isStanding() && keys.anyWasPressedThisFrame(JUMP_KEYS)) {
            this.jump();
        } else if (this.isOnGround() && keys.anyWasPressedThisFrame(PLANT_KEYS)) {
            this.plant();
        }

        const left = keys.anyIsPressed(LEFT_KEYS);
        const right = keys.anyIsPressed(RIGHT_KEYS);
        if (left && !right) {
            this.moveLeft(dt);
        }
        else if (right && !left) {
            this.moveRight(dt);
        }
        else {
            this.dampX(dt);
        }

        this.applyGravity(dt);
        this.moveX(dt);
        this.moveY(dt);
    }

    grow() {
        if (this.done) {
            return;
        }
        this.done = true;

        switch (this.type) {
            case SeedType.Vine:
                this.growVine();
                break;
            case SeedType.Dirt:
                this.growDirt();
                break;
            case SeedType.Bomb:
                this.explode();
                break;
            case SeedType.Flower:
                this.tryGrowFlower();
                break;
        }
    }

    growVine() {
        // Check if we have enough space.
        const pos = {x: this.midX, y: this.maxY};
        const above = {x: this.midX, y: this.maxY - TILE_SIZE};
        if (this.level.tiles.getTileAtCoord(above) == Tile.Wall) {
            this.level.tiles.setTileAtCoord(pos, Tile.DeadPlant);
            return;
        }

        this.level.tiles.setTileAtCoord(pos, Tile.Plant);
        this.level.tiles.setTileAtCoord(above, Tile.PlantTop);
    }

    growDirt() {
        this.level.tiles.setTileAtCoord({x: this.midX, y: this.maxY}, Tile.Wall);
    }

    tryGrowFlower() {
        if (this.isTouchingTile(Tile.Glow)) {
            const flower = new Sprite(this.level, 'flower');
            flower.midX = this.midX;
            flower.maxY = this.maxY;
            this.level.entities.push(flower);
            return;
        }

        // Not a glowing place... so it dies :(
        this.level.tiles.setTileAtCoord({x: this.midX, y: this.maxY}, Tile.DeadPlant);
    }

    explode() {
        for (const dx of [-1, 0, 1]) {
            for (const dy of [-1, 0, 1]) {
                const p = {
                    x: this.midX + dx * TILE_SIZE,
                    y: this.maxY + dy * TILE_SIZE
                };
                this.level.tiles.setTileAtCoord(p, Tile.Empty);
            }
        }
    }

    plant() {
        this.planting = true;
        this.animCount = 0;
        const xCoords = [this.midX, this.minX, this.maxX];
        for (const xCoord of xCoords) {
            if (this.level.tiles.getTileAtCoord({x: xCoord, y: this.maxY + 1}) == Tile.Wall) {
                this.plantX = this.level.tiles.getTileCoordFromCoord({x: xCoord, y: 0}, {x: 0.5, y: 0}).x;
            }
        }
    }

    static async preload() {
        await Aseprite.loadImage({name: 'seed', basePath: 'sprites'})
    }
}