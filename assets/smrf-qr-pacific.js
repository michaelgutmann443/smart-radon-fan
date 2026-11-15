/* SmRF Mini browser-local QR CSV date/time: explicit Pacific wall-clock time.
 * Preserve Unix UTC seconds in CSV; do not assume a scanner's timezone.
 * PST/PDT transitions are resolved by IANA America/Los_Angeles rules.
 */
(function(root){
'use strict';
const formatter=new Intl.DateTimeFormat('en-US',{
  timeZone:'America/Los_Angeles',
  year:'numeric',month:'2-digit',day:'2-digit',
  hour:'2-digit',minute:'2-digit',second:'2-digit',
  hourCycle:'h23',timeZoneName:'short'
});
function formatPacificTime(utcSeconds){
  if(!Number.isInteger(utcSeconds)||utcSeconds<1577836800||utcSeconds>=4102444800)
    throw RangeError('Invalid UTC epoch seconds.');
  const parts={};
  for(const p of formatter.formatToParts(new Date(utcSeconds*1000)))
    if(p.type!=='literal')parts[p.type]=p.value;
  return `${parts.year}-${parts.month}-${parts.day} ${parts.hour}:${parts.minute}:${parts.second} ${parts.timeZoneName}`;
}
const api=Object.freeze({formatPacificTime});
root.SmrfQrPacific=api;
if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window==='undefined'?globalThis:window);
