export const EnvConfiguration = () => ({
  // mongodbUri: process.env.MONGODB_URI, // <- sensible, no default
  environment: process.env.NODE_ENV || 'dev',
  port: process.env.PORT || 3000,
  defaultLimit: process.env.DEFAULT_LIMIT || 10,
  hostApi: process.env.HOST_API || 'http://localhost:3000/api',

  // // // + lo requeire x el      JOI     , xq si no viene, joi lo inserta y es una string
  // port: +process.env.PORT || 3300,
  // defaultLimit: +process.env.DEFAULT_LIMIT || 10,
});
