import { Seeds, SeedType } from "./entity/seed";
import { Aseprite, images } from "../lib/aseprite";
import { Sounds } from "../lib/sounds";
import { Game } from "./game";
import { LEFT_KEYS, RIGHT_KEYS, SELECT_KEYS } from "../constants";

export class SeedPicker {
    game: Game;

    elem: HTMLElement;
    seedsElem: HTMLElement;
    shown = false;

    buttons: HTMLElement[] = [];
    focusedIndex = 0;

    onChoice: (type: SeedType | string) => void = () => {};

    constructor(game: Game) {
        this.game = game;
        this.elem = document.querySelector('.seed-picker')!;
        this.seedsElem = document.querySelector('.seeds')!;
    }

    async setSeedTypes(seedTypes: (SeedType|string)[]) {
        this.clearButtons();

        for (const type of seedTypes) {
            const btn = await this.createButton(type);
            this.seedsElem.appendChild(btn);
            this.buttons.push(btn);
        }
    }

    updateFocus() {
        for (const [i, btn] of this.buttons.entries()) {
            btn.classList.toggle('seed-button__focused', i === this.focusedIndex);
            const dist = Math.abs(i - this.focusedIndex);
            btn.style.zIndex = (this.buttons.length - dist).toString();
        }
    }

    update(dt: number) {
        this.handleKeys();
    }

    handleKeys() {
        if (!this.shown) {
            return;
        }

        const keys = this.game.keys;
        if (keys.anyWasPressedThisFrame(LEFT_KEYS)) {
            this.focusedIndex = Math.max(0, this.focusedIndex - 1);
            this.updateFocus();
        }
        else if (keys.anyWasPressedThisFrame(RIGHT_KEYS)) {
            this.focusedIndex = Math.min(this.buttons.length - 1, this.focusedIndex + 1);
            this.updateFocus();
        }
        else if (keys.anyWasPressedThisFrame(SELECT_KEYS)) {
            this.buttons[this.focusedIndex].click();
        }
    }

    async show(seedTypes: (SeedType|string)[], delay: number = 0) {
        await this.setSeedTypes(seedTypes);

        if (seedTypes.some(t => t === 'next')) {
            this.showWinText();
        } else if (seedTypes.some(t => typeof t != 'string')) {
            this.showDefaultText();
        } else {
            this.hideText();
        }

        this.elem.classList.remove('seed-picker__closed');
        this.shown = true;

        this.focusedIndex = 0;
        this.updateFocus();

        Sounds.setVolume(0.5);

        const textElem = document.querySelector('.level-text-container')!;
        textElem.classList.add('hidden');
    }

    hideText() {
        document.querySelector('.seed-picker-text')!.classList.add('hidden');
    }

    showWinText() {
        document.querySelector('.seed-picker-text')!.classList.remove('hidden');

        (document.querySelector('.seed-picker-title') as HTMLElement)!.innerText = 'You Win!';
        (document.querySelector('.seed-picker-subtitle') as HTMLElement)!.innerText = '';
    }

    showDefaultText() {
        document.querySelector('.seed-picker-text')!.classList.remove('hidden');

        (document.querySelector('.seed-picker-title') as HTMLElement)!.innerText = 'Choose a seed!';
        (document.querySelector('.seed-picker-subtitle') as HTMLElement)!.innerText = 'Use the arrow keys to select and space to confirm';
    }

    hide() {
        this.elem.classList.add('seed-picker__closed');
        this.shown = false;
        Sounds.setVolume(1);

        const textElem = document.querySelector('.level-text-container')!;
        textElem.classList.remove('hidden');
    }

    clearButtons() {
        while (this.seedsElem.firstChild) {
            this.seedsElem.removeChild(this.seedsElem.lastChild!);
        }
        this.buttons = [];
    }

    async createButton(type: SeedType | string) {
        const btn = document.createElement('div');
        btn.classList.add('seed-button');

        const image = await this.createImageElement(type);
        const desc = this.createDescriptionElem(type);

        const btnContents = document.createElement('div');
        btnContents.classList.add('seed-button-contents');

        btnContents.append(image, desc);
        btn.append(btnContents);

        btn.addEventListener('click', () => {
            this.onChoice(type);
        });

        btn.addEventListener('mouseenter', () => {
            this.focusedIndex = this.buttons.indexOf(btn);
            this.updateFocus();
        });
        btn.addEventListener('focus', () => {
            this.focusedIndex = this.buttons.indexOf(btn);
            this.updateFocus();
        });
        return btn;
    }

    createDescriptionElem(type: SeedType | string): HTMLElement {
        const descriptionElem = document.createElement('p');
        descriptionElem.classList.add('seed-button-description');

        const description = this.getDescription(type);
        descriptionElem.innerText = description;

        return descriptionElem;
    }

    getDescription(type: SeedType | string): string {
        if (type == 'next') {
            return 'Next (press space)'
        }
        if (typeof type === 'string') {
            return type[0].toUpperCase() + type.slice(1);
        }
        return Seeds.getDescription(type);
    }

    async createImageElement(type: SeedType | string): Promise<HTMLElement> {
        let image: HTMLElement;
        if (typeof type === 'string') {
            // We only have a retry button at the moment
            image = this.createSpriteImage(type);
        }
        else {
            image = await this.createSeedImage(type);
        }

        image.classList.add('seed-button-image');
        return image;
    }

    createSpriteImage(type: string): HTMLElement {
        const image = document.createElement('img');
        image.src = `sprites/${type}.png`;
        return image;
    }

    async createSeedImage(seedType: SeedType): Promise<HTMLElement> {
        const filter = Seeds.getFilter(seedType);
        const seedSprite = Aseprite.applyFilter('seed', filter);

        await seedSprite.loadPromise!;

        const canvas = document.createElement('canvas');
        canvas.width = seedSprite.frames![0].sourceSize.w;
        canvas.height = seedSprite.frames![0].sourceSize.h;
        const context = canvas.getContext('2d')!;

        Aseprite.disableSmoothing(context);
        const success = Aseprite.drawSprite({
            context,
            image: seedSprite,
            frame: 0,
            position: { x: 0, y: 0 },
        });
        if (!success) {
            console.error('Failed to draw sprite');
        }

        // Add this to an image element.
        const image = document.createElement('img');
        image.src = canvas.toDataURL();

        return image;
    }
}
