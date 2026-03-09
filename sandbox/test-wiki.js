const limit = 2;
const encoded = encodeURIComponent('heart anatomy medical');
const url = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrnamespace=6&gsrsearch=${encoded}&gsrlimit=${limit}&prop=imageinfo&iiprop=url|descriptionurl|extmetadata&iiurlwidth=400&format=json&origin=*`;

fetch(url)
  .then(res => res.json())
  .then(data => {
    const pages = data?.query?.pages ?? {};
    const images = Object.values(pages).map(p => {
      const ii = p.imageinfo?.[0];
      return {
        url: ii.url,
        thumbUrl: ii.thumburl ?? ii.url
      };
    });
    console.log(JSON.stringify(images, null, 2));
  });
