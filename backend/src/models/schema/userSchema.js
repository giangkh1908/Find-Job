/**
 * User Schema - Data Structure Definition
 */
export const userSchema = {
  collection: 'users',

  fields: {
    _id: { type: 'ObjectId', required: true },
    email: { type: 'string', required: true, unique: true },
    passwordHash: { type: 'string', required: true },
    isEmailVerified: { type: 'boolean', default: false },
    refreshTokenVersion: { type: 'number', default: 0 },
    otp: { type: 'string', optional: true },
    otpExpiresAt: { type: 'Date', optional: true },
    otpAttempts: { type: 'number', optional: true },
    otpLockedUntil: { type: 'Date', optional: true },
    refreshToken: { type: 'string', optional: true },
    refreshTokenExpiresAt: { type: 'Date', optional: true },
    createdAt: { type: 'Date', default: 'now' },
    updatedAt: { type: 'Date', default: 'now' },
  },

  indexes: [
    { email: 1, unique: true },
    { createdAt: -1 },
  ],
};

// Default values for creating new user
export const userDefaults = {
  isEmailVerified: false,
  refreshTokenVersion: 0,
  otpAttempts: 0,
  otpLockedUntil: null,
};
