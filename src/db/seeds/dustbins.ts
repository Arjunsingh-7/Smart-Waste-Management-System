import { db } from '@/db';
import { dustbins, user } from '@/db/schema';
import { eq } from 'drizzle-orm';

async function main() {
    // Get the first user from the database
    const firstUser = await db.select().from(user).limit(1);
    
    if (!firstUser || firstUser.length === 0) {
        throw new Error('No users found in database. Please run user seeder first.');
    }
    
    const userId = firstUser[0].id;
    const currentDate = new Date();
    const currentTimestamp = currentDate.toISOString();
    
    // Helper function to calculate dates
    const getDateOffset = (days: number): string => {
        const date = new Date();
        date.setDate(date.getDate() + days);
        return date.toISOString().split('T')[0];
    };
    
    const sampleDustbins = [
        {
            userId,
            name: 'Kitchen Wet Bin',
            type: 'wet',
            locationName: 'Main Gate',
            latitude: '19.0760',
            longitude: '72.8777',
            fillLevel: 75,
            status: '75',
            lastCollectionDate: getDateOffset(-3),
            nextCollectionDate: getDateOffset(1),
            isActive: true,
            createdAt: currentTimestamp,
            updatedAt: currentTimestamp,
        },
        {
            userId,
            name: 'Cafeteria Wet Bin',
            type: 'wet',
            locationName: 'Block A',
            latitude: '19.0761',
            longitude: '72.8780',
            fillLevel: 50,
            status: '50',
            lastCollectionDate: getDateOffset(-2),
            nextCollectionDate: getDateOffset(2),
            isActive: true,
            createdAt: currentTimestamp,
            updatedAt: currentTimestamp,
        },
        {
            userId,
            name: 'Office Dry Bin',
            type: 'dry',
            locationName: 'Block B',
            latitude: '19.0759',
            longitude: '72.8775',
            fillLevel: 25,
            status: '25',
            lastCollectionDate: getDateOffset(-1),
            nextCollectionDate: getDateOffset(3),
            isActive: true,
            createdAt: currentTimestamp,
            updatedAt: currentTimestamp,
        },
        {
            userId,
            name: 'Lobby Dry Bin',
            type: 'dry',
            locationName: 'Entrance',
            latitude: '19.0762',
            longitude: '72.8779',
            fillLevel: 100,
            status: 'full',
            lastCollectionDate: getDateOffset(-5),
            nextCollectionDate: getDateOffset(0),
            isActive: true,
            createdAt: currentTimestamp,
            updatedAt: currentTimestamp,
        },
        {
            userId,
            name: 'Parking Wet Bin',
            type: 'wet',
            locationName: 'Parking',
            latitude: '19.0758',
            longitude: '72.8776',
            fillLevel: 90,
            status: 'full',
            lastCollectionDate: getDateOffset(-4),
            nextCollectionDate: getDateOffset(1),
            isActive: true,
            createdAt: currentTimestamp,
            updatedAt: currentTimestamp,
        },
        {
            userId,
            name: 'Garden Dry Bin',
            type: 'dry',
            locationName: 'Garden',
            latitude: '19.0763',
            longitude: '72.8781',
            fillLevel: 10,
            status: 'empty',
            lastCollectionDate: getDateOffset(-1),
            nextCollectionDate: getDateOffset(5),
            isActive: true,
            createdAt: currentTimestamp,
            updatedAt: currentTimestamp,
        },
    ];

    await db.insert(dustbins).values(sampleDustbins);
    
    console.log('✅ Dustbins seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});