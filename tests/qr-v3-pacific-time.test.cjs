const assert=require('node:assert/strict');
const {formatPacificTime}=require('../assets/smrf-qr-pacific.js');
const test=(iso,expected)=>{
  const seconds=Date.parse(iso)/1000;
  assert.equal(formatPacificTime(seconds),expected,iso);
};
test('2026-11-15T14:00:00Z','2026-11-15 06:00:00 PST');
test('2026-07-15T13:00:00Z','2026-07-15 06:00:00 PDT');
// Fall back: the two distinct 1:30 AM timestamps include zone labels.
test('2026-11-01T08:30:00Z','2026-11-01 01:30:00 PDT');
test('2026-11-01T09:30:00Z','2026-11-01 01:30:00 PST');
// Spring forward: 2 AM is skipped.
test('2026-03-08T09:59:00Z','2026-03-08 01:59:00 PST');
test('2026-03-08T10:01:00Z','2026-03-08 03:01:00 PDT');
assert.throws(()=>formatPacificTime(NaN),/Invalid UTC/);
console.log('PASS: SmRF Mini QR CSV Pacific timestamps, PST/PDT transitions');
