"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { 
  HelpCircle, BookOpen, User, Briefcase, KeyRound, AlertTriangle, 
  BadgeInfo, CheckCircle2, Ticket, Settings, ArrowRight, FileText,
  ChevronDown, Search, Send, ShieldCheck, Mail, HelpCircle as HelpIcon, Sparkles
} from "lucide-react";
import { database } from "@/lib/database";
import { isRealFirebase } from "@/lib/firebase";

// Multi-language content dictionary for the Help/Documentation Page
const HELP_TRANSLATIONS = {
  en: {
    title: "Documentation & Operations Center",
    subtitle: "Complete platform guides, operational workflows, and interactive support desk.",
    searchPlaceholder: "Search documentation, FAQs, tools...",
    tabs: {
      faq: "General FAQ",
      attendee: "Attendee Guide",
      organizer: "Organizer Guide",
      support: "Interactive Helpdesk"
    },
    faqSectionTitle: "Frequently Asked Questions",
    faqSectionSubtitle: "Quick answers to common operational questions regarding Luxe Events.",
    guideSectionTitle: "Operational Manuals",
    guideSectionSubtitle: "Detailed step-by-step documentation for attendees and event producers.",
    supportTitle: "Interactive Support Portal",
    supportSubtitle: "Ask our automated operations assistant a question about your account or event setup.",
    supportNameLabel: "Your Name",
    supportEmailLabel: "Email Address",
    supportTopicLabel: "Topic",
    supportMessageLabel: "How can we assist you?",
    supportSubmit: "Submit Support Ticket",
    supportSuccess: "Ticket Transmitted Successfully!",
    supportTyping: "AI Agent is compiling response...",
    quickLinks: "Quick Action Deck",
    quickLinksDesc: "Direct shortcuts to active workspace dashboards.",
    goToDiscover: "Browse Events",
    goToOrganizer: "Organizer Console",
    goToTickets: "My Ticket Wallet",
    goToSettings: "System Preferences"
  },
  fr: {
    title: "Centre de Documentation & Opérations",
    subtitle: "Guides complets de la plateforme, flux opérationnels et assistance interactive.",
    searchPlaceholder: "Rechercher de la documentation, FAQ, outils...",
    tabs: {
      faq: "FAQ Générale",
      attendee: "Guide de l'Invité",
      organizer: "Guide de l'Organisateur",
      support: "Assistance Interactive"
    },
    faqSectionTitle: "Foire Aux Questions",
    faqSectionSubtitle: "Réponses rapides aux questions opérationnelles courantes concernant Luxe Events.",
    guideSectionTitle: "Manuels Opérationnels",
    guideSectionSubtitle: "Documentation détaillée étape par étape pour les invités et les producteurs d'événements.",
    supportTitle: "Portail d'Assistance Interactif",
    supportSubtitle: "Posez une question à notre assistant virtuel sur la configuration de votre compte ou événement.",
    supportNameLabel: "Votre Nom",
    supportEmailLabel: "Adresse E-mail",
    supportTopicLabel: "Sujet",
    supportMessageLabel: "Comment pouvons-nous vous aider ?",
    supportSubmit: "Soumettre le Billet",
    supportSuccess: "Ticket transmis avec succès !",
    supportTyping: "L'assistant compile la réponse...",
    quickLinks: "Raccourcis d'Action",
    quickLinksDesc: "Raccourcis directs vers les tableaux de bord actifs.",
    goToDiscover: "Découvrir Événements",
    goToOrganizer: "Console Organisateur",
    goToTickets: "Mes Billets Wallet",
    goToSettings: "Préférences Système"
  },
  es: {
    title: "Centro de Documentación y Operaciones",
    subtitle: "Guías completas de la plataforma, flujos operativos y asistencia interactiva.",
    searchPlaceholder: "Buscar documentación, FAQ, herramientas...",
    tabs: {
      faq: "Preguntas Frecuentes",
      attendee: "Guía de Asistentes",
      organizer: "Guía de Organizadores",
      support: "Soporte Interactivo"
    },
    faqSectionTitle: "Preguntas Frecuentes",
    faqSectionSubtitle: "Respuestas rápidas a preguntas operativas comunes sobre Luxe Events.",
    guideSectionTitle: "Manuales Operativos",
    guideSectionSubtitle: "Documentación detallada paso a paso para asistentes y productores de eventos.",
    supportTitle: "Portal de Soporte Interactivo",
    supportSubtitle: "Haga una pregunta a nuestro asistente virtual sobre su cuenta o configuración del evento.",
    supportNameLabel: "Su Nombre",
    supportEmailLabel: "Correo Electrónico",
    supportTopicLabel: "Tema",
    supportMessageLabel: "¿Cómo podemos ayudarle?",
    supportSubmit: "Enviar Ticket de Soporte",
    supportSuccess: "¡Ticket transmitido con éxito!",
    supportTyping: "El asistente está compilando la respuesta...",
    quickLinks: "Accesos Rápidos",
    quickLinksDesc: "Enlaces directos a los paneles de control activos.",
    goToDiscover: "Ver Eventos",
    goToOrganizer: "Consola de Organizador",
    goToTickets: "Mi Billetera de Boletos",
    goToSettings: "Preferencias del Sistema"
  }
};

