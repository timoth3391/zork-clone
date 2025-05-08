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
                    <div class="battle-ui"></div>
                </div>
            </div>
        </div>
    </div>
  `;

// Start game
const game = new Game();
