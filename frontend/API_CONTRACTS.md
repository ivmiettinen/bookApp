# Frontendin API-sopimukset

Tarkistettu 13.11.2026 paikallisesta backend-lähdekoodista. Julkaistua
backend-versiota tai sen tietokannan sisältöä ei ole todennettu verkkokutsuilla.

## Reitit ja onnistumisvastaukset

| Toiminto | Express (`backend/controllers`) | Netlify (`backend/netlify/functions`) | Vastaus |
| --- | --- | --- | --- |
| Kirjalista | GET `/api/books` | GET `/.netlify/functions/books` | 200, `Book[]`; `user` poistettu projektiolla `-user` |
| Kirjan lisäys | POST `/api/books` | POST `/.netlify/functions/books` | 200, tallennettu `Book`; `user` on ID-viittaus |
| Tykkäys | PUT `/api/books/:id` | PUT `/.netlify/functions/books/:id` | 200, `Book`; kumpikin ohittaa pyynnön rungon |
| Poisto | DELETE `/api/books/:id` | DELETE `/.netlify/functions/books/:id` | 204, ei runkoa; palvelu palauttaa `void` |
| Kirjautuminen | POST `/api/login` | POST `/.netlify/functions/login` | 200, `{ token, username, email }` |
| Rekisteröinti | POST `/api/users` | POST `/.netlify/functions/users` | 201, `{ token, username, email }` |

Backendin molemmissa toteutuksissa on lisäksi GET kirjan ID:llä. Frontendin
nykyiset palvelut eivät käytä sitä. Netlifyn `app.js` tarjoaa erillisen
health-reitin; sen kommentoidut API-rekisteröinnit eivät ole kirjarajapinta.

## Mallit ja rajatarkistukset

`src/types/api.ts` erottaa syötteet ja vastaustyypit. `AuthUser` on auth-vastauksen
käyttäjäosa (username ja email), ei Mongoose-käyttäjädokumentti. Auth-vastaus ei
sisällä käyttäjän ID:tä eikä salasanaa. `LoginInput` sisältää username/password;
`SignUpInput` lisää emailin. Istuntovastauksesta poimitaan vain sallitut kentät.

Expressin `models/book.js` ja Netlifyn `books.js`:n sisäinen malli määrittelevät
samannimiset kentät. Vaikka skeemassa lukee `id: Number`, JSON-muunnos korvaa sen
aina `_id.toString()`-arvolla. Frontendin ID-tyyppi on siksi `string`.

- `title`, `author`, `url`: pakolliset merkkijonot.
- `likes`: numero, mutta skeemassa ei `required`- eikä oletusarvoa. Voi puuttua
  tai olla null. POST asettaa puuttuvan syötteen nollaksi molemmissa reiteissä.
  Frontend tarkistaa annetun luvun äärellisyyden, ei oleta ei-negatiivisuutta.
- `user`: valinnainen ObjectId-viittaus, JSONissa merkkijono tai null. Listalta
  puuttuu aina. POST/PUT voi palauttaa sen. Skeema ei vaadi omistajaa.
- `likesbyId`: User-ObjectId-viittausten taulukko, JSONissa merkkijonoja.
  Mongoose antaa normaalisti tyhjän taulukon; sallitaan myös puuttuminen/null,
  koska skeema ei vaadi kenttää eikä estä nullia.
- Yksikään käytetty reitti ei kutsu `populate`a. `user`- tai `likesbyId`-kentän
  käyttäjäobjekti hylätään virheellisenä vastauksena; populated-unionia ei oleteta.

`CreateBookInput` sisältää title/author/url ja valinnaisen likes-luvun.
`UpdateBookInput` kuvaa nykyisen asiakkaan lähettämän likes-luvun; se ei lupaa
palvelimen tallentavan arvoa. Nykyiset PUT-reitit käyttävät kirjan URL-ID:tä
myös tykkääjän ID:nä ja kutsuvat `book.save()` ilman odotusta. Näiden sekä
asiakkaan tykkäystilan korjaus kuuluu myöhempään vaiheeseen, ei tähän muutokseen.

Vastaukset vastaanotetaan `unknown`-arvoina. Listan jokainen jäsen, yksittäinen
kirja ja auth-istunnon kentät tarkistetaan ennen palautusta. Valinnaisia kenttiä
ei täytetä oletuksilla eikä tietokannan URL-arvoille aseteta uutta URL-politiikkaa.

## Osoitteet ja virheet

`apiConfig.ts` valitsee kehitystilassa vain `_DEV`/`_dev`-avaimet, muulloin
tuotantoavaimet. Kunkin palvelun `VITE_*` on ensisijainen ja vastaava
`REACT_APP_*` säilyy varalla (`src/vite-env.d.ts`). Tarkistus tehdään kutsuttaessa,
jotta yhden palvelun puuttuva asetus ei estä muiden moduulien lataamista.
Sallitaan absoluuttinen HTTP(S)-osoite tai saman originin `/api/...`-polku.
Tyhjä, virheellinen, tunnuksia, queryä tai fragmenttia sisältävä osoite hylätään
ennen HTTP-kutsua. Virheilmoitus ei sisällä asetuksen arvoa.

`ApiError.kind` erottaa `configuration`, `invalid-response`, `http`, `network`
ja `unexpected`. Axios-virheet kavennetaan `axios.isAxiosError`-tarkistuksella.
HTTP-virheessä säilytetään `response.status` ja `response.data: unknown`, jotta
nykyiset auth-thunkit voivat tunnistaa nykyiset virheet. Sisäisiä Axios-virheitä,
request-konfiguraatiota tai tunnuksia ei liitetä uuteen virheeseen.

Express rekisteröi `express-async-errors`-tuen ja yhteisen errorHandlerin, joka
palauttaa muun muassa validointi- ja token-virheitä JSONina. Erilliset Netlify
books/login/users-appit eivät rekisteröi samaa errorHandleria; booksin POST/PUT
myös kutsuu `next(exception)` ja yrittää lähettää 401-JSONin. Siksi virherungon
ei oleteta olevan JSON-objekti: myös teksti/HTML säilyy unknown-arvona.
Ilman HTTP-vastausta tuleva Axios-virhe luokitellaan verkkovirheeksi, jos sillä
on request; muut virheet ovat odottamattomia.

Palvelut palauttavat hallitun hylätyn promisen. Ilmoitusten näyttäminen ja
latauselinkaari kuuluvat niitä käsitteleviin myöhempiin vaiheisiin. Tykkäyspainikkeen
nykyisen catch-haaran HTTP-statusluenta suojattiin, jotta verkkovirhe tai
rajatarkistusvirhe ei aiheuta uutta poikkeusta virheenkäsittelyssä.