const FAQ_DATA = {
  en: [
    {
      q: "What is the difference between an Attendee and an Event Organizer profile?",
      a: "Attendee profiles are tailored for guests who discover shows, buy tickets, hold group bookings, and chat in live concert lounges. Organizer profiles grant access to the Backstage Operations Suite: the layout designer canvas, promo code managers, operational Kanban boards, ticket scanners, and client Support portals."
    },
    {
      q: "How does the 10-Minute temporary seat hold mechanism work?",
      a: "To prevent double-bookings, selecting seats in the reservation grid places a temporary 10-minute hold lock in the database. If checkout isn't completed within 10 minutes, the hold expires automatically, and the seats become vacant for other users."
    },
    {
      q: "What is Group Split Booking and how is it used?",
      a: "Group Split Booking allows a group of friends to split seats. The initiator buys their seat and locks the others under a special 'Group Split Hold'. A unique invite link is generated. When friends click it, the held seats glow with a pulsing purple ring, and the system automatically pre-selects the first available invite seat for them."
    },
    {
      q: "How does the Gate Check-In webcam scanner verify tickets?",
      a: "The verifier uses your device webcam to capture and decode the digital QR ticket code. It decodes the transaction hash, verifies the cryptographic seat assignment signatures, updates the guest's check-in status to 'Completed', and alerts the manager if the attendee is marked as a VIP."
    },
    {
      q: "Is the system currently running online or offline?",
      a: "Luxe Events operates in a dual mode. By default, it runs in Mock Sandbox Mode, storing all transactions, seating layouts, and VIP notes in local browser cache. Once valid Firebase API credentials and Stripe keys are provided in the environment files, the app instantly switches to live global database synchronization."
    }
  ],
  fr: [
    {
      q: "Quelle est la différence entre un profil Invité et un profil Organisateur ?",
      a: "Les profils Invités sont conçus pour réserver des places, gérer des réservations groupées et chatter. Les profils Organisateurs donnent accès à la suite complète des coulisses : création de plans de salle, codes promos, outils Kanban opérationnels, CRM invités et scanner de billets."
    },
    {
      q: "Comment fonctionne la réservation temporaire de 10 minutes ?",
      a: "Lorsqu'un utilisateur sélectionne des sièges, le système applique un verrou temporaire de 10 minutes dans la base de données. Si la commande n'est pas payée dans ce délai, les sièges sont automatiquement libérés et redeviennent vacants."
    },
    {
      q: "Qu'est-ce que le paiement partagé (Group Split Booking) ?",
      a: "Cela permet à des amis de réserver des sièges côte à côte et de payer séparément. L'initiateur paye sa place et génère un lien d'invitation. En ouvrant le lien, les sièges du groupe clignotent en violet et le système sélectionne automatiquement le siège attribué pour un achat rapide."
    },
    {
      q: "Comment fonctionne le scanner de billets de la porte d'entrée ?",
      a: "Le scanner utilise la caméra de votre appareil pour décoder le code QR du billet. Il valide la signature cryptographique du siège, marque l'invité comme 'Arrivé' dans le CRM et affiche une alerte dorée si l'invité a le statut VIP."
    },
    {
      q: "La plateforme fonctionne-t-elle en ligne ou hors ligne ?",
      a: "Luxe Events fonctionne en double mode. Par défaut, elle est en mode Sandbox local. Une fois les variables d'environnement Firebase et Stripe configurées, l'application se connecte automatiquement aux serveurs cloud en direct."
    }
  ],
  es: [
    {
      q: "¿Cuál es la diferencia entre un perfil de Asistente y uno de Organizador?",
      a: "El perfil de Asistente está diseñado para buscar eventos, reservar boletos y chatear. El de Organizador habilita la Suite de Control Tras Bambalinas: diseño de mapas de asientos, creación de cupones, Kanban de producción, herramientas de soporte y verificación de códigos QR."
    },
    {
      q: "¿Cómo funciona la retención temporal de asientos de 10 minutos?",
      a: "Al seleccionar asientos, el sistema bloquea esos lugares en la base de datos durante 10 minutos. Si el pago no se completa en ese lapso, la retención expira y los asientos vuelven a estar disponibles para el público."
    },
    {
      q: "¿Qué es la reserva dividida en grupo (Group Split Booking)?",
      a: "Permite reservar asientos contiguos y dividir el pago con amigos. El organizador del grupo compra su asiento y comparte un enlace. Al abrirlo, los asientos reservados del grupo parpadean en morado y el sistema preselecciona el asiento correspondiente para agilizar el pago."
    },
    {
      q: "¿Cómo funciona el escáner de la puerta de acceso?",
      a: "El verificador usa la cámara web para escanear el código QR del boleto. Decodifica la transacción, valida la firma del asiento, actualiza el estado de acceso a 'Completado' y emite una alerta dorada si el usuario es VIP."
    },
    {
      q: "¿El sistema funciona en línea o fuera de línea?",
      a: "Luxe Events cuenta con modo dual. Por defecto, opera en un entorno local (Sandbox). Al configurar las variables de entorno de Firebase y Stripe, se conecta en tiempo real a la base de datos y servicios en la nube."
    }
  ]
};

