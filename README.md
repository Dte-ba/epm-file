# EPM File

Read/Write epm's files

# File Structure

[signature][version][content length][gzip-files][metadata]

offset   |bytes      |description
---------|-----------|-----------
0|3|`0x45504d` magic number
3|1|Version needed to read the file
4|4|Content Length
8|n|Gzip files
n|EOF|Metadata

## Metadata

[base64 encoded metadata](.[asymmetric signature] optional)

```js
// the metadata structure
{
  // ID único
  uid: String,
  // versionado
  version: Integer,
    
  // tipo de paquete
  type: String,
  // título
  title: String,
  // descripción o ficha técnica
  description: String,
  // resumen
  summary: String,
  // observaciones del contenido (visualización)
  remark: String,
  // categorización del contenido
  category: [String],
  // palabras claves
  tags: [String],
  // contenido personalizado
  custom: { /*(Custom content here)*/ },
  // fuente\/s del contenido
  sources: [ 
    { 
      author: String,
      reference: String
    } 
  ],
  // colaboradores/curadores 'Name Lastname <email>'
  collaborators: [String],

  // archivos
  files: [
    {
      entry: String, /*(relative filename)*/
      length: String, /*(the file content length)*/
      comment: String /*(the file comment)*/
    }
  ],

  // fecha de creación
  createdAt: Date,
  //fecha de actualización
  updatedAt: Date
}
```

## License

MIT © [DTE](http://github.com/Dte-ba)
