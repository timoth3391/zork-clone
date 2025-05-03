export type Direction = "north" | "south" | "east" | "west" | "up" | "down";

export type ExitMap = {
    [direction: string]: string;
};

export type PixelElement = {
    type: string;
    x: number;
    y: number;
    width?: number;
    height?: number;
    color?: string;
};

export type PixelArt = {
    background: string;
    elements: PixelElement[];
};

export type Room = {
    description: string;
    exits: ExitMap;
    items: string[];
    enemies: string[];
    pixelArt?: PixelArt;
};
