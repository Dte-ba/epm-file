# EPM File

Read/Write epm's files

# File Structure

[signature][version][content length][metadata][gzip-files][sign]

- Signature `45 50 4d` (3 first bytes)
- Version `00 01` (2 bytes)
- Content Length (for version v1, 4 bytes)
- Metadata
- Sign (hash signed)

```js
// the metadata structure
{
  packageVersion: Integer,
  uid: String,
  title: String,
  files: [,
    {
      entry: String (relative filename),
      file: String filename,
      length: String (the file content length)
    }
  ],
  tags: [String],
  content: { (Custom content here) },
  source: [ 
    { 
      author: String,
      reference: String
    } 
  ],
  collaborators: [],
  createdAt: Date,
  updatedAt: Date
}
```


## Install

```sh
npm i -D epm-file
```

## Usage

```js
import epmFile from "epm-file"

epmFile() // true
```

## License

MIT © [Delmo](http://github.com/Dte-ba)
