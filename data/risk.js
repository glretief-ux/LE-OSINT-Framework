/* Manifest and booking risk checklist (sea containers, air cargo / express).
 * Compiled 2026-10-06 from published, publicly available sources (see LE_RISK.sources).
 * Rows: [id, group, text, why, "strong"|"supporting", sourceKey]
 * "strong" is used only where the source itself treats the sign as a direct trigger
 * (e.g. hold/refuse custody, an alert category in an operation, or a core modus operandi
 * step). Everything else is "supporting". No numeric weights: sources give none.
 * Ports are not named on purpose; use national and EUDA/UNODC profiles for origins.
 * Not covered for lack of a public source: shipper-owned (SOC) containers, Incoterms,
 * consignee pick-up at the airport. The WCO RMC Volume 2 indicator lists are
 * restricted to WCO Members and were not used.
 */
window.LE_RISK = {
  updated: "2026-10",
  sources: {
    EUROPOL_PORTS: ["Europol & Security Steering Committee (Antwerp, Hamburg/Bremerhaven, Rotterdam): Criminal networks in EU ports - risks and challenges for law enforcement (2023)", "https://www.europol.europa.eu/cms/sites/default/files/documents/Europol_Joint-report_Criminal%20networks%20in%20EU%20ports_Public_version.pdf"],
    EUROPOL_DIV: ["Europol Spotlight: Diversification in maritime cocaine trafficking modi operandi (2026)", "https://www.europol.europa.eu/cms/sites/default/files/documents/Diversification_in_maritime_cocaine_trafficking_modi_operandi.pdf"],
    EUDA_COC: ["EMCDDA/EUDA & Europol: EU Drug Market - Cocaine, in-depth analysis (2022)", "https://www.euda.europa.eu/system/files/media/embed/documents/23235/EU-Drug-Market-Cocaine-2022-FINAL.pdf"],
    EUDA_GLOBAL: ["EUDA & Europol: EU Drug Market - Cocaine, chapter 'Europe and the global cocaine trade' (2022)", "https://www.euda.europa.eu/publications/eu-drug-markets/cocaine/europe-and-global-cocaine-trade_en"],
    EUDA_POD: ["EMCDDA/EUDA Perspectives on drugs: Cocaine trafficking to Europe (2016)", "https://www.euda.europa.eu/cocaine-trafficking-europe_en"],
    WCO_TINCAN: ["WCO News: Combating the infiltration of criminals in the maritime supply chain - an overview of Operation TIN CAN (WCO-UNODC, 2023)", "https://mag.wcoomd.org/?p=13631"],
    WCO_INFIL: ["WCO: Infiltration of maritime cargo supply chains - organized crime, cocaine and the internal conspirator (2025), press release", "https://www.wcoomd.org/en/media/newsroom/2025/july/unprecedented-scale-of-criminal-infiltration-of-global-cargo-supply-chains-sustaining-the-surge.aspx"],
    WCO_RMC: ["WCO Customs Risk Management Compendium (Volume 1 public; Volume 2 indicators restricted to Members)", "https://www.wcoomd.org/en/topics/facilitation/instrument-and-tools/tools/risk-management-compendium.aspx"],
    ASEAN_RM: ["ASEAN Customs Knowledge Base: Risk Management Module 4, Unit 4 - Risk Indicators (general high-risk indicator categories as in WCO RMC Vol. 1)", "https://kbscustoms.asean.org/wp-content/uploads/2020/03/RM-Module-4-Unit-4-Risk-Indicators.pdf"],
    WCO_SAFE: ["WCO SAFE Framework of Standards (SAFE Package; 2018/2021 editions), seal integrity provisions", "https://www.wcoomd.org/en/topics/facilitation/instrument-and-tools/frameworks-of-standards/safe_package.aspx"],
    CTPAT: ["US CBP CTPAT Security Criteria and CTPAT Job Aid: Seal Security Procedures (Oct 2021)", "https://cbp.gov/border-security/ports-entry/cargo-security/ctpat-customs-trade-partnership-against-terrorism/apply/security-criteria"],
    FATF_TBML: ["FATF & Egmont Group: Trade-Based Money Laundering - Risk Indicators (2021)", "https://www.fatf-gafi.org/content/dam/fatf-gafi/reports/Trade-Based-Money-Laundering-Risk-Indicators.pdf"],
    RED_FLAGS: ["Red Flags for Suspicious Illegal Wildlife Trade - shipping industry leaflet (2023), via World Shipping Council", "https://www.worldshipping.org/s/Red-flags-Leaflet_Publication-Version-674f.pdf"],
    UNODC_RI: ["UNODC Global Programme on Wildlife and Forest Crime: Identifying risk indicators for illicit timber shipments (2018)", "https://un-redd.org/sites/default/files/2021-09/PPT%205%20-%20Identifying%20risk%20indicators%28UNODC%29.pdf"],
    CBSA: ["Canada Border Services Agency: Identifying border threats - how customs brokers can help (Partners in Protection podcast)", "https://cbsa-asfc.gc.ca/security-securite/pod-itb-imf-eng.html"],
    EU_COURIER: ["Council of the EU, Customs Cooperation Working Party: Guide for the application of risk analysis by customs services to express courier services, doc. 10933/97 (1997)", "https://statewatch.org/wp-content/uploads/2026/04/1997-sg2-wp5-024.pdf"],
    UPU_TRACIT: ["UPU & TRACIT: Guide to detecting illicit pharmaceuticals in small packets (Illicit Goods Mitigation Campaign Toolkit, 2025)", "https://www.upu.int/getmedia/90129b27-809f-4923-af66-12497df3758f/202503illicitGoodsMitigationCampaignToolkitPharmaceuticals_EN.pdf"],
    HK_CED: ["Hong Kong Customs press release: five dangerous drugs cases at airport (27 Oct 2022)", "https://www.info.gov.hk/gia/general/202210/27/P2022102700547.htm"]
  },

  sea: [
    /* 1. Parties */
    ["S1", "Parties", "Importer, exporter or consignee is newly incorporated.", "New companies have no compliance history and can be set up for a single load.", "supporting", "ASEAN_RM"],
    ["S2", "Parties", "Shipper or consignee never seen before; first-time importer or exporter.", "With no track record, there is nothing to check the shipment against.", "supporting", "ASEAN_RM"],
    ["S3", "Parties", "Shipper is a freight forwarder, NVOCC or bank, not the producer.", "An intermediary as shipper hides who really packed and stuffed the goods.", "supporting", "ASEAN_RM"],
    ["S4", "Parties", "Address is residential, a PO box or a mass-registration address.", "Such addresses often belong to shell or front companies with no real premises.", "supporting", "FATF_TBML"],
    ["S5", "Parties", "Goods do not fit the importer's stated line of business.", "A trade that makes no sense for the company suggests a cover or misused identity.", "supporting", "FATF_TBML"],
    ["S6", "Parties", "Well-known company named as consignee but unaware of the shipment.", "Criminals hijack the identity of trusted firms so the load looks low risk.", "supporting", "ASEAN_RM"],
    ["S7", "Parties", "Party has previous enforcement or adverse compliance history.", "Past offences raise the chance that the same network is at work again.", "supporting", "ASEAN_RM"],
    ["S8", "Parties", "First-time shipper reluctant to explain its business or the end use.", "Evasive answers on basic commercial facts are a known red flag in shipping.", "supporting", "RED_FLAGS"],

    /* 2. Cargo and description */
    ["S9", "Cargo", "Cargo description is vague, generic or misleading.", "Vague wording makes document checks and scanner comparison harder.", "supporting", "RED_FLAGS"],
    ["S10", "Cargo", "Declared weight does not fit the goods, piece count or container.", "Extra weight can mean an added load; weight gaps between documents need answers.", "supporting", "ASEAN_RM"],
    ["S11", "Cargo", "Freight cost is high compared with the low declared value.", "Paying more to ship goods than they are worth makes no commercial sense.", "supporting", "UNODC_RI"],
    ["S12", "Cargo", "Commodity unusual for the declared country of origin.", "Goods that the origin does not produce suggest false origin or cover cargo.", "supporting", "ASEAN_RM"],
    ["S13", "Cargo", "Perishable cover load, such as fruit, that ports clear quickly.", "Traffickers favour perishables because they get fast processing and fewer delays.", "supporting", "EUDA_POD"],
    ["S14", "Cargo", "Commodity type seen as cover in seizures: marble, coal, textiles, fruit boxes.", "Europol reports drugs hidden between fruit boxes and built into marble, coal or textiles.", "supporting", "EUROPOL_PORTS"],
    ["S15", "Cargo", "Packing method or container type unusual for the commodity.", "Odd packing or the wrong box type can signal added items or a staged load.", "supporting", "ASEAN_RM"],

    /* 3. Route and logistics */
    ["S16", "Route", "Departure from or transshipment in known cocaine source or transit regions per EUDA/UNODC.", "Most cocaine reaching Europe uses commercial container routes from Latin America.", "supporting", "EUDA_COC"],
    ["S17", "Route", "Routing is illogical or not cost-effective for the goods.", "Extra legs without commercial reason can be used to hide the true origin.", "supporting", "ASEAN_RM"],
    ["S18", "Route", "Container was transshipped, especially at a port with weak security.", "TIN CAN found rip-ons often happen at transshipment, not only at high-risk origin ports.", "strong", "WCO_TINCAN"],
    ["S19", "Route", "Request to switch the B/L or change destination port or data.", "Shipping lines flagged these requests as alerts in Operation TIN CAN.", "strong", "WCO_TINCAN"],
    ["S20", "Route", "Route or destination changed after the vessel left port.", "Mid-voyage changes can move the box to a port or party the network controls.", "supporting", "RED_FLAGS"],
    ["S21", "Route", "Free trade zone or lightly regulated free port in the routing.", "Free zones with little control give a chance to swap or add cargo.", "supporting", "ASEAN_RM"],
    ["S22", "Route", "Last-minute clearance request or redirection of goods.", "Late changes leave little time for checks and can route around targeting.", "supporting", "RED_FLAGS"],
    ["S23", "Route", "Export booking cancelled or repeatedly changed.", "Booking cancellations were among shipping-line alerts passed to customs in TIN CAN.", "supporting", "WCO_TINCAN"],
    ["S24", "Route", "Smaller, less controlled port chosen instead of the usual hub.", "Europol expects traffickers to move to smaller ports as big hubs tighten controls.", "supporting", "EUROPOL_DIV"],

    /* 4. Payment and commercial */
    ["S25", "Payment", "Freight or goods paid in cash.", "Cash breaks the paper trail between the payer and the shipment.", "supporting", "RED_FLAGS"],
    ["S26", "Payment", "Payment made by a third party with no clear link to the consignee.", "An unrelated payer can be the real owner hiding behind the declared parties.", "supporting", "FATF_TBML"],
    ["S27", "Payment", "Letter of indemnity requested without just cause.", "An unjustified LoI can be used to release cargo without proper documents.", "supporting", "RED_FLAGS"],
    ["S28", "Payment", "Trade documents missing, look counterfeit or are amended often.", "Frequent amendments and false papers are core trade-fraud indicators.", "supporting", "FATF_TBML"],

    /* 5. Container and seal */
    ["S29", "Container", "Seal number differs from documents, or seal shows tampering.", "SAFE says the receiver must record the discrepancy and may refuse custody.", "strong", "WCO_SAFE"],
    ["S30", "Container", "Seal not a high-security ISO 17712 seal, or looks duplicated.", "Rip-on teams replace broken seals with counterfeit or duplicate ones.", "supporting", "EUDA_COC"],
    ["S31", "Container", "Signs of recent repair: welding, new rivets, paint or floorboards.", "Fresh work on the box can hide a built-in compartment.", "supporting", "ASEAN_RM"],
    ["S32", "Container", "Reefer set temperature unusual for the declared commodity.", "A setting that does not suit the goods suggests the cargo is not what is declared.", "supporting", "ASEAN_RM"],
    ["S33", "Container", "Unexplained reefer temperature changes or door-opening alerts in transit.", "Shipping lines reported these sensor alerts as rip-on signs in TIN CAN.", "strong", "WCO_TINCAN"],
    ["S34", "Container", "Unusual dwell time in a high-risk port or long inter-terminal transit.", "Extra time in the terminal gives insiders a window to open the box.", "supporting", "WCO_TINCAN"],

    /* 6. Insider and terminal (rip-on / rip-off) */
    ["S35", "Insider", "Release or PIN code used by a party other than the lawful client.", "Stolen pickup codes let criminals collect the box posing as the real client.", "strong", "EUROPOL_PORTS"],
    ["S36", "Insider", "Container moved in the terminal outside the plan or to an accessible stack.", "Networks seek a stack position that lets extraction teams reach the box.", "supporting", "EUROPOL_PORTS"],
    ["S37", "Insider", "Container swapped or replaced around a scheduled scan.", "Europol describes clone boxes sent to the scanner while the real one leaves.", "supporting", "EUROPOL_PORTS"],
    ["S38", "Insider", "Export or empty container enters the port days early without reason.", "A 'Trojan horse' container can carry an extraction team into the terminal.", "supporting", "EUROPOL_PORTS"],
    ["S39", "Insider", "After clearance, container goes to an unsecured empty yard.", "WCO reports drugs in reefer voids retrieved at empty yards, sometimes via GPS trackers.", "supporting", "WCO_INFIL"],
    ["S40", "Insider", "Staff ask about scan plans or container locations without need.", "WCO found insiders in 68% of detections; leaking scan and stack data is a key role.", "strong", "WCO_INFIL"]
  ],

  air: [
    ["A1", "Parties", "Unknown or first-time importer asks for a one-off, last-minute clearance.", "CBSA lists this as a sign brokers should report.", "supporting", "CBSA"],
    ["A2", "Parties", "Private individual consignee for goods of commercial type or quantity.", "The guide asks whether a company or a private person is the receiver.", "supporting", "EU_COURIER"],
    ["A3", "Parties", "Delivery to a hotel, PO box, self-storage unit or untraceable address.", "Such addresses let the receiver collect without being identified.", "supporting", "EU_COURIER"],
    ["A4", "Parties", "Repeat parcels to the same address under different names.", "Changing names at one address spreads risk and hides the real buyer.", "supporting", "UPU_TRACIT"],
    ["A5", "Parties", "One consignor sends to many different consignees.", "A spread of receivers fits a distribution network rather than normal trade.", "supporting", "CBSA"],
    ["A6", "Parties", "No return address, false sender details, or a hotel as sender.", "Senders of illicit goods avoid leaving a traceable return address.", "supporting", "UPU_TRACIT"],
    ["A7", "Payment", "Payment in cash, or card name or address differs from the importer.", "A mismatch between payer and importer hides who really owns the goods.", "supporting", "CBSA"],
    ["A8", "Route", "Many transshipments, or routing through express hubs used as distribution centres.", "Extra hubs can hide the true origin; shorter routes may have existed.", "supporting", "EU_COURIER"],
    ["A9", "Route", "Last-minute change of delivery address to an unknown consignee.", "Late redirection can move the parcel away from controls and known parties.", "supporting", "CBSA"],
    ["A10", "Cargo", "Air or express charges exceed the declared value of the goods.", "Paying more to ship than the goods are worth needs an economic reason.", "supporting", "EU_COURIER"],
    ["A11", "Cargo", "Weight, volume or packaging does not fit the declared goods.", "Physical facts that do not match the AWB point to added or other contents.", "supporting", "EU_COURIER"],
    ["A12", "Cargo", "Vague or low-risk description such as 'documents', gifts or samples.", "Low-attention descriptions have been used as cover for drugs.", "supporting", "ASEAN_RM"],
    ["A13", "Cargo", "Box-in-box, heavy taping, resealing or unusual odour.", "Extra wrapping is used to block smell and hide contents from screening.", "supporting", "UPU_TRACIT"],
    ["A14", "Logistics", "Same consignor uses different freight consolidators for similar shipments.", "Hong Kong Customs saw traffickers rotate consolidators to evade detection.", "supporting", "HK_CED"],
    ["A15", "Parties", "Earlier drug seizure linked to the same sender or address.", "A past seizure at the same sender or address points to an active route.", "supporting", "UPU_TRACIT"]
  ],

  note: "These indicators support, and never replace, the officer's own judgement and national risk profiles; one indicator alone proves nothing."
};
