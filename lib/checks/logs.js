'use strict';

const fs        = require('fs');
const path      = require('path');
const constants = require('../constants');
const Check     = require('../check');

/**
 *  This will simulate the creation of log file in a certain directory
 *  to determine if there is no issue upon writing the file to the log directory
 */
module.exports = class Logs extends Check {
    constructor(config) {
        super(config);
        this.config.logPath = this.config.logPath || path.normalize(`${__dirname}/../../logs`);
    }

    async start() {
        try {
            const { filename, content, logPath, name } = this.config;
            const logFile       = path.join(logPath, filename);
            const fileExistsMsg = `File Exists: the log file already exists ${logFile}`;

            if (fs.existsSync(logFile) === true) {
                this.crit(fileExistsMsg, `${name} > ${fileExistsMsg}`);
                return;
            };

            fs.writeFileSync(logFile, content, 'utf8');
            fs.unlinkSync(logFile);
            this.ok();
        } catch (err) {
            this.error = new Error(err.message);
            this.error.status = err.status;
            
            if (err.response) {
                this.error.body = err.response.text;
            }

            this.traversable = false;
            this.crit();
        }
        setTimeout(this.start.bind(this), this.interval);
        return this;
    }
}
