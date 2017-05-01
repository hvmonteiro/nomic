module.exports = function (grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    // Before generating any new files, remove any previously-created files.
    clean: {
      build: ['build', 'src/packages', 'src/dist', 'src/node_modules']
    },
    jshint: {
      all: ['Gruntfile.js', 'src/nomic.js', 'src/version.json']
    },
    version: {
      nomic: {
        src: ['package.json', 'src/package.json', 'src/version.json']
      }
    },
    exec: {
      list_files: {
        cmd: 'electron src/nomic.js --test'
      }
    }
  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-exec');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  require('load-grunt-tasks')(grunt);

  grunt.registerTask('test', ['clean', 'jshint', 'exec']);
};
