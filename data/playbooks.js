/*
  LE OSINT Framework — case playbooks
  Each step: t = what to do, why = what it gives you, src = source names exactly as in data/links.js,
  tool = Toolbox section id, profile = true if the step belongs in the suspect profile.
*/
window.LE_OSINT_PLAYBOOKS = [
  {
    id: "container",
    name: "Drugs concealed in a container",
    when: "A seizure, a risk hit or intelligence on a specific container, consignment or trader.",
    phases: [
      { name: "Verify the shipment", steps: [
        { t: "Check the container number is genuine (ISO 6346 check digit) and identify the owner / lessor prefix.", why: "Fabricated or mistyped numbers are an early red flag.", tool: "toolbox-container", src: ["BIC Code Register (owner prefixes)"] },
        { t: "Track the container on the carrier's site: route, transhipment ports, dwell times, empty-return date.", why: "Unusual transhipment or long dwell in a source-country port raises risk.", src: ["Maersk", "MSC", "CMA CGM", "Hapag-Lloyd", "ONE", "Track-Trace", "SeaRates Tracking"] },
        { t: "Identify the vessel(s) and check AIS history for gaps, loitering or unscheduled stops.", why: "At-sea drop-offs and pick-ups often happen during AIS gaps; rip-on / rip-off happens in port.", src: ["VesselFinder", "MarineTraffic", "Global Fishing Watch (AIS gaps)"] },
        { t: "Check the vessel's owner, manager, flag history and port-state inspections.", why: "Frequent flag or name changes and poor inspection records.", src: ["Equasis (owner, manager, inspections)", "Paris MoU Inspection Search", "OpenSanctions"] }
      ]},
      { name: "Examine the traders", steps: [
        { t: "Verify importer and exporter: registration date, directors, address, VAT and EORI.", why: "New companies, mass-registration addresses and missing VAT / EORI numbers are classic cover-load indicators.", src: ["OpenCorporates", "VIES VAT Number Check", "EORI Number Validation", "AEO Authorisation Search", "North Data (DE, AT, CH, NL, BE...)"], profile: true },
        { t: "Look at the registered address on satellite and Street View: is it a real warehouse?", why: "Residential flats and virtual offices as importers of bulk goods.", src: ["Google Maps", "Instant Street View"] },
        { t: "Compare the declared goods and HS code with the trader's history and normal trade flows.", why: "A fruit importer suddenly shipping ceramics; a route that makes no economic sense.", src: ["EU TARIC", "UN Comtrade", "ImportYeti (US bills of lading)", "OEC (Observatory of Economic Complexity)"] },
        { t: "Search directors and companies for sanctions, leaks and adverse media.", why: "", src: ["OpenSanctions", "ICIJ Offshore Leaks", "OCCRP Aleph", "Google News"] }
      ]},
      { name: "Context and follow-up", steps: [
        { t: "Compare with recent seizures on the same route or with the same concealment method.", why: "Patterns in ports, cover loads and timing.", src: ["Seizure Watch (open-source seizure monitor)", "UNODC Drugs Monitoring Platform", "InSight Crime"] },
        { t: "Share the risk indicators through your customs and police channels.", why: "", src: ["WCO CEN suite (CEN, nCEN, CENcomm)", "MAOC-N", "UNODC-WCO Container Control Programme"] },
        { t: "Log every check with timestamp and source in the case log.", why: "Evidential continuity.", tool: "toolbox-caselog" }
      ]}
    ]
  },
  {
    id: "footprint",
    name: "Suspect's online footprint",
    when: "You have a name, a phone number, an email or a handle and need to know who the person is online.",
    phases: [
      { name: "Prepare", steps: [
        { t: "Use an approved research environment and a non-attributable account. Check your IP and browser for leaks.", why: "Some platforms show the subject who looked at them.", src: ["BrowserLeaks", "Firefox Multi-Account Containers"] },
        { t: "Open a suspect profile and enter everything you already know.", why: "The profile turns each identifier into targeted searches and tracks your gaps.", profileView: true }
      ]},
      { name: "Expand identifiers", steps: [
        { t: "Phone: caller-ID name, WhatsApp / Telegram profile photo, adverts using the number.", why: "The profile photo is often the best lead.", src: ["Google (exact number)", "WhatsApp", "Truecaller", "Have I Been Zuckered", "Telegram phone number checker (Bellingcat)"], tool: "toolbox-phone" },
        { t: "Email: registered services and breach data.", why: "Breaches give old phone numbers, usernames and addresses.", src: ["Epieos", "Predicta Search", "Have I Been Pwned", "Hudson Rock infostealer lookup", "Intelligence X"] },
        { t: "Username: same handle on hundreds of sites; then try variations.", why: "People reuse handles across platforms.", src: ["WhatsMyName", "Sherlock"], tool: "toolbox-perm" },
        { t: "Photos: reverse image search every profile picture.", why: "Finds other accounts, dating profiles and the original source.", src: ["Yandex Images", "Google Lens", "Bing Visual Search", "TinEye"] }
      ]},
      { name: "Analyse the accounts", steps: [
        { t: "Map friends, followers, tagged people and frequent commenters.", why: "Associates' accounts are often less private and show the subject.", src: ["Facebook Search", "Instagram", "TikTok", "Google LinkedIn dork (no alert)"], profile: true },
        { t: "Geolocate photos and note posting times.", why: "Routine, home area, gym, favourite places.", src: ["Google Maps", "Bellingcat OSM Search", "SunCalc (sun position & shadows)"], tool: "toolbox-exif" },
        { t: "Check deleted content and older versions.", why: "", src: ["Wayback Machine", "archive.today", "Reveddit (removed content)"] },
        { t: "Capture evidence: full-page captures, video of scrolling, hash every file.", why: "", src: ["SingleFile", "Bellingcat Auto Archiver", "ArchiveWeb.page (Webrecorder)", "OBS Studio"], tool: "toolbox-caselog" }
      ]}
    ]
  },
  {
    id: "fraud",
    name: "Online fraud / fake webshop / phishing",
    when: "A victim report about a fake shop, investment platform, phishing site or romance scam.",
    phases: [
      { name: "The website", steps: [
        { t: "Check the domain's age, registrar and hosting; look for look-alike domains.", why: "Most fraud domains are only days or weeks old.", src: ["ICANN Lookup", "DomainTools WHOIS", "ScamAdviser", "dnstwist (look-alike domains)"] },
        { t: "Find other sites run by the same people through shared IP, certificates and analytics IDs.", why: "One fraud network usually runs dozens of sites.", src: ["ViewDNS Reverse IP", "crt.sh (certificates)", "SpyOnWeb (shared analytics IDs)", "urlscan.io", "BuiltWith"] },
        { t: "Check blocklists and reports, and capture the site before it disappears.", why: "", src: ["Google Safe Browsing Status", "URLhaus", "PhishTank", "Wayback Save Page Now"] },
        { t: "Find the adverts that lured the victims and who paid for them.", why: "Ad libraries show every active ad of a page, often with many more fake shops.", src: ["Meta Ad Library", "Google Ads Transparency Center", "TikTok Commercial Content Library"] },
        { t: "Check regulator warning lists for investment scams.", why: "", src: ["IOSCO I-SCAN", "FSMA Belgium Warnings", "UK FCA Warning List"] }
      ]},
      { name: "Follow the money", steps: [
        { t: "Validate the IBAN and identify the bank; freeze requests go to that bank's country.", why: "Money mules often use neobanks in another EU country.", tool: "toolbox-container", src: ["IBAN Checker", "SWIFT BIC Search"] },
        { t: "If paid in crypto: identify the chain, trace to an exchange, check scam reports.", why: "Exchanges can identify the customer with legal process.", tool: "toolbox-crypto", src: ["Chainabuse", "Blockchair (multi-chain)", "Arkham Intelligence"] },
        { t: "Payment handles (Venmo) often show a name and photo.", why: "", src: ["Venmo"] }
      ]},
      { name: "People and requests", steps: [
        { t: "Profile any phone, email or name used by the fraudsters.", why: "", profileView: true },
        { t: "Send preservation and data requests to hosting provider, registrar and platforms.", why: "Logs are deleted quickly. Within the EU, European Production and Preservation Orders can go directly to providers in another EU state from 18 August 2026.", src: ["Europol SIRIUS (cross-border e-evidence)", "EU e-Evidence Regulation 2023/1543", "Cloudflare", "SEARCH.org ISP List"] },
        { t: "Report to the national and European centres.", why: "Links your case to other victims.", src: ["Europol EC3", "Safeonweb (Belgium)", "FBI IC3 (US)"] }
      ]}
    ]
  },
  {
    id: "crypto",
    name: "Crypto payments and money laundering",
    when: "A wallet address appears in a seizure, a phone extraction, an advert or a ransom note.",
    phases: [
      { name: "Identify", steps: [
        { t: "Identify the blockchain from the address format.", why: "TRON (T…) and Bitcoin addresses are distinctive, but a 0x address can exist on Ethereum, BNB Chain, Polygon and other EVM chains: check several explorers. USDT on TRON is the most common in drug and fraud cases.", tool: "toolbox-crypto" },
        { t: "Open the address on the right explorer: balance, first and last activity, counterparties.", why: "", src: ["Tronscan", "Etherscan", "Mempool.space", "OKLink (multi-chain explorer)", "Blockchair (multi-chain)"] },
        { t: "For USDT: check whether the address is already frozen by Tether.", why: "A frozen address tells you another agency is already on it.", src: ["USDT freeze checker (BlockSec)"] },
        { t: "Check labels, scam reports and sanctions.", why: "", src: ["Arkham Intelligence", "Chainabuse", "OpenSanctions", "WalletExplorer (clusters)"] }
      ]},
      { name: "Trace", steps: [
        { t: "Follow funds to exchange deposit addresses; note times and amounts matching the offence.", why: "The exchange is where the identity is.", src: ["MetaSleuth (fund-flow graphs)", "Breadcrumbs", "WalletExplorer (clusters)", "Arkham Intelligence", "MistTrack"] },
        { t: "Search the address on the open web: forums, adverts, Telegram channels.", why: "", src: ["Google", "Telegago (Google CSE)"] },
        { t: "Check crypto ATMs near the suspect's home or work.", why: "Cash-in points for couriers and mules.", src: ["Coin ATM Radar"] }
      ]},
      { name: "Act", steps: [
        { t: "Send a freeze / data request to the exchange or stablecoin issuer.", why: "Tether can freeze USDT at the address level.", src: ["Binance", "Coinbase", "Tether (USDT) law enforcement requests"] },
        { t: "Involve your FIU and asset recovery office.", why: "", src: ["Egmont Group (FIUs)", "CARIN (asset recovery)"] }
      ]}
    ]
  },
  {
    id: "missing",
    name: "Missing or wanted person",
    when: "Locating a missing person or a fugitive.",
    phases: [
      { name: "Check notices", steps: [
        { t: "Check international and national notices.", why: "", src: ["Interpol Red Notices", "Interpol Yellow Notices (missing)", "EU Most Wanted", "Belgian Federal Police Wanted Notices"] }
      ]},
      { name: "Recent activity", steps: [
        { t: "Profile the person and close contacts: last posts, new accounts, changed profile photos.", why: "Contacts' accounts often show where the person is.", profileView: true },
        { t: "Geolocate the most recent photos and videos; compare with public posts in that area.", why: "", src: ["YouTube Geofind (videos by location)", "Google Maps", "SunCalc (sun position & shadows)"], tool: "toolbox-exif" },
        { t: "Look at travel options from the last known location.", why: "Bus, ferry and flight routes and times.", src: ["Rome2Rio (all routes between two places)", "FlixBus routes", "Direct Ferries (routes)", "Flightradar24 (flight)"] },
        { t: "Check accommodation seen in photos.", why: "Room details can identify the hotel.", src: ["TraffickCam (hotel-room image matching)", "Booking.com", "Airbnb"] }
      ]},
      { name: "Requests", steps: [
        { t: "Emergency disclosure requests to platforms where life is at risk.", why: "", src: ["Meta (Facebook, Instagram, WhatsApp)", "Google LERS", "Snap", "TikTok"] }
      ]}
    ]
  },
  {
    id: "firearms",
    name: "Firearms trafficking",
    when: "Online sale of weapons or parts, a seized firearm, or 3D-printed guns.",
    phases: [
      { name: "The weapon", steps: [
        { t: "Identify make, model and markings; check tracing options.", why: "", src: ["Armament Research Services", "Conflict Armament Research iTrace", "Interpol iARMS"] },
        { t: "Reverse-search photos of the weapon to find other adverts by the same seller.", why: "Sellers reuse photos.", src: ["Yandex Images", "Google Lens"] }
      ]},
      { name: "The seller", steps: [
        { t: "Search marketplaces and messaging channels for the seller's handle, phone and wording.", why: "", src: ["Telegago (Google CSE)", "TGStat", "Ahmia"] },
        { t: "Profile the seller.", why: "", profileView: true },
        { t: "Check parcel and postal routes used for parts (3D-printing parts, slides, barrels).", why: "", src: ["Google"] }
      ]}
    ]
  },
  {
    id: "trafficking",
    name: "Human trafficking and exploitation",
    when: "Indicators of sexual or labour exploitation, or suspicious online adverts.",
    phases: [
      { name: "Adverts and places", steps: [
        { t: "Search phone numbers and text used in adverts; group adverts that share numbers, photos or wording.", why: "One controller often runs many adverts.", src: ["Google (exact number)", "Yandex Images"], tool: "toolbox-phone" },
        { t: "Identify hotels or flats from photos.", why: "", src: ["TraffickCam (hotel-room image matching)", "Booking.com", "Airbnb"] },
        { t: "Check the businesses and people behind places of work (car washes, nail bars, farms).", why: "", src: ["OpenCorporates", "Google Maps"] }
      ]},
      { name: "Report and protect", steps: [
        { t: "Report child sexual abuse material only through official channels. Never download it outside approved systems.", why: "", src: ["NCMEC CyberTipline", "INHOPE Hotlines", "Europol Stop Child Abuse – Trace an Object", "Interpol ICSE Database"] },
        { t: "Check identity documents found or photographed against genuine models.", why: "Victims are often moved with false or borrowed documents.", src: ["PRADO (EU register of authentic documents)", "Interpol SLTD (stolen & lost travel documents)"] },
        { t: "Use trafficking indicator guidance and data.", why: "", src: ["Polaris Project (trafficking)", "CTDC (trafficking data)"] }
      ]}
    ]
  },
  {
    id: "vessel",
    name: "Vessel of interest",
    when: "A vessel is suspected of carrying drugs, arms, migrants or sanctioned goods.",
    phases: [
      { name: "Identify", steps: [
        { t: "Validate the IMO number and decode the MMSI flag.", why: "Mismatched MMSI and flag suggest spoofing.", tool: "toolbox-container", src: ["ITU MARS (MMSI / call sign)"] },
        { t: "Ownership, management, name and flag history.", why: "", src: ["Equasis (owner, manager, inspections)", "IMO GISIS", "BalticShipping Vessel Database", "OpenSanctions"] },
        { t: "Photos of the vessel to confirm identity and spot modifications.", why: "", src: ["ShipSpotting (photos)"] }
      ]},
      { name: "Behaviour", steps: [
        { t: "Track history: AIS gaps, meetings with other vessels, loitering off known drop zones.", why: "", src: ["Global Fishing Watch (AIS gaps)", "MarineTraffic", "VesselFinder"] },
        { t: "Check satellite imagery for the dates of AIS gaps.", why: "", src: ["Copernicus Browser (Sentinel)", "Copernicus Browser (Sentinel)"] },
        { t: "Port-state inspection and detention history.", why: "", src: ["Paris MoU Inspection Search", "Tokyo MoU APCIS"] }
      ]},
      { name: "Coordinate", steps: [
        { t: "Share with maritime coordination centres.", why: "", src: ["MAOC-N", "WCO CEN suite (CEN, nCEN, CENcomm)"] }
      ]}
    ]
  }
];
