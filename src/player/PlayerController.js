import * as THREE from 'three';

export class PlayerController {
    constructor(player) {
        this.player = player;
        this.moveForward = false;
        this.moveBackward = false;
        this.turnLeft = false;
        this.turnRight = false;
        this.setupControls();
    }

    setupControls() {
        document.addEventListener('keydown', (event) => this.handleKeyDown(event));
        document.addEventListener('keyup', (event) => this.handleKeyUp(event));
    }

    handleKeyDown(event) {
        switch (event.code) {
            case 'KeyW': this.moveForward = true; break;
            case 'KeyS': this.moveBackward = true; break;
            case 'KeyA': this.turnLeft = true; break;
            case 'KeyD': this.turnRight = true; break;
        }
    }

    handleKeyUp(event) {
        switch (event.code) {
            case 'KeyW': this.moveForward = false; break;
            case 'KeyS': this.moveBackward = false; break;
            case 'KeyA': this.turnLeft = false; break;
            case 'KeyD': this.turnRight = false; break;
        }
    }

    update(collisionManager) {
        const mesh = this.player.mesh;
        
        // Handle rotation
        if (this.turnLeft) mesh.rotation.y += this.player.turnSpeed;
        if (this.turnRight) mesh.rotation.y -= this.player.turnSpeed;

        // Calculate movement
        const direction = new THREE.Vector3();
        if (this.moveForward) direction.z = -this.player.moveSpeed;
        if (this.moveBackward) direction.z = this.player.moveSpeed;

        // Apply rotation to movement
        direction.applyQuaternion(mesh.quaternion);
        
        // Test collision before moving
        const newPosition = mesh.position.clone().add(direction);
        if (!collisionManager.checkCollision(newPosition, this.player.getCollisionRadius())) {
            mesh.position.add(direction);
        }
    }
} 