import { Point } from "../../common";
import { physFromPx, rng } from "../../constants";
import { Level } from "../level";
import { Entity } from "./entity";

const canvasSize = 200;

export class Flower extends Entity {

    outlineCanvas: HTMLCanvasElement;
    outlineContext: CanvasRenderingContext2D;
    fillCanvas: HTMLCanvasElement;
    fillContext: CanvasRenderingContext2D;

    drawPositions: Point[] = [
        { x: canvasSize / 2, y: canvasSize / 2 },
        { x: canvasSize / 2, y: canvasSize / 2 },
        { x: canvasSize / 2, y: canvasSize / 2 },
        { x: canvasSize / 2, y: canvasSize / 2 },
    ];
    // drawPosition: Point = { x: 50, y: 50 };

    constructor(level: Level) {
        super(level);

        this.w = physFromPx(10);
        this.h = physFromPx(10);

        // Do I need to set the size? Who knows.
        this.outlineCanvas = document.createElement('canvas');
        this.outlineCanvas.width = canvasSize;
        this.outlineCanvas.height = canvasSize;
        this.outlineContext = this.outlineCanvas.getContext('2d')!;
        // this.outlineContext.fillStyle = 'green';
        // this.outlineContext.fillRect(0, 0, 100, 100);

        this.fillCanvas = document.createElement('canvas');
        this.fillCanvas.width = canvasSize;
        this.fillCanvas.height = canvasSize;
        this.fillContext = this.fillCanvas.getContext('2d')!;
        // this.fillContext.fillStyle = 'pink';
        // this.fillContext.fillRect(0, 0, 100, 100);
    }

    update(dt: number): void {
        for (const drawPosition of this.drawPositions) {
            this.outlineContext.fillStyle = '#2a6732'; // or #205326?
            this.fillContext.fillStyle = '#459134';
            this.outlineContext.fillRect(drawPosition.x, drawPosition.y - 1, 1, 3);
            this.outlineContext.fillRect(drawPosition.x - 1, drawPosition.y, 3, 1);
            this.fillContext.fillRect(drawPosition.x, drawPosition.y, 1, 1);

            drawPosition.x += Math.floor(rng() * 3) - 1;
            drawPosition.y += Math.floor(rng() * 2) - 1;
        }
    }

    render(context: CanvasRenderingContext2D): void {
        const w = physFromPx(this.outlineCanvas.width);
        const h = physFromPx(this.outlineCanvas.height);

        // super.render(context);
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