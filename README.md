# Sustainable Web Design Lighthouse Plugin

This plugin for Google Lighthouse is part of the Master's thesis [Green Patterns in Web Design](http://resolver.tudelft.nl/uuid:0f17bd6c-ec99-4461-af0f-2ca35367d269)

| Audit name        | description                                                                                                         | new |
| ----------------- | ------------------------------------------------------------------------------------------------------------------- | --- |
| Font-family       | Checks if web safe fonts are used                                                                                   | ✅   |
| Font-format       | Checks if WOFF2 is used                                                                                             | ✅   |
| Unminified-HTML   | Minifying HTML files can reduce network payload sizes                                                               | ✅   |
| Unminified-CSS    | Minifying CSS files can reduce network payload sizes                                                                | ❎   |
| Unminified-JS     | Minifying JS files can reduce network payload sizes                                                                 | ❎   |
| Video-codec       | Checks if HEVC, H.264, VP9, AV1 are used as codecs                                                                  | ✅   |
| Responsive-images | Checks to see if the images used on the page are<br>larger than their display sizes                                 | ❎   |
| Optimised-images  | Determines if the images used are sufficiently larger<br>than JPEG compressed images without metadata at quality 85 | ❎   |
| Text-compression  | Ensure that resources loaded with gzip/br/deflate compression                                                       | ❎   |

Running the plugin can be done with
`NODE_PATH=.. npx lighthouse -- https://example.com --plugins=lighthouse-plugin-example --only-categories=lighthouse-plugin-example --view`.
