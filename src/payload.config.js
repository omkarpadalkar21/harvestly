"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var db_mongodb_1 = require("@payloadcms/db-mongodb");
var payload_cloud_1 = require("@payloadcms/payload-cloud");
var richtext_lexical_1 = require("@payloadcms/richtext-lexical");
var path_1 = require("path");
var payload_1 = require("payload");
var url_1 = require("url");
var sharp_1 = require("sharp");
var Users_1 = require("./collections/Users");
var Media_1 = require("./collections/Media");
var Categories_1 = require("./collections/Categories");
var filename = (0, url_1.fileURLToPath)(import.meta.url);
var dirname = path_1.default.dirname(filename);
exports.default = (0, payload_1.buildConfig)({
  admin: {
    user: Users_1.Users.slug,
    importMap: {
      baseDir: path_1.default.resolve(dirname),
    },
  },
  collections: [Users_1.Users, Media_1.Media, Categories_1.Categories],
  editor: (0, richtext_lexical_1.lexicalEditor)(),
  secret: process.env.PAYLOAD_SECRET || "",
  typescript: {
    outputFile: path_1.default.resolve(dirname, "payload-types.ts"),
  },
  db: (0, db_mongodb_1.mongooseAdapter)({
    url: process.env.DATABASE_URI || "",
  }),
  sharp: sharp_1.default,
  plugins: [
    (0, payload_cloud_1.payloadCloudPlugin)(),
    // storage-adapter-placeholder
  ],
});
