import * as THREE from 'three';

export class PlayerController {
    constructor(player) {
        this.player = player;
        this.moveForward = false;
        this.moveBackward = false;
        this.moveLeft = false;
        this.moveRight = false;
        this.isPointerLocked = false;
        
        // Make sure we bind the event handlers to this instance
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);
        
        this.setupControls();
        this.setupMouseControls();
        this.createInstructions();
    }

    createInstructions() {
        const instructions = document.createElement('div');
        instructions.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            text-align: center;
            font-family: Arial;
            font-size: 18px;
            padding: 20px;
            background-color: rgba(0,0,0,0.7);
            color: white;
            border-radius: 10px;
            pointer-events: none;
            z-index: 1000;
        `;
        instructions.innerHTML = 'Click to play<br>(W,A,S,D = Move, Mouse = Look around)<br>ESC to pause';
        document.body.appendChild(instructions);
        this.instructions = instructions;
    }

    setupControls() {
        // Add event listeners directly to document
        document.addEventListener('keydown', this.handleKeyDown);
        document.addEventListener('keyup', this.handleKeyUp);
    }

    setupMouseControls() {
        // Handle initial click
        document.addEventListener('click', () => {
            if (!this.isPointerLocked) {
                document.body.requestPointerLock();
            }
        });

        // Handle pointer lock change
        document.addEventListener('pointerlockchange', () => {
            if (document.pointerLockElement === document.body) {
                this.isPointerLocked = true;
                this.instructions.style.display = 'none';
            } else {
                this.isPointerLocked = false;
                this.instructions.style.display = 'block';
            }
        });

        // Handle pointer lock error
        document.addEventListener('pointerlockerror', (event) => {
            console.error('Pointer lock failed', event);
            this.instructions.textContent = 'Error: Pointer lock failed. Click again to retry.';
        });

        // Handle mouse movement
        document.addEventListener('mousemove', (event) => {
            if (this.isPointerLocked) {
                this.player.onMouseMove(event);
            }
        });
    }

    handleKeyDown(event) {
        switch (event.code) {
            case 'KeyW':
            case 'ArrowUp':
                this.moveForward = true;
                break;
            case 'KeyS':
            case 'ArrowDown':
                this.moveBackward = true;
                break;
            case 'KeyA':
            case 'ArrowLeft':
                this.moveLeft = true;
                break;
            case 'KeyD':
            case 'ArrowRight':
                this.moveRight = true;
                break;
        }
    }

    handleKeyUp(event) {
        switch (event.code) {
            case 'KeyW':
            case 'ArrowUp':
                this.moveForward = false;
                break;
            case 'KeyS':
            case 'ArrowDown':
                this.moveBackward = false;
                break;
            case 'KeyA':
            case 'ArrowLeft':
                this.moveLeft = false;
                break;
            case 'KeyD':
            case 'ArrowRight':
                this.moveRight = false;
                break;
        }
    }

    update(collisionManager) {
        if (!this.isPointerLocked) return;

        const mesh = this.player.mesh;
        const moveVector = new THREE.Vector3();
        
        // Get the direction the player is facing
        const direction = new THREE.Vector3(0, 0, -1);
        direction.applyQuaternion(mesh.quaternion);
        
        // Calculate forward/backward movement
        if (this.moveForward) {
            moveVector.add(direction.clone().multiplyScalar(this.player.moveSpeed));
        }
        if (this.moveBackward) {
            moveVector.add(direction.clone().multiplyScalar(-this.player.moveSpeed));
        }
        
        // Calculate left/right movement (perpendicular to facing direction)
        if (this.moveLeft || this.moveRight) {
            const sideDirection = new THREE.Vector3(-direction.z, 0, direction.x);
            const sideMultiplier = this.moveLeft ? -1 : 1;
            moveVector.add(sideDirection.multiplyScalar(this.player.moveSpeed * sideMultiplier));
        }

        // Apply movement if no collision
        if (moveVector.length() > 0) {
            const newPosition = mesh.position.clone().add(moveVector);
            if (!collisionManager.checkCollision(newPosition, this.player.getCollisionRadius())) {
                mesh.position.add(moveVector);
            }
        }

        // Update camera
        this.player.update();
    }
} 