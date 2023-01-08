import { SeedType } from "../entity/seed";
import { Images } from "../lib/images";

export interface LevelInfo {
    name: string;
    seeds: SeedType[];
}


export const LEVELS: LevelInfo[] = [
    {
        name: 'flower',
        seeds: [SeedType.Flower],
    },
    {
        name: 'use-vine',
        seeds: [SeedType.Flower, SeedType.Vine],
    },
    {
        name: 'vine-misdirection',
        seeds: [SeedType.Flower, SeedType.Vine],
    },
]

export class Levels {
    static preload(): Promise<any> {
        const levelPromises: Promise<any>[] = [];
        for (const level of LEVELS) {
            levelPromises.push(
                Images.loadImage({name: level.name, path: 'level/', extension: 'gif'})
            );
        }
        return Promise.all(levelPromises);
    }
}