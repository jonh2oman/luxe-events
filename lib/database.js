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

const DICTIONARY = {
  en: {
    discover: "Discover",
    myTickets: "My Tickets",
    organizerPanel: "Organizer Panel",
    accessPlatform: "Access Platform",
    signOut: "Sign Out",
    settings: "Settings",
    help: "Help",
    active: "Active",
    completed: "Completed",
    upcoming: "Upcoming",
    revenue: "Revenue",
    ticketsSold: "Tickets Sold",
    organizerDashboard: "Organizer Dashboard",
    backstageControlSuite: "Backstage Control Suite",
    guestCRM: "Guest CRM",
    crmDesc: "Search directory, add VIP notes, and dispatch broadcasts.",
    promoEngine: "Promo Code Engine",
    promoDesc: "Generate discount codes, set tiers, track redemption rates.",
    backstagePlanner: "Backstage Planner",
    plannerDesc: "Kanban checklist for production, catering, and artists.",
    layoutDesigner: "Layout Designer",
    layoutDesc: "Configure seating grids, designate corridors and VIP areas.",
    gateScanner: "Gate Scanner",
    gateDesc: "Open live camera to verify digital QR code tickets at the door.",
    liveGateCheckIn: "Live Gate Check-In",
    liveGatesOpen: "Live Gates Open",
    recentArrivals: "Recent Arrivals",
    backstageOperationsStatus: "Backstage Operations Status",
    checklistCompleted: "Preparation Checklist Completed",
    salesVelocityWeekly: "Sales Velocity (Weekly)",
    attendeeDemographics: "Attendee Demographics",
    yourListedCampaigns: "Your Listed Campaigns",
    attendeeDashboard: "Attendee Dashboard",
    noTicketsTitle: "No tickets secured yet.",
    noTicketsDesc: "Explore our discover page to book seats for premium events.",
    recentChatroom: "Live Concert Chatrooms",
    attendingFriends: "Friends Attending",
    selectYourSeats: "Select Your Seats",
    standardTable: "Standard Table",
    vipLounge: "VIP Lounge",
    vipTerrace: "VIP Terrace",
    aisleWalkway: "Aisle / Walkway",
    groupSplitBooking: "Group Split Booking",
    groupSplitActive: "Group Split Booking Active!",
    havePromoCode: "Have a Promo Code?",
    checkoutSummary: "Checkout Summary",
    originalPrice: "Original Price",
    promoDiscount: "Promo Discount",
    totalToPay: "Total to Pay",
    secureCheckout: "Secure Checkout",
    splitWithFriends: "Split payment with friends",
    holdSeats10Min: "Seats are temporarily held for 10 minutes upon selection."
  },
  fr: {
    discover: "Découvrir",
    myTickets: "Mes Billets",
    organizerPanel: "Panel Organisateur",
    accessPlatform: "Accéder au Portail",
    signOut: "Se Déconnecter",
    settings: "Paramètres",
    help: "Aide",
    active: "Actif",
    completed: "Terminé",
    upcoming: "À venir",
    revenue: "Revenu",
    ticketsSold: "Billets Vendus",
    organizerDashboard: "Tableau de Bord de l'Organisateur",
    backstageControlSuite: "Suite de Contrôle des Coulisses",
    guestCRM: "CRM Invités",
    crmDesc: "Rechercher des invités, ajouter des notes VIP et envoyer des annonces.",
    promoEngine: "Codes Promos",
    promoDesc: "Générer des codes de réduction et suivre les taux d'utilisation.",
    backstagePlanner: "Planificateur",
    plannerDesc: "Liste de contrôle Kanban pour la production, le traiteur et les artistes.",
    layoutDesigner: "Designer de Salle",
    layoutDesc: "Configurer les grilles de sièges, désigner les couloirs et zones VIP.",
    gateScanner: "Scanner de Porte",
    gateDesc: "Ouvrir la caméra pour vérifier les codes QR des billets à la porte.",
    liveGateCheckIn: "Enregistrement des Portes en Direct",
    liveGatesOpen: "Portes Ouvertes en Direct",
    recentArrivals: "Arrivées Récentes",
    backstageOperationsStatus: "Statut des Opérations en Coulisses",
    checklistCompleted: "Liste de Préparation Complétée",
    salesVelocityWeekly: "Vélocité des Ventes (Hebdomadaire)",
    attendeeDemographics: "Démographie des Participants",
    yourListedCampaigns: "Vos Campagnes Répertoriées",
    attendeeDashboard: "Tableau de Bord Participant",
    noTicketsTitle: "Aucun billet réservé pour le moment.",
    noTicketsDesc: "Explorez notre page de découverte pour réserver des places pour les événements.",
    recentChatroom: "Salons de Discussion en Direct",
    attendingFriends: "Amis Présents",
    selectYourSeats: "Sélectionnez vos Sièges",
    standardTable: "Table Standard",
    vipLounge: "Salon VIP",
    vipTerrace: "Terrasse VIP",
    aisleWalkway: "Allée / Couloir",
    groupSplitBooking: "Réservation Groupée Partagée",
    groupSplitActive: "Paiement Partagé Actif!",
    havePromoCode: "Avez-vous un Code Promo?",
    checkoutSummary: "Récapitulatif de Commande",
    originalPrice: "Prix d'Origine",
    promoDiscount: "Remise Promo",
    totalToPay: "Total à Payer",
    secureCheckout: "Paiement Sécurisé",
    splitWithFriends: "Partager le paiement avec des amis",
    holdSeats10Min: "Les sièges sont temporairement réservés pendant 10 minutes lors de la sélection."
  },
  es: {
    discover: "Descubrir",
    myTickets: "Mis Boletos",
    organizerPanel: "Panel Organizador",
    accessPlatform: "Acceder al Portal",
    signOut: "Cerrar Sesión",
    settings: "Ajustes",
    help: "Ayuda",
    active: "Activo",
    completed: "Completado",
    upcoming: "Próximo",
    revenue: "Ingresos",
    ticketsSold: "Boletos Vendidos",
    organizerDashboard: "Panel de Control de Organizador",
    backstageControlSuite: "Suite de Control Tras Bambalinas",
    guestCRM: "CRM de Invitados",
    crmDesc: "Buscar invitados, agregar notas VIP y enviar anuncios masivos.",
    promoEngine: "Códigos de Descuento",
    promoDesc: "Generar cupones de descuento y realizar seguimiento de redenciones.",
    backstagePlanner: "Planificador de Evento",
    plannerDesc: "Lista de tareas Kanban para producción, catering y artistas.",
    layoutDesigner: "Diseñador de Mapas",
    layoutDesc: "Configurar cuadrícula de asientos, pasillos y áreas VIP.",
    gateScanner: "Escáner de Puerta",
    gateDesc: "Abrir cámara para verificar boletos con códigos QR en la entrada.",
    liveGateCheckIn: "Registros en Puerta en Vivo",
    liveGatesOpen: "Puertas Abiertas en Vivo",
    recentArrivals: "Llegadas Recientes",
    backstageOperationsStatus: "Estado de Operaciones Backstage",
    checklistCompleted: "Lista de Preparación Completada",
    salesVelocityWeekly: "Velocidad de Ventas (Semanal)",
    attendeeDemographics: "Demografía de los Asistentes",
    yourListedCampaigns: "Sus Campañas Registradas",
    attendeeDashboard: "Panel de Asistente",
    noTicketsTitle: "Aún no tienes boletos asegurados.",
    noTicketsDesc: "Explora nuestra página de descubrimiento para reservar tus asientos.",
    recentChatroom: "Salas de Chat en Vivo",
    attendingFriends: "Amigos que Asisten",
    selectYourSeats: "Selecciona tus Asientos",
    standardTable: "Mesa Estándar",
    vipLounge: "Salón VIP",
    vipTerrace: "Terraza VIP",
    aisleWalkway: "Pasillo / Corredor",
    groupSplitBooking: "Pago Grupal Dividido",
    groupSplitActive: "¡Pago Grupal Dividido Activo!",
    havePromoCode: "¿Tienes un Código de Descuento?",
    checkoutSummary: "Resumen de Pago",
    originalPrice: "Precio Original",
    promoDiscount: "Descuento Aplicado",
    totalToPay: "Total a Pagar",
    secureCheckout: "Pagar de Forma Segura",
    splitWithFriends: "Dividir el pago con amigos",
    holdSeats10Min: "Los asientos se retienen temporalmente por 10 minutos al seleccionarlos."
  }
};

