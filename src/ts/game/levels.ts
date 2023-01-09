import { SeedType } from "../entity/seed";
import { Images } from "../lib/images";
import { Sounds } from "../lib/sounds";

export interface LevelInfo {
    name: string;
    seeds: SeedType[];
    song?: string;
}


export const LEVELS: LevelInfo[] = [
    {
        name: 'flower',
        seeds: [SeedType.Flower],
        song: 'farmin-chords',
    },
    {
        name: 'use-vine',
        seeds: [SeedType.Flower, SeedType.Vine],
    },
    {
        name: 'vine-misdirection',
        seeds: [SeedType.Flower, SeedType.Vine],
        song: 'farmin-default',
    },
    {
        name: 'explode',
        seeds: [SeedType.Flower, SeedType.Vine, SeedType.Bomb],
    },
    {
        name: 'explode-and-grow',
        seeds: [SeedType.Flower, SeedType.Vine, SeedType.Bomb],
    },
    {
        name: 'dirt',
        seeds: [SeedType.Flower, SeedType.Vine, SeedType.Vine, SeedType.Bomb, SeedType.Dirt],
    },
    {
        name: 'tunnel',
        seeds: [SeedType.Flower, SeedType.Vine, SeedType.Bomb, SeedType.Dirt],
    },
    {
        name: 'win',
        seeds: [SeedType.Flower, SeedType.Flower, SeedType.Flower, SeedType.Flower, SeedType.Flower, SeedType.Flower, SeedType.Vine, SeedType.Vine, SeedType.Vine, SeedType.Bomb, SeedType.Bomb, SeedType.Bomb, SeedType.Bomb, SeedType.Dirt, SeedType.Dirt, SeedType.Dirt, SeedType.Dirt, SeedType.Dirt, ],
        song: 'farmin-alt-chords',
    },
]

export class Levels {
    static preload(): Promise<any> {
        const promises: Promise<any>[] = [];
        for (const level of LEVELS) {
            promises.push(
                Images.loadImage({name: level.name, path: 'level/', extension: 'gif'}),
            );
            if (level.song) {
                promises.push(
                    Sounds.loadSound({name: level.song, path: 'music/'}),
                );
            }
        }


        return Promise.all(promises);
    }
}