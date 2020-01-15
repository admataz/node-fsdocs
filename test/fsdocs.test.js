const t = require('tap')

const path = require('path')
const fs = require('fs-extra')

const FSDocs = require('../')
const docsManager = new FSDocs('./docs')
const dest = path.resolve(__dirname, 'test-files')

t.test('FSDocs', (t) => {
  t.beforeEach(async () => {
    await fs.emptyDir(dest)
  })

  t.test('file creation', async (t) => {
    const createdFile = await docsManager.createFile(dest, 'my-test', '.txt', 'Test plain text')
    t.equal(createdFile, `${dest}/my-test.txt`)
    const sampleContent = await fs.readFile(createdFile, 'utf8')
    t.equal(sampleContent, 'Test plain text')

    await docsManager.createFile(dest, 'my-test', '.json', { test: ['json', 'is', 'ok'], what: null, something: false })
    await docsManager.createFile(dest, 'my-test', '.md', '# Test Markdown')
    await docsManager.createFile(dest, 'my-test', '.csv', '1,2,3,4,5,6,7')

    // will create a file with incremented filename
    await docsManager.createFile(dest, 'my-test', '.json', { test: ['json2', 'is2', 'ok2'], what: null, something: false })
    await docsManager.createFile(dest, 'my-test', '.json', { test: ['json3', 'is3', 'ok3'], what: null, something: false })

    const fileList = await fs.readdir(dest)
    t.same(fileList.sort(), ['my-test.json', 'my-test.md', 'my-test.txt', 'my-test.csv', 'my-test_1.json', 'my-test_2.json'].sort())

    const fileList2 = await docsManager.listFiles(dest)
    t.same(fileList2.sort(), fileList2.sort())
  })

  t.test('file create read update delete', async (t) => {
    const created = await docsManager.createFile(dest, 'my-test', '.txt', 'Test plain text')
    await docsManager.updateFile(created, 'Updated Content')
    const readContent = await fs.readFile(created, 'utf8')
    t.equal(readContent, 'Updated Content')
    const readContent2 = await docsManager.readFile(created)
    t.equal(readContent, readContent2)

    await docsManager.deleteFile(created)
    const fileList = await fs.readdir(dest)
    t.same(fileList, [])
  })

  t.test('invalid', async (t) => {
    t.rejects(async () => docsManager.createFile(dest, 'my-test', '.js', 'console.log("bad script")'), 'ERR_FILETYPE_NOT_SUPPORTED')
    t.rejects(async () => docsManager.createFile('localpath', 'my-test', '.js', 'Test plain text'), 'ERR_FILEPATH_NOT_ABSOLUTE')
    t.rejects(async () => docsManager.readFile('non-existent.txt'), 'ERR_FILE_NOT_EXISTS')
  })

  t.end()
})

// const deleted = await docsManager.deleteFile(createdFile)

// // invalid input gets sanitized
// docsManager.createFile(dest, 'my-test', 'txt', function(){console.log('errr')}).catch(err => console.log(err))
// docsManager.createFile(dest, 'my-test', 'txt', {what: 'object'}).catch(err => console.log(err))

// // invalid parameters get caught
// docsManager.createFile(dest, 'my-test', 'js', 'console.log("bad script")').catch(err => console.log(err))
// docsManager.createFile('localpath', 'my-test', 'js', 'Test plain text').catch(err => console.log(err))
// })
