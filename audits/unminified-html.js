/**
 * based on https://github.com/GoogleChrome/lighthouse/blob/main/core/audits/byte-efficiency/unminified-css.js
 */

import {Audit} from 'lighthouse';
import {estimateTransferSize} from 'lighthouse/core/lib/script-helpers.js';
import * as i18n from 'lighthouse/core/lib/i18n/i18n.js';
import { Buffer } from "node:buffer";
import minifyHtml from "@minify-html/node";

const IGNORE_THRESHOLD_IN_PERCENT = 5;
const IGNORE_THRESHOLD_IN_BYTES = 2048;

const UIStrings = {
  /** Imperative title of a Lighthouse audit that tells the user to minify (remove whitespace) the page's HTML code. This is displayed in a list of audit titles that Lighthouse generates. */
  title: 'Minify HTML',
  /** Description of a Lighthouse audit that tells the user *why* they should minify (remove whitespace) the page's HTML code. This is displayed after a user expands the section to see more. No character length limits. The last sentence starting with 'Learn' becomes link text to additional documentation. */
  description: 'Minifying HTML files can reduce network payload sizes. [Learn More](https://w3c.github.io/sustyweb/#minify-your-html-css-and-javascript) ',
};

const str_ = i18n.createIcuMessageFn(import.meta.url, UIStrings);

/**
 * @fileoverview Minify HTML
 */
class UnminifiedHTML extends Audit {
   /**
   * @return {LH.Audit.Meta}
   */
  static get meta() {
    return {
      id: 'unminified-html',
      title: str_(UIStrings.title),
      failureTitle: 'Minify HTML',
      supportedModes: ['navigation'],
      description: str_(UIStrings.description),
      // The name of the artifact provides input to this audit.
      requiredArtifacts: ['MainDocumentContent']
    };
  }
  
  static computeWaste(content, networkRecord) {
    const minified = minifyHtml.minify(Buffer.from(content), { keep_spaces_between_attributes: true, keep_comments: true });

    const totalBytes = estimateTransferSize(networkRecord, content.length, 'Document');
    const wastedRatio = 1 - minified.length / content.length;
    const wastedBytes = Math.round(totalBytes * wastedRatio);

    return {
      totalBytes,
      wastedBytes,
      wastedPercent: 100 * wastedRatio,
    };
  }

  static audit(artifacts, networkRecord) {
    const documentHTML = artifacts.MainDocumentContent;
    
    const result = UnminifiedHTML.computeWaste(documentHTML, networkRecord);
    
    var score = 1;
      // If the ratio is minimal, the file is likely already minified, so ignore it.
      // If the total number of bytes to be saved is quite small, it's also safe to ignore.
      if (!(result.wastedPercent < IGNORE_THRESHOLD_IN_PERCENT ||
          result.wastedBytes < IGNORE_THRESHOLD_IN_BYTES ||
          !Number.isFinite(result.wastedBytes))) score = 1-(result.wastedPercent/100); 
      
      const wastedKiB = Math.round(result.wastedBytes/1024);
	  
    return {
      score: score,
      displayValue: `Potential savings of ${wastedKiB} KiB`,
    };
  }
}

export default UnminifiedHTML;
export {UIStrings};