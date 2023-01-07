import { FacingDir } from "../common";
import { FPS, physFromPx, PHYSICS_SCALE } from "../constants";
import { Level } from "../game/level";
import { Tile } from "../game/tiles";
import { Aseprite } from "../lib/aseprite";
import { NullKeys } from "../lib/keys";
import { lerp } from "../lib/util";
import { Entity } from "./entity";

const LEFT_KEYS = ['a', 'ArrowLeft'];
const RIGHT_KEYS = ['d', 'ArrowRight'];
const JUMP_KEYS = ['w', 'ArrowUp'];
const PLANT_KEYS = ['s', 'ArrowDown'];

export class Seed extends Entity {

    runSpeed = 1.5 * PHYSICS_SCALE * FPS;
    jumpSpeed = 3 * PHYSICS_SCALE * FPS;

    planting = false;
    plantX = 0;

    controlledByPlayer = true;

    constructor(level: Level) {
        super(level);
        this.w = physFromPx(10);
        this.h = physFromPx(12);
    }

    render(context: CanvasRenderingContext2D) {
        let animName = 'stand';
        let loop = true;

        if (this.planting) {
            animName = 'plant';
            loop = false;
        } else if (!this.isOnGround()) {
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

        Aseprite.drawAnimation({
            context,
            image: 'seed',
            animationName: animName,
            time: this.animCount,
            position: {x: this.midX, y: this.maxY},
            scale: PHYSICS_SCALE,
            anchorRatios: {x: 0.5, y: 1},
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
                // Create a new player in the level.
                if (this.controlledByPlayer) {
                    this.level.spawnPlayer();
                    this.controlledByPlayer = false;
                }
            }
            return;
        }

        const onGround = this.isOnGround();
        if (onGround) {
            if (keys.anyWasPressedThisFrame(JUMP_KEYS)) {
                this.jump();
            } else if (keys.anyWasPressedThisFrame(PLANT_KEYS)) {
                this.plant();
            }
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