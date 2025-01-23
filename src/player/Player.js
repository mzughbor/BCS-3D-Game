import * as THREE from 'three';
import { GAME_SETTINGS } from '/src/game/constants.js';

export class Player {
    constructor() {
        this.moveSpeed = GAME_SETTINGS.PLAYER.MOVE_SPEED;
        this.turnSpeed = GAME_SETTINGS.PLAYER.TURN_SPEED;
        
        // Initialize camera rotation before creating mesh
        this.cameraRotation = new THREE.Euler(0, 0, 0, 'YXZ');
        this.mouseSensitivity = GAME_SETTINGS.PLAYER.MOUSE_SENSITIVITY;
        
        this.mesh = this.createPlayerMesh();
        this.setupCamera();
    }

    createPlayerMesh() {
        const geometry = new THREE.BoxGeometry(
            GAME_SETTINGS.PLAYER.WIDTH,
            GAME_SETTINGS.PLAYER.HEIGHT,
            GAME_SETTINGS.PLAYER.WIDTH
        );
        const material = new THREE.MeshPhongMaterial({ 
            color: 0x00ff00,
            transparent: true,
            opacity: 0.7
        });
        const mesh = new THREE.Mesh(geometry, material);
        
        // Move starting position further from walls
        mesh.position.set(-4, GAME_SETTINGS.PLAYER.HEIGHT / 2, 4);
        
        // Create head for camera
        this.head = new THREE.Object3D();
        this.head.position.y = 1.7;
        mesh.add(this.head);

        return mesh;
    }

    setupCamera() {
        this.camera = new THREE.PerspectiveCamera(
            75, 
            window.innerWidth / window.innerHeight, 
            0.1, 
            1000
        );
        this.head.add(this.camera);
    }

    update() {
        // Only apply vertical rotation to the head/camera
        this.head.rotation.x = this.cameraRotation.x;
        
        // Apply horizontal rotation to the entire body immediately
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