# Decision Log

This document records significant architectural and implementation decisions made during the development of EdMarg.

## 1. Database Selection: MongoDB over PostgreSQL

**Options Considered:**
- MongoDB (NoSQL)
- PostgreSQL (Relational)

**Decision:** MongoDB
**Rationale:** The educational assessment platform requires highly flexible data structures. Assessment templates (`assessmenttemplates`) and student answers (`assessmentresponses`, `studentassessments`) vary wildly in shape depending on the question types added by admins. MongoDB's `Mixed` types and schema-less flexibility allow us to store dynamic assessment responses without needing complex EAV (Entity-Attribute-Value) anti-patterns or constant schema migrations.

## 2. Real-Time Communication: Socket.io

**Options Considered:**
- Socket.io
- Native WebSockets
- Server-Sent Events (SSE) + REST POST

**Decision:** Socket.io
**Rationale:** We needed real-time messaging for mentor-student communication. Socket.io provides automatic reconnections, broadcasting, and fallback polling out-of-the-box. It also simplifies the integration with our Express backend and Next.js frontend compared to managing raw WebSockets manually.

## 3. Video Integration: Zoom API vs WebRTC

**Options Considered:**
- Zoom API (Server-to-Server OAuth)
- Custom WebRTC (e.g., Twilio Video, Agora, or raw WebRTC)

**Decision:** Zoom API
**Rationale:** Building a reliable, cross-browser video calling solution with screen sharing and recording capabilities from scratch is highly complex. Zoom is an industry standard that mentors and students are already familiar with. By using Zoom's Server-to-Server OAuth and webhooks, we can automatically generate meeting links and capture recordings (`recordings` collection) with minimal effort.

## 4. Assessment Scoring: Tag-Based Engine

**Options Considered:**
- Hardcoded decision trees (if/else logic)
- Third-party AI APIs (e.g., OpenAI) for real-time evaluation
- Tag-based weighted scoring engine

**Decision:** Tag-based weighted scoring engine
**Rationale:** While an AI API would be dynamic, it introduces latency, cost, and unpredictability. Hardcoded decision trees are too rigid. We built a custom engine (`careerAssessment.service.js`) that scores answers across 8 dimensions (logic, tech, social, business, creative, practical, research, outdoor). This provides deterministic, transparent, and highly accurate career recommendations without external dependencies.

## 5. File Storage: Cloudinary vs AWS S3

**Options Considered:**
- AWS S3
- Cloudinary

**Decision:** Cloudinary
**Rationale:** Cloudinary was chosen for its excellent on-the-fly image transformations and built-in video processing. Since users upload profile pictures and we store Zoom recordings, Cloudinary's ability to automatically resize images and serve optimized video formats saves significant backend processing overhead.

## 6. Architecture: Monolith vs Microservices

**Options Considered:**
- Single Monolith (Express)
- Microservices (Auth, Booking, Messaging, etc.)

**Decision:** Monolith (Express REST API)
**Rationale:** For an MVP educational platform, the operational complexity of microservices (service discovery, distributed tracing, inter-service communication) outweighs the benefits. A well-structured monolith with clear service boundaries (`controllers/` → `services/` → `repositories/`) allows for rapid feature development while remaining easy to deploy to platforms like Render.
