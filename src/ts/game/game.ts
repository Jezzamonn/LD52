import { TIME_STEP } from "../constants";
import { Aseprite } from "../lib/aseprite";
import { Images } from "../lib/images";
import { Level } from "./level";
import { Tiles } from "./tiles";

export class Game {

    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D;

    scale = 1;

    simulatedTimeMs: number | undefined;

    curLevel: Level | undefined;

    constructor(canvasSelector: string) {
        const canvas = document.querySelector<HTMLCanvasElement>(canvasSelector);
        if (!canvas) {
            throw new Error(`Could not find canvas with selector ${canvasSelector}`);
        }
        const context = canvas.getContext('2d')!;

        this.canvas = canvas;
        this.context = context;

    }

    start() {
        const level = new Level();
        level.initFromImage(Images.images['level1'].image!);
        this.curLevel = level;

        Aseprite.disableSmoothing(this.context);

        this.resize();
        window.addEventListener('resize', () => this.resize());

        this.doAnimationLoop();
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

    update(dt: number) {
        this.curLevel?.update(dt);
    }

    render() {
        this.context.resetTransform();
        this.context.scale(this.scale, this.scale);

        this.curLevel?.render(this.context);
    }

    resize() {
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        const pixelScale = window.devicePixelRatio || 1;

        const xScale = windowWidth / this.canvas.width;
        const yScale = windowHeight / this.canvas.height;

        this.scale = Math.min(xScale, yScale) * pixelScale;

        this.canvas.width = windowWidth * pixelScale;
        this.canvas.height = windowHeight * pixelScale;
        this.canvas.style.width = `${windowWidth}px`;
        this.canvas.style.height = `${windowHeight}px`;
    }

    static async preload() {
        await Images.loadImage({name: 'level1', path: 'level/', extension: 'gif'});
        await Tiles.preload();
    }
}