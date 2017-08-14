## hapi-sequelize - a hapi plugin for the sequelize orm

### Warning

This version of hapi-sequelize should be compatible with at least Hapi 13+ & Sequelize 3.x. If you're
encountering an issue related to any specific version please open an issue. The rewrite of this plugin
 (3.x) has simplified things and made the plugin a bit more flexible. 
 
### Installation

`npm install --save hapi-database`

### Configuration

Simply pass in your sequelize instance and a few basic options and voila. Options accepts a single object
 or an array for multiple dbs.

```javascript
server.register([
  {
      register: require('hapi-database'),
      options: [ 
        {
          name: 'dbname', // identifier
          paths: ['./server/models/**/*.js'],  // paths/globs to model files
          connection: {
            uri: ''
          }, // sequelize instance
          sync: true, // sync models - default false
          forceSync: false, // force sync (drops tables) - default false
          onConnect: function (database) { // Optional
            // migrations, seeders, etc.
          }
        }
      ]
  }
]);
```