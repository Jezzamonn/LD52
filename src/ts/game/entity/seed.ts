import { Dir, FacingDir, Point } from "../../common";
import { FPS, JUMP_KEYS, LEFT_KEYS, physFromPx, PHYSICS_SCALE, PLANT_KEYS, RIGHT_KEYS, rng, TILE_SIZE } from "../../constants";
import { Level } from "../level";
import { SFX } from "../sfx";
import { Aseprite } from "../../lib/aseprite";
import { NullKeys } from "../../lib/keys";
import { Sounds } from "../../lib/sounds";
import { lerp } from "../../lib/util";
import { Entity } from "./entity";
import { Sprite } from "./sprite";
import { BaseTile } from "../tile/base-layer";
import { PhysicTile } from "../tile/tiles";
import { ObjectTile } from "../tile/object-layer";

export enum SeedType {
    Sprout,
    Dirt,
    Bomb,
    Flower,
    Vine,
};

export const SeedInfo = {
    [SeedType.Sprout]: {
        name: 'Sprout Seed',
        description: 'Grows a sprout you can stand on.',
        image: 'seed',
    },
    [SeedType.Dirt]: {
        name: 'Dirt Seed',
        description: 'Grows some dirt.',
        image: 'seed-dirt',
    },
    [SeedType.Bomb]: {
        name: 'Cherry Bomb Seed',
        description: 'Explodes a hole in the ground when it grows.',
        image: 'seed-bomb',
    },
    [SeedType.Flower]: {
        name: 'Flower Seed',
        description: 'Grows a flower that you can stand on.',
        image: 'seed-flower',
    },
    [SeedType.Vine]: {
        name: 'Vine Seed',
        description: 'Grows a vine that you can climb.',
        image: 'seed-vine',
    },
}

export class Seeds {
    static nextSeed(s: SeedType): SeedType {
        if (s == SeedType.Flower) {
            return SeedType.Sprout;
        }
        return s + 1;
    }

    // Can't use filters in Safari :(
    // static getFilter(s: SeedType) {
    //     switch (s) {
    //         case SeedType.Vine:
    //             return '';
    //         case SeedType.Dirt:
    //             return 'hue-rotate(-100deg) saturate(0.3)';
    //         case SeedType.Bomb:
    //             return 'hue-rotate(-30deg) saturate(2)';
    //         case SeedType.Flower:
    //             return 'hue-rotate(180deg) saturate(1.1)';
    //     }
    // }

    static randomSeed(): SeedType {
        return Math.floor(Math.random() * 5);
    }
}

export class Seed extends Entity {

    runSpeed = 1.5 * PHYSICS_SCALE * FPS;
    jumpSpeed = 3 * PHYSICS_SCALE * FPS;

    planting = false;
    planted = false;
    plantX = 0;

    controlledByPlayer = true;

    type = SeedType.Sprout;

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

        // let filter = Seeds.getFilter(this.type);
        let imageName = SeedInfo[this.type].image;

