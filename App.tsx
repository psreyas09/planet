import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Planet, ViewCenter, Comet, Moon, AsteroidBelt, CelestialBody } from './types';
import { 
  INITIAL_PLANETS, 
  INITIAL_COMET,
  INITIAL_MOONS,
  INITIAL_ASTEROID_BELT,
  generateAsteroids,
  STAR_DETAILS, 
  SIMULATION_SPEED_STEP,
  SIMULATION_AREA_WIDTH,
  SIMULATION_AREA_HEIGHT,
  FOCUSED_ZOOM_LEVEL,
  MIN_ZOOM,
  MAX_ZOOM,
  ZOOM_STEP_FACTOR,
  ORBIT_TILT_FACTOR
} from './constants';
import SimulationCanvas from './components/SimulationCanvas';
import ControlsPanel from './components/ControlsPanel';
import PlanetInfoPanel from './components/PlanetInfoPanel';

const App: React.FC = () => {
  const initialViewCenter = { x: SIMULATION_AREA_WIDTH / 2, y: SIMULATION_AREA_HEIGHT / 2 };

  const [planets, setPlanets] = useState<Planet[]>(() => 
    INITIAL_PLANETS.map(p => ({...p, currentAngle: Math.random() * 2 * Math.PI }))
  );
  const [comet, setComet] = useState<Comet>(() => 
    ({...INITIAL_COMET, currentAngle: Math.random() * 2 * Math.PI })
  );
  const [moons, setMoons] = useState<Moon[]>(() => 
    INITIAL_MOONS.map(m => ({...m, currentAngle: Math.random() * 2 * Math.PI}))
  );
  const [asteroidBelt, setAsteroidBelt] = useState<AsteroidBelt>(() => ({...INITIAL_ASTEROID_BELT}));

  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [selectedBodyId, setSelectedBodyId] = useState<string | null>(null);
  const [simulationSpeedMultiplier, setSimulationSpeedMultiplier] = useState<number>(1);

  // === Camera State ===
  // Current, interpolated values for the view
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [viewCenter, setViewCenter] = useState<ViewCenter>(initialViewCenter);
  // Target values that the animation will move towards
  const [targetZoomLevel, setTargetZoomLevel] = useState<number>(1);
  const [targetViewCenter, setTargetViewCenter] = useState<ViewCenter>(initialViewCenter);
  
  const [userPersistedZoomLevel, setUserPersistedZoomLevel] = useState<number>(1);
  const [isPanning, setIsPanning] = useState(false);

  // Refs for animation loop
  const planetsRef = useRef(planets);
  const cometRef = useRef(comet);
  const moonsRef = useRef(moons);
  const asteroidBeltRef = useRef(asteroidBelt);
  const simulationSpeedMultiplierRef = useRef(simulationSpeedMultiplier);
  const selectedBodyIdRef = useRef(selectedBodyId);
  const targetZoomLevelRef = useRef(targetZoomLevel);
  const targetViewCenterRef = useRef(targetViewCenter);
  
  // Effects to keep refs in sync with state
  useEffect(() => { planetsRef.current = planets; }, [planets]);
  useEffect(() => { cometRef.current = comet; }, [comet]);
  useEffect(() => { moonsRef.current = moons; }, [moons]);
  useEffect(() => { asteroidBeltRef.current = asteroidBelt; }, [asteroidBelt]);
  useEffect(() => { simulationSpeedMultiplierRef.current = simulationSpeedMultiplier; }, [simulationSpeedMultiplier]);
  useEffect(() => { selectedBodyIdRef.current = selectedBodyId; }, [selectedBodyId]);
  useEffect(() => { targetZoomLevelRef.current = targetZoomLevel; }, [targetZoomLevel]);
  useEffect(() => { targetViewCenterRef.current = targetViewCenter; }, [targetViewCenter]);
  
  // === Camera Animation Loop ===
  useEffect(() => {
    let animationFrameId: number;
    const animateCamera = () => {
      // Animate View Center
      setViewCenter(currentCenter => {
        const target = targetViewCenterRef.current;
        const dx = target.x - currentCenter.x;
        const dy = target.y - currentCenter.y;

        if (Math.abs(dx) < 0.01 && Math.abs(dy) < 0.01) {
          return target; // Snap to target if very close
        }
        return { x: currentCenter.x + dx * 0.1, y: currentCenter.y + dy * 0.1 };
      });

      // Animate Zoom Level
      setZoomLevel(currentZoom => {
        const target = targetZoomLevelRef.current;
        const dZoom = target - currentZoom;
        if (Math.abs(dZoom) < 0.001) {
          return target; // Snap to target if very close
        }
        return currentZoom + dZoom * 0.1;
      });

      animationFrameId = requestAnimationFrame(animateCamera);
    };
    
    animationFrameId = requestAnimationFrame(animateCamera);
    return () => cancelAnimationFrame(animationFrameId);
  }, []); // This effect runs only once to start the camera animation loop


  // === Physics Simulation Loop ===
  useEffect(() => {
    if (!isRunning) return;

    let animationFrameId: number;
    
    const animate = () => {
      const currentSpeedMultiplier = simulationSpeedMultiplierRef.current;
      const speedDelta = SIMULATION_SPEED_STEP * currentSpeedMultiplier * 50;
      
      const newPlanetsArray = planetsRef.current.map(p => ({
        ...p,
        currentAngle: (p.currentAngle + p.speed * speedDelta) % (2 * Math.PI),
      }));
      setPlanets(newPlanetsArray);
      
      const currentComet = cometRef.current;
      const newComet = {
          ...currentComet,
          currentAngle: (currentComet.currentAngle + currentComet.speed * speedDelta) % (2 * Math.PI),
      };
      setComet(newComet);
      
      const newMoonsArray = moonsRef.current.map(m => ({
        ...m,
        currentAngle: (m.currentAngle + m.speed * speedDelta) % (2 * Math.PI)
      }));
      setMoons(newMoonsArray);

      const currentBelt = asteroidBeltRef.current;
      const newAsteroids = currentBelt.asteroids.map(a => ({
          ...a,
          currentAngle: (a.currentAngle + a.speed * speedDelta) % (2 * Math.PI)
      }));
      setAsteroidBelt({...currentBelt, asteroids: newAsteroids});

      // Update focused view target
      const currentSelectedBodyId = selectedBodyIdRef.current;
      if (currentSelectedBodyId) {
        let newCenter: ViewCenter | null = null;
        
        if (currentSelectedBodyId === newComet.id) {
          const angleRad = newComet.currentAngle;
          const orbitAngleRad = newComet.orbitAngleDegrees * Math.PI / 180;
          const unrotatedX = newComet.orbitSemiMajorAxis * Math.cos(angleRad);
          const unrotatedY = newComet.orbitSemiMinorAxis * Math.sin(angleRad);
          const bodyX = initialViewCenter.x + (unrotatedX * Math.cos(orbitAngleRad) - unrotatedY * Math.sin(orbitAngleRad));
          const bodyY = initialViewCenter.y + (unrotatedX * Math.sin(orbitAngleRad) + unrotatedY * Math.cos(orbitAngleRad));
          newCenter = { x: bodyX, y: bodyY };
        } else if (currentSelectedBodyId === INITIAL_ASTEROID_BELT.id) {
          newCenter = initialViewCenter;
        } else {
          const focusedMoon = newMoonsArray.find(m => m.id === currentSelectedBodyId);
          if (focusedMoon) {
            const parentPlanet = newPlanetsArray.find(p => p.id === focusedMoon.parentId);
            if (parentPlanet) {
              const parentX = initialViewCenter.x + parentPlanet.orbitRadius * Math.cos(parentPlanet.currentAngle);
              const parentY = initialViewCenter.y + parentPlanet.orbitRadius * ORBIT_TILT_FACTOR * Math.sin(parentPlanet.currentAngle);
              const moonX = parentX + focusedMoon.orbitRadius * Math.cos(focusedMoon.currentAngle);
              const moonY = parentY + focusedMoon.orbitRadius * ORBIT_TILT_FACTOR * Math.sin(focusedMoon.currentAngle);
              newCenter = { x: moonX, y: moonY };
            }
          } else {
            const focusedPlanet = newPlanetsArray.find(p => p.id === currentSelectedBodyId);
            if (focusedPlanet) {
              const planetX = initialViewCenter.x + focusedPlanet.orbitRadius * Math.cos(focusedPlanet.currentAngle);
              const planetY = initialViewCenter.y + focusedPlanet.orbitRadius * ORBIT_TILT_FACTOR * Math.sin(focusedPlanet.currentAngle);
              newCenter = { x: planetX, y: planetY };
            }
          }
        }

        if (newCenter) {
            setTargetViewCenter(newCenter); // Update the target for the camera to follow
        }
      }
      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isRunning, initialViewCenter.x, initialViewCenter.y]); 

  const handleTogglePlayPause = useCallback(() => setIsRunning(prev => !prev), []);

  const handleFullReset = useCallback(() => {
    setPlanets(INITIAL_PLANETS.map(p => ({...p, currentAngle: Math.random() * 2 * Math.PI })));
    setComet({...INITIAL_COMET, currentAngle: Math.random() * 2 * Math.PI });
    setMoons(INITIAL_MOONS.map(m => ({...m, currentAngle: Math.random() * 2 * Math.PI})));
    setAsteroidBelt({...INITIAL_ASTEROID_BELT, asteroids: generateAsteroids(300, INITIAL_ASTEROID_BELT.innerRadius, INITIAL_ASTEROID_BELT.outerRadius) });
    setSelectedBodyId(null);
    setIsRunning(true);
    setSimulationSpeedMultiplier(1);
    
    // Reset both current and target to prevent animation
    setZoomLevel(1);
    setTargetZoomLevel(1);
    setUserPersistedZoomLevel(1);
    setViewCenter(initialViewCenter);
    setTargetViewCenter(initialViewCenter);
  }, [initialViewCenter]);

  const handleBodyClick = useCallback((bodyId: string, bodyX: number, bodyY: number) => {
    if (selectedBodyIdRef.current === bodyId) {
      setSelectedBodyId(null);
      setTargetZoomLevel(userPersistedZoomLevel);
      setTargetViewCenter(initialViewCenter);
    } else {
      if (selectedBodyIdRef.current === null) {
        setUserPersistedZoomLevel(zoomLevel);
      }
      setSelectedBodyId(bodyId);
      
      if (bodyId === INITIAL_ASTEROID_BELT.id) {
        setTargetZoomLevel(0.8);
        setTargetViewCenter(initialViewCenter);
      } else {
        setTargetZoomLevel(FOCUSED_ZOOM_LEVEL);
        setTargetViewCenter({ x: bodyX, y: bodyY });
      }
    }
  }, [zoomLevel, userPersistedZoomLevel, initialViewCenter]);

  const handleSpeedChange = useCallback((newSpeed: number) => setSimulationSpeedMultiplier(newSpeed), []);

  const handleZoomIn = useCallback(() => {
    if (selectedBodyIdRef.current) return;
    setTargetZoomLevel(prevZoom => {
      const newZoom = Math.min(prevZoom * ZOOM_STEP_FACTOR, MAX_ZOOM);
      setUserPersistedZoomLevel(newZoom);
      return newZoom;
    });
  }, []);

  const handleZoomOut = useCallback(() => {
    if (selectedBodyIdRef.current) return;
    setTargetZoomLevel(prevZoom => {
      const newZoom = Math.max(prevZoom / ZOOM_STEP_FACTOR, MIN_ZOOM);
      setUserPersistedZoomLevel(newZoom);
      return newZoom;
    });
  }, []);

  const handleResetZoom = useCallback(() => { 
    setSelectedBodyId(null);
    setTargetZoomLevel(1);
    setUserPersistedZoomLevel(1);
    setTargetViewCenter(initialViewCenter);
  }, [initialViewCenter]);
  
  // Panning and direct zoom handlers
  const lastMousePositionRef = useRef<{ x: number; y: number } | null>(null);

  const handleMouseDown = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    if (selectedBodyIdRef.current) return;
    event.preventDefault();
    setIsPanning(true);
    lastMousePositionRef.current = { x: event.clientX, y: event.clientY };
  }, []);

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
    lastMousePositionRef.current = null;
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsPanning(false);
    lastMousePositionRef.current = null;
  }, []);

  const handleMouseMove = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    if (!isPanning || !lastMousePositionRef.current) return;
    event.preventDefault();
    const dx = event.clientX - lastMousePositionRef.current.x;
    const dy = event.clientY - lastMousePositionRef.current.y;
    lastMousePositionRef.current = { x: event.clientX, y: event.clientY };

    setTargetViewCenter(prevCenter => ({
      x: prevCenter.x - dx / zoomLevel,
      y: prevCenter.y - dy / zoomLevel,
    }));
  }, [isPanning, zoomLevel]);

  const handleWheel = useCallback((event: React.WheelEvent<HTMLDivElement>) => {
    if (selectedBodyIdRef.current) return;
    event.preventDefault();

    const rect = event.currentTarget.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    setTargetZoomLevel(prevTargetZoom => {
      const currentZoomForCalc = zoomLevel; // Use current animated value for accuracy
      const newZoom = event.deltaY < 0
        ? Math.min(prevTargetZoom * ZOOM_STEP_FACTOR, MAX_ZOOM)
        : Math.max(prevTargetZoom / ZOOM_STEP_FACTOR, MIN_ZOOM);

      if (Math.abs(newZoom - prevTargetZoom) < 0.001) {
        return prevTargetZoom;
      }
      
      setTargetViewCenter(prevTargetCenter => {
        const currentCenterForCalc = viewCenter;
        const worldX = currentCenterForCalc.x - (SIMULATION_AREA_WIDTH / currentZoomForCalc) * (0.5 - mouseX / rect.width);
        const worldY = currentCenterForCalc.y - (SIMULATION_AREA_HEIGHT / currentZoomForCalc) * (0.5 - mouseY / rect.height);
        
        const newViewCenterX = worldX + (SIMULATION_AREA_WIDTH / newZoom) * (0.5 - mouseX / rect.width);
        const newViewCenterY = worldY + (SIMULATION_AREA_HEIGHT / newZoom) * (0.5 - mouseY / rect.height);

        return { x: newViewCenterX, y: newViewCenterY };
      });
      
      setUserPersistedZoomLevel(newZoom);
      return newZoom;
    });
  }, [zoomLevel, viewCenter]);

  const selectedBodyDetails: CelestialBody | null =
    planets.find(p => p.id === selectedBodyId) ||
    (comet.id === selectedBodyId ? comet : null) ||
    moons.find(m => m.id === selectedBodyId) ||
    (asteroidBelt.id === selectedBodyId ? asteroidBelt : null);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center py-8 px-4 space-y-6">
      <header className="text-center">
        <h1 className="text-4xl font-bold text-sky-400 tracking-tight">Planetary Orbit Simulator</h1>
        <p className="text-lg text-gray-400 mt-1">Explore a mini solar system. Click on celestial bodies to focus!</p>
      </header>
      
      <main className="w-full flex flex-col items-center space-y-6">
        <SimulationCanvas
          planets={planets}
          comet={comet}
          moons={moons}
          asteroidBelt={asteroidBelt}
          star={STAR_DETAILS}
          selectedBodyId={selectedBodyId}
          onBodyClick={handleBodyClick}
          zoomLevel={zoomLevel}
          viewCenter={viewCenter}
          isPanning={isPanning}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onWheel={handleWheel}
        />
        <ControlsPanel
          isRunning={isRunning}
          simulationSpeed={simulationSpeedMultiplier}
          onTogglePlayPause={handleTogglePlayPause}
          onReset={handleFullReset}
          onSpeedChange={handleSpeedChange}
          zoomLevel={zoomLevel}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onResetZoom={handleResetZoom}
          isBodyFocused={selectedBodyId !== null}
        />
        <PlanetInfoPanel body={selectedBodyDetails} />
      </main>
      <footer className="mt-auto pt-8 text-center text-gray-500 text-sm">
        <p>&copy; {new Date().getFullYear()} Interactive Planetary Simulation. Built with React & Tailwind CSS.</p>
      </footer>
    </div>
  );
};

export default App;
