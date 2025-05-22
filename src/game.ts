import { rooms } from "../src/world/rooms";
import Enemy, { EnemyNames } from "./entities/Enemy/Enemy";
import Player, { PlayerType } from "./entities/Player/Player";
import HealthDisplay from "./ui/HealthDisplay/HealthDisplay";

export type GameContext = {
    registerHealthDisplay: (display: HealthDisplay) => void;
};

export default class Game {
    context: GameContext;
    rooms: typeof rooms;
    player: PlayerType;
    gameText: HTMLElement | null;
    commandInput: HTMLElement | null;
    canvas: HTMLCanvasElement | null;
    ctx: CanvasRenderingContext2D | null;
    backgrounds: Record<string, HTMLImageElement>;
    particles: [];
    fadeOutElements: [];
    dyingElements: [];
    lastTime: number;
    // enemy: Enemy | null;
    enemies: Enemy[];
    enemyHealthDisplays: HealthDisplay[];

    constructor() {
        this.context = {
            registerHealthDisplay: this.registerHealthDisplay.bind(this)
        };
        this.rooms = rooms;
        this.player = new Player({ currentRoom: "entrance" });
        this.gameText = document.getElementById("game-text");
        this.commandInput = document.getElementById("command-input");

        // Set canvas
        const canvasEl = document.getElementById("pixel-art");

        if (!(canvasEl instanceof HTMLCanvasElement)) {
            throw new Error(
                "Canvas element not found or is not a <canvas> element."
            );
        }

        this.canvas = canvasEl;
        this.ctx = this.canvas.getContext("2d");

        // Set up canvas sizing
        this.resizeCanvas();
        window.addEventListener("resize", () => this.resizeCanvas());

        // Load background images
        // TODO: Change room names and room image names to match
        //       e.g. entryway --> entrance
        this.backgrounds = {
            entryway: new Image(),
            hallway: new Image()
        };
        this.backgrounds.entryway.src = "entryway.PNG";
        this.backgrounds.hallway.src = "hallway.PNG";

        this.particles = [];
        this.fadeOutElements = [];
        this.dyingElements = []; // Track dying enemies for rotation animation
        this.setupEventListeners();
        this.printWelcome();
        this.lastTime = 0;
        this.requestAnimationFrame();

        // this.enemy = null;
        this.enemies = [];
        this.enemyHealthDisplays = [];

        // Load item images
        this.itemImages = {
            chest: new Image(),
            chestOpen: new Image()
        };
        this.itemImages.chest.src = "assets/treasure_chest.png";
        this.itemImages.chestOpen.src = "assets/treasure_chest-open.png";

        // Initialize sound effects
        this.sounds = {
            death: new Audio("assets/death.wav"),
            hit: new Audio("assets/hit.wav")
        };
    }

    registerHealthDisplay(display: HealthDisplay) {
        this.enemyHealthDisplays.push(display);
    }

    resizeCanvas() {
        const container = this.canvas.parentElement;
        this.canvas.width = container.clientWidth;
        this.canvas.height = container.clientHeight;

        // Store the aspect ratio for calculations
        this.aspectRatio = this.canvas.width / this.canvas.height;
    }

    requestAnimationFrame() {
        window.requestAnimationFrame((timestamp) => {
            const deltaTime = timestamp - this.lastTime;
            this.lastTime = timestamp;

            this.updateParticles(deltaTime);
            this.updateFadeOuts(deltaTime);
            this.renderPixelArt();
            this.requestAnimationFrame();
        });
    }

    updateParticles(deltaTime) {
        // Update particle positions and lifetimes
        this.particles = this.particles.filter((particle) => {
            particle.x += particle.vx * (deltaTime / 16);
            particle.y += particle.vy * (deltaTime / 16);
            particle.life -= deltaTime;
            particle.opacity = Math.max(0, particle.life / particle.maxLife);
            return particle.life > 0;
        });
    }

