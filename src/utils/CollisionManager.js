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
            localPosition.applyQuaternion(wall.quaternion.clone().invert());

            // Handle regular meshes
            if (wall.geometry && wall.geometry.parameters) {
                let width = wall.geometry.parameters.width || wall.geometry.parameters.radiusTop * 2 || 1;
                let height = wall.geometry.parameters.height || 1;
                let depth = wall.geometry.parameters.depth || wall.geometry.parameters.radiusTop * 2 || 1;

                // Box collision check
                if (Math.abs(localPosition.x) < width / 2 + radius &&
                    Math.abs(localPosition.y) < height / 2 + radius &&
                    Math.abs(localPosition.z) < depth / 2 + radius) {
                    return true;
                }
            }
        }
        return false;
    }
} 