import * as THREE from 'three';
import { GAME_SETTINGS } from '../game/constants.js';

export class Office {
    constructor(scene, collisionManager) {
        this.scene = scene;
        this.collisionManager = collisionManager;
        // Set room radius in collision manager
        this.collisionManager.setRoomRadius((GAME_SETTINGS.WORLD.ROOM_WIDTH / 2) * 0.85); // Slightly smaller than actual radius for better collision
        this.createRoom();
    }

    createRoom() {
        this.createFloor();
        this.createOuterWall();
        this.createColumns();
        this.createWindows();
        this.createStatueOfLiberty();
        this.createFurniture();
    }

    createFloor() {
        // Blue carpet
        const geometry = new THREE.CircleGeometry(GAME_SETTINGS.WORLD.ROOM_WIDTH / 2, 32);
        const material = new THREE.MeshPhongMaterial({ color: 0x1a237e }); // Dark blue
        const floor = new THREE.Mesh(geometry, material);
        floor.rotation.x = -Math.PI / 2;
        this.scene.add(floor);

        // Ceiling
        const ceiling = new THREE.Mesh(
            geometry,
            new THREE.MeshPhongMaterial({ color: 0xffffff })
        );
        ceiling.rotation.x = Math.PI / 2;
        ceiling.position.y = GAME_SETTINGS.WORLD.ROOM_HEIGHT;
        this.scene.add(ceiling);
    }

    createOuterWall() {
        const radius = GAME_SETTINGS.WORLD.ROOM_WIDTH / 2;
        const segments = 32;
        
        // Create two cylinders for the two-tone wall effect
        const createWallSection = (height, yOffset, color) => {
            const geometry = new THREE.CylinderGeometry(
                radius, radius,
                height,
                segments,
                1,
                true
            );
            
            const material = new THREE.MeshPhongMaterial({ 
                color: color,
                side: THREE.DoubleSide
            });
            
            const wall = new THREE.Mesh(geometry, material);
            wall.position.y = yOffset;
            this.scene.add(wall);
            this.collisionManager.addWall(wall);
        };

        // Upper wall (constitution wallpaper)
        createWallSection(
            GAME_SETTINGS.WORLD.ROOM_HEIGHT * 0.6, 
            GAME_SETTINGS.WORLD.ROOM_HEIGHT * 0.7,
            0xd4c39d
        );

        // Lower wall (white wainscoting)
        createWallSection(
            GAME_SETTINGS.WORLD.ROOM_HEIGHT * 0.4,
            GAME_SETTINGS.WORLD.ROOM_HEIGHT * 0.2,
            0xffffff
        );
    }

    createColumns() {
        const columnRadius = 0.3;
        const columnHeight = GAME_SETTINGS.WORLD.ROOM_HEIGHT;
        const numColumns = 8;
        const radius = (GAME_SETTINGS.WORLD.ROOM_WIDTH / 2) * 0.9;

        // Create a reusable column geometry and material
        const columnGeometry = new THREE.CylinderGeometry(columnRadius, columnRadius, columnHeight, 16);
        const capitalGeometry = new THREE.CylinderGeometry(columnRadius * 1.5, columnRadius, columnHeight * 0.1, 16);
        const columnMaterial = new THREE.MeshPhongMaterial({ 
            color: 0xffffff,  // Pure white color
            specular: 0xffffff, // White specular highlight
            shininess: 100,
            emissive: 0x111111 // Slight emissive to enhance the white appearance
        });

        for (let i = 0; i < numColumns; i++) {
            const angle = (i / numColumns) * Math.PI * 2;
            const x = radius * Math.cos(angle);
            const z = radius * Math.sin(angle);

            // Column body
            const column = new THREE.Mesh(columnGeometry, columnMaterial);
            
            // Column capital (top)
            const capital = new THREE.Mesh(capitalGeometry, columnMaterial);
            capital.position.y = columnHeight / 2 - capitalGeometry.parameters.height / 2;
            column.add(capital);

            // Column base
            const base = new THREE.Mesh(capitalGeometry, columnMaterial);
            base.position.y = -columnHeight / 2 + capitalGeometry.parameters.height / 2;
            base.rotation.x = Math.PI;
            column.add(base);

            column.position.set(x, columnHeight / 2, z);
            this.scene.add(column);
            this.collisionManager.addWall(column);
        }
    }

