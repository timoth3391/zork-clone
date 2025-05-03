import { Room } from "../lib/types";

const INITIAL_PLAYER_HEALTH = 100;

export default class Player {
    currentRoom: Room | null;
    inventory: [];
    health: number;
    hasKey: boolean;
    previousRoom: Room | null;

    constructor() {
        this.currentRoom = null;
        this.inventory = [];
        this.health = INITIAL_PLAYER_HEALTH;
        this.hasKey = false;
        this.previousRoom = null;
    }
}
