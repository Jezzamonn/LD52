import { FacingDir } from "../common";
import { FPS, physFromPx, PHYSICS_SCALE } from "../constants";
import { Level } from "../game/level";
import { Aseprite } from "../lib/aseprite";
import { Entity } from "./entity";

const LEFT_KEYS = ['a', 'ArrowLeft'];
const RIGHT_KEYS = ['d', 'ArrowRight'];
const JUMP_KEYS = ['w', 'ArrowUp'];

export class Seed extends Entity {

    runSpeed = 1.5 * PHYSICS_SCALE * FPS;
    jumpSpeed = 2.5 * PHYSICS_SCALE * FPS;

    constructor(level: Level) {
        super(level);
        this.w = physFromPx(10);
        this.h = physFromPx(12);
    }

    render(context: CanvasRenderingContext2D) {
        let animName = 'stand';

        if (Math.abs(this.dx) > 0.01) {
            animName = 'run';
        }
        if (!this.isOnGround()) {
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
        }
        Aseprite.drawAnimation({
            context,
            image: 'seed',
            animationName: animName,
            time: this.animCount,
            position: {x: this.midX, y: this.maxY},
            scale: PHYSICS_SCALE,
            anchorRatios: {x: 0.5, y: 1},
            flippedX: this.facingDir == FacingDir.Left
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

        let keys = this.level.game.keys;

        if (keys.anyWasPressedThisFrame(JUMP_KEYS) && this.isOnGround()) {
            this.jump();
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

    static async preload() {
        await Aseprite.loadImage({name: 'seed', basePath: 'sprites'})
    }
}