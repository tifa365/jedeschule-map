// eslint-disable-next-line no-unused-vars
const Config = {
  namedProjections: [
    [
      "EPSG:3857",
      "+title=WGS 84 (meter) +proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext +no_defs",
    ],
    [
      "EPSG:4326",
      "+title=WGS 84 (long/lat) +proj=longlat +ellps=WGS84 +datum=WGS84 +units=degrees +no_defs +type=crs",
    ],
  ],
  layerConf: "./resources/services.json",
  restConf: "./resources/rest-services.json",
  styleConf: "./resources/style_v3.json",
  wfsImgPath: "./resources/img/",
  ignoredKeys: ["BOUNDEDBY", "SHAPE", "SHAPE_LENGTH", "SHAPE_AREA", "OBJECTID", "GLOBALID", "GEOMETRY", "SHP", "SHP_AREA", "SHP_LENGTH", "GEOM", "bl"],
  // Must stay enabled: with enabled:false Masterportal 3.7 hangs at startup.
  // Only "de" is listed and the menu has no language section, so users see no switcher.
  portalLanguage: {
    enabled: true,
    debug: false,
    languages: {
      de: "Deutsch",
    },
    fallbackLanguage: "de",
    changeLanguageOnStartWhen: ["querystring", "localStorage", "htmlTag"],
  },
};
