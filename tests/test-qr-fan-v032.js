/* Node 18+: no browser, network or test dependencies. */
'use strict';
const assert=require('node:assert/strict');
require('../assets/smrf-qr-fan.js');
const decode=globalThis.SmrfQrFan.decode;
const good=decode('RgEDAEYHygzGDAL7XA');
assert.equal(good.state,'NORMAL');
assert.equal(good.fault,null);
assert.equal(good.appliedPercent,70);
assert.equal(good.calibrated,true);
assert.equal(good.armed,true);
assert.equal(good.dacWriteAccepted,true);
assert.equal(good.measuredHz,32.74);
assert.equal(good.expectedHz,32.70);
assert.equal(good.transitions,2);
assert.throws(()=>decode('RgEDAEYHyAzGDAL7XA'),/checksum/i); // changed data byte
assert.throws(()=>decode('RgEDAEYHygzGDAL7XB'),/noncanonical/i); // padding-bit tamper
assert.throws(()=>decode('RgEDAEYHygzGDAL7X!'),/characters/i);
assert.throws(()=>decode(''),/characters/i);
console.log('SmRF QR fan v1 parser PASS (known CRC vector, malformed payloads)');
