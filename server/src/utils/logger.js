const logger = {
  info: (msg, meta = '') => console.log(`[INFO] ${new Date().toISOString()} - ${msg}`, meta ? JSON.stringify(meta) : ''),
  error: (msg, err = '') => console.error(`[ERROR] ${new Date().toISOString()} - ${msg}`, err ? JSON.stringify(err) : ''),
  warn: (msg, meta = '') => console.warn(`[WARN] ${new Date().toISOString()} - ${msg}`, meta ? JSON.stringify(meta) : '')
};

module.exports = logger;
