// Project file migrations
// * The keys used in the migrations object represent the versions being migrated to.
// * All migrations with a higher version than that of the project file will be applied in order.
// * If no version is set in a project file, it is assumed to be 0.0.0 and all migrations are used.
// * The project file's version will be set to the projectVersion given when the store is created;
//   currently this is set to use the version in the electron-app package.json.

const migrations = {
  '0.16.0': (store) => {
    // This is the first migration; it will be applied to any project file that does not have a
    // version set by the electron-store package. As we are now using electron-store migrations,
    // the old project store version is no longer required.
    store.delete('_PROJECT_STORE_VERSION');
  },
};

export default migrations;
