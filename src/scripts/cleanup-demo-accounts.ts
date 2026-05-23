import { db } from '@/db';
import { user, userProfile, dustbins, notifications, collections, analytics } from '@/db/schema';
import { eq } from 'drizzle-orm';

async function cleanupDemoAccounts() {
  try {
    console.log('🧹 Starting cleanup of demo accounts...');

    // Get all users to identify demo accounts
    const allUsers = await db.select().from(user);
    
    // Filter demo accounts (you can customize this logic)
    const demoUsers = allUsers.filter(u => 
      u.email.includes('demo') || 
      u.email.includes('test') || 
      u.name.toLowerCase().includes('demo') ||
      u.name.toLowerCase().includes('test')
    );

    if (demoUsers.length === 0) {
      console.log('✅ No demo accounts found to clean up.');
      return;
    }

    console.log(`Found ${demoUsers.length} demo accounts to remove:`);
    demoUsers.forEach(user => console.log(`- ${user.name} (${user.email})`));

    // Delete related data for each demo user
    for (const demoUser of demoUsers) {
      console.log(`Cleaning up data for ${demoUser.name}...`);
      
      // Delete analytics
      await db.delete(analytics).where(eq(analytics.userId, demoUser.id));
      
      // Delete collections
      await db.delete(collections).where(eq(collections.userId, demoUser.id));
      
      // Delete notifications
      await db.delete(notifications).where(eq(notifications.userId, demoUser.id));
      
      // Delete dustbins
      await db.delete(dustbins).where(eq(dustbins.userId, demoUser.id));
      
      // Delete user profile
      await db.delete(userProfile).where(eq(userProfile.userId, demoUser.id));
      
      // Delete user account (this will cascade to sessions and accounts due to foreign key constraints)
      await db.delete(user).where(eq(user.id, demoUser.id));
      
      console.log(`✅ Cleaned up ${demoUser.name}`);
    }

    console.log('🎉 Demo account cleanup completed successfully!');
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    throw error;
  }
}

// Run the cleanup
cleanupDemoAccounts()
  .then(() => {
    console.log('Cleanup script finished.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Cleanup script failed:', error);
    process.exit(1);
  });