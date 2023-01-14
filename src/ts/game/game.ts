import { GAME_HEIGHT_PX, GAME_WIDTH_PX, physFromPx, PHYSICS_SCALE, pxFromPhys, SELECT_KEYS, TIME_STEP } from "../constants";
import { Seed, SeedType } from "./entity/seed";
import { Sprite } from "./entity/sprite";
import { Aseprite } from "../lib/aseprite";
import { Images } from "../lib/images";
import { ComboKeys, KeyboardKeys, NullKeys, RegularKeys } from "../lib/keys";
import { Sounds } from "../lib/sounds";
import { centerCanvas } from "./camera";
import { Level } from "./level";
import { Levels, LEVELS } from "./levels";
import { SeedPicker } from "./seedpicker";
import { SFX } from "./sfx";
import { Tiles } from "./tile/tiles";
import { Background } from "./background";
import { wait } from "../lib/util";
import { TouchKeys } from "./touch-keys";

export class Game {

    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D;

    scale = 1;

    simulatedTimeMs: number | undefined;

    levelIndex = 0;
    showingTitle = true;
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

        this.keys = new ComboKeys(new KeyboardKeys(), new TouchKeys());
        this.seedPicker = new SeedPicker(this);

        Sounds.loadMuteState();
    }

    start() {
        this.keys.setUp();

        Aseprite.disableSmoothing(this.context);

        this.resize();
        window.addEventListener('resize', () => this.resize());

        this.doAnimationLoop();

        // Show the title (already shown in the initial HTML)
        // Play title music
        Sounds.setSong('farmin-chords');

        // Show the title.
        // Don't need to do anything because the title is shown by default in the HTML.

        // For debugging: Load the test level.
        // this.hideTitle();
        // this.startLevel(0);
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

    prevLevel() {
        this.startLevel((this.levelIndex + LEVELS.length - 1) % LEVELS.length);
    }

    startLevel(levelIndex: number) {
        this.levelIndex = levelIndex;
        const levelInfo = LEVELS[this.levelIndex];
        const level = new Level(this, levelInfo);
        level.initFromImage();
        this.curLevel = level;

        if (levelInfo.seeds.length > 1) {
            this.seedPicker.show(level.remainingSeeds);
            this.seedPicker.onChoice = (choice) => this.onChoice(choice);
        }
        else {
            this.onChoice(levelInfo.seeds[0]);
        }

        if (levelInfo.song) {
            Sounds.setSong(levelInfo.song);
        }

        const textElem = document.querySelector('.level-text')!;
        if (levelInfo.text) {
            textElem.innerHTML = levelInfo.text;
            textElem.classList.remove('hidden');
        }
        else {
            textElem.classList.add('hidden');
        }
    }

    async endDay(extraDelay: number = 0) {
        // Show our animation! :D
        this.playDayTransition();
        SFX.play('sweep');
        await wait(0.5 + extraDelay);
        this.curLevel!.advanceDay();
        await wait(1.4);

        if (this.curLevel!.won) {
            // Wait a little longer.
            await wait(0.5);
            this.seedPicker.show(['next']);
        }
        else if (this.curLevel!.remainingSeeds.length == 0) {
            this.seedPicker.show(['retry']);
        }
        else {
            const options: (SeedType | string)[] = this.curLevel!.remainingSeeds.slice();
            options.push('retry');
            this.seedPicker.show(options);
        }
    }

    playDayTransition() {
        const nightOverlay = document.querySelector('.night-overlay')!;
        nightOverlay.classList.remove('night-overlay__animated');
        nightOverlay.clientHeight; // Force reflow
        nightOverlay.classList.remove('hidden');
        nightOverlay.classList.add('night-overlay__animated');
        const onAnimtationEnd = () => {
            nightOverlay.classList.add('hidden');
            nightOverlay.removeEventListener('animationend', onAnimtationEnd);
        }
        nightOverlay.addEventListener('animationend', onAnimtationEnd);
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

    handleInput() {
        if (this.keys.wasPressedThisFrame('KeyM')) {
            // Mute
            Sounds.toggleMute();
        }
        if (this.showingTitle) {
            if (this.keys.anyWasPressedThisFrame(SELECT_KEYS)) {
                this.hideTitle();
                this.startLevel(this.levelIndex);
            }
            return;
        }
        if (this.keys.wasPressedThisFrame('Comma')) {
            this.prevLevel();
        }
        if (this.keys.wasPressedThisFrame('Period')) {
            this.nextLevel();
        }
        if (this.keys.wasPressedThisFrame('KeyR')) {
            this.startLevel(this.levelIndex);
        }
    }

    hideTitle() {
        const titleElem = document.querySelector('.title-container')!;
        titleElem.classList.add('hidden');

        this.showingTitle = false;
    }

    update(dt: number) {
        try {
            this.handleInput();

            this.seedPicker.update(dt);

            this.curLevel?.update(dt);

            this.keys.resetFrame();
        }
        catch (e) {
            console.error(e);
        }
    }

    applyScale(context: CanvasRenderingContext2D) {
        context.scale(this.scale, this.scale);
    }

    render() {
        this.context.resetTransform();
        centerCanvas(this.context);
        this.applyScale(this.context);

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

        document.body.style.setProperty('--scale', `${pxScale / pixelScale}`);

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
            Background.preload(),
        ]);
        SFX.preload();
    }
}