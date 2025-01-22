import * as THREE from 'three';
import { GAME_SETTINGS } from '/src/game/constants.js';

export class Player {
    constructor() {
        this.moveSpeed = GAME_SETTINGS.PLAYER.MOVE_SPEED;
        this.turnSpeed = GAME_SETTINGS.PLAYER.TURN_SPEED;
        this.mesh = this.createPlayerMesh();
        this.setupCamera();
    }

    createPlayerMesh() {
        const geometry = new THREE.BoxGeometry(
            GAME_SETTINGS.PLAYER.WIDTH,
            GAME_SETTINGS.PLAYER.HEIGHT,
            GAME_SETTINGS.PLAYER.WIDTH
        );
        const material = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.y = GAME_SETTINGS.PLAYER.HEIGHT / 2;
        return mesh;
    }

    setupCamera() {
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 3, 5);
        this.mesh.add(this.camera);
    }

    getPosition() {
        return this.mesh.position;
    }

    getCollisionRadius() {
        return GAME_SETTINGS.PLAYER.COLLISION_RADIUS;
    }
} 