/**
 * based on https://github.com/GoogleChrome/lighthouse/blob/main/core/audits/font-display.js
 */

import {Audit} from 'lighthouse';
import UrlUtils from 'lighthouse/core/lib/url-utils.js';
import * as i18n from 'lighthouse/core/lib/i18n/i18n.js';
import {Sentry} from 'lighthouse/core/lib/sentry.js';
import {NetworkRecords} from 'lighthouse/core/computed/network-records.js';

//https://systemfontstack.com/
const WEB_SAFE_FONTS = ["-apple-system", "avenir next", "avenir", "cantarell", "ubuntu", "roboto", "noto", "serif", "iowan old style", "apple garamond", "baskerville", "droid serif, times", "source serif pro","apple color emoji", "segoe ui emoji", "segoe ui symbol", "mono", "menlo", "consolas", "monaco", "liberation mono", "lucida console", "system-ui", "blinkmacsystemfont", "segoe ui", "open sans", "helvetica neue", "helvetica", "arial", "sans-serif", "times new roman", "times", "serif", "georgia", "garamond", "tahoma", "verdana","trebuchet ms", "geneva", "courier new", "courier", "monospace", "brush script mt", "cursive", "copperplate", "papyrus", "fantasy"];

const UIStrings = {
  /** Title of a diagnostic audit that provides detail on if all the text on a webpage was visible while the page was loading its webfonts. This descriptive title is shown to users when the amount is acceptable and no user action is required. */
  title: 'Use system fonts',
  /** Title of a diagnostic audit that provides detail on the load of the page's webfonts. Often the text is invisible for seconds before the webfont resource is loaded. This imperative title is shown to users when there is a significant amount of execution time that could be reduced. */
  failureTitle: 'Consider using web safe fonts',
  /** Description of a Lighthouse audit that tells the user *why* they should use the font-display CSS feature. This is displayed after a user expands the section to see more. No character length limits. The last sentence starting with 'Learn' becomes link text to additional documentation. */
  description:
    'Use standard system-level (web-safe / pre-installed) fonts as much as possible.' +
    '[Learn more about `font-family`](https://w3c.github.io/sustyweb/#take-a-more-sustainable-approach-to-typefaces).',
};

const str_ = i18n.createIcuMessageFn(import.meta.url, UIStrings);

class FontFamily extends Audit {
  /**
   * @return {LH.Audit.Meta}
   */
  static get meta() {
    return {
      id: 'font-family',
      title: str_(UIStrings.title),
      failureTitle: str_(UIStrings.failureTitle),
      description: str_(UIStrings.description),
      supportedModes: ['navigation'],
      requiredArtifacts: ['devtoolsLogs', 'CSSUsage', 'URL']
      };
  }

  /**
   * @param {LH.Artifacts} artifacts
   * @param {RegExp} passingFontFamilyRegex
   * @return {{passingURLs: Set<string>, failingURLs: Set<string>}}
   */
  static findFontFamilyDeclarations(artifacts) {
    /** @type {Set<string>} */
    const fontTypes = new Set();
    
    // Go through all the stylesheets to find all @font-face declarations
    for (const stylesheet of artifacts.CSSUsage.stylesheets) {
      // Eliminate newlines so we can more easily scan through with a regex
      const newlinesStripped = stylesheet.content.replace(/(\r|\n)+/g, ' ');
      // Find the @font-faces
      const fontFaceDeclarations = newlinesStripped.match(/@font-face\s*{(.*?)}/g) || [];
      for (const declaration of fontFaceDeclarations) {
        var fontFamilyMatch = declaration.match(/font-family\s*:\s*(.*?);/g);
	fontFamilyMatch = fontFamilyMatch[0].slice(12, -1).replaceAll('"', '');
	fontFamilyMatch = fontFamilyMatch.split(',');
	fontTypes.add(fontFamilyMatch[0].toLowerCase())
      }
    }
    return fontTypes;
  }

  /**
   * @param {LH.Artifacts} artifacts
   * @param {LH.Audit.Context} context
   * @return {Promise<LH.Audit.Product>}
   */
  static async audit(artifacts, context) {
    const devtoolsLogs = artifacts.devtoolsLogs[this.DEFAULT_PASS];
    const networkRecords = await NetworkRecords.request(devtoolsLogs, context);
    const allFonts = FontFamily.findFontFamilyDeclarations(artifacts);
        
    if (allFonts.size == 0){
	    return {score: 1, numericValue: 0, numericUnit: "fonts"};
    }
    
    var inWebFontsCounter = 0;
    
    for (const font in allFonts){
	if (font in WEB_SAFE_FONTS)
		inWebFontsCounter++;
    }
    
    const finalScore = inWebFontsCounter/allFonts.size;
    
    const safeFonts = allFonts.size - inWebFontsCounter;
    
    return {
      score: finalScore,
      numericValue: safeFonts,
      numericUnit: "font",
      displayValue: `${safeFonts} of ${allFonts.size} font(s) are not web safe`
    };
  }
}

export default FontFamily;
export {UIStrings};