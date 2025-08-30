import { Planet, Star, Comet, Moon, Asteroid, AsteroidBelt } from './types';

export const SIMULATION_AREA_WIDTH = 800;
export const SIMULATION_AREA_HEIGHT = 600;

export const STAR_DETAILS: Star = {
  color: 'yellow-400',
  radius: 20,
};

export const ORBIT_TILT_FACTOR = 0.4; // Value between 0 (flat line) and 1 (circle). 0.4 gives a good elliptical feel.
export const RING_TILT_FACTOR = 0.35; // Specific tilt for Saturn's rings for a more "3D" look.

export const INITIAL_PLANETS: Planet[] = [
  { 
    id: 'mercury', 
    name: 'Mercury', 
    color: 'gray-400', 
    radius: 3, 
    orbitRadius: 45,
    speed: 0.047,
    currentAngle: Math.random() * 2 * Math.PI,
    description: "The smallest planet and nearest to the Sun, Mercury is only slightly larger than Earth's Moon."
  },
  { 
    id: 'venus', 
    name: 'Venus', 
    color: 'yellow-200', 
    radius: 6, 
    orbitRadius: 70,
    speed: 0.025,
    currentAngle: Math.random() * 2 * Math.PI,
    description: "Venus has a thick, toxic atmosphere that traps heat, making it the hottest planet in our solar system."
  },
  { 
    id: 'earth', 
    name: 'Earth', 
    color: 'blue-500', 
    radius: 7, 
    orbitRadius: 95,
    speed: 0.015,
    currentAngle: Math.random() * 2 * Math.PI,
    description: "Our home, Earth is the only planet known to harbor life, with liquid water on its surface."
  },
  { 
    id: 'mars', 
    name: 'Mars', 
    color: 'red-600', 
    radius: 5, 
    orbitRadius: 130,
    speed: 0.0090,
    currentAngle: Math.random() * 2 * Math.PI,
    description: "Mars is a cold, desert world with a thin atmosphere and evidence of ancient water."
  },
  {
    id: 'jupiter',
    name: 'Jupiter',
    color: 'orange-400',
    radius: 16,
    orbitRadius: 180,
    speed: 0.0055,
    currentAngle: Math.random() * 2 * Math.PI,
    description: "Jupiter is the largest planet, a gas giant known for its Great Red Spot, a long-lived storm."
  },
  {
    id: 'saturn',
    name: 'Saturn',
    color: 'amber-400',
    radius: 13,
    orbitRadius: 225,
    speed: 0.0039,
    currentAngle: Math.random() * 2 * Math.PI,
    description: "Known for its stunning rings, Saturn is the sixth planet and second largest in the solar system.",
    rings: [ // Enhanced ring definition
      // Inner C Ring (fainter, wider)
      { innerRadiusFactor: 1.1, outerRadiusFactor: 1.45, color: 'stone-500', opacity: 20 },
      // B Ring (bright, dense) - Main and brightest part
      { innerRadiusFactor: 1.5, outerRadiusFactor: 1.85, color: 'stone-300', opacity: 75 },
      // Cassini Division hint (slight gap or darker transition)
      // A Ring (bright, slightly less dense than B)
      { innerRadiusFactor: 1.9, outerRadiusFactor: 2.25, color: 'stone-400', opacity: 60 },
      // Fainter outer edge / Encke Gap area (subtle)
      { innerRadiusFactor: 2.28, outerRadiusFactor: 2.35, color: 'stone-500', opacity: 30 }
    ]
  },
  {
    id: 'uranus',
    name: 'Uranus',
    color: 'cyan-400',
    radius: 10,
    orbitRadius: 260,
    speed: 0.0028,
    currentAngle: Math.random() * 2 * Math.PI,
    description: "An ice giant, Uranus is the seventh planet and has a unique tilt, orbiting the Sun on its side."
  },
  {
    id: 'neptune',
    name: 'Neptune',
    color: 'blue-700',
    radius: 9,
    orbitRadius: 290,
    speed: 0.0022,
    currentAngle: Math.random() * 2 * Math.PI,
    description: "The eighth and most distant major planet, Neptune is a dark, cold, and very windy ice giant."
  }
];

export const INITIAL_COMET: Comet = {
  id: 'halley',
  name: 'Halley\'s Comet',
  color: 'cyan-200',
  radius: 4,
  orbitSemiMajorAxis: 280,
  orbitSemiMinorAxis: 100,
  orbitAngleDegrees: 35,
  speed: 0.004,
  currentAngle: Math.random() * 2 * Math.PI,
  description: "A famous short-period comet visible from Earth every 75–79 years. It has a highly elliptical, tilted orbit."
};

