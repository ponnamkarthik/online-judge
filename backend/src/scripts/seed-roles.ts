#!/usr/bin/env node
/**
 * Seed Default Roles Script
 *
 * This script creates default roles with predefined permissions.
 * Run: npm run seed:roles
 *
 * Default Roles:
 * - user: Basic user with code submission and analytics
 * - problem_setter: Can create and manage problems
 * - admin: Full access to all features
 */

import 'dotenv/config';

import mongoose from 'mongoose';

import { Role } from '../models/role.model';
import { env } from '../lib/env';

const defaultRoles = [
  {
    name: 'user',
    permissions: [
      'submit_code', // Can submit code and test
      'view_analytics', // Can view personal analytics
    ],
  },
  {
    name: 'problem_setter',
    permissions: [
      'submit_code',
      'view_analytics',
      'manage_problems', // Can create/edit/delete problems
      'manage_testcases', // Can create/edit/delete test cases
    ],
  },
  {
    name: 'admin',
    permissions: [
      'submit_code',
      'view_analytics',
      'manage_problems',
      'manage_testcases',
      'manage_ai', // Can use AI features
      'manage_users', // Can manage user accounts (future use)
    ],
  },
];

async function seedRoles() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    console.log('🌱 Seeding default roles...\n');

    for (const roleData of defaultRoles) {
      const existing = await Role.findOne({ name: roleData.name });

      if (existing) {
        // Update existing role permissions
        existing.permissions = roleData.permissions;
        await existing.save();
        console.log(`♻️  Updated role: ${roleData.name}`);
        console.log(`   Permissions: ${roleData.permissions.join(', ')}\n`);
      } else {
        // Create new role
        await Role.create(roleData);
        console.log(`✨ Created role: ${roleData.name}`);
        console.log(`   Permissions: ${roleData.permissions.join(', ')}\n`);
      }
    }

    console.log('✅ All roles seeded successfully!\n');
    console.log('📊 Role Summary:');
    const allRoles = await Role.find().sort({ name: 1 });
    allRoles.forEach((role) => {
      console.log(`   - ${role.name}: ${role.permissions.length} permissions`);
    });

    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding roles:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

seedRoles();
