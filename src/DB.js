import Sequelize from 'sequelize'
import Models from './models'

export default class DB {
  constructor (options) {
    this._options = options

    this.sequelize = options.sequelize
    this.paths = options.paths
    this.models = {}
    this._inited = false
  }

  getModel (name) {
    return this.models.hasOwnProperty(name) ? this.models[name] : null
  }

  getModels () {
    return this.models
  }

  // 加载模型
  loadModels (paths) {

    // 获取所有模型文件
    const files = Models.getFiles(paths)
    // 加载所有模型
    const models = Models.applyRelations(Models.load(files, this.sequelize.import.bind(this.sequelize)))

    const promises = [new Promise((resolve, reject) => {
      resolve(models)
    })]
    for (let name in models) {
      if (this.models.hasOwnProperty(name)) {
        throw new Error(`Model ${name} redefined.`)
      }
      const model = this.models[name] = models[name]

      if (this._options.sync) {
        promises.push(model.sync({
          force: this._options.forceSync
        }))
      }
    }

    this.paths.concat(paths)
    
    this._inited = true
    return Promise.all(promises)
  }
}
