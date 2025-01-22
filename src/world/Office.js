import * as THREE from 'three';
import { GAME_SETTINGS } from '../game/constants.js';

export class Office {
    constructor(scene, collisionManager) {
        this.scene = scene;
        this.collisionManager = collisionManager;
        this.createRoom();
    }

    createRoom() {
        this.createFloor();
        this.createWalls();
    }

    createFloor() {
        const geometry = new THREE.PlaneGeometry(
            GAME_SETTINGS.WORLD.ROOM_WIDTH,
            GAME_SETTINGS.WORLD.ROOM_WIDTH
        );
        const material = new THREE.MeshPhongMaterial({ color: 0x808080 });
        const floor = new THREE.Mesh(geometry, material);
        floor.rotation.x = -Math.PI / 2;
        this.scene.add(floor);
    }

    createWalls() {
        const wallMaterial = new THREE.MeshPhongMaterial({ color: 0xcccccc });
        
        // Create and add walls
        const walls = [
            { // Back wall
                position: [0, GAME_SETTINGS.WORLD.ROOM_HEIGHT/2, -GAME_SETTINGS.WORLD.ROOM_WIDTH/2],
                rotation: [0, 0, 0]
            },
            { // Left wall
                position: [-GAME_SETTINGS.WORLD.ROOM_WIDTH/2, GAME_SETTINGS.WORLD.ROOM_HEIGHT/2, 0],
                rotation: [0, Math.PI/2, 0]
            },
            { // Right wall
                position: [GAME_SETTINGS.WORLD.ROOM_WIDTH/2, GAME_SETTINGS.WORLD.ROOM_HEIGHT/2, 0],
                rotation: [0, -Math.PI/2, 0]
            }
        ];

        walls.forEach(wallData => {
            const wall = this.createWall(wallMaterial);
            wall.position.set(...wallData.position);
            wall.rotation.set(...wallData.rotation);
            this.scene.add(wall);
            this.collisionManager.addWall(wall);
        });
    }

    createWall(material) {
        return new THREE.Mesh(
            new THREE.PlaneGeometry(
                GAME_SETTINGS.WORLD.ROOM_WIDTH,
                GAME_SETTINGS.WORLD.ROOM_HEIGHT
            ),
            material
        );
    }
} 