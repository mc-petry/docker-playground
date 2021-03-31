import * as amqp from 'amqplib'
import * as postgres from 'postgres'
import * as redis from 'redis'

console.log(' ------- PROCESSING CONFIG ----------')
console.log('PG:     ', process.env.PG)
console.log('RABBIT: ', process.env.RABBIT)
console.log('REDIS:  ', process.env.REDIS)

function connect() {
  try {
    const sql = postgres(process.env.PG || 'postgres://postgres:postgres@localhost:5439/mc')

    const queue = 'events'
    const open = amqp.connect(process.env.RABBIT || 'amqp://localhost')

    const redisClient = redis.createClient(process.env.REDIS || 'redis://localhost:6379')

    const sqlMaxID = sql`select max(id) from main`

    // Consumer
    sqlMaxID.then(rows => {
      let maxId = rows && rows.length > 0 ? rows[0].max : 1

      open.then(conn => conn.createChannel())
        .then(
          ch => ch.assertQueue(queue).then(() =>
            ch.consume(queue, msg => {
              if (msg !== null) {
                console.log('Received: ', msg.content.toString(), ' | maxId: ', maxId)
                sql`insert into main (id) values (${++maxId})`
                ch.ack(msg)

                redisClient.set(maxId, "passed", redis.print)
              }
            })
          )
        )
        .catch(err => {
          console.warn(err)

          setTimeout(connect, 3000)
        })
    })
  }
  catch (err) {
    console.warn(err)

    setTimeout(connect, 5000)
  }
}

setTimeout(() => connect(), 10000)