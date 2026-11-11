/* SmRF Mini compact single-QR health report v3.
 * C firmware encoder: src/smrf-qr-control-history.c
 * URL fragment only; no network/API requests for measurement data.
 * CRC detects errors but does not authenticate the Mini.
 */
(function(root){
'use strict';
function crc16(bytes,len){
  let c=65535;
  for(let i=0;i<len;i++){
    c^=bytes[i]<<8;
    for(let j=0;j<8;j++)c=(c&0x8000)?((c<<1)^0x1021)&65535:(c<<1)&65535;
  }
  return c;
}
function decode(fragment){
  if(typeof fragment!=='string'||!/^[A-Za-z0-9_-]+$/.test(fragment))
    throw Error('QR history code has invalid characters.');
  const base=fragment.replace(/-/g,'+').replace(/_/g,'/');
  const b=Uint8Array.from(atob(base+'='.repeat((4-base.length%4)%4)),ch=>ch.charCodeAt(0));
  if(b.length<16||b[0]!==83||b[1]!==82||b[2]!==3)
    throw Error('This is not a SmRF Mini control-history v3 code.');
  const intervalHours=b[3],n=b[8],target=b[9]/10;
  if(![6,12,24].includes(intervalHours)||n<1||n>43||
     b.length>10+6*43+2||target<1||target>4)
    throw Error('Invalid QR control-history header.');
  const found=b[b.length-2]|(b[b.length-1]<<8);
  if(crc16(b,b.length-2)!==found)
    throw Error('QR data checksum failed. Scan the QR again.');
  const origin=(b[4]|(b[5]<<8)|(b[6]<<16)|(b[7]<<24))>>>0;
  if(origin*600<1577836800||origin*600>=4102444800)
    throw Error('Invalid QR history date.');
  let i=10,tick=origin;
  const entries=[];
  for(let k=0;k<n;k++){
    if(i+4>b.length-2)throw Error('Truncated QR history.');
    let delta=b[i++];
    if(delta===255){
       if(i+2>b.length-2)throw Error('Truncated time gap.');
       delta=b[i]|(b[i+1]<<8);i+=2;
       if(delta<255)throw Error('Noncanonical time gap.');
    }
    if(k===0&&delta!==0)throw Error('Invalid first timestamp.');
    tick+=delta;
    if(tick*600>=4102444800)throw Error('Invalid QR measurement time.');
    const rv=b[i]|(b[i+1]<<8),fan=b[i+2];i+=3;
    if(fan>100)throw Error('Invalid fan percentage.');
    entries.push({
      utcSeconds:tick*600,
      radon:rv===65535?null:rv/100,
      fan,
    });
  }
  if(i!==b.length-2)throw Error('QR record count does not match payload.');
  return {
    version:3,intervalHours,target,records:entries,
    startUTC:entries[0].utcSeconds,
    endUTC:entries[entries.length-1].utcSeconds,
    roundedToTenMinutes:true,
  };
}
root.SmrfQrV3=Object.freeze({decode,crc16});
})(typeof window==='undefined'?globalThis:window);
