import { Room } from "../lib/types";
import { RoomName } from "../world/rooms";

export type PlayerType = InstanceType<typeof Player>;

const INITIAL_PLAYER_HEALTH = 100;

export default class Player implements PlayerType {
    currentRoom: RoomName | null;
    inventory: [];
    health: number;
    hasKey: boolean;
    previousRoom: RoomName | null;

    constructor({ currentRoom }: { currentRoom: RoomName }) {
        this.currentRoom = currentRoom;
        this.inventory = [];
        this.health = INITIAL_PLAYER_HEALTH;
        this.hasKey = false;
        this.previousRoom = null;
    }
}
