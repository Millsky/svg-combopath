const extract = require('extract-svg-path');
const fs = require('fs');

// get the reference to the files contained in ./originalSVGs
fs.readdir('./originalSVGs', function (err, files) {
    if (err) {
        console.error("Could not list the directory.", err);
    }

    // loop through files in ./originalSVGs and build an object containing the filename as the key,
    // and the combined paths as the value, and save the objects in an array called "result"
    const result = files.map((file) => {
        return { [file]: extract(`./originalSVGs/${file}`)};
    });

    // make the directory ./combinedPaths recursively in case it already exists
    fs.mkdir('./combinedPaths', { recursive: true }, (err) => {
        if (err) throw err;
    });

    // function to build a string to be used to create an export of every svg's combined path
    const createJSON = (svgPath, svg) => {
        const svgName = Object.keys(svg)[0];
        return `export const ${svgName.substring(0, svgName.indexOf('.'))} = ${JSON.stringify({d: `${svgPath}`})}`;
    };

    const longDpaths = result.map(function(svg) {
        return createJSON(svg[`${Object.keys(svg)[0]}`], svg);
    }).reduce((acc, exportSVG) => {
        return `
        ${acc}
        ${exportSVG}
        `
    }, '');

    fs.writeFileSync(`./combinedPaths/total.js`, longDpaths)
});
