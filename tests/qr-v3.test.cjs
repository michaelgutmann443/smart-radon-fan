const assert=require('node:assert/strict');
require('../assets/smrf-qr-v3.js');
const {decode}=globalThis.SmrfQrV3;
/* Golden vector from independent LE+CRC16 encoder (2026-11 example).
 * 6h nominal; one fault and one five-day gap encoded with uint16 extension.
 */
const fragment='U1IDBrCfLQAEFACoADwkkwAyAf__ZP_PAnoARquY';
const d=decode(fragment);
assert.equal(d.intervalHours,6);
assert.equal(d.target,2.0);
assert.equal(d.records.length,4);
assert.equal(d.records[0].radon,1.68);
assert.equal(d.records[0].fan,60);
assert.equal(d.records[1].radon,1.47);
assert.equal(d.records[1].fan,50);
assert.equal(d.records[2].radon,null);
assert.equal(d.records[2].fan,100);
assert.equal(d.records[3].radon,1.22);
assert.equal(d.records[3].fan,70);
assert.equal(d.records[1].utcSeconds-d.records[0].utcSeconds,6*3600);
assert.equal(d.records[2].utcSeconds-d.records[1].utcSeconds,600);
assert.equal(d.records[3].utcSeconds-d.records[2].utcSeconds,5*86400-600);
assert.throws(()=>decode(fragment.slice(0,-1)+'A'),/checksum|format|Invalid|Truncated|QR/);
assert.throws(()=>decode('not-a-real-code!'),/invalid characters/i);
console.log('PASS website QR v3: CRC, timestamp gaps, two axes values, fault gaps');
