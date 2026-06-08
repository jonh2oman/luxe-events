// Luxe Events Mock Database Service
// Persists state in LocalStorage to provide a full-stack feel without requiring live database credentials initially.

const INITIAL_EVENTS = [
  {
    id: "solstice-2026",
    title: "Solstice Music Festival",
    subtitle: "A Summer Celebration of Electronic Beats",
    description: "Experience the ultimate summer solstice celebration. Join world-renowned electronic music artists under a glass dome staging, with immersive 3D spatial soundscapes and breathtaking light projections.",
    category: "Music",
    date: "2026-06-20",
    time: "16:00 - 02:00",
    location: "Aetheria Dome, San Francisco",
    price: 89,
    image: "/images/solstice_festival.jpg",
    organizer: "Aetheria Productions",
    featured: true,
    ticketTiers: [
      { name: "General Admission", price: 89, description: "Access to main arena and standing zones." },
      { name: "VIP Terrace", price: 179, description: "Elevated platform view, private bar, and express entry." },
      { name: "Backstage Glass Lounge", price: 349, description: "Ultra-premium lounge behind the main stage with artist meet & greets." }
    ],
    // 6 rows x 10 seats seating grid
    seats: Array.from({ length: 60 }, (_, i) => {
      const row = String.fromCharCode(65 + Math.floor(i / 10)); // A, B, C, D, E, F
      const number = (i % 10) + 1;
      let tier = "General Admission";
      let price = 89;
      if (row === "A" || row === "B") {
        tier = "Backstage Glass Lounge";
        price = 349;
      } else if (row === "C") {
        tier = "VIP Terrace";
        price = 179;
      }
      
      // Randomly book some seats initially to look active
      const isBooked = i % 7 === 0 || i % 11 === 0;
      
      return {
        id: `${row}${number}`,
        row,
        number,
        tier,
        price,
        isBooked,
        selectedBy: null
      };
    })
  },
  {
    id: "jazz-resonance",
    title: "Gold Resonance Jazz Night",
    subtitle: "Intimate Classic & Modern Jazz Fusion",
    description: "An evening of smooth brass, upright bass, and soulful melodies. Set in the luxurious glass-panel lounge of the Gold Club, featuring the award-winning Marcus Vance Quartet.",
    category: "Music",
    date: "2026-07-05",
    time: "20:00 - 23:30",
    location: "The Gold Club, New York",
    price: 45,
    image: "/images/jazz_club.jpg",
    organizer: "Blue Note Collective",
    featured: false,
    ticketTiers: [
      { name: "Table Seating", price: 45, description: "Standard table seating with bar access." },
      { name: "Front Row VIP Booth", price: 95, description: "Plush semi-private booths directly in front of the stage. Includes a complimentary bottle." }
    ],
    seats: Array.from({ length: 30 }, (_, i) => {
      const row = String.fromCharCode(65 + Math.floor(i / 6)); // A, B, C, D, E
      const number = (i % 6) + 1;
      let tier = "Table Seating";
      let price = 45;
      if (row === "A") {
        tier = "Front Row VIP Booth";
        price = 95;
      }
      
      const isBooked = i % 5 === 0;
      
      return {
        id: `${row}${number}`,
        row,
        number,
        tier,
        price,
        isBooked,
        selectedBy: null
      };
    })
  },
  {
    id: "symphony-lights",
    title: "Symphony of Holograms",
    subtitle: "Orchestral Classics Meets Laser Scenography",
    description: "Classic orchestral masterpieces from Beethoven and Vivaldi fused with modern laser and holographic visual technology. A feast for both eyes and ears.",
    category: "Arts",
    date: "2026-08-15",
    time: "19:00 - 21:30",
    location: "Grand Symphony Pavilion, Chicago",
    price: 65,
    image: "/images/symphony_dome.jpg",
    organizer: "Metropolitan Orchestra",
    featured: true,
    ticketTiers: [
      { name: "Standard Hall", price: 65, description: "Comfortable theater seating in the main hall." },
      { name: "Premium Orchestra Ring", price: 120, description: "Prime center seating with optimal acoustic and holographic views." }
    ],
    seats: Array.from({ length: 48 }, (_, i) => {
      const row = String.fromCharCode(65 + Math.floor(i / 8)); // A, B, C, D, E, F
      const number = (i % 8) + 1;
      let tier = "Standard Hall";
      let price = 65;
      if (row === "A" || row === "B") {
        tier = "Premium Orchestra Ring";
        price = 120;
      }
      
      const isBooked = i % 6 === 0;
      
      return {
        id: `${row}${number}`,
        row,
        number,
        tier,
        price,
        isBooked,
        selectedBy: null
      };
    })
  },
  {
    id: "neon-indie-showcase",
    title: "Neon Horizon: Indie Showcase",
    subtitle: "The Next Wave of Indie Rock and Dream Pop",
    description: "Catch tomorrow's headliners today. Featuring breakthrough performances by Velvet Echoes, Midnight Shadows, and Lumina. High energy, glassmorphic light shows, and indie vibes.",
    category: "Music",
    date: "2026-09-12",
    time: "18:00 - 23:00",
    location: "Vaporwave Warehouse, Austin",
    price: 35,
    image: "/images/indie_showcase.jpg",
    organizer: "Soundwave Austin",
    featured: false,
    ticketTiers: [
      { name: "General Admission", price: 35, description: "Standing floor tickets." }
    ],
    seats: Array.from({ length: 40 }, (_, i) => {
      const row = String.fromCharCode(65 + Math.floor(i / 8));
      const number = (i % 8) + 1;
      const tier = "General Admission";
      const price = 35;
      const isBooked = i % 4 === 0;
      
      return {
        id: `${row}${number}`,
        row,
        number,
        tier,
        price,
        isBooked,
        selectedBy: null
      };
    })
  }
];

