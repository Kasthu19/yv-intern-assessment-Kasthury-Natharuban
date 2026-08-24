const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '../../.env') });

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const MembershipType = require('../models/MembershipType');
const OfficerRole = require('../models/OfficerRole');

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/member_management';
    console.log(`[Seed] Connecting to database: ${mongoUri}`);

    try {
      await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 3000 });
      console.log(`[Seed] Connected to local MongoDB`);
    } catch (dbErr) {
      console.warn(`[Seed Warning] Local MongoDB service offline (${dbErr.message}). Starting In-Memory MongoDB...`);
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      const uri = mongod.getUri();
      await mongoose.connect(uri);
      console.log(`[Seed] Connected to In-Memory MongoDB`);
    }

    // 1. Seed Chairman Account (F-14)
    const chairmanEmail = 'chairman@yarlventures.com';
    let chairman = await User.findOne({ email: chairmanEmail });

    if (!chairman) {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash('Chairman@123', salt);

      chairman = await User.create({
        fullName: 'Chairman Admin',
        email: chairmanEmail,
        passwordHash,
        userType: 'CHAIRMAN',
        isActive: true
      });
      console.log('✅ Chairman account created: chairman@yarlventures.com / Chairman@123');
    } else {
      console.log('ℹ️ Chairman account already exists.');
    }

    // 2. Seed Membership Types (F-14 requirement)
    const initialTypes = [
      {
        name: 'Individual Standard',
        applicableTo: 'INDIVIDUAL',
        annualFee: 5000,
        isActive: true
      },
      {
        name: 'Individual Premium',
        applicableTo: 'INDIVIDUAL',
        annualFee: 15000,
        isActive: true
      },
      {
        name: 'Corporate Gold',
        applicableTo: 'COMPANY',
        annualFee: 50000,
        isActive: true
      }
    ];

    for (const typeData of initialTypes) {
      await MembershipType.findOneAndUpdate(
        { name: typeData.name, applicableTo: typeData.applicableTo },
        typeData,
        { upsert: true, new: true }
      );
    }
    console.log('✅ Seeded 3 membership types');

    // 3. Seed Default Officer Role
    const defaultRoleName = 'Senior Application Reviewer';
    let reviewerRole = await OfficerRole.findOne({ name: defaultRoleName });
    if (!reviewerRole) {
      reviewerRole = await OfficerRole.create({
        name: defaultRoleName,
        description: 'Standard officer role for reviewing and processing membership applications',
        permissions: ['application.view', 'application.approve', 'application.reject', 'member.view'],
        createdBy: chairman._id
      });
      console.log('✅ Default Officer Role created:', defaultRoleName);
    }

    console.log('✨ Seed process completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed script error:', error);
    process.exit(1);
  }
};

seedData();
