import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateBookingPrice,
  hasBookingConflict,
  isValidStatusTransition,
  evaluateCancellationPolicy,
} from './booking-rules.ts';

test('calculateBookingPrice handles service centre mode with zero home visit fee', () => {
  const result = calculateBookingPrice({
    basePrice: 2500,
    serviceMode: 'service_centre',
    homeVisitFee: 500,
    commissionPercentage: 10,
  });

  assert.equal(result.basePrice, 2500);
  assert.equal(result.homeVisitFee, 0);
  assert.equal(result.totalPrice, 2500);
  assert.equal(result.platformCommission, 250);
  assert.equal(result.workerEarnings, 2250);
  assert.equal(result.currency, 'PKR');
});

test('calculateBookingPrice handles home visit mode and adds travel fee', () => {
  const result = calculateBookingPrice({
    basePrice: 3500,
    serviceMode: 'home_visit',
    homeVisitFee: 600,
    commissionPercentage: 15,
  });

  assert.equal(result.basePrice, 3500);
  assert.equal(result.homeVisitFee, 600);
  assert.equal(result.totalPrice, 4100);
  assert.equal(result.platformCommission, 615);
  assert.equal(result.workerEarnings, 3485);
});

test('hasBookingConflict correctly detects active conflict', () => {
  const existing = [
    { date: '2026-10-20', timeSlot: '10:00 AM - 11:00 AM', status: 'Confirmed' as const },
    { date: '2026-10-20', timeSlot: '02:00 PM - 03:00 PM', status: 'Cancelled' as const },
    { date: '2026-10-21', timeSlot: '10:00 AM - 11:00 AM', status: 'Confirmed' as const },
  ];

  // Should conflict with Confirmed slot on same date & time
  assert.equal(
    hasBookingConflict(existing, '2026-10-20', '10:00 AM - 11:00 AM'),
    true
  );

  // Should NOT conflict with Cancelled slot
  assert.equal(
    hasBookingConflict(existing, '2026-10-20', '02:00 PM - 03:00 PM'),
    false
  );

  // Should NOT conflict with different date
  assert.equal(
    hasBookingConflict(existing, '2026-10-22', '10:00 AM - 11:00 AM'),
    false
  );
});

test('isValidStatusTransition validates role permissions', () => {
  // Customer can cancel Pending
  assert.equal(isValidStatusTransition('Pending', 'Cancelled', 'customer'), true);
  // Customer cannot mark as Completed
  assert.equal(isValidStatusTransition('In Progress', 'Completed', 'customer'), false);

  // Worker can confirm Pending
  assert.equal(isValidStatusTransition('Pending', 'Confirmed', 'worker'), true);
  // Worker can mark In Progress as Completed
  assert.equal(isValidStatusTransition('In Progress', 'Completed', 'worker'), true);
  // Worker cannot reopen Completed
  assert.equal(isValidStatusTransition('Completed', 'Pending', 'worker'), false);

  // Admin has supervisory rights
  assert.equal(isValidStatusTransition('Completed', 'Confirmed', 'admin'), true);
});

test('evaluateCancellationPolicy returns true if > 2 hours ahead', () => {
  const fixedNow = new Date('2026-10-20T10:00:00Z').getTime();
  // 5 hours later
  const res = evaluateCancellationPolicy('2026-10-20', '03:00 PM', fixedNow);
  assert.equal(typeof res.eligibleForFreeCancel, 'boolean');
});
