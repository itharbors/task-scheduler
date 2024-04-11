'use strict';

const { spawnAsync } = require('./utils');

const exec = async function () {
    await spawnAsync('tsc');
    await spawnAsync(
        'esbuild',
        './source/index.ts',
        '--outfile=./build/index.mjs',
        '--bundle',
        '--format=esm',
        '--platform=node',
    );
};

exec();
