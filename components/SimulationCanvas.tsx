import React, { useMemo } from 'react';
import { Planet, Star, ViewCenter, Comet, Moon, AsteroidBelt } from '../types';
import {
  SIMULATION_AREA_WIDTH,
  SIMULATION_AREA_HEIGHT,
  ORBIT_STROKE_COLOR,
  SELECTED_PLANET_ORBIT_STROKE_COLOR,
  COMET_ORBIT_STROKE_COLOR,
  SELECTED_COMET_ORBIT_STROKE_COLOR,
  MOON_ORBIT_STROKE_COLOR,
  SELECTED_MOON_ORBIT_STROKE_COLOR,
  SELECTED_ASTEROID_BELT_ORBIT_STROKE_COLOR,
  ORBIT_TILT_FACTOR,
  RING_TILT_FACTOR
} from '../constants';

interface SimulationCanvasProps {
  planets: Planet[];
  comet: Comet;
  moons: Moon[];
  asteroidBelt: AsteroidBelt;
  star: Star;
  selectedBodyId: string | null;
  onBodyClick: (bodyId: string, bodyX: number, bodyY: number) => void;
  zoomLevel: number;
  viewCenter: ViewCenter;
  isPanning: boolean;
  onMouseDown: (event: React.MouseEvent<HTMLDivElement>) => void;
  onMouseMove: (event: React.MouseEvent<HTMLDivElement>) => void;
  onMouseUp: (event: React.MouseEvent<HTMLDivElement>) => void;
  onMouseLeave: (event: React.MouseEvent<HTMLDivElement>) => void;
  onWheel: (event: React.WheelEvent<HTMLDivElement>) => void;
}

