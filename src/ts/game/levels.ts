import { SeedType } from "./entity/seed";
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
        seeds: [
            SeedType.Flower,
        ],
        song: 'farmin-chords',
    },
    {
        name: 'use-vine',
        seeds: [
            SeedType.Vine,
            SeedType.Flower,
        ],
    },
    {
        name: 'vine-misdirection',
        seeds: [
            SeedType.Vine,
            SeedType.Flower,
        ],
        song: 'farmin-default',
    },
    {
        name: 'explode',
        seeds: [
            SeedType.Vine,
            SeedType.Bomb,
            SeedType.Flower,
        ],
    },
    {
        name: 'explode-and-grow',
        seeds: [
            SeedType.Vine,
            SeedType.Bomb,
            SeedType.Flower,
        ],
    },
    {
        name: 'dirt',
        seeds: [
            SeedType.Vine,
            SeedType.Vine,
            SeedType.Bomb,
            SeedType.Dirt,
            SeedType.Flower,
        ],
    },
    {
        name: 'tunnel',
        seeds: [
            SeedType.Vine,
            SeedType.Bomb,
            SeedType.Dirt,
            SeedType.Flower,
        ],
    },
    {
        name: 'bomb-maze',
        seeds: [
            SeedType.Bomb,
            SeedType.Bomb,
            SeedType.Bomb,
            SeedType.Bomb,
            SeedType.Flower,
        ],
    },
    {
        name: 'win',
        seeds: [
            SeedType.Vine,
            SeedType.Vine,
            SeedType.Vine,
            SeedType.Bomb,
            SeedType.Bomb,
            SeedType.Bomb,
            SeedType.Bomb,
            SeedType.Dirt,
            SeedType.Dirt,
            SeedType.Dirt,
            SeedType.Dirt,
            SeedType.Dirt,
            SeedType.Flower,
            SeedType.Flower,
        ],
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