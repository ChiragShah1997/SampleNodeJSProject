const convict = require('convict');
const convictFormatWithValidator = require('convict-format-with-validator');
const convictFormatWithMoment = require('convict-format-with-moment');

// Add the "email", "ipaddress" or "url" format
convict.addFormats(convictFormatWithValidator);

// Add "duration" or "timestamp" format
convict.addFormats(convictFormatWithMoment);

module.exports = convict({
  env: {
    doc: 'The application environment.',
    format: ['production', 'development', 'test'],
    default: 'development',
    env: 'NODE_ENV',
  },
  ip: {
    doc: 'The IP address to bind.',
    format: 'ipaddress',
    default: '127.0.0.1',
    env: 'IP_ADDRESS',
  },
  port: {
    doc: 'The port to bind.',
    format: 'port',
    default: 3000,
    env: 'PORT',
  },
});
