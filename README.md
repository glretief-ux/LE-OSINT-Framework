# LE OSINT Framework: Investigation Desk

**Live site:** https://glretief-ux.github.io/LE-OSINT-Framework/  ·  **Offline copy:** download [`dist/le-osint-framework.html`](dist/le-osint-framework.html) and open it in any browser.

An open-source intelligence (OSINT) desk for **law enforcement investigators**. Sources are organised by *line of enquiry* (Person, Communications, Goods & transport, Money & companies, Digital infrastructure, Places & media, General research, Procedure & reporting) instead of one alphabetical tree.

- **690+ free resources** in 50 categories (reviewed September 2026: 54 new or updated sources, dead or unreliable ones removed), including law-enforcement additions (marked **LE+**). **Paid services are deliberately excluded**: every link is free, or a free tier that works without payment (some need a free account, flag `R`).
- **Case playbooks**: step-by-step guides for 8 case types (drugs in a container, suspect's online footprint, online fraud, crypto laundering, missing / wanted person, firearms, human trafficking, vessel of interest), with every step linked to its sources and tools and a tick-list to track progress.
- **Suspect profile**: enter what you know about a suspect; get targeted searches per identifier, intelligence gaps, findings with pivots, and a report (also available on its own as `profiler.html`).
- **World ports directory**: 3,802 commercial seaports from the NGA World Port Index (April 2025) with UN/LOCODE codes, harbour size and type, plus 14,700 further UN/LOCODE port locations (release 2024-2). Search by country, port name or code; copy codes, open the port on a map or sea chart, export to CSV.
- **HS code finder**: all 6,939 chapters, headings and 6-digit subheadings of the Harmonized System (HS 2022). Search by code or words, browse chapter → heading → subheading, filter by enforcement interest (drug precursors, narcotics, arms, excise goods, frequent cover loads, high-value goods, medicines), and open each code in EU TARIC.
- **Country sources** for 24 countries: company registers, gazettes, courts, wanted lists and marketplaces.
- **One search bar**: type one selector (username, email, phone, domain, IP, MAC, container number, IMO/MMSI, crypto wallet, file hash, VIN, aircraft registration, CVE…). The type is detected automatically and every source that accepts it opens with the value already filled in (170+ search templates).
- **Flow chart** (landing page): a Mural-style, left-to-right board of sticky notes. Start at the hub on the left, click a coloured line of enquiry to open its categories, click a category to open its sources, and click a source card to open the site. Find, zoom, drag and fit controls are included, and cards that accept your current selector are outlined in green.
- **Spider-web map**: all sources drawn as a web around a central hub. Click a line of enquiry to spin out its categories, click a category to spin out its sources, and click a source to open it. Find, zoom, drag and fit controls are included, and sources that accept your current selector are highlighted.
- **Run sheet**: after you enter a selector, every matching search is listed as a checklist grouped by line of enquiry. Opening a search ticks it off, a progress bar shows what is left, **Log** adds the search to the case log with a UTC timestamp, and **Copy run sheet** puts the whole list (with ticks and URLs) on the clipboard for your report.
- **Browse mode**: with the search bar empty, the left rail lets you browse all sources by line of enquiry, with a filter across all of them.
- **Toolbox** that runs entirely in the browser (nothing is uploaded):
  - Case log with UTC timestamps and file hashing, export to CSV/JSON
  - File hash calculator (MD5, SHA-1, SHA-256)
  - EXIF / GPS metadata viewer
  - ISO 6346 container check digit, IMO / MMSI, VIN and IBAN validators
  - Crypto address identifier (BTC, ETH/EVM, TRON, LTC, XMR, XRP, DOGE, SOL)
  - Phone number analyser (country, mobile or fixed, all search formats) and IMEI check-digit validator
  - Coordinate converter (decimal / DMS) with links to 9 map and satellite services
  - Username and email permutation generator
  - Google dork builder (Google, Bing, DuckDuckGo, Yandex)
  - Timestamp converter with X/Twitter and Discord snowflake ID decoding
  - Base64 / URL / hex / ROT13 encoder and URL defang / refang
- **Flags** on every link: `T` local tool · `D` dork · `R` free login · `L` LE/government only · `F` free for verified law enforcement · `new` added in the latest review · `A` may alert the subject · `P` privacy/legal caution.
- **Weekly automatic link check** that opens a GitHub issue listing broken links (run it once by hand after uploading: Actions → Weekly link check → Run workflow).
- **Offline single-file version** (`dist/le-osint-framework.html`) for restricted or air-gapped machines.

## Law-enforcement additions (LE+)

| Category | What it adds |
|---|---|
| Maritime & Containers | AIS tracking, Equasis, IMO GISIS, ITU MARS, port-state control, carrier container tracking, BIC codes, bills of lading |
| Customs & Trade | HS / TARIC / EBTI, EORI, VIES, AEO, trade statistics, counterfeit / IP databases, CCP |
| Drug Intelligence | UNODC, EUDA, NPS early warning, INCB precursors, chemical lookup, pill identification, slang and emoji codes |
| Sanctions, PEPs & Watchlists | OpenSanctions, OFAC, EU, UN, UK lists, debarment, FATF |
| Wanted & Missing Persons | Interpol notices, EU Most Wanted, FBI, NCA, Belgian police |
| Financial Crime & Fraud | IBAN / BIC, investment-scam warning lists, Egmont, CARIN |
| LE Request Portals | Meta, Google, Apple, Microsoft, X, TikTok, Snap, Discord, Uber, Airbnb, Binance, Coinbase, Europol SIRIUS, EU e-Evidence |
| Exploitation & Trafficking Reporting | NCMEC, INHOPE, IWF, Europol Trace an Object, ICSE |
| Firearms, Wildlife & Cultural Property | iTrace, Small Arms Survey, iARMS, CITES, Interpol stolen works of art |
| International Cooperation | Interpol, Europol, Eurojust, WCO, UNODC, Frontex, CEPOL |
| Legal & Ethics | Berkeley Protocol, EU LED 2016/680, AI Act, Budapest Convention, ECHR Art. 8 |

## Publish it on GitHub Pages (web browser only, no Git needed)

1. On GitHub, click **New repository**. Name it e.g. `LE-OSINT-Framework`, choose **Public** (GitHub Pages is free for public repos), tick **Add a README**, and click **Create repository**.
2. Unzip `le-osint-framework.zip` on your computer.
3. In the repository, click **Add file → Upload files** and drag in **everything inside** the unzipped folder (`index.html`, `assets`, `data`, `dist`, `tools`, `README.md`, …). Click **Commit changes**.
4. The `.github` folder is hidden on some computers and iPads. If it did not upload, click **Add file → Create new file**, type the name `.github/workflows/link-check.yml`, paste the contents of that file, and commit.
5. Go to **Settings → Pages**. Under *Build and deployment* choose **Deploy from a branch**, branch **main**, folder **/ (root)**, and click **Save**.
6. After a minute the site is live at `https://<your-username>.github.io/LE-OSINT-Framework/`.
7. Optional: **Actions → Weekly link check → Run workflow** to run the first link check now.

## Adding or editing links

All links live in one file: **`data/links.js`**. Open it on GitHub, click the pencil icon, edit, and commit. The format is explained at the top of the file:

```
# Category name [LE+]
## Sub-category
> A guidance note shown under the sub-category
Site name | https://example.com/search?q={q} | R | name,org | What the site gives you (optional)
```

- `{q}` marks where the selector goes. List the selector types the URL accepts in the last column.
- Flags: `T D R L A P` (see above). Please do not add paid services.
- After editing, regenerate the offline file with `python tools/build_standalone.py` (or ask a colleague with Python to do it). The online site does not need this step.

## Operational security

- Use an approved, non-attributable research environment and research accounts only.
- The site sends your selector only to the site you click. There is no tracking, analytics or back-end.
- Search a file hash before uploading any file to a public sandbox.
- Do not paste case material into public translation or AI services unless your agency has approved them.
- Facial-recognition services (`P`) are restricted or prohibited in many jurisdictions. Get legal approval first.

## Disclaimer

Listed resources are third-party services and are not endorsed. Availability, terms and legality differ by country. Your legal authority decides what you may do, not the availability of a tool. Verify every finding with a second source.

## Credits

Category list originally inspired by [OSINT Framework](https://github.com/lockfale/OSINT-Framework) by Justin Nordine. EXIF reading uses [exifr](https://github.com/MikeKovarik/exifr) (MIT).

## License

MIT. See [LICENSE](LICENSE).
