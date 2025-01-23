import * as THREE from 'three';
import { GAME_SETTINGS } from '/src/game/constants.js';
import { Player } from '/src/player/Player.js';
import { PlayerController } from '/src/player/PlayerController.js';
import { Office } from '/src/world/Office.js';
import { CollisionManager } from '/src/utils/CollisionManager.js';

class Game {
    constructor() {
        this.scene = new THREE.Scene();
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);

        this.collisionManager = new CollisionManager();
        this.player = new Player();
        this.playerController = new PlayerController(this.player);
        this.office = new Office(this.scene, this.collisionManager);

        this.scene.add(this.player.mesh);
        this.scene.add(this.player.cameraHolder);
        this.setupLighting();
        this.setupWindowResize();
        this.animate();
    }

    setupLighting() {
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        const pointLight = new THREE.PointLight(0xffffff, 1);
        pointLight.position.set(0, 5, 0);
        this.scene.add(ambientLight, pointLight);
    }

    setupWindowResize() {
        window.addEventListener('resize', () => {
            this.player.camera.aspect = window.innerWidth / window.innerHeight;
            this.player.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        this.playerController.update(this.collisionManager);
        this.renderer.render(this.scene, this.player.camera);
    }
}

// Start the game
new Game(); 