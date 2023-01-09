import { Point } from "../common";
import { physFromPx, PHYSICS_SCALE } from "../constants";
import { Aseprite } from "../lib/aseprite";
import { Images } from "../lib/images";
import { centerCanvas } from "./camera";
import { Level } from "./level";

interface LayerInfo {
    image: string,
    scale: number,
    offset?: Point,
}

const BG_LAYERS: LayerInfo[] = [
    {
        image: "bg-sky",
        scale: 0.02,
        offset: {
            x: 0,
            y: -20,
        }
    },
    {
        image: "bg-clouds-far",
        scale: 0.05,
    },
    {
        image: "bg-clouds-close",
        scale: 0.1,
    },
    {
        image: "bg-ground-far",
        scale: 0.3,
    },
    {
        image: "bg-ground-mid",
        scale: 0.5,
    },
    {
        image: "bg-ground-close",
        scale: 0.7,
    },
];
export class Background {
    level: Level;

    layers: BackgroundLayer[] = [];

    constructor(level: Level) {
        this.level = level;

        for (const layer of BG_LAYERS) {
            this.layers.push(
                new BackgroundLayer({
                    background: this,
                    image: layer.image,
                    scale: layer.scale,
                    offset: layer.offset,
                })
            );
        }
    }

    update(dt: number) {
        for (const layer of this.layers) {
            layer.update(dt);
        }
    }

    render(context: CanvasRenderingContext2D) {
        for (const layer of this.layers) {
            layer.render(context);
        }
    }

    static async preload() {
        const promises: Promise<any>[] = [];
        for (const layer of BG_LAYERS) {
            promises.push(
                Images.loadImage({ name: layer.image, path: "sprites/" })
            );
        }
        await Promise.all(promises);
    }
}

class BackgroundLayer {
    background: Background;
    animCount = 0;
    image = "";
    scale = 1;

    offset: Point;

    constructor({
        background,
        image,
        scale,
        offset = {x: 0, y: 0},
    }: {
        background: Background;
        image: string;
        scale: number;
        offset?: Point;
    }) {
        this.background = background;
        this.image = image;
        this.scale = scale;
        this.offset = offset;
    }

    update(dt: number) {
        this.animCount += dt;
    }

    render(context: CanvasRenderingContext2D) {
        // TODO: Apply scale.
        context.save();
        context.resetTransform();

        // centerCanvas(context);

        this.background.level.game.applyScale(context);
        this.background.level.camera.applyTransform(context, this.scale);

        const image = Images.images[this.image].image!;
        context.drawImage(image,
            physFromPx(this.offset.x),
            physFromPx(this.offset.y),
            physFromPx(image.width),
            physFromPx(image.height),
        );

        context.restore();
    }
}
