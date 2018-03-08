const mysql = require('mysql')
const config = require('./config')

const pool = mysql.createPool(config)

// user table sql
const userSql = {
  create: 
    `create table if not exists user(
      user_id     int(11) not null auto_increment,
      auth_secret varchar(1024) not null,
      auth_key    varchar(1024) not null,
      endpoint    varchar(1024) not null,
      create_time timestamp not null default current_timestamp,
      PRIMARY KEY (user_id)
    )auto_increment=10000;`,
  insert: 
    `insert into user set auth_secret=?,auth_key=?,endpoint=?;`
}

// db query
function query(sql, value) {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) {
        reject(err)
      } else {
        connection.query(sql, value, (err, rows) => {
          if (err) {
            reject(err)
          } else {
            resolve(rows)
          }
          connection.release()
        })
      }
    })
  })
}

// db create
async function createTable(sql) {
  return query(sql, [])
}

// user subscribe
async function subscribe(value) {
  return query(userSql.insert, value)
}

createTable(userSql.create)

module.exports = {
  subscribe
}