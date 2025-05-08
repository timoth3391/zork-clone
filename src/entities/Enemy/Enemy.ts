// import styles from "./Enemy.module.css";

import HealthDisplay from "../../ui/HealthDisplay/HealthDisplay";

const ENEMIES = {
    skeleton: {
        health: {
            max: 50,
            current: 50
        },
        imagePath: "skeleton.PNG"
    },
    goblin: {
        health: {
            max: 40,
            current: 40
        },
        imagePath: "goblin.PNG"
    },
    bandit: {
        health: {
            max: 70,
            current: 70
        },
        imagePath: "bandit.PNG"
    },
    guardian: {
        health: {
            max: 100,
            current: 100
        },
        imagePath: "blob.PNG"
    }
} as const;

export type EnemyNames = keyof typeof ENEMIES;
type EnemyParams = {
    name: EnemyNames;
};

export default class Enemy {
    name: EnemyNames;
    health: number;
    maxHealth: number;
    healthDisplay: HealthDisplay;
    image: HTMLImageElement;

    constructor({ name }: EnemyParams) {
        const enemyData = ENEMIES[name];

        this.name = name;
        this.health = enemyData.health.current;
        this.maxHealth = enemyData.health.max;
        this.image = new Image();
        this.image.src = enemyData.imagePath;

        this.healthDisplay = new HealthDisplay({
            type: "enemy",
            name: this.name,
            currentHp: this.health,
            maxHp: this.maxHealth
        });
    }

    draw(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
        const size = canvas.height * 0.8;
        const centerX = (canvas.width - size) / 2;
        const baseY = canvas.height - size - canvas.height * 0.1; // 10% padding from bottom

        ctx.drawImage(this.image, centerX, baseY, size, size);
    }
}
