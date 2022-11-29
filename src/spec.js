const { modes } = require("./modes");
const { setup } = require("../setup");
const { element, browser } = require("protractor");
const Colors = require("colors");
const path = require("path");
const remote = require("selenium-webdriver/remote");
const url = setup.url;
const maximize = setup.maximize;
const mode = setup.mode;
const scaleMode = setup.scaleMode;
const startIndex = setup.startIndex;
const endIndex = setup.endIndex;
const pad = setup.pad;
const inputImageExtension = setup.inputImageExtension;
const timeout = setup.timeout;
const endTimeout = setup.endTimeout;

describe("Stable Difussion WebUI BATCH", () => {
  it("should finish task", async () => {
    by.addLocator("css_sr", (cssSelector, opt_parentElement, opt_rootSelector) => {
      let selectors = cssSelector.split("::sr");
      if (selectors.length === 0) {
        return [];
      }

      let shadowDomInUse = document.head.createShadowRoot || document.head.attachShadow;
      let getShadowRoot = (el) => (el && shadowDomInUse ? el.shadowRoot : el);
      let findAllMatches = (selector, targets, firstTry) => {
        let using,
          i,
          matches = [];
        for (i = 0; i < targets.length; ++i) {
          using = firstTry ? targets[i] : getShadowRoot(targets[i]);
          if (using) {
            if (selector === "") {
              matches.push(using);
            } else {
              Array.prototype.push.apply(matches, using.querySelectorAll(selector));
            }
          }
        }
        return matches;
      };

      let matches = findAllMatches(selectors.shift().trim(), [opt_parentElement || document], true);
      while (selectors.length > 0 && matches.length > 0) {
        matches = findAllMatches(selectors.shift().trim(), matches, false);
      }
      return matches;
    });

    browser.waitForAngularEnabled(false);
    browser.get(url);
    browser.driver.manage().timeouts().setScriptTimeout(timeout);
    browser.setFileDetector(new remote.FileDetector());
    if (maximize) browser.manage().window().maximize();

    let buttons = undefined;
    let countButtons = 0;
    while (!countButtons) {
      try {
        buttons = element.all(by.css_sr("gradio-app::sr button"));
        countButtons = await buttons.count();
      } catch (e) {
        countButtons = 0;
      }
      await browser.driver.sleep(500);
    }
    const modeButton = await buttons.get(mode);
    modeButton.click();

    if (mode === modes.RealESRGAN) {
      const selectOption = element(by.css_sr("gradio-app::sr select.gr-box"));
      await selectOption.click();
      const options = element.all(by.css_sr("gradio-app::sr select.gr-box option"));
      const option = await options.get(scaleMode);
      option.click();
    }

    for (let index = startIndex; index <= endIndex; index++) {
      const fileName = index.toString().padStart(pad, "0");
      console.log(Colors.cyan(`-> start file ${fileName}.${inputImageExtension}`));

      let fileExists = true;
      try {
        const fileToUpload = `../img/inputs/${fileName}.${inputImageExtension}`;
        const absolutePath = path.resolve(__dirname, fileToUpload);
        const inputElement = element(by.css_sr("gradio-app::sr div.w-full input.hidden-upload"));
        await inputElement.sendKeys(absolutePath);
      } catch (e) {
        console.log(Colors.red(`  - SKIP ${fileName}.${inputImageExtension} (doesn't exist)`));
        fileExists = false;
      }
      browser.driver.sleep(100);
      if (!fileExists) continue;

      const startButton = element(by.css_sr("gradio-app::sr button.self-start"));
      startButton.click();

      await browser.driver.sleep(200);

      let inProgress = true;
      while (inProgress) {
        try {
          const progressBar = element(by.css_sr("gradio-app::sr #gan_image div.progress-bar"));
          await progressBar.getCssValue("display");
          inProgress = true;
        } catch (e) {
          inProgress = false;
        }
      }

      let src = undefined;
      while (!src) {
        try {
          const result = element(by.css_sr("gradio-app::sr #gan_image img.object-contain"));
          src = await result.getAttribute("src");
        } catch (e) {
          src = undefined;
        }
        await browser.driver.sleep(500);
      }

      browser.driver.executeScript(
        () => {
          ((a) => {
            document.body.appendChild(a);
            a.setAttribute("href", arguments[0]);
            a.download = `${arguments[1]}.png`;
            a.click();
            delete a;
          })(document.createElement("a"));
        },
        src,
        fileName
      );
      console.log(Colors.green(`  - saved as ${fileName}.png`));

      const modifyUploadButtons = element.all(by.css_sr("gradio-app::sr div.modify-upload button"));
      const clearUploadButton = await modifyUploadButtons.get(1);
      clearUploadButton.click();
    }

    await browser.driver.sleep(endTimeout);
    expect(countButtons).toBe(12);
  });
});