    updateFadeOuts(deltaTime) {
        // Update fade-out animations
        this.fadeOutElements = this.fadeOutElements.filter((element) => {
            element.opacity -= deltaTime * 0.003;
            return element.opacity > 0;
        });

        // Update dying animations
        this.dyingElements = this.dyingElements.filter((element) => {
            // Calculate rotation speed to complete 90 degrees in 500ms
            const rotationSpeed = (90 / 500) * deltaTime;
            element.rotation = Math.min(90, element.rotation + rotationSpeed); // Cap at 90 degrees
            element.timeAlive += deltaTime;
            return element.timeAlive < 500; // Duration of rotation animation
        });
    }

    createParticles(x, y, color, type = "collect") {
        const particleConfigs = {
            collect: {
                count: 15,
                spread: 100,
                speed: 3,
                life: 500
            },
            defeat: {
                count: 25,
                spread: 150,
                speed: 4,
                life: 800
            }
        };

        const config = particleConfigs[type];

        for (let i = 0; i < config.count; i++) {
            const angle = (Math.PI * 2 * i) / config.count;
            const speed = config.speed * (0.5 + Math.random() * 0.5);
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: 3 + Math.random() * 3,
                color: color,
                life: config.life * (0.8 + Math.random() * 0.4),
                maxLife: config.life,
                opacity: 1
            });
        }
    }

    renderPixelArt() {
        // Clear canvas with black
        this.ctx.fillStyle = "#000";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw appropriate background based on room type
        const room = this.rooms[this.player.currentRoom];
        const isAtDoor =
            room.isExit ||
            room.currentRoom === "entrance" ||
            room.description.toLowerCase().includes("door");

        const backgroundImage = isAtDoor
            ? this.backgrounds.entryway
            : this.backgrounds.hallway;

        if (backgroundImage.complete) {
            // Fill the entire canvas with the background while maintaining aspect ratio
            const bgAspectRatio =
                backgroundImage.width / backgroundImage.height;
            let drawWidth = this.canvas.width;
            let drawHeight = this.canvas.height;

            if (bgAspectRatio > this.aspectRatio) {
                // Background is wider than canvas
                drawWidth = this.canvas.height * bgAspectRatio;
                const x = (this.canvas.width - drawWidth) / 2;
                this.ctx.drawImage(
                    backgroundImage,
                    x,
                    0,
                    drawWidth,
                    drawHeight
                );
            } else {
                // Background is taller than canvas
                drawHeight = this.canvas.width / bgAspectRatio;
                const y = (this.canvas.height - drawHeight) / 2;
                this.ctx.drawImage(
                    backgroundImage,
                    0,
                    y,
                    drawWidth,
                    drawHeight
                );
            }
        }

        if (room.pixelArt) {
            // Draw non-enemy elements first (excluding walls)
            room.pixelArt.elements.forEach((element) => {
                if (
                    !["skeleton", "goblin", "bandit", "blob", "wall"].includes(
                        element.type
                    )
                ) {
                    if (element.type === "chest") {
                        this.drawItem("chest", element.x, element.y);
                    } else {
                        this.ctx.fillStyle = element.color || "#fff";
                        if (element.shape) {
                            this.drawPixelShape(
                                element.shape,
                                element.x,
                                element.y,
                                element.pixelSize || 8
                            );
                        } else if (element.width && element.height) {
                            this.ctx.fillRect(
                                element.x,
                                element.y,
                                element.width,
                                element.height
                            );
                        }
                    }
                }
            });

            // Draw enemies last
            if (this.enemies.length) {
                // NOTE: Only drawing ONE enemy for now
                this.enemies[0].draw(this.canvas, this.ctx);
            }
        }

        // Draw particles
        this.particles.forEach((particle) => {
            this.ctx.globalAlpha = particle.opacity;
            this.ctx.fillStyle = particle.color;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fill();
        });
        this.ctx.globalAlpha = 1;

        // Draw fade-out elements
        this.fadeOutElements.forEach((element) => {
            this.ctx.globalAlpha = element.opacity;
            if (element.type === "skeleton") {
                const centerX = (this.canvas.width - 180) / 2;
                const baseY = this.canvas.height - 200;
                this.drawEnemy("skeleton", centerX, baseY);
            } else if (!["wall"].includes(element.type)) {
                this.ctx.fillStyle = element.color || "#fff";
                if (element.shape) {
                    this.drawPixelShape(
                        element.shape,
                        element.x,
                        element.y,
                        element.pixelSize || 8
                    );
                } else if (element.width && element.height) {
                    this.ctx.fillRect(
                        element.x,
                        element.y,
                        element.width,
                        element.height
                    );
                }
            }
        });
        this.ctx.globalAlpha = 1;

        // Draw dying elements with rotation
        this.dyingElements.forEach((element) => {
            this.ctx.save();
            // Rotate around center of the enemy
            const centerX = element.x + element.width / 2;
            const centerY = element.y + element.height / 2;
            this.ctx.translate(centerX, centerY);
            this.ctx.rotate((element.rotation * Math.PI) / 180); // Convert degrees to radians
            this.ctx.translate(-centerX, -centerY);

            // Draw the rotated enemy
            if (element.type === "skeleton") {
                this.drawEnemy("skeleton", element.x, element.y);
            } else {
                this.drawEnemy(element.type, element.x, element.y);
            }

            this.ctx.restore();
        });
    }

    drawPixelShape(shape, x, y, size = 1) {
        shape.forEach((row, i) => {
            row.forEach((pixel, j) => {
                if (pixel) {
                    this.ctx.fillRect(x + j * size, y + i * size, size, size);
                }
            });
        });
    }

    drawItem(type, x, y) {
        if (type === "chest") {
            const room = this.rooms[this.player.currentRoom];
            const chestElement = room.pixelArt.elements.find(
                (e) => e.type === "chest"
            );
            const image =
                chestElement && chestElement.isOpen
                    ? this.itemImages.chestOpen
                    : this.itemImages.chest;

            if (image.complete) {
                // Scale chest size based on canvas height
                const size = this.canvas.height * 0.4;
                // Position the chest at the bottom of the screen with some padding
                const centerX = (this.canvas.width - size) / 2;
                const bottomY =
                    this.canvas.height - size - this.canvas.height * 0.1; // 10% padding from bottom
                this.ctx.drawImage(image, centerX, bottomY, size, size);
            }
        }
    }

    setupEventListeners() {
        this.commandInput.addEventListener("keypress", (e) => {
            if (e.key === "Enter") {
                const command = this.commandInput.value.toLowerCase().trim();
                this.commandInput.value = "";
                this.handleCommand(command);
            }
        });
    }

    printWelcome() {
        this.printText("Welcome to the Dungeon Crawler!", "welcome-message");
        this.printText(
            "You find yourself at the entrance of a mysterious dungeon. Your goal is to find the exit.",
            "welcome-message"
        );
        this.printText(
            "Available commands: look, go [direction], go back, take [item], use [item], open chest, inventory, attack [enemy], help",
            "welcome-message"
        );
        this.printText(
            "Directions: north, south, east, west",
            "welcome-message"
        );
        this.printText("\n"); // Add extra line break before room description
        this.printRoomDescription();
    }

    printText(text: string, className = "") {
        const p = document.createElement("p");
        p.textContent = text;
        if (className) {
            p.className = className;
        }
        this.gameText.appendChild(p);
        this.gameText.scrollTop = this.gameText.scrollHeight;
    }

    printRoomDescription() {
        const room = this.rooms[this.player.currentRoom];
        this.printText("\n" + room.description, "room-description");

        if (room.items.length > 0) {
            this.printText("You see: " + room.items.join(", "), "room-info");
        }

        if (room.chestContents && !room.chestOpen) {
            this.printText("There is a chest in the room.", "room-info");
        }

        if (room.enemies.length > 0) {
            this.printText(
                "Enemies present: " + room.enemies.join(", "),
                "room-info"
            );
        }

        this.printText(
            "Exits: " + Object.keys(room.exits).join(", "),
            "room-info"
        );
    }

    handleCommand(command) {
        const words = command.split(" ");
        const action = words[0];
        const target = words.slice(1).join(" ");

        switch (action) {
            case "look":
                this.printRoomDescription();
                break;
            case "go":
                if (target === "back") {
                    this.goBack();
                } else {
                    this.movePlayer(target);
                }
                break;
            case "back": // Allow just typing 'back' as well
                this.goBack();
                break;
            case "take":
                this.takeItem(target);
                break;
            case "use":
                this.useItem(target);
                break;
            case "open":
                this.openChest(target);
                break;
            case "inventory":
                this.showInventory();
                break;
            case "attack":
                this.attackEnemy(target);
                break;
            case "help":
                this.printText(
                    "Available commands: look, go [direction], go back, take [item], use [item], open chest, inventory, attack [enemy], help"
                );
                break;
            default:
                this.printText(
                    "I don't understand that command. Type 'help' for available commands."
                );
        }
    }

    // TODO: Refactor to use movePlayer method!
    goBack() {
        if (!this.player.previousRoom) {
            this.printText("You can't go back from here.");
            return;
        }

        // Store current room before moving
        const currentRoom = this.player.currentRoom;

        // Move to previous room
        this.player.currentRoom = this.player.previousRoom;

        // Update previous room to current room
        this.player.previousRoom = currentRoom;

        // Perform standard room entry actions
        this.printRoomDescription();
        this.renderPixelArt();

        // Reset enemy health in the room we're entering
        /* const roomEnemies = this.rooms[this.player.currentRoom].enemies;
        roomEnemies.forEach((enemy) => {
            this.enemyHealth[enemy].current = this.enemyHealth[enemy].max;
        }); */

        // Show/hide battle UI based on enemies present
        this.updateBattleUI();
    }

    removeEnemy() {
        // const currentEnemy = this.enemies[0];
        // currentEnemy.healthDisplay.remove();

        // Clear all enemies and their health displays
        this.enemies = [];
        this.enemyHealthDisplays.forEach((display) => display.remove());
    }

    movePlayer(direction) {
        const room = this.rooms[this.player.currentRoom];
        const moveIsValid = room.exits[direction];

        // If new room has NO enemies
        //      If there is a currently ACTIVE enemy (this.enemies.length)
        //          Remove enemy's HealthDisplay HTML
        //          Hide player health display
        //          Remove instance of enemy (this.enemies = [])
        //      Else there is no ACTIVE enemy
        //          Do NOTHING (this.enemies is already empty)
        // Else new room has an enemy
        //      If there is a currently ACTIVE enemy (from the previous room)
        //          Replace enemy with the new enemy
        //      Show enemy and player health displays

        if (moveIsValid) {
            const newRoom = room.exits[direction];

            // Store current room before moving
            this.player.previousRoom = this.player.currentRoom;

            const newRoomEnemies = this.rooms[newRoom].enemies;
            const previousRoomEnemies = this.enemies;

            /**
             * NOTE: Next room will either have NO enemies,
             *       or you will have to replace the 'current'
             *       enemy with the new one.
             */

            if (previousRoomEnemies.length) this.removeEnemy();

            if (newRoomEnemies.length) {
                this.enemies = newRoomEnemies.map((enemyName: EnemyNames) => {
                    const enemyInstance = new Enemy({
                        gameContext: this.context,
                        name: enemyName
                    });
                    return enemyInstance;
                });
            }

            // Activate traps
            if (this.rooms[newRoom].trap) {
                this.player.health -= 20;
                this.printText("You triggered a trap! You take 20 damage.");
                this.updateHealthDisplays();
                if (this.player.health <= 0) {
                    this.printText("You have died! Game Over.");
                    return;
                }
            }

            this.player.currentRoom = newRoom;
            this.printRoomDescription();
            this.renderPixelArt();

            // Show/hide battle UI based on enemies present
            this.updateBattleUI();

            if (this.rooms[newRoom].isExit) {
                if (this.player.hasKey) {
                    this.printText(
                        "You use the key to unlock the door and escape the dungeon! Congratulations!"
                    );
                } else {
                    this.printText(
                        "The door is locked. You need a key to open it."
                    );
                }
            }
        } else {
            this.printText("You can't go that way!");
        }
    }

    takeItem(item) {
        const room = this.rooms[this.player.currentRoom];
        const itemIndex = room.items.indexOf(item);

        if (itemIndex !== -1) {
            // Find the visual element before removing it
            const itemTypes = {
                torch: "torch",
                "health potion": "potion",
                key: "key",
                "gold coins": "coins",
                diamond: "diamond"
            };

            const visualElement = room.pixelArt.elements.find(
                (element) => element.type === itemTypes[item]
            );

            if (visualElement) {
                // Create particles at item location
                this.createParticles(
                    visualElement.x + 20,
                    visualElement.y + 20,
                    visualElement.color || "#ff0",
                    "collect"
                );

                // Add fade-out animation
                this.fadeOutElements.push({
                    ...visualElement,
                    opacity: 1
                });
            }

            // Remove item from room's items array
            room.items.splice(itemIndex, 1);

            // Remove item from pixelArt elements
            if (room.pixelArt && room.pixelArt.elements) {
                room.pixelArt.elements = room.pixelArt.elements.filter(
                    (element) => element.type !== itemTypes[item]
                );
            }

            this.player.inventory.push(item);
            if (item === "key") {
                this.player.hasKey = true;
            }
            this.printText(`You take the ${item}.`);
        } else {
            this.printText("That item isn't here!");
        }
    }

    useItem(item) {
        if (this.player.inventory.includes(item)) {
            if (item === "health potion") {
                this.player.health = Math.min(100, this.player.health + 30);
                this.player.inventory = this.player.inventory.filter(
                    (i) => i !== item
                );
                this.printText(
                    "You drink the health potion and restore 30 health!"
                );
            } else {
                this.printText("You can't use that item right now.");
            }
        } else {
            this.printText("You don't have that item!");
        }
    }

    showInventory() {
        if (this.player.inventory.length === 0) {
            this.printText("Your inventory is empty.");
        } else {
            this.printText("Inventory: " + this.player.inventory.join(", "));
        }
        this.printText(`Health: ${this.player.health}`);
    }

    updateHealthDisplays() {
        // Update player health
        const playerHealthPercent = (this.player.health / 100) * 100;
        this.playerHealthDisplay.querySelector(".hp").textContent =
            `HP: ${this.player.health}/100`;
        this.playerHealthDisplay.querySelector(".health-bar-fill").style.width =
            `${playerHealthPercent}%`;
    }

    /**
     * Updates enemy and player health displays.
     */
    updateBattleUI() {
        const room = this.rooms[this.player.currentRoom];
        const hasEnemies = this.enemies.length;

        if (hasEnemies) {
            this.enemies[0].healthDisplay.show();
            this.player.healthDisplay.show();
        } else {
            // NOTE: Enemy's health bar is removed by the removeEnemy method
            this.player.healthDisplay.hide();
        }

        // NOTE: Disabled temporarily until I figure out if its needed here
        /* if (hasEnemies) {
            this.updateHealthDisplays();
        } */
    }

    attemptRun() {
        const chance = Math.random();
        if (chance > 0.3) {
            // 70% chance to run
            const room = this.rooms[this.player.currentRoom];
            const exits = Object.keys(room.exits);
            if (exits.length > 0) {
                const randomExit =
                    exits[Math.floor(Math.random() * exits.length)];
                this.printText("You successfully flee!");
                this.movePlayer(randomExit);
            } else {
                this.printText("There's nowhere to run!");
            }
        } else {
            this.printText("Couldn't escape!");
            // Enemy gets a free attack
            const enemy = this.rooms[this.player.currentRoom].enemies[0];
            const damage = Math.floor(Math.random() * 15) + 5;
            this.player.health -= damage;
            this.printText(`The ${enemy} hits you for ${damage} damage!`);
            this.updateHealthDisplays();
        }
    }

    attackEnemy(enemy) {
        const room = this.rooms[this.player.currentRoom];

        if (room.enemies.includes(enemy)) {
            this.printText(`You attack the ${enemy}!`, "combat-action");

            const enemyTypes = {
                skeleton: "skeleton",
                goblin: "goblin",
                spider: "spider",
                guardian: "guardian"
            };

            // Calculate enemy position consistently for all types
            const size =
                enemy === "skeleton"
                    ? this.canvas.height * 0.8
                    : this.canvas.height * 0.4;

            const centerX = (this.canvas.width - size) / 2;
            const baseY = this.canvas.height - size - this.canvas.height * 0.1;

            const enemyPos = {
                x: centerX,
                y: baseY,
                width: size,
                height: size
            };

            // Combat logic
            const playerDamage = Math.floor(Math.random() * 20) + 10;
            const enemyDamage = Math.floor(Math.random() * 15) + 5;

            // Update enemy health
            this.enemyHealth[enemy].current -= playerDamage;
            this.printText(
                `You hit the ${enemy} for ${playerDamage} damage!`,
                "combat-result"
            );
            this.updateHealthDisplays();

            // Flash the screen red briefly
            this.ctx.fillStyle = "rgba(255, 0, 0, 0.3)";
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

            if (this.enemyHealth[enemy].current <= 0) {
                // Play death sound
                this.sounds.death.currentTime = 0;
                this.sounds.death
                    .play()
                    .catch((e) => console.log("Error playing sound:", e));

                // Start death animation at enemy position
                this.dyingElements.push({
                    type: enemyTypes[enemy],
                    x: enemyPos.x,
                    y: enemyPos.y,
                    width: enemyPos.width,
                    height: enemyPos.height,
                    rotation: 0,
                    timeAlive: 0
                });

                // Create defeat particles at enemy center
                this.createParticles(
                    enemyPos.x + enemyPos.width / 2,
                    enemyPos.y + enemyPos.height / 2,
                    "#f00",
                    "defeat"
                );

                // Add fade-out animation
                this.fadeOutElements.push({
                    type: enemyTypes[enemy],
                    x: enemyPos.x,
                    y: enemyPos.y,
                    width: enemyPos.width,
                    height: enemyPos.height,
                    opacity: 1
                });

                // Remove enemy from room
                room.enemies = room.enemies.filter((e) => e !== enemy);
                if (room.pixelArt && room.pixelArt.elements) {
                    room.pixelArt.elements = room.pixelArt.elements.filter(
                        (element) => element.type !== enemyTypes[enemy]
                    );
                }

                this.printText(`You defeat the ${enemy}!`, "enemy-defeat");
                this.updateBattleUI();
            } else {
                // Play hit sound
                this.sounds.hit.currentTime = 0;
                this.sounds.hit
                    .play()
                    .catch((e) => console.log("Error playing sound:", e));

                // Enemy counterattack
                this.player.health -= enemyDamage;
                this.printText(
                    `The ${enemy} hits you for ${enemyDamage} damage!`,
                    "combat-result"
                );
                this.updateHealthDisplays();

                if (this.player.health <= 0) {
                    this.printText("You have died! Game Over.", "enemy-defeat");
                    return;
                }
            }
        } else {
            this.printText("That enemy isn't here!");
        }
    }

    openChest(target) {
        if (target !== "chest") {
            this.printText("What are you trying to open?");
            return;
        }

        const room = this.rooms[this.player.currentRoom];
        if (!room.chestContents) {
            this.printText("There's no chest here to open.");
            return;
        }

        if (room.chestOpen) {
            this.printText("The chest is already open.");
            return;
        }

        if (room.enemies.length > 0) {
            this.printText(
                "You can't open the chest while enemies are present!"
            );
            return;
        }

        // Open the chest
        room.chestOpen = true;
        room.items.push(...room.chestContents);

        // Create particles effect
        const centerX = this.canvas.width / 2;
        const bottomY = this.canvas.height - this.canvas.height * 0.5;
        this.createParticles(centerX, bottomY, "#ff0", "collect");

        // Update the chest visual to show it's open
        const chestElement = room.pixelArt.elements.find(
            (element) => element.type === "chest"
        );
        if (chestElement) {
            chestElement.isOpen = true;
        }

        this.printText("You open the chest.", "room-info");
        this.printText(
            `Inside you find: ${room.chestContents.join(", ")}`,
            "room-info"
        );
    }
}
