/*
  LE OSINT Framework — link database
  ------------------------------------------------------------------
  HOW TO EDIT (works fine in GitHub's web editor):

  # Category name                 -> top-level branch (add [LE+] to mark a law-enforcement addition)
  # Country name [Country]        -> a country under "By country" (start each link with its type, e.g. "Companies: ...")
  ## Sub-category                 -> second level
  ### Sub-sub-category            -> third level
  > Note text                     -> guidance note shown under the current branch
  Name | URL | FLAGS | SELECTORS | NOTE  -> a link (NOTE is optional: what it gives you)

  FLAGS (combine freely, e.g. "R$"):
    T = tool you install / run locally        D = Google dork
    R = free registration / login required    F = free for verified law enforcement
    N = new or updated in the latest review (September 2026)
    (Paid services are deliberately NOT listed. Only free sources, or free tiers that work without payment.)
    L = law-enforcement / government accounts only
    A = active: subject may be alerted, or your visit is logged by the platform
    P = privacy / legal caution (facial recognition, uploads become public, etc.)

  SELECTORS: comma-separated types the URL accepts. Put {q} in the URL where the
  search term goes. Types:
    user email phone domain ip mac url img name org kw hash crypto vessel imo mmsi
    cont flight reg vin hs place cve
  ------------------------------------------------------------------
*/
window.LE_OSINT_DATA = String.raw`

# Username
> Start with the exact handle, then try permutations (Toolbox > Username permutations). Check the same handle on the platforms most used in the subject's country.
## Username Search Engines
WhatsMyName | https://whatsmyname.app/?q={q} | | user
Namechk | https://namechk.com/ | |
Instant Username Search | https://instantusername.com/ | |
UserSearch | https://usersearch.com/ | | | Reverse username, email, phone and picture lookups (free searches, no signup)
Google (exact handle) | https://www.google.com/search?q=%22{q}%22 | D | user
## Command-line Tools
Sherlock | https://github.com/sherlock-project/sherlock | T |
Maigret | https://github.com/soxoj/maigret | T |
Blackbird | https://github.com/p1ngul1n0/blackbird | T |
Social Analyzer | https://github.com/qeeqbox/social-analyzer | T |
## Direct Profile Checks
X / Twitter | https://x.com/{q} | | user
Instagram | https://www.instagram.com/{q}/ | | user
TikTok | https://www.tiktok.com/@{q} | | user
Telegram | https://t.me/{q} | | user
Reddit | https://www.reddit.com/user/{q} | | user
GitHub | https://github.com/{q} | | user
YouTube | https://www.youtube.com/@{q} | | user
Linktree | https://linktr.ee/{q} | | user
Keybase | https://keybase.io/{q} | | user

# Email Address
> Breach data can reveal linked usernames, phone numbers and passwords reused elsewhere. Record the source and date of any breach record you rely on.
## Account Discovery
Epieos | https://epieos.com/?q={q}&t=email |  | email
Holehe | https://github.com/megadose/holehe | T |
Predicta Search | https://www.predictasearch.com/ | N | | Accounts linked to an email or phone number; free basic search without login
Hudson Rock infostealer lookup | https://www.hudsonrock.com/free-tools | N | | Was this email, username or domain stolen by infostealer malware? Free check
OSINT Industries (free for law enforcement) | https://www.osint.industries/free-access/law-enforcement | NF | | Email / phone / username account discovery; free access after LE verification
GHunt (Google accounts) | https://github.com/mxrch/GHunt | T |
Google (exact address) | https://www.google.com/search?q=%22{q}%22 | D | email
## Breach Data
Have I Been Pwned | https://haveibeenpwned.com/ | |
Intelligence X | https://intelx.io/?s={q} | R | email,domain,ip,url,phone,crypto
## Verification & Reputation
EmailRep | https://emailrep.io/ | |
Hunter Email Verifier | https://hunter.io/email-verifier | R |
Hunter Domain Search | https://hunter.io/search/{q} | R | domain
Verifalia | https://verifalia.com/validate-email | |
## Email Header Analysis
Google Admin Toolbox Messageheader | https://toolbox.googleapps.com/apps/messageheader/ | |
MXToolbox Header Analyzer | https://mxtoolbox.com/EmailHeaders.aspx | |

# Domain Name
## WHOIS & Registration
ICANN Lookup | https://lookup.icann.org/en/lookup?name={q} | | domain
DomainTools WHOIS | https://whois.domaintools.com/{q} | | domain
who.is | https://who.is/whois/{q} | | domain
ViewDNS WHOIS | https://viewdns.info/whois/?domain={q} | | domain
ViewDNS Reverse WHOIS | https://viewdns.info/reversewhois/?q={q} | | email,name,org
Whoxy Reverse WHOIS | https://www.whoxy.com/ | |
## DNS & Infrastructure
DNSDumpster | https://dnsdumpster.com/ | |
SecurityTrails | https://securitytrails.com/domain/{q}/dns | R | domain
crt.sh (certificates) | https://crt.sh/?q={q} | | domain
DNSlytics | https://dnslytics.com/ | |
Robtex | https://www.robtex.com/dns-lookup/{q} | | domain
MXToolbox | https://mxtoolbox.com/SuperTool.aspx?action=mx%3a{q} | | domain
ViewDNS Reverse IP | https://viewdns.info/reverseip/?host={q}&t=1 | | domain,ip
Shodan Domain | https://www.shodan.io/domain/{q} | R | domain
## Website Analysis
urlscan.io | https://urlscan.io/domain/{q} | | domain
BuiltWith | https://builtwith.com/{q} | | domain
Netcraft Site Report | https://sitereport.netcraft.com/?url={q} | | domain
SpyOnWeb (shared analytics IDs) | https://spyonweb.com/{q} | | domain
AnalyzeID (shared IDs) | https://analyzeid.com/ | |
VirusTotal Domain | https://www.virustotal.com/gui/domain/{q} | | domain
Google Safe Browsing Status | https://transparencyreport.google.com/safe-browsing/search?url={q} | | domain,url
Meta Ad Library | https://www.facebook.com/ads/library/ | N | | All active ads on Facebook / Instagram and who pays for them: fake shops, investment scams
Google Ads Transparency Center | https://adstransparency.google.com/ | N | | Ads shown by an advertiser on Google, YouTube and partners
TikTok Commercial Content Library | https://library.tiktok.com/ | N | | Ads shown in the EU on TikTok
DSA Transparency Database | https://transparency.dsa.ec.europa.eu/ | N | | Content moderation decisions by online platforms in the EU
Google site: search | https://www.google.com/search?q=site%3A{q} | D | domain
## Look-alike & Subdomains
dnstwist (typosquats) | https://dnstwist.it/ | |
Subfinder | https://github.com/projectdiscovery/subfinder | T |
OWASP Amass | https://github.com/owasp-amass/amass | T |

# IP & MAC Address
> IP geolocation is approximate. For attribution you need provider records via legal process; see "LE Request Portals".
## IP Reputation & Context
AbuseIPDB | https://www.abuseipdb.com/check/{q} | | ip
IPinfo | https://ipinfo.io/{q} | | ip
Spur (VPN / proxy detection) | https://spur.us/context/{q} | | ip
GreyNoise | https://viz.greynoise.io/ip/{q} | | ip
VirusTotal IP | https://www.virustotal.com/gui/ip-address/{q} | | ip
Cisco Talos Reputation | https://talosintelligence.com/reputation_center/lookup?search={q} | | ip,domain
## Registration & Routing
RIPEstat | https://stat.ripe.net/{q} | | ip
ARIN RDAP | https://search.arin.net/rdap/?query={q} | | ip
Hurricane Electric BGP | https://bgp.he.net/ip/{q} | | ip
## Exposed Services
Shodan Host | https://www.shodan.io/host/{q} | R | ip
Censys Platform | https://platform.censys.io/ | R |
## Tor & Anonymisation
ExoneraTor (was IP a Tor relay on date?) | https://metrics.torproject.org/exonerator.html?ip={q} | | ip
Tor Relay Search | https://metrics.torproject.org/rs.html#search/{q} | | ip
## MAC / BSSID
MAC Lookup | https://maclookup.app/search/result?mac={q} | | mac
MAC Vendors | https://macvendors.com/ | |
WiGLE (Wi-Fi geolocation) | https://wigle.net/ | R |
## ISP Contacts for Legal Process
SEARCH.org ISP List | https://www.search.org/resources/isp-list/ | |

# Images / Videos / Docs
> Run every image through at least three reverse-image engines: they index different parts of the web. Yandex is strongest for faces and Eastern Europe.
## Reverse Image Search
Google Lens | https://lens.google.com/uploadbyurl?url={q} | | img
Search by Image (browser extension) | https://github.com/dessant/search-by-image | TN | | Right-click any image to search 30+ reverse-image engines at once
Bing Visual Search | https://www.bing.com/images/search?view=detailv2&iss=sbi&q=imgurl:{q} | | img
Yandex Images | https://yandex.com/images/search?rpt=imageview&url={q} | | img
TinEye | https://tineye.com/search?url={q} | | img
## Image Forensics
Forensically | https://29a.ch/photo-forensics/ | |
FotoForensics | https://fotoforensics.com/ | P |
## Video
InVID / WeVerify Plugin | https://www.invid-project.eu/tools-and-services/invid-verification-plugin/ | T |
yt-dlp (download & preserve) | https://github.com/yt-dlp/yt-dlp | T |
YouTube Metadata | https://mattw.io/youtube-metadata/ | |
## Documents
Google PDF search | https://www.google.com/search?q={q}+filetype%3Apdf | D | kw,name,org
Google Office docs | https://www.google.com/search?q={q}+(filetype%3Adocx+OR+filetype%3Axlsx+OR+filetype%3Apptx) | D | kw,name,org
DocumentCloud | https://www.documentcloud.org/app?q={q} | | kw,name,org
Scribd | https://www.scribd.com/search?query={q} | | kw,name,org

# Social Networks
> Stay logged in only with approved research accounts. Some platforms show your visit to the subject: see flag A.
## Multi-platform
Social Searcher | https://www.social-searcher.com/ | |
Social Blade | https://socialblade.com/ | N | | Follower history and statistics for YouTube, TikTok, Instagram, X and Twitch accounts
myOSINT bookmarklets | https://tools.myosint.training/ | TN | | Free browser bookmarklets that extract IDs and profile data from social platforms
Google social dork | https://www.google.com/search?q=%22{q}%22+(site%3Afacebook.com+OR+site%3Ainstagram.com+OR+site%3Atiktok.com+OR+site%3Ax.com+OR+site%3Alinkedin.com) | D | name,user,phone,email
## Facebook
Facebook Search | https://www.facebook.com/search/top/?q={q} | R | name,kw,phone,email
Who Posted What | https://whopostedwhat.com/ | |
sowsearch (Facebook search helper) | https://www.sowsearch.info/ | N | | Builds Facebook keyword searches with filters
Lookup-ID (numeric ID) | https://lookup-id.com/ | |
## Instagram
Instagram Hashtag | https://www.instagram.com/explore/tags/{q}/ | R | kw
InstaNavigation | https://instanavigation.com/ | N | | View public Instagram stories without an account (third-party viewer, may change)
Instaloader | https://github.com/instaloader/instaloader | T |
## X / Twitter
X Search (latest) | https://x.com/search?q={q}&f=live | R | kw,name,user,url
X Advanced Search | https://x.com/search-advanced | R |
memory.lol (X username history) | https://memory.lol/app/ | RN | | Earlier usernames of an X / Twitter account
## TikTok
TikTok Search | https://www.tiktok.com/search?q={q} | | kw,name
## LinkedIn
LinkedIn Search | https://www.linkedin.com/search/results/all/?keywords={q} | RA | name,org
Google LinkedIn dork (no alert) | https://www.google.com/search?q=site%3Alinkedin.com%2Fin+%22{q}%22 | D | name,org
## YouTube
YouTube Search | https://www.youtube.com/results?search_query={q} | | kw,name
YouTube Geofind (videos by location) | https://mattw.io/youtube-geofind/ | |
## Reddit
Reddit Search | https://www.reddit.com/search/?q={q} | | kw
Reveddit (removed content) | https://www.reveddit.com/y/{q}/ | | user
Arctic Shift (Reddit archive) | https://arctic-shift.photon-reddit.com/ | |
## VK & Russian-language
VK | https://vk.com/ | R |
Odnoklassniki | https://ok.ru/ | R |
## Snapchat
Snap Map (public stories by location) | https://map.snapchat.com/ | |
## Bluesky & Mastodon
Bluesky Search | https://bsky.app/search?q={q} | | kw,name,user
Mastodon (instance search) | https://joinmastodon.org/servers | |

## Other Platforms (direct profile checks)
Threads | https://www.threads.com/@{q} | | user
Snapchat | https://www.snapchat.com/@{q} | | user
Facebook (vanity name) | https://www.facebook.com/{q} | | user
Pinterest | https://www.pinterest.com/{q}/ | | user
Tumblr | https://{q}.tumblr.com/ | | user
SoundCloud | https://soundcloud.com/{q} | | user
Medium | https://medium.com/@{q} | | user
Patreon | https://www.patreon.com/{q} | | user
VK | https://vk.com/{q} | | user
## Payment Handles
PayPal.me | https://www.paypal.com/paypalme/{q} | | user
Venmo | https://account.venmo.com/u/{q} | | user
> A payment handle often shows the real name and profile photo. Useful in fraud and street-dealing cases.

# Instant Messaging
## Telegram
Telegram handle | https://t.me/{q} | | user
TGStat | https://tgstat.com/ | |
Telemetr | https://telemetr.io/ | |
Telegago (Google CSE) | https://cse.google.com/cse?cx=006368593537057042503:efxu7xprihg | |
TgDB | https://www.tgdb.org/ | N | | Telegram search engine: groups, channels, users and memberships (free tier)
Telegram Directory | https://tdirectory.me/ | N | | Directory of public channels, groups and bots
Telegram phone number checker (Bellingcat) | https://github.com/bellingcat/telegram-phone-number-checker | TN | | Checks if phone numbers have a Telegram account and returns the username
Telegram Desktop export (evidence) | https://desktop.telegram.org/ | T |
## WhatsApp
WhatsApp click-to-chat (profile check) | https://wa.me/{q} | A | phone
> Opening a chat is safe; sending anything is contact with the subject. Use an approved device.
## Discord
Disboard (public servers) | https://disboard.org/search?keyword={q} | | kw
Discord ID to date | https://discord.id/ | |
## Other Messengers
Viber | https://www.viber.com/ | T |
WeChat | https://www.wechat.com/ | T |
LINE | https://line.me/ | T |

# People Search Engines
> Most people-search sites cover the US only. Check the legal basis for using commercial data brokers in your jurisdiction.
## International
Webmii | https://webmii.com/people?n=%22{q}%22 | | name
PeekYou | https://www.peekyou.com/ | |
IDCrawl | https://www.idcrawl.com/ | |
Infobel (phone directories) | https://www.infobel.com/ | |
## United States
TruePeopleSearch | https://www.truepeoplesearch.com/ | |
FastPeopleSearch | https://www.fastpeoplesearch.com/ | |
ThatsThem | https://thatsthem.com/ | |
Radaris | https://radaris.com/ | |

# Dating
> Dating sites rarely allow search. Reverse-image search profile photos and match usernames instead.
RomanceScam.org | https://www.romancescam.org/ | |
Google dating profile dork | https://www.google.com/search?q=%22{q}%22+(site%3Atinder.com+OR+site%3Abadoo.com+OR+site%3Aokcupid.com) | D | name,user

# Telephone Numbers
> Enter numbers in international format without spaces, e.g. 32470123456.
## Caller ID & Reverse Lookup
Truecaller | https://www.truecaller.com/ | R |
Sync.me | https://sync.me/ | R |
Spy Dialer (US) | https://spydialer.com/ | |
Google (exact number) | https://www.google.com/search?q=%22%2B{q}%22+OR+%22{q}%22 | D | phone
## Validation & Carrier
libphonenumber Demo | https://libphonenumber.appspot.com/ | |
NumVerify | https://numverify.com/ | R |
Free Carrier Lookup | https://freecarrierlookup.com/ | |
ITU National Numbering Plans | https://www.itu.int/oth/T0202.aspx?parent=T0202 | |
## Messenger Checks
WhatsApp | https://wa.me/{q} | A | phone
Telegram (by phone) | https://t.me/+{q} | A | phone
## Tools
PhoneInfoga | https://github.com/sundowndev/phoneinfoga | T |
Ignorant | https://github.com/megadose/ignorant | TN | | Checks whether a phone number is registered on Instagram, Amazon and other sites
Have I Been Zuckered | https://haveibeenzuckered.com/ | N | | Is the number in the 2021 Facebook leak (533M records)? The record can show name and employer
NumLookup (US numbers) | https://www.numlookup.com/ | N | | Free reverse lookup for US numbers
GetContact (app) | https://www.getcontact.com/en/ | TRN | | Caller-ID app: shows the tags other users saved the number under. Use a research phone
Eyecon (app) | https://www.eyecon-app.com/ | TRN | | Caller-ID app with name and photo. Use a research phone

# Public Records
## Courts & Case Law
CourtListener (US) | https://www.courtlistener.com/?q={q} | | name,org,kw
BAILII (UK & Ireland) | https://www.bailii.org/ | |
UK Find Case Law | https://caselaw.nationalarchives.gov.uk/ | |
EU e-Justice Portal | https://e-justice.europa.eu/ | |
CURIA (EU Court of Justice) | https://curia.europa.eu/juris/recherche.jsf | |
## Official Gazettes
Belgian Official Gazette (Moniteur / Staatsblad) | https://www.ejustice.just.fgov.be/ | |
The Gazette (UK) | https://www.thegazette.co.uk/all-notices/notice?text={q} | | name,org
EUR-Lex | https://eur-lex.europa.eu/ | |
## Prisoners & Offender Registers
US Federal Inmate Locator | https://www.bop.gov/inmateloc/ | |
NSOPW (US sex-offender registries) | https://www.nsopw.gov/ | |
## FOI & Document Repositories
MuckRock | https://www.muckrock.com/ | |
WhatDoTheyKnow (UK FOI) | https://www.whatdotheyknow.com/ | |
## Genealogy & Deaths
FamilySearch | https://www.familysearch.org/ | R |
Find a Grave | https://www.findagrave.com/ | |

# Business Records
## Global
OpenCorporates | https://opencorporates.com/companies?q={q} | | org
GLEIF LEI Search | https://search.gleif.org/ | |
OCCRP Aleph | https://aleph.occrp.org/search?q={q} | R | org,name | Leaks, registries and court records; free account (moved to Aleph Pro, still free)

ICIJ Offshore Leaks | https://offshoreleaks.icij.org/search?q={q} | | org,name
Kompass | https://www.kompass.com/ | |
Wikidata | https://www.wikidata.org/w/index.php?search={q} | | org,name
## European Union
EU Business Registers (BRIS) | https://e-justice.europa.eu/topics/registers-business-insolvency-land/business-registers-search-company-eu_en | |
VIES VAT Number Check | https://ec.europa.eu/taxation_customs/vies/ | |
EORI Number Validation | https://ec.europa.eu/taxation_customs/dds2/eos/eori_validation.jsp | |
AEO Authorisation Search | https://ec.europa.eu/taxation_customs/dds2/eos/aeo_consultation.jsp | |
North Data (DE, AT, CH, NL, BE...) | https://www.northdata.com/ | |
## National Registries
Belgium KBO / BCE | https://kbopub.economie.fgov.be/kbopub/zoeknaamfonetischform.html | |
Netherlands KVK | https://www.kvk.nl/zoeken/?source=all&q={q} | | org
France Annuaire des Entreprises | https://annuaire-entreprises.data.gouv.fr/rechercher?terme={q} | | org,name
France Pappers | https://www.pappers.fr/recherche?q={q} | | org,name
Germany Handelsregister | https://www.handelsregister.de/ | |
UK Companies House | https://find-and-update.company-information.service.gov.uk/search?q={q} | | org,name
US SEC EDGAR | https://www.sec.gov/edgar/search/#/q={q} | | org,name
Russia Rusprofile | https://www.rusprofile.ru/search?query={q} | | org,name

# Transportation
## Vehicles
Stolen vehicle check (in this tool) | #stolen={q} | N | vin | Decodes the VIN and lists every free public stolen-vehicle check by country (30 services), with a result log
NHTSA VIN Decoder | https://vpic.nhtsa.dot.gov/decoder/ | |
NICB VINCheck (US stolen/salvage) | https://www.nicb.org/vincheck | |
UK DVLA Vehicle Enquiry | https://vehicleenquiry.service.gov.uk/ | |
UK MOT History | https://www.gov.uk/check-mot-history | |
Platesmania (plate photos) | https://platesmania.com/ | |
Interpol SMV (stolen motor vehicles) | https://www.interpol.int/Crimes/Vehicle-crime/Our-response | L |
EUCARIS | https://www.eucaris.net/ | L |
## Aviation
Live flight tracker (in this tool) | #flights={q} | N | flight,reg | Track a flight number, callsign, registration or ICAO hex live on a map, with route, aircraft owner and track
Flightradar24 (by registration) | https://www.flightradar24.com/data/aircraft/{q} | | reg
Flightradar24 (by flight) | https://www.flightradar24.com/data/flights/{q} | | flight
FlightAware | https://www.flightaware.com/live/flight/{q} | | flight,reg
ADS-B Exchange (unfiltered) | https://globe.adsbexchange.com/ | |
airplanes.live (unfiltered) | https://airplanes.live/ | N | | Community ADS-B tracking, shows military and blocked aircraft
ADSB.lol (unfiltered, open data) | https://www.adsb.lol/ | N | | Unfiltered tracking with open historical data
adsb.fi | https://globe.adsb.fi/ | N | | Unfiltered community flight tracking
ADS-B history (Bellingcat) | https://github.com/bellingcat/adsb-history | TN | | Query historical aircraft tracks by area, altitude and type
OpenSky Network | https://opensky-network.org/ | |
FAA Registry (N-numbers) | https://registry.faa.gov/aircraftinquiry/Search/NNumberResult?nNumberTxt={q} | | reg
Airframes.org | https://www.airframes.org/ | R |
JetPhotos | https://www.jetphotos.com/registration/{q} | | reg
OurAirports | https://ourairports.com/ | |
## Rail
OpenRailwayMap | https://www.openrailwaymap.org/ | |

# Maritime & Containers [LE+]
> Check the vessel's AIS history for gaps (dark periods) and port calls that do not fit the declared route. Cross-check IMO numbers with Toolbox > Maritime validators.
## Vessel Tracking
MarineTraffic | https://www.marinetraffic.com/ |  |
VesselFinder | https://www.vesselfinder.com/vessels?name={q} | | vessel,imo,mmsi
MyShipTracking | https://www.myshiptracking.com/ | |
Global Fishing Watch (AIS gaps) | https://globalfishingwatch.org/map | |
OpenSeaMap | https://map.openseamap.org/ | N | | Nautical chart: harbours, anchorages, buoys and marinas
## Vessel Registration & Ownership
Equasis (owner, manager, inspections) | https://www.equasis.org/ | R |
IMO GISIS | https://gisis.imo.org/ | R |
ITU MARS (MMSI / call sign) | https://www.itu.int/en/ITU-R/terrestrial/mars/Pages/default.aspx | |
BalticShipping Vessel Database | https://www.balticshipping.com/vessels | |
ShipSpotting (photos) | https://www.shipspotting.com/ | |
## Port State Control
Paris MoU Inspection Search | https://parismou.org/inspection-search/ | |
THETIS (EMSA) | https://portal.emsa.europa.eu/web/thetis/inspections | |
Tokyo MoU APCIS | https://apcis.tmou.org/public/ | |
## Container Tracking (multi-carrier)
Track-Trace | https://www.track-trace.com/container | |
SeaRates Tracking | https://www.searates.com/container/tracking/?number={q} | | cont
Google (exact container / vessel / IMO) | https://www.google.com/search?q=%22{q}%22 | D | cont,imo,vessel,mmsi
BIC Code Register (owner prefixes) | https://www.bic-code.org/ | R |
## Container Tracking (carriers)
Shipping lines directory (in this tool) | #lines | N | | 110 ocean carriers with SCAC codes, container prefixes, alliances and tracking pages; identifies the line from a container or B/L number
Maersk | https://www.maersk.com/tracking/{q} | | cont
MSC | https://www.msc.com/en/track-a-shipment | |
CMA CGM | https://www.cma-cgm.com/ebusiness/tracking | |
Hapag-Lloyd | https://www.hapag-lloyd.com/en/online-business/track/track-by-container-solution.html | |
COSCO | https://elines.coscoshipping.com/ebusiness/cargoTracking | |
ONE | https://ecomm.one-line.com/one-ecom/manage-shipment/cargo-tracking?trakNoParam={q} | | cont
Evergreen | https://ct.shipmentlink.com/servlet/TDB1_CargoTracking.do | |
ZIM | https://www.zim.com/tools/track-a-shipment | |
HMM | https://www.hmm21.com/ | |
Yang Ming | https://www.yangming.com/ | |
## Ports & Locations
World ports directory (in this tool) | #ports | N | | 3,800 commercial seaports and 14,700 more UN/LOCODE port locations, searchable by country, name or code
UN/LOCODE | https://unece.org/trade/cefact/unlocode-code-list-country-and-territory | |
NGA World Port Index | https://msi.nga.mil/Publications/WPI | |
## Trade & Bills of Lading
ImportYeti (US bills of lading) | https://www.importyeti.com/ | |
## LE Maritime Systems
WCO CEN suite (CEN, nCEN, CENcomm) | https://www.wcoomd.org/en/topics/enforcement-and-compliance/instruments-and-tools/cen-suite.aspx | L |
MAOC-N | https://maoc.eu/ | L |

# Customs & Trade [LE+]
## Commodity Classification
HS code finder (in this tool) | #hs | N | | All HS 2022 chapters, headings and subheadings, searchable by code or words, with precursor, cover-load and other risk labels
WCO HS Nomenclature | https://www.wcoomd.org/en/topics/nomenclature/instrument-and-tools/hs-nomenclature-2022-edition.aspx | |
EU TARIC | https://ec.europa.eu/taxation_customs/dds2/taric/taric_consultation.jsp?Lang=en | |
EU EBTI (binding tariff rulings) | https://ec.europa.eu/taxation_customs/dds2/ebti/ebti_consultation.jsp?Lang=en | |
EU Access2Markets | https://trade.ec.europa.eu/access-to-markets/en/home | |
## Trade Statistics
UN Comtrade | https://comtradeplus.un.org/ | R |
ITC Trade Map | https://www.trademap.org/ | R |
World Bank WITS | https://wits.worldbank.org/ | |
OEC (Observatory of Economic Complexity) | https://oec.world/ | |
Eurostat Easy Comext | https://ec.europa.eu/eurostat/comext/newxtweb/ | |
## Traders & Authorisations
EORI Validation | https://ec.europa.eu/taxation_customs/dds2/eos/eori_validation.jsp | |
VIES VAT Check | https://ec.europa.eu/taxation_customs/vies/ | |
AEO Database | https://ec.europa.eu/taxation_customs/dds2/eos/aeo_consultation.jsp | |
## Counterfeits & IP
EUIPO TMview | https://www.tmdn.org/tmview/ | |
WIPO Global Brand Database | https://branddb.wipo.int/ | |
EUIPO IP Enforcement Portal | https://www.euipo.europa.eu/en/enforce-ip/ip-enforcement-portal | L |
## Programmes & Reports
UNODC-WCO Container Control Programme | https://www.unodc.org/unodc/en/ccp/index.html | |
WCO Illicit Trade Report | https://www.wcoomd.org/en/topics/enforcement-and-compliance/resources/publications.aspx | |
FATF Trade-Based Money Laundering | https://www.fatf-gafi.org/en/topics/methods-and-trends.html | |

# Drug Intelligence [LE+]
## Reports & Data
UNODC World Drug Report 2026 | https://www.unodc.org/unodc/en/data-and-analysis/world-drug-report-2026.html | |
UNODC Drugs Monitoring Platform | https://dmp.unodc.org/ | |
EUDA (formerly EMCDDA) | https://www.euda.europa.eu/ | |
EUDA Wastewater Analysis | https://www.euda.europa.eu/topics/wastewater_en | |
InSight Crime | https://insightcrime.org/ | |
Global Organized Crime Index | https://ocindex.net/ | |
Seizure Watch (open-source seizure monitor) | https://glretief-ux.github.io/Seizure-watch-/ | |
## New Psychoactive Substances
UNODC Early Warning Advisory | https://www.unodc.org/LSS/Home/NPS | |
## Precursors
Drug precursor finder (in this tool) | #precursors | N | | All INCB Table I and II chemicals: search a chemical, CAS or HS code to see if it is controlled and which drugs it is used for
INCB Precursors | https://www.incb.org/incb/en/precursors/ | |
INCB Tools for Competent National Authorities | https://www.incb.org/incb/en/precursors/precursors/tools_and_kits.html | L |
## Chemical Lookup
PubChem | https://pubchem.ncbi.nlm.nih.gov/#query={q} | | kw
CAS Common Chemistry | https://commonchemistry.cas.org/results?q={q} | | kw
ChemSpider | https://www.chemspider.com/ | |
## Tablet & Product Identification
Drugs.com Pill Identifier | https://www.drugs.com/imprints.php | |
DrugsData (lab-tested samples) | https://www.drugsdata.org/ | |
## Slang & Emoji Codes
DEA Drug Slang Code Words | https://www.dea.gov/sites/default/files/2018-07/DIR-022-18.pdf | |
Urban Dictionary | https://www.urbandictionary.com/define.php?term={q} | | kw
Emojipedia | https://emojipedia.org/search?q={q} | | kw

# Sanctions, PEPs & Watchlists [LE+]
OpenSanctions | https://www.opensanctions.org/search/?q={q} | | name,org,vessel,imo,crypto
OFAC Sanctions Search | https://sanctionssearch.ofac.treas.gov/ | |
EU Sanctions Map | https://www.sanctionsmap.eu/ | |
UN Security Council Consolidated List | https://main.un.org/securitycouncil/en/content/un-sc-consolidated-list | |
UK Sanctions List | https://www.gov.uk/government/publications/the-uk-sanctions-list | |
US Consolidated Screening List | https://www.trade.gov/data-visualization/csl-search | |
World Bank Debarred Firms | https://www.worldbank.org/en/projects-operations/procurement/debarred-firms | |
FATF High-Risk Jurisdictions | https://www.fatf-gafi.org/en/countries/black-and-grey-lists.html | |
Basel AML Index | https://index.baselgovernance.org/ | |

# Identity & Travel Documents [LE+]
> Compare a document photo or scan with the genuine model before relying on it.
PRADO (EU register of authentic documents) | https://www.consilium.europa.eu/en/documents/prado/ | N | | Security features of genuine ID cards, passports, residence permits and driving licences
Interpol SLTD (stolen & lost travel documents) | https://www.interpol.int/How-we-work/Databases/Our-databases | LN | | Check document numbers via your NCB / border systems
ECB euro banknote security features | https://www.ecb.europa.eu/euro/banknotes/security/html/index.en.html | N | | How to recognise counterfeit euro notes
# Wanted & Missing Persons [LE+]
Interpol Red Notices | https://www.interpol.int/How-we-work/Notices/Red-Notices/View-Red-Notices | |
Interpol Yellow Notices (missing) | https://www.interpol.int/How-we-work/Notices/Yellow-Notices/View-Yellow-Notices | |
Interpol Identify Me | https://www.interpol.int/How-we-work/Notices/Operation-Identify-Me | |
EU Most Wanted | https://eumostwanted.eu/ | |
FBI Most Wanted | https://www.fbi.gov/wanted | |
UK NCA Most Wanted | https://www.nationalcrimeagency.gov.uk/most-wanted | |
Belgian Federal Police Wanted Notices | https://www.police.be/wanted/en/wanted/wanted-persons | |
NamUs (US missing & unidentified) | https://namus.nij.ojp.gov/ | |

# Financial Crime & Fraud [LE+]
## Banking Identifiers
IBAN Checker | https://www.iban.com/ | |
SWIFT BIC Search | https://www.swift.com/bsl/ | |
## Investment & Scam Warnings
IOSCO I-SCAN | https://www.iosco.org/i-scan/ | |
FSMA Belgium Warnings | https://www.fsma.be/en/warnings | |
UK FCA Warning List | https://www.fca.org.uk/consumers/warning-list-unauthorised-firms | |
ScamAdviser | https://www.scamadviser.com/check-website/{q} | | domain
## Networks
Egmont Group (FIUs) | https://egmontgroup.org/ | |
CARIN (asset recovery) | https://www.carin.info/ | L |

# Geolocation Tools / Maps
## Maps
Google Maps | https://www.google.com/maps/search/{q} | | place
Google Earth Web | https://earth.google.com/web/ | |
Google Earth Pro (historical imagery) | https://www.google.com/earth/about/versions/ | T |
Bing Maps | https://www.bing.com/maps?q={q} | | place
Yandex Maps | https://yandex.com/maps/?text={q} | | place
Apple Maps | https://maps.apple.com/?q={q} | | place
OpenStreetMap | https://www.openstreetmap.org/search?query={q} | | place
Baidu Maps (China) | https://map.baidu.com/ | |
## Street-level Imagery
Instant Street View | https://www.instantstreetview.com/ | |
Mapillary | https://www.mapillary.com/app/ | |
KartaView | https://kartaview.org/map | |
## Feature Search
Bellingcat OSM Search | https://osm-search.bellingcat.com/ | |
Overpass Turbo | https://overpass-turbo.eu/ | |
GeoNames | https://www.geonames.org/search.html?q={q} | | place
PeakVisor (mountain skylines) | https://peakvisor.com/ | |
PeakFinder | https://www.peakfinder.com/ | N | | 360° mountain panoramas from any point to match skylines in photos
GeoHints | https://geohints.com/ | N | | Country clues: bollards, road signs, plates, utility poles
TracePoint | https://kluter.github.io/TracePoint/ | N | | Find where a photo was taken by intersecting sight lines
BBBike map compare | https://mc.bbbike.org/mc/ | N | | Compare the same spot on many map and satellite providers side by side
Wikimapia | http://wikimapia.org/ | N | | User-described buildings and places
F4map (3D) | https://demo.f4map.com/ | N | | 3D buildings to check views and heights
Flickr map | https://www.flickr.com/map/ | N | | Geotagged public photos by location
## Satellite Imagery
Copernicus Browser (Sentinel) | https://browser.dataspace.copernicus.eu/ | R |
Sentinel Hub EO Browser | https://apps.sentinel-hub.com/eo-browser/ | R |
NASA Worldview | https://worldview.earthdata.nasa.gov/ | |
NASA FIRMS (fires) | https://firms.modaps.eosdis.nasa.gov/map/ | |
Zoom Earth | https://zoom.earth/ | |
Satellites.pro | https://satellites.pro/ | N | | Satellite maps from several providers
Google Earth Timelapse | https://earthengine.google.com/timelapse/ | N | | Satellite change over time since 1984
Liveuamap | https://liveuamap.com/ | N | | Live incident maps for conflict areas
Soar Atlas | https://soaratlas.com/ | |
## Chronolocation & Weather
SunCalc (sun position & shadows) | https://www.suncalc.org/ | |
ShadowMap | https://shadowmap.org/ | N | | Shadows of real buildings at any date and time
Windy (weather) | https://www.windy.com/ | N | | Weather, wind and waves, including recent history
ShadowFinder | https://github.com/bellingcat/ShadowFinder | T |
Weather Underground History | https://www.wunderground.com/history | |
Meteostat | https://meteostat.net/ | |
timeanddate | https://www.timeanddate.com/ | |
## Cell Towers & Wi-Fi
OpenCelliD | https://opencellid.org/ | |
CellMapper | https://www.cellmapper.net/map | |
WiGLE | https://wigle.net/ | R |
## Coordinates
Earth Point Converter (incl. MGRS) | https://www.earthpoint.us/Convert.aspx | |
what3words | https://what3words.com/ | |

# Search Engines
## General
Google | https://www.google.com/search?q={q} | | kw,name,org
Bing | https://www.bing.com/search?q={q} | | kw,name,org
DuckDuckGo | https://duckduckgo.com/?q={q} | | kw,name,org
Brave Search | https://search.brave.com/search?q={q} | | kw,name,org
Startpage | https://www.startpage.com/do/search?q={q} | | kw,name,org
Mojeek | https://www.mojeek.com/search?q={q} | | kw,name,org
Qwant | https://www.qwant.com/?q={q} | | kw,name,org
## Regional
Yandex (Russia) | https://yandex.com/search/?text={q} | | kw,name,org
Baidu (China) | https://www.baidu.com/s?wd={q} | | kw,name,org
Naver (Korea) | https://search.naver.com/search.naver?query={q} | | kw,name,org
Seznam (Czechia) | https://search.seznam.cz/?q={q} | | kw,name,org
## Specialised
Google News | https://news.google.com/search?q={q} | | kw,name,org
Google Scholar | https://scholar.google.com/scholar?q={q} | | kw,name
Google Books | https://www.google.com/search?tbm=bks&q={q} | | kw,name
Google Advanced Search | https://www.google.com/advanced_search | |
Google Hacking Database | https://www.exploit-db.com/google-hacking-database | |

# Forums / Blogs / IRC
Reddit | https://www.reddit.com/search/?q={q} | | kw
4plebs (4chan archive) | https://archive.4plebs.org/ | |
Google forum dork | https://www.google.com/search?q=%22{q}%22+(inurl%3Aforum+OR+inurl%3Athread+OR+inurl%3Aviewtopic) | D | kw,user,name
Medium | https://medium.com/search?q={q} | | kw
Substack | https://substack.com/search/{q} | | kw
Netsplit (IRC channels) | https://netsplit.de/channels/?chat={q} | | kw

# Archives
Wayback Machine | https://web.archive.org/web/*/{q}* | | url,domain
Wayback CDX (all captures) | https://web.archive.org/cdx/search/cdx?url={q}*&output=txt&limit=500 | | domain
archive.today | https://archive.ph/{q} | | url
Internet Archive Search | https://archive.org/search?query={q} | | kw
CachedView | https://cachedview.nl/ | |
Arquivo.pt | https://arquivo.pt/ | |
Ghostarchive | https://ghostarchive.org/ | |

# Language Translation
Google Translate | https://translate.google.com/?sl=auto&tl=en&text={q}&op=translate | | kw
DeepL | https://www.deepl.com/translator#auto/en/{q} | | kw
Bing Translator | https://www.bing.com/translator?text={q}&to=en | | kw
Yandex Translate | https://translate.yandex.com/ | |
Papago (Korean / Japanese) | https://papago.naver.com/ | |
Reverso Context (phrases & slang) | https://context.reverso.net/ | |
Urban Dictionary | https://www.urbandictionary.com/define.php?term={q} | | kw
> Do not paste sensitive case material into public translation services. Use your agency's approved translation tool for evidence.

# Metadata
Toolbox EXIF Viewer (runs locally, nothing uploaded) | #toolbox-exif | |
ExifTool | https://exiftool.org/ | T |
Jimpl | https://jimpl.com/ | P |
Metadata2Go | https://www.metadata2go.com/ | P |
MediaInfo | https://mediaarea.net/en/MediaInfo | T |
FOCA (document metadata) | https://github.com/ElevenPaths/FOCA | T |
Metagoofil | https://github.com/opsdisk/metagoofil | T |
Content Credentials (C2PA) Verify | https://verify.contentauthenticity.org/ | |

# Mobile Emulation
Android Studio Emulator | https://developer.android.com/studio | T |
BlueStacks | https://www.bluestacks.com/ | T |
> Use a dedicated research phone number and never your personal Apple / Google account.

# Terrorism
## Designation Lists
UN Sanctions List Search (UNSOL) | https://search.sanctions.un.org/ | |
EU Terrorist List | https://www.consilium.europa.eu/en/policies/fight-against-terrorism/terrorist-list/ | |
US Foreign Terrorist Organizations | https://www.state.gov/foreign-terrorist-organizations/ | |
UK Proscribed Groups | https://www.gov.uk/government/publications/proscribed-terror-groups-or-organisations--2 | |
## Research & Data
Global Terrorism Database | https://www.start.umd.edu/gtd/ | R |
ACLED (conflict events) | https://acleddata.com/ | R |
Europol TE-SAT | https://www.europol.europa.eu/publications-events/main-reports/tesat-report | |
Counter Extremism Project | https://www.counterextremism.com/ | |
ADL Hate Symbols Database | https://www.adl.org/resources/hate-symbols/search | |
## Content & Platforms
Tech Against Terrorism | https://techagainstterrorism.org/ | |
Terrorist Content Analytics Platform | https://terrorismanalytics.org/ | |
GIFCT | https://gifct.org/ | |
Europol EU Internet Referral Unit | https://www.europol.europa.eu/about-europol/european-counter-terrorism-centre-ectc/eu-internet-referal-unit-eu-iru | L |

# Dark Web
> Accessing .onion services from an agency network may breach policy. Use an approved, isolated environment and log every session.
## Access
Tor Browser | https://www.torproject.org/download/ | T |
Tails | https://tails.net/ | T |
dark.fail (verified onion links) | https://dark.fail/ | |
## Search
Ahmia | https://ahmia.fi/search/?q={q} | | kw
OnionSearch | https://github.com/megadose/OnionSearch | T |
## Ransomware & Leak Sites
ransomware.live | https://www.ransomware.live/ | |
ID Ransomware | https://id-ransomware.malwarehunterteam.com/ | N | | Identify the ransomware family from the ransom note or an encrypted file
RansomLook | https://www.ransomlook.io/ | |

# Digital Currency
> Identify the chain first (Toolbox > Crypto address identifier). USDT on TRON is common in drug and fraud payments.
## Bitcoin
Mempool.space | https://mempool.space/address/{q} | | crypto
Blockchain.com Explorer | https://www.blockchain.com/explorer/addresses/btc/{q} | | crypto
WalletExplorer (clusters) | https://www.walletexplorer.com/address/{q} | | crypto
## Ethereum & EVM
Etherscan | https://etherscan.io/address/{q} | | crypto
BscScan | https://bscscan.com/address/{q} | | crypto
## TRON (USDT-TRC20)
Tronscan | https://tronscan.org/#/address/{q} | | crypto
OKLink (multi-chain explorer) | https://www.oklink.com/ | N | | Explorer for 60+ chains with address labels
USDT freeze checker (BlockSec) | https://blocksec.com/usdt-freeze-checker | N | | Is a USDT address frozen by Tether? Free, no signup
MetaSleuth (fund-flow graphs) | https://metasleuth.io/ | RN | | Visual tracing of funds between addresses (free account)
MistTrack | https://misttrack.io/ | RN | | Address risk labels and tracing (free limited use)
## Other Chains
Solscan | https://solscan.io/account/{q} | | crypto
Blockchair (multi-chain) | https://blockchair.com/search?q={q} | | crypto,hash
Monero Explorer | https://xmrchain.net/ | |
## Attribution & Abuse Reports
Chainabuse | https://www.chainabuse.com/address/{q} | | crypto
Arkham Intelligence | https://intel.arkm.com/explorer/address/{q} | R | crypto
Breadcrumbs | https://www.breadcrumbs.app/ | R |
Coin ATM Radar | https://coinatmradar.com/ | |

# Classifieds
> Online marketplaces are used to sell counterfeit goods, weapons parts, precursor chemicals and stolen property.
## Europe
2dehands / 2ememain (BE) | https://www.2dehands.be/q/{q}/ | | kw
Marktplaats (NL) | https://www.marktplaats.nl/q/{q}/ | | kw
Leboncoin (FR) | https://www.leboncoin.fr/recherche?text={q} | | kw
Kleinanzeigen (DE) | https://www.kleinanzeigen.de/s-{q}/k0 | | kw
Wallapop (ES) | https://es.wallapop.com/app/search?keywords={q} | | kw
Allegro (PL) | https://allegro.pl/listing?string={q} | | kw
Vinted | https://www.vinted.com/catalog?search_text={q} | | kw
## Global
eBay | https://www.ebay.com/sch/i.html?_nkw={q} | | kw
Facebook Marketplace | https://www.facebook.com/marketplace/search/?query={q} | R | kw
Craigslist (via SearchTempest) | https://www.searchtempest.com/ | |
Avito (RU) | https://www.avito.ru/ | |
## B2B & Chemical Suppliers
Alibaba | https://www.alibaba.com/trade/search?SearchText={q} | | kw
Made-in-China | https://www.made-in-china.com/ | |
IndiaMART | https://dir.indiamart.com/search.mp?ss={q} | | kw

# Encoding / Decoding
Toolbox Encoder (local) | #toolbox-encode | |
CyberChef | https://gchq.github.io/CyberChef/ | |
dCode (ciphers) | https://www.dcode.fr/en | |
Hash Identifier | https://hashes.com/en/tools/hash_identifier | |
ZXing QR / Barcode Decoder | https://zxing.org/w/decode.jspx | P |
Epoch Converter | https://www.epochconverter.com/ | |
HexEd.it | https://hexed.it/ | |

# Tools
## Frameworks & Link Analysis
SpiderFoot | https://github.com/smicallef/spiderfoot | T |
theHarvester | https://github.com/laramies/theHarvester | T |
Recon-ng | https://github.com/lanmaster53/recon-ng | T |
Gephi | https://gephi.org/ | T |
## Investigation Environments
Trace Labs OSINT VM | https://www.tracelabs.org/trace-labs-osint-vm/ | T |
CSI Linux | https://csilinux.com/ | T |
## Toolkits & Directories
Bellingcat Online Investigation Toolkit | https://bellingcat.gitbook.io/toolkit | |
OSINT Newsletter Tools Library | https://tools.osintnewsletter.com/ | N | | Searchable library of OSINT tools with how-to notes
The OSINT Toolbox (GitHub) | https://github.com/The-Osint-Toolbox | N | | Maintained tool lists per topic (phone, Telegram, geolocation...)
OSINT Framework (original) | https://osintframework.com/ | |
Awesome OSINT | https://github.com/jivoi/awesome-osint | |

# AI Tools
> Never upload case material, suspect images or personal data to public AI services unless your agency has approved the service for that purpose.
## Synthetic Media Detection
Hive AI-Generated Content Detection | https://hivemoderation.com/ai-generated-content-detection | |
Illuminarty | https://illuminarty.ai/ | |
AI or Not | https://www.aiornot.com/ | R |
Content Credentials Verify | https://verify.contentauthenticity.org/ | |
## Transcription (run locally)
OpenAI Whisper | https://github.com/openai/whisper | T |
## Assistants
Claude | https://claude.ai/ | R |

# Malicious File Analysis
> Uploading a file to a public sandbox makes it available to other users, including the suspect. Search by hash first.
VirusTotal (hash / URL) | https://www.virustotal.com/gui/search/{q} | | hash,url,domain,ip
Hybrid Analysis | https://www.hybrid-analysis.com/search?query={q} | | hash
MalwareBazaar | https://bazaar.abuse.ch/browse.php?search={q} | | hash
URLhaus | https://urlhaus.abuse.ch/browse.php?search={q} | | url,domain
ANY.RUN | https://app.any.run/ | RP |
Triage | https://tria.ge/ | RP |
Joe Sandbox | https://www.joesandbox.com/ | RP |
Filescan.io | https://www.filescan.io/ | P |
urlscan.io | https://urlscan.io/search/#{q} | P | url,domain

# Exploits & Advisories
NVD | https://nvd.nist.gov/vuln/search/results?query={q} | | cve,kw
CVE Record | https://www.cve.org/CVERecord?id={q} | | cve
CISA Known Exploited Vulnerabilities | https://www.cisa.gov/known-exploited-vulnerabilities-catalog | |
EU Vulnerability Database (ENISA) | https://euvd.enisa.europa.eu/ | |
Exploit-DB | https://www.exploit-db.com/ | |
CERT-EU | https://cert.europa.eu/ | |
CCB Belgium | https://ccb.belgium.be/ | |

# Threat Intelligence
AlienVault OTX | https://otx.alienvault.com/browse/global/pulses?q={q} | R | ip,domain,hash,kw
ThreatFox | https://threatfox.abuse.ch/browse.php?search=ioc%3A{q} | | ip,domain,hash
Pulsedive | https://pulsedive.com/ | |
IBM X-Force Exchange | https://exchange.xforce.ibmcloud.com/ | R |
MITRE ATT&CK | https://attack.mitre.org/ | |
No More Ransom (Europol) | https://www.nomoreransom.org/ | |
Europol IOCTA | https://www.europol.europa.eu/publications-events/main-reports/iocta-report | |
MISP | https://www.misp-project.org/ | T |
OpenCTI | https://github.com/OpenCTI-Platform/opencti | T |

# OpSec
> Research from an attributable agency IP or a personal account can expose the investigation. Follow your agency's covert online policy.
## Check Your Exposure
BrowserLeaks | https://browserleaks.com/ | |
EFF Cover Your Tracks | https://coveryourtracks.eff.org/ | |
IPLeak | https://ipleak.net/ | |
DNS Leak Test | https://www.dnsleaktest.com/ | |
## Isolation
Firefox Multi-Account Containers | https://addons.mozilla.org/firefox/addon/multi-account-containers/ | T |
Tails | https://tails.net/ | T |
Whonix | https://www.whonix.org/ | T |
Kasm Workspaces | https://kasm.com/ | T |
## Research Personas
This Person Does Not Exist | https://thispersondoesnotexist.com/ | |
Fake Name Generator | https://www.fakenamegenerator.com/ | |
> Research personas must be authorised under your agency's policy and applicable law.

# Documentation / Evidence Capture
> Record for every capture: URL, date/time (UTC), what was seen, who captured it, the tool used, and a hash of the saved file. Toolbox > Case log does this in your browser.
## Toolbox (local, nothing leaves your browser)
Case Log & Hashing | #toolbox-caselog | |
File Hash Calculator | #toolbox-hash | |
## Page Capture
SingleFile | https://github.com/gildas-lormeau/SingleFile | T |
Bellingcat Auto Archiver | https://github.com/bellingcat/auto-archiver | TN | | Automatically archives posts, videos and images with hashes and timestamps
Forensic OSINT free tools | https://www.forensicosint.com/free-tools | RN | | Free IP, domain, timestamp, email-header and EXIF tools with PDF reports (free account)
FireShot | https://getfireshot.com/ | T |
ArchiveWeb.page (Webrecorder) | https://archiveweb.page/ | T |
## Video Capture
OBS Studio | https://obsproject.com/ | T |
## Public Archiving
Wayback Save Page Now | https://web.archive.org/save/{q} | P | url
archive.today | https://archive.ph/ | P |
> Public archiving leaves a trace the subject can find. Use only when that is acceptable.
## Trusted Timestamps
FreeTSA (RFC 3161) | https://www.freetsa.org/ | |
## Standards
Berkeley Protocol on Digital Open Source Investigations | https://www.ohchr.org/en/publications/policy-and-methodological-publications/berkeley-protocol-digital-open-source | |

# LE Request Portals [LE+]
> Open sources end where the platform's own records begin. Use these portals, with the right legal process, to request subscriber data, logs and preservation.
## Guidance
Europol SIRIUS (cross-border e-evidence) | https://www.europol.europa.eu/operations-services-and-innovation/sirius-project | L |
EU e-Evidence Regulation 2023/1543 | https://eur-lex.europa.eu/eli/reg/2023/1543/oj | |
SEARCH.org ISP List | https://www.search.org/resources/isp-list/ | |
## Platforms
Meta (Facebook, Instagram, WhatsApp) | https://www.facebook.com/records/login/ | L |
Google LERS | https://lers.google.com/ | L |
Apple | https://www.apple.com/legal/transparency/government-information.html | |
Microsoft LE Portal | https://leportal.microsoft.com/ | L |
X / Twitter | https://help.x.com/en/rules-and-policies/x-law-enforcement-support | |
TikTok | https://www.tiktok.com/safety/en/tools-and-guides/tiktok-law-enforcement-guidelines | |
Snap | https://values.snap.com/safety/safety-enforcement | |
Discord | https://discord.com/safety/360044157931-working-with-law-enforcement | |
Uber | https://lert.uber.com/ | L |
Airbnb (international LE) | https://www.airbnb.com/help/article/3814 | |
Cloudflare | https://www.cloudflare.com/trust-hub/abuse-approach/ | |
## Crypto Exchanges
Binance | https://www.binance.com/en/support/law-enforcement | L |
Tether (USDT) law enforcement requests | https://tether.to/en/legal/?tab=law-enforcement-requests | LN | | Freeze and information requests for USDT
Coinbase | https://help.coinbase.com/en/coinbase/other-topics/legal-policies/who-do-i-contact-for-a-subpoena-request-or-dispute-or-to-send-a-legal-document | |

# Exploitation & Trafficking Reporting [LE+]
> Reporting and referral channels only. Never download or keep abuse material outside an approved system.
NCMEC CyberTipline | https://report.cybertip.org/ | |
INHOPE Hotlines | https://www.inhope.org/EN | |
IWF Report | https://report.iwf.org.uk/ | |
Europol Stop Child Abuse – Trace an Object | https://www.europol.europa.eu/stopchildabuse | |
Interpol ICSE Database | https://www.interpol.int/Crimes/Crimes-against-children/International-Child-Sexual-Exploitation-database | L |
Polaris Project (trafficking) | https://polarisproject.org/ | |
CTDC (trafficking data) | https://www.ctdatacollaborative.org/ | |

# Firearms, Wildlife & Cultural Property [LE+]
## Firearms
Conflict Armament Research iTrace | https://itrace.conflictarm.com/ | |
Small Arms Survey | https://www.smallarmssurvey.org/ | |
Armament Research Services | https://armamentresearch.com/ | |
Interpol iARMS | https://www.interpol.int/en/Crimes/Firearms-trafficking/Illicit-Arms-Records-and-tracing-Management-System-iARMS | L |
## Wildlife
CITES Trade Database | https://trade.cites.org/ | |
Species+ | https://speciesplus.net/ | |
TRAFFIC | https://www.traffic.org/ | |
CITES Wildlife TradeView | https://tradeview.cites.org/ | |
## Cultural Property
Interpol Stolen Works of Art / ID-Art | https://www.interpol.int/Crimes/Cultural-heritage-crime/Stolen-Works-of-Art-Database | R |
ICOM Red Lists | https://icom.museum/en/resources/red-lists/ | |

# International Cooperation [LE+]
Interpol | https://www.interpol.int/ | |
Europol | https://www.europol.europa.eu/ | |
Eurojust | https://www.eurojust.europa.eu/ | |
World Customs Organization | https://www.wcoomd.org/ | |
UNODC | https://www.unodc.org/ | |
UNODC SHERLOC (legislation & cases) | https://sherloc.unodc.org/ | |
UNODC Practical Guide: electronic evidence across borders | https://sherloc.unodc.org/cld/en/publications/practical-guide/practical-guide.html | N | | How to request data from providers in other countries
UNODC Electronic Evidence Hub | https://www.unodc.org/cld/en/st/evidence/electronic-evidence-hub.html | N | | Provider contacts and procedures for e-evidence
Frontex | https://www.frontex.europa.eu/ | |
CEPOL | https://www.cepol.europa.eu/ | |

# Legal & Ethics [LE+]
Berkeley Protocol | https://www.ohchr.org/en/publications/policy-and-methodological-publications/berkeley-protocol-digital-open-source | |
EU Law Enforcement Directive 2016/680 | https://eur-lex.europa.eu/eli/dir/2016/680/oj | |
EU AI Act | https://eur-lex.europa.eu/eli/reg/2024/1689/oj | |
Budapest Convention on Cybercrime | https://www.coe.int/en/web/cybercrime/the-budapest-convention | |
ECHR Guide on Article 8 (privacy) | https://ks.echr.coe.int/web/echr-ks/article-8 | |

# Training
Bellingcat Guides | https://www.bellingcat.com/category/resources/how-tos/ | |
OSINT Curious | https://www.osintcurio.us/ | |
Trace Labs (missing persons CTF) | https://www.tracelabs.org/ | |
OSINT Dojo | https://www.osintdojo.com/ | |
Sector035 Week in OSINT | https://sector035.nl/ | |
Verification Handbook | https://datajournalism.com/read/handbook/verification-3 | |
CEPOL LEEd | https://leed.cepol.europa.eu/ | L |
UNODC Global eLearning | https://www.unodc.org/elearning/ | R |
WCO CLiKC! | https://clikc.wcoomd.org/ | L |

# Gaming Platforms
> Game platforms and their chats are used for grooming, recruitment, money laundering (in-game items) and coordination. Profiles often reuse the same handle.
Steam profile | https://steamcommunity.com/id/{q} | | user
Twitch | https://www.twitch.tv/{q} | | user
Roblox user search | https://www.roblox.com/search/users?keyword={q} | | user
PSNProfiles (PlayStation) | https://psnprofiles.com/{q} | | user
Chess.com | https://www.chess.com/member/{q} | | user
Kick | https://kick.com/{q} | | user
Discord (see Instant Messaging) | https://discord.com/ | |

# Telecom & SIM [LE+]
> Subscriber data and cell-site data come from the operator via legal process. Open sources help you identify the operator first.
## Numbers & Operators
ITU National Numbering Plans | https://www.itu.int/oth/T0202.aspx?parent=T0202 | |
MCC-MNC operator codes | https://www.mcc-mnc.com/ | |
Toolbox Phone Analyser (local) | #toolbox-phone | |
tellows (caller reports) | https://www.tellows.com/ | |
BIPT (Belgian telecom regulator) | https://www.bipt.be/ | |
## Devices
IMEI.info | https://www.imei.info/ | |
> The Toolbox Phone Analyser also checks IMEI check digits.
## Cell Towers
CellMapper | https://www.cellmapper.net/map | |
OpenCelliD | https://opencellid.org/ | |

# Travel & Accommodation [LE+]
> Passenger data (PNR / API) is only available through your national PIU. Open sources help you identify routes, carriers and places seen in photos.
## Air
Flightradar24 (flight) | https://www.flightradar24.com/data/flights/{q} | | flight
FlightAware | https://www.flightaware.com/live/flight/{q} | | flight,reg
IATA airline & airport code search | https://www.iata.org/en/publications/directories/code-search/ | |
IATA Travel Centre (visa & entry rules) | https://www.iata.org/en/services/compliance/timatic/travel-documentation/ | |
Google Flights (routes) | https://www.google.com/travel/flights | |
## Road, Rail & Sea
FlixBus routes | https://www.flixbus.com/ | |
Direct Ferries (routes) | https://www.directferries.com/ | |
Rome2Rio (all routes between two places) | https://www.rome2rio.com/ | |
## Accommodation
Airbnb | https://www.airbnb.com/ | |
Booking.com | https://www.booking.com/ | |
TraffickCam (hotel-room image matching) | https://traffickcam.com/ | L |
> Match room details in suspect photos (curtains, lamps, carpets) against hotel listing photos.

# Cyber Fraud & Phishing [LE+]
## Check a Website or URL
ScamAdviser | https://www.scamadviser.com/check-website/{q} | | domain
Google Safe Browsing Status | https://transparencyreport.google.com/safe-browsing/search?url={q} | | domain,url
URLhaus | https://urlhaus.abuse.ch/browse.php?search={q} | | url,domain
PhishTank | https://phishtank.org/ | |
OpenPhish | https://openphish.com/ | |
CheckPhish | https://checkphish.bolster.ai/ | |
dnstwist (look-alike domains) | https://dnstwist.it/ | |
## Payment & Investment Fraud
IOSCO I-SCAN | https://www.iosco.org/i-scan/ | |
FSMA Belgium Warnings | https://www.fsma.be/en/warnings | |
UK FCA Warning List | https://www.fca.org.uk/consumers/warning-list-unauthorised-firms | |
Chainabuse (crypto scams) | https://www.chainabuse.com/address/{q} | | crypto
## Reporting Centres
Europol EC3 | https://www.europol.europa.eu/about-europol/european-cybercrime-centre-ec3 | |
Safeonweb (Belgium) | https://safeonweb.be/ | |
Action Fraud (UK) | https://www.actionfraud.police.uk/ | |
FBI IC3 (US) | https://www.ic3.gov/ | |
APWG | https://apwg.org/ | |

# Albania [Country]
Companies: QKB business register | https://qkb.gov.al/en/business-register/ | | | National Business Centre: companies, owners, administrators
# Belgium [Country]
Companies: KBO / BCE | https://kbopub.economie.fgov.be/kbopub/zoeknaamfonetischform.html | | | Crossroads Bank for Enterprises: company number, address, directors, activities
Gazette: Belgisch Staatsblad / Moniteur belge | https://www.ejustice.just.fgov.be/ | | | Official journal: company publications, appointments, legislation
Courts: Juportal case law | https://juportal.be/ | | | Published Belgian court decisions
Wanted: Federal Police wanted persons | https://www.police.be/wanted/en/wanted/wanted-persons | |
Warnings: FSMA investment-fraud warnings | https://www.fsma.be/en/warnings | | | Fraudulent investment firms and websites
Marketplace: 2dehands / 2ememain | https://www.2dehands.be/q/{q}/ | | kw
# Brazil [Country]
Companies: Receita Federal CNPJ | https://solucoes.receita.fazenda.gov.br/servicos/cnpjreva/cnpjreva_solicitacao.asp | | | Company registration by CNPJ number
Courts: JusBrasil | https://www.jusbrasil.com.br/ | | | Court cases and legal news
# China [Country]
Companies: National Enterprise Credit Information (GSXT) | https://www.gsxt.gov.cn/ | | | Official company register (Chinese)
Search: Baidu | https://www.baidu.com/s?wd={q} | | kw,name,org | Main Chinese search engine
Social: Weibo | https://weibo.com/ | R |
# Colombia [Country]
Companies: RUES company register | https://www.rues.org.co/ | | | Single business and social register
# Ecuador [Country]
Companies: Superintendencia de Compañías | https://www.supercias.gob.ec/ | | | Companies, shareholders and directors
# France [Country]
Companies: Annuaire des Entreprises | https://annuaire-entreprises.data.gouv.fr/rechercher?terme={q} | | org,name | Official company directory (free)
Companies: Pappers | https://www.pappers.fr/recherche?q={q} | | org,name | Companies, directors, accounts
Gazette: BODACC | https://www.bodacc.fr/ | | | Official notices: sales, insolvencies, changes
People: PagesBlanches | https://www.pagesjaunes.fr/pagesblanches | | | Phone directory
Marketplace: Leboncoin | https://www.leboncoin.fr/recherche?text={q} | | kw
# Germany [Country]
Companies: Handelsregister | https://www.handelsregister.de/ | | | Official commercial register
Companies: North Data | https://www.northdata.com/ | | | Company network, directors and filings (free basic use; also other EU countries)
Insolvency: Insolvenzbekanntmachungen | https://neu.insolvenzbekanntmachungen.de/ | | | Official insolvency notices
Wanted: BKA Fahndungen | https://www.bka.de/ | | | Federal Criminal Police: open Fahndungen (wanted persons) from the home page
People: Das Telefonbuch | https://www.dastelefonbuch.de/ | | | Phone directory
Marketplace: Kleinanzeigen | https://www.kleinanzeigen.de/s-{q}/k0 | | kw
# Ireland [Country]
Companies: CRO company search (CORE) | https://cro.ie/post-registration/company-search/ | | | Companies Registration Office
Marketplace: DoneDeal | https://www.donedeal.ie/ | |
# Italy [Country]
Companies: Registro Imprese | https://www.registroimprese.it/ | | | Chambers of commerce company register (basic search free)
Marketplace: Subito | https://www.subito.it/ | |
# Luxembourg [Country]
Companies: Luxembourg Business Registers (RCS) | https://www.lbr.lu/ | | | Trade register, beneficial owners (RBE) and RESA publications
Gazette: Legilux | https://legilux.public.lu/ | | | Official journal of Luxembourg
# Morocco [Country]
Companies: Directinfo (OMPIC) | https://www.directinfo.ma/ | | | Company information from the trade register
Marketplace: Avito.ma | https://www.avito.ma/ | |
# Netherlands [Country]
Companies: KVK company search | https://www.kvk.nl/zoeken/?source=all&q={q} | | org | Chamber of Commerce register
Courts: Rechtspraak uitspraken | https://uitspraken.rechtspraak.nl/ | | | Published Dutch court decisions
Insolvency: Centraal Insolventieregister | https://insolventies.rechtspraak.nl/ | | | Bankruptcies and debt restructuring
Wanted: Politie gezocht | https://www.politie.nl/gezocht | |
Marketplace: Marktplaats | https://www.marktplaats.nl/q/{q}/ | | kw
# Nigeria [Country]
Companies: CAC public search | https://icrp.cac.gov.ng/public-search/ | | | Corporate Affairs Commission register
Marketplace: Jiji | https://jiji.ng/ | |
# Poland [Country]
Companies: KRS court register | https://prs.ms.gov.pl/krs | | | National Court Register of companies
Marketplace: Allegro | https://allegro.pl/listing?string={q} | | kw
Marketplace: OLX Poland | https://www.olx.pl/ | |
# Portugal [Country]
Companies: Publicações de Atos Societários | https://publicacoes.mj.pt/ | | | Company acts and publications
Marketplace: OLX Portugal | https://www.olx.pt/ | |
# Romania [Country]
Companies: ONRC trade register | https://www.onrc.ro/index.php/en/ | | | National Trade Register Office
Marketplace: OLX Romania | https://www.olx.ro/ | |
# Russia [Country]
Companies: Rusprofile | https://www.rusprofile.ru/search?query={q} | | org,name | Company register data, directors, founders
Social: VK | https://vk.com/ | R |
# Spain [Country]
Gazette: BORME (company gazette) | https://www.boe.es/diario_borme/ | | | Official companies gazette
Marketplace: Wallapop | https://es.wallapop.com/app/search?keywords={q} | | kw
# Türkiye [Country]
Gazette: Ticaret Sicil Gazetesi | https://www.ticaretsicil.gov.tr/ | | | Trade registry gazette
Marketplace: sahibinden | https://www.sahibinden.com/ | |
# United Arab Emirates [Country]
Marketplace: Dubizzle | https://dubai.dubizzle.com/ | |
# United Kingdom [Country]
Companies: Companies House | https://find-and-update.company-information.service.gov.uk/search?q={q} | | org,name
Companies: Companies House officers | https://find-and-update.company-information.service.gov.uk/search/officers?q={q} | | name | Directors and their appointments
Gazette: The Gazette | https://www.thegazette.co.uk/all-notices/notice?text={q} | | name,org | Official notices: insolvency, probate, companies
Courts: BAILII | https://www.bailii.org/ | | | British and Irish case law
Wanted: NCA Most Wanted | https://www.nationalcrimeagency.gov.uk/most-wanted | |
# United States [Country]
People: TruePeopleSearch | https://www.truepeoplesearch.com/ | P | | People search (addresses, phones, relatives)
Courts: CourtListener | https://www.courtlistener.com/?q={q} | | name,org | Federal and state court opinions and dockets
Prisons: Federal Inmate Locator | https://www.bop.gov/inmateloc/ | |
Wanted: FBI Most Wanted | https://www.fbi.gov/wanted | |
`;
