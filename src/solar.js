// NOAA fractional-year solar position, geometric elevation (no refraction).
// https://gml.noaa.gov/grad/solcalc/solareqns.PDF
export const SOLAR_SITE = Object.freeze({latitude:55.03,longitude:82.92,utcOffset:7,year:2026,month:6,day:15});
export const DAYLIGHT_MONTHS=Object.freeze([{month:5,name:'Май',dateLabel:'15 мая'},{month:6,name:'Июнь',dateLabel:'15 июня'},{month:7,name:'Июль',dateLabel:'15 июля'},{month:9,name:'Сентябрь',dateLabel:'15 сентября'}]);
export const DAYLIGHT_TIMES = Object.freeze(['10:00','12:00','14:00','16:00','18:00','20:00']);
// North is screen-up in the user's supplied overview, not the default camera.
// Recovered from eight room-label anchors on Y=.12 (homography fit residual <2px).
// See ../Проверка дневного света/Привязка севера.json for calibration provenance.
export const NORTH = Object.freeze({x:-.6612788491851052,z:-.750140175980745});
const rad=Math.PI/180;
export function solarPosition(time,site=SOLAR_SITE){
 if(!DAYLIGHT_TIMES.includes(time))throw new RangeError('Unsupported daylight time');
 const [hour,minute]=time.split(':').map(Number);
 const {latitude,longitude,utcOffset,year,month,day}=site;
 const doy=(Date.UTC(year,month-1,day)-Date.UTC(year,0,1))/86400000+1;
 const days=(Date.UTC(year+1,0,1)-Date.UTC(year,0,1))/86400000;
 const gamma=2*Math.PI/days*(doy-1+(hour+minute/60-12)/24);
 const eq=229.18*(.000075+.001868*Math.cos(gamma)-.032077*Math.sin(gamma)-.014615*Math.cos(2*gamma)-.040849*Math.sin(2*gamma));
 const dec=.006918-.399912*Math.cos(gamma)+.070257*Math.sin(gamma)-.006758*Math.cos(2*gamma)+.000907*Math.sin(2*gamma)-.002697*Math.cos(3*gamma)+.00148*Math.sin(3*gamma);
 const solarMinutes=hour*60+minute+eq+4*longitude-60*utcOffset;
 const ha=(solarMinutes/4-180)*rad,lat=latitude*rad;
 const elevation=Math.asin(Math.max(-1,Math.min(1,Math.sin(lat)*Math.sin(dec)+Math.cos(lat)*Math.cos(dec)*Math.cos(ha))));
 const azimuth=(Math.atan2(Math.sin(ha),Math.cos(ha)*Math.sin(lat)-Math.tan(dec)*Math.cos(lat))/rad+180+360)%360;
 const az=azimuth*rad,cosEl=Math.cos(elevation);
 const east={x:-NORTH.z,z:NORTH.x};
 return {time,month,day,azimuth,elevation:elevation/rad,direction:{x:cosEl*(NORTH.x*Math.cos(az)+east.x*Math.sin(az)),y:Math.sin(elevation),z:cosEl*(NORTH.z*Math.cos(az)+east.z*Math.sin(az))},shadowPerMetre:elevation>0?1/Math.tan(elevation):null};
}
