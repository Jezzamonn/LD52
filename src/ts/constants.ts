import { seededRandom } from "./lib/util";

// Multiple for the fixed-point physics.
export const PHYSICS_SCALE = 16;
export const FPS = 60;
export const TIME_STEP = 1 / FPS;

export const PIXEL_SCALE = 4;

export const GAME_WIDTH_PX = Math.round(800 / PIXEL_SCALE);
export const GAME_HEIGHT_PX = Math.round(600 / PIXEL_SCALE);
export const GAME_WIDTH = GAME_WIDTH_PX * PHYSICS_SCALE;
export const GAME_HEIGHT = GAME_HEIGHT_PX * PHYSICS_SCALE;

export const TILE_SIZE_PX = 16;
export const TILE_SIZE = TILE_SIZE_PX * PHYSICS_SCALE;

export const LEFT_KEYS = ['a', 'ArrowLeft'];
export const RIGHT_KEYS = ['d', 'ArrowRight'];
export const JUMP_KEYS = ['w', 'ArrowUp'];
export const DOWN_KEYS = ['s', 'ArrowDown'];
export const PLANT_KEYS = ['s', 'ArrowDown'];
export const SELECT_KEYS = ['Space', 'Enter'];

export function physFromPx(x: number): number {
    return x * PHYSICS_SCALE;
}

export function pxFromPhys(x: number): number {
    return Math.floor(x / PHYSICS_SCALE);
}

// Not really a constant :)
export const rng = seededRandom("blah bloo blee blah");