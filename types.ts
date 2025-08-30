export interface PlanetRing {
  innerRadiusFactor: number; // e.g., 1.2 times planet radius
  outerRadiusFactor: number; // e.g., 2.0 times planet radius
  color: string; // Tailwind color for rings, e.g., 'stone-400'
  opacity: number; // Tailwind opacity suffix, e.g., 50 for opacity-50
}

export interface Planet {
  id: string;
  name: string;
  color: string; // Tailwind color name part, e.g., 'blue-500' for fill-blue-500
  radius: number; // Visual radius in pixels
  orbitRadius: number; // Distance from star in pixels
  speed: number; // Angular speed factor
  currentAngle: number; // Current angle in radians
  description: string; // A short description of the planet
  rings?: PlanetRing[]; // Optional: For planets like Saturn
}

export interface Comet {
  id: string;
  name: string;
  color: string; // Color of the comet's head
  radius: number; // Visual radius of the head
  orbitSemiMajorAxis: number; // 'a' in ellipse equation
  orbitSemiMinorAxis: number; // 'b' in ellipse equation
  orbitAngleDegrees: number; // Rotation of the entire elliptical orbit
  speed: number;
  currentAngle: number;
  description: string;
}

export interface Moon {
  id: string;
  name: string;
  color: string;
  radius: number;
  orbitRadius: number; // around its parent planet
  speed: number;
  currentAngle: number;
  parentId: string; // id of the planet it orbits
  description: string;
}

export interface Asteroid {
  id: number;
  orbitRadius: number;
  speed: number;
  currentAngle: number;
  color: string;
  shapePoints: string; // for polygon
  rotation: number;
}

export interface AsteroidBelt {
  id: string;
  name: string;
  description: string;
  innerRadius: number;
  outerRadius: number;
  asteroids: Asteroid[];
}

export interface Star {
  color: string; // Tailwind color name part
  radius: number;
}

// New type for view center
export interface ViewCenter {
  x: number;
  y: number;
}

export type CelestialBody = Planet | Comet | AsteroidBelt | Moon;
