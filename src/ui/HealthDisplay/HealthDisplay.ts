import styles from "./HealthDisplay.module.css";
import { EnemyNames } from "../../entities/Enemy/Enemy";

type HealthBarType = "player" | "enemy";

type HealthDisplayParams = {
    type: HealthBarType;
    name: EnemyNames;
    currentHp: number;
    maxHp: number;
};

export default class HealthDisplay {
    container: HTMLDivElement;
    type: HealthBarType;
    name: EnemyNames;
    currentHp: number;
    maxHp: number;

    constructor({ type, name, currentHp, maxHp }: HealthDisplayParams) {
        this.container = this.initializeHealthDisplay();
        this.type = type;
        this.name = name;
        this.currentHp = currentHp;
        this.maxHp = maxHp;
    }

    initializeHealthDisplay() {
        const container = document.createElement("div");
        container.classList.add(styles.healthDisplay, styles.enemyHealth);

        container.innerHTML = `
            <div class="health-text">
                <span class="name">${this.name.toUpperCase()}</span>
                <span class="hp">HP: ${this.currentHp}/${this.maxHp}</span>
            </div>
            <div class="health-bar">
                <div class="health-bar-fill" style="width: 100%"></div>
            </div>
        `;

        container.style.display = "none";
        document.querySelector(".battle-ui");

        return container;
    }
}
