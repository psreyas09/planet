import React, { useState } from 'react';
import { Planet, Comet, Moon, AsteroidBelt, CelestialBody } from '../types';
import { ChevronDownIcon, ChevronUpIcon } from './Icons';

interface PlanetInfoPanelProps {
  body: CelestialBody | null;
}

const DetailItem: React.FC<{ label: string; value: string | number; unit?: string }> = ({ label, value, unit }) => (
  <div className="flex justify-between py-2 border-b border-gray-700 last:border-b-0">
    <span className="text-gray-400">{label}:</span>
    <span className="text-gray-100 font-medium">{value} {unit}</span>
  </div>
);

const PlanetInfoPanel: React.FC<PlanetInfoPanelProps> = ({ body }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!body) {
    return (
      <div className="w-full max-w-md mx-auto mt-4 p-6 bg-gray-800 text-gray-400 rounded-lg shadow-xl text-center" role="status">
        Click on a celestial body to see its details.
      </div>
    );
  }
  
  const isComet = 'orbitSemiMajorAxis' in body;
  const isMoon = 'parentId' in body;
  const isAsteroidBelt = 'asteroids' in body;
  
  const bodyBaseColor = isAsteroidBelt ? 'yellow' : (body as Planet | Comet | Moon).color.split('-')[0];
  const bodyColor = isAsteroidBelt ? 'yellow-600' : (body as Planet | Comet | Moon).color;


  return (
    <div className="w-full max-w-md mx-auto mt-4 bg-gray-800 rounded-lg shadow-xl overflow-hidden">
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
        aria-controls={`body-details-${body.id}`}
        className="w-full flex justify-between items-center p-4 bg-gray-700 hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500"
      >
        <h2 className={`text-2xl font-bold text-${bodyBaseColor}-400`}>{body.name}</h2>
        {isExpanded ? <ChevronUpIcon className="w-6 h-6 text-gray-300"/> : <ChevronDownIcon className="w-6 h-6 text-gray-300"/>}
        <span className="sr-only">{isExpanded ? 'Collapse' : 'Expand'} details</span>
      </button>
      
      {isExpanded && (
        <div id={`body-details-${body.id}`} className="p-6 space-y-3">
          <div className="flex items-center space-x-4 mb-3">
            {!isAsteroidBelt && (
            <div 
              className={`w-12 h-12 rounded-full bg-${bodyColor} shadow-md flex-shrink-0`} 
              aria-hidden="true"
            >
              {/* Visual representation of rings for Saturn's icon */}
              {body.id === 'saturn' && 'rings' in body && body.rings && (
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  {body.rings.map((ring, index) => (
                     <circle 
                        key={`icon-ring-${index}`}
                        cx="50" cy="50" 
                        r={25 * ((ring.innerRadiusFactor + ring.outerRadiusFactor) / 2) } /* Approximate scale for icon */
                        className={`fill-none stroke-${ring.color} opacity-${ring.opacity}`}
                        strokeWidth={25 * (ring.outerRadiusFactor - ring.innerRadiusFactor) * 0.5} /* Thinner for icon */
                      />
                  ))}
                  <circle cx="50" cy="50" r="25" className={`fill-${bodyColor}`} />
                </svg>
              )}
            </div>
            )}
            <p className="text-gray-300 text-sm leading-relaxed">{body.description}</p>
          </div>

          {isComet ? (
            <>
              <DetailItem label="Visual Radius" value={(body as Comet).radius} unit="px" />
              <DetailItem label="Orbit Semi-Major Axis" value={(body as Comet).orbitSemiMajorAxis} unit="px" />
              <DetailItem label="Orbit Semi-Minor Axis" value={(body as Comet).orbitSemiMinorAxis} unit="px" />
              <DetailItem label="Orbit Angle" value={(body as Comet).orbitAngleDegrees} unit="°" />
              <DetailItem label="Relative Speed Factor" value={body.speed.toFixed(4)} />
              <DetailItem label="Current Angle" value={(body.currentAngle * 180 / Math.PI).toFixed(1)} unit="°" />
            </>
          ) : isMoon ? (
            <>
              <DetailItem label="Visual Radius" value={(body as Moon).radius} unit="px" />
              <DetailItem label="Orbit Radius (around Parent)" value={(body as Moon).orbitRadius} unit="px" />
              <DetailItem label="Relative Speed Factor" value={(body as Moon).speed.toFixed(4)} />
              <DetailItem label="Current Angle" value={(body.currentAngle * 180 / Math.PI).toFixed(1)} unit="°" />
            </>
          ) : isAsteroidBelt ? (
             <>
              <DetailItem label="Inner Orbit Radius" value={(body as AsteroidBelt).innerRadius} unit="px" />
              <DetailItem label="Outer Orbit Radius" value={(body as AsteroidBelt).outerRadius} unit="px" />
              <DetailItem label="Number of Asteroids" value={(body as AsteroidBelt).asteroids.length} />
            </>
          ) : (
            <>
              <DetailItem label="Visual Radius" value={(body as Planet).radius} unit="px" />
              <DetailItem label="Orbit Radius" value={(body as Planet).orbitRadius} unit="px" />
              <DetailItem label="Relative Speed Factor" value={(body as Planet).speed.toFixed(4)} />
              <DetailItem label="Current Angle" value={(body.currentAngle * 180 / Math.PI).toFixed(1)} unit="°" />
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default PlanetInfoPanel;