const INITIAL_MESSAGES = {
  "solstice-2026": [
    { id: 1, user: "Alex Mercer", text: "Can't wait for Solstice! Who's catching the opening DJ set?", timestamp: "18:15" },
    { id: 2, user: "Sophia Sterling", text: "Me! Velvet Echo is playing early, and it's going to be phenomenal.", timestamp: "18:17" },
    { id: 3, user: "Marcus King", text: "I bought VIP Terrace tickets, is there a separate entrance?", timestamp: "18:22" },
    { id: 4, user: "Elena Rostova", text: "Yes Marcus, VIP has its own lane on the North side. Smooth entry!", timestamp: "18:25" }
  ],
  "jazz-resonance": [
    { id: 1, user: "Clara Croft", text: "Anyone else at the bar? The Vance Quartet sounds amazing.", timestamp: "20:05" },
    { id: 2, user: "Miles Davis Jr.", text: "Vibes are immaculate tonight. Standard table seating has a great view.", timestamp: "20:10" }
  ]
};

const INITIAL_FRIENDS = [
  { name: "Sophia Sterling", avatar: "SS", active: true },
  { name: "Alex Mercer", avatar: "AM", active: true },
  { name: "Marcus King", avatar: "MK", active: false },
  { name: "Elena Rostova", avatar: "ER", active: true }
];

// Helper to check if client-side
const isClient = typeof window !== 'undefined';

const activeChannels = {};
const activeListeners = {};
const presenceRegistry = {};
const localPresenceState = {};

