# Pattern Library

## Quick Reference

#### Server

While working on the style guide , run **gulp server**. Open localhost:9000 in browser. All files are being watched for changes.

```
gulp server
```
When finished, run **gulp** to build production ready files.

```
gulp
```
#### Building Files

If you wish to build all production ready files, run **gulp**.

```
gulp
```

## Set Up

#### Install Node

You will need to have Node.js installed on your machine. Click the install button on the [Node.js](http://nodejs.org/) website, download the installer, and accept all default settings when installing.

#### Install Gulp

Install [Gulp](http://gulpjs.com/) globally.

```
npm install -g gulp
```
#### Install Bower

Install [Bower](http://bower.io/) globally.

```
npm install -g bower
```

#### Install Node Modules & Bower Packages

Now that you have Node, Gulp and Bower installed you can install the Node modules and Bower packages required to build.

Install Node modules (specified in package.json).

```
npm install
```
Next, install Bower packages (specified in bower.json).

```
bower install
```