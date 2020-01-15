'use strict'

const fs = require('fs-extra')
const path = require('path')

const supportedTypes = ['.md', '.json', '.txt', '.csv']

class FSDocsManager {
  constructor (docsPath = '') {
    this.docsPath = docsPath
  }

  async createFile (...args) {
    return this.saveFile(...args)
  }

  async updateFile (filePath, content) {
    await this.checkExists(filePath)
    const { dir, name, ext } = path.parse(filePath)
    return this.saveFile(dir, name, ext, content, true)
  }

  async readFile (filePath) {
    await this.checkExists(filePath)
    return fs.readFile(filePath, { encoding: 'utf8' })
  }

  async deleteFile (filePath) {
    await this.checkExists(filePath)
    await fs.remove(filePath)
    return filePath
  }

  async checkExists (filePath) {
    const exists = await fs.pathExists(filePath)
    if (!exists) {
      throw new Error('ERR_FILE_NOT_EXISTS')
    }
  }

  async listFiles (dirPath) {
    await this.checkExists(dirPath)
    const files = await fs.readdir(dirPath)
    return files
  }

  async makeFileName (dir, name, ext, replace = false) {
    const savePath = path.resolve(dir, name)

    if (replace || !(await fs.pathExists(`${savePath}${ext}`))) {
      return `${savePath}${ext}`
    }

    let fileNameIncr = 1
    while (await fs.pathExists(`${savePath}_${fileNameIncr}${ext}`)) {
      fileNameIncr++
    }

    return `${savePath}_${fileNameIncr}${ext}`
  }

  async saveFile (dir, name, ext, content = '', replace = false) {
    if (!path.isAbsolute(dir)) {
      throw new Error('ERR_FILEPATH_NOT_ABSOLUTE')
    }
    if (!supportedTypes.includes(ext)) {
      throw new Error('ERR_FILETYPE_NOT_SUPPORTED')
    }

    let sanitized = content.toString()

    if (ext === '.json') {
      if (typeof content === 'object') {
        sanitized = JSON.stringify(content)
      }
    }

    const savePath = await this.makeFileName(dir, name, ext, replace)

    await fs.outputFile(savePath, sanitized)
    return savePath
  }
}

module.exports = FSDocsManager