export default function HelpPage() {
  const { user } = useAuth();
  const currentLang = user?.language || "en";
  const t = HELP_TRANSLATIONS[currentLang] || HELP_TRANSLATIONS.en;
  
  const [activeTab, setActiveTab] = useState("faq"); // 'faq' | 'guides' | 'support'
  const [searchQuery, setSearchQuery] = useState("");
  const [openFaq, setOpenFaq] = useState(null);

  // Support simulator state
  const [supportName, setSupportName] = useState(user?.name || "");
  const [supportEmail, setSupportEmail] = useState(user?.email || "");
  const [supportTopic, setSupportTopic] = useState("billing");
  const [supportMessage, setSupportMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [replyMessage, setReplyMessage] = useState("");
  const [ticketStatus, setTicketStatus] = useState("");

  const handleSupportSubmit = (e) => {
    e.preventDefault();
    if (!supportMessage.trim()) return;

    setSubmitting(true);
    setReplyMessage("");
    setTicketStatus("submitting");

    setTimeout(() => {
      setSubmitting(false);
      setTicketStatus("success");

      // Generate context-based replies for a premium dynamic feel
      const msg = supportMessage.toLowerCase();
      let responseText = "";
      
      if (currentLang === "fr") {
        if (msg.includes("factur") || msg.includes("abonnement") || msg.includes("stripe")) {
          responseText = "Bonjour ! Votre dossier de facturation a été localisé. En mode Sandbox, toutes les simulations de paiement réussissent automatiquement. Si vous avez modifié votre cycle d'abonnement en annuel, votre prochaine facture de renouvellement reflétera les 17% d'économie. Vos factures PDF sont téléchargeables directement dans l'onglet Facturation des Paramètres.";
        } else if (msg.includes("siege") || msg.includes("vip") || msg.includes("annul")) {
          responseText = "Bonjour ! Les modifications de sièges et les remboursements s'effectuent via le portail de Support du CRM (Backstage). Les organisateurs peuvent y réassigner des sièges sur une mini-grille ou annuler une commande pour libérer les places instantanément.";
        } else {
          responseText = "Bonjour ! Votre demande a été enregistrée dans notre file d'attente opérationnelle. Notre équipe d'assistance de Luxe Events l'analysera sous peu. En attendant, n'hésitez pas à consulter nos manuels d'utilisation dans les onglets Guides.";
        }
      } else if (currentLang === "es") {
        if (msg.includes("factura") || msg.includes("suscrip") || msg.includes("stripe")) {
          responseText = "¡Hola! Hemos localizado su cuenta de facturación. En modo Sandbox, las simulaciones de pago se aprueban de forma automática. Si actualizó a facturación anual, verá el descuento del 17% en su próxima fecha de corte. Puede descargar sus facturas en PDF desde los Ajustes.";
        } else if (msg.includes("asiento") || msg.includes("vip") || msg.includes("cancelar")) {
          responseText = "¡Hola! La reasignación de asientos y reembolsos se gestiona en la suite de Soporte dentro del CRM de Organizador. Ahí podrá cambiar de asiento a un cliente en la cuadrícula de soporte o liberar asientos cancelados.";
        } else {
          responseText = "¡Hola! Hemos recibido su reporte. El equipo de soporte de Luxe Events revisará los detalles a la brevedad. Mientras tanto, le sugerimos revisar los manuales operativos en las pestañas de Guías.";
        }
      } else {
        // English (default)
        if (msg.includes("billing") || msg.includes("subscription") || msg.includes("stripe") || msg.includes("invoice")) {
          responseText = "Hello! We have verified your active billing details. In mock sandbox session mode, all card charges and tier upgrades are approved instantly. If you toggled your subscription to Yearly, your upcoming renewal charge will reflect the 17% bundle discount. All invoices can be downloaded as PDFs in your Settings panel.";
        } else if (msg.includes("seat") || msg.includes("vip") || msg.includes("refund") || msg.includes("cancel")) {
          responseText = "Hello! Seating reassignment and booking cancellations are managed directly from the organizer's CRM Support Suite. Click on any guest card in the Guest Directory CRM, launch the Support panel, and you will be able to swap seats on the interactive grid or issue a full refund instantly.";
        } else {
          responseText = "Hello! Your ticket has been logged into our operational stream. Our Luxe support team will review your account settings shortly. In the meantime, check out the step-by-step operational workflows in the Guide tabs above.";
        }
      }
      setReplyMessage(responseText);
    }, 2000);
  };

  const filteredFaqs = FAQ_DATA[currentLang].filter(faq => 
    faq.q.toLowerCase().includes(searchQuery.toLowerCase()) || 
    faq.a.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ maxWidth: "1200px", margin: "40px auto", padding: "0 24px", color: "var(--text-primary)" }}>
      {/* Page Header */}
      <div style={{ marginBottom: "32px", display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "20px" }}>
        <div>
          <span style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "var(--accent-gold)", fontWeight: "700", letterSpacing: "2px" }}>
            Control Center
          </span>
          <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "2.4rem", fontWeight: "700", marginTop: "4px" }}>
            {t.title}
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", marginTop: "4px", fontWeight: "300" }}>
            {t.subtitle}
          </p>
        </div>

        {/* Database environment status badge */}
        <div style={{
          background: isRealFirebase ? "rgba(16, 185, 129, 0.08)" : "rgba(212, 175, 55, 0.08)",
          border: isRealFirebase ? "1px solid rgba(16, 185, 129, 0.25)" : "1px solid rgba(212, 175, 55, 0.25)",
          padding: "8px 16px",
          borderRadius: "30px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          fontSize: "0.8rem",
          fontWeight: "500",
          color: isRealFirebase ? "#10b981" : "var(--accent-gold)"
        }}>
          <ShieldCheck size={14} />
          <span>
            {isRealFirebase 
              ? (currentLang === "fr" ? "Mode Cloud Firebase Actif" : currentLang === "es" ? "Nube Firebase Activa" : "Firebase Cloud Active") 
              : (currentLang === "fr" ? "Mode Sandbox Local Actif" : currentLang === "es" ? "Modo Sandbox Local" : "Local Sandbox Active")
            }
          </span>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "32px", alignItems: "start" }}>
        {/* Main Content Area */}
        <div>
          {/* Tab Selector */}
          <div style={{
            display: "flex",
            borderBottom: "1px solid var(--border-accent)",
            marginBottom: "32px",
            gap: "24px"
          }}>
            <button
              onClick={() => setActiveTab("faq")}
              style={{
                background: "transparent",
                border: "none",
                borderBottom: activeTab === "faq" ? "2px solid var(--accent-gold)" : "2px solid transparent",
                color: activeTab === "faq" ? "var(--text-primary)" : "var(--text-secondary)",
                padding: "12px 4px",
                fontSize: "1rem",
                fontWeight: activeTab === "faq" ? "600" : "500",
                cursor: "pointer",
                transition: "all 0.2s"
              }}
              className="nav-link"
            >
              {t.tabs.faq}
            </button>
            <button
              onClick={() => setActiveTab("guides")}
              style={{
                background: "transparent",
                border: "none",
                borderBottom: activeTab === "guides" ? "2px solid var(--accent-gold)" : "2px solid transparent",
                color: activeTab === "guides" ? "var(--text-primary)" : "var(--text-secondary)",
                padding: "12px 4px",
                fontSize: "1rem",
                fontWeight: activeTab === "guides" ? "600" : "500",
                cursor: "pointer",
                transition: "all 0.2s"
              }}
              className="nav-link"
            >
              {t.tabs.attendee} & {t.tabs.organizer}
            </button>
            <button
              onClick={() => setActiveTab("support")}
              style={{
                background: "transparent",
                border: "none",
                borderBottom: activeTab === "support" ? "2px solid var(--accent-gold)" : "2px solid transparent",
                color: activeTab === "support" ? "var(--text-primary)" : "var(--text-secondary)",
                padding: "12px 4px",
                fontSize: "1rem",
                fontWeight: activeTab === "support" ? "600" : "500",
                cursor: "pointer",
                transition: "all 0.2s"
              }}
              className="nav-link"
            >
              {t.tabs.support}
            </button>
          </div>

          {/* TAB 1: FAQ */}
          {activeTab === "faq" && (
            <div>
              <div style={{ marginBottom: "24px", display: "flex", gap: "16px", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1.5rem", fontWeight: "600" }}>{t.faqSectionTitle}</h3>
                  <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>{t.faqSectionSubtitle}</p>
                </div>
                {/* Search Bar */}
                <div style={{ position: "relative", width: "100%", maxWidth: "320px" }}>
                  <Search size={16} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                  <input
                    type="text"
                    placeholder={t.searchPlaceholder}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="glass-input"
                    style={{ paddingLeft: "38px", width: "100%", fontSize: "0.85rem" }}
                  />
                </div>
              </div>

              {/* Accordion FAQ Grid */}
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {filteredFaqs.length > 0 ? (
                  filteredFaqs.map((faq, index) => (
                    <div 
                      key={index} 
                      className="glass-panel" 
                      style={{ 
                        background: "var(--glass-bg)", 
                        border: "1px solid var(--glass-border)",
                        borderRadius: "12px",
                        overflow: "hidden" 
                      }}
                    >
                      <button
                        onClick={() => setOpenFaq(openFaq === index ? null : index)}
                        style={{
                          width: "100%",
                          background: openFaq === index ? "rgba(255, 255, 255, 0.02)" : "transparent",
                          border: "none",
                          padding: "18px 24px",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          cursor: "pointer",
                          textAlign: "left",
                          color: "var(--text-primary)"
                        }}
                      >
                        <span style={{ fontSize: "0.95rem", fontWeight: "600", pr: "20px" }}>{faq.q}</span>
                        <ChevronDown 
                          size={18} 
                          style={{ 
                            transform: openFaq === index ? "rotate(180deg)" : "rotate(0deg)", 
                            transition: "transform 0.2s",
                            color: "var(--accent-gold)" 
                          }} 
                        />
                      </button>
                      
                      {openFaq === index && (
                        <div style={{
                          padding: "20px 24px",
                          background: "rgba(0, 0, 0, 0.15)",
                          borderTop: "1px solid var(--border-accent)",
                          fontSize: "0.88rem",
                          color: "var(--text-secondary)",
                          lineHeight: "1.6"
                        }}>
                          {faq.a}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
                    No matching guides found. Try searching another keyword.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: OPERATIONAL GUIDES */}
          {activeTab === "guides" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "40px" }}>
              {/* Attendee Manual */}
              <div>
                <h3 style={{ 
                  fontFamily: "var(--font-serif)", 
                  fontSize: "1.5rem", 
                  fontWeight: "600", 
                  marginBottom: "8px", 
                  display: "flex", 
                  alignItems: "center", 
                  gap: "10px" 
                }}>
                  <User size={22} style={{ color: "var(--accent-gold)" }} />
                  {currentLang === "fr" ? "Guide de l'Invité (Client)" : currentLang === "es" ? "Guía del Asistente (Cliente)" : "Attendee (Client) Operational Guide"}
                </h3>
                <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "20px" }}>
                  {currentLang === "fr" ? "Flux de réservation de billets et coordination des places." : currentLang === "es" ? "Flujos de reserva de boletos y coordinación de asientos." : "Seating booking flows and client reservation coordination."}
                </p>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                  <div className="glass-panel" style={{ padding: "24px", background: "var(--glass-bg-accent)", border: "1px solid var(--border-accent)" }}>
                    <h4 style={{ fontSize: "1rem", fontWeight: "600", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
                      <Ticket size={16} style={{ color: "var(--accent-gold)" }} />
                      {currentLang === "fr" ? "1. Sélection de Sièges & Réservations" : currentLang === "es" ? "1. Selección de Asientos y Pago" : "1. Seat Map Selection & Checkout"}
                    </h4>
                    <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                      Navigate to any event detail page. Use the interactive seating grid to select seats. Red cells represent booked seats, green cells represent vacant ones. The checkout block calculates subtotal, applied promo discounts, and taxes dynamically.
                    </p>
                  </div>

                  <div className="glass-panel" style={{ padding: "24px", background: "var(--glass-bg-accent)", border: "1px solid var(--border-accent)" }}>
                    <h4 style={{ fontSize: "1rem", fontWeight: "600", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
                      <ShieldCheck size={16} style={{ color: "var(--accent-gold)" }} />
                      {currentLang === "fr" ? "2. Verrous de Réservation (10 min)" : currentLang === "es" ? "2. Bloqueos de Asientos (10 min)" : "2. Seating Hold Expiries"}
                    </h4>
                    <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                      Selecting seats applies a temporary 10-minute hold in the database to prevent other clients from purchasing them. An on-screen countdown timer monitors the lock period. If the countdown expires before checking out, seats are released automatically.
                    </p>
                  </div>

                  <div className="glass-panel" style={{ padding: "24px", background: "var(--glass-bg-accent)", border: "1px solid var(--border-accent)" }}>
                    <h4 style={{ fontSize: "1rem", fontWeight: "600", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
                      <Sparkles size={16} style={{ color: "var(--accent-gold)" }} />
                      {currentLang === "fr" ? "3. Réservations Groupées Partagées" : currentLang === "es" ? "3. Reservas Grupales Divididas" : "3. Shared Group Split Bookings"}
                    </h4>
                    <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                      Enable "Split payment with friends" at checkout to hold adjacent seats. Distribute the generated invite link. Friends opening the URL will see held seats glowing purple, with the first vacant invite seat automatically selected.
                    </p>
                  </div>

                  <div className="glass-panel" style={{ padding: "24px", background: "var(--glass-bg-accent)", border: "1px solid var(--border-accent)" }}>
                    <h4 style={{ fontSize: "1rem", fontWeight: "600", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
                      <Mail size={16} style={{ color: "var(--accent-gold)" }} />
                      {currentLang === "fr" ? "4. Portefeuilles & Salons de Discussion" : currentLang === "es" ? "4. Billetera y Salas de Chat" : "4. Digital Tickets & Chat Lounges"}
                    </h4>
                    <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                      Purchased tickets are saved in the "My Tickets" tab, showcasing styled tickets, check-in barcodes, and dynamic event chats to coordinate logistics with other guests attending the event.
                    </p>
                  </div>
                </div>
              </div>

              {/* Organizer Manual */}
              <div style={{ borderTop: "1px solid var(--border-accent)", paddingTop: "40px" }}>
                <h3 style={{ 
                  fontFamily: "var(--font-serif)", 
                  fontSize: "1.5rem", 
                  fontWeight: "600", 
                  marginBottom: "8px", 
                  display: "flex", 
                  alignItems: "center", 
                  gap: "10px" 
                }}>
                  <Briefcase size={22} style={{ color: "var(--accent-gold)" }} />
                  {currentLang === "fr" ? "Guide de l'Organisateur (Producteur)" : currentLang === "es" ? "Guía del Organizador (Productor)" : "Event Organizer (Producer) Operational Guide"}
                </h3>
                <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "20px" }}>
                  {currentLang === "fr" ? "Gestion des plans de salle, promotion, scanning et CRM backstage." : currentLang === "es" ? "Gestión de mapas de asientos, promoción, escaneo y CRM." : "Backstage seating design, ticket scanning, CRM support, and marketing."}
                </p>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                  <div className="glass-panel" style={{ padding: "24px", background: "var(--glass-bg-accent)", border: "1px solid var(--border-accent)" }}>
                    <h4 style={{ fontSize: "1rem", fontWeight: "600", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
                      <Settings size={16} style={{ color: "var(--accent-gold)" }} />
                      {currentLang === "fr" ? "1. Conception de Salle Interactive" : currentLang === "es" ? "1. Diseñador de Mapas de Asientos" : "1. Seating Grid Layout Canvas"}
                    </h4>
                    <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                      Use the canvas editor tool to create custom grid presets. Click cells to mark them as VIP booths, Standard tables, or Corridors (walkways). Name your layouts and apply them during new event creation.
                    </p>
                  </div>

                  <div className="glass-panel" style={{ padding: "24px", background: "var(--glass-bg-accent)", border: "1px solid var(--border-accent)" }}>
                    <h4 style={{ fontSize: "1rem", fontWeight: "600", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
                      <KeyRound size={16} style={{ color: "var(--accent-gold)" }} />
                      {currentLang === "fr" ? "2. Contrôle des Entrées (Scanner)" : currentLang === "es" ? "2. Verificador de Accesos (Escáner)" : "2. Entrance Gate QR Scanner"}
                    </h4>
                    <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                      Open the Scanner tool to check-in arrivals. Grants camera permission to verify digital QR codes or inputs reference codes manually. Monitors progress metrics through circular velocity speedometers.
                    </p>
                  </div>

                  <div className="glass-panel" style={{ padding: "24px", background: "var(--glass-bg-accent)", border: "1px solid var(--border-accent)" }}>
                    <h4 style={{ fontSize: "1rem", fontWeight: "600", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
                      <User size={16} style={{ color: "var(--accent-gold)" }} />
                      {currentLang === "fr" ? "3. CRM Client & Portail Support" : currentLang === "es" ? "3. CRM y Panel de Soporte" : "3. Customer CRM & Support Suite"}
                    </h4>
                    <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                      Manage VIP tags and notes on guest profiles. Utilize the Support Suite inside the CRM page to reassign seating on a support grid or issue refunds (which frees held seats immediately).
                    </p>
                  </div>

                  <div className="glass-panel" style={{ padding: "24px", background: "var(--glass-bg-accent)", border: "1px solid var(--border-accent)" }}>
                    <h4 style={{ fontSize: "1rem", fontWeight: "600", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
                      <FileText size={16} style={{ color: "var(--accent-gold)" }} />
                      {currentLang === "fr" ? "4. Codes Promos & Planificateur Kanban" : currentLang === "es" ? "4. Cupones y Tablero Kanban" : "4. Promo Campaigns & Kanban Planner"}
                    </h4>
                    <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                      Generate discount codes (fixed/percent) and track attributed revenue metrics. Stay on top of show preparations using the Kanban board categorized by Food, Talent, Production, and Marketing.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: INTERACTIVE HELPDESK */}
          {activeTab === "support" && (
            <div>
              <div style={{ marginBottom: "24px" }}>
                <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1.5rem", fontWeight: "600" }}>{t.supportTitle}</h3>
                <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>{t.supportSubtitle}</p>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "28px" }}>
                {/* Form column */}
                <form onSubmit={handleSupportSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontWeight: "500" }}>{t.supportNameLabel}</label>
                      <input 
                        type="text" 
                        required 
                        value={supportName} 
                        onChange={(e) => setSupportName(e.target.value)} 
                        className="glass-input" 
                        style={{ fontSize: "0.85rem" }} 
                      />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontWeight: "500" }}>{t.supportEmailLabel}</label>
                      <input 
                        type="email" 
                        required 
                        value={supportEmail} 
                        onChange={(e) => setSupportEmail(e.target.value)} 
                        className="glass-input" 
                        style={{ fontSize: "0.85rem" }} 
                      />
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontWeight: "500" }}>{t.supportTopicLabel}</label>
                    <select
                      value={supportTopic}
                      onChange={(e) => setSupportTopic(e.target.value)}
                      className="glass-input"
                      style={{ cursor: "pointer", fontSize: "0.85rem" }}
                    >
                      <option value="billing" style={{ background: "#0f0f12" }}>
                        {currentLang === "fr" ? "Facturation et abonnements" : currentLang === "es" ? "Facturación y Suscripciones" : "Billing & Subscriptions"}
                      </option>
                      <option value="seating" style={{ background: "#0f0f12" }}>
                        {currentLang === "fr" ? "Réservations de sièges" : currentLang === "es" ? "Reservas y Asientos" : "Seating Reservings & Holds"}
                      </option>
                      <option value="scanner" style={{ background: "#0f0f12" }}>
                        {currentLang === "fr" ? "Vérification des billets de porte" : currentLang === "es" ? "Escáner y Validación" : "QR Scanning & Gate Access"}
                      </option>
                      <option value="other" style={{ background: "#0f0f12" }}>
                        {currentLang === "fr" ? "Autre demande" : currentLang === "es" ? "Otra consulta" : "Other General Query"}
                      </option>
                    </select>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontWeight: "500" }}>{t.supportMessageLabel}</label>
                    <textarea 
                      required 
                      rows={5} 
                      value={supportMessage} 
                      onChange={(e) => setSupportMessage(e.target.value)} 
                      className="glass-input" 
                      placeholder={currentLang === "fr" ? "Entrez votre question en détail..." : currentLang === "es" ? "Escriba su consulta en detalle..." : "Ask about Stripe, subscription, seat reassignment, refunds, etc."}
                      style={{ fontSize: "0.85rem", resize: "none", fontFamily: "inherit" }} 
                    />
                  </div>

                  <button 
                    type="submit" 
                    disabled={submitting} 
                    className="btn-primary" 
                    style={{ padding: "12px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", fontSize: "0.9rem" }}
                  >
                    <Send size={16} />
                    <span>{submitting ? t.supportTyping : t.supportSubmit}</span>
                  </button>
                </form>

                {/* Response column */}
                <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
                  <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontWeight: "500", marginBottom: "6px" }}>
                    {currentLang === "fr" ? "Sortie de console d'assistance" : currentLang === "es" ? "Respuesta de Soporte" : "Helpdesk Console Logs"}
                  </span>
                  
                  <div className="glass-panel" style={{
                    flexGrow: 1,
                    minHeight: "310px",
                    background: "rgba(0,0,0,0.25)",
                    border: "1px solid var(--border-accent)",
                    borderRadius: "12px",
                    padding: "24px",
                    fontFamily: "monospace",
                    fontSize: "0.8rem",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "flex-start",
                    gap: "14px",
                    overflowY: "auto"
                  }}>
                    {ticketStatus === "" && (
                      <div style={{ color: "var(--text-muted)", textAlign: "center", marginTop: "100px" }}>
                        &gt;_ System Idle. Submit a ticket to initiate simulated AI diagnostics.
                      </div>
                    )}
                    
                    {ticketStatus === "submitting" && (
                      <div style={{ color: "var(--accent-gold)", animation: "pulse 1.5s infinite" }} className="shimmer-bg">
                        &gt; [TRANSMITTING TICKET DATA]<br/>
                        &gt; Topic Attributed: {supportTopic.toUpperCase()}<br/>
                        &gt; Syncing session profile details...<br/>
                        &gt; {t.supportTyping}
                      </div>
                    )}

                    {ticketStatus === "success" && (
                      <>
                        <div style={{ color: "#10b981" }}>
                          &gt; SUCCESS: Ticket ID #LUXE-{Math.floor(Math.random()*90000+10000)}<br/>
                          &gt; Status: 200 OK<br/>
                          &gt; Database mode parsed: {isRealFirebase ? "CLOUDFIREBASE" : "MOCK_LOCALSTORAGE"}<br/>
                          &gt; AI Diagnostics Finished.
                        </div>
                        
                        {replyMessage && (
                          <div style={{ 
                            background: "rgba(255,255,255,0.03)", 
                            borderLeft: "3px solid var(--accent-gold)",
                            padding: "16px",
                            borderRadius: "4px",
                            marginTop: "10px",
                            color: "var(--text-primary)",
                            fontFamily: "var(--font-sans)",
                            fontSize: "0.85rem",
                            lineHeight: "1.5"
                          }}>
                            <strong style={{ display: "block", color: "var(--accent-gold)", fontSize: "0.8rem", fontFamily: "monospace", marginBottom: "6px" }}>
                              SUPPORT AGENT RESPONSE:
                            </strong>
                            {replyMessage}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Deck */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Quick links panel */}
          <div className="glass-panel-gold" style={{ padding: "28px", border: "1px solid var(--glass-border-gold)", borderRadius: "20px" }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: "700", marginBottom: "4px" }}>{t.quickLinks}</h3>
            <p style={{ color: "var(--text-muted)", fontSize: "0.78rem", marginBottom: "20px" }}>
              {t.quickLinksDesc}
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <a 
                href="/" 
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 16px",
                  background: "var(--glass-bg-accent)",
                  border: "1px solid var(--border-accent)",
                  borderRadius: "10px",
                  fontSize: "0.85rem",
                  fontWeight: "600",
                  color: "var(--text-primary)"
                }}
                className="hover-row"
              >
                <span>{t.goToDiscover}</span>
                <ArrowRight size={14} style={{ color: "var(--accent-gold)" }} />
              </a>

              {(!user || user.role === "organizer") && (
                <a 
                  href="/dashboard/organizer" 
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "12px 16px",
                    background: "var(--glass-bg-accent)",
                    border: "1px solid var(--border-accent)",
                    borderRadius: "10px",
                    fontSize: "0.85rem",
                    fontWeight: "600",
                    color: "var(--text-primary)"
                  }}
                  className="hover-row"
                >
                  <span>{t.goToOrganizer}</span>
                  <ArrowRight size={14} style={{ color: "var(--accent-gold)" }} />
                </a>
              )}

              {(!user || user.role === "client") && (
                <a 
                  href="/dashboard/attendee" 
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "12px 16px",
                    background: "var(--glass-bg-accent)",
                    border: "1px solid var(--border-accent)",
                    borderRadius: "10px",
                    fontSize: "0.85rem",
                    fontWeight: "600",
                    color: "var(--text-primary)"
                  }}
                  className="hover-row"
                >
                  <span>{t.goToTickets}</span>
                  <ArrowRight size={14} style={{ color: "var(--accent-gold)" }} />
                </a>
              )}

              <a 
                href="/dashboard/settings" 
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 16px",
                  background: "var(--glass-bg-accent)",
                  border: "1px solid var(--border-accent)",
                  borderRadius: "10px",
                  fontSize: "0.85rem",
                  fontWeight: "600",
                  color: "var(--text-primary)"
                }}
                className="hover-row"
              >
                <span>{t.goToSettings}</span>
                <ArrowRight size={14} style={{ color: "var(--accent-gold)" }} />
              </a>
            </div>
          </div>

          {/* Quick info alert panel */}
          <div className="glass-panel" style={{ padding: "24px", border: "1px solid var(--glass-border)", borderRadius: "20px" }}>
            <h4 style={{ fontSize: "0.95rem", fontWeight: "600", marginBottom: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
              <BadgeInfo size={16} style={{ color: "var(--accent-gold)" }} />
              System Version Info
            </h4>
            <div style={{ fontSize: "0.78rem", display: "flex", flexDirection: "column", gap: "8px", color: "var(--text-secondary)" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Build Platform:</span>
                <span style={{ color: "#fff", fontFamily: "monospace" }}>Next.js 16.2.7</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Rendering Engine:</span>
                <span style={{ color: "#fff", fontFamily: "monospace" }}>Turbopack</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>UI Components:</span>
                <span style={{ color: "#fff", fontFamily: "monospace" }}>Lucide & Custom CSS</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Current Release:</span>
                <span style={{ color: "var(--accent-gold)", fontWeight: "600", fontFamily: "monospace" }}>v1.7.0-prod</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .hover-row {
          transition: border-color 0.2s, background-color 0.2s;
        }
        .hover-row:hover {
          border-color: var(--accent-gold) !important;
          background-color: var(--glass-bg-hover) !important;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
