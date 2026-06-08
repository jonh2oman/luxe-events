// Luxe Events Mock Database Service
// Persists state in LocalStorage to provide a full-stack feel without requiring live database credentials initially.

const INITIAL_EVENTS = [
  {
    id: "solstice-2026",
    ticketDesignId: "solstice-design",
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
    ticketDesignId: "jazz-design",
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
    ticketDesignId: "symphony-design",
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

const INITIAL_TICKET_DESIGNS = [
  {
    id: "solstice-design",
    name: "Solstice Prismatic",
    material: "holographic",
    borderStyle: "neon_purple",
    stamp: "star",
    particleEffect: "sparkles",
    fontFamily: "sans",
    barcodeType: "qr_line",
    badgeColor: "#a855f7",
    textColor: "#ffffff"
  },
  {
    id: "jazz-design",
    name: "Velvet Gold VIP",
    material: "gold_foil",
    borderStyle: "gold_glow",
    stamp: "crest",
    particleEffect: "dust",
    fontFamily: "serif",
    barcodeType: "matrix",
    badgeColor: "#d4af37",
    textColor: "#d4af37"
  },
  {
    id: "symphony-design",
    name: "Obsidian Symphony",
    material: "liquid_mercury",
    borderStyle: "double_border",
    stamp: "hologram_dot",
    particleEffect: "stars",
    fontFamily: "mono",
    barcodeType: "classic",
    badgeColor: "#cbd5e1",
    textColor: "#cbd5e1"
  }
];

const INITIAL_SERVICE_ORDERS = [
  {
    id: "ord-102",
    eventId: "solstice-2026",
    seatId: "A1",
    userName: "Sophia Sterling",
    items: [
      { name: "Vesper Martini", price: 18, count: 2 },
      { name: "Truffle Fries", price: 14, count: 1 }
    ],
    total: 50,
    status: "pending"
  },
  {
    id: "ord-103",
    eventId: "solstice-2026",
    seatId: "C4",
    userName: "Alex Mercer",
    items: [
      { name: "Craft IPA Beer", price: 9, count: 3 }
    ],
    total: 27,
    status: "dispatched"
  }
];

const INITIAL_SWAPS = [
  {
    id: "swap-101",
    eventId: "solstice-2026",
    senderName: "Sophia Sterling",
    senderSeat: "A2",
    recipientName: "Julian Sterling",
    recipientSeat: "A8",
    status: "pending"
  }
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
      localStorage.setItem("luxe_bookings", JSON.stringify([
        {
          id: "BK-198273",
          eventId: "solstice-2026",
          eventTitle: "Solstice Music Festival",
          eventDate: "2026-06-20",
          eventLocation: "Aetheria Dome, San Francisco",
          eventImage: "/images/solstice_festival.jpg",
          seats: ["A1", "A2"],
          totalPrice: 698,
          purchaseDate: "2026-06-05",
          qrCode: "LUXE-solstice-2026-A1-A2",
          selectedBy: "Sophia Sterling",
          isCheckedIn: false,
          checkInTime: null,
          notes: "VIP guest, close friend of organizer. Prefers champagne."
        },
        {
          id: "BK-882731",
          eventId: "solstice-2026",
          eventTitle: "Solstice Music Festival",
          eventDate: "2026-06-20",
          eventLocation: "Aetheria Dome, San Francisco",
          eventImage: "/images/solstice_festival.jpg",
          seats: ["C4"],
          totalPrice: 179,
          purchaseDate: "2026-06-06",
          qrCode: "LUXE-solstice-2026-C4",
          selectedBy: "Alex Mercer",
          isCheckedIn: true,
          checkInTime: "16:45",
          notes: "Allergic to nuts. VIP terrace."
        },
        {
          id: "BK-391827",
          eventId: "jazz-resonance",
          eventTitle: "Gold Resonance Jazz Night",
          eventDate: "2026-07-05",
          eventLocation: "The Gold Club, New York",
          eventImage: "/images/jazz_club.jpg",
          seats: ["A1"],
          totalPrice: 95,
          purchaseDate: "2026-06-07",
          qrCode: "LUXE-jazz-resonance-A1",
          selectedBy: "Marcus Vance",
          isCheckedIn: true,
          checkInTime: "19:30",
          notes: "Lead performer of the night."
        },
        {
          id: "BK-401928",
          eventId: "jazz-resonance",
          eventTitle: "Gold Resonance Jazz Night",
          eventDate: "2026-07-05",
          eventLocation: "The Gold Club, New York",
          eventImage: "/images/jazz_club.jpg",
          seats: ["B3", "B4"],
          totalPrice: 90,
          purchaseDate: "2026-06-07",
          qrCode: "LUXE-jazz-resonance-B3-B4",
          selectedBy: "Clara Croft",
          isCheckedIn: false,
          checkInTime: null,
          notes: "Requested table seating near back."
        },
        {
          id: "BK-731920",
          eventId: "symphony-lights",
          eventTitle: "Symphony of Holograms",
          eventDate: "2026-08-15",
          eventLocation: "Grand Symphony Pavilion, Chicago",
          eventImage: "/images/symphony_dome.jpg",
          seats: ["E1", "E2"],
          totalPrice: 130,
          purchaseDate: "2026-06-06",
          qrCode: "LUXE-symphony-lights-E1-E2",
          selectedBy: "Elena Rostova",
          isCheckedIn: true,
          checkInTime: "18:50",
          notes: "First time attendee."
        }
      ]));
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
    if (!localStorage.getItem("luxe_promo_codes")) {
      localStorage.setItem("luxe_promo_codes", JSON.stringify([
        { code: "VIP20", discount: 20, type: "percent", usageCount: 3 },
        { code: "LUXE10", discount: 10, type: "percent", usageCount: 12 }
      ]));
    }
    if (!localStorage.getItem("luxe_planner_tasks")) {
      localStorage.setItem("luxe_planner_tasks", JSON.stringify([
        { id: "t1", title: "Confirm catering menu", status: "todo", category: "Food & Beverage" },
        { id: "t2", title: "Coordinate stage lighting test", status: "in_progress", category: "Production" },
        { id: "t3", title: "Verify Marcus Quartet contracts", status: "done", category: "Talent" },
        { id: "t4", title: "Print QR check-in flyers", status: "todo", category: "Operations" },
        { id: "t5", title: "Confirm VIP lounge bar stock", status: "in_progress", category: "Food & Beverage" }
      ]));
    }
    if (!localStorage.getItem("luxe_ticket_designs")) {
      localStorage.setItem("luxe_ticket_designs", JSON.stringify(INITIAL_TICKET_DESIGNS));
    }
    if (!localStorage.getItem("luxe_seat_service_orders")) {
      localStorage.setItem("luxe_seat_service_orders", JSON.stringify(INITIAL_SERVICE_ORDERS));
    }
    if (!localStorage.getItem("luxe_p2p_swaps")) {
      localStorage.setItem("luxe_p2p_swaps", JSON.stringify(INITIAL_SWAPS));
    }
    if (!localStorage.getItem("luxe_resale_listings")) {
      localStorage.setItem("luxe_resale_listings", JSON.stringify([]));
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
  bookSeats: (eventId, seatIds, promoCode) => {
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
    let totalPrice = bookedSeatsInfo.reduce((acc, s) => acc + s.price, 0);

    // Apply promo code if present
    if (promoCode) {
      const promoCodes = JSON.parse(localStorage.getItem("luxe_promo_codes")) || [];
      const foundIdx = promoCodes.findIndex(c => c.code === promoCode.toUpperCase().trim());
      if (foundIdx !== -1) {
        const promo = promoCodes[foundIdx];
        if (promo.type === "percent") {
          totalPrice = totalPrice * (1 - promo.discount / 100);
        } else {
          totalPrice = Math.max(0, totalPrice - promo.discount);
        }
        promoCodes[foundIdx].usageCount = (promoCodes[foundIdx].usageCount || 0) + 1;
        localStorage.setItem("luxe_promo_codes", JSON.stringify(promoCodes));
      }
    }

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
      qrCode: "LUXE-" + eventId + "-" + seatIds.join("-"),
      selectedBy: user.name,
      isCheckedIn: false,
      notes: "",
      promoCodeUsed: promoCode || null
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

  updateEvent: (eventId, eventData) => {
    if (!isClient) return null;
    mockDb.init();
    const events = JSON.parse(localStorage.getItem("luxe_events")) || [];
    const idx = events.findIndex(e => e.id === eventId);
    if (idx === -1) return null;

    const updatedEvent = {
      ...events[idx],
      ...eventData,
      title: eventData.title || events[idx].title,
      subtitle: eventData.subtitle || events[idx].subtitle,
      description: eventData.description || events[idx].description,
      date: eventData.date || events[idx].date,
      time: eventData.time || events[idx].time,
      location: eventData.location || events[idx].location,
      price: eventData.price || events[idx].price
    };

    events[idx] = updatedEvent;
    localStorage.setItem("luxe_events", JSON.stringify(events));
    return updatedEvent;
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
  },

  // --- Promo Codes ---
  getPromoCodes: () => {
    if (!isClient) return [];
    mockDb.init();
    return JSON.parse(localStorage.getItem("luxe_promo_codes")) || [];
  },

  createPromoCode: (codeData) => {
    if (!isClient) return null;
    mockDb.init();
    const codes = mockDb.getPromoCodes();
    const normalized = codeData.code.toUpperCase().trim();
    if (codes.some(c => c.code === normalized)) return null;

    const newCode = {
      code: normalized,
      discount: Number(codeData.discount),
      type: codeData.type || "percent",
      usageCount: 0
    };
    codes.push(newCode);
    localStorage.setItem("luxe_promo_codes", JSON.stringify(codes));
    return newCode;
  },

  deletePromoCode: (code) => {
    if (!isClient) return false;
    mockDb.init();
    const codes = mockDb.getPromoCodes();
    const filtered = codes.filter(c => c.code !== code);
    localStorage.setItem("luxe_promo_codes", JSON.stringify(filtered));
    return true;
  },

  validatePromoCode: (code) => {
    if (!isClient) return null;
    mockDb.init();
    const codes = mockDb.getPromoCodes();
    const found = codes.find(c => c.code === code.toUpperCase().trim());
    return found || null;
  },

  // --- Attendee CRM Operations ---
  checkInTicket: (bookingId) => {
    if (!isClient) return false;
    mockDb.init();
    const bookings = JSON.parse(localStorage.getItem("luxe_bookings")) || [];
    const idx = bookings.findIndex(b => b.id === bookingId);
    if (idx === -1) return false;
    
    bookings[idx].isCheckedIn = true;
    bookings[idx].checkInTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    localStorage.setItem("luxe_bookings", JSON.stringify(bookings));
    return true;
  },

  updateAttendeeNotes: (bookingId, notes) => {
    if (!isClient) return false;
    mockDb.init();
    const bookings = JSON.parse(localStorage.getItem("luxe_bookings")) || [];
    const idx = bookings.findIndex(b => b.id === bookingId);
    if (idx === -1) return false;
    
    bookings[idx].notes = notes;
    localStorage.setItem("luxe_bookings", JSON.stringify(bookings));
    return true;
  },

  cancelBooking: (bookingId) => {
    if (!isClient) return false;
    mockDb.init();
    const bookings = JSON.parse(localStorage.getItem("luxe_bookings")) || [];
    const bookingIndex = bookings.findIndex(b => b.id === bookingId);
    if (bookingIndex === -1) return false;
    
    const booking = bookings[bookingIndex];
    
    // Release the seats in the event
    const events = JSON.parse(localStorage.getItem("luxe_events")) || [];
    const eventIndex = events.findIndex(e => e.id === booking.eventId);
    if (eventIndex !== -1) {
      const event = events[eventIndex];
      event.seats = event.seats.map(seat => {
        if (booking.seats.includes(seat.id)) {
          return { ...seat, isBooked: false, selectedBy: null, heldBy: null, heldUntil: null };
        }
        return seat;
      });
      events[eventIndex] = event;
      localStorage.setItem("luxe_events", JSON.stringify(events));
    }
    
    // Remove the booking
    const updatedBookings = bookings.filter(b => b.id !== bookingId);
    localStorage.setItem("luxe_bookings", JSON.stringify(updatedBookings));
    return true;
  },

  reassignSeat: (bookingId, oldSeatId, newSeatId) => {
    if (!isClient) return false;
    mockDb.init();
    const bookings = JSON.parse(localStorage.getItem("luxe_bookings")) || [];
    const bookingIdx = bookings.findIndex(b => b.id === bookingId);
    if (bookingIdx === -1) return false;
    
    const booking = bookings[bookingIdx];
    const eventId = booking.eventId;
    
    const events = JSON.parse(localStorage.getItem("luxe_events")) || [];
    const eventIdx = events.findIndex(e => e.id === eventId);
    if (eventIdx === -1) return false;
    const event = events[eventIdx];
    
    // Check if newSeatId is available/vacant
    const newSeat = event.seats.find(s => s.id === newSeatId);
    if (!newSeat || newSeat.isBooked) return false;
    
    // Update the event seats
    event.seats = event.seats.map(seat => {
      if (seat.id === oldSeatId) {
        return { ...seat, isBooked: false, selectedBy: null, heldBy: null, heldUntil: null };
      }
      if (seat.id === newSeatId) {
        return { ...seat, isBooked: true, selectedBy: booking.selectedBy, heldBy: null, heldUntil: null };
      }
      return seat;
    });
    
    // Update booking seats array
    booking.seats = booking.seats.map(s => s === oldSeatId ? newSeatId : s);
    
    events[eventIdx] = event;
    bookings[bookingIdx] = booking;
    
    localStorage.setItem("luxe_events", JSON.stringify(events));
    localStorage.setItem("luxe_bookings", JSON.stringify(bookings));
    return true;
  },

  toggleBookingVip: (bookingId) => {
    if (!isClient) return false;
    mockDb.init();
    const bookings = JSON.parse(localStorage.getItem("luxe_bookings")) || [];
    const idx = bookings.findIndex(b => b.id === bookingId);
    if (idx === -1) return false;
    
    const isVip = !bookings[idx].isVip;
    bookings[idx].isVip = isVip;
    localStorage.setItem("luxe_bookings", JSON.stringify(bookings));
    return isVip;
  },

  // --- Operational Kanban Planner ---
  getPlannerTasks: () => {
    if (!isClient) return [];
    mockDb.init();
    return JSON.parse(localStorage.getItem("luxe_planner_tasks")) || [];
  },

  updatePlannerTaskStatus: (taskId, status) => {
    if (!isClient) return false;
    mockDb.init();
    const tasks = mockDb.getPlannerTasks();
    const idx = tasks.findIndex(t => t.id === taskId);
    if (idx === -1) return false;
    
    tasks[idx].status = status;
    localStorage.setItem("luxe_planner_tasks", JSON.stringify(tasks));
    return true;
  },

  createPlannerTask: (taskData) => {
    if (!isClient) return null;
    mockDb.init();
    const tasks = mockDb.getPlannerTasks();
    const newTask = {
      id: "t-" + Math.floor(Math.random() * 100000),
      title: taskData.title,
      status: taskData.status || "todo",
      category: taskData.category || "General"
    };
    tasks.push(newTask);
    localStorage.setItem("luxe_planner_tasks", JSON.stringify(tasks));
    return newTask;
  },

  deletePlannerTask: (taskId) => {
    if (!isClient) return false;
    mockDb.init();
    const tasks = mockDb.getPlannerTasks();
    const filtered = tasks.filter(t => t.id !== taskId);
    localStorage.setItem("luxe_planner_tasks", JSON.stringify(filtered));
    return true;
  },

  // --- Custom Ticket Designer ---
  getTicketDesigns: () => {
    if (!isClient) return INITIAL_TICKET_DESIGNS;
    mockDb.init();
    return JSON.parse(localStorage.getItem("luxe_ticket_designs")) || [];
  },

  saveTicketDesign: (design) => {
    if (!isClient) return null;
    mockDb.init();
    const designs = mockDb.getTicketDesigns();
    const newDesign = {
      ...design,
      id: design.id || "ds-" + Math.floor(Math.random() * 100000)
    };
    const idx = designs.findIndex(d => d.id === newDesign.id);
    if (idx !== -1) {
      designs[idx] = newDesign;
    } else {
      designs.push(newDesign);
    }
    localStorage.setItem("luxe_ticket_designs", JSON.stringify(designs));
    return newDesign;
  },

  assignDesignToEvent: (eventId, designId) => {
    if (!isClient) return false;
    mockDb.init();
    const events = JSON.parse(localStorage.getItem("luxe_events")) || [];
    const idx = events.findIndex(e => e.id === eventId);
    if (idx === -1) return false;
    events[idx].ticketDesignId = designId;
    localStorage.setItem("luxe_events", JSON.stringify(events));
    return true;
  },

  // --- VIP Seat Service Orders ---
  getSeatServiceOrders: () => {
    if (!isClient) return INITIAL_SERVICE_ORDERS;
    mockDb.init();
    return JSON.parse(localStorage.getItem("luxe_seat_service_orders")) || [];
  },

  placeSeatServiceOrder: (order) => {
    if (!isClient) return null;
    mockDb.init();
    const orders = mockDb.getSeatServiceOrders();
    const newOrder = {
      ...order,
      id: "ord-" + Math.floor(Math.random() * 100000),
      status: "pending"
    };
    orders.push(newOrder);
    localStorage.setItem("luxe_seat_service_orders", JSON.stringify(orders));
    return newOrder;
  },

  updateOrderStatus: (orderId, status) => {
    if (!isClient) return false;
    mockDb.init();
    const orders = mockDb.getSeatServiceOrders();
    const idx = orders.findIndex(o => o.id === orderId);
    if (idx === -1) return false;
    orders[idx].status = status;
    localStorage.setItem("luxe_seat_service_orders", JSON.stringify(orders));
    return true;
  },

  // --- Peer-to-Peer Seat Swaps ---
  getP2PSwaps: (userName) => {
    if (!isClient) return [];
    mockDb.init();
    const swaps = JSON.parse(localStorage.getItem("luxe_p2p_swaps")) || [];
    return swaps.filter(s => s.senderName === userName || s.recipientName === userName);
  },

  createSeatSwapOffer: (swap) => {
    if (!isClient) return null;
    mockDb.init();
    const swaps = JSON.parse(localStorage.getItem("luxe_p2p_swaps")) || [];
    const newSwap = {
      ...swap,
      id: "swap-" + Math.floor(Math.random() * 100000),
      status: "pending"
    };
    swaps.push(newSwap);
    localStorage.setItem("luxe_p2p_swaps", JSON.stringify(swaps));
    return newSwap;
  },

  updateSeatSwapStatus: (swapId, status) => {
    if (!isClient) return false;
    mockDb.init();
    const swaps = JSON.parse(localStorage.getItem("luxe_p2p_swaps")) || [];
    const idx = swaps.findIndex(s => s.id === swapId);
    if (idx === -1) return false;
    swaps[idx].status = status;
    localStorage.setItem("luxe_p2p_swaps", JSON.stringify(swaps));

    // If accepted, execute the actual seat reassignment!
    if (status === "accepted") {
      const swap = swaps[idx];
      const bookings = JSON.parse(localStorage.getItem("luxe_bookings")) || [];
      const events = JSON.parse(localStorage.getItem("luxe_events")) || [];
      
      // Swap sender's booking seat with recipient's booking seat
      const senderBookingIdx = bookings.findIndex(b => b.eventId === swap.eventId && b.seats.includes(swap.senderSeat));
      const recipientBookingIdx = bookings.findIndex(b => b.eventId === swap.eventId && b.seats.includes(swap.recipientSeat));

      if (senderBookingIdx !== -1 && recipientBookingIdx !== -1) {
        // Swap them in bookings
        const sSeats = bookings[senderBookingIdx].seats.map(s => s === swap.senderSeat ? swap.recipientSeat : s);
        const rSeats = bookings[recipientBookingIdx].seats.map(s => s === swap.recipientSeat ? swap.senderSeat : s);
        
        bookings[senderBookingIdx].seats = sSeats;
        bookings[recipientBookingIdx].seats = rSeats;
        localStorage.setItem("luxe_bookings", JSON.stringify(bookings));

        // Swap them in event seating maps
        const eventIdx = events.findIndex(e => e.id === swap.eventId);
        if (eventIdx !== -1) {
          const event = events[eventIdx];
          event.seats = event.seats.map(seat => {
            if (seat.id === swap.senderSeat) {
              return { ...seat, selectedBy: swap.recipientName };
            }
            if (seat.id === swap.recipientSeat) {
              return { ...seat, selectedBy: swap.senderName };
            }
            return seat;
          });
          events[eventIdx] = event;
          localStorage.setItem("luxe_events", JSON.stringify(events));
        }
      }
    }
    return true;
  },

  listTicketForResale: (bookingId, price) => {
    if (!isClient) return null;
    mockDb.init();
    const bookings = JSON.parse(localStorage.getItem("luxe_bookings")) || [];
    const idx = bookings.findIndex(b => b.id === bookingId);
    if (idx === -1) return null;
    
    bookings[idx].resaleListed = true;
    bookings[idx].resalePrice = price;
    localStorage.setItem("luxe_bookings", JSON.stringify(bookings));

    const listings = JSON.parse(localStorage.getItem("luxe_resale_listings")) || [];
    const existingIdx = listings.findIndex(l => l.bookingId === bookingId);
    const newListing = {
      id: "listing-" + Math.floor(Math.random() * 100000),
      bookingId,
      eventId: bookings[idx].eventId,
      eventTitle: bookings[idx].eventTitle,
      eventDate: bookings[idx].eventDate,
      eventImage: bookings[idx].eventImage,
      eventLocation: bookings[idx].eventLocation,
      seats: bookings[idx].seats,
      sellerName: bookings[idx].userName,
      price: price
    };

    if (existingIdx !== -1) {
      listings[existingIdx] = newListing;
    } else {
      listings.push(newListing);
    }
    localStorage.setItem("luxe_resale_listings", JSON.stringify(listings));
    return newListing;
  },

  delistTicketForResale: (bookingId) => {
    if (!isClient) return false;
    mockDb.init();
    const bookings = JSON.parse(localStorage.getItem("luxe_bookings")) || [];
    const idx = bookings.findIndex(b => b.id === bookingId);
    if (idx !== -1) {
      bookings[idx].resaleListed = false;
      localStorage.setItem("luxe_bookings", JSON.stringify(bookings));
    }

    let listings = JSON.parse(localStorage.getItem("luxe_resale_listings")) || [];
    listings = listings.filter(l => l.bookingId !== bookingId);
    localStorage.setItem("luxe_resale_listings", JSON.stringify(listings));
    return true;
  },

  getResaleListings: () => {
    if (!isClient) return [];
    mockDb.init();
    return JSON.parse(localStorage.getItem("luxe_resale_listings")) || [];
  },

  buyResaleListing: (listingId, buyerName, buyerEmail) => {
    if (!isClient) return false;
    mockDb.init();
    const listings = JSON.parse(localStorage.getItem("luxe_resale_listings")) || [];
    const listingIdx = listings.findIndex(l => l.id === listingId);
    if (listingIdx === -1) return false;

    const listing = listings[listingIdx];
    const bookings = JSON.parse(localStorage.getItem("luxe_bookings")) || [];
    
    // Mark seller's booking as resold
    const sellerBookingIdx = bookings.findIndex(b => b.id === listing.bookingId);
    if (sellerBookingIdx !== -1) {
      bookings[sellerBookingIdx].status = "resold";
      bookings[sellerBookingIdx].resaleListed = false;
    }

    // Create a new booking record for the buyer
    const newBooking = {
      id: "BK-" + Math.floor(Math.random() * 900000 + 100000),
      eventId: listing.eventId,
      eventTitle: listing.eventTitle,
      eventDate: listing.eventDate,
      eventImage: listing.eventImage,
      eventLocation: listing.eventLocation,
      seats: listing.seats,
      userName: buyerName,
      userEmail: buyerEmail,
      price: listing.price,
      status: "paid",
      createdAt: new Date().toISOString()
    };
    bookings.push(newBooking);
    localStorage.setItem("luxe_bookings", JSON.stringify(bookings));

    // Update seating map owner name
    const events = JSON.parse(localStorage.getItem("luxe_events")) || [];
    const eventIdx = events.findIndex(e => e.id === listing.eventId);
    if (eventIdx !== -1) {
      const event = events[eventIdx];
      event.seats = event.seats.map(seat => {
        if (listing.seats.includes(seat.id)) {
          return { ...seat, selectedBy: buyerName };
        }
        return seat;
      });
      events[eventIdx] = event;
      localStorage.setItem("luxe_events", JSON.stringify(events));
    }

    // Remove from active resale listings
    const updatedListings = listings.filter(l => l.id !== listingId);
    localStorage.setItem("luxe_resale_listings", JSON.stringify(updatedListings));

    return newBooking;
  }
};
