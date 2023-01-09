import { GAME_HEIGHT_PX, GAME_WIDTH_PX, physFromPx, PHYSICS_SCALE, pxFromPhys, SELECT_KEYS, TIME_STEP } from "../constants";
import { Seed, SeedType } from "../entity/seed";
import { Sprite } from "../entity/sprite";
import { Aseprite } from "../lib/aseprite";
import { Images } from "../lib/images";
import { KeyboardKeys, NullKeys, RegularKeys } from "../lib/keys";
import { Sounds } from "../lib/sounds";
import { centerCanvas } from "./camera";
import { Level } from "./level";
import { Levels, LEVELS } from "./levels";
import { SeedPicker } from "./seedpicker";
import { SFX } from "./sfx";
import { Tiles } from "./tiles";

export class Game {

    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D;

    scale = 1;

    simulatedTimeMs: number | undefined;

    levelIndex = 0;
    curLevel: Level | undefined;
    seedPicker: SeedPicker;

    keys: RegularKeys;
    nullKeys = new NullKeys();

    get keysForEntity() {
        if (this.seedPicker.shown) {
            return this.nullKeys;
        }
        return this.keys;
    }

    constructor(canvasSelector: string) {
        const canvas = document.querySelector<HTMLCanvasElement>(canvasSelector);
        if (!canvas) {
            throw new Error(`Could not find canvas with selector ${canvasSelector}`);
        }
        const context = canvas.getContext('2d')!;

        this.canvas = canvas;
        this.context = context;

        this.keys = new KeyboardKeys();
        this.seedPicker = new SeedPicker(this);

        Sounds.loadMuteState();
    }

    start() {
        this.keys.setUp();

        Aseprite.disableSmoothing(this.context);

        this.resize();
        window.addEventListener('resize', () => this.resize());

        this.doAnimationLoop();

        this.startLevel(this.levelIndex);
    }

    onChoice(type: SeedType | string) {
        // Handle string types
        if (typeof type === 'string') {
            if (type === 'next') {
                this.nextLevel();
            }
            else if (type === 'retry') {
                this.startLevel(this.levelIndex);
            }
        }
        else {
            this.curLevel!.spawnPlayer(type);
            this.seedPicker.hide();
        }
        Sounds.startSongIfNotAlreadyPlaying();
    }

    nextLevel() {
        this.startLevel((this.levelIndex + 1) % LEVELS.length);
    }

    startLevel(levelIndex: number) {
        this.levelIndex = levelIndex;
        const levelInfo = LEVELS[this.levelIndex];
        const level = new Level(this, levelInfo);
        level.initFromImage();
        this.curLevel = level;

        this.seedPicker.show(level.remainingSeeds);
        this.seedPicker.onChoice = (choice) => this.onChoice(choice);

        if (levelInfo.song) {
            Sounds.setSong(levelInfo.song);
        }
    }

    showPicker() {
        if (this.curLevel!.won) {
            this.seedPicker.show(['next']);
        }
        else if (this.curLevel!.remainingSeeds.length == 0) {
            this.seedPicker.show(['retry']);
        }
        else {
            this.seedPicker.show(this.curLevel!.remainingSeeds);
        }
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
        if (this.curLevel!.won && this.keys.anyWasPressedThisFrame(SELECT_KEYS)) {
            this.nextLevel();
        }
        if (this.keys.wasPressedThisFrame('Period')) {
            this.nextLevel();
        }
        if (this.keys.wasPressedThisFrame('KeyM')) {
            // Mute
            Sounds.toggleMute();
        }
        if (this.keys.wasPressedThisFrame('KeyR')) {
            this.startLevel(this.levelIndex);
        }
    }

    update(dt: number) {
        try {
            this.debugInput();

            this.seedPicker.update(dt);

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
        await Promise.all([
            Levels.preload(),
            Tiles.preload(),
            Seed.preload(),
            Sprite.preload(),
        ]);
        SFX.preload();
    }
}