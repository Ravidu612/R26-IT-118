import mqtt from 'mqtt'
import { getDeviceIdFromTopic, parseStatusPayload, parseVitalsPayload } from './mqttPayloadParser.js'

const log = (message) => console.log(`[iot-mqtt] ${message}`)

export const createMqttConsumer = ({ config, store }) => {
  let client = null

  const subscribeToTopics = () => {
    if (!client) return
    const topics = [config.vitalsTopic, config.statusTopic]
    client.subscribe(topics, (error) => {
      if (error) console.error('[iot-mqtt] subscription failed:', error.message)
      else log(`subscribed to ${topics.join(', ')}`)
    })
  }

  const handleMessage = (topic, message) => {
    const receivedAt = Date.now()
    const topicDeviceId = getDeviceIdFromTopic(topic)
    if (topicDeviceId) store.touch(topicDeviceId, receivedAt)

    if (topic.endsWith('/vitals')) {
      const payload = parseVitalsPayload(topic, message, receivedAt)
      if (payload) store.ingest(payload.deviceId, payload.readings, payload.signals, receivedAt)
      return
    }

    if (topic.endsWith('/status')) {
      const status = parseStatusPayload(topic, message)
      if (status) store.updateStatus(status.deviceId, status.online, receivedAt)
    }
  }

  const start = () => {
    if (!config.enabled || !config.host || !config.username || !config.password) {
      log('disabled: MQTT_ENABLED, MQTT_HOST, MQTT_USERNAME, and MQTT_PASSWORD are required')
      return null
    }
    try {
      client = mqtt.connect({
        host: config.host,
        port: config.port,
        protocol: 'mqtts',
        username: config.username,
        password: config.password,
        clientId: config.clientId,
        reconnectPeriod: config.reconnectPeriodMs,
        connectTimeout: 10000,
        clean: true,
      })
      client.on('connect', subscribeToTopics)
      client.on('message', handleMessage)
      client.on('reconnect', () => log('reconnecting'))
      client.on('offline', () => log('offline; waiting for reconnect'))
      client.on('error', (error) => console.error('[iot-mqtt] connection error:', error.message))
      client.on('close', () => log('connection closed'))
      return client
    } catch (error) {
      console.error('[iot-mqtt] unable to start consumer:', error.message)
      return null
    }
  }

  const stop = () => {
    if (client) client.end(true)
    client = null
  }

  return { start, stop, handleMessage }
}
