'use strict';

const { spawnAsync } = require('./utils');

const exec = async function() {
    await spawnAsync('tsc', '-w');
};

exec();
