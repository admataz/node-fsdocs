'use strict'

const fs = require('fs-extra')
const path = require('path')

const supportedTypes = ['.md', '.json', '.txt', '.csv']

/**
 * Class FSDocs
 */
class FSDocsManager {
  /**
   * constructor
   * @param {string} dir - absolute path to the save dir
   * @returns {FSDocsManager} instance
   */
  constructor (dir) {
    if (!path.isAbsolute(dir)) {
      throw new Error('ERR_FILEPATH_NOT_ABSOLUTE')
    }
    this.basePath = dir
    fs.mkdirpSync(dir)
  }

  /**
   * @param  {...any} args - wrapper for `saveFile`
   * @param {string} dir - relative path to basePath to save destination
   * @param {string} name - name of the file
   * @param {string} ext - filetype extension .txt, .json, .md, .csv
   * @param {string | object} content - content of the file - object if JSON
   * @param {boolean} replace - overwrite the existing file
   * @returns {Promise} - path to saved file
   */
  async createFile (...args) {
    this.checkIsNotAbsolute(args[0])
    return this.saveFile(...args)
  }

  /**
   * update a file
   * @param {string} filePath relative path to the file needing updating
   * @param {string|object} content new content for the file
   * @returns {Promise} - path to updated file
   */
  async updateFile (filePath, content) {
    this.checkIsNotAbsolute(filePath)
    const updatePath = path.resolve(this.basePath, filePath)
    await this.checkExists(updatePath)
    const { dir, name, ext } = path.parse(updatePath)
    return this.saveFile(dir, name, ext, content, true)
  }

  /**
   * Read a file contents
   * @param {string} filePath path to the file
   * @returns {Promise} - string contents of file
   */
  async readFile (filePath) {
    this.checkIsNotAbsolute(filePath)
    const readPath = path.resolve(this.basePath, filePath)
    await this.checkExists(readPath)
    const stat = await fs.stat(readPath)
    if (stat.isDirectory()) {
      return this.listFiles(filePath)
    }
    return fs.readFile(readPath, { encoding: 'utf8' })
  }

  /**
   * Delete a file
   * @param {string} filePath path to the file to be deleted
   * @returns {Promise} - string with path of deleted file
   */
  async deleteFile (filePath) {
    this.checkIsNotAbsolute(filePath)
    const deletePath = path.resolve(this.basePath, filePath)
    await this.checkExists(deletePath)
    const stat = await fs.stat(deletePath)

    if (stat.isDirectory()) {
      const fileList = await fs.readdir(deletePath)
      if (fileList.length) {
        throw new Error('ERR_DELETE_DIR_WITH_CONTENTS')
      }
    }
    await fs.remove(deletePath)
    return deletePath
  }

  /**
   * Check if a file exists
   * @param {string} filePath - path to the file

   */
  async checkExists (filePath) {
    const exists = await fs.pathExists(filePath)
    if (!exists) {
      throw new Error('ERR_FILE_NOT_EXISTS')
    }
  }

  checkIsNotAbsolute (filePath) {
    if (path.isAbsolute(filePath)) {
      throw new Error('ERR_ABSOLUTE_FILEPATH_NOT_ALLOWED')
    }
  }

  /**
   * List a directory content
   * @param {string} dirPath - path to the dir to list
   * @returns {Promise} - array of string filenames
   */
  async listFiles (dirPath) {
    this.checkIsNotAbsolute(dirPath)

    const listPath = path.resolve(this.basePath, dirPath)
    await this.checkExists(listPath)
    const files = await fs.readdir(listPath)
    return files
  }

  /**
   * create a valid filename
   * @param {string} dir - path to the file
   * @param {string} name - base name for the fil
   * @param {string} ext - extension for the file
   * @param {boolean} replace overwrite or increment filename
   * @returns {Promise} - string filename
   */
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

  /**
   * sanitize by turning the content to a string
   * @param {string|object} content - content to be saved
   * @param {string} ext - filetype extension
   * @returns {string} - sanitixed content
   */
  sanitize (content, ext) {
    let sanitized = content.toString()
    if (ext === '.json') {
      if (typeof content === 'object') {
        sanitized = JSON.stringify(content)
      }
    }
    return sanitized
  }

  /**
   * Save the file to disk
   * @param {string} dir - relative path to basePath to save destination
   * @param {string} name - name of the file
   * @param {string} ext - filetype extension .txt, .json, .md, .csv
   * @param {string | object} content - content of the file - object if JSON
   * @param {boolean} replace - overwrite the existing file
   * @returns {Promise} - string path to saved file
   */
  async saveFile (dir, name, ext, content = '', replace = false) {
    const saveDir = path.resolve(this.basePath, dir)
    if (!supportedTypes.includes(ext)) {
      throw new Error('ERR_FILETYPE_NOT_SUPPORTED')
    }

    const sanitized = this.sanitize(content, ext)

    const savePath = await this.makeFileName(saveDir, name, ext, replace)

    await fs.outputFile(savePath, sanitized)
    return path.relative(this.basePath, savePath)
  }
}

module.exports = FSDocsManager
