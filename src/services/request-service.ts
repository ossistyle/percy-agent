import PercyClientService from './percy-client-service'
import Axios from 'axios'
import logger from '../utils/logger'
import unique from '../utils/unique-array'

export default class RequestService extends PercyClientService {
  async processManifest(requestManifest: string[]): Promise<any[]> {
    let resources: any[] = []

    requestManifest = unique(requestManifest)

    for (let request of requestManifest) {
      if (request.match(/http:\/\/localhost:5338\/percy/)) {
        logger.warn(`Skipping Percy Agent requests: ${request}`)
        break
      }

      logger.info(`Processing request: ${request}`)

      await Axios({
        method: 'get',
        url: request,
        responseType: 'blob'
      }).then(response => {
        let resource = this.percyClient.makeResource({
          resourceUrl: this.parseUrlPath(request),
          content: response.data,
          isRoot: false,
          mimetype: response.headers['Content-Type']
        })

        resources.push(resource)
      }).catch(error => {
        logger.error(`failed to GET: ${request}. ${error}`)
      })
    }

    return resources
  }
}
