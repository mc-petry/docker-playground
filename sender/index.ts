import * as amqp from 'amqplib'

console.log(' ------- SENDER CONFIG ----------')
console.log('RABBIT: ', process.env.RABBIT)

const queue = 'events'

let attemt = 0

function connect() {
  console.log(`[ RABBIT ] Connect attemt ${attemt++}`)

  const open = amqp.connect(process.env.RABBIT || 'amqp://localhost')

  open.then(conn => {
    console.log('[ RABBIT ]: Connected')

    return conn.createChannel()
  })
    .then(
      ch =>
        ch.assertQueue(queue).then(() => {
          function publish() {
            ch.sendToQueue(queue, Buffer.from(new Date().toString()))

            setTimeout(publish, 1000)
          }

          publish()
        })
    )
    .catch((err) => {
      console.log('[ RABBIT ]: Connection failed')
      console.warn(err)

      setTimeout(connect, 5000)
    })
}

setTimeout(() => connect(), 10000)