const { execSync } = require('child_process');
const fs = require('fs');
try {
    const out = execSync('node backend/server.js', { encoding: 'utf-8' });
    fs.writeFileSync('server_output.log', out);
} catch (err) {
    fs.writeFileSync('server_output.log', err.stdout + '\n' + err.stderr);
}