export const database = {
  // Translate helper
  translate: (key, languageCode = "en") => {
    const lang = (languageCode || "en").toLowerCase();
    const dictionary = DICTIONARY[lang] || DICTIONARY["en"];
    return dictionary[key] || DICTIONARY["en"][key] || key;
  },

  // Price formatter and currency converter
  formatPrice: (amount, currencyCode = "CAD") => {
    const currency = (currencyCode || "CAD").toUpperCase();
    let converted = Number(amount) || 0;
    let symbol = "CA$";
    
    switch (currency) {
      case "USD":
        converted = amount * 0.73;
        symbol = "US$";
        break;
      case "EUR":
        converted = amount * 0.68;
        symbol = "€";
        break;
      case "GBP":
        converted = amount * 0.58;
        symbol = "£";
        break;
      case "CAD":
      default:
        converted = amount * 1.0;
        symbol = "CA$";
        break;
    }
    
    const formatted = converted.toFixed(2);
    if (symbol === "€") {
      return `€${formatted}`;
    } else if (symbol === "£") {
      return `£${formatted}`;
    } else {
      return `${symbol} ${formatted}`;
    }
  },

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

  cancelBooking: async (bookingId) => {
    return mockDb.cancelBooking(bookingId);
  },

  reassignSeat: async (bookingId, oldSeatId, newSeatId) => {
    return mockDb.reassignSeat(bookingId, oldSeatId, newSeatId);
  },

  toggleBookingVip: async (bookingId) => {
    return mockDb.toggleBookingVip(bookingId);
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
  },

  // --- Custom Ticket Designer ---
  getTicketDesigns: async () => {
    return mockDb.getTicketDesigns();
  },

  saveTicketDesign: async (design) => {
    return mockDb.saveTicketDesign(design);
  },

  assignDesignToEvent: async (eventId, designId) => {
    return mockDb.assignDesignToEvent(eventId, designId);
  },

  // --- VIP Seat Service Orders ---
  getSeatServiceOrders: async () => {
    return mockDb.getSeatServiceOrders();
  },

  placeSeatServiceOrder: async (order) => {
    return mockDb.placeSeatServiceOrder(order);
  },

  updateOrderStatus: async (orderId, status) => {
    return mockDb.updateOrderStatus(orderId, status);
  },

  // --- Peer-to-Peer Seat Swaps ---
  getP2PSwaps: async (userName) => {
    return mockDb.getP2PSwaps(userName);
  },

  createSeatSwapOffer: async (swap) => {
    return mockDb.createSeatSwapOffer(swap);
  },

  updateSeatSwapStatus: async (swapId, status) => {
    return mockDb.updateSeatSwapStatus(swapId, status);
  }
};
