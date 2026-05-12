function isSimulatedZoomTestUrl(url = '') {
  if (typeof url !== 'string') {
    return false;
  }

  const normalized = url.toLowerCase();
  return (
    normalized.includes('test-simulated') ||
    normalized.includes('/rec/play/test') ||
    normalized.includes('/rec/download/test')
  );
}

function sanitizeRecordingUrl(url = '') {
  return isSimulatedZoomTestUrl(url) ? '' : url;
}

module.exports = {
  isSimulatedZoomTestUrl,
  sanitizeRecordingUrl,
};
