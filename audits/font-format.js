/**
 * based on https://github.com/GoogleChrome/lighthouse/blob/main/core/audits/font-display.js
 */


import {Audit} from 'lighthouse';
import UrlUtils from 'lighthouse/core/lib/url-utils.js';
import * as i18n from 'lighthouse/core/lib/i18n/i18n.js';
import {Sentry} from 'lighthouse/core/lib/sentry.js';
import {NetworkRecords} from 'lighthouse/core/computed/network-records.js';

const PASSING_FONT_DISPLAY_REGEX = /^(block|fallback|optional|swap)$/;
const CSS_FORMAT_REGEX = /format\((.*?)\)/;
const CSS_FORMAT_GLOBAL_REGEX = new RegExp(CSS_FORMAT_REGEX, 'g');

const UIStrings = {
  /** Title of a diagnostic audit that provides detail on if all the text on a webpage was visible while the page was loading its webfonts. This descriptive title is shown to users when the amount is acceptable and no user action is required. */
  title: 'Modern font formats',
  /** Title of a diagnostic audit that provides detail on the load of the page's webfonts. Often the text is invisible for seconds before the webfont resource is loaded. This imperative title is shown to users when there is a significant amount of execution time that could be reduced. */
  failureTitle: 'Consider using woff2',
  /** Description of a Lighthouse audit that tells the user *why* they should use the font-display CSS feature. This is displayed after a user expands the section to see more. No character length limits. The last sentence starting with 'Learn' becomes link text to additional documentation. */
  description:
    'Use standard system-level (web-safe / pre-installed) fonts as much as possible.' +
    '[Learn more about `font-family`](https://w3c.github.io/sustyweb/#take-a-more-sustainable-approach-to-typefaces).',
};

const str_ = i18n.createIcuMessageFn(import.meta.url, UIStrings);

class FontFormat extends Audit {
  /**
   * @return {LH.Audit.Meta}
   */
  static get meta() {
    return {
      id: 'font-format',
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
  static findFontFormatDeclarations(artifacts) {
    /** @type {Set<string>} */
    var isWOFF2Counter = 0;
    var counter = 0;
    
    // Go through all the stylesheets to find all @font-face declarations
    for (const stylesheet of artifacts.CSSUsage.stylesheets) {
      // Eliminate newlines so we can more easily scan through with a regex
      const newlinesStripped = stylesheet.content.replace(/(\r|\n)+/g, ' ');
      // Find the @font-faces
      const fontFaceDeclarations = newlinesStripped.match(/@font-face\s*{(.*?)}/g) || [];
      // Go through all the @font-face declarations to find the format
      for (const declaration of fontFaceDeclarations) {
        const rawFontFormat = declaration.match(CSS_FORMAT_GLOBAL_REGEX);
        // If not found, we can't really do anything; bail
        if (!rawFontFormat) continue;
	
	for (const format of rawFontFormat){
		if (format.includes("woff2")){
			isWOFF2Counter++;
		}
	}
	counter++;
      }

    }
    return {woff2: isWOFF2Counter, counter: counter};
  }

  /**
   * @param {LH.Artifacts} artifacts
   * @param {LH.Audit.Context} context
   * @return {Promise<LH.Audit.Product>}
   */
  static async audit(artifacts, context) {
    const devtoolsLogs = artifacts.devtoolsLogs[this.DEFAULT_PASS];
    const networkRecords = await NetworkRecords.request(devtoolsLogs, context);
    const results = FontFormat.findFontFormatDeclarations(artifacts);
      
    if (results.counter == 0){
	    return {score: 1, numericValue: 0, numericUnit: "fonts"};
    }
    
    const score = results.woff2/results.counter;
    const modernFontFormats = results.counter - results.woff2;
    return {
      score: score,
      numericValue: modernFontFormats,
      numericUnit: "font",
      displayValue: `${modernFontFormats} of ${results.counter} font(s) did not use woff2`
    };
  }
}

export default FontFormat;
export {UIStrings};