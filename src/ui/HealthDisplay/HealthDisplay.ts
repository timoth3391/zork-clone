import styles from "./HealthDisplay.module.css";
import { EnemyNames } from "../../entities/Enemy/Enemy";

type HealthBarType = "player" | "enemy";

type HealthDisplayParams = {
    type: HealthBarType;
    name: EnemyNames | string;
    currentHp: number;
    maxHp: number;
};

export default class HealthDisplay {
    container: HTMLDivElement;
    type: HealthBarType;
    name: EnemyNames | string;
    currentHp: number;
    maxHp: number;

    constructor({ type, name, currentHp, maxHp }: HealthDisplayParams) {
        this.type = type;
        this.name = name;
        this.currentHp = currentHp;
        this.maxHp = maxHp;

        this.container = this.initializeHealthDisplay();
    }

    /**
     * Initializes the HTML structure for the health display.
     *
     * @returns {HTMLDivElement} - The container element for the health display.
     */
    initializeHealthDisplay() {
        const container = document.createElement("div");
        const containerStyles = [styles.healthDisplay];
        containerStyles.push(styles[`${this.type}Health`]);

        container.classList.add(...containerStyles);

        container.innerHTML = `
            <div class=${styles.healthText}>
                <span class="name">${this.name.toUpperCase()}</span>
                <span class="hp">HP: ${this.currentHp}/${this.maxHp}</span>
            </div>
            <div class=${styles.healthBar}>
                <div class=${styles.healthBarFill} style="width: 100%"></div>
            </div>
        `;

        container.style.display = "none";
        document.querySelector(".battle-ui")?.appendChild(container);

        return container;
    }

    /**
     * Hides the health display container.
     */
    hide() {
        this.container.style.display = "none";
    }

    /**
     * Shows the health display container.
     */
    show() {
        this.container.style.display = "block";
    }

    /**
     * Remove container element and it's children from tree.
     * Used when removing an enemy from the scene.
     */
    remove() {
        this.container.remove();
    }
}
