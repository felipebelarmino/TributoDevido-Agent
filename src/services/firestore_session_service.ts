/**
 * FirestoreSessionService - Persistent Session Storage using Google Cloud Firestore
 *
 * Implements BaseSessionService to provide durable session storage that survives
 * server restarts and browser refreshes.
 *
 * Collections Structure:
 * - sessions/{appName}_{userId}_{sessionId}
 *   - id, appName, userId, state, lastUpdateTime
 * - sessions/{sessionId}/events/{eventId}
 *   - event data
 */

import { Firestore, FieldValue } from "@google-cloud/firestore";
import {
  BaseSessionService,
  CreateSessionRequest,
  GetSessionRequest,
  ListSessionsRequest,
  ListSessionsResponse,
  DeleteSessionRequest,
  Session,
  Event,
} from "@google/adk";

export class FirestoreSessionService extends BaseSessionService {
  private firestore: Firestore;
  private collectionName: string;

  constructor(options?: { projectId?: string; collectionName?: string }) {
    super();
    this.firestore = new Firestore({
      projectId: options?.projectId || process.env.GOOGLE_CLOUD_PROJECT,
    });
    this.collectionName = options?.collectionName || "adk_sessions";
  }

  /**
   * Generate a unique document ID for a session
   */
  private getSessionDocId(
    appName: string,
    userId: string,
    sessionId: string
  ): string {
    return `${appName}_${userId}_${sessionId}`;
  }

  /**
   * Creates a new session and stores it in Firestore
   */
  async createSession(request: CreateSessionRequest): Promise<Session> {
    const sessionId = request.sessionId || this.generateSessionId();
    const docId = this.getSessionDocId(
      request.appName,
      request.userId,
      sessionId
    );

    const session: Session = {
      id: sessionId,
      appName: request.appName,
      userId: request.userId,
      state: request.state || {},
      events: [],
      lastUpdateTime: Date.now(),
    };

    await this.firestore
      .collection(this.collectionName)
      .doc(docId)
      .set({
        id: sessionId,
        appName: request.appName,
        userId: request.userId,
        state: request.state || {},
        lastUpdateTime: FieldValue.serverTimestamp(),
        createdAt: FieldValue.serverTimestamp(),
      });

    console.log(`[FirestoreSessionService] Created session: ${docId}`);
    return session;
  }

  /**
   * Retrieves a session from Firestore
   */
  async getSession(request: GetSessionRequest): Promise<Session | undefined> {
    const docId = this.getSessionDocId(
      request.appName,
      request.userId,
      request.sessionId
    );
    const doc = await this.firestore
      .collection(this.collectionName)
      .doc(docId)
      .get();

    if (!doc.exists) {
      console.log(`[FirestoreSessionService] Session not found: ${docId}`);
      return undefined;
    }

    const data = doc.data()!;

    // Fetch events
    const eventsSnapshot = await this.firestore
      .collection(this.collectionName)
      .doc(docId)
      .collection("events")
      .orderBy("timestamp", "asc")
      .limit(request.config?.numRecentEvents || 100)
      .get();

    const events: Event[] = eventsSnapshot.docs.map(
      (eventDoc) => eventDoc.data() as Event
    );

    const session: Session = {
      id: data.id,
      appName: data.appName,
      userId: data.userId,
      state: data.state || {},
      events: events,
      lastUpdateTime: data.lastUpdateTime?.toMillis?.() || Date.now(),
    };

    console.log(
      `[FirestoreSessionService] Retrieved session: ${docId} with ${events.length} events`
    );
    return session;
  }

  /**
   * Lists all sessions for a user
   */
  async listSessions(
    request: ListSessionsRequest
  ): Promise<ListSessionsResponse> {
    const snapshot = await this.firestore
      .collection(this.collectionName)
      .where("appName", "==", request.appName)
      .where("userId", "==", request.userId)
      .orderBy("lastUpdateTime", "desc")
      .get();

    const sessions: Session[] = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: data.id,
        appName: data.appName,
        userId: data.userId,
        state: data.state || {},
        events: [], // Events not loaded in list
        lastUpdateTime: data.lastUpdateTime?.toMillis?.() || Date.now(),
      };
    });

    console.log(
      `[FirestoreSessionService] Listed ${sessions.length} sessions for user ${request.userId}`
    );
    return { sessions };
  }

  /**
   * Deletes a session and all its events
   */
  async deleteSession(request: DeleteSessionRequest): Promise<void> {
    const docId = this.getSessionDocId(
      request.appName,
      request.userId,
      request.sessionId
    );
    const docRef = this.firestore.collection(this.collectionName).doc(docId);

    // Delete all events in the subcollection
    const eventsSnapshot = await docRef.collection("events").get();
    const batch = this.firestore.batch();
    eventsSnapshot.docs.forEach((eventDoc) => {
      batch.delete(eventDoc.ref);
    });

    // Delete the session document
    batch.delete(docRef);
    await batch.commit();

    console.log(`[FirestoreSessionService] Deleted session: ${docId}`);
  }

  /**
   * Appends an event to a session (called internally by BaseSessionService)
   * Override to also persist to Firestore
   */
  async appendEvent({
    session,
    event,
  }: {
    session: Session;
    event: Event;
  }): Promise<Event> {
    // Call parent to update session state
    const updatedEvent = await super.appendEvent({ session, event });

    // Persist event to Firestore
    const docId = this.getSessionDocId(
      session.appName,
      session.userId,
      session.id
    );
    const eventId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    await this.firestore
      .collection(this.collectionName)
      .doc(docId)
      .collection("events")
      .doc(eventId)
      .set({
        ...updatedEvent,
        timestamp: FieldValue.serverTimestamp(),
      });

    // Update session's lastUpdateTime and state
    await this.firestore.collection(this.collectionName).doc(docId).update({
      state: session.state,
      lastUpdateTime: FieldValue.serverTimestamp(),
    });

    return updatedEvent;
  }

  /**
   * Generate a unique session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
