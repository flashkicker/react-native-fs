#!/usr/bin/env node
'use strict';

const { NODE_ENV } = process.env;
if (NODE_ENV === 'production')
  module.exports = require('./react-native-fs.production.min.cjs');
else
  module.exports = require('./react-native-fs.development.cjs');
