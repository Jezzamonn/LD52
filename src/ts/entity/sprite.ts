import { physFromPx, PHYSICS_SCALE } from "../constants";
import { Level } from "../game/level";
import { Aseprite } from "../lib/aseprite";
import { Entity } from "./entity";

export class Sprite extends Entity {

    name = '';

    constructor(level: Level, name: string) {
        super(level);

        this.name = name;
        Aseprite.images[name].loadPromise!.then(image => {
            this.w = physFromPx(image.frames![0].sourceSize.w)
            this.h = physFromPx(image.frames![0].sourceSize.h)

            this.midX = this.x;
            this.maxY = this.y;
        });
    }

    render(context: CanvasRenderingContext2D) {
        // context.fillRect(this.x, this.y, this.w, this.h);
        Aseprite.drawAnimation({
            context,
            image: this.name,
            animationName: 'idle',
            time: this.animCount,
            position: { x: this.midX, y: this.maxY },
            scale: PHYSICS_SCALE,
            anchorRatios: { x: 0.5, y: 1 },
        });
    }

    static async preload() {
        await Promise.all([
            Aseprite.loadImage({ name: "rain", basePath: "sprites" }),
            Aseprite.loadImage({ name: "glow", basePath: "sprites" }),
            Aseprite.loadImage({ name: "fertilizer", basePath: "sprites" }),
            Aseprite.loadImage({ name: "flower", basePath: "sprites" }),
        ])
    }
}