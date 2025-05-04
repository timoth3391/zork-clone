const rooms = {
    entrance: {
        description:
            "You stand at the entrance of a dark dungeon. The air is damp and cold. A flickering torch barely illuminates the stone walls. To the north, a narrow passage leads deeper into the dungeon.",
        exits: { north: "corridor1" },
        items: ["torch"],
        enemies: [],
        pixelArt: {
            background: "#111",
            elements: [
                { type: "wall", x: 0, y: 0, width: 200, height: 20 },
                { type: "wall", x: 0, y: 0, width: 20, height: 200 },
                { type: "wall", x: 180, y: 0, width: 20, height: 200 },
                { type: "wall", x: 0, y: 180, width: 200, height: 20 },
                { type: "torch", x: 160, y: 30, color: "#f50" }
            ]
        }
    },
    corridor1: {
        description:
            "A long, narrow corridor stretches before you. The walls are covered in strange carvings. You hear distant dripping water. There's a door to the east and the corridor continues north.",
        exits: { north: "hall", east: "treasure1", south: "entrance" },
        items: [],
        enemies: ["skeleton"],
        pixelArt: {
            background: "#111",
            elements: [
                { type: "wall", x: 0, y: 0, width: 200, height: 20 },
                { type: "wall", x: 0, y: 0, width: 20, height: 200 },
                { type: "wall", x: 180, y: 0, width: 20, height: 200 },
                { type: "wall", x: 0, y: 180, width: 200, height: 20 },
                { type: "skeleton", x: 100, y: 100, color: "#fff" }
            ]
        }
    },
    hall: {
        description:
            "You enter a large hall with high ceilings. Broken pillars lie scattered across the floor. A large chandelier hangs precariously from the ceiling. Exits lead in all directions.",
        exits: {
            north: "corridor2",
            east: "trap",
            south: "corridor1",
            west: "treasure2"
        },
        items: ["health potion"],
        enemies: ["goblin"],
        pixelArt: {
            background: "#111",
            elements: [
                { type: "wall", x: 0, y: 0, width: 200, height: 20 },
                { type: "wall", x: 0, y: 0, width: 20, height: 200 },
                { type: "wall", x: 180, y: 0, width: 20, height: 200 },
                { type: "wall", x: 0, y: 180, width: 200, height: 20 },
                { type: "pillar", x: 50, y: 50, color: "#666" },
                { type: "pillar", x: 150, y: 50, color: "#666" },
                { type: "goblin", x: 100, y: 100, color: "#0f0" },
                { type: "potion", x: 30, y: 30, color: "#f00" }
            ]
        }
    },
    corridor2: {
        description:
            "A winding corridor with several alcoves. The air is thick with dust. You see scratch marks on the walls.",
        exits: { south: "hall", east: "exit" },
        items: ["key"],
        enemies: ["spider"],
        pixelArt: {
            background: "#111",
            elements: [
                { type: "wall", x: 0, y: 0, width: 200, height: 20 },
                { type: "wall", x: 0, y: 0, width: 20, height: 200 },
                { type: "wall", x: 180, y: 0, width: 20, height: 200 },
                { type: "wall", x: 0, y: 180, width: 200, height: 20 },
                { type: "spider", x: 100, y: 100, color: "#666" },
                { type: "key", x: 30, y: 30, color: "#ff0" }
            ]
        }
    },
    treasure1: {
        description:
            "A small room with a wooden chest in the center. The walls are lined with empty weapon racks.",
        exits: { west: "corridor1" },
        items: [],
        chestContents: ["gold coins"],
        chestOpen: false,
        enemies: [],
        pixelArt: {
            background: "#111",
            elements: [
                { type: "wall", x: 0, y: 0, width: 200, height: 20 },
                { type: "wall", x: 0, y: 0, width: 20, height: 200 },
                { type: "wall", x: 180, y: 0, width: 20, height: 200 },
                { type: "wall", x: 0, y: 180, width: 200, height: 20 },
                { type: "chest", x: 0, y: 0 }
            ]
        }
    },
    treasure2: {
        description:
            "A hidden alcove containing a golden chest. The walls shimmer with embedded gems.",
        exits: { east: "hall" },
        items: [],
        chestContents: ["diamond"],
        chestOpen: false,
        enemies: ["guardian"],
        pixelArt: {
            background: "#111",
            elements: [
                { type: "wall", x: 0, y: 0, width: 200, height: 20 },
                { type: "wall", x: 0, y: 0, width: 20, height: 200 },
                { type: "wall", x: 180, y: 0, width: 20, height: 200 },
                { type: "wall", x: 0, y: 180, width: 200, height: 20 },
                { type: "chest", x: 0, y: 0 }
            ]
        }
    },
    trap: {
        description:
            "A seemingly empty room. The floor tiles look suspiciously clean.",
        exits: { west: "hall" },
        items: [],
        enemies: [],
        trap: true,
        pixelArt: {
            background: "#111",
            elements: [
                { type: "wall", x: 0, y: 0, width: 200, height: 20 },
                { type: "wall", x: 0, y: 0, width: 20, height: 200 },
                { type: "wall", x: 180, y: 0, width: 20, height: 200 },
                { type: "wall", x: 0, y: 180, width: 200, height: 20 },
                { type: "trap", x: 80, y: 80, color: "#f00" }
            ]
        }
    },
    exit: {
        description:
            "A heavy iron door stands before you, locked with a large padlock. This must be the way out!",
        exits: { west: "corridor2" },
        items: [],
        enemies: [],
        isExit: true,
        pixelArt: {
            background: "#111",
            elements: [
                { type: "wall", x: 0, y: 0, width: 200, height: 20 },
                { type: "wall", x: 0, y: 0, width: 20, height: 200 },
                { type: "wall", x: 180, y: 0, width: 20, height: 200 },
                { type: "wall", x: 0, y: 180, width: 200, height: 20 },
                { type: "door", x: 90, y: 20, color: "#666" },
                { type: "lock", x: 100, y: 30, color: "#ff0" }
            ]
        }
    }
} as const;

export type RoomName = keyof typeof rooms;

export { rooms };
