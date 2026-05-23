import { db } from '@/db';
import { notifications, user } from '@/db/schema';

async function main() {
    // Query the first user from the user table
    const firstUser = await db.select({ id: user.id }).from(user).limit(1);
    
    if (!firstUser || firstUser.length === 0) {
        throw new Error('No users found in database. Please seed users first.');
    }
    
    const userId = firstUser[0].id;
    
    // Calculate timestamps
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000).toISOString();
    const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000).toISOString();
    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
    const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString();
    
    const sampleNotifications = [
        {
            userId,
            dustbinId: 1,
            message: 'Dustbin at Main Gate is 75% full (Wet)',
            type: 'warning',
            isRead: false,
            createdAt: oneHourAgo,
        },
        {
            userId,
            dustbinId: 4,
            message: 'Dustbin at Entrance is Full (Dry)',
            type: 'alert',
            isRead: false,
            createdAt: thirtyMinutesAgo,
        },
        {
            userId,
            dustbinId: 2,
            message: 'Collection completed at Block A',
            type: 'info',
            isRead: true,
            createdAt: twoDaysAgo,
        },
        {
            userId,
            dustbinId: 5,
            message: 'Dustbin at Parking is 90% full (Wet)',
            type: 'warning',
            isRead: false,
            createdAt: twoHoursAgo,
        },
        {
            userId,
            dustbinId: 6,
            message: 'New dustbin added at Garden',
            type: 'info',
            isRead: true,
            createdAt: oneDayAgo,
        },
    ];

    await db.insert(notifications).values(sampleNotifications);
    
    console.log('✅ Notifications seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
    process.exit(1);
});