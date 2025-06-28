// Simple script to check current auth state
const token = localStorage.getItem('accessToken');
const user = JSON.parse(localStorage.getItem('user') || '{}');

console.log('Current Authentication State:');
console.log('Has Token:', !!token);
console.log('Token Length:', token?.length);
console.log('Token Start:', token?.substring(0, 30));
console.log('User Object:', user);
console.log('User ID:', user.id);
console.log('User Role:', user.role);
console.log('User Email:', user.email);

// Decode JWT payload (simple base64 decode)
if (token) {
  try {
    const parts = token.split('.');
    if (parts.length === 3) {
      const payload = JSON.parse(atob(parts[1]));
      console.log('JWT Payload:', payload);
    }
  } catch (e) {
    console.log('Failed to decode JWT:', e.message);
  }
}
