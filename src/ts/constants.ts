import { seededRandom } from "./lib/util";

// Multiple for the fixed-point physics.
export const PHYSICS_SCALE = 16;
export const TIME_STEP = 1 / 60;

export const PIXEL_SCALE = 3;

export const GAME_WIDTH_PX = Math.round(800 / PIXEL_SCALE);
export const GAME_HEIGHT_PX = Math.round(600 / PIXEL_SCALE);

export const TILE_SIZE_PX = 16;
export const TILE_SIZE = TILE_SIZE_PX * PHYSICS_SCALE;

// Not really a constant :)
export const rng = seededRandom("blah bloo blee blah");