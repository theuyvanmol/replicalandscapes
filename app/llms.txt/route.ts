import {COLLECTIONS} from '@/lib/collections';
/* A plain-language summary of the site for AI assistants (llms.txt convention). */
export const revalidate=86400;
export function GET(){const b=(process.env.NEXT_PUBLIC_SITE_URL||'').replace(/\/$/,'');
 const t=`# Replica Landscapes

> UK supplier of lifelike artificial trees, plants, topiary, flowers, hedging and living walls, with a bespoke design and installation service for homes, offices, hotels, restaurants and events. Formerly The Artificial Plants Shop (artificialplants.co.uk) and Replica Plants (replicaplants.co.uk); trading for over 15 years from Northumberland.

- Company: Office & Reception Planters Ltd, Ash Tree Farm, Heddon-on-the-Wall, Newcastle upon Tyne NE15 0HE, United Kingdom
- Phone: 01661 871 481 · Email: sales@replicaplants.co.uk
- Delivery: UK mainland £7.95, free over £100; usually 3–5 working days, tracked. Worldwide shipping on request.
- Returns: 14 days to change your mind (see terms).
- Outdoor use: products marked UV-protected are suitable outdoors. Fire-retardant products are available for commercial spaces.

## Shop by collection
${COLLECTIONS.map(c=>`- [${c.title}](${b}/collections/${c.slug}): ${c.description}`).join('\n')}

## Services
- [Bespoke design & installation](${b}/installation-service): planting schemes, green walls and installation for commercial and residential spaces
- [Bespoke & commercial](${b}/bespoke-commercial): projects for offices, hospitality and retail
- [Gallery](${b}/gallery): photos of completed installations
- [Room Studio](${b}/studio): place products in a photo of your own room

## Help
- [Delivery & returns](${b}/delivery-returns)
- [Contact](${b}/contact)
- [Terms & conditions](${b}/terms-conditions) · [Privacy policy](${b}/privacy-policy)
- [Blog](${b}/blog): guides to choosing, styling and caring for artificial plants
`;
 return new Response(t,{headers:{'content-type':'text/plain; charset=utf-8','cache-control':'public, max-age=3600'}});}
