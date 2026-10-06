/* LE OSINT Framework: container owner prefixes (ISO 6346 / BIC owner code + category U).
   Row: [prefix, registered owner (as shown in the BIC register), type, note]
   type: lessor · tank (tank container operator / lessor) · carrier · rail · other

   Sources (checked 6 October 2026):
   - BIC international register of owner codes, one page per code:
     https://www.bic-code.org/bic-codes/<code>/  (owner name and country as registered on that date)
   - BIC "recently created" and "recently cancelled" code lists:
     https://www.bic-code.org/bic-codes/recently-created/ , https://www.bic-code.org/bic-codes/recently-cancelled/
   - Textainer completed acquisition of Seaco from Bohai Leasing, 15 Dec 2025 (Business Wire / Stonepeak release):
     https://www.businesswire.com/news/home/20251215813003/en/Stonepeak-Portfolio-Company-Textainer-Completes-Acquisition-of-Seaco
   - CAI International and Beacon Intermodal Leasing merged under the CAI name, 1 Jan 2023, both Mitsubishi HC Capital subsidiaries:
     https://splash247.com/?p=175347
   - Evergreen's Panama subsidiary Gaining Enterprises S.A.: https://container-news.com/evergreen-buys-more-containers-re-assigns-fleet-after-profit-spike
   - "mirror" in a note = confirmed only on shipping-container-info.com, which republishes the BIC register; not yet re-checked on bic-code.org.

   The register shows who holds the code TODAY. Older boxes can still carry a prefix that has moved to a new holder
   (merger or fleet sale), and boxes are often sub-leased, so the marked owner is not always the operator. Check a specific
   box with the carrier.
   Swap bodies and semi-trailers in European intermodal traffic use ILU codes (EN 13044, administered by UIRR), not BIC codes. */
