// MODEL
const User = require('./models/User')

// MIGRATION DATA
const users = require('./migrate/users.js')

// MongoDB Connect
const connectDB = require('./config/db');
connectDB()

const importData = async () => {
  try {
    await destroyData(true)

    // USER MIGRATION
    for (let index = 0; index < users.length; index ++) {
      await User.create(users[index])
    }
    console.log('Users Imported!')

    process.exit()
  } catch (error) {
    console.error(`${error}`)
    process.exit(1)
  }
}

const destroyData = async (onImport = false) => {
  try {
    await User.deleteMany()
    console.log('Data Destroyed!')
    if (!onImport) process.exit()
  } catch (error) {
    console.error(`${error}`)
    process.exit(1)
  }
}

if (process.argv[2] === '-d') {
  destroyData()
} else {
  importData()
}