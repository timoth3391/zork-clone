// import styles from "./Enemy.module.css";

import HealthDisplay from "../../ui/HealthDisplay/HealthDisplay";

const ENEMIES = {
    skeleton: {
        health: {
            max: 50,
            current: 50
        },
        image: "assets/skeleton.PNG"
    },
    goblin: {
        health: {
            max: 40,
            current: 40
        },
        image: "assets/goblin.PNG"
    },
    bandit: {
        health: {
            max: 70,
            current: 70
        },
        image: "assets/bandit.PNG"
    },
    guardian: {
        health: {
            max: 100,
            current: 100
        },
        image: "assets/blob.PNG"
    }
} as const;

export type EnemyNames = keyof typeof ENEMIES;
type EnemyParams = {
    name: EnemyNames;
};

export default class Enemy {
    name: EnemyNames;
    hp: number;
    maxHp: number;
    healthDisplay: HealthDisplay;

    constructor({ name }: EnemyParams) {
        const enemyData = ENEMIES[name];

        this.name = name;
        this.hp = enemyData.health.current;
        this.maxHp = enemyData.health.max;

        this.healthDisplay = new HealthDisplay({
            type: "enemy",
            name: this.name,
            currentHp: this.hp,
            maxHp: this.maxHp
        });
    }
}
