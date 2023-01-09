import { FacingDir, Point } from "../common";
import { FPS, JUMP_KEYS, LEFT_KEYS, physFromPx, PHYSICS_SCALE, PLANT_KEYS, RIGHT_KEYS, rng, TILE_SIZE } from "../constants";
import { Level } from "../game/level";
import { SFX } from "../game/sfx";
import { Tile } from "../game/tiles";
import { Aseprite } from "../lib/aseprite";
import { NullKeys } from "../lib/keys";
import { Sounds } from "../lib/sounds";
import { lerp } from "../lib/util";
import { Entity } from "./entity";
import { Sprite } from "./sprite";

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

    static getFilter(s: SeedType) {
        switch (s) {
            case SeedType.Vine:
                return '';
            case SeedType.Dirt:
                return 'hue-rotate(-100deg) saturate(0.3)';
            case SeedType.Bomb:
                return 'hue-rotate(-30deg) saturate(2)';
            case SeedType.Flower:
                return 'hue-rotate(180deg) saturate(1.1)';
        }
    }

    static randomSeed(): SeedType {
        return Math.floor(Math.random() * 4);
    }

    static getDescription(s: SeedType) {
        switch (s) {
            case SeedType.Vine:
                return 'Vine Seed. Grows a vine you can stand on';
            case SeedType.Dirt:
                return 'Dirt Seed. Grows some dirt.';
            case SeedType.Bomb:
                return 'Bomb Seed. Explodes a hole in the ground when it grows';
            case SeedType.Flower:
                return 'Teeny Seed. Grows a precious flower, winning the level. Very fragile, must be planted in glowing soil.';
        }
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

    getAnimationName() {
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
        return { animName, loop }
    }

    render(context: CanvasRenderingContext2D) {
        const {animName, loop} = this.getAnimationName();

        let filter = Seeds.getFilter(this.type);

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

    cameraFocus(): Point {
        const facingMult = this.facingDir == FacingDir.Right ? 1 : -1;
        const mult = this.planting ? 0 : facingMult;
        return { x: this.midX + mult * physFromPx(30), y: this.maxY };
    }

    jump() {
        this.dy = -this.jumpSpeed;
        SFX.play('walk');
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
        const prevAnimCount = this.animCount;
        this.animCount += dt;

        const { animName, loop } = this.getAnimationName();
        if (animName == 'run') {
            const startFrame = Aseprite.getFrame('seed', 'run', 0)

            const prevFrame = Aseprite.getFrame('seed', 'run', prevAnimCount);
            const frame = Aseprite.getFrame('seed', 'run', this.animCount);
            if (prevFrame != frame && (frame == startFrame + 1 || frame == startFrame + 3)) {
                SFX.play('walk');
            }
        }

        let keys = this.controlledByPlayer ? this.level.game.keysForEntity : new NullKeys();

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

    applyGravity(dt: number): void {
        // if (!this.level.game.keys.anyIsPressed(JUMP_KEYS)) {
        //     this.dy += 2 * this.gravity * dt;
        //     return;
        // }
        this.dy += this.gravity * dt;
    }

    onDownCollision() {
        if (this.dy > 0.5 * this.jumpSpeed) {
            SFX.play('land');
        }
        super.onDownCollision();
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
            SFX.play('growFail');
            return;
        }

        this.level.tiles.setTileAtCoord(pos, Tile.Plant);
        this.level.tiles.setTileAtCoord(above, Tile.PlantTop);

        SFX.play('grow');
    }

    growDirt() {
        this.level.tiles.setTileAtCoord({x: this.midX, y: this.maxY}, Tile.Wall);

        SFX.play('growDirt');
    }

    tryGrowFlower() {
        if (this.isTouchingTile(Tile.Glow)) {
            const flower = new Sprite(this.level, 'flower');
            flower.midX = this.midX;
            flower.maxY = this.maxY;
            this.level.entities.push(flower);

            SFX.play('growFlower');
            return;
        }

        // Not a glowing place... so it dies :(
        this.level.tiles.setTileAtCoord({x: this.midX, y: this.maxY}, Tile.DeadPlant);
        SFX.play('growFail');
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
        // Explode animation
        const explodeSprite = new Sprite(this.level, 'explosion', {oneLoop: true, anchorRatios: {x: 0.5, y: 0.5}});
        const explodePos = this.level.tiles.getTileCoordFromCoord({x: this.midX, y: this.maxY}, {x: 0.5, y: 0.5});
        explodeSprite.midX = explodePos.x;
        explodeSprite.midY = explodePos.y;
        this.level.entities.push(explodeSprite);

        SFX.play('explode');
    }

    plant() {
        this.planting = true;
        this.animCount = 0;
        const xCoords = [this.midX, this.minX, this.maxX];

        // If this is a flower, make sure we're planting at the glowing spot if possible.
        if (this.type == SeedType.Flower) {

            for (const xCoord of xCoords) {
                if (this.level.tiles.getTileAtCoord({x: xCoord, y: this.maxY}) == Tile.Glow) {
                    this.plantX = this.level.tiles.getTileCoordFromCoord({x: xCoord, y: 0}, {x: 0.5, y: 0}).x;
                    return;
                }
            }
        }
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