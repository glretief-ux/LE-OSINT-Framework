/* LE OSINT Framework: drug precursors under international control (1988 UN Convention, Tables I and II).
   Status as of October 2026: Tables as amended up to CND 67 (March 2024, in force 3 Dec 2024) and the
   CND 68 (2025) reorganisation of the PMK glycidate esters. CND 69 (March 2026) scheduled no precursors.
   Row: [name, other names / esters, table ("I", "II", or "S" = not in Tables I/II), CAS, HS 2022, year under control, [drug codes], role, note]
   Salts of Table I and II substances are also controlled wherever they can exist (except salts of hydrochloric and sulphuric acid). */
window.LE_PRECURSORS = {
  updated: "2026-10",
  drugs: {
    HER: "Heroin", COC: "Cocaine", METH: "Methamphetamine", AMP: "Amphetamine", MDMA: "MDMA / MDA / MDEA (\"ecstasy\")", FEN: "Fentanyl and analogues",
    LSD: "LSD", MQ: "Methaqualone", PCP: "Phencyclidine (PCP)", MCAT: "Methcathinone / cathinones", GHB: "GHB", MANY: "Many drugs (general reagent or solvent)"
  },
  rows: [
    // ---------------- Table I ----------------
    ["Acetic anhydride", "Ethanoic anhydride; acetyl oxide", "I", "108-24-7", "2915.24", "1988 (Table II), moved to Table I in 2001", ["HER", "MQ", "AMP", "METH"], "Acetylating agent", "Key chemical for heroin manufacture. Also used to make phenylacetone (P-2-P) and methaqualone. Large legitimate use (cellulose acetate, pharmaceuticals)."],
    ["N-Acetylanthranilic acid", "2-Acetamidobenzoic acid", "I", "89-52-1", "2924.23", "1992", ["MQ"], "Precursor", "Methaqualone and mecloqualone."],
    ["Ephedrine", "Ephedrine and its salts; (-)-ephedrine", "I", "299-42-3", "2939.41", "1988", ["METH", "MCAT"], "Precursor", "Also found in pharmaceutical preparations, which are a common source of diversion."],
    ["Pseudoephedrine", "Pseudoephedrine and its salts; (+)-pseudoephedrine", "I", "90-82-4", "2939.42", "1988", ["METH", "MCAT"], "Precursor", "Widely used in cold medicines; diversion of preparations is common."],
    ["Norephedrine", "Phenylpropanolamine; PPA", "I", "14838-15-4", "2939.44", "2000", ["AMP"], "Precursor", "Also used for 4-methylaminorex."],
    ["Ergometrine", "Ergonovine", "I", "60-79-7", "2939.61", "1988", ["LSD"], "Precursor", ""],
    ["Ergotamine", "", "I", "113-15-5", "2939.62", "1988", ["LSD"], "Precursor", ""],
    ["Lysergic acid", "", "I", "82-58-6", "2939.63", "1988", ["LSD"], "Precursor", ""],
    ["1-Phenyl-2-propanone", "P-2-P; P2P; BMK (benzyl methyl ketone); phenylacetone", "I", "103-79-7", "2914.31", "1988", ["AMP", "METH"], "Precursor", "Direct precursor of amphetamine and methamphetamine."],
    ["Phenylacetic acid", "Benzeneacetic acid; PAA", "I", "103-82-2", "2916.34", "1988 (Table II), moved to Table I in 2010", ["AMP", "METH"], "Pre-precursor (via P-2-P)", "Used to make P-2-P. Legitimate use in penicillin production and perfumes."],
    ["alpha-Phenylacetoacetonitrile", "APAAN; 3-oxo-2-phenylbutanenitrile", "I", "4468-48-8", "2926.40", "2014", ["AMP", "METH"], "Pre-precursor (via P-2-P)", "Designer precursor with almost no legitimate use; converted to P-2-P."],
    ["alpha-Phenylacetoacetamide", "APAA; 3-oxo-2-phenylbutanamide", "I", "4433-77-6", "2924.29", "2019", ["AMP", "METH"], "Pre-precursor (via P-2-P)", "Designer precursor; converted to P-2-P."],
    ["Methyl alpha-phenylacetoacetate", "MAPA; methyl 3-oxo-2-phenylbutanoate", "I", "16648-44-5", "2918.30", "2020", ["AMP", "METH"], "Pre-precursor (via P-2-P)", "Designer precursor; converted to P-2-P."],
    ["P-2-P methyl glycidic acid and its esters", "BMK glycidic acid; 2-methyl-3-phenyloxirane-2-carboxylic acid; BMK methyl glycidate; BMK ethyl glycidate; methyl, ethyl, propyl, isopropyl, butyl, isobutyl, sec-butyl and tert-butyl esters", "I", "25547-51-7 (acid); 80532-66-7 (methyl ester)", "2918.99 (indicative)", "2024 (acid and 8 esters)", ["AMP", "METH"], "Pre-precursor (via P-2-P)", "Designer precursors; seized in large quantities in Europe as \"BMK glycidate\". Optical isomers included."],
    ["Isosafrole", "cis- and trans-isosafrole", "I", "120-58-1", "2932.91", "1992", ["MDMA"], "Precursor", ""],
    ["Safrole", "Also in safrole-rich oils (sassafras oil, Ocotea cymbarum oil)", "I", "94-59-7", "2932.94", "1992", ["MDMA"], "Precursor", "Essential oils rich in safrole are a known diversion route."],
    ["Piperonal", "Heliotropine; 1,3-benzodioxole-5-carbaldehyde", "I", "120-57-0", "2932.93", "1992", ["MDMA"], "Precursor", "Legitimate use in fragrances and flavours."],
    ["3,4-Methylenedioxyphenyl-2-propanone", "3,4-MDP-2-P; PMK (piperonyl methyl ketone); MDP2P", "I", "4676-39-5", "2932.92", "1992", ["MDMA"], "Precursor", "Direct precursor of MDMA, MDA and MDEA."],
    ["3,4-MDP-2-P methyl glycidic acid and its esters", "PMK glycidic acid; PMK glycidate; PMK methyl glycidate; PMK ethyl glycidate; methyl, ethyl, propyl, isopropyl, butyl, isobutyl, sec-butyl and tert-butyl esters", "I", "2167189-50-4 (acid); 13605-48-6 (methyl ester)", "2932.99 (indicative)", "2019 (acid and methyl ester); other 7 esters 2024", ["MDMA"], "Pre-precursor (via PMK)", "Designer precursors. In 2025 the methyl ester was moved into the footnote with the other esters; control unchanged."],
    ["4-Anilino-N-phenethylpiperidine", "ANPP; 4-ANPP; despropionyl fentanyl", "I", "21409-26-7", "2933.36", "2017", ["FEN"], "Precursor", "Immediate precursor of fentanyl."],
    ["N-Phenethyl-4-piperidone", "NPP", "I", "39742-60-4", "2933.37", "2017", ["FEN"], "Precursor", ""],
    ["4-Anilinopiperidine", "4-AP; N-phenylpiperidin-4-amine", "I", "23056-29-3", "2933.39", "2022", ["FEN"], "Precursor", ""],
    ["tert-Butyl 4-(phenylamino)piperidine-1-carboxylate", "1-boc-4-AP; boc-4-AP", "I", "125541-22-2", "2933.39", "2022", ["FEN"], "Precursor", "Protected form of 4-AP."],
    ["Norfentanyl", "N-phenyl-N-(piperidin-4-yl)propanamide", "I", "1609-66-5", "2933.39", "2022", ["FEN"], "Precursor", "Precursor of fentanyl and several analogues."],
    ["4-Piperidone", "Piperidin-4-one (and its salts, e.g. hydrochloride monohydrate)", "I", "41661-47-6", "2933.39", "2024", ["FEN"], "Pre-precursor", "Widely used in industry; precursor of NPP and other fentanyl precursors."],
    ["1-boc-4-Piperidone", "tert-Butyl 4-oxopiperidine-1-carboxylate; N-boc-4-piperidone", "I", "79099-07-3", "2933.39", "2024", ["FEN"], "Pre-precursor", ""],
    ["Potassium permanganate", "KMnO4", "I", "7722-64-7", "2841.61", "1992 (Table II), moved to Table I in 2001", ["COC", "MCAT"], "Oxidising agent", "Used to purify coca paste into cocaine base. Large legitimate use (water treatment)."],
    // ---------------- Table II ----------------
    ["Acetone", "Propan-2-one; dimethyl ketone", "II", "67-64-1", "2914.11", "1988", ["COC", "HER", "MANY"], "Solvent", "Very common solvent; used in cocaine and heroin processing."],
    ["Anthranilic acid", "2-Aminobenzoic acid", "II", "118-92-3", "2922.43", "1988", ["MQ"], "Precursor (via N-acetylanthranilic acid)", ""],
    ["Ethyl ether", "Diethyl ether; ether", "II", "60-29-7", "2909.11", "1988", ["COC", "HER", "MANY"], "Solvent", ""],
    ["Hydrochloric acid", "Hydrogen chloride", "II", "7647-01-0", "2806.10", "1992", ["COC", "HER", "METH", "MANY"], "Acid", "Used to make the hydrochloride salt of cocaine, heroin and methamphetamine. Its salts are not controlled."],
    ["Methyl ethyl ketone", "MEK; butanone; 2-butanone", "II", "78-93-3", "2914.12", "1992", ["COC", "MANY"], "Solvent", "Commonly used in cocaine hydrochloride manufacture."],
    ["Piperidine", "", "II", "110-89-4", "2933.32", "1988", ["PCP"], "Precursor", ""],
    ["Sulphuric acid", "Sulfuric acid; oil of vitriol", "II", "7664-93-9", "2807.00", "1992", ["COC", "MANY"], "Acid", "Used in coca leaf extraction. Its salts are not controlled."],
    ["Toluene", "Methylbenzene; toluol", "II", "108-88-3", "2902.30", "1992", ["COC", "MANY"], "Solvent", ""],
    // ---------------- Not in Tables I/II (examples often asked about) ----------------
    ["Benzaldehyde", "", "S", "100-52-7", "2912.21", "", ["AMP", "METH"], "Pre-precursor", "Not internationally controlled. On the INCB limited international special surveillance list; controlled in some countries."],
    ["Nitroethane", "", "S", "79-24-3", "2904.20", "", ["AMP", "MDMA"], "Reagent", "Not internationally controlled. On the INCB special surveillance list; controlled in some countries."],
    ["Methylamine", "Monomethylamine", "S", "74-89-5", "2921.11", "", ["METH", "MDMA"], "Reagent", "Not internationally controlled. On the INCB special surveillance list; nationally controlled in several countries (e.g. USA, Mexico)."],
    ["Red phosphorus", "", "S", "7723-14-0", "2804.70", "", ["METH"], "Reagent", "Not internationally controlled. On the INCB special surveillance list; nationally controlled in several countries."],
    ["Hydriodic acid", "Hydrogen iodide", "S", "10034-85-2", "2811.19", "", ["METH"], "Reagent", "Not internationally controlled. On the INCB special surveillance list; controlled in some countries."],
    ["gamma-Butyrolactone", "GBL", "S", "96-48-0", "2932.20", "", ["GHB"], "Precursor / substitute", "Not internationally controlled (GHB itself is). Converts to GHB in the body; controlled nationally in many countries."],
    ["1,4-Butanediol", "1,4-BD; BDO", "S", "110-63-4", "2905.39", "", ["GHB"], "Precursor / substitute", "Not internationally controlled. Converts to GHB in the body; controlled nationally in some countries."]
  ]
};
