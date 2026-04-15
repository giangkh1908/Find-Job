/**
 * User Model - Data Access Layer
 */
import { getDB, ObjectId } from '../config/database/connection.js';
import { userSchema, userDefaults } from './schema/userSchema.js';

const COLLECTION = userSchema.collection;

// Setup indexes
export async function setupUserModel() {
  const db = getDB();
  const users = db.collection(COLLECTION);

  for (const index of userSchema.indexes) {
    try {
      await users.createIndex(index);
    } catch (e) {
      // Index may exist
    }
  }
}

// Model methods
export const userModel = {
  // Find by ID
  async findById(id) {
    const db = getDB();
    return db.collection(COLLECTION).findOne({ _id: new ObjectId(id) });
  },

  // Find by email
  async findByEmail(email) {
    const db = getDB();
    return db.collection(COLLECTION).findOne({ email: email.toLowerCase() });
  },

  // Create user
  async create({ email, passwordHash }) {
    const db = getDB();
    const user = {
      email: email.toLowerCase(),
      passwordHash,
      ...userDefaults,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection(COLLECTION).insertOne(user);
    return { ...user, _id: result.insertedId };
  },

  // Save OTP
  async saveOtp(userId, otp) {
    const db = getDB();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    await db.collection(COLLECTION).updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          otp,
          otpExpiresAt: expiresAt,
          otpAttempts: 0,
          updatedAt: new Date(),
        },
      }
    );
  },

  // Verify OTP
  async verifyOtp(userId, otp) {
    const db = getDB();
    const user = await db.collection(COLLECTION).findOne({ _id: new ObjectId(userId) });

    if (!user || !user.otp || !user.otpExpiresAt) return false;

    if (new Date() > user.otpExpiresAt) {
      await this.clearOtp(userId);
      return false;
    }

    if (user.otp !== otp) {
      const attempts = (user.otpAttempts || 0) + 1;
      if (attempts >= 3) {
        await this.lockOtp(userId);
        return false;
      }
      await db.collection(COLLECTION).updateOne(
        { _id: new ObjectId(userId) },
        { $set: { otpAttempts: attempts } }
      );
      return false;
    }

    await this.clearOtp(userId);
    return true;
  },

  // Clear OTP
  async clearOtp(userId) {
    const db = getDB();
    await db.collection(COLLECTION).updateOne(
      { _id: new ObjectId(userId) },
      { $unset: { otp: '', otpExpiresAt: '', otpAttempts: '' } }
    );
  },

  // Lock OTP
  async lockOtp(userId) {
    const db = getDB();
    const lockedUntil = new Date(Date.now() + 15 * 60 * 1000);
    await db.collection(COLLECTION).updateOne(
      { _id: new ObjectId(userId) },
      { $set: { otpLockedUntil: lockedUntil, otpAttempts: 0 } }
    );
  },

  // Mark email verified
  async markEmailVerified(userId) {
    const db = getDB();
    await db.collection(COLLECTION).updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: { isEmailVerified: true, updatedAt: new Date() },
        $unset: { otp: '', otpExpiresAt: '', otpAttempts: '' },
      }
    );
  },

  // Save refresh token
  async saveRefreshToken(userId, token, version) {
    const db = getDB();
    await db.collection(COLLECTION).updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          refreshToken: token,
          refreshTokenVersion: version,
          refreshTokenExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(),
        },
      }
    );
  },

  // Verify refresh token
  async verifyRefreshToken(userId, token) {
    const db = getDB();
    const user = await db.collection(COLLECTION).findOne({ _id: new ObjectId(userId) });

    if (!user || !user.refreshToken) return false;
    if (new Date() > (user.refreshTokenExpiresAt || 0)) {
      await this.clearRefreshToken(userId);
      return false;
    }
    return user.refreshToken === token;
  },

  // Clear refresh token
  async clearRefreshToken(userId) {
    const db = getDB();
    await db.collection(COLLECTION).updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          refreshToken: null,
          refreshTokenVersion: 0,
          refreshTokenExpiresAt: null,
          updatedAt: new Date(),
        },
      }
    );
  },
};
