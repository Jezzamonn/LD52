import { SeedType } from "./entity/seed";
import { Images } from "../lib/images";
import { Sounds } from "../lib/sounds";

export interface LevelInfo {
    name: string;
    seeds: SeedType[];
    song?: string;
    text?: string;
}


export const LEVELS: LevelInfo[] = [
    {
        name: 'flower',
        seeds: [
            SeedType.Flower,
        ],
        song: 'farmin-chords',
        text: 'There once was a Teeny Seed who wanted to grow into a beautiful flower.<br><br>Use the arrow keys to move and press down to plant yourself!',
    },
    {
        name: 'use-vine',
        seeds: [
            SeedType.Vine,
            SeedType.Flower,
        ],
        text: 'The Teeny Seed wandered the fields until he found a friend.',
    },
    {
        name: 'vine-misdirection',
        seeds: [
            SeedType.Vine,
            SeedType.Flower,
        ],
        song: 'farmin-default',
        text: 'The two seeds worked together to find a good spot for the Teeny Seed to grow.',
    },
    {
        name: 'explode',
        seeds: [
            SeedType.Vine,
            SeedType.Bomb,
            SeedType.Flower,
        ],
        text: 'As they were exploring, they came across a new seed, with a bright red glow. He looked scary!',
    },
    {
        name: 'explode-and-grow',
        seeds: [
            SeedType.Vine,
            SeedType.Bomb,
            SeedType.Flower,
        ],
        text: `"Don't worry! I'm a friendly seed," said the Cherry Bomb Seed. "Let me help you find a place to grow!"`,
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
        text: `In the corner of the field, they found a dirty-looking seed. He looked sad. "Nobody's wanted to be friends with me before."<br><br>"You can be friends with us!" said the Teeny Seed.`,
    },
    {
        name: 'tunnel',
        seeds: [
            SeedType.Vine,
            SeedType.Bomb,
            SeedType.Dirt,
            SeedType.Flower,
        ],
        text: `Now all the seeds were working together to get the Teeny Seed where he needed to be.`,
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
        text: `They found themselves in a place where all the soil looked old. But the Teeny Seed could feel that there was a good spot to grow under the dirt.<br><br>"Let me handle this!" said the Cherry Bomb Seed.`,
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
        text: `They finally made to the end of the game. Congratulations!`,
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