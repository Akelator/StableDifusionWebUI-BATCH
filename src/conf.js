const path = require("path");
const { setup } = require("../setup");
exports.config = {
  framework: "jasmine",
  seleniumAddress: "http://localhost:4444/wd/hub",
  specs: ["spec.js"],
  jasmineNodeOpts: {
    defaultTimeoutInterval: setup.timeout,
  },
  capabilities: {
    browserName: "chrome",
    chromeOptions: {
      prefs: {
        download: {
          prompt_for_download: false,
          directory_upgrade: true,
          default_directory: path.resolve(__dirname, "../img/outputs/"),
        },
      },
    },
  },
};
