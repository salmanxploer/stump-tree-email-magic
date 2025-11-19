import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { config } from './config';
import { UserModel } from './models/User';

const seedDatabase = async () => {
  try {
    await mongoose.connect(config.mongoUri);
    console.log('Connected to MongoDB');

    // Clear existing users (optional - comment out if you don't want to delete)
    // await UserModel.deleteMany({});
    // console.log('Cleared existing users');

    const password = 'admin1234';
    const passwordHash = await bcrypt.hash(password, 10);

    // Create sample users
    const users = [
      {
        name: 'Admin User',
        email: 'admin@bubtcafe.com',
        passwordHash,
        role: 'admin',
        phone: '01712345678',
      },
      {
        name: 'Staff Member',
        email: 'staff@bubtcafe.com',
        passwordHash,
        role: 'staff',
        phone: '01798765432',
      },
      {
        name: 'Customer User',
        email: 'customer@bubtcafe.com',
        passwordHash,
        role: 'student',
        phone: '01856432109',
      },
    ];

    // Insert users (skip if they already exist)
    for (const user of users) {
      const existingUser = await UserModel.findOne({ email: user.email });
      if (!existingUser) {
        const newUser = await UserModel.create(user);
        console.log(`✅ Created ${user.role}: ${newUser.email}`);
      } else {
        console.log(`⏭️  Skipped ${user.role}: ${user.email} (already exists)`);
      }
    }

    console.log('\n✅ Seed completed successfully!');
    console.log('\nCreated users:');
    console.log('  Admin: admin@bubtcafe.com (password: admin1234)');
    console.log('  Staff: staff@bubtcafe.com (password: admin1234)');
    console.log('  Customer: customer@bubtcafe.com (password: admin1234)');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

void seedDatabase();
