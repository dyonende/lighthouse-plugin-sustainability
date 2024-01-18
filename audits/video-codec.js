import {Audit} from 'lighthouse';
import * as jsdom from "jsdom";
import { execSync } from 'child_process';

/**
 * @fileoverview Tests the codecs of found video elements
 */
 

const MODERN_VIDEO_CODECS = ["hevc", "h264", "vp9", "av1"] ;


class VideoCodec extends Audit {
  static get meta() {
    return {
      id: 'video-codec',
      title: 'Modern video codecs',
      failureTitle: 'Some of the used video codecs are not energy efficient',
      description: 'Compress your video; by reducing the quality and offering different resolutions / dimensions (sizes) before uploading to a server or content management system. [Learn more](https://w3c.github.io/sustyweb/#compress-your-files)',

      // The name of the artifact provides input to this audit.
      requiredArtifacts: ['MainDocumentContent', 'URL'],
    };
  }

  static audit(artifacts) {
    const baseURL = artifacts.URL.finalDisplayedUrl;
    const videoURLs = new Set();
    const dom = new jsdom.JSDOM(artifacts.MainDocumentContent);
    const vidEl = dom.window.document.querySelectorAll("video");
    
    var modernCodecCounter = 0;
        
    //collects video sources
    for (const vid of vidEl){
	    var url = vid.src;
	    //if <source> is used instead of src
	    //ignores fallback sources
	    if (!url) url = vid.querySelector("source").src;
	    //convert to absolute url
	    url =  new URL(url, baseURL).href;
	    videoURLs.add(url);
    }
    
    //hacky workarond to analyse the codec using ffmpeg command line tool
    for (const vidUrl of videoURLs.values()){
	    const output = execSync('ffprobe -v quiet -print_format json -show_streams '+vidUrl, { encoding: 'utf-8' });
	    var codec = JSON.parse(output).streams[0].codec_name.trim();
	    
	    if (MODERN_VIDEO_CODECS.includes(codec)){
		    modernCodecCounter++;
	    }
    }
    
    if (videoURLs.size == 0 ){
	    return {score: null, notApplicable: true, numericValue: 0, numericUnit: "video"};
    }
   
    const nonOptimisedCodes = videoURLs.size - modernCodecCounter;
    
    return {
      score: modernCodecCounter/videoURLs.size,
      numericValue: nonOptimisedCodes,
      numericUnit: "video",
      displayValue: `${nonOptimisedCodes} of ${videoURLs.size} video(s) can be optimised`
    };
  }
}

export default VideoCodec;