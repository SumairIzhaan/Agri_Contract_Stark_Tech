const http = require('http');

const url = 'http://localhost:5000/crops/soybean_crop_agriculture_india_-_Google_Search_001.jpg';

http.get(url, (res) => {
    console.log(`StatusCode: ${res.statusCode}`);
    if (res.statusCode === 200) {
        console.log('SUCCESS: Image found!');
    } else {
        console.log('FAILURE: Image not found.');
    }
    res.resume();
}).on('error', (e) => {
    console.error(`Got error: ${e.message}`);
});
