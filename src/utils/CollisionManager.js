export class CollisionManager {
    constructor() {
        this.walls = [];
    }

    addWall(wall) {
        this.walls.push(wall);
    }

    checkCollision(position, radius) {
        for (const wall of this.walls) {
            // Convert position to wall's local space
            const localPosition = position.clone().sub(wall.position);
            localPosition.applyQuaternion(wall.quaternion.clone().invert());

            // Simple AABB collision check
            if (Math.abs(localPosition.x) < wall.geometry.parameters.width / 2 + radius &&
                Math.abs(localPosition.y) < wall.geometry.parameters.height / 2 + radius &&
                Math.abs(localPosition.z) < 0.1 + radius) {
                return true; // Collision detected
            }
        }
        return false;
    }
} 