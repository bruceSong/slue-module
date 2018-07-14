// const fs = require('fs');
// const contents = fs.readFileSync('./test/app.js', 'utf8');

// let moduleRegular = /require\((\'|\")[\w\.\/-]+(?:\1)\)|import\s+(?:(?:\w+)|(?:\{(?:\s*\r*\n*\w+\s*,*)+\}))?(?:\s+from\s+)?(\'|\")[\w\.\/-]+(?:\2)/g;
// let itemRegular = /require\((\'|\")([\w\.\/-]+)(?:\1)\)|import\s+(?:(?:\w+)|(?:\{(?:\s*\r*\n*\w+\s*,*)+\}))?(?:\s+from\s+)?(\'|\")([\w\.\/-]+)(?:\3)/;
// let matchResult = contents.match(moduleRegular);
// if (matchResult) {
//     matchResult.forEach(function(item) {
//         let itemMatchRes = item.match(itemRegular);
//         if (itemMatchRes) {
//             let moduleId = itemMatchRes[2] || itemMatchRes[4];
//             console.log(moduleId);
//         }
//     })
// }

const slueModule = require('../index');
const data = slueModule({
    filePath: './test/app.js'
});

console.log(data);

// const fs = require('fs');
// const contents = fs.readFileSync('./test/app.js', 'utf8');
// const babel = require('babel-core');
// try {
//     contents = babel.transform(contents, {
//         comments: false
//     }).code;
// } catch(e) {

// }

// console.log(contents);
