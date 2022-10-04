const bcrypt = require('bcryptjs');
const salt = bcrypt.genSaltSync(10);

// For Avatar Generate
const normalize = require('normalize-url')
const gravatar = require('gravatar')

const users = [
  {
    type: 'admin',
    name: 'Steven Hooley',
    email: 'steven@hooley.me',
    avatar: normalize(gravatar.url('steven@hooley.me', { s: '200', r: 'pg', d: 'mm' }), { forceHttps: true }),
    password: bcrypt.hashSync('admin123', salt),
    passwordForUpdate: 'admin123'
  },
  // {
  //   type: 'affiliate',
  //   name: 'Landry Some',
  //   email: 'landry@siliconslopesconsulting.com',
  //   avatar: normalize(gravatar.url('landry@siliconslopesconsulting.com', { s: '200', r: 'pg', d: 'mm' }), { forceHttps: true }),
  //   password: bcrypt.hashSync('admin123', salt),
  //   passwordForUpdate: 'admin123'
  // },
  {
    type: 'client',
    name: 'Daskiro King',
    email: 'ilia@siliconslopesconsulting.com',
    avatar: normalize(gravatar.url('ilia@siliconslopesconsulting.com', { s: '200', r: 'pg', d: 'mm' }), { forceHttps: true }),
    password: bcrypt.hashSync('admin123', salt),
    passwordForUpdate: 'admin123'
  },
  {
    type: 'assistant',
    name: 'Pro Dev',
    email: 'progdev77@gmail.com',
    avatar: normalize(gravatar.url('progdev77@gmail.com', { s: '200', r: 'pg', d: 'mm' }), { forceHttps: true }),
    password: bcrypt.hashSync('admin123', salt),
    passwordForUpdate: 'admin123'
  },
]

module.exports = users;