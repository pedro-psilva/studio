import { makeUserAdmin } from '../src/lib/admin-utils';

async function main() {
  const email = 'pedro@teste.com';
  
  try {
    console.log(`Attempting to make ${email} a super admin...`);
    await makeUserAdmin(email);
    console.log('Success! User is now a super admin.');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

main();
