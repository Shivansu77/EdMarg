const axios = require('axios');

/**
 * Validate that all required Zoom environment variables are set.
 * Throws a descriptive error if any are missing.
 */
function validateZoomEnv() {
  const required = ['ZOOM_ACCOUNT_ID', 'ZOOM_CLIENT_ID', 'ZOOM_CLIENT_SECRET'];
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing Zoom environment variables: ${missing.join(', ')}. ` +
      'Please set them in your .env file.'
    );
  }
}

/**
 * Get Zoom Access Token using Server-to-Server OAuth
 */
async function getZoomAccessToken() {
  validateZoomEnv();

  try {
    console.log('[Zoom Auth] Requesting access token...');

    const response = await axios.post(
      `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${process.env.ZOOM_ACCOUNT_ID}`,
      {},
      {
        auth: {
          username: process.env.ZOOM_CLIENT_ID,
          password: process.env.ZOOM_CLIENT_SECRET,
        },
      }
    );

    console.log('[Zoom Auth] Access token obtained successfully');
    return response.data.access_token;
  } catch (error) {
    const errData = error.response?.data || {};
    console.error('[Zoom Auth] Failed to get access token:', {
      status: error.response?.status,
      reason: errData.reason || errData.error || error.message,
      errorDescription: errData.error_description || 'N/A',
    });
    throw new Error(
      `Zoom authentication failed: ${errData.reason || errData.error_description || error.message}`
    );
  }
}

/**
 * Create a new Zoom meeting
 * @param {Object} params
 * @param {String} params.topic Meeting topic
 * @param {String} params.startTime Meeting start time (ISO 8601 string)
 * @param {Number} params.duration Duration in minutes
 * @returns {{ zoomMeetingId: string, joinUrl: string, startUrl: string }}
 */
async function createZoomMeeting({ topic, startTime, duration }) {
  try {
    const token = await getZoomAccessToken();

    const meetingData = {
      topic: topic,
      type: 2, // Scheduled meeting
      start_time: startTime,
      duration: duration || 45,
      timezone: 'Asia/Kolkata',
      settings: {
        auto_recording: 'cloud',
        host_video: true,
        participant_video: true,
        join_before_host: false,
        mute_upon_entry: true,
        waiting_room: true,
      },
    };

    console.log('[Zoom Meeting] Creating meeting:', {
      topic,
      start_time: startTime,
      duration: duration || 45,
    });

    const response = await axios.post(
      'https://api.zoom.us/v2/users/me/meetings',
      meetingData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const result = {
      zoomMeetingId: String(response.data.id),
      joinUrl: response.data.join_url,
      startUrl: response.data.start_url,
    };

    console.log('[Zoom Meeting] Meeting created successfully:', {
      zoomMeetingId: result.zoomMeetingId,
      joinUrl: result.joinUrl ? '(set)' : '(missing)',
      startUrl: result.startUrl ? '(set)' : '(missing)',
    });

    return result;
  } catch (error) {
    const errData = error.response?.data || {};
    console.error('[Zoom Meeting] Failed to create meeting:', {
      status: error.response?.status,
      code: errData.code,
      message: errData.message || error.message,
    });
    throw new Error(
      `Zoom meeting creation failed: ${errData.message || error.message}`
    );
  }
}

/**
 * Download a Zoom cloud recording as a readable stream.
 * Zoom requires an access token appended as a query parameter for downloads.
 *
 * @param {string} downloadUrl - The download_url from Zoom's recording.completed webhook
 * @returns {Promise<import('stream').Readable>} Node Readable stream of the video data
 */
async function downloadRecording(downloadUrl) {
  try {
    const token = await getZoomAccessToken();

    // Zoom download URLs require the access_token as a query parameter
    const separator = downloadUrl.includes('?') ? '&' : '?';
    const authenticatedUrl = `${downloadUrl}${separator}access_token=${token}`;

    console.log('[Zoom Download] Starting streaming download...');

    const response = await axios.get(authenticatedUrl, {
      responseType: 'stream',
      // Follow redirects (Zoom may redirect to actual CDN)
      maxRedirects: 5,
      // 10 minute timeout for large recordings
      timeout: 600000,
    });

    console.log('[Zoom Download] Stream established, content-type:', response.headers['content-type']);
    return response.data; // This is a Readable stream
  } catch (error) {
    const status = error.response?.status;
    console.error('[Zoom Download] Failed:', {
      status,
      message: error.message,
      url: downloadUrl.substring(0, 60) + '...',
    });
    throw new Error(`Zoom recording download failed (HTTP ${status || 'N/A'}): ${error.message}`);
  }
}

module.exports = { getZoomAccessToken, createZoomMeeting, downloadRecording };
