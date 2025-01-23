import * as THREE from 'three';

export class PlayerController {
    constructor(player) {
        this.player = player;
        this.moveForward = false;
        this.moveBackward = false;
        this.moveLeft = false;
        this.moveRight = false;
        this.isPointerLocked = false;
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
        `;
        instructions.innerHTML = 'Click to play<br>(W,A,S,D = Move, Mouse = Look around)<br>ESC to pause';
        document.body.appendChild(instructions);
        this.instructions = instructions;
    }

    setupControls() {
        document.addEventListener('keydown', (event) => this.handleKeyDown(event));
        document.addEventListener('keyup', (event) => this.handleKeyUp(event));
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
        document.addEventListener('pointerlockerror', () => {
            console.error('Pointer lock failed');
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
            case 'KeyW': this.moveForward = true; break;
            case 'KeyS': this.moveBackward = true; break;
            case 'KeyA': this.moveLeft = true; break;
            case 'KeyD': this.moveRight = true; break;
        }
    }

    handleKeyUp(event) {
        switch (event.code) {
            case 'KeyW': this.moveForward = false; break;
            case 'KeyS': this.moveBackward = false; break;
            case 'KeyA': this.moveLeft = false; break;
            case 'KeyD': this.moveRight = false; break;
        }
    }

    update(collisionManager) {
        const mesh = this.player.mesh;
        
        // Calculate movement relative to camera direction
        const moveVector = new THREE.Vector3();
        
        if (this.moveForward) moveVector.z -= this.player.moveSpeed;
        if (this.moveBackward) moveVector.z += this.player.moveSpeed;
        if (this.moveLeft) moveVector.x -= this.player.moveSpeed;
        if (this.moveRight) moveVector.x += this.player.moveSpeed;

        // Normalize diagonal movement
        if (moveVector.length() > 0) {
            moveVector.normalize().multiplyScalar(this.player.moveSpeed);
        }

        // Apply camera rotation to movement
        moveVector.applyEuler(new THREE.Euler(0, this.player.cameraRotation.y, 0));
        
        // Test collision before moving
        const newPosition = mesh.position.clone().add(moveVector);
        if (!collisionManager.checkCollision(newPosition, this.player.getCollisionRadius())) {
            mesh.position.add(moveVector);
        }

        // Update camera position
        this.player.update();
    }
} 