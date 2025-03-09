// Script to find the actual port the server is running on
const http = require('http');

// Try ports in sequence
async function findServerPort(startPort = 5001, maxPort = 5010) {
  for (let port = startPort; port <= maxPort; port++) {
    try {
      const result = await checkPort(port);
      if (result) {
        console.log(`Found server running on port: ${port}`);
        return port;
      }
    } catch (err) {
      console.log(`No server found on port ${port}`);
    }
  }
  console.log('No running server found on any checked port');
  return null;
}

function checkPort(port) {
  return new Promise((resolve, reject) => {
    const req = http.get(`http://localhost:${port}/api/health`, (res) => {
      if (res.statusCode === 200) {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          try {
            const result = JSON.parse(data);
            resolve(result);
          } catch (e) {
            reject(new Error('Invalid response'));
          }
        });
      } else {
        reject(new Error(`Received status code: ${res.statusCode}`));
      }
    });
    
    req.on('error', (err) => {
      reject(err);
    });
    
    req.setTimeout(1000, () => {
      req.abort();
      reject(new Error('Request timed out'));
    });
  });
}

// Run the function if this script is executed directly
if (require.main === module) {
  findServerPort();
}

module.exports = findServerPort; 