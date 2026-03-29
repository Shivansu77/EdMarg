const crypto = require('crypto');
const { Booking } = require('../models/booking.model');
const { createZoomMeeting } = require('../services/zoom.service');

/**
 * Handle Webhook events from Zoom
 * This primarily logs the recording URL automatically when a session finishes.
 */
exports.zoomWebhook = async (req, res) => {
  try {
    const { event, payload } = req.body;

    // 1. Webhook Validation Challenge from Zoom
    // REQUIRED for setting up the webhook in your Zoom dashboard
    if (event === 'endpoint.url_validation') {
      const hashForValidate = crypto.createHmac('sha256', process.env.ZOOM_WEBHOOK_SECRET)
        .update(payload.plainToken)
        .digest('hex');

      return res.status(200).json({
        plainToken: payload.plainToken,
        encryptedToken: hashForValidate
      });
    }

    // 2. Handle Recording completed
    if (event === 'recording.completed') {
      const recording = payload.object;
      
      // Zoom returns the meetingId as a number, convert to string
      const zoomMeetingId = String(recording.id);
      
      // Get the play_url from the recordings list
      const recordingUrl = recording.recording_files && recording.recording_files[0] 
        ? recording.recording_files[0].play_url 
        : null;

      if (recordingUrl) {
        // Find the booking with this zoomMeetingId and update it
        await Booking.findOneAndUpdate(
          { zoomMeetingId: zoomMeetingId },
          { recordingUrl: recordingUrl }
        );
        console.log(`[Zoom Webhook] Successfully saved recording URL for meeting ${zoomMeetingId}`);
      }
    }

    // Explicitly acknowledge receipt of the webhook to Zoom
    res.status(200).send('ok');
  } catch (error) {
    console.error('[Zoom Webhook Error]:', error);
    // Even if it fails, return 200 so Zoom doesn't aggressively retry
    res.status(200).send('error'); 
  }
};

/**
 * Manually create a meeting (Optional - used primarily for testing or explicit standalone calls)
 */
exports.createStandaloneMeeting = async (req, res) => {
  try {
    const { topic, startTime, duration } = req.body;
    
    if (!topic || !startTime) {
      return res.status(400).json({ error: 'Topic and startTime are required' });
    }

    const meetingDetails = await createZoomMeeting({ topic, startTime, duration });

    res.status(201).json({
      success: true,
      data: meetingDetails
    });
  } catch (err) {
    res.status(500).json({ error: "Standalone meeting creation failed", details: err.message });
  }
};
