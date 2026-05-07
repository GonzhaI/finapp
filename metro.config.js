/* eslint-env node */
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Permitir que Metro resuelva archivos .sql (necesario para migraciones Drizzle)
config.resolver.sourceExts.push('sql');

module.exports = config;
