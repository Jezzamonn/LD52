import { Point } from "../../common";
import { TILE_SIZE } from "../../constants";
import { TileLayer } from "./tile-layer";

export enum BaseTile {
    Empty = 0,
    Dirt = 1,
    Cave = 2,
    Unknown = 3, // Used temporarily when creating the level. Will be filled in later.
}

export class BaseLayer extends TileLayer<BaseTile> {

    constructor(w: number, h: number) {
        super(w, h);

        // Add a floor and some walls.
        for (let y = 0; y < this.h; y++) {
            for (let x = 0; x < this.w; x++) {
                this.tiles[y][x] = y == (this.h - 1) ? BaseTile.Dirt : BaseTile.Empty;
            }
            this.tiles[y][0] = BaseTile.Dirt;
            this.tiles[y][this.w - 1] = BaseTile.Dirt;
        }
    }

    fillInUnknownTiles() {
        for (let y = this.minY; y <= this.maxY; y++) {
            for (let x = this.minX; x <= this.maxX; x++) {
                if (this.getTile({x, y}) == BaseTile.Unknown) {
                    console.log('filling in unknown tile', x, y)
                    // Unknown tiles are filled based on the tile to the left and right (excluding walls).
                    const neighbors = [
                        this.getTile({ x: x - 1, y }),
                        this.getTile({ x: x + 1, y }),
                    ]
                    // Filter out walls.
                    const filteredNeighbors = neighbors.filter((tile) => tile != BaseTile.Dirt);
                    // Sort them (sort of a hack but works ok).
                    const sortedNeighbors = filteredNeighbors.sort();
                    // Because there's just two, we don't need to do the whole sorting thing... just pick the first.
                    const newTile = sortedNeighbors.length > 0 ? sortedNeighbors[0] : BaseTile.Empty;
                    this.setTile({x, y}, newTile);
                }
            }
        }
    }

    explodeAtCoord(p: Point) {
        const tile = this.getTileAtCoord(p);
        if (tile == BaseTile.Dirt) {
            this.setTileAtCoord(p, BaseTile.Cave);
        }
    }

    renderTile(
        context: CanvasRenderingContext2D,
        pos: Point,
    ) {
        const tile = this.getTile(pos);
        const renderPos = {x: pos.x * TILE_SIZE, y: pos.y * TILE_SIZE }

        if (tile == BaseTile.Dirt) {
            // Loop through each corner
            for (const dx of [-1, 1]) {
                const dxTile = this.getTile({ x: pos.x + dx, y: pos.y });
                for (const dy of [-1, 1]) {
                    const subTilePos = { x: dx < 0 ? 0 : 1, y: dy < 0 ? 0 : 1}
                    const dyTile = this.getTile({ x: pos.x, y: pos.y + dy });
                    const dxdyTile = this.getTile({ x: pos.x + dx, y: pos.y + dy });
                    let tilePos: Point = { x: 0, y: 0 };

                    switch (dxTile) {
                        case BaseTile.Dirt:
                            tilePos.x += 1;
                            break;
                        case BaseTile.Cave:
                            tilePos.x += 2;
                            break;
                    }
                    switch (dyTile) {
                        case BaseTile.Dirt:
                            tilePos.y += 1;
                            break;
                    }

                    // Special case for the corner piece.
                    if (dxTile == BaseTile.Dirt && dyTile == BaseTile.Dirt && dxdyTile != BaseTile.Dirt) {
                        tilePos.y += 2;
                    }

                    this.drawQuarterTile(
                        context,
                        {
                            tilePos,
                            subTilePos,
                            renderPos
                        }
                    );
                }
            }
        } else if (tile == BaseTile.Cave) {
            // A similar set of conditions as for the walls.
            for (const dx of [-1, 1]) {
                const dxTile = this.getTile({ x: pos.x + dx, y: pos.y });
                for (const dy of [-1, 1]) {
                    const subTilePos = { x: dx < 0 ? 0 : 1, y: dy < 0 ? 0 : 1}
                    const dyTile = this.getTile({ x: pos.x, y: pos.y + dy });

                    let tilePos: Point = { x: 3, y: 0 };

                    switch (dxTile) {
                        case BaseTile.Cave:
                        case BaseTile.Dirt:
                            tilePos.x += 1;
                            break;
                    }
                    switch (dyTile) {
                        case BaseTile.Cave:
                            tilePos.y += 1;
                            break;
                        case BaseTile.Dirt:
                            tilePos.y += 2;
                            break;
                    }

                    this.drawQuarterTile(
                        context,
                        {
                            tilePos,
                            subTilePos,
                            renderPos
                        }
                    );
                }
            }
        }
    }

}