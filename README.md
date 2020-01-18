# FSDocs

A node utility to handle saving text files.

This makes it easier to save text content to disk - for instance when a payload of content in an API request needs to be saved to the server as a static file. 

## Usage

Instantiate the `FSDocs` class with the `basePath` for the save location - must be an absolute path

```js
const FSDocs = require('fsdocs')

const docsManager = new FSDocs('/path/to/save/loation)

```


### Create a file 
`docsManager.createFile(path, name, ext, content)`
returns a promise with the absolute path of the created file


```js
await docsManager.createFile('path', 'file-name', '.txt', 'File Content')
```

### Read a file
`docsManager.readFile(path)`
returns a promise with the content of the file


```js
await docsManager.readFile('path/to/file.txt')
```

### Read a directory 
`docsManager.listFiles(path)`
returns a promise with an array of filenames


```js
await docsManager.listFiles('path/to/dir')
```

### Update a file
`docsManager.updateFile(path,  content)`
returns a promise with the absolute path of the created file


```js
await docsManager.updateFile('path/to/file.txt', 'Updated File Content')
```

### Delete a file
`docsManager.deleteFile(path)`
returns a promise with the absolute path of the deleted file


```js
await docsManager.deleteFile('path/to/file.txt')
```


## API documentation
Read the [JSDocs](/docs/index.html)



2020 Adam Davis ([ICS](./license.txt))