    createWindows() {
        const numWindows = 8;
        const windowRadius = 0.8;
        const radius = (GAME_SETTINGS.WORLD.ROOM_WIDTH / 2) * 0.95;
        const windowHeight = GAME_SETTINGS.WORLD.ROOM_HEIGHT * 0.7;
        // Add an offset angle to position windows between columns
        const windowOffset = (Math.PI / numWindows); // Half the angle between columns

        const geometry = new THREE.CircleGeometry(windowRadius, 16);
        const material = new THREE.MeshBasicMaterial({ 
            color: 0xffffff, 
            side: THREE.DoubleSide,
            emissive: 0xffffff,
            emissiveIntensity: 0.5
        });

        for (let i = 0; i < numWindows; i++) {
            // Add the offset to the angle calculation
            const angle = (i / numWindows) * Math.PI * 2 + windowOffset;
            const x = radius * Math.cos(angle);
            const z = radius * Math.sin(angle);

            const window = new THREE.Mesh(geometry, material);
            window.position.set(x, windowHeight, z);
            window.lookAt(0, windowHeight, 0);
            this.scene.add(window);
        }
    }

    createStatueOfLiberty() {
        // Create the statue body
        const bodyGeometry = new THREE.CylinderGeometry(0.3, 0.6, 2, 8);
        const crownGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.4, 7);
        const armGeometry = new THREE.CylinderGeometry(0.1, 0.1, 1, 8);
        const torchGeometry = new THREE.ConeGeometry(0.2, 0.4, 8);
        
        const statueMaterial = new THREE.MeshPhongMaterial({
            color: 0x7B9E89,  // Statue of Liberty green
            metalness: 0.5,
            roughness: 0.5
        });

        // Create statue parts
        const body = new THREE.Mesh(bodyGeometry, statueMaterial);
        const crown = new THREE.Mesh(crownGeometry, statueMaterial);
        const arm = new THREE.Mesh(armGeometry, statueMaterial);
        const torch = new THREE.Mesh(torchGeometry, statueMaterial);

        // Position crown
        crown.position.y = 1.2;
        
        // Position arm and torch
        arm.position.set(0.4, 0.8, 0);
        arm.rotation.z = Math.PI / 4;
        torch.position.set(0.8, 1.2, 0);

        // Create statue group
        this.statue = new THREE.Group();
        this.statue.add(body);
        this.statue.add(crown);
        this.statue.add(arm);
        this.statue.add(torch);

        // Position the entire statue
        this.statue.position.set(0, 1, 0);
        this.scene.add(this.statue);

        // Add collision detection
        this.collisionManager.addInteractiveObject(this.statue, this.handleStatueCollision.bind(this));
    }

    handleStatueCollision() {
        if (this.statue.isShaking) return; // Prevent multiple shakes
        this.statue.isShaking = true;

        const originalRotation = this.statue.rotation.y;
        const shakeAmount = 0.1;
        const shakeDuration = 200; // milliseconds

        // Shake animation
        const startTime = Date.now();
        const animate = () => {
            const elapsed = Date.now() - startTime;
            if (elapsed > shakeDuration) {
                this.statue.rotation.y = originalRotation;
                this.statue.isShaking = false;
                return;
            }

            const progress = elapsed / shakeDuration;
            const shake = Math.sin(progress * Math.PI * 4) * shakeAmount * (1 - progress);
            this.statue.rotation.y = originalRotation + shake;

            requestAnimationFrame(animate);
        };

        animate();
    }

    createFurniture() {
        // Position desk against the back wall
        const deskX = -GAME_SETTINGS.WORLD.ROOM_WIDTH * 0.3;
        const deskZ = -GAME_SETTINGS.WORLD.ROOM_WIDTH * 0.35;

        // Simple desk
        const desk = new THREE.Mesh(
            new THREE.BoxGeometry(2, 0.8, 1),
            new THREE.MeshPhongMaterial({ 
                color: 0x4a3728,
                specular: 0x222222,
                shininess: 100
            })
        );
        desk.position.set(deskX, 0.4, deskZ);
        desk.rotation.y = Math.PI / 4;
        this.scene.add(desk);
        this.collisionManager.addWall(desk);

        // Simple chair
        const chair = new THREE.Mesh(
            new THREE.BoxGeometry(0.8, 1.2, 0.8),
            new THREE.MeshPhongMaterial({ 
                color: 0x800000,
                specular: 0x222222,
                shininess: 100
            })
        );
        chair.position.set(deskX, 0.6, deskZ + 1);
        chair.rotation.y = Math.PI / 4;
        this.scene.add(chair);
        this.collisionManager.addWall(chair);
    }
} 