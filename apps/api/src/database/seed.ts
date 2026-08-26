import { dataSource } from './data-source';
import { GymEntity } from '../modules/gyms/entities/gym.entity';
import { UserEntity } from '../modules/users/entities/user.entity';
import { MemberEntity } from '../modules/members/entities/member.entity';
import { MembershipPlanEntity } from '../modules/members/entities/membership-plan.entity';
import { ClassTypeEntity } from '../modules/classes/entities/class-type.entity';
import { RoomEntity } from '../modules/classes/entities/room.entity';
import { ExerciseEntity } from '../modules/workouts/entities/exercise.entity';
import * as bcrypt from 'bcryptjs';
import { v4 as uuid } from 'uuid';

async function seed() {
  try {
    await dataSource.initialize();
    console.log('Database connection established');

    // Clear existing data
    const entities = [
      'bookings',
      'waitlist_entries',
      'check_ins',
      'plan_exercises',
      'workout_plans',
      'member_progress',
      'payments',
      'class_sessions',
      'membership_subscriptions',
      'notifications',
      'rooms',
      'class_types',
      'members',
      'membership_plans',
      'users',
      'exercises',
      'gyms'
    ];

    for (const entity of entities) {
      await dataSource.query(`TRUNCATE TABLE "${entity}" CASCADE;`);
    }

    console.log('Cleared existing data');

    // Seed Gyms
    const gymRepo = dataSource.getRepository(GymEntity);
    const gym = gymRepo.create({
      name: 'FitHub Premium Gym',
      slug: 'fithub-premium',
      address: '123 Fitness Ave, New York, NY 10001',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'US',
      timezone: 'America/New_York',
      phone: '+1-555-0123',
      email: 'contact@fithub.com',
      logoUrl: 'https://example.com/logo.png',
      settings: {
        maxBookingsPerWeek: 7,
        cancellationWindow: 4,
        currency: 'USD'
      },
      isActive: true
    });
    await gymRepo.save(gym);
    console.log('✓ Gym created');

    // Seed Users
    const userRepo = dataSource.getRepository(UserEntity);
    const hashedPassword = await bcrypt.hash('Password123!', 12);

    const superAdmin = userRepo.create({
      gymId: gym.id,
      email: 'admin@fithub.com',
      passwordHash: hashedPassword,
      role: 'super_admin',
      firstName: 'Admin',
      lastName: 'User',
      phone: '+1-555-0100',
      status: 'active',
      emailVerified: true
    });

    const gymManager = userRepo.create({
      gymId: gym.id,
      email: 'manager@fithub.com',
      passwordHash: hashedPassword,
      role: 'gym_manager',
      firstName: 'Manager',
      lastName: 'User',
      phone: '+1-555-0101',
      status: 'active',
      emailVerified: true
    });

    const trainer = userRepo.create({
      gymId: gym.id,
      email: 'trainer@fithub.com',
      passwordHash: hashedPassword,
      role: 'trainer',
      firstName: 'Sarah',
      lastName: 'Johnson',
      phone: '+1-555-0102',
      status: 'active',
      emailVerified: true
    });

    const receptionist = userRepo.create({
      gymId: gym.id,
      email: 'receptionist@fithub.com',
      passwordHash: hashedPassword,
      role: 'receptionist',
      firstName: 'John',
      lastName: 'Desk',
      phone: '+1-555-0103',
      status: 'active',
      emailVerified: true
    });

    await userRepo.save([superAdmin, gymManager, trainer, receptionist]);
    console.log('✓ Users created');

    // Seed Membership Plans
    const planRepo = dataSource.getRepository(MembershipPlanEntity);
    const basicPlan = planRepo.create({
      gymId: gym.id,
      name: 'Basic Plan',
      description: 'Access to all facilities and basic classes',
      billingFrequency: 'monthly',
      price: 29.99,
      currency: 'USD',
      features: {
        classAccess: true,
        maxClassesPerWeek: 7,
        equipmentAccess: true,
        showerAccess: true,
        walkinAccess: false
      },
      maxBookingsPerWeek: 7,
      isActive: true,
      displayOrder: 1
    });

    const premiumPlan = planRepo.create({
      gymId: gym.id,
      name: 'Premium Plan',
      description: 'Unlimited classes and personal training sessions',
      billingFrequency: 'monthly',
      price: 49.99,
      currency: 'USD',
      features: {
        classAccess: true,
        maxClassesPerWeek: 999,
        equipmentAccess: true,
        showerAccess: true,
        personalTraining: true,
        walkinAccess: false
      },
      maxBookingsPerWeek: 999,
      isActive: true,
      displayOrder: 2
    });

    const vipPlan = planRepo.create({
      gymId: gym.id,
      name: 'VIP Plan',
      description: 'All-inclusive membership with guest passes',
      billingFrequency: 'monthly',
      price: 79.99,
      currency: 'USD',
      features: {
        classAccess: true,
        maxClassesPerWeek: 999,
        equipmentAccess: true,
        showerAccess: true,
        personalTraining: true,
        guestPasses: true,
        walkinAccess: true
      },
      maxBookingsPerWeek: 999,
      isActive: true,
      displayOrder: 3
    });

    await planRepo.save([basicPlan, premiumPlan, vipPlan]);
    console.log('✓ Membership Plans created');

    // Seed Members
    const memberRepo = dataSource.getRepository(MemberEntity);
    const members = [];
    for (let i = 1; i <= 10; i++) {
      const user = userRepo.create({
        gymId: gym.id,
        email: `member${i}@example.com`,
        passwordHash: hashedPassword,
        role: 'member',
        firstName: `Member`,
        lastName: `${i}`,
        phone: `+1-555-${String(200 + i).padStart(4, '0')}`,
        status: 'active',
        emailVerified: true
      });
      await userRepo.save(user);

      const member = memberRepo.create({
        userId: user.id,
        gymId: gym.id,
        dateOfBirth: new Date('1990-01-15'),
        gender: i % 2 === 0 ? 'Female' : 'Male',
        emergencyContactName: `Emergency ${i}`,
        emergencyContactPhone: `+1-555-${String(300 + i).padStart(4, '0')}`,
        qrCodeHash: `QR_${uuid()}`,
        referralCode: `REF_${i}`,
        membershipStartDate: new Date(),
        membershipEndDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        totalCheckIns: Math.floor(Math.random() * 50)
      });
      members.push(member);
    }
    await memberRepo.save(members);
    console.log('✓ Members created');

    // Seed Class Types
    const classTypeRepo = dataSource.getRepository(ClassTypeEntity);
    const classTypes = [
      {
        name: 'Yoga Flow',
        description: 'Relaxing yoga session for flexibility',
        durationMinutes: 60,
        intensityLevel: 'low',
        maxCapacity: 20,
        colorCode: '#10B981'
      },
      {
        name: 'HIIT Blast',
        description: 'High-intensity interval training',
        durationMinutes: 45,
        intensityLevel: 'extreme',
        maxCapacity: 15,
        colorCode: '#EF4444'
      },
      {
        name: 'Spin Class',
        description: 'Indoor cycling with energetic music',
        durationMinutes: 50,
        intensityLevel: 'high',
        maxCapacity: 18,
        colorCode: '#F59E0B'
      },
      {
        name: 'Pilates',
        description: 'Core strengthening and flexibility',
        durationMinutes: 60,
        intensityLevel: 'moderate',
        maxCapacity: 16,
        colorCode: '#8B5CF6'
      }
    ];

    const savedClassTypes = await classTypeRepo.save(
      classTypes.map((ct) =>
        classTypeRepo.create({
          gymId: gym.id,
          ...ct,
          isActive: true
        })
      )
    );
    console.log('✓ Class Types created');

    // Seed Rooms
    const roomRepo = dataSource.getRepository(RoomEntity);
    const rooms = [
      { name: 'Studio A', capacity: 25, type: 'Studio' },
      { name: 'Studio B', capacity: 20, type: 'Studio' },
      { name: 'Cycling Room', capacity: 20, type: 'Cycling' },
      { name: 'Main Hall', capacity: 50, type: 'Multi-purpose' }
    ];

    await roomRepo.save(
      rooms.map((r) =>
        roomRepo.create({
          gymId: gym.id,
          ...r,
          amenities: ['Air Conditioning', 'Sound System'],
          isActive: true
        })
      )
    );
    console.log('✓ Rooms created');

    // Seed Exercises
    const exerciseRepo = dataSource.getRepository(ExerciseEntity);
    const exercises = [
      {
        name: 'Push-ups',
        muscleGroup: 'Chest',
        equipment: 'Bodyweight',
        difficulty: 'beginner',
        instructions: 'Place hands on ground, lower body until chest touches ground'
      },
      {
        name: 'Squats',
        muscleGroup: 'Legs',
        equipment: 'Barbell',
        difficulty: 'intermediate',
        instructions: 'Stand with feet shoulder-width apart, lower hips back'
      },
      {
        name: 'Deadlifts',
        muscleGroup: 'Back',
        equipment: 'Barbell',
        difficulty: 'advanced',
        instructions: 'Lift barbell from ground with straight back'
      },
      {
        name: 'Plank',
        muscleGroup: 'Core',
        equipment: 'Bodyweight',
        difficulty: 'beginner',
        instructions: 'Hold forearm plank position for duration'
      }
    ];

    await exerciseRepo.save(
      exercises.map((e) =>
        exerciseRepo.create({
          ...e,
          isActive: true,
          imageUrls: []
        })
      )
    );
    console.log('✓ Exercises created');

    console.log('\n✅ Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
}

seed();
