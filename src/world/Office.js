import * as THREE from 'three';
import { GAME_SETTINGS } from '../game/constants.js';

export class Office {
    constructor(scene, collisionManager) {
        this.scene = scene;
        this.collisionManager = collisionManager;
        this.collisionManager.setRoomRadius((GAME_SETTINGS.WORLD.ROOM_WIDTH / 2) * 0.95);
        this.createRoom();
    }

    createRoom() {
        this.createFloor();
        this.createOuterWall();
        this.createColumns();
        this.createWindows();
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
        }

        // Add only one collision wall for the entire height
        const collisionWall = new THREE.Mesh(
            new THREE.CylinderGeometry(radius, radius, GAME_SETTINGS.WORLD.ROOM_HEIGHT, segments, 1, true),
            new THREE.MeshBasicMaterial({ visible: false })
        );
        collisionWall.position.y = GAME_SETTINGS.WORLD.ROOM_HEIGHT / 2;
        this.scene.add(collisionWall);
        this.collisionManager.addWall(collisionWall);

        // Visual walls (no collision)
        createWallSection(
            GAME_SETTINGS.WORLD.ROOM_HEIGHT * 0.6, 
            GAME_SETTINGS.WORLD.ROOM_HEIGHT * 0.7,
            0xd4c39d
        );

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
            
            // Adjust column collision to be slightly smaller
            const collisionRadius = columnRadius * 0.8;
            
            // Add separate collision cylinder
            const collisionGeometry = new THREE.CylinderGeometry(collisionRadius, collisionRadius, columnHeight, 8);
            const collisionMesh = new THREE.Mesh(collisionGeometry, new THREE.MeshBasicMaterial({ visible: false }));
            collisionMesh.position.copy(column.position);
            this.scene.add(collisionMesh);
            this.collisionManager.addWall(collisionMesh);
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