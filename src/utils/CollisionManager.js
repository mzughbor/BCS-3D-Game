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
        // Check if player is trying to go outside the room
        const distanceFromCenter = Math.sqrt(position.x * position.x + position.z * position.z);
        if (distanceFromCenter + radius > this.roomRadius) {
            return true; // Collision with outer wall
        }

        // Check collisions with furniture and columns
        for (const wall of this.walls) {
            // Convert position to wall's local space
            const localPosition = position.clone().sub(wall.position);
            localPosition.applyQuaternion(wall.quaternion.clone().invert());

            // Simple AABB collision check
            if (Math.abs(localPosition.x) < wall.geometry.parameters.width / 2 + radius &&
                Math.abs(localPosition.y) < wall.geometry.parameters.height / 2 + radius &&
                Math.abs(localPosition.z) < 0.1 + radius) {
                
                // If it's an interactive object, trigger its collision handler
                if (this.interactiveObjects.has(wall)) {
                    this.interactiveObjects.get(wall)();
                }
                return true; // Collision detected
            }
        }
        return false;
    }
} 