window.LE_OWNERS = {
  updated: "2026-10",
  rows: [
    /* ---- Leasing companies: dry / reefer boxes ---- */
    ["TCNU", "Triton Container International Ltd (Bermuda)", "lessor", ""],
    ["TCLU", "Triton Container International Ltd (Bermuda)", "lessor", ""],
    ["TCKU", "Triton Container International Ltd (Bermuda)", "lessor", ""],
    ["TRHU", "Triton Container International Ltd (Bermuda)", "lessor", ""],
    ["TTNU", "Triton Container International Ltd (Bermuda)", "lessor", ""],
    ["TRLU", "Triton Container International Ltd (Bermuda)", "lessor", ""],
    ["TLLU", "Triton Container International Ltd (Bermuda)", "lessor", ""],
    ["TOLU", "Triton Container International Ltd (Bermuda)", "lessor", ""],
    ["TRIU", "Triton Container International Ltd (Bermuda)", "lessor", ""],
    ["TDRU", "Triton Container International Ltd (Bermuda)", "lessor", ""],
    ["TPHU", "Triton Container International Ltd (Bermuda)", "lessor", "Old Tiphook prefix, now registered to Triton"],
    ["YOIU", "Triton Container International Ltd (Bermuda)", "lessor", ""],

    ["TGHU", "Textainer Equipment Management Ltd (Bermuda)", "lessor", "Often wrongly listed as Triton"],
    ["TEMU", "Textainer Equipment Management Ltd (Bermuda)", "lessor", ""],
    ["TGBU", "Textainer Equipment Management Ltd (Bermuda)", "lessor", ""],
    ["TXGU", "Textainer Equipment Management Ltd (Bermuda)", "lessor", ""],
    ["TEXU", "Textainer Equipment Management Ltd (Bermuda)", "lessor", ""],
    ["AMFU", "Textainer Equipment Management Ltd (Bermuda)", "lessor", ""],
    ["XINU", "Textainer Equipment Management Ltd (Bermuda)", "lessor", ""],
    ["GATU", "Textainer Equipment Management Ltd (Bermuda)", "lessor", ""],
    ["MAXU", "Textainer Equipment Management Ltd (Bermuda)", "lessor", ""],
    ["CLHU", "Textainer Equipment Management Ltd (Bermuda)", "lessor", ""],
    ["SEGU", "Textainer Equipment Management Ltd (Bermuda)", "lessor", "Seaco prefix; Textainer bought Seaco on 15 Dec 2025"],
    ["SEKU", "Textainer Equipment Management Ltd (Bermuda)", "lessor", "Seaco prefix; Textainer bought Seaco on 15 Dec 2025"],
    ["GESU", "Textainer Equipment Management Ltd (Bermuda)", "lessor", "Old GE SeaCo prefix; now Textainer (Seaco bought 15 Dec 2025)"],
    ["GSTU", "Textainer Equipment Management Ltd (Bermuda)", "lessor", ""],
    ["GCEU", "Textainer Equipment Management Ltd (Bermuda)", "lessor", ""],
    ["SCZU", "Textainer Equipment Management Ltd (Bermuda)", "lessor", "Often wrongly listed as SeaCube"],
    ["CXDU", "Textainer Equipment Management Ltd (Bermuda)", "lessor", ""],
    ["CXRU", "Textainer Equipment Management Ltd (Bermuda)", "lessor", ""],
    ["CXSU", "Textainer Equipment Management Ltd (Bermuda)", "lessor", ""],
    ["CRXU", "Textainer Equipment Management Ltd (Bermuda)", "lessor", "Cronos-style prefix; now registered to Textainer"],
    ["CRSU", "Textainer Equipment Management Ltd (Bermuda)", "lessor", "Cronos-style prefix; now registered to Textainer"],
    ["CRTU", "Textainer Equipment Management Ltd (Bermuda)", "lessor", "Cronos-style prefix; now registered to Textainer"],
    ["IEAU", "Textainer Equipment Management Ltd (Bermuda)", "lessor", ""],

    ["FSCU", "Florens Asset Management Co Ltd (Hong Kong)", "lessor", "Florens, COSCO Shipping group lessor"],
    ["FCIU", "Florens Asset Management Co Ltd (Hong Kong)", "lessor", ""],
    ["FBLU", "Florens Asset Management Co Ltd (Hong Kong)", "lessor", ""],
    ["FBIU", "Florens Asset Management Co Ltd (Hong Kong)", "lessor", ""],
    ["FCGU", "Florens Asset Management Co Ltd (Hong Kong)", "lessor", ""],
    ["FFAU", "Florens Asset Management Co Ltd (Hong Kong)", "lessor", ""],
    ["FJKU", "Florens Asset Management Co Ltd (Hong Kong)", "lessor", ""],
    ["DFSU", "Florens Asset Management Co Ltd (Hong Kong)", "lessor", ""],
    ["DFOU", "Florens Asset Management Co Ltd (Hong Kong)", "lessor", ""],
    ["CBHU", "Florens Asset Management Co Ltd (Hong Kong)", "lessor", "Very common on COSCO-operated boxes; the registered holder is Florens"],
    ["CCLU", "COSCO Shipping Development (Asia) Co Ltd (Hong Kong)", "lessor", "Old China Shipping prefix; held by COSCO's leasing arm, widely used by COSCO / OOCL"],
    ["CSLU", "COSCO Shipping Development (Asia) Co Ltd (Hong Kong)", "lessor", "Old China Shipping prefix; held by COSCO's leasing arm"],

    ["CAIU", "CAI International Inc (USA)", "lessor", "Mitsubishi HC Capital group"],
    ["CAXU", "CAI International Inc (USA)", "lessor", ""],
    ["SKYU", "CAI International Inc (USA)", "lessor", ""],
    ["BMOU", "CAI International Inc (USA)", "lessor", "Beacon prefix; Beacon merged into CAI on 1 Jan 2023"],
    ["BEAU", "CAI International Inc (USA)", "lessor", "Beacon prefix; Beacon merged into CAI on 1 Jan 2023"],

    ["CRLU", "SeaCube Containers LLC (USA)", "lessor", ""],
    ["SDDU", "SeaCube Containers LLC (USA)", "lessor", ""],
    ["IPXU", "SeaCube Containers LLC (USA)", "lessor", ""],
    ["GAOU", "SeaCube Containers LLC (USA)", "lessor", ""],
    ["GIPU", "SeaCube Containers LLC (USA)", "lessor", ""],
    ["IRNU", "SeaCube Containers LLC (USA)", "lessor", ""],
    ["INKU", "SeaCube Containers LLC (USA)", "lessor", "Some tracking sites list it under MSC; the register says SeaCube"],
    ["INBU", "SeaCube Containers LLC (USA)", "lessor", ""],
    ["DRYU", "SeaCube Containers LLC (USA)", "lessor", ""],

    ["TGCU", "Touax Container Leasing Pte Ltd (Singapore)", "lessor", ""],
    ["TGSU", "Touax Container Leasing Pte Ltd (Singapore)", "lessor", ""],
    ["TGKU", "Touax Container Leasing Pte Ltd (Singapore)", "lessor", "Recently registered code"],
    ["PGTU", "Touax Container Leasing Pte Ltd (Singapore)", "lessor", ""],
    ["GLDU", "Touax Container Leasing Pte Ltd (Singapore)", "lessor", "Gold-style prefix; registered to Touax"],

    ["UETU", "UES International Leasing Ltd (China)", "lessor", ""],
    ["UESU", "UES International Leasing Ltd (China)", "lessor", ""],
    ["UECU", "UES International Leasing Ltd (China)", "lessor", "Recently registered code"],
    ["BSIU", "Blue Sky Intermodal (UK) Ltd", "lessor", ""],
    ["CARU", "Caru Containers BV (Netherlands)", "lessor", "Dutch container trader / lessor (not Cronos)"],
    ["RFCU", "Raffles Lease Pte Ltd (Singapore)", "lessor", ""],
    ["SESU", "Spinnaker Equipment Services Inc (USA)", "lessor", ""],
    ["WFHU", "Waterfront Container Leasing Co Inc (USA)", "lessor", ""],
    ["BHCU", "Bridgehead Container Services Ltd (UK)", "lessor", "Bridgehead, not Beacon"],
    ["LCLU", "Container Leasing (Russian Federation)", "lessor", "St Petersburg"],
    ["GVTU", "Grand View Container Trading (HK) Co Ltd", "lessor", "Container trader"],
    ["CICU", "CIMC Containers Holding Co Ltd (China)", "other", "Container manufacturer"],
    ["CIMU", "CIMC Containers (Group) Co Ltd (China)", "other", "Container manufacturer"],

    /* ---- Tank containers ---- */
    ["HOYU", "Hoyer GmbH (Germany)", "tank", ""],
    ["SNTU", "Stolt Tank Containers Leasing Ltd (Bermuda)", "tank", ""],
    ["STBU", "Stolt Tank Containers Leasing Ltd (Bermuda)", "tank", ""],
    ["EXFU", "Exsif Worldwide (USA)", "tank", ""],
    ["EXXU", "Exsif Worldwide (USA)", "tank", ""],
    ["EURU", "Eurotainer SA (France)", "tank", "Some tracking sites wrongly list it under ANL"],
    ["EUXU", "Eurotainer SA (France)", "tank", ""],
    ["SECU", "Eurotainer SA (France)", "tank", ""],
    ["CCRU", "Eurotainer SA (France)", "tank", ""],
    ["BDLU", "Eurotainer SA (France)", "tank", "Recently registered code"],
    ["TCUU", "Trifleet Leasing Holding BV (Netherlands)", "tank", "TRFU is NOT Trifleet (it is Thaireefer Group)"],
    ["DHDU", "Den Hartogh Global BV (Netherlands)", "tank", ""],
    ["DHBU", "Den Hartogh Dry Bulk Logistics Ltd (UK)", "tank", "Dry-bulk containers"],
    ["IFFU", "Den Hartogh Dry Bulk Logistics Ltd (UK)", "tank", ""],
    ["IFLU", "NRS Ocean Logistics Ltd (UK)", "tank", "Some sites still list it as Interflow; the register now says NRS Ocean Logistics"],
    ["TCSU", "Tankcon BV (Netherlands)", "tank", ""],
    ["BTLU", "Intermodal Tank Transport Logistics UK Ltd", "tank", ""],
    ["RFLU", "Intermodal Tank Transport Inc (USA)", "tank", ""],
    ["BTGU", "Brenntag UK Ltd", "tank", "Chemical distributor (not Bertschi)"],
    ["CFLU", "Cryofleet Pte Ltd (Singapore)", "tank", "Cryogenic tanks (not Container Finance)"],

    /* ---- Carriers ---- */
    ["MAEU", "Maersk A/S (Denmark)", "carrier", ""],
    ["MSKU", "Maersk A/S (Denmark)", "carrier", ""],
    ["MRKU", "Maersk A/S (Denmark)", "carrier", ""],
    ["MRSU", "Maersk A/S (Denmark)", "carrier", ""],
    ["MSAU", "Maersk A/S (Denmark)", "carrier", ""],
    ["MSFU", "Maersk A/S (Denmark)", "carrier", ""],
    ["MNBU", "Maersk A/S (Denmark)", "carrier", "Reefer fleet"],
    ["OCLU", "Maersk A/S (Denmark)", "carrier", ""],
    ["SUDU", "Maersk A/S (Denmark)", "carrier", "Hamburg Süd prefix, now registered to Maersk"],
    ["HASU", "Maersk A/S (Denmark)", "carrier", "Hamburg Süd prefix, now Maersk. NOT Heung-A (Heung-A is HALU)"],
    ["MSCU", "MSC Mediterranean Shipping Company SA (Switzerland)", "carrier", ""],
    ["MEDU", "MSC Mediterranean Shipping Company SA (Switzerland)", "carrier", ""],
    ["MSDU", "MSC Mediterranean Shipping Company SA (Switzerland)", "carrier", ""],
    ["MSMU", "MSC Mediterranean Shipping Company SA (Switzerland)", "carrier", ""],
    ["MSNU", "MSC Mediterranean Shipping Company SA (Switzerland)", "carrier", ""],
    ["CMAU", "CMA CGM (France)", "carrier", ""],
    ["CGMU", "CMA CGM (France)", "carrier", ""],
    ["ECMU", "CMA CGM (France)", "carrier", ""],
    ["APZU", "CMA CGM (France)", "carrier", "APL-origin prefix"],
    ["APHU", "CMA CGM (France)", "carrier", "APL-origin prefix"],
    ["APLU", "CMA CGM (France)", "carrier", "APL prefix, registered to CMA CGM"],
    ["ANNU", "CMA CGM (France)", "carrier", "ANL (CMA CGM group); confirmed from a copy of the BIC register"],
    ["CSNU", "COSCO Shipping Lines Co Ltd (China)", "carrier", ""],
    ["OOLU", "Orient Overseas Container Line Ltd (Hong Kong)", "carrier", ""],
    ["OOCU", "Orient Overseas Container Line Ltd (Hong Kong)", "carrier", ""],
    ["HLCU", "Hapag-Lloyd AG (Germany)", "carrier", "Also Hapag-Lloyd's SCAC"],
    ["HLXU", "Hapag-Lloyd AG (Germany)", "carrier", ""],
    ["HLBU", "Hapag-Lloyd AG (Germany)", "carrier", ""],
    ["HAMU", "Hapag-Lloyd AG (Germany)", "carrier", ""],
    ["UACU", "Hapag-Lloyd AG (Germany)", "carrier", "UASC prefix, now registered to Hapag-Lloyd"],
    ["ONEU", "Ocean Network Express Pte Ltd (Singapore)", "carrier", ""],
    ["NYKU", "NYK Line (Japan)", "carrier", "Still registered to NYK; boxes are used in ONE services"],
    ["KKFU", "Kawasaki Kisen Kaisha Ltd - K Line (Japan)", "carrier", "Still registered to K Line; boxes are used in ONE services"],
    ["KKTU", "Kawasaki Kisen Kaisha Ltd - K Line (Japan)", "carrier", "Still registered to K Line"],
    ["EMCU", "Evergreen Marine Corp (Taiwan) Ltd", "carrier", ""],
    ["EMEU", "Evergreen Marine Corp (Taiwan) Ltd", "carrier", "Recently registered code"],
    ["EGHU", "Evergreen Marine (Hong Kong) Ltd", "carrier", ""],
    ["EGSU", "Evergreen Marine (Asia) Pte Ltd (Singapore)", "carrier", ""],
    ["EGMU", "Evergreen Marine (Asia) Pte Ltd (Singapore)", "carrier", "Recently registered code"],
    ["EVGU", "Evergreen Marine (Asia) Pte Ltd (Singapore)", "carrier", "Recently registered code"],
    ["EISU", "Evergreen International SA (Panama)", "carrier", ""],
    ["EITU", "Gaining Enterprise SA (Panama)", "carrier", "Evergreen's Panama subsidiary"],
    ["YMLU", "Yang Ming Marine Transport Corp (Taiwan)", "carrier", ""],
    ["YMMU", "Yang Ming Marine Transport Corp (Taiwan)", "carrier", ""],
    ["HDMU", "HMM Co Ltd (Korea)", "carrier", ""],
    ["HMMU", "HMM Co Ltd (Korea)", "carrier", ""],
    ["ZIMU", "ZIM Integrated Shipping Services Ltd (Israel)", "carrier", ""],
    ["ZCSU", "ZIM Integrated Shipping Services Ltd (Israel)", "carrier", ""],
    ["WHLU", "Wan Hai Lines Ltd (Taiwan)", "carrier", ""],
    ["WHSU", "Wan Hai Lines Ltd (Taiwan)", "carrier", ""],
    ["PCIU", "Pacific International Lines (Pte) Ltd (Singapore)", "carrier", ""],
    ["KMTU", "Korea Marine Transport Co / E.C. Team (Korea)", "carrier", "KMTC"],
    ["SKLU", "Sinokor Merchant Marine Corp (Korea)", "carrier", ""],
    ["SKHU", "Sinokor Merchant Marine Corp (Korea)", "carrier", ""],
    ["HALU", "Heung-A Line Co Ltd (Korea)", "carrier", ""],
    ["SMCU", "SM Container Lines (Korea)", "carrier", "SM Line"],
    ["TSSU", "T.S. Lines Ltd (Taiwan)", "carrier", "TSLU is NOT T.S. Lines (it is TCI Seaways, India)"],
    ["TSLU", "TCI Seaways, Transport Corporation of India Ltd", "carrier", "Indian coastal carrier"],
    ["IAAU", "Interasia Lines Singapore Pte Ltd", "carrier", ""],
    ["ESPU", "Emirates Shipping (Hong Kong) Ltd", "carrier", "Emirates Shipping Line"],
    ["CUSU", "CU Lines Pte Ltd (Singapore)", "carrier", "Recently registered code"],
    ["CUVU", "CU Lines Pte Ltd (Singapore)", "carrier", "Recently registered code"],
    ["SITU", "SITC Container Lines Co Ltd (Hong Kong)", "carrier", "Confirmed from a copy of the BIC register"],
    ["ARKU", "Arkas Shipping and Transport SA (Turkey)", "carrier", ""],
    ["TRKU", "Turkon Container Transportation & Shipping (Turkey)", "carrier", ""],
    ["ACLU", "Atlantic Container Line (USA)", "carrier", ""],
    ["MATU", "Matson Navigation Company Inc (USA)", "carrier", "Confirmed from a copy of the BIC register"],
    ["CMCU", "Crowley Liner Services Inc (USA)", "carrier", ""],
    ["SMLU", "Seaboard Marine Ltd (USA)", "carrier", ""],

    /* ---- Others worth knowing (look-alikes) ---- */
    ["KNNU", "Kuehne + Nagel AS", "other", "Freight forwarder; recently registered code"],
    ["MSUU", "M/S Containers A/S (Denmark)", "other", "Not Maersk or MSC"],
    ["TRFU", "Thaireefer Group (Thailand)", "other", "Not Trifleet"],
    ["TFRU", "Contenedores Teifer (Spain)", "other", ""],
    ["EGCU", "Eurasiagas Corporation (St Kitts and Nevis)", "other", "Not Evergreen"],
    ["BERU", "Berg Manufacturing (USA)", "other", "Not Bertschi"],
    ["TGTU", "Ningbo Transocean Global Transportation Corp Ltd (China)", "other", "Not Touax"],
    ["TTUU", "Transtec Ltd (Russian Federation)", "other", "Not Triton"],
    ["PCCU", "Projextrade (France)", "other", ""],
    ["CFCU", "Department of National Defence (Canada)", "other", "Military"]
  ],
  /* Codes checked and found NOT in the register on 6 Oct 2026 (old boxes may still carry them) */
  notRegistered: {
    "MOLU": "Mitsui O.S.K. Lines; bic-code.org returns 'No code found' (MOL boxes went to ONE)",
    "HJCU": "Hanjin Shipping (bankrupt 2016-17); 'No code found'",
    "PGRU": "'No code found'",
    "KOCU": "KOBC Container Leasing No.1; on the recently-cancelled list",
    "EKLU": "K Line; recently cancelled", "ESSU": "K Line; recently cancelled", "KKLU": "K Line; recently cancelled",
    "KXTU": "K Line; recently cancelled", "PXCU": "K Line; recently cancelled",
    "SIIU": "Shipping Corporation of India; recently cancelled",
    "VTGU": "VTG Tanktainer; recently cancelled", "ALTU": "VTG Tanktainer; recently cancelled",
    "SVDU": "Samskip Multimodal; recently cancelled", "VDMU": "Samskip Multimodal; recently cancelled"
  }
};

/* Look up a 4-letter owner code (e.g. "TGHU"). Returns {code, owner, type, note, lines:[shipping line names], cancelled} or null. */
window.LE_OWNERS.find = function (code) {
  code = String(code || "").toUpperCase().slice(0, 4);
  if (!/^[A-Z]{3}[UJZ]$/.test(code)) return null;
  var O = window.LE_OWNERS, r = null, i;
  for (i = 0; i < O.rows.length; i++) if (O.rows[i][0] === code) { r = O.rows[i]; break; }
  var lines = [];
  var L = window.LE_LINES && window.LE_LINES.rows || [];
  for (i = 0; i < L.length; i++) if ((" " + (L[i][3] || "") + " ").indexOf(" " + code + " ") > -1) lines.push(L[i][0]);
  var c = O.notRegistered && O.notRegistered[code];
  if (!r && !lines.length && !c) return { code: code, unknown: true };
  return { code: code, owner: r ? r[1] : "", type: r ? r[2] : "", note: r ? r[3] : "", lines: lines, cancelled: c || "" };
};