export const INITIAL_MOONS: Moon[] = [
  // Earth's Moon
  {
    id: 'the_moon',
    name: 'The Moon',
    color: 'gray-300',
    radius: 2,
    orbitRadius: 12, // Orbit around Earth
    speed: 0.1, // Faster orbit around Earth
    currentAngle: Math.random() * 2 * Math.PI,
    parentId: 'earth',
    description: "Earth's only natural satellite, it is the fifth largest satellite in the Solar System."
  },
  // Jupiter's Galilean Moons
  {
    id: 'io',
    name: 'Io',
    color: 'yellow-300',
    radius: 2.5,
    orbitRadius: 25,
    speed: 0.22,
    currentAngle: Math.random() * 2 * Math.PI,
    parentId: 'jupiter',
    description: "The most volcanically active body in the solar system, Io is caught in a gravitational tug-of-war with Jupiter."
  },
  {
    id: 'europa',
    name: 'Europa',
    color: 'stone-200',
    radius: 2.2,
    orbitRadius: 32,
    speed: 0.11,
    currentAngle: Math.random() * 2 * Math.PI,
    parentId: 'jupiter',
    description: "A frozen world with a subsurface ocean that could potentially harbor life. Its surface is crisscrossed by cracks and streaks."
  },
  {
    id: 'ganymede',
    name: 'Ganymede',
    color: 'slate-400',
    radius: 3.5,
    orbitRadius: 40,
    speed: 0.055,
    currentAngle: Math.random() * 2 * Math.PI,
    parentId: 'jupiter',
    description: "The largest moon in the solar system, bigger than the planet Mercury. It's the only moon known to have its own magnetic field."
  },
  {
    id: 'callisto',
    name: 'Callisto',
    color: 'gray-500',
    radius: 3.3,
    orbitRadius: 50,
    speed: 0.027,
    currentAngle: Math.random() * 2 * Math.PI,
    parentId: 'jupiter',
    description: "One of the most heavily cratered objects in the solar system, indicating a very old and inactive surface."
  },
  // Saturn's Moon
  {
    id: 'titan',
    name: 'Titan',
    color: 'orange-300',
    radius: 3.5,
    orbitRadius: 30, // Orbit outside the rings
    speed: 0.04,
    currentAngle: Math.random() * 2 * Math.PI,
    parentId: 'saturn',
    description: "The second-largest moon in the solar system, with a thick nitrogen-rich atmosphere and lakes of liquid methane."
  }
];

const ASTEROID_COLORS = ['gray-400', 'gray-500', 'gray-600', 'stone-500'];

const generateRockShape = (radius: number): string => {
  const points = [];
  const numVertices = 6 + Math.floor(Math.random() * 3); // 6 to 8 vertices
  for (let i = 0; i < numVertices; i++) {
    const angle = (i / numVertices) * 2 * Math.PI;
    const distance = radius * (0.8 + Math.random() * 0.4); // 80% to 120% of radius
    const x = distance * Math.cos(angle);
    const y = distance * Math.sin(angle);
    points.push(`${x.toFixed(2)},${y.toFixed(2)}`);
  }
  return points.join(' ');
};

export const generateAsteroids = (count: number, innerRadius: number, outerRadius: number): Asteroid[] => {
  const asteroids: Asteroid[] = [];
  for (let i = 0; i < count; i++) {
    const orbitRadius = innerRadius + Math.random() * (outerRadius - innerRadius);
    const speedFactor = 1 / Math.sqrt(orbitRadius); // Slower further out
    asteroids.push({
      id: i,
      orbitRadius: orbitRadius,
      speed: 0.006 + speedFactor * 0.003,
      currentAngle: Math.random() * 2 * Math.PI,
      color: ASTEROID_COLORS[Math.floor(Math.random() * ASTEROID_COLORS.length)],
      shapePoints: generateRockShape(0.5 + Math.random() * 0.8), // radius as base for shape
      rotation: Math.random() * 360,
    });
  }
  return asteroids;
};

export const INITIAL_ASTEROID_BELT: AsteroidBelt = {
  id: 'asteroid_belt',
  name: 'The Asteroid Belt',
  description: 'A torus-shaped region in the Solar System, located roughly between the orbits of the planets Jupiter and Mars.',
  innerRadius: 145,
  outerRadius: 165,
  asteroids: generateAsteroids(300, 145, 165)
};


export const ORBIT_STROKE_COLOR = 'stroke-gray-700';
export const SELECTED_PLANET_ORBIT_STROKE_COLOR = 'stroke-sky-400';
export const COMET_ORBIT_STROKE_COLOR = 'stroke-cyan-600';
export const SELECTED_COMET_ORBIT_STROKE_COLOR = 'stroke-cyan-300';
export const MOON_ORBIT_STROKE_COLOR = 'stroke-gray-500';
export const SELECTED_MOON_ORBIT_STROKE_COLOR = 'stroke-sky-300';
export const ASTEROID_BELT_ORBIT_STROKE_COLOR = 'stroke-yellow-700';
export const SELECTED_ASTEROID_BELT_ORBIT_STROKE_COLOR = 'stroke-yellow-400';
export const PLANET_LABEL_COLOR = 'text-gray-300';
export const SIMULATION_SPEED_STEP = 0.002;

// Zoom related constants
export const FOCUSED_ZOOM_LEVEL = 4; // Zoom level when a planet is focused
export const MIN_ZOOM = 0.25;         // Minimum general zoom level
export const MAX_ZOOM = 8;          // Maximum general zoom level
export const ZOOM_STEP_FACTOR = 1.25; // Factor to multiply/divide by for zoom steps