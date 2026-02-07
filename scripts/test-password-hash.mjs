import bcrypt from 'bcryptjs';

const password = 'e2epassword';
const hash = '$2a$10$Bje8jgpz6utCfNuvmltAIeRdukD7Us.PJkitImOLOj9HrsH8CCeeK';

console.log('Testing password:', password);
console.log('Against hash:', hash);

const isValid = await bcrypt.compare(password, hash);
console.log('Hash matches:', isValid);

// Also generate a new hash to compare
const newHash = await bcrypt.hash(password, 10);
console.log('New hash for same password:', newHash);
