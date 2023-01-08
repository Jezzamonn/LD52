import { GAME_HEIGHT_PX, GAME_WIDTH_PX, physFromPx, PHYSICS_SCALE, pxFromPhys, TIME_STEP } from "../constants";
import { Seed } from "../entity/seed";
import { Sprite } from "../entity/sprite";
import { Aseprite } from "../lib/aseprite";
import { Images } from "../lib/images";
import { KeyboardKeys, RegularKeys } from "../lib/keys";
import { centerCanvas } from "./camera";
import { Level } from "./level";
import { Tiles } from "./tiles";

const LEVELS = [
    'flower',
    'use-vine',
    'vine-misdirection',
]

export class Game {

    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D;

    scale = 1;

    simulatedTimeMs: number | undefined;

    levelIndex = 0;
    curLevel: Level | undefined;
    keys: RegularKeys;

    constructor(canvasSelector: string) {
        const canvas = document.querySelector<HTMLCanvasElement>(canvasSelector);
        if (!canvas) {
            throw new Error(`Could not find canvas with selector ${canvasSelector}`);
        }
        const context = canvas.getContext('2d')!;

        this.canvas = canvas;
        this.context = context;

        this.keys = new KeyboardKeys();
    }

    start() {
        this.keys.setUp();

        const level = new Level(this, LEVELS[this.levelIndex]);
        level.initFromImage();
        this.curLevel = level;

        Aseprite.disableSmoothing(this.context);

        this.resize();
        window.addEventListener('resize', () => this.resize());

        this.doAnimationLoop();
    }

    nextLevel() {
        this.levelIndex++;
        if (this.levelIndex >= LEVELS.length) {
            this.levelIndex = 0;
        }

        const level = new Level(this, LEVELS[this.levelIndex]);
        level.initFromImage();
        this.curLevel = level;
    }

    doAnimationLoop() {
        if (this.simulatedTimeMs == undefined) {
            this.simulatedTimeMs = Date.now();
        }

        let curTime = Date.now();
        let updateCount = 0;
        while (this.simulatedTimeMs < curTime) {
            this.update(TIME_STEP);

            this.simulatedTimeMs += 1000 * TIME_STEP;

            updateCount++;
            if (updateCount > 10) {
                this.simulatedTimeMs = curTime;
                break;
            }
        }

        this.render();

        requestAnimationFrame(() => this.doAnimationLoop());
    }

    debugInput() {
        if (this.keys.wasPressedThisFrame('Period')) {
            this.nextLevel();
        }
    }

    update(dt: number) {
        try {
            this.debugInput();

            this.curLevel?.update(dt);

            this.keys.resetFrame();
        }
        catch (e) {
            console.error(e);
        }
    }

    render() {
        this.context.resetTransform();
        centerCanvas(this.context);
        this.context.scale(this.scale, this.scale);

        try {
            this.curLevel?.render(this.context);
        }
        catch (e) {
            console.error(e);
        }
    }

    resize() {
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        const pixelScale = window.devicePixelRatio || 1;

        const xScale = windowWidth / GAME_WIDTH_PX;
        const yScale = windowHeight / GAME_HEIGHT_PX;

        // Math.min = scale to fit
        const pxScale = Math.floor(Math.min(xScale, yScale) * pixelScale);
        this.scale = pxScale / PHYSICS_SCALE;

        this.canvas.width = windowWidth * pixelScale;
        this.canvas.height = windowHeight * pixelScale;
        this.canvas.style.width = `${windowWidth}px`;
        this.canvas.style.height = `${windowHeight}px`;
        Aseprite.disableSmoothing(this.context);
    }

    static async preload() {
        const levelPromises: Promise<any>[] = [];
        for (const level of LEVELS) {
            levelPromises.push(
                Images.loadImage({name: level, path: 'level/', extension: 'gif'})
            );
        }
        await Promise.all([
            ...levelPromises,
            Tiles.preload(),
            Seed.preload(),
            Sprite.preload(),
        ]);
    }
}