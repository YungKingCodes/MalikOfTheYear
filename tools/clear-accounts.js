/**
 * This is a utility script to clear accounts and users for testing.
 * Use it when you want to reset your authentication state.
 * 
 * Usage: 
 *   node tools/clear-accounts.js email@example.com
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function clearAccounts(email) {
  try {
    console.log(`Looking for user with email: ${email}`);
    
    // Find the user
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        accounts: true,
        sessions: true
      }
    });
    
    if (!user) {
      console.log(`No user found with email: ${email}`);
      return;
    }
    
    console.log(`Found user: ${user.name || user.email} (ID: ${user.id})`);
    
    // Delete related accounts
    if (user.accounts.length > 0) {
      console.log(`Deleting ${user.accounts.length} account(s)...`);
      for (const account of user.accounts) {
        await prisma.account.delete({
          where: { id: account.id }
        });
        console.log(`Deleted account: ${account.provider}`);
      }
    } else {
      console.log('No accounts to delete');
    }
    
    // Delete related sessions
    if (user.sessions.length > 0) {
      console.log(`Deleting ${user.sessions.length} session(s)...`);
      for (const session of user.sessions) {
        await prisma.session.delete({
          where: { id: session.id }
        });
        console.log(`Deleted session: ${session.id}`);
      }
    } else {
      console.log('No sessions to delete');
    }
    
    // Delete the user if requested
    const deleteUser = process.argv.includes('--delete-user');
    if (deleteUser) {
      console.log(`Deleting user: ${user.email}`);
      await prisma.user.delete({
        where: { id: user.id }
      });
      console.log('User deleted successfully');
    } else {
      console.log('User kept (pass --delete-user to remove)');
    }
    
    console.log('Operation completed successfully');
  } catch (error) {
    console.error('Error during clear operation:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Get email from command line arguments
const email = process.argv[2];
if (!email) {
  console.error('Please provide an email address');
  console.log('Usage: node tools/clear-accounts.js email@example.com [--delete-user]');
  process.exit(1);
}

clearAccounts(email); 