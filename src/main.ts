import "./style.css";
import Game from "./game.ts";

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
    <div id="game-container">
        <div id="text-section">
            <div id="game-text"></div>
                <div id="input-container">
                    <span class="prompt">></span>
                    <input type="text" id="command-input" autofocus />
                </div>
        </div>

        <div id="game-content">
                <div id="pixel-art-container">
                    <canvas id="pixel-art"></canvas>
                    <div class="battle-ui">
                        <div class="health-display enemy-health">
                            <div class="health-text">
                                <span class="name">ENEMY</span>
                                <span class="hp">HP: 50/50</span>
                            </div>
                            <div class="health-bar">
                                <div
                                    class="health-bar-fill"
                                    style="width: 100%"
                                ></div>
                            </div>
                        </div>
                        <div class="health-display player-health">
                            <div class="health-text">
                                <span class="name">PLAYER</span>
                                <span class="hp">HP: 100/100</span>
                            </div>
                            <div class="health-bar">
                                <div
                                    class="health-bar-fill"
                                    style="width: 100%"
                                ></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  `;

// Start game
const game = new Game();
