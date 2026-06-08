// Luxe Events Unified Database Service
// Seamlessly routes queries to live Firestore if credentials exist, otherwise falls back to the LocalStorage Mock DB.

import { isRealFirebase, db } from "./firebase";
import { mockDb } from "./mockDatabase";
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  updateDoc, 
  addDoc, 
  query, 
  orderBy, 
  where,
  onSnapshot
} from "firebase/firestore";

export const database = {
  // Get all events
  getEvents: async () => {
    if (isRealFirebase && db) {
      try {
        const querySnapshot = await getDocs(collection(db, "events"));
        const events = [];
        querySnapshot.forEach((doc) => {
          events.push({ id: doc.id, ...doc.data() });
        });
        // If Firestore is empty, initialize it with mock data
        if (events.length === 0) {
          console.log("Empty Firestore. Seeding mock events...");
          const initial = mockDb.getEvents();
          for (const ev of initial) {
            await setDoc(doc(db, "events", ev.id), ev);
            events.push(ev);
          }
        }
        return events;
      } catch (error) {
        console.error("Error fetching Firestore events, falling back to mock:", error);
        return mockDb.getEvents();
      }
    }
    return mockDb.getEvents();
  },

  // Get single event
  getEventById: async (id) => {
    if (isRealFirebase && db) {
      try {
        const docRef = doc(db, "events", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          return { id: docSnap.id, ...docSnap.data() };
        }
      } catch (error) {
        console.error("Error fetching Firestore event by ID:", error);
      }
    }
    return mockDb.getEventById(id);
  },

  // Book seats
  bookSeats: async (eventId, seatIds, promoCode) => {
    if (isRealFirebase && db) {
      try {
        const eventRef = doc(db, "events", eventId);
        const eventSnap = await getDoc(eventRef);
        
        if (!eventSnap.exists()) return false;
        const eventData = eventSnap.data();
        
        // Check if seats are already booked
        const alreadyBooked = eventData.seats.some(s => seatIds.includes(s.id) && s.isBooked);
        if (alreadyBooked) return false;

        // Perform booking transaction
        const updatedSeats = eventData.seats.map(seat => {
          if (seatIds.includes(seat.id)) {
            return { ...seat, isBooked: true, selectedBy: "Secured User" };
          }
          return seat;
        });

        await updateDoc(eventRef, { seats: updatedSeats });

        // Add booking document
        const bookedSeatsInfo = eventData.seats.filter(s => seatIds.includes(s.id));
        const totalPrice = bookedSeatsInfo.reduce((acc, s) => acc + s.price, 0);

        const newBooking = {
          eventId,
          eventTitle: eventData.title,
          eventDate: eventData.date,
          eventLocation: eventData.location,
          eventImage: eventData.image,
          seats: seatIds,
          totalPrice,
          purchaseDate: new Date().toLocaleDateString(),
          qrCode: "LUXE-" + eventId + "-" + seatIds.join("-")
        };

        const bookingDocRef = await addDoc(collection(db, "bookings"), newBooking);
        return { id: bookingDocRef.id, ...newBooking };
      } catch (error) {
        console.error("Firestore booking failed, falling back to mock:", error);
        return mockDb.bookSeats(eventId, seatIds, promoCode);
      }
    }
    return mockDb.bookSeats(eventId, seatIds, promoCode);
  },

  // Hold seats for 10 minutes
  holdSeats: async (eventId, seatIds, userName) => {
    if (isRealFirebase && db) {
      try {
        const eventRef = doc(db, "events", eventId);
        const eventSnap = await getDoc(eventRef);
        if (!eventSnap.exists()) return false;
        
        const eventData = eventSnap.data();
        const unavailable = eventData.seats.some(s => 
          seatIds.includes(s.id) && 
          (s.isBooked || (s.heldUntil && s.heldUntil > Date.now() && s.heldBy !== userName && s.heldBy !== "Split Group Hold"))
        );
        if (unavailable) return false;

        const heldUntil = Date.now() + 10 * 60 * 1000;
        const updatedSeats = eventData.seats.map(seat => {
          if (seatIds.includes(seat.id)) {
            return { ...seat, heldBy: userName, heldUntil };
          }
          return seat;
        });

        await updateDoc(eventRef, { seats: updatedSeats });
        return true;
      } catch (error) {
        console.error("Firestore hold failed, using mock:", error);
      }
    }
    return mockDb.holdSeats(eventId, seatIds, userName);
  },

  // Get attendee bookings
  getBookings: async (userEmail) => {
    if (isRealFirebase && db) {
      try {
        const q = query(collection(db, "bookings"), where("userEmail", "==", userEmail));
        const querySnapshot = await getDocs(q);
        const bookings = [];
        querySnapshot.forEach((doc) => {
          bookings.push({ id: doc.id, ...doc.data() });
        });
        return bookings;
      } catch (error) {
        console.error("Error getting Firestore bookings:", error);
      }
    }
    return mockDb.getBookings();
  },

  // Subscribe to real-time chat messages
  subscribeToMessages: (eventId, callback) => {
    if (isRealFirebase && db) {
      const q = query(
        collection(db, `events/${eventId}/messages`), 
        orderBy("timestamp", "asc")
      );
      return onSnapshot(q, (snapshot) => {
        const messages = [];
        snapshot.forEach((doc) => {
          messages.push({ id: doc.id, ...doc.data() });
        });
        callback(messages);
      }, (error) => {
        console.error("Firestore chat listener error:", error);
        callback(mockDb.getMessages(eventId));
      });
    }
    
    // Fallback: poll or trigger instant callback with Mock
    callback(mockDb.getMessages(eventId));
    return () => {}; // return empty unsubscribe hook
  },

  // Send a chat message
  sendMessage: async (eventId, user, text) => {
    if (isRealFirebase && db) {
      try {
        const msgData = {
          user,
          text,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          createdAt: Date.now()
        };
        await addDoc(collection(db, `events/${eventId}/messages`), msgData);
        return msgData;
      } catch (error) {
        console.error("Error writing Firestore message:", error);
      }
    }
    return mockDb.sendMessage(eventId, text);
  },

  // Get friends list
  getAttendingFriends: (eventId) => {
    return mockDb.getAttendingFriends(eventId);
  },

  // Create event listing (Organizer flow)
  createEvent: async (eventData) => {
    if (isRealFirebase && db) {
      try {
        const eventId = eventData.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
        // Use custom seats or create default grid
        const seats = eventData.seats || Array.from({ length: 40 }, (_, i) => {
          const row = String.fromCharCode(65 + Math.floor(i / 8));
          const number = (i % 8) + 1;
          return {
            id: `${row}${number}`,
            row,
            number,
            tier: eventData.ticketTiers[0]?.name || "General Admission",
            price: eventData.price,
            isBooked: false,
            selectedBy: null
          };
        });

        const fullEvent = {
          ...eventData,
          seats,
          featured: false
        };

        await setDoc(doc(db, "events", eventId), fullEvent);
        return { id: eventId, ...fullEvent };
      } catch (error) {
        console.error("Error creating Firestore event:", error);
      }
    }
    return mockDb.createEvent(eventData);
  },

  // Get analytics metrics
  getOrganizerAnalytics: () => {
    return mockDb.getOrganizerAnalytics();
  },

  // Subscribe to real-time seat presence (who is hovering or selecting what)
  subscribeToPresence: (eventId, userName, onUpdate) => {
    if (isRealFirebase && db) {
      try {
        const presenceCollection = collection(db, `events/${eventId}/presence`);
        return onSnapshot(presenceCollection, (snapshot) => {
          const presenceMap = {};
          snapshot.forEach((doc) => {
            const data = doc.data();
            // Filter out expired presence (older than 30s) or disconnected
            if (data.timestamp && Date.now() - data.timestamp < 30000 && data.action !== "disconnect") {
              presenceMap[doc.id] = data;
            }
          });
          onUpdate(presenceMap);
        });
      } catch (error) {
        console.error("Firestore presence subscription failed:", error);
      }
    }
    return mockDb.subscribeToPresence(eventId, userName, onUpdate);
  },

  // Update own presence status
  updatePresence: async (eventId, userName, seatId, action) => {
    if (isRealFirebase && db) {
      try {
        const presenceDocRef = doc(db, `events/${eventId}/presence`, userName);
        if (action === "disconnect") {
          await setDoc(presenceDocRef, { action: "disconnect", timestamp: Date.now() });
        } else {
          await setDoc(presenceDocRef, {
            seatId,
            action, // 'hover' or 'select'
            timestamp: Date.now()
          });
        }
        return true;
      } catch (error) {
        console.error("Firestore presence update failed:", error);
      }
    }
    return mockDb.updatePresence(eventId, userName, seatId, action);
  },

  // --- Promo Codes ---
  getPromoCodes: async () => {
    return mockDb.getPromoCodes();
  },

  createPromoCode: async (codeData) => {
    return mockDb.createPromoCode(codeData);
  },

  deletePromoCode: async (code) => {
    return mockDb.deletePromoCode(code);
  },

  validatePromoCode: async (code) => {
    return mockDb.validatePromoCode(code);
  },

  // --- Attendee CRM ---
  checkInTicket: async (bookingId) => {
    return mockDb.checkInTicket(bookingId);
  },

  updateAttendeeNotes: async (bookingId, notes) => {
    return mockDb.updateAttendeeNotes(bookingId, notes);
  },

  // --- Kanban Planner ---
  getPlannerTasks: async () => {
    return mockDb.getPlannerTasks();
  },

  updatePlannerTaskStatus: async (taskId, status) => {
    return mockDb.updatePlannerTaskStatus(taskId, status);
  },

  createPlannerTask: async (taskData) => {
    return mockDb.createPlannerTask(taskData);
  },

  deletePlannerTask: async (taskId) => {
    return mockDb.deletePlannerTask(taskId);
  }
};
