#!/bin/bash
mkdir -p artifacts
npm run build:portfolio-assets\
&& npm run build:portfolio-overview\
&& npm run build:portfolio-migrations
