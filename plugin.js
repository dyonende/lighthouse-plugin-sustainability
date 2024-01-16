/**
 * @license Copyright 2023 The Lighthouse Authors. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */

export default {
  // Additional audits to run on information Lighthouse gathered.
  audits: [{path: 'lighthouse-plugin-sus/audits/font-format.js'},{path: 'lighthouse-plugin-sus/audits/typefaces.js'},{path: 'lighthouse-plugin-sus/audits/video-codec.js'},{path: 'lighthouse-plugin-sus/audits/unminified-html.js'}],

  // A new category in the report for the plugin output.
  //Scoring based on p. 662 from the [2022 Web Almanac](https://almanac.httparchive.org/en/2022/) by HTTP Archive

  category: {
    title: 'Sustainable Web Design',
    description:
      'Reducing the energy consumption of a web page leads to a smaller ecological footprint. ',
    auditRefs: [{id: 'unminified-css', weight: 2},
		{id: 'unminified-javascript', weight: 4},
		{id: 'uses-responsive-images', weight: 8},
		{id: 'uses-optimized-images', weight: 8},
		{id: 'uses-text-compression', weight: 1},
		{id: 'unminified-html', weight: 1},
		{id: 'font-family', weight: 10},
		{id: 'font-format', weight: 10},
		{id: 'video-codec', weight: 20},
		],
  },
};
