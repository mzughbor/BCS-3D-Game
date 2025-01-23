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
        if (!this.isPointerLocked) return; // Don't move if not locked

        const mesh = this.player.mesh;
        const moveVector = new THREE.Vector3(0, 0, 0);
        const speed = this.player.moveSpeed;

        // Forward/backward movement
        if (this.moveForward || this.moveBackward) {
            const forward = new THREE.Vector3(0, 0, -1);
            forward.applyQuaternion(mesh.quaternion);
            forward.y = 0;
            forward.normalize();
            
            const multiplier = this.moveForward ? speed : -speed;
            moveVector.add(forward.multiplyScalar(multiplier));
        }

        // Left/right movement
        if (this.moveLeft || this.moveRight) {
            const right = new THREE.Vector3(1, 0, 0);
            right.applyQuaternion(mesh.quaternion);
            right.y = 0;
            right.normalize();
            
            const multiplier = this.moveRight ? speed : -speed;
            moveVector.add(right.multiplyScalar(multiplier));
        }

        // Apply movement if there's any
        if (moveVector.length() > 0) {
            const newPosition = mesh.position.clone().add(moveVector);
            
            // Debug log
            console.log('Trying to move:', {
                current: mesh.position.clone(),
                new: newPosition,
                vector: moveVector,
                keys: {
                    w: this.moveForward,
                    s: this.moveBackward,
                    a: this.moveLeft,
                    d: this.moveRight
                }
            });

            if (!collisionManager.checkCollision(newPosition, this.player.getCollisionRadius())) {
                mesh.position.add(moveVector);
            }
        }

        // Update camera
        this.player.update();
    }
} 