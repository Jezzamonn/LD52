import { physFromPx } from "../constants";
import { Level } from "../game/level";
import { Entity } from "./entity";

export class Seed extends Entity {
    constructor(level: Level) {
        super(level);
        this.w = physFromPx(14);
        this.h = physFromPx(14);

        this.debugColor = '#ff9900';
    }
}