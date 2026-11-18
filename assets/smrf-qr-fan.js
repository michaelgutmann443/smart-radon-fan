/* SmRF Mini v0.32 QR fan status fragment, read-only offline decoder.
 * 13 bytes: 'F', version 1, current state, latched fault, applied %
 * flags, measured centiHz (LE u16), expected centiHz (LE u16),
 * transition count (saturated at 255), CRC16 CCITT-FALSE (LE).
 * No network calls; fragment is never uploaded by this script.
 */
(function (global) {
  'use strict';
  const STATES=['NOT VERIFIED','NOT CALIBRATED','STABILIZING','NORMAL',
                'SPEED MISMATCH','NO TACH SIGNAL','CALIBRATING'];
  function crc16(b,n) {
    let crc=0xffff;
    for(let i=0;i<n;i++){
      crc^=b[i]<<8;
      for(let j=0;j<8;j++)
        crc=(crc&0x8000)?((crc<<1)^0x1021)&65535:(crc<<1)&65535;
    }
    return crc;
  }
  function decode(s) {
    if(typeof s!=='string'||!/^[A-Za-z0-9_-]{18}$/.test(s))
      throw Error('Invalid fan diagnostic characters.');
    const base=s.replace(/-/g,'+').replace(/_/g,'/');
    const b=Uint8Array.from(atob(base+'='.repeat((4-s.length%4)%4)),
                             ch=>ch.charCodeAt(0));
    /* Reject noncanonical final base64 padding bits: equivalent strings
     * should not bypass the exact QR-format validation.
     */
    const canonical=btoa(String.fromCharCode(...b))
       .replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
    if(canonical!==s)throw Error('Noncanonical fan QR encoding.');
    if(b.length!==13||b[0]!==70||b[1]!==1)
      throw Error('Unsupported fan report version.');
    if((b[11]|(b[12]<<8))!==crc16(b,11))
      throw Error('Fan report checksum mismatch.');
    if(b[2]>=STATES.length || !(b[3]===0||b[3]===4||b[3]===5) ||
       b[4]>100 || (b[5]&~15)!==0)
      throw Error('Invalid fan diagnostic fields.');
    return Object.freeze({
      state:STATES[b[2]],
      fault:b[3]===0?null:STATES[b[3]],
      appliedPercent:b[4],
      calibrated:!!(b[5]&1),
      armed:!!(b[5]&2),
      dacWriteAccepted:!!(b[5]&4),
      calibrating:!!(b[5]&8),
      measuredHz:(b[6]|(b[7]<<8))/100,
      expectedHz:(b[8]|(b[9]<<8))/100,
      transitions:b[10]
    });
  }
  function renderInto(root, encoded) {
    if(!root)return;
    root.replaceChildren();
    if(!encoded){root.hidden=true;return;}
    const d=decode(encoded);
    root.hidden=false;
    const title=document.createElement('h2');
    title.textContent='Fan performance — tachometer verification';
    root.append(title);
    const headline=document.createElement('p');
    const active=d.fault||d.state;
    headline.textContent='Fan status: '+active;
    headline.style.fontWeight='750';
    headline.style.fontSize='20px';
    headline.style.color=d.fault?'#ad3c25':'#176a4e';
    root.append(headline);
    const details=document.createElement('dl');
    details.style.display='grid';
    details.style.gridTemplateColumns='minmax(140px,1fr) minmax(120px,1fr)';
    details.style.gap='7px 16px';
    const rows=[
      ['Applied DAC command',d.armed&&d.dacWriteAccepted?d.appliedPercent+'%':'NOT VERIFIED'],
      ['Measured tach frequency',d.measuredHz.toFixed(2)+' Hz'],
      ['Expected tach frequency',d.calibrated&&d.expectedHz>0?d.expectedHz.toFixed(2)+' Hz':'NOT AVAILABLE'],
      ['Calibrated reference',d.calibrated?'YES':'NO'],
      ['DAC state',d.calibrating?'CALIBRATING':d.armed?'ARMED':'DISARMED'],
      ['Fault transitions since reboot',d.transitions===255?'255 or more':String(d.transitions)]
    ];
    if(d.calibrated&&d.expectedHz>0){
      rows.splice(3,0,['Deviation from expectation',
        (100*(d.measuredHz-d.expectedHz)/d.expectedHz).toFixed(1)+'% (limit ±25%)']);
    }
    for(const [k,v] of rows){
      const dt=document.createElement('dt'),dd=document.createElement('dd');
      dt.textContent=k;dd.textContent=v;
      dt.style.color='#5c7085';dd.style.margin='0';dd.style.fontWeight='650';
      details.append(dt,dd);
    }
    root.append(details);
    const note=document.createElement('p');
    note.style.fontSize='13px';note.style.color='#5c7085';
    note.textContent='Diagnostic snapshot when QR was generated. A missing tach signal may mean a stopped fan or damaged tach wiring. Tach verification does not prove airflow or radon mitigation performance: the CRM remains the mitigation feedback. The QR checksum detects corruption but does not authenticate the readings.';
    root.append(note);
  }
  global.SmrfQrFan=Object.freeze({decode,renderInto});
})(typeof window!=='undefined'?window:globalThis);
