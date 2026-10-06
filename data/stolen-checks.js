/* LE OSINT Framework: free public stolen-vehicle checks, researched and checked October 2026.
   Row: [country ISO, service, URL, input (vin | plate | both), run by, note, status ("" = confirmed, "u" = unverified / unstable)]
   Only free services are listed. None of these sites accepts the VIN in the address, so the tab copies it for you. */
window.LE_STOLEN = {
  updated: "2026-10",
  checks: [
    // ---- Europe
    ["CZ", "Pátrání po vozidlech (stolen vehicle search)", "https://policie.gov.cz/patrani-vozidla", "both", "Police of the Czech Republic", "Vehicles and plates reported stolen to Czech police. Full VIN or full plate. Czech.", ""],
    ["IT", "CRIMNET: ricerca targhe e telai rubati o smarriti", "http://www.crimnet.dcpc.interno.gov.it/crimnet/ricerca-targhe-telai-rubati-smarriti", "both", "Ministry of the Interior, Criminal Police", "Stolen or lost plates and chassis (VIN) numbers since 2002; plates can lag a few days. Italian.", ""],
    ["HU", "Közútijármű-körözések (wanted road vehicles)", "https://www.police.hu/hu/koral/kozutijarmu-korozesek", "both", "Hungarian Police", "Search by VIN or plate, also make, colour and country. Plates only: /hu/koral/forgalmi-rendszam-korozesek. Hungarian.", ""],
    ["SI", "Ukradena vozila (stolen vehicles)", "https://www.policija.si/seznami/ukradenavozila/uv_prikaz.php", "both", "Slovenian Police", "Public list of stolen vehicles. Slovenian.", "u"],
    ["DK", "Tjek om et motorkøretøj er efterlyst", "https://politi.dk/service-og-tilladelser/cykler-og-koeretoejer/tjek-om-et-motorkoeretoej-er-efterlyst", "both", "Danish Police", "Checks whether a motor vehicle is wanted. Also in the Politi app. Danish.", ""],
    ["NL", "RDW Kentekencheck", "https://ovi.rdw.nl/", "plate", "RDW vehicle registry", "Vehicle details by plate, including whether it is registered as stolen. Dutch.", ""],
    ["NL", "Stop Heling", "https://www.stopheling.nl/", "plate", "Police and Ministry of Justice", "Checks cars and mopeds by plate, and goods by serial number. Also an app. Dutch.", ""],
    ["GR", "OpenCar (gov.gr)", "https://www.gov.gr/el/services/1001612/opencar", "plate", "AADE (tax authority)", "No login. Shows if the vehicle is insured, off the road or reported stolen. Greek.", ""],
    ["PL", "Historia Pojazdu (CEPiK)", "https://historiapojazdu.gov.pl/", "both", "Ministry of Digital Affairs", "Needs plate + VIN + date of first registration. Shows theft status, some foreign theft flags. Polish.", ""],
    ["LT", "Regitra e-paslaugos", "https://www.eregitra.lt/", "both", "Regitra vehicle registry", "Needs two of: VIN, registration certificate number, plate. Shows police-wanted, arrest and pledge. Lithuanian.", ""],
    ["FR", "HistoVec", "https://histovec.interieur.gouv.fr/", "plate", "Ministry of the Interior", "History including theft (vol) status, but only the registered owner can create the report and share it.", ""],
    ["UA", "Wanted vehicles (open data)", "https://data.gov.ua/en/dataset/ac1a3a9d-512b-446b-9b0c-1383d38ce474", "both", "National Police of Ukraine", "Downloadable dataset (JSON), updated several times a day; search it with Ctrl+F after opening.", ""],
    ["UA", "MVS wanted transport search", "https://wanted.mvs.gov.ua/searchtransport/", "both", "Ministry of Internal Affairs", "Search form; often blocked from outside Ukraine (use the open data above).", "u"],
    ["RU", "GIBDD vehicle check (розыск)", "https://xn--90adear.xn--p1ai/check/auto", "vin", "Traffic police (MVD)", "Wanted status by VIN, body or chassis number. Restricted and often down since 2026. Russian.", "u"],
    // ---- Americas
    ["US", "NICB VINCheck", "https://www.nicb.org/vincheck", "vin", "National Insurance Crime Bureau", "Insurer theft and salvage records (not police NCIC). 5 searches per day per IP.", ""],
    ["CA", "CPIC Search Stolen Vehicles", "https://www.cpic-cipc.ca/sve-rve-eng.htm", "vin", "RCMP (Canadian Police Information Centre)", "VIN only. Accept the terms first; searches may be shared with police.", ""],
    ["MX", "REPUVE Consulta Ciudadana", "https://www2.repuve.gob.mx:8443/ciudadania/", "both", "SESNSP (public vehicle register)", "VIN (NIV), plate or registration number; theft reports from prosecutors and insurers. CAPTCHA. Spanish.", ""],
    ["BR", "Sinesp Cidadão", "https://www.gov.br/pt-br/servicos/consultar-veiculo", "plate", "Ministry of Justice and Public Security", "App (iOS / Android); vehicle check needs no login. Shows theft (roubo/furto) status. Portuguese.", ""],
    ["BR", "Detran-SP: pesquisa de restrições", "https://www.detran.sp.gov.br", "plate", "São Paulo state traffic department", "São Paulo state; the app's basic search works without an account. Portuguese.", ""],
    ["CL", "Autoseguro", "https://www.autoseguro.gob.cl", "both", "Government with Registro Civil, Carabineros and PDI", "Shows instantly if the vehicle has an \"encargo por robo\" (theft report). Spanish.", ""],
    ["CO", "RUNT consulta", "https://www.runt.gov.co", "both", "Ministry of Transport registry", "Plate + owner ID, or VIN / SOAT. Shows DIJIN theft flags. Spanish.", ""],
    ["PE", "SUNARP Alerta de Robo", "https://alertarobo.sunarp.gob.pe/", "plate", "SUNARP public registry", "Theft alert also appears in SUNARP Consulta Vehicular. Spanish.", ""],
    ["EC", "SIIPNE: vehículos robados / recuperados", "https://siipne.policia.gob.ec/patiosbodegapj/idxVerecid.php", "both", "National Police of Ecuador", "Stolen and recovered vehicles; security code. Spanish.", "u"],
    // ---- Middle East, Asia, Oceania
    ["IL", "Stolen vehicle check", "https://www.gov.il/apps/police/stolencar/", "plate", "Israel Police", "Plate only; shows reported thefts. Hebrew.", ""],
    ["IN", "Digital Police: Vehicle NOC", "https://digitalpolicecitizenservices.gov.in", "both", "NCRB (national police records)", "National stolen / crime status and NOC; plate or VIN plus engine number.", "u"],
    ["IN", "ZIPNET Delhi: stolen / unclaimed vehicles", "https://zipnet.delhipolice.gov.in", "both", "Delhi Police", "North Indian states. VIN or plate plus engine number.", "u"],
    ["TW", "MOI vehicle / plate theft query", "https://od.moi.gov.tw/adm/veh/query_veh", "plate", "Ministry of the Interior (police)", "Choose the plate type; result can be downloaded as CSV. Chinese.", ""],
    ["AU", "Victoria Police Stolen Vehicle Check", "https://www.police.vic.gov.au/stolen-vehicle-check-victoria", "plate", "Victoria Police", "Thefts in the last 90 days; plate, make or model, no VIN. (Full national check PPSR is paid.)", ""],
    ["AU", "Queensland Police stolen vehicles", "https://police.qld.gov.au/stolen-vehicles", "plate", "Queensland Police Service", "Thefts in the last 28 days, refreshed daily.", ""],
    ["NZ", "Check if a vehicle is stolen", "https://www.police.govt.nz/can-you-help-us/stolen-vehicles", "both", "New Zealand Police", "Plate, VIN, engine or chassis number; * wildcard; up to 5 results. Stolen plates not included.", ""]
  ],
  // Restricted to police / government: request through your national contact point
  le: [
    ["Interpol SMV (Stolen Motor Vehicles)", "https://www.interpol.int/Crimes/Vehicle-crime/Our-response", "Worldwide stolen vehicles from 130+ countries. Through your Interpol National Central Bureau (I-24/7)."],
    ["Schengen Information System (SIS)", "https://home-affairs.ec.europa.eu/policies/schengen-borders-and-visa/schengen-information-system_en", "Alerts on vehicles, plates and documents in Schengen states. Through national systems / SIRENE bureau."],
    ["EUCARIS", "https://www.eucaris.net/", "European car and driving licence information system between registration authorities and police."],
    ["NCIC (USA)", "https://le.fbi.gov/informational-tools/ncic", "FBI national crime database including stolen vehicles and parts. US agencies, or request via liaison."],
    ["NMVTIS (USA)", "https://vehiclehistory.bja.ojp.gov/", "Title, junk and salvage history. Free for law enforcement; the public pays through approved providers."],
    ["PPSR (Australia)", "https://transact.ppsr.gov.au/ppsr/SearchForMotorVehicle", "National register with the NEVDIS stolen flag. Paid (about A$2), so not listed above."]
  ],
  // Free, but they do not show a stolen flag: use them to check the identity of the vehicle
  support: [
    ["US", "NHTSA VIN decoder (vPIC)", "https://vpic.nhtsa.dot.gov/decoder/", "Make, model, year, plant and body for most VINs. The tab decodes your VIN with it automatically."],
    ["US", "NHTSA safety recalls by VIN", "https://www.nhtsa.gov/recalls", "Open recalls; confirms the VIN belongs to a real vehicle of that make."],
    ["GB", "DVLA vehicle enquiry", "https://vehicleenquiry.service.gov.uk/", "Make, colour, tax and MOT status by plate. Compare with the vehicle in front of you."],
    ["GB", "MOT history", "https://www.gov.uk/check-mot-history", "Test dates, mileage and colour by plate. Gaps or mileage drops are red flags."],
    ["ES", "DGT informe reducido", "https://sede.dgt.gob.es/es/vehiculos/informacion-de-vehiculos/informe-de-un-vehiculo/", "Free reduced report (Cl@ve or eID login), no theft data. The full report costs €8.67."],
    ["RO", "RAR Istoric Vehicul", "https://www.rarom.ro/", "Inspection and mileage history by VIN (email needed). No theft data."]
  ],
  none: "Germany, Austria, Switzerland, Belgium, United Kingdom, Ireland, Spain, Portugal, Slovakia, Romania, Estonia, Norway, Sweden, Finland, Turkey, South Africa, Kenya, Nigeria, Ghana, Morocco, Egypt, UAE, Saudi Arabia, Qatar, Jordan, Pakistan, Bangladesh, Sri Lanka, Philippines, Malaysia, Indonesia, Thailand, Vietnam, Japan, South Korea, Hong Kong, Singapore, Argentina (paid DNRPA report only), Canada/BC (ICBC), Guatemala, Costa Rica, Dominican Republic, Panama"
};
