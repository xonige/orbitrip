const fs = require('fs');
const envPath = '/var/www/orbitrip/backend/.env';
let content = fs.readFileSync(envPath, 'utf8');

// Replace any broken connection string with the correct one
const correct = 'DATABASE_URL=postgres://orbitrip_user:OrbitripSecure2024!@localhost:5432/orbitrip';

if (content.includes('DATABASE_URL=')) {
    content = content.replace(/DATABASE_URL=.*/, correct);
} else {
    content += '\n' + correct;
}

fs.writeFileSync(envPath, content);
console.log('Fixed .env correctly!');
