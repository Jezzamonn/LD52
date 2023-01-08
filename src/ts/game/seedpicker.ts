import { Seeds, SeedType } from "../entity/seed";
import { Aseprite, images } from "../lib/aseprite";

export class SeedPicker {

    elem: HTMLElement;
    seedsElem: HTMLElement;
    shown = false;

    onChoice: (type: SeedType | string) => void = () => {};

    constructor() {
        this.elem = document.querySelector('.seed-picker')!;
        this.seedsElem = document.querySelector('.seeds')!;
    }

    async setSeedTypes(seedTypes: (SeedType|string)[]) {
        this.clearButtons();
        for (const type of seedTypes) {
            const btn = await this.createButton(type);
            this.seedsElem.appendChild(btn);
        }
    }

    show() {
        this.elem.classList.remove('seed-picker__closed');
        this.shown = true;
    }

    hide() {
        this.elem.classList.add('seed-picker__closed');
        this.shown = false;
    }

    clearButtons() {
        while (this.seedsElem.firstChild) {
            this.seedsElem.removeChild(this.seedsElem.lastChild!);
        }
    }

    async createButton(type: SeedType | string) {
        const btn = document.createElement('button');
        btn.classList.add('seed-button');

        let image: HTMLElement;
        if (typeof type === 'string') {
            // We only have a retry button at the moment
            image = this.createSpriteImage(type);
        }
        else {
            image = await this.createSeedImage(type);
        }

        image.classList.add('seed-button-image');

        btn.appendChild(image);

        btn.addEventListener('click', () => {
            this.onChoice(type);
        });

        return btn;
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
