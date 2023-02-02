import { Point } from "../../common";
import { physFromPx, rng } from "../../constants";
import { Level } from "../level";
import { Entity } from "./entity";

export class Flower extends Entity {

    outlineCanvas: HTMLCanvasElement;
    outlineContext: CanvasRenderingContext2D;
    fillCanvas: HTMLCanvasElement;
    fillContext: CanvasRenderingContext2D;

    drawPosition: Point = { x: 50, y: 50 };

    constructor(level: Level) {
        super(level);

        this.w = physFromPx(10);
        this.h = physFromPx(10);

        // Do I need to set the size? Who knows.
        this.outlineCanvas = document.createElement('canvas');
        this.outlineCanvas.width = 100;
        this.outlineCanvas.height = 100;
        this.outlineContext = this.outlineCanvas.getContext('2d')!;
        // this.outlineContext.fillStyle = 'green';
        // this.outlineContext.fillRect(0, 0, 100, 100);

        this.fillCanvas = document.createElement('canvas');
        this.fillCanvas.width = 100;
        this.fillCanvas.height = 100;
        this.fillContext = this.fillCanvas.getContext('2d')!;
        // this.fillContext.fillStyle = 'pink';
        // this.fillContext.fillRect(0, 0, 100, 100);
    }

    update(dt: number): void {
        this.outlineContext.fillStyle = '#2a6732'; // or #205326?
        this.fillContext.fillStyle = '#459134';
        this.outlineContext.fillRect(this.drawPosition.x, this.drawPosition.y - 1, 1, 3);
        this.outlineContext.fillRect(this.drawPosition.x - 1, this.drawPosition.y, 3, 1);
        this.fillContext.fillRect(this.drawPosition.x, this.drawPosition.y, 1, 1);

        this.drawPosition.x += Math.floor(rng() * 3) - 1;
        this.drawPosition.y += Math.floor(rng() * 3) - 1;
    }

    render(context: CanvasRenderingContext2D): void {
        const w = physFromPx(this.outlineCanvas.width);
        const h = physFromPx(this.outlineCanvas.height);

        super.render(context);
        context.drawImage(
            this.outlineCanvas,
            this.midX - w / 2,
            this.maxY- h / 2,
            w, h);
        context.drawImage(
            this.fillCanvas,
            this.midX - w / 2,
            this.maxY- h / 2,
            w, h);
    }
}