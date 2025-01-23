export class CollisionManager {
    constructor() {
        this.walls = [];
        this.roomRadius = 0; // Will store the room's radius
        this.interactiveObjects = new Map(); // Map objects to their collision handlers
    }

    setRoomRadius(radius) {
        this.roomRadius = radius;
    }

    addWall(wall) {
        this.walls.push(wall);
    }

    addInteractiveObject(object, collisionHandler) {
        this.interactiveObjects.set(object, collisionHandler);
        this.walls.push(object); // Add to walls for normal collision detection
    }

    checkCollision(position, radius) {
        // Check room boundary
        const distanceFromCenter = Math.sqrt(position.x * position.x + position.z * position.z);
        if (distanceFromCenter + radius > this.roomRadius) {
            return true;
        }

        // Check collisions with walls and objects
        for (const wall of this.walls) {
            if (!wall || !wall.position) continue;

            // Convert position to wall's local space
            const localPosition = position.clone().sub(wall.position);
            
            // Handle groups (like the statue)
            if (wall.type === 'Group') {
                const boundingRadius = 1; // Approximate bounding radius for groups
                if (localPosition.length() < (boundingRadius + radius)) {
                    if (this.interactiveObjects.has(wall)) {
                        this.interactiveObjects.get(wall)();
                    }
                    return true;
                }
                continue;
            }

            // Handle regular meshes
            if (wall.geometry) {
                let collisionWidth = 1;
                let collisionHeight = 1;
                let collisionDepth = 1;

                // Try to get actual dimensions if available
                if (wall.geometry.parameters) {
                    collisionWidth = wall.geometry.parameters.width || wall.geometry.parameters.radiusTop * 2 || 1;
                    collisionHeight = wall.geometry.parameters.height || 1;
                    collisionDepth = wall.geometry.parameters.depth || wall.geometry.parameters.radiusTop * 2 || 1;
                }

                // Apply wall's rotation to local position
                localPosition.applyQuaternion(wall.quaternion.clone().invert());

                // Box collision check
                if (Math.abs(localPosition.x) < collisionWidth / 2 + radius &&
                    Math.abs(localPosition.y) < collisionHeight / 2 + radius &&
                    Math.abs(localPosition.z) < collisionDepth / 2 + radius) {
                    
                    if (this.interactiveObjects.has(wall)) {
                        this.interactiveObjects.get(wall)();
                    }
                    return true;
                }
            }
        }
        return false;
    }
} 