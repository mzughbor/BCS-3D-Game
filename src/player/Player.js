import * as THREE from 'three';
import { GAME_SETTINGS } from '/src/game/constants.js';

export class Player {
    constructor() {
        this.moveSpeed = GAME_SETTINGS.PLAYER.MOVE_SPEED;
        this.turnSpeed = GAME_SETTINGS.PLAYER.TURN_SPEED;
        
        // Initialize camera rotation before creating mesh
        this.cameraRotation = new THREE.Euler(0, 0, 0, 'YXZ');
        this.mouseSensitivity = 0.002;
        
        this.mesh = this.createPlayerMesh();
        this.setupCamera();
    }

    createPlayerMesh() {
        // Create player body
        const geometry = new THREE.BoxGeometry(
            GAME_SETTINGS.PLAYER.WIDTH,
            GAME_SETTINGS.PLAYER.HEIGHT,
            GAME_SETTINGS.PLAYER.WIDTH
        );
        const material = new THREE.MeshPhongMaterial({ 
            color: 0x00ff00,
            transparent: true,
            opacity: 0.7 // Make it slightly transparent
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.y = GAME_SETTINGS.PLAYER.HEIGHT / 2;
        
        // Add a direction indicator (arrow)
        const arrowGeometry = new THREE.ConeGeometry(0.2, 0.5, 8);
        const arrowMaterial = new THREE.MeshPhongMaterial({ color: 0xff0000 });
        const arrow = new THREE.Mesh(arrowGeometry, arrowMaterial);
        arrow.rotation.x = -Math.PI / 2;
        arrow.position.set(0, 1, -0.5);
        mesh.add(arrow);

        return mesh;
    }

    setupCamera() {
        this.camera = new THREE.PerspectiveCamera(
            75, 
            window.innerWidth / window.innerHeight, 
            0.1, 
            1000
        );
        
        // Position camera at player's head level
        this.camera.position.y = 1.7; // Approximate eye level
        this.camera.position.z = 0;
        
        // Add camera directly to mesh for proper rotation
        this.mesh.add(this.camera);
        
        return this.mesh;
    }

    update() {
        // Apply camera rotation
        this.camera.rotation.copy(this.cameraRotation);
        
        // Update player mesh rotation to match camera's Y rotation
        this.mesh.rotation.y = this.cameraRotation.y;
    }

    onMouseMove(event) {
        if (!event.movementX && !event.movementY) return;
        
        // Update camera rotation based on mouse movement
        this.cameraRotation.y -= event.movementX * this.mouseSensitivity;
        this.cameraRotation.x -= event.movementY * this.mouseSensitivity;
        
        // Clamp vertical rotation to prevent over-rotation
        this.cameraRotation.x = Math.max(
            -Math.PI / 2.5, // Limit looking up
            Math.min(Math.PI / 2.5, this.cameraRotation.x) // Limit looking down
        );
    }

    getPosition() {
        return this.mesh.position;
    }

    getCollisionRadius() {
        return GAME_SETTINGS.PLAYER.COLLISION_RADIUS;
    }
} 