export const mockDb = {
  // Initialize Database
  init: () => {
    if (!isClient) return;
    if (!localStorage.getItem("luxe_events")) {
      localStorage.setItem("luxe_events", JSON.stringify(INITIAL_EVENTS));
    }
    if (!localStorage.getItem("luxe_messages")) {
      localStorage.setItem("luxe_messages", JSON.stringify(INITIAL_MESSAGES));
    }
    if (!localStorage.getItem("luxe_bookings")) {
      localStorage.setItem("luxe_bookings", JSON.stringify([]));
    }
    if (!localStorage.getItem("luxe_friends")) {
      localStorage.setItem("luxe_friends", JSON.stringify(INITIAL_FRIENDS));
    }
    if (!localStorage.getItem("luxe_current_user")) {
      localStorage.setItem("luxe_current_user", JSON.stringify({
        name: "Julian Sterling",
        email: "julian@luxe.design",
        role: "user"
      }));
    }
  },

  // Get all events
  getEvents: () => {
    if (!isClient) return INITIAL_EVENTS;
    mockDb.init();
    const events = JSON.parse(localStorage.getItem("luxe_events"));
    
    // Auto-release expired holds
    let updated = false;
    const cleanedEvents = events.map(event => {
      const seatsCleaned = event.seats.map(seat => {
        if (seat.heldUntil && seat.heldUntil < Date.now() && !seat.isBooked) {
          updated = true;
          return { ...seat, heldUntil: null, heldBy: null };
        }
        return seat;
      });
      return { ...event, seats: seatsCleaned };
    });

    if (updated) {
      localStorage.setItem("luxe_events", JSON.stringify(cleanedEvents));
    }
    return cleanedEvents;
  },

  // Get specific event
  getEventById: (id) => {
    if (!isClient) return INITIAL_EVENTS.find(e => e.id === id);
    mockDb.init();
    const events = mockDb.getEvents();
    return events.find(e => e.id === id);
  },

  // Hold seats for 10 minutes
  holdSeats: (eventId, seatIds, userName) => {
    if (!isClient) return false;
    mockDb.init();
    const events = JSON.parse(localStorage.getItem("luxe_events"));
    const eventIndex = events.findIndex(e => e.id === eventId);
    if (eventIndex === -1) return false;

    const event = events[eventIndex];
    
    // Check if any seat is already booked or held by someone else
    const unavailable = event.seats.some(s => 
      seatIds.includes(s.id) && 
      (s.isBooked || (s.heldUntil && s.heldUntil > Date.now() && s.heldBy !== userName && s.heldBy !== "Split Group Hold"))
    );
    if (unavailable) return false;

    // Set holds
    const heldUntil = Date.now() + 10 * 60 * 1000; // 10 minutes
    event.seats = event.seats.map(seat => {
      if (seatIds.includes(seat.id)) {
        return { ...seat, heldBy: userName, heldUntil };
      }
      return seat;
    });

    events[eventIndex] = event;
    localStorage.setItem("luxe_events", JSON.stringify(events));
    return true;
  },

  // Book seats for an event
  bookSeats: (eventId, seatIds) => {
    if (!isClient) return false;
    mockDb.init();
    const events = JSON.parse(localStorage.getItem("luxe_events"));
    const eventIndex = events.findIndex(e => e.id === eventId);
    
    if (eventIndex === -1) return false;
    
    const event = events[eventIndex];
    const user = JSON.parse(localStorage.getItem("luxe_current_user"));
    
    // Check if any seat is already booked
    const alreadyBooked = event.seats.some(s => seatIds.includes(s.id) && s.isBooked);
    if (alreadyBooked) return false;

    // Book the seats and clear holds
    event.seats = event.seats.map(seat => {
      if (seatIds.includes(seat.id)) {
        return { ...seat, isBooked: true, selectedBy: user.name, heldBy: null, heldUntil: null };
      }
      return seat;
    });

    events[eventIndex] = event;
    localStorage.setItem("luxe_events", JSON.stringify(events));

    // Add to user bookings
    const bookings = JSON.parse(localStorage.getItem("luxe_bookings"));
    const bookedSeatsInfo = event.seats.filter(s => seatIds.includes(s.id));
    const totalPrice = bookedSeatsInfo.reduce((acc, s) => acc + s.price, 0);

    const newBooking = {
      id: "BK-" + Math.floor(100000 + Math.random() * 900000),
      eventId,
      eventTitle: event.title,
      eventDate: event.date,
      eventLocation: event.location,
      eventImage: event.image,
      seats: seatIds,
      totalPrice,
      purchaseDate: new Date().toLocaleDateString(),
      qrCode: "LUXE-" + eventId + "-" + seatIds.join("-")
    };

    bookings.push(newBooking);
    localStorage.setItem("luxe_bookings", JSON.stringify(bookings));
    return newBooking;
  },

  // Get bookings for current user
  getBookings: () => {
    if (!isClient) return [];
    mockDb.init();
    return JSON.parse(localStorage.getItem("luxe_bookings"));
  },

  // Get chat messages for an event
  getMessages: (eventId) => {
    if (!isClient) return INITIAL_MESSAGES[eventId] || [];
    mockDb.init();
    const messages = JSON.parse(localStorage.getItem("luxe_messages"));
    return messages[eventId] || [];
  },

  // Send a message
  sendMessage: (eventId, text) => {
    if (!isClient) return null;
    mockDb.init();
    const messages = JSON.parse(localStorage.getItem("luxe_messages"));
    const user = JSON.parse(localStorage.getItem("luxe_current_user"));
    
    if (!messages[eventId]) {
      messages[eventId] = [];
    }

    const newMsg = {
      id: Date.now(),
      user: user.name,
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    messages[eventId].push(newMsg);
    localStorage.setItem("luxe_messages", JSON.stringify(messages));
    return newMsg;
  },

  // Get list of friends attending an event (simulated)
  getAttendingFriends: (eventId) => {
    if (!isClient) return INITIAL_FRIENDS.slice(0, 2);
    mockDb.init();
    const friends = JSON.parse(localStorage.getItem("luxe_friends"));
    // Simulating Sophia and Alex attending Solstice
    if (eventId === "solstice-2026") {
      return friends.filter(f => f.name === "Sophia Sterling" || f.name === "Alex Mercer");
    }
    return [friends[0]];
  },

  // Add a new event (Organizer flow)
  createEvent: (eventData) => {
    if (!isClient) return null;
    mockDb.init();
    const events = JSON.parse(localStorage.getItem("luxe_events"));
    
    // Create seating grid (use custom seats if provided)
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

    const newEvent = {
      id: eventData.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      ...eventData,
      seats,
      featured: false
    };

    events.push(newEvent);
    localStorage.setItem("luxe_events", JSON.stringify(events));
    return newEvent;
  },

  // Get sales analytics for organizer (simulated)
  getOrganizerAnalytics: () => {
    return {
      totalTicketsSold: 247,
      totalRevenue: 28430,
      activeEvents: 4,
      salesVelocity: [
        { date: "June 1", sales: 12 },
        { date: "June 2", sales: 18 },
        { date: "June 3", sales: 15 },
        { date: "June 4", sales: 29 },
        { date: "June 5", sales: 42 },
        { date: "June 6", sales: 38 },
        { date: "June 7", sales: 55 }
      ],
      demographics: [
        { group: "18-24", percentage: 35 },
        { group: "25-34", percentage: 48 },
        { group: "35-44", percentage: 12 },
        { group: "45+", percentage: 5 }
      ]
    };
  },

  // Subscribe to real-time seat presence (using BroadcastChannel)
  subscribeToPresence: (eventId, userName, onUpdate) => {
    if (!isClient) return () => {};
    
    if (!presenceRegistry[eventId]) {
      presenceRegistry[eventId] = {};
    }

    if (!activeListeners[eventId]) {
      activeListeners[eventId] = [];
    }

    activeListeners[eventId].push(onUpdate);

    // Initialize BroadcastChannel if not already active
    if (!activeChannels[eventId] && typeof window !== "undefined" && window.BroadcastChannel) {
      try {
        const channel = new BroadcastChannel(`luxe-presence-${eventId}`);
        activeChannels[eventId] = channel;

        channel.onmessage = (event) => {
          const { user, seatId, action, timestamp } = event.data;
          
          if (!presenceRegistry[eventId]) presenceRegistry[eventId] = {};

          if (action === "requestPresenceSync") {
            // Re-broadcast our current state if we have one
            const localState = localPresenceState[eventId];
            if (localState && localState.user === userName && channel) {
              channel.postMessage({
                user: userName,
                seatId: localState.seatId,
                action: localState.action,
                timestamp: Date.now()
              });
            }
          } else if (action === "disconnect") {
            delete presenceRegistry[eventId][user];
          } else {
            // Store the active seat state
            presenceRegistry[eventId][user] = { seatId, action, timestamp };
          }

          // Trigger all updates
          if (activeListeners[eventId]) {
            activeListeners[eventId].forEach(callback => {
              try {
                callback({ ...presenceRegistry[eventId] });
              } catch (e) {
                console.error("Presence callback failed:", e);
              }
            });
          }
        };

        // When joining, request others to sync their presence
        channel.postMessage({ action: "requestPresenceSync", user: userName });

      } catch (e) {
        console.error("BroadcastChannel initialization failed:", e);
      }
    } else if (activeChannels[eventId]) {
      activeChannels[eventId].postMessage({ action: "requestPresenceSync", user: userName });
    }

    // Immediately trigger with current cached presence registry
    onUpdate({ ...presenceRegistry[eventId] });

    // Return unsubscribe function
    return () => {
      if (activeListeners[eventId]) {
        activeListeners[eventId] = activeListeners[eventId].filter(cb => cb !== onUpdate);
        
        if (activeListeners[eventId].length === 0) {
          if (activeChannels[eventId]) {
            activeChannels[eventId].close();
            delete activeChannels[eventId];
          }
          delete activeListeners[eventId];
          delete presenceRegistry[eventId];
        }
      }
    };
  },

  // Update own presence status and broadcast to other tabs
  updatePresence: (eventId, userName, seatId, action) => {
    if (!isClient) return false;
    
    // Store locally for request sync responses
    localPresenceState[eventId] = { user: userName, seatId, action };

    // Broadcast on channel
    if (activeChannels[eventId] && typeof window !== "undefined") {
      try {
        activeChannels[eventId].postMessage({
          user: userName,
          seatId,
          action,
          timestamp: Date.now()
        });
      } catch (e) {
        console.error("Broadcast failed:", e);
      }
    }
    return true;
  }
};