        Aseprite.drawAnimation({
            context,
            image: imageName,
            animationName: animName,
            time: this.animCount,
            position: {x: this.midX, y: this.maxY},
            scale: PHYSICS_SCALE,
            anchorRatios: {x: 0.5, y: 1},
            // filter: filter,
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
        } else if (animName == 'plant') {
            const startFrame = Aseprite.getFrame('seed', 'plant', 0, false)

            const prevFrame = Aseprite.getFrame('seed', 'plant', prevAnimCount, false);
            const frame = Aseprite.getFrame('seed', 'plant', this.animCount, false);
            if (prevFrame != frame && (frame == startFrame + 3)) {
                SFX.play('bury');
            }
        }

        let keys = this.controlledByPlayer ? this.level.game.keysForEntity : new NullKeys();

        if (this.planting) {
            const updateAmt = 1 - Math.exp(-5 * dt);
            this.midX = lerp(this.midX, this.plantX, updateAmt);

            if (this.animCount > Aseprite.images['seed'].animations['plant'].length / 1000) {
                if (!this.planted && this.controlledByPlayer) {
                    this.level.game.endDay(this.type == SeedType.Bomb ? 0.5 : 0);
                }
                this.planted = true;

            }
            return;
        }

        if (this.isStanding() && keys.anyWasPressedThisFrame(JUMP_KEYS)) {
            this.jump();
        } else if (this.canPlant() && keys.anyWasPressedThisFrame(PLANT_KEYS)) {
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

    canPlant(): boolean {
        return this.isTouchingTile(this.level.tiles.baseLayer, BaseTile.Dirt, { dir: Dir.Down, offset: { x: 0, y: 1 } })
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
            case SeedType.Sprout:
                this.growSprout();
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
            case SeedType.Vine:
                this.growVine();
                break;
        }
    }

    growSprout() {
        // Check if we have enough space.
        const pos = {x: this.midX, y: this.maxY};
        const above = {x: this.midX, y: this.maxY - TILE_SIZE};
        if (this.level.tiles.getTileAtCoord(above) == PhysicTile.Wall) {
            this.level.tiles.objectLayer.setTileAtCoord(pos, ObjectTile.DeadPlant);
            SFX.play('growFail');
            return;
        }

        this.level.tiles.objectLayer.setTileAtCoord(pos, ObjectTile.PlantBase);
        this.level.tiles.objectLayer.setTileAtCoord(above, ObjectTile.PlantTop);

        SFX.play('grow');
    }

    growDirt() {
        this.level.tiles.baseLayer.setTileAtCoord({x: this.midX, y: this.maxY}, BaseTile.Dirt);

        SFX.play('growDirt');
    }

    tryGrowFlower() {
        if (this.isTouchingTile(this.level.tiles.objectLayer, ObjectTile.Glow)) {
            const flower = new Sprite(this.level, 'flower');
            flower.midX = this.midX;
            flower.maxY = this.maxY;
            this.level.entities.push(flower);

            SFX.play('growFlower');
            return;
        }

        // Not a glowing place... so it dies :(
        this.level.tiles.objectLayer.setTileAtCoord({x: this.midX, y: this.maxY}, ObjectTile.DeadPlant);
        SFX.play('growFail');
    }

    explode() {
        for (const dx of [-1, 0, 1]) {
            for (const dy of [-1, 0, 1]) {
                const p = {
                    x: this.midX + dx * TILE_SIZE,
                    y: this.maxY + dy * TILE_SIZE
                };
                this.level.tiles.explodeAtCoord(p);
            }
        }
        this.level.tiles.fixInvalidTiles();

        // Explode animation
        const explodeSprite = new Sprite(this.level, 'explosion', {oneLoop: true, anchorRatios: {x: 0.5, y: 0.5}});
        const explodePos = this.level.tiles.getTileCoordFromCoord({x: this.midX, y: this.maxY}, {x: 0.5, y: 0.5});
        explodeSprite.midX = explodePos.x;
        explodeSprite.midY = explodePos.y;
        this.level.entities.push(explodeSprite);

        SFX.play('explode');
    }

    growVine() {
        // Just make it tall enough for now
        const height = 30;
        for (let dy = 0; dy <= height; dy++) {
            const p = {
                x: this.midX,
                y: this.maxY - dy * TILE_SIZE
            };
            const type = dy == height ? ObjectTile.VineTop : ObjectTile.Vine
            this.level.tiles.explodeAtCoord(p);
            this.level.tiles.objectLayer.setTileAtCoord(p, type);
        }
        this.level.tiles.fixInvalidTiles();

        SFX.play('growVine');
    }

    plant() {
        this.planting = true;
        this.animCount = 0;
        const xCoords = [this.midX, this.minX, this.maxX];

        // If this is a flower, make sure we're planting at the glowing spot if possible.
        if (this.type == SeedType.Flower) {

            for (const xCoord of xCoords) {
                if (this.level.tiles.objectLayer.getTileAtCoord({x: xCoord, y: this.maxY}) == ObjectTile.Glow) {
                    this.plantX = this.level.tiles.getTileCoordFromCoord({x: xCoord, y: 0}, {x: 0.5, y: 0}).x;
                    return;
                }
            }
        }
        for (const xCoord of xCoords) {
            if (this.level.tiles.baseLayer.getTileAtCoord({x: xCoord, y: this.maxY + 1}) == BaseTile.Dirt) {
                this.plantX = this.level.tiles.getTileCoordFromCoord({x: xCoord, y: 0}, {x: 0.5, y: 0}).x;
            }
        }
    }

    static async preload() {
        // await Aseprite.loadImage({name: 'seed', basePath: 'sprites'})
        const promises: Promise<Object>[] = [];
        for (const seedInfo of Object.values(SeedInfo)) {
            const imageName = seedInfo.image;
            promises.push(Aseprite.loadImage({name: imageName, basePath: 'sprites'}));
        }
        await Promise.all(promises);
    }
}