const SimulationCanvas: React.FC<SimulationCanvasProps> = ({
  planets,
  comet,
  moons,
  asteroidBelt,
  star,
  selectedBodyId,
  onBodyClick,
  zoomLevel,
  viewCenter,
  isPanning,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  onMouseLeave,
  onWheel,
}) => {
  const centerX = SIMULATION_AREA_WIDTH / 2;
  const centerY = SIMULATION_AREA_HEIGHT / 2;

  const viewBoxWidth = SIMULATION_AREA_WIDTH / zoomLevel;
  const viewBoxHeight = SIMULATION_AREA_HEIGHT / zoomLevel;
  const viewBoxMinX = viewCenter.x - viewBoxWidth / 2;
  const viewBoxMinY = viewCenter.y - viewBoxHeight / 2;

  const stars = useMemo(() => {
    const numStars = 200;
    return Array.from({ length: numStars }, () => ({
      cx: Math.random() * SIMULATION_AREA_WIDTH * 1.5 - (SIMULATION_AREA_WIDTH * 0.25), // Spread stars a bit wider than the view
      cy: Math.random() * SIMULATION_AREA_HEIGHT * 1.5 - (SIMULATION_AREA_HEIGHT * 0.25),
      r: Math.random() * 0.7 + 0.2,
      animationDuration: `${Math.random() * 8 + 4}s`, // 4s to 12s
      animationDelay: `${Math.random() * 10}s`,
    }));
  }, []);
  
  // Memoize comet position calculation
  const { cometX, cometY } = useMemo(() => {
    const angleRad = comet.currentAngle;
    const orbitAngleRad = comet.orbitAngleDegrees * Math.PI / 180;

    const unrotatedX = comet.orbitSemiMajorAxis * Math.cos(angleRad);
    const unrotatedY = comet.orbitSemiMinorAxis * Math.sin(angleRad);
    
    const rotatedX = unrotatedX * Math.cos(orbitAngleRad) - unrotatedY * Math.sin(orbitAngleRad);
    const rotatedY = unrotatedX * Math.sin(orbitAngleRad) + unrotatedY * Math.cos(orbitAngleRad);

    return { cometX: centerX + rotatedX, cometY: centerY + rotatedY };
  }, [comet, centerX, centerY]);

  return (
    <div
      className="relative flex justify-center items-center bg-black rounded-lg shadow-2xl overflow-hidden w-full max-w-4xl mx-auto aspect-[4/3]"
      style={{
        maxWidth: `${SIMULATION_AREA_WIDTH}px`,
        maxHeight: `${SIMULATION_AREA_HEIGHT}px`,
        cursor: selectedBodyId ? 'zoom-out' : isPanning ? 'grabbing' : 'grab',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && selectedBodyId) {
          onBodyClick(selectedBodyId, centerX, centerY);
        }
      }}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseLeave}
      onWheel={onWheel}
      title={selectedBodyId ? "Click to unzoom" : "Click and drag to pan, scroll to zoom"}
    >
      <svg
        width="100%"
        height="100%"
        viewBox={`${viewBoxMinX} ${viewBoxMinY} ${viewBoxWidth} ${viewBoxHeight}`}
        aria-label="Planetary system simulation with tilted orbits and zoom capability"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <filter id="starGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="5" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          <filter id="planetHighlight" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="rgba(255,255,255,0.7)" />
          </filter>
          <radialGradient id="planetShadeGradient" cx="0.35" cy="0.35" r="0.75" fx="0.25" fy="0.25">
            <stop offset="0%" stopColor="white" stopOpacity="0.15" />
            <stop offset="40%" stopColor="black" stopOpacity="0.05" />
            <stop offset="100%" stopColor="black" stopOpacity="0.45" />
          </radialGradient>
        </defs>
        
        {/* Starfield Background */}
        <g id="star-background" aria-hidden="true">
          {stars.map((s, i) => (
            <circle
              key={`star-${i}`}
              cx={s.cx}
              cy={s.cy}
              r={s.r / Math.sqrt(zoomLevel)} // Make stars appear smaller as you zoom in
              className="fill-gray-300 twinkling-star"
              style={{
                animationDuration: s.animationDuration,
                animationDelay: s.animationDelay,
              }}
            />
          ))}
        </g>

        {/* --- Asteroid Belt --- */}
        <ellipse
          cx={centerX}
          cy={centerY}
          rx={(asteroidBelt.innerRadius + asteroidBelt.outerRadius) / 2}
          ry={(asteroidBelt.innerRadius + asteroidBelt.outerRadius) / 2 * ORBIT_TILT_FACTOR}
          className="fill-transparent stroke-transparent cursor-pointer"
          strokeWidth={(asteroidBelt.outerRadius - asteroidBelt.innerRadius)}
          onClick={(e) => { e.stopPropagation(); onBodyClick(asteroidBelt.id, centerX, centerY); }}
          aria-label={asteroidBelt.name}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onBodyClick(asteroidBelt.id, centerX, centerY); }}
        />
        <g id="asteroid-belt" aria-label="Asteroid belt particles" aria-hidden="true">
          {asteroidBelt.asteroids.map((asteroid) => {
            const asteroidX = centerX + asteroid.orbitRadius * Math.cos(asteroid.currentAngle);
            const asteroidY = centerY + asteroid.orbitRadius * ORBIT_TILT_FACTOR * Math.sin(asteroid.currentAngle);
            return (
              <g key={`asteroid-${asteroid.id}`} transform={`translate(${asteroidX}, ${asteroidY})`}>
                <polygon
                  points={asteroid.shapePoints}
                  transform={`rotate(${asteroid.rotation})`}
                  className={`fill-${asteroid.color}`}
                  style={{ pointerEvents: 'none' }}
                />
              </g>
            );
          })}
        </g>
        {selectedBodyId === asteroidBelt.id && (
          <g aria-hidden="true">
            <ellipse cx={centerX} cy={centerY} rx={asteroidBelt.innerRadius} ry={asteroidBelt.innerRadius * ORBIT_TILT_FACTOR} className={`fill-none ${SELECTED_ASTEROID_BELT_ORBIT_STROKE_COLOR}`} strokeWidth={1 / zoomLevel} strokeDasharray="3 3"/>
            <ellipse cx={centerX} cy={centerY} rx={asteroidBelt.outerRadius} ry={asteroidBelt.outerRadius * ORBIT_TILT_FACTOR} className={`fill-none ${SELECTED_ASTEROID_BELT_ORBIT_STROKE_COLOR}`} strokeWidth={1 / zoomLevel} strokeDasharray="3 3"/>
          </g>
        )}

        <circle
          cx={centerX}
          cy={centerY}
          r={star.radius}
          className={`fill-${star.color} shadow-lg`}
          filter="url(#starGlow)"
        />

        {/* Comet Orbit */}
        <ellipse
            cx={centerX}
            cy={centerY}
            rx={comet.orbitSemiMajorAxis}
            ry={comet.orbitSemiMinorAxis}
            transform={`rotate(${comet.orbitAngleDegrees} ${centerX} ${centerY})`}
            className={`fill-none ${selectedBodyId === comet.id ? SELECTED_COMET_ORBIT_STROKE_COLOR : COMET_ORBIT_STROKE_COLOR} transition-all duration-300`}
            strokeWidth={selectedBodyId === comet.id ? 1.5 / zoomLevel : 0.5 / zoomLevel }
            strokeDasharray={selectedBodyId === comet.id ? "4 4" : "2 2"}
            aria-hidden="true"
        />

        {planets.map((planet) => {
          const planetX = centerX + planet.orbitRadius * Math.cos(planet.currentAngle);
          const planetY = centerY + planet.orbitRadius * ORBIT_TILT_FACTOR * Math.sin(planet.currentAngle);
          const isSelected = planet.id === selectedBodyId;

          if (planet.id === 'saturn' && planet.rings) {
            // Special rendering for Saturn
            return (
              <g key={planet.id} aria-label={`Orbit and planet ${planet.name}`}>
                <ellipse
                  cx={centerX}
                  cy={centerY}
                  rx={planet.orbitRadius}
                  ry={planet.orbitRadius * ORBIT_TILT_FACTOR}
                  className={`fill-none ${isSelected ? SELECTED_PLANET_ORBIT_STROKE_COLOR : ORBIT_STROKE_COLOR} transition-all duration-300`}
                  strokeWidth={isSelected ? 1.5 / zoomLevel : 0.5 / zoomLevel }
                  strokeDasharray={isSelected ? "4 4" : "2 2"}
                  aria-hidden="true"
                />
                <g
                  transform={`translate(${planetX}, ${planetY})`}
                  onClick={(e) => {
                      e.stopPropagation();
                      onBodyClick(planet.id, planetX, planetY);
                  }}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onBodyClick(planet.id, planetX, planetY); }}
                  className="cursor-pointer" role="button" tabIndex={0}
                  aria-label={planet.name + (isSelected ? ", selected and focused" : "")}
                >
                  {planet.rings.map((ring, index) => {
                    const midRx = planet.radius * (ring.innerRadiusFactor + ring.outerRadiusFactor) / 2;
                    const midRy = midRx * RING_TILT_FACTOR;
                    const ringStrokeWidth = planet.radius * (ring.outerRadiusFactor - ring.innerRadiusFactor);
                    return (
                      <ellipse key={`${planet.id}-ring-${index}`} cx={0} cy={0} rx={midRx} ry={midRy} className={`fill-none stroke-${ring.color} opacity-${ring.opacity}`} strokeWidth={ringStrokeWidth / (isSelected ? Math.max(1, zoomLevel / 1.5) : 1) } aria-hidden="true"/>
                    );
                  })}
                  <circle cx={0} cy={0} r={planet.radius} className={`fill-${planet.color} transition-all duration-200 hover:brightness-125`} stroke={isSelected ? 'white' : 'none'} strokeWidth={isSelected ? 1.5 / zoomLevel : 0} filter={isSelected ? "url(#planetHighlight)" : ""}/>
                  <circle cx={0} cy={0} r={planet.radius} fill="url(#planetShadeGradient)" style={{ pointerEvents: 'none' }} aria-hidden="true"/>
                </g>
              </g>
            );
          } else {
            // Standard rendering for other planets
            return (
              <g key={planet.id} aria-label={`Orbit and planet ${planet.name}`}>
                <ellipse cx={centerX} cy={centerY} rx={planet.orbitRadius} ry={planet.orbitRadius * ORBIT_TILT_FACTOR} className={`fill-none ${isSelected ? SELECTED_PLANET_ORBIT_STROKE_COLOR : ORBIT_STROKE_COLOR} transition-all duration-300`} strokeWidth={isSelected ? 1.5 / zoomLevel : 0.5 / zoomLevel } strokeDasharray={isSelected ? "4 4" : "2 2"} aria-hidden="true"/>
                <g transform={`translate(${planetX}, ${planetY})`} onClick={(e) => { e.stopPropagation(); onBodyClick(planet.id, planetX, planetY); }} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onBodyClick(planet.id, planetX, planetY); }} className="cursor-pointer" role="button" tabIndex={0} aria-label={planet.name + (isSelected ? ", selected and focused" : "")}>
                    <circle cx={0} cy={0} r={planet.radius} className={`fill-${planet.color} transition-all duration-200 hover:brightness-125`} stroke={isSelected ? 'white' : 'none'} strokeWidth={isSelected ? 1.5 / zoomLevel : 0} filter={isSelected ? "url(#planetHighlight)" : ""}/>
                    <circle cx={0} cy={0} r={planet.radius} fill="url(#planetShadeGradient)" style={{ pointerEvents: 'none' }} aria-hidden="true"/>
                </g>
              </g>
            );
          }
        })}
        
        {/* Moons */}
        {moons.map(moon => {
          const parentPlanet = planets.find(p => p.id === moon.parentId);
          if (!parentPlanet) return null;

          const parentX = centerX + parentPlanet.orbitRadius * Math.cos(parentPlanet.currentAngle);
          const parentY = centerY + parentPlanet.orbitRadius * ORBIT_TILT_FACTOR * Math.sin(parentPlanet.currentAngle);
          
          const moonX = parentX + moon.orbitRadius * Math.cos(moon.currentAngle);
          const moonY = parentY + moon.orbitRadius * ORBIT_TILT_FACTOR * Math.sin(moon.currentAngle);
          const isSelected = moon.id === selectedBodyId;

          return (
            <g key={moon.id} aria-label={`Orbit and moon ${moon.name}`}>
                <ellipse cx={parentX} cy={parentY} rx={moon.orbitRadius} ry={moon.orbitRadius * ORBIT_TILT_FACTOR} className={`fill-none ${isSelected ? SELECTED_MOON_ORBIT_STROKE_COLOR : MOON_ORBIT_STROKE_COLOR} transition-all duration-300`} strokeWidth={0.5 / zoomLevel} strokeDasharray="2 2" />
                <g transform={`translate(${moonX}, ${moonY})`} onClick={(e) => { e.stopPropagation(); onBodyClick(moon.id, moonX, moonY); }} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onBodyClick(moon.id, moonX, moonY); }} className="cursor-pointer" role="button" tabIndex={0} aria-label={`${moon.name}${isSelected ? ", selected and focused" : ""}`}>
                  <circle cx={0} cy={0} r={moon.radius} className={`fill-${moon.color}`} stroke={isSelected ? 'white' : 'none'} strokeWidth={isSelected ? 1 / zoomLevel : 0} filter={isSelected ? "url(#planetHighlight)" : ""}/>
                </g>
            </g>
          );
        })}
        
        {/* Comet Body and Tail */}
        <g
            transform={`translate(${cometX}, ${cometY})`}
            onClick={(e) => { e.stopPropagation(); onBodyClick(comet.id, cometX, cometY); }}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onBodyClick(comet.id, cometX, cometY); }}
            className="cursor-pointer" role="button" tabIndex={0}
            aria-label={`${comet.name}${selectedBodyId === comet.id ? ", selected and focused" : ""}`}
        >
            {(() => {
                const vecX = cometX - centerX;
                const vecY = cometY - centerY;
                const dist = Math.sqrt(vecX * vecX + vecY * vecY);
                if (dist < 1) return null;

                const maxDist = comet.orbitSemiMajorAxis;
                const minDist = comet.orbitSemiMinorAxis;
                const intensity = Math.max(0, Math.min(1, (dist - minDist) / (maxDist - minDist)));
                const maxTailLength = 160 / Math.sqrt(zoomLevel);
                const maxFillOpacity = 0.7;
                const tailLength = maxTailLength * (intensity * intensity);
                const tailFillOpacity = maxFillOpacity * intensity;

                if (tailLength < 2) return null;

                const ux = vecX / dist;
                const uy = vecY / dist;

                const tailTipX = -ux * tailLength;
                const tailTipY = -uy * tailLength;

                const baseWidth = comet.radius * 1.5;
                const base1X = -uy * baseWidth;
                const base1Y = ux * baseWidth;
                const base2X = uy * baseWidth;
                const base2Y = -ux * baseWidth;
                
                const perpX = -uy;
                const perpY = ux;
                const curveFactor = 15 / Math.sqrt(zoomLevel);
                const controlX = tailTipX / 2 + perpX * curveFactor;
                const controlY = tailTipY / 2 + perpY * curveFactor;

                const pathData = `M ${base1X},${base1Y} L ${base2X},${base2Y} Q ${controlX},${controlY} ${tailTipX},${tailTipY} Z`;

                return (
                    <path
                        d={pathData}
                        className={`fill-${comet.color}`}
                        style={{
                            fillOpacity: tailFillOpacity,
                            transition: 'all 100ms linear'
                        }}
                        stroke="none"
                        aria-hidden="true"
                    />
                );
            })()}
            <circle
                cx={0}
                cy={0}
                r={comet.radius}
                className={`fill-${comet.color}`}
                stroke={selectedBodyId === comet.id ? 'white' : 'none'}
                strokeWidth={selectedBodyId === comet.id ? 1.5 / zoomLevel : 0}
                filter={selectedBodyId === comet.id ? "url(#planetHighlight)" : ""}
            />
        </g>
      </svg>
    </div>
  );
};

export default SimulationCanvas;