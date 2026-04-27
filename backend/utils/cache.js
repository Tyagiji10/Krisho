import NodeCache from 'node-cache';

// stdTTL: 5 minutes (300 seconds), checkperiod: 60 seconds
const cache = new NodeCache({ stdTTL: 300, checkperiod: 60 });

export default cache;
