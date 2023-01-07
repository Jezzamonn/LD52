import { Level } from "../game/level";
import { Entity } from "./entity";

export class Seed extends Entity {
    constructor(level: Level) {
        super(level);
        this.w = 14;
        this.h = 14;

        this.debugColor = '#ff9900';
